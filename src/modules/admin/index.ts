import { Composer } from 'grammy';
import { findUserById, deactivateUser, reactivateUser, updateUserRole } from '../../db/queries/users.js';
import { createStudent, findStudentById, listActiveStudents } from '../../db/queries/students.js';
import { createMapping, deactivateMapping, reassignTeacher, getAuditLog, getSystemStats, getBroadcastTargets, listUsersByRole } from '../../db/queries/admin.js';
import { getBroadcastQueueStats, enqueueBroadcast } from '../broadcast/index.js';
import { generateToken } from '../token/index.js';
import { logger } from '../../lib/logger.js';
import type { ConduitContext } from '../../bot/context.js';

const admin = new Composer<ConduitContext>();

// ── Role gate ─────────────────────────────────────────────────────────────────

admin.use(async (ctx, next) => {
  const role = ctx.dbUser?.role;
  if (role !== 'admin' && role !== 'superadmin') {
    // Silently ignore — router already handles unknown/unauthorized users
    return;
  }
  return next();
});

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Parse arguments from a command message, splitting on whitespace.
 * "/command arg1 arg2" → ["arg1", "arg2"]
 */
function parseArgs(text: string | undefined): string[] {
  if (!text) return [];
  const parts = text.trim().split(/\s+/);
  return parts.slice(1); // drop the command itself
}

function bold(text: string): string {
  return `*${escapeMarkdown(text)}*`;
}

function code(text: string): string {
  return `\`${text}\``;
}

/**
 * Escape MarkdownV2 special characters.
 */
function escapeMarkdown(text: string): string {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, '\\$&');
}

function isSuperadmin(ctx: ConduitContext): boolean {
  return ctx.dbUser?.role === 'superadmin';
}

// ── /help ─────────────────────────────────────────────────────────────────────

admin.command('help', async (ctx) => {
  const superadminSection = isSuperadmin(ctx)
    ? `\n\n*Superadmin commands:*\n` +
      `/deactivate <user\\_id> — Deactivate a user\n` +
      `/reactivate <user\\_id> — Reactivate a user\n` +
      `/promote <user\\_id> — Promote user to admin\n` +
      `/demote <user\\_id> — Demote admin to teacher/parent\n` +
      `/audit [count] — Show recent audit log entries\n` +
      `/system — System status and queue stats`
    : '';

  await ctx.reply(
    `*Admin commands:*\n\n` +
    `/add\\_student <name> [grade] — Create a student record\n` +
    `/map <student\\_id> <teacher\\_tg\\_id> <parent\\_tg\\_id> — Map teacher and parent to student\n` +
    `/unmap <student\\_id> — Remove all mappings for a student\n` +
    `/reassign <student\\_id> <new\\_teacher\\_tg\\_id> — Reassign student to a new teacher\n` +
    `/gentoken <role> <student\\_id> [teacher\\_id] — Generate onboarding token\n` +
    `/broadcast <scope> <message> — Broadcast message \\(scope: all or student\\_id\\)\n` +
    `/list\\_students — List active students with teacher/parent info\n` +
    `/list\\_teachers — List all active teachers\n` +
    `/list\\_parents — List all active parents` +
    superadminSection,
    { parse_mode: 'MarkdownV2' },
  );
});

// ── /add_student ──────────────────────────────────────────────────────────────

admin.command('add_student', async (ctx) => {
  const args = parseArgs(ctx.message?.text);
  if (args.length < 1) {
    await ctx.reply('Usage: /add\\_student <name> [grade]', { parse_mode: 'MarkdownV2' });
    return;
  }

  // Last arg is grade if it looks like a short word/number; rest is name
  // Convention: /add_student John Doe P3  → name="John Doe", grade="P3"
  //             /add_student Ali         → name="Ali", grade=undefined
  let name: string;
  let grade: string | undefined;

  if (args.length >= 2) {
    name = args.slice(0, -1).join(' ');
    grade = args[args.length - 1];
  } else {
    name = args[0];
    grade = undefined;
  }

  try {
    const { id } = await createStudent(name, grade);
    await ctx.reply(
      `Student created\\.\nID: ${code(String(id))}\nName: ${escapeMarkdown(name)}${grade ? `\nGrade: ${escapeMarkdown(grade)}` : ''}`,
      { parse_mode: 'MarkdownV2' },
    );
    logger.info({ adminUserId: ctx.dbUser!.id, studentId: id }, 'Admin created student');
  } catch (err) {
    logger.error({ err, adminUserId: ctx.dbUser!.id }, '/add_student failed');
    await ctx.reply('Failed to create student. Please try again.');
  }
});

// ── /map ──────────────────────────────────────────────────────────────────────

admin.command('map', async (ctx) => {
  const args = parseArgs(ctx.message?.text);
  if (args.length < 3) {
    await ctx.reply('Usage: /map <student\\_id> <teacher\\_telegram\\_id> <parent\\_telegram\\_id>', {
      parse_mode: 'MarkdownV2',
    });
    return;
  }

  const [studentIdStr, teacherTgIdStr, parentTgIdStr] = args;
  const studentId = parseInt(studentIdStr, 10);

  if (isNaN(studentId)) {
    await ctx.reply('Invalid student ID — must be a number.');
    return;
  }

  try {
    // Validate all three parties exist
    const [student, teacher, parent] = await Promise.all([
      findStudentById(studentId),
      findUserById(parseInt(teacherTgIdStr, 10)),  // These are internal user IDs from /list_teachers
      findUserById(parseInt(parentTgIdStr, 10)),
    ]);

    if (!student || !student.isActive) {
      await ctx.reply(`Student ${code(studentIdStr)} not found or inactive.`, { parse_mode: 'MarkdownV2' });
      return;
    }
    if (!teacher || !teacher.isActive) {
      await ctx.reply(`Teacher with ID ${code(teacherTgIdStr)} not found or inactive.`, { parse_mode: 'MarkdownV2' });
      return;
    }
    if (!parent || !parent.isActive) {
      await ctx.reply(`Parent with ID ${code(parentTgIdStr)} not found or inactive.`, { parse_mode: 'MarkdownV2' });
      return;
    }
    if (teacher.role !== 'teacher') {
      await ctx.reply(`User ${code(teacherTgIdStr)} is not a teacher \\(role: ${escapeMarkdown(teacher.role)}\\)\\.`, { parse_mode: 'MarkdownV2' });
      return;
    }
    if (parent.role !== 'parent') {
      await ctx.reply(`User ${code(parentTgIdStr)} is not a parent \\(role: ${escapeMarkdown(parent.role)}\\)\\.`, { parse_mode: 'MarkdownV2' });
      return;
    }

    await createMapping({
      studentId,
      teacherUserId: teacher.id,
      parentUserId: parent.id,
      assignedBy: ctx.dbUser!.id,
    });

    await ctx.reply(
      `Mapped successfully\\.\n` +
      `Student: ${bold(student.name)} \\(${code(String(studentId))}\\)\n` +
      `Teacher: ${bold(teacher.displayName)}\n` +
      `Parent: ${bold(parent.displayName)}`,
      { parse_mode: 'MarkdownV2' },
    );

    logger.info(
      { adminUserId: ctx.dbUser!.id, studentId, teacherUserId: teacher.id, parentUserId: parent.id },
      'Admin mapped student',
    );
  } catch (err) {
    logger.error({ err, adminUserId: ctx.dbUser!.id }, '/map failed');
    await ctx.reply('Mapping failed. Please verify all IDs and try again.');
  }
});

// ── /unmap ────────────────────────────────────────────────────────────────────

admin.command('unmap', async (ctx) => {
  const args = parseArgs(ctx.message?.text);
  if (args.length < 1) {
    await ctx.reply('Usage: /unmap <student\\_id>', { parse_mode: 'MarkdownV2' });
    return;
  }

  const studentId = parseInt(args[0], 10);
  if (isNaN(studentId)) {
    await ctx.reply('Invalid student ID — must be a number.');
    return;
  }

  try {
    const student = await findStudentById(studentId);
    if (!student) {
      await ctx.reply(`Student ${code(String(studentId))} not found.`, { parse_mode: 'MarkdownV2' });
      return;
    }

    await deactivateMapping(studentId);

    await ctx.reply(
      `All mappings removed for ${bold(student.name)} \\(${code(String(studentId))}\\)\\.`,
      { parse_mode: 'MarkdownV2' },
    );

    logger.info({ adminUserId: ctx.dbUser!.id, studentId }, 'Admin unmapped student');
  } catch (err) {
    logger.error({ err, adminUserId: ctx.dbUser!.id }, '/unmap failed');
    await ctx.reply('Failed to remove mappings. Please try again.');
  }
});

// ── /reassign ─────────────────────────────────────────────────────────────────

admin.command('reassign', async (ctx) => {
  const args = parseArgs(ctx.message?.text);
  if (args.length < 2) {
    await ctx.reply('Usage: /reassign <student\\_id> <new\\_teacher\\_id>', { parse_mode: 'MarkdownV2' });
    return;
  }

  const studentId = parseInt(args[0], 10);
  const newTeacherId = parseInt(args[1], 10);

  if (isNaN(studentId) || isNaN(newTeacherId)) {
    await ctx.reply('Invalid ID — both arguments must be numbers.');
    return;
  }

  try {
    const [student, newTeacher] = await Promise.all([
      findStudentById(studentId),
      findUserById(newTeacherId),
    ]);

    if (!student || !student.isActive) {
      await ctx.reply(`Student ${code(String(studentId))} not found or inactive.`, { parse_mode: 'MarkdownV2' });
      return;
    }
    if (!newTeacher || !newTeacher.isActive) {
      await ctx.reply(`Teacher ${code(String(newTeacherId))} not found or inactive.`, { parse_mode: 'MarkdownV2' });
      return;
    }
    if (newTeacher.role !== 'teacher') {
      await ctx.reply(
        `User ${code(String(newTeacherId))} is not a teacher \\(role: ${escapeMarkdown(newTeacher.role)}\\)\\.`,
        { parse_mode: 'MarkdownV2' },
      );
      return;
    }

    await reassignTeacher(studentId, newTeacher.id, ctx.dbUser!.id);

    await ctx.reply(
      `Reassigned ${bold(student.name)} to ${bold(newTeacher.displayName)}\\.`,
      { parse_mode: 'MarkdownV2' },
    );

    logger.info(
      { adminUserId: ctx.dbUser!.id, studentId, newTeacherId: newTeacher.id },
      'Admin reassigned student teacher',
    );
  } catch (err) {
    logger.error({ err, adminUserId: ctx.dbUser!.id }, '/reassign failed');
    await ctx.reply('Reassignment failed. Please verify the IDs and try again.');
  }
});

// ── /gentoken ─────────────────────────────────────────────────────────────────

admin.command('gentoken', async (ctx) => {
  const args = parseArgs(ctx.message?.text);
  if (args.length < 2) {
    await ctx.reply(
      'Usage: /gentoken <role> <student\\_id> [teacher\\_id]\n' +
      'Role must be `parent` or `teacher`\\.',
      { parse_mode: 'MarkdownV2' },
    );
    return;
  }

  const role = args[0];
  if (role !== 'parent' && role !== 'teacher') {
    await ctx.reply('Role must be `parent` or `teacher`\\.', { parse_mode: 'MarkdownV2' });
    return;
  }

  const studentId = parseInt(args[1], 10);
  if (isNaN(studentId)) {
    await ctx.reply('Invalid student ID — must be a number.');
    return;
  }

  const teacherIdArg = args[2] ? parseInt(args[2], 10) : undefined;
  if (role === 'parent' && !teacherIdArg) {
    // For parent tokens, teacher context is optional but recommended
  }

  try {
    const student = await findStudentById(studentId);
    if (!student || !student.isActive) {
      await ctx.reply(`Student ${code(String(studentId))} not found or inactive.`, { parse_mode: 'MarkdownV2' });
      return;
    }

    const expiresInHours = 72;

    const tokenResult = await generateToken({
      role,
      studentId,
      teacherUserId: teacherIdArg,
      createdBy: ctx.dbUser!.id,
      expiresInHours,
    });

    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

    await ctx.reply(
      `Token generated for ${bold(student.name)}\\.\n` +
      `Role: ${code(role)}\n` +
      `Expires: ${escapeMarkdown(expiresAt.toLocaleString())}\n\n` +
      `Onboarding link:\n${escapeMarkdown(tokenResult.deepLink)}`,
      { parse_mode: 'MarkdownV2' },
    );

    logger.info(
      { adminUserId: ctx.dbUser!.id, studentId, role },
      'Admin generated onboarding token',
    );
  } catch (err) {
    logger.error({ err, adminUserId: ctx.dbUser!.id }, '/gentoken failed');
    await ctx.reply('Token generation failed. Please try again.');
  }
});

// ── /broadcast ────────────────────────────────────────────────────────────────

admin.command('broadcast', async (ctx) => {
  const text = ctx.message?.text ?? '';
  // Format: /broadcast <scope> <message text...>
  const match = text.match(/^\/broadcast\s+(\S+)\s+([\s\S]+)$/);
  if (!match) {
    await ctx.reply(
      'Usage: /broadcast <scope> <message>\n' +
      'Scope: `all` or a student ID\\.',
      { parse_mode: 'MarkdownV2' },
    );
    return;
  }

  const [, scope, messageText] = match;
  const adminUser = ctx.dbUser!;

  try {
    // Validate scope
    if (scope !== 'all') {
      const studentId = parseInt(scope, 10);
      if (isNaN(studentId)) {
        await ctx.reply('Invalid scope — use `all` or a numeric student ID\\.', { parse_mode: 'MarkdownV2' });
        return;
      }
      const student = await findStudentById(studentId);
      if (!student || !student.isActive) {
        await ctx.reply(`Student ${code(scope)} not found or inactive.`, { parse_mode: 'MarkdownV2' });
        return;
      }
    }

    const targetChatIds = await getBroadcastTargets(scope);
    if (targetChatIds.length === 0) {
      await ctx.reply('No active recipients found for this scope.');
      return;
    }

    const jobId = await enqueueBroadcast({
      adminUserId: adminUser.id,
      adminChatId: adminUser.chatId,
      scope,
      messageText,
      targetChatIds,
    });

    await ctx.reply(
      `Broadcast queued\\.\nJob: ${code(jobId)}\nRecipients: ${code(String(targetChatIds.length))}\n\nYou will receive a confirmation when delivery is complete\\.`,
      { parse_mode: 'MarkdownV2' },
    );

    logger.info(
      { adminUserId: adminUser.id, scope, targetCount: targetChatIds.length, jobId },
      'Admin queued broadcast',
    );
  } catch (err) {
    logger.error({ err, adminUserId: adminUser.id }, '/broadcast failed');
    await ctx.reply('Failed to queue broadcast. Please try again.');
  }
});

// ── /list_students ────────────────────────────────────────────────────────────

const PAGE_SIZE = 15;

admin.command('list_students', async (ctx) => {
  const args = parseArgs(ctx.message?.text);
  const page = Math.max(0, parseInt(args[0] ?? '1', 10) - 1);
  const offset = page * PAGE_SIZE;

  try {
    const students = await listActiveStudents(offset, PAGE_SIZE);

    if (students.length === 0 && page === 0) {
      await ctx.reply('No active students found.');
      return;
    }
    if (students.length === 0) {
      await ctx.reply('No more students on this page.');
      return;
    }

    const lines = students.map((s) =>
      `${code(String(s.id))} — ${escapeMarkdown(s.name)}${s.grade ? ` \\(${escapeMarkdown(s.grade)}\\)` : ''}`,
    );

    await ctx.reply(
      `*Active students* \\(page ${page + 1}\\):\n\n${lines.join('\n')}\n\nNext page: /list\\_students ${page + 2}`,
      { parse_mode: 'MarkdownV2' },
    );
  } catch (err) {
    logger.error({ err, adminUserId: ctx.dbUser!.id }, '/list_students failed');
    await ctx.reply('Failed to fetch student list. Please try again.');
  }
});

// ── /list_teachers ────────────────────────────────────────────────────────────

admin.command('list_teachers', async (ctx) => {
  try {
    const teachers = await listUsersByRole('teacher');

    if (teachers.length === 0) {
      await ctx.reply('No active teachers found.');
      return;
    }

    const lines = teachers.map((t) =>
      `${code(String(t.id))} — ${escapeMarkdown(t.displayName)}`,
    );

    await ctx.reply(
      `*Active teachers:*\n\n${lines.join('\n')}`,
      { parse_mode: 'MarkdownV2' },
    );
  } catch (err) {
    logger.error({ err, adminUserId: ctx.dbUser!.id }, '/list_teachers failed');
    await ctx.reply('Failed to fetch teacher list. Please try again.');
  }
});

// ── /list_parents ─────────────────────────────────────────────────────────────

admin.command('list_parents', async (ctx) => {
  try {
    const parents = await listUsersByRole('parent');

    if (parents.length === 0) {
      await ctx.reply('No active parents found.');
      return;
    }

    const lines = parents.map((p) =>
      `${code(String(p.id))} — ${escapeMarkdown(p.displayName)}`,
    );

    await ctx.reply(
      `*Active parents:*\n\n${lines.join('\n')}`,
      { parse_mode: 'MarkdownV2' },
    );
  } catch (err) {
    logger.error({ err, adminUserId: ctx.dbUser!.id }, '/list_parents failed');
    await ctx.reply('Failed to fetch parent list. Please try again.');
  }
});

// ── Superadmin: /deactivate ───────────────────────────────────────────────────

admin.command('deactivate', async (ctx) => {
  if (!isSuperadmin(ctx)) {
    await ctx.reply('This command requires superadmin access.');
    return;
  }

  const args = parseArgs(ctx.message?.text);
  if (args.length < 1) {
    await ctx.reply('Usage: /deactivate <user\\_id>', { parse_mode: 'MarkdownV2' });
    return;
  }

  const targetId = parseInt(args[0], 10);
  if (isNaN(targetId)) {
    await ctx.reply('Invalid user ID — must be a number.');
    return;
  }

  try {
    const target = await findUserById(targetId);
    if (!target) {
      await ctx.reply(`User ${code(String(targetId))} not found.`, { parse_mode: 'MarkdownV2' });
      return;
    }
    if (!target.isActive) {
      await ctx.reply(`User ${bold(target.displayName)} is already inactive.`, { parse_mode: 'MarkdownV2' });
      return;
    }
    if (target.id === ctx.dbUser!.id) {
      await ctx.reply('You cannot deactivate your own account.');
      return;
    }

    await deactivateUser(targetId, ctx.dbUser!.id);

    await ctx.reply(
      `User ${bold(target.displayName)} \\(${code(String(targetId))}\\) deactivated\\.`,
      { parse_mode: 'MarkdownV2' },
    );

    logger.info({ superadminId: ctx.dbUser!.id, targetUserId: targetId }, 'Superadmin deactivated user');
  } catch (err) {
    logger.error({ err, superadminId: ctx.dbUser!.id }, '/deactivate failed');
    await ctx.reply('Deactivation failed. Please try again.');
  }
});

// ── Superadmin: /reactivate ───────────────────────────────────────────────────

admin.command('reactivate', async (ctx) => {
  if (!isSuperadmin(ctx)) {
    await ctx.reply('This command requires superadmin access.');
    return;
  }

  const args = parseArgs(ctx.message?.text);
  if (args.length < 1) {
    await ctx.reply('Usage: /reactivate <user\\_id>', { parse_mode: 'MarkdownV2' });
    return;
  }

  const targetId = parseInt(args[0], 10);
  if (isNaN(targetId)) {
    await ctx.reply('Invalid user ID — must be a number.');
    return;
  }

  try {
    const target = await findUserById(targetId);
    if (!target) {
      await ctx.reply(`User ${code(String(targetId))} not found.`, { parse_mode: 'MarkdownV2' });
      return;
    }
    if (target.isActive) {
      await ctx.reply(`User ${bold(target.displayName)} is already active.`, { parse_mode: 'MarkdownV2' });
      return;
    }

    await reactivateUser(targetId);

    await ctx.reply(
      `User ${bold(target.displayName)} \\(${code(String(targetId))}\\) reactivated\\.`,
      { parse_mode: 'MarkdownV2' },
    );

    logger.info({ superadminId: ctx.dbUser!.id, targetUserId: targetId }, 'Superadmin reactivated user');
  } catch (err) {
    logger.error({ err, superadminId: ctx.dbUser!.id }, '/reactivate failed');
    await ctx.reply('Reactivation failed. Please try again.');
  }
});

// ── Superadmin: /promote ──────────────────────────────────────────────────────

admin.command('promote', async (ctx) => {
  if (!isSuperadmin(ctx)) {
    await ctx.reply('This command requires superadmin access.');
    return;
  }

  const args = parseArgs(ctx.message?.text);
  if (args.length < 1) {
    await ctx.reply('Usage: /promote <user\\_id>', { parse_mode: 'MarkdownV2' });
    return;
  }

  const targetId = parseInt(args[0], 10);
  if (isNaN(targetId)) {
    await ctx.reply('Invalid user ID — must be a number.');
    return;
  }

  try {
    const target = await findUserById(targetId);
    if (!target || !target.isActive) {
      await ctx.reply(`User ${code(String(targetId))} not found or inactive.`, { parse_mode: 'MarkdownV2' });
      return;
    }
    if (target.role === 'admin' || target.role === 'superadmin') {
      await ctx.reply(`User ${bold(target.displayName)} is already an admin.`, { parse_mode: 'MarkdownV2' });
      return;
    }

    await updateUserRole(targetId, 'admin');

    await ctx.reply(
      `User ${bold(target.displayName)} \\(${code(String(targetId))}\\) promoted to admin\\.`,
      { parse_mode: 'MarkdownV2' },
    );

    logger.info({ superadminId: ctx.dbUser!.id, targetUserId: targetId }, 'Superadmin promoted user to admin');
  } catch (err) {
    logger.error({ err, superadminId: ctx.dbUser!.id }, '/promote failed');
    await ctx.reply('Promotion failed. Please try again.');
  }
});

// ── Superadmin: /demote ───────────────────────────────────────────────────────

admin.command('demote', async (ctx) => {
  if (!isSuperadmin(ctx)) {
    await ctx.reply('This command requires superadmin access.');
    return;
  }

  const args = parseArgs(ctx.message?.text);
  if (args.length < 2) {
    await ctx.reply(
      'Usage: /demote <user\\_id> <new\\_role>\nNew role must be `teacher` or `parent`\\.',
      { parse_mode: 'MarkdownV2' },
    );
    return;
  }

  const targetId = parseInt(args[0], 10);
  const newRole = args[1];

  if (isNaN(targetId)) {
    await ctx.reply('Invalid user ID — must be a number.');
    return;
  }
  if (newRole !== 'teacher' && newRole !== 'parent') {
    await ctx.reply('New role must be `teacher` or `parent`\\.', { parse_mode: 'MarkdownV2' });
    return;
  }

  try {
    const target = await findUserById(targetId);
    if (!target || !target.isActive) {
      await ctx.reply(`User ${code(String(targetId))} not found or inactive.`, { parse_mode: 'MarkdownV2' });
      return;
    }
    if (target.role !== 'admin') {
      await ctx.reply(
        `User ${bold(target.displayName)} is not an admin \\(role: ${escapeMarkdown(target.role)}\\)\\.`,
        { parse_mode: 'MarkdownV2' },
      );
      return;
    }
    if (target.id === ctx.dbUser!.id) {
      await ctx.reply('You cannot demote your own account.');
      return;
    }

    await updateUserRole(targetId, newRole);

    await ctx.reply(
      `User ${bold(target.displayName)} \\(${code(String(targetId))}\\) demoted to ${escapeMarkdown(newRole)}\\.`,
      { parse_mode: 'MarkdownV2' },
    );

    logger.info(
      { superadminId: ctx.dbUser!.id, targetUserId: targetId, newRole },
      'Superadmin demoted user',
    );
  } catch (err) {
    logger.error({ err, superadminId: ctx.dbUser!.id }, '/demote failed');
    await ctx.reply('Demotion failed. Please try again.');
  }
});

// ── Superadmin: /audit ────────────────────────────────────────────────────────

admin.command('audit', async (ctx) => {
  if (!isSuperadmin(ctx)) {
    await ctx.reply('This command requires superadmin access.');
    return;
  }

  const args = parseArgs(ctx.message?.text);
  const rawCount = parseInt(args[0] ?? '10', 10);

  if (isNaN(rawCount)) {
    await ctx.reply('Usage: /audit [count] — count must be a number \\(max 50\\)\\.', { parse_mode: 'MarkdownV2' });
    return;
  }

  const count = Math.min(Math.max(rawCount, 1), 50);

  try {
    const entries = await getAuditLog(count);

    if (entries.length === 0) {
      await ctx.reply('No audit log entries found.');
      return;
    }

    const lines = entries.map((e) => {
      const ts = e.createdAt.toISOString().replace('T', ' ').slice(0, 19);
      return `${code(ts)} ${escapeMarkdown(e.direction)} src:${code(String(e.sourceUserId))} → tgt:${code(String(e.targetUserId))}${e.studentId ? ` stu:${code(String(e.studentId))}` : ''}`;
    });

    await ctx.reply(
      `*Audit log* \\(last ${entries.length}\\):\n\n${lines.join('\n')}`,
      { parse_mode: 'MarkdownV2' },
    );
  } catch (err) {
    logger.error({ err, superadminId: ctx.dbUser!.id }, '/audit failed');
    await ctx.reply('Failed to fetch audit log. Please try again.');
  }
});

// ── Superadmin: /system ───────────────────────────────────────────────────────

admin.command('system', async (ctx) => {
  if (!isSuperadmin(ctx)) {
    await ctx.reply('This command requires superadmin access.');
    return;
  }

  try {
    const [stats, queueStats] = await Promise.all([getSystemStats(), getBroadcastQueueStats()]);

    const uptimeMins = Math.floor(stats.uptimeSeconds / 60);
    const uptimeSecs = stats.uptimeSeconds % 60;

    await ctx.reply(
      `*System status*\n\n` +
      `Uptime: ${code(`${uptimeMins}m ${uptimeSecs}s`)}\n\n` +
      `*Users*\n` +
      `Total: ${code(String(stats.totalUsers))} \\| Active: ${code(String(stats.activeUsers))}\n` +
      `Teachers: ${code(String(stats.totalTeachers))} \\| Parents: ${code(String(stats.totalParents))}\n\n` +
      `*Students*\n` +
      `Total: ${code(String(stats.totalStudents))} \\| Active: ${code(String(stats.activeStudents))}\n` +
      `Active mappings: ${code(String(stats.activeMappings))}\n\n` +
      `*Broadcast queue*\n` +
      `Waiting: ${code(String(queueStats.waiting))} \\| Active: ${code(String(queueStats.active))}\n` +
      `Completed: ${code(String(queueStats.completed))} \\| Failed: ${code(String(queueStats.failed))}`,
      { parse_mode: 'MarkdownV2' },
    );
  } catch (err) {
    logger.error({ err, superadminId: ctx.dbUser!.id }, '/system failed');
    await ctx.reply('Failed to fetch system status. Please try again.');
  }
});

export { admin as adminComposer };
