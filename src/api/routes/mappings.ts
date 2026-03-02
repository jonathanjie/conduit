import { Hono } from 'hono';
import { z } from 'zod';
import { query } from '../../db/client.js';
import { createMapping, reassignTeacher } from '../../db/queries/admin.js';
import { decryptField } from '../../lib/crypto.js';
import { requireAuth } from '../middleware/auth.js';
import { logger } from '../../lib/logger.js';

// ─── Schemas ──────────────────────────────────────────────────────────────────

const createMappingSchema = z.object({
  studentId: z.number().int().positive('studentId must be a positive integer'),
  teacherUserId: z.number().int().positive('teacherUserId must be a positive integer'),
  parentUserId: z.number().int().positive('parentUserId must be a positive integer'),
});

const updateMappingSchema = z.object({
  teacherUserId: z.number().int().positive('teacherUserId must be a positive integer'),
});

// ─── Routes ───────────────────────────────────────────────────────────────────

export const mappingRoutes = new Hono();

mappingRoutes.use('/mappings/*', requireAuth);
mappingRoutes.use('/mappings', requireAuth);

/**
 * GET /api/v1/mappings
 * List all active teacher_student_mappings joined with student and user info.
 */
mappingRoutes.get('/mappings', async (c) => {
  const result = await query(`
    SELECT
      tsm.id            AS mapping_id,
      s.id              AS student_id,
      s.name            AS student_name,
      s.grade           AS student_grade,
      t.id              AS teacher_user_id,
      t.display_name    AS teacher_display_name,
      tsm.assigned_at   AS assigned_at
    FROM teacher_student_mappings tsm
    JOIN students s ON s.id = tsm.student_id
    JOIN users t ON t.id = tsm.teacher_user_id
    WHERE tsm.is_active = TRUE AND s.is_active = TRUE
    ORDER BY s.name, tsm.assigned_at DESC
  `);

  const data = result.rows.map((row) => ({
    id: row.mapping_id as number,
    studentId: row.student_id as number,
    studentName: row.student_name as string,
    studentGrade: row.student_grade as string | null,
    teacherUserId: row.teacher_user_id as number,
    teacherDisplayName: decryptField(row.teacher_display_name as Buffer),
    assignedAt: (row.assigned_at as Date).toISOString(),
  }));

  return c.json({ data });
});

/**
 * POST /api/v1/mappings
 * Create a new teacher + parent mapping for a student.
 */
mappingRoutes.post('/mappings', async (c) => {
  const session = c.get('session');

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const parsed = createMappingSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      422,
    );
  }

  const { studentId, teacherUserId, parentUserId } = parsed.data;

  await createMapping({
    studentId,
    teacherUserId,
    parentUserId,
    assignedBy: session.userId,
  });

  logger.info({ studentId, teacherUserId, parentUserId, assignedBy: session.userId }, 'Mapping created via API');

  return c.json({ data: { message: 'Mapping created', studentId, teacherUserId, parentUserId } }, 201);
});

/**
 * PATCH /api/v1/mappings/:id
 * Reassign the teacher on an existing mapping.
 * The :id param is the student ID for reassignment.
 */
mappingRoutes.patch('/mappings/:id', async (c) => {
  const session = c.get('session');
  const id = parseInt(c.req.param('id'), 10);

  if (isNaN(id)) {
    return c.json({ error: 'Invalid mapping ID' }, 400);
  }

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const parsed = updateMappingSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      422,
    );
  }

  // Verify the mapping exists
  const check = await query(
    `SELECT student_id FROM teacher_student_mappings WHERE id = $1 AND is_active = TRUE`,
    [id],
  );

  if (check.rows.length === 0) {
    return c.json({ error: 'Mapping not found' }, 404);
  }

  const studentId = check.rows[0].student_id as number;
  await reassignTeacher(studentId, parsed.data.teacherUserId, session.userId);

  logger.info({ mappingId: id, studentId, newTeacherUserId: parsed.data.teacherUserId }, 'Teacher reassigned via API');

  return c.json({ data: { message: 'Teacher reassigned', studentId, teacherUserId: parsed.data.teacherUserId } });
});

/**
 * DELETE /api/v1/mappings/:id
 * Soft-delete a teacher_student_mapping by ID.
 */
mappingRoutes.delete('/mappings/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10);

  if (isNaN(id)) {
    return c.json({ error: 'Invalid mapping ID' }, 400);
  }

  const check = await query(
    `SELECT id FROM teacher_student_mappings WHERE id = $1 AND is_active = TRUE`,
    [id],
  );

  if (check.rows.length === 0) {
    return c.json({ error: 'Mapping not found' }, 404);
  }

  await query(
    `UPDATE teacher_student_mappings SET is_active = FALSE, deactivated_at = NOW() WHERE id = $1`,
    [id],
  );

  logger.info({ mappingId: id }, 'Mapping deactivated via API');

  return c.json({ data: { message: 'Mapping deactivated' } });
});
