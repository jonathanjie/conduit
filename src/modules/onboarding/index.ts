import { InlineKeyboard } from 'grammy';
import { redis } from '../../lib/redis.js';
import { logger } from '../../lib/logger.js';
import { findUserByTelegramId, createUser, deactivateUser } from '../../db/queries/users.js';
import { query } from '../../db/client.js';
import { validateToken, claimToken } from '../token/index.js';
import { getChildrenForParent } from '../../db/queries/mappings.js';
import type { ConduitContext } from '../../bot/context.js';

// ─── Redis state ──────────────────────────────────────────────────────────────

const ONBOARDING_STATE_TTL = 30 * 60; // 30 minutes

interface OnboardingState {
  tokenId: number;
  role: 'parent' | 'teacher';
  studentId: number | null;
  teacherUserId: number | null;
}

function stateKey(telegramUserId: number): string {
  return `conduit:onboarding:${telegramUserId}`;
}

async function saveState(telegramUserId: number, state: OnboardingState): Promise<void> {
  await redis.set(stateKey(telegramUserId), JSON.stringify(state), 'EX', ONBOARDING_STATE_TTL);
}

async function loadState(telegramUserId: number): Promise<OnboardingState | null> {
  const raw = await redis.get(stateKey(telegramUserId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as OnboardingState;
  } catch {
    return null;
  }
}

async function clearState(telegramUserId: number): Promise<void> {
  await redis.del(stateKey(telegramUserId));
}

// ─── Inline keyboard builders ─────────────────────────────────────────────────

function consentKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text("I Agree — Let's Go", 'onboard_agree')
    .row()
    .text('I Need More Info', 'onboard_more_info');
}

function consentAfterInfoKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text('I Agree', 'onboard_agree')
    .row()
    .text('Not Now', 'onboard_not_now');
}

// ─── Message templates ────────────────────────────────────────────────────────

const PDPA_SHORT = `Before we begin, we need your consent to process your personal data.

Math Mavens uses this bot to route messages between parents and teachers. We collect your Telegram ID and name to make this work.

Your data is encrypted, never sold, and used only for tuition communication.

Do you agree to our data use policy?`;

const PDPA_DETAILED = `Here's exactly what we collect and why:

*What we collect:*
• Your Telegram user ID and name (to identify you)
• Timestamps of messages relayed (for dispute resolution)

*What we do NOT collect:*
• Your phone number
• Message content (it passes through but is never stored)

*Your rights:*
• Request deletion of your data at any time by contacting the centre
• Data is retained for 3 years per Singapore MOM requirements, then deleted

*Legal basis:* Legitimate interest for tuition communication services, in accordance with Singapore's Personal Data Protection Act (PDPA).

Do you agree?`;

function buildParentWelcome(firstName: string, children: Array<{ studentName: string; studentGrade: string | null; teacherDisplayName: string }>): string {
  const childLines = children
    .map((c) => {
      const grade = c.studentGrade ? ` — ${c.studentGrade}` : '';
      return `• ${c.studentName}${grade} (${c.teacherDisplayName}'s class)`;
    })
    .join('\n');

  const multiChildHint =
    children.length >= 2
      ? '\nIf you have more than one child, we\'ll ask which one you\'re writing about.\n'
      : '';

  return `You're all set, ${firstName}!

Children enrolled:
${childLines}

To message a tutor, just type here anytime.${multiChildHint}
Need help? Type /help`;
}

function buildTeacherWelcome(displayName: string): string {
  // Extract a short salutation (e.g. "Ms Lim" from "Ms Lim" or just first name)
  const salutation = displayName.trim();
  return `You're all set, ${salutation}!

When a parent messages you, you'll receive it here with the student's name shown above the message.

To reply: just use Telegram's reply function on the message. The bot handles the rest.

Need to message a parent first? Type /message

Questions or issues? Type /help`;
}

// ─── Database helpers ─────────────────────────────────────────────────────────

async function createParentStudentMapping(
  parentUserId: number,
  studentId: number,
  assignedBy: number | null,
): Promise<void> {
  await query(
    `INSERT INTO parent_student_mappings (parent_user_id, student_id, relationship, assigned_by)
     VALUES ($1, $2, 'parent', $3)
     ON CONFLICT (parent_user_id, student_id) DO UPDATE SET is_active = TRUE`,
    [parentUserId, studentId, assignedBy],
  );
}

// ─── Main handler exports ─────────────────────────────────────────────────────

/**
 * Handle /start [token] command.
 * Entry point for the onboarding deep-link flow.
 */
export async function handleStartCommand(ctx: ConduitContext): Promise<void> {
  const payload = ctx.match as string | undefined;
  const telegramUserId = ctx.from?.id;

  if (!telegramUserId) return;

  // No token payload — this is a plain /start, not an onboarding deep link
  if (!payload || payload.trim() === '') {
    if (ctx.dbUser) {
      await ctx.reply(
        "You're already set up! Just type a message to get started, or type /help for options.",
      );
    } else {
      await ctx.reply(
        "Welcome to Math Mavens! To get started, please use the invitation link sent by the tuition centre.",
      );
    }
    return;
  }

  const token = payload.trim();

  // Already registered — same user, nothing to do
  if (ctx.dbUser) {
    await ctx.reply(
      "You're already set up! Just type a message to get started, or type /help for options.",
    );
    return;
  }

  // Validate token
  let tokenRecord: Awaited<ReturnType<typeof validateToken>>;
  try {
    tokenRecord = await validateToken(token);
  } catch (err) {
    logger.error({ err }, 'Token validation error during onboarding');
    await ctx.reply('Something went wrong. Please try again or contact the tuition centre.');
    return;
  }

  if (!tokenRecord) {
    await ctx.reply(
      'This invitation link has expired or has already been used.\n\nPlease ask the tuition centre to send you a new one.',
    );
    return;
  }

  // Persist pending onboarding state in Redis
  const state: OnboardingState = {
    tokenId: tokenRecord.id,
    role: tokenRecord.role,
    studentId: tokenRecord.studentId,
    teacherUserId: tokenRecord.teacherUserId,
  };

  try {
    await saveState(telegramUserId, state);
  } catch (err) {
    logger.error({ err, telegramUserId }, 'Failed to save onboarding state');
    await ctx.reply('Something went wrong. Please try again.');
    return;
  }

  // Send PDPA consent prompt
  await ctx.reply(PDPA_SHORT, {
    parse_mode: 'Markdown',
    reply_markup: consentKeyboard(),
  });
}

/**
 * Handle "I Need More Info" callback — show full PDPA text with agree/not-now buttons.
 */
export async function handleMoreInfo(ctx: ConduitContext): Promise<void> {
  await ctx.answerCallbackQuery();

  const telegramUserId = ctx.from?.id;
  if (!telegramUserId) return;

  const state = await loadState(telegramUserId);
  if (!state) {
    await ctx.reply(
      'Your session has expired. Please use the invitation link again to restart onboarding.',
    );
    return;
  }

  await ctx.reply(PDPA_DETAILED, {
    parse_mode: 'Markdown',
    reply_markup: consentAfterInfoKeyboard(),
  });
}

/**
 * Handle "Not Now" callback — inform and exit without registering.
 */
export async function handleNotNow(ctx: ConduitContext): Promise<void> {
  await ctx.answerCallbackQuery();

  const telegramUserId = ctx.from?.id;
  if (telegramUserId) {
    await clearState(telegramUserId).catch(() => undefined);
  }

  await ctx.reply(
    "No worries. You can't use the bot until you agree. Tap /start again when ready.",
  );
}

/**
 * Handle "I Agree" callback — create user, apply mappings, mark token used, send welcome.
 */
export async function handleAgree(ctx: ConduitContext): Promise<void> {
  await ctx.answerCallbackQuery();

  const telegramUser = ctx.from;
  if (!telegramUser) return;

  const telegramUserId = telegramUser.id;

  // Load pending state
  const state = await loadState(telegramUserId);
  if (!state) {
    await ctx.reply(
      'Your session has expired. Please use the invitation link again to restart onboarding.',
    );
    return;
  }

  // Guard: check they haven't registered in a parallel session
  const existing = await findUserByTelegramId(String(telegramUserId)).catch(() => null);
  if (existing) {
    await clearState(telegramUserId).catch(() => undefined);
    await ctx.reply(
      "You're already set up! Just type a message to get started, or type /help for options.",
    );
    return;
  }

  // Derive display name from Telegram profile before any writes.
  const firstName = telegramUser.first_name ?? '';
  const lastName = telegramUser.last_name ?? '';
  const displayName = [firstName, lastName].filter(Boolean).join(' ') || 'User';
  const chatId = String(ctx.chat?.id ?? telegramUserId);

  // TOCTOU guard strategy:
  //   1. Create the user record first (unique constraint on telegram_user_id_hash ensures
  //      at most one user per Telegram account even under concurrent requests).
  //   2. Atomically claim the token (UPDATE ... WHERE used_at IS NULL, returns rowCount).
  //   3. If claim fails (another request already used this token), deactivate the
  //      just-created user so no orphan record remains.
  //
  // The token claim is the authoritative write — it is the single point of contention.

  let newUser;
  try {
    newUser = await createUser({
      telegramUserId: String(telegramUserId),
      chatId,
      role: state.role,
      displayName,
      pdpaConsentAt: new Date(),
    });
  } catch (err) {
    logger.error({ err, telegramUserId, role: state.role }, 'Failed to create user during onboarding');
    await ctx.reply('Something went wrong while setting up your account. Please try again.');
    return;
  }

  // Claim the token now that we have a real user id.
  // If claimToken returns false, another concurrent request already consumed it —
  // deactivate the just-created user and inform the caller.
  let claimed: boolean;
  try {
    claimed = await claimToken(state.tokenId, newUser.id);
  } catch (err) {
    logger.error({ err, tokenId: state.tokenId, newUserId: newUser.id }, 'claimToken threw during onboarding');
    // Treat as failure — deactivate the user so the DB stays consistent.
    claimed = false;
  }

  if (!claimed) {
    // Another request claimed this token first. Deactivate the new user so there is no
    // orphaned record, clear state, and tell the user the link was already used.
    try {
      await deactivateUser(newUser.id, newUser.id);
    } catch (deactivateErr) {
      logger.error({ deactivateErr, newUserId: newUser.id }, 'Failed to deactivate orphaned user after token race');
    }
    await clearState(telegramUserId).catch(() => undefined);
    await ctx.reply(
      'This invitation link has already been used. Please request a new one from the tuition centre.',
    );
    return;
  }

  // Apply role-specific mapping
  if (state.role === 'parent' && state.studentId !== null) {
    try {
      await createParentStudentMapping(newUser.id, state.studentId, null);
    } catch (err) {
      logger.error(
        { err, parentUserId: newUser.id, studentId: state.studentId },
        'Failed to create parent-student mapping during onboarding',
      );
      // Non-fatal: user is registered; admin can fix mapping manually
    }
  } else if (state.role === 'teacher' && state.teacherUserId !== null) {
    // Teacher onboarding: the token carries a placeholder teacher_user_id that the admin
    // set when generating the invite.  Re-point all that teacher's active student mappings
    // to the newly-created real user record.
    try {
      await query(
        `UPDATE teacher_student_mappings
         SET teacher_user_id = $1
         WHERE teacher_user_id = $2 AND is_active = TRUE`,
        [newUser.id, state.teacherUserId],
      );
    } catch (err) {
      logger.error(
        { err, newUserId: newUser.id, placeholderTeacherId: state.teacherUserId },
        'Failed to reassign teacher-student mappings during onboarding',
      );
      // Non-fatal
    }
  }

  // Clean up onboarding state
  await clearState(telegramUserId).catch(() => undefined);

  logger.info(
    { userId: newUser.id, role: state.role, telegramUserId },
    'Onboarding complete',
  );

  // Send role-appropriate welcome message
  if (state.role === 'parent') {
    let children: Awaited<ReturnType<typeof getChildrenForParent>> = [];
    try {
      children = await getChildrenForParent(newUser.id);
    } catch (err) {
      logger.error({ err, parentUserId: newUser.id }, 'Failed to fetch children for welcome message');
    }

    if (children.length === 0) {
      // Fallback: student may not be mapped yet; show a simpler welcome
      await ctx.reply(
        `You're all set, ${firstName}!\n\nYour child's tutor will be in touch soon.\n\nNeed help? Type /help`,
      );
    } else {
      await ctx.reply(buildParentWelcome(firstName, children));
    }
  } else {
    await ctx.reply(buildTeacherWelcome(displayName));
  }
}

