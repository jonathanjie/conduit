import { Composer, InlineKeyboard } from 'grammy';
import { getChildrenForParent } from '../../db/queries/mappings.js';
import { relayParentToTeacher, relayTeacherToParent, resolveParentFromReply, detectMessageType } from '../../modules/relay/index.js';
import { getActiveStudent, setActiveStudent } from '../../modules/session/index.js';
import {
  handleStartCommand,
  handleAgree,
  handleMoreInfo,
  handleNotNow,
} from '../../modules/onboarding/index.js';
import { adminComposer } from '../../modules/admin/index.js';
import { logger } from '../../lib/logger.js';
import type { ConduitContext } from '../context.js';
import type { MessageType } from '../../types/index.js';

const SUPPORTED_MESSAGE_TYPES: ReadonlySet<MessageType> = new Set([
  'text',
  'photo',
  'video',
  'voice',
  'document',
  'sticker',
  'animation',
]);

export const router = new Composer<ConduitContext>();

// ── Admin/superadmin command composer ─────────────────────────────────────────
// Must be registered before the catch-all 'message' handler so that admin
// commands are intercepted at the Composer level rather than reaching the
// role-based text fallback below.
router.use(adminComposer);

// ── /start command — onboarding deep-link entry point ────────────────────────

router.command('start', async (ctx) => {
  await handleStartCommand(ctx);
});

// ── Callback query handlers (onboarding consent flow) ────────────────────────

router.callbackQuery('onboard_agree', async (ctx) => {
  await handleAgree(ctx);
});

router.callbackQuery('onboard_more_info', async (ctx) => {
  await handleMoreInfo(ctx);
});

router.callbackQuery('onboard_not_now', async (ctx) => {
  await handleNotNow(ctx);
});

// ── Callback query handler (child selection inline keyboard) ──────────────────

router.callbackQuery(/^select_child:(\d+):(.+)$/, async (ctx) => {
  const [, studentIdStr, studentName] = ctx.match;
  const studentId = parseInt(studentIdStr, 10);
  const userId = ctx.from.id;

  await ctx.answerCallbackQuery();

  if (!ctx.dbUser) {
    await ctx.reply('You are not registered in the Conduit system.');
    return;
  }

  await setActiveStudent(userId, studentId, studentName);

  await ctx.reply(
    `Selected: ${studentName}. Your next message will be forwarded to their teacher.`,
  );
});

// ── Main message handler ──────────────────────────────────────────────────────

router.on('message', async (ctx) => {
  // 1. Skip if no from (channel posts, etc.)
  if (!ctx.from) return;

  // 2. Not registered
  if (!ctx.dbUser) {
    await ctx.reply(
      'You are not registered in the Conduit system. Please contact your administrator.',
    );
    return;
  }

  // 3. Inactive account
  if (!ctx.dbUser.isActive) {
    await ctx.reply('Your account is inactive. Please contact your administrator.');
    return;
  }

  const { role } = ctx.dbUser;

  // 4. Admin/superadmin non-command messages are silently dropped here.
  //    All admin commands are handled by adminComposer registered above.
  if (role === 'admin' || role === 'superadmin') {
    return;
  }

  // 5. Parent relay flow
  if (role === 'parent') {
    await handleParentMessage(ctx);
    return;
  }

  // 6. Teacher relay flow
  if (role === 'teacher') {
    await handleTeacherMessage(ctx);
    return;
  }
});

// ── Parent message handler ────────────────────────────────────────────────────

async function handleParentMessage(ctx: ConduitContext): Promise<void> {
  const dbUser = ctx.dbUser!;

  // Validate message type first
  const msgType = detectMessageType(ctx);
  if (!SUPPORTED_MESSAGE_TYPES.has(msgType)) {
    await ctx.reply('This message type is not supported. Please send text, photos, videos, voice messages, documents, stickers, or animations.');
    return;
  }

  let children;
  try {
    children = await getChildrenForParent(dbUser.id);
  } catch (err) {
    logger.error({ err, parentUserId: dbUser.id }, 'Failed to fetch children for parent');
    await ctx.reply('An error occurred. Please try again later.');
    return;
  }

  if (children.length === 0) {
    await ctx.reply(
      'No children are mapped to your account. Please contact your administrator.',
    );
    return;
  }

  if (children.length === 1) {
    // Single child — relay immediately, no selection needed
    const child = children[0];
    try {
      await relayParentToTeacher(ctx, {
        teacherChatId: child.teacherChatId,
        studentName: child.studentName,
        studentId: child.studentId,
        parentUserId: dbUser.id,
        teacherUserId: child.teacherUserId,
      });
    } catch (err) {
      logger.error({ err, parentUserId: dbUser.id, studentId: child.studentId }, 'Relay parent→teacher failed');
      await ctx.reply('Failed to send your message. Please try again.');
    }
    return;
  }

  // Multiple children — check session
  const activeSession = await getActiveStudent(ctx.from!.id);
  if (activeSession) {
    // Find the matching child entry for the active session
    const activeChild = children.find((c) => c.studentId === activeSession.studentId);
    if (activeChild) {
      try {
        await relayParentToTeacher(ctx, {
          teacherChatId: activeChild.teacherChatId,
          studentName: activeChild.studentName,
          studentId: activeChild.studentId,
          parentUserId: dbUser.id,
          teacherUserId: activeChild.teacherUserId,
        });
      } catch (err) {
        logger.error({ err, parentUserId: dbUser.id, studentId: activeChild.studentId }, 'Relay parent→teacher failed');
        await ctx.reply('Failed to send your message. Please try again.');
      }
      return;
    }
  }

  // No session or session student not found among children — show picker
  const keyboard = new InlineKeyboard();
  for (const child of children) {
    keyboard.text(child.studentName, `select_child:${child.studentId}:${child.studentName}`).row();
  }

  await ctx.reply('Which child are you messaging about?', {
    reply_markup: keyboard,
  });
}

// ── Teacher message handler ───────────────────────────────────────────────────

async function handleTeacherMessage(ctx: ConduitContext): Promise<void> {
  const dbUser = ctx.dbUser!;
  const msg = ctx.message;

  // Guard: message and chat must exist (we're called from 'message' handler so they should)
  if (!msg || !ctx.chat) return;

  // Validate message type first
  const msgType = detectMessageType(ctx);
  if (!SUPPORTED_MESSAGE_TYPES.has(msgType)) {
    await ctx.reply('This message type is not supported.');
    return;
  }

  // Teacher must reply to a message to route back to the parent
  if (!msg.reply_to_message) {
    await ctx.reply(
      'Please reply to a parent\'s message to respond. Direct messages are not routed.',
    );
    return;
  }

  const teacherChatId = String(ctx.chat.id);
  const replyToId = msg.reply_to_message.message_id;

  let relayContext;
  try {
    relayContext = await resolveParentFromReply(teacherChatId, replyToId);
  } catch (err) {
    logger.error({ err, teacherUserId: dbUser.id, replyToId }, 'Failed to resolve relay context');
    await ctx.reply('An error occurred. Please try again.');
    return;
  }

  if (!relayContext) {
    await ctx.reply(
      'Could not find the parent context for this reply. The conversation may have expired. Please ask the parent to send a new message.',
    );
    return;
  }

  try {
    await relayTeacherToParent(ctx, {
      parentChatId: relayContext.parentChatId,
      studentId: relayContext.studentId,
      teacherUserId: dbUser.id,
      parentUserId: relayContext.parentUserId,
    });
  } catch (err) {
    logger.error(
      { err, teacherUserId: dbUser.id, parentChatId: relayContext.parentChatId },
      'Relay teacher→parent failed',
    );
    await ctx.reply('Failed to send your message to the parent. Please try again.');
  }
}
