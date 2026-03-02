import { Hono } from 'hono';
import { z } from 'zod';
import {
  createStudent,
  findStudentById,
  listActiveStudents,
  deactivateStudent,
} from '../../db/queries/students.js';
import { query } from '../../db/client.js';
import { requireAuth } from '../middleware/auth.js';
import { logger } from '../../lib/logger.js';

// ─── Schemas ──────────────────────────────────────────────────────────────────

const createStudentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  grade: z.string().max(50).optional(),
});

const updateStudentSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  grade: z.string().max(50).nullable().optional(),
});

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  grade: z.string().optional(),
  teacherId: z.coerce.number().int().positive().optional(),
});

// ─── Routes ───────────────────────────────────────────────────────────────────

export const studentRoutes = new Hono();

// All student routes require authentication
studentRoutes.use('/students/*', requireAuth);
studentRoutes.use('/students', requireAuth);

/**
 * GET /api/v1/students
 * List students with pagination, optional search by name, filter by grade/teacher.
 */
studentRoutes.get('/students', async (c) => {
  const queryParams = paginationSchema.safeParse(c.req.query());
  if (!queryParams.success) {
    return c.json(
      { error: 'Invalid query parameters', details: queryParams.error.flatten().fieldErrors },
      422,
    );
  }

  const { page, limit, search, grade, teacherId } = queryParams.data;
  const offset = (page - 1) * limit;

  const conditions: string[] = ['s.is_active = TRUE'];
  const params: unknown[] = [];
  let idx = 1;

  if (search) {
    conditions.push(`s.name ILIKE $${idx++}`);
    params.push(`%${search}%`);
  }
  if (grade) {
    conditions.push(`s.grade = $${idx++}`);
    params.push(grade);
  }

  let fromClause = 'FROM students s';
  if (teacherId !== undefined) {
    fromClause +=
      ` JOIN teacher_student_mappings tsm ON tsm.student_id = s.id AND tsm.is_active = TRUE`;
    conditions.push(`tsm.teacher_user_id = $${idx++}`);
    params.push(teacherId);
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  const [rowsResult, countResult] = await Promise.all([
    query(
      `SELECT s.* ${fromClause} ${whereClause} ORDER BY s.name LIMIT $${idx++} OFFSET $${idx++}`,
      [...params, limit, offset],
    ),
    query(`SELECT COUNT(*) AS total ${fromClause} ${whereClause}`, params),
  ]);

  const total = Number(countResult.rows[0].total);

  return c.json({
    data: rowsResult.rows.map((row) => ({
      id: row.id as number,
      name: row.name as string,
      grade: row.grade as string | null,
      enrolledAt: (row.enrolled_at as Date).toISOString(),
      isActive: row.is_active as boolean,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

/**
 * POST /api/v1/students
 * Create a new student.
 */
studentRoutes.post('/students', async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const parsed = createStudentSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      422,
    );
  }

  const { name, grade } = parsed.data;
  const student = await createStudent(name, grade);

  logger.info({ studentId: student.id }, 'Student created via API');

  return c.json({ data: { id: student.id, name, grade: grade ?? null } }, 201);
});

/**
 * PATCH /api/v1/students/:id
 * Update a student's name or grade.
 */
studentRoutes.patch('/students/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  if (isNaN(id)) {
    return c.json({ error: 'Invalid student ID' }, 400);
  }

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const parsed = updateStudentSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      422,
    );
  }

  const existing = await findStudentById(id);
  if (!existing || !existing.isActive) {
    return c.json({ error: 'Student not found' }, 404);
  }

  const updates: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (parsed.data.name !== undefined) {
    updates.push(`name = $${idx++}`);
    params.push(parsed.data.name);
  }
  if (parsed.data.grade !== undefined) {
    updates.push(`grade = $${idx++}`);
    params.push(parsed.data.grade);
  }

  if (updates.length === 0) {
    return c.json({ error: 'No fields to update' }, 422);
  }

  params.push(id);
  await query(
    `UPDATE students SET ${updates.join(', ')} WHERE id = $${idx}`,
    params,
  );

  const updated = await findStudentById(id);
  logger.info({ studentId: id }, 'Student updated via API');

  return c.json({ data: updated });
});

/**
 * DELETE /api/v1/students/:id
 * Soft-delete a student (sets is_active = FALSE).
 */
studentRoutes.delete('/students/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  if (isNaN(id)) {
    return c.json({ error: 'Invalid student ID' }, 400);
  }

  const existing = await findStudentById(id);
  if (!existing || !existing.isActive) {
    return c.json({ error: 'Student not found' }, 404);
  }

  await deactivateStudent(id);
  logger.info({ studentId: id }, 'Student deactivated via API');

  return c.json({ data: { message: 'Student deactivated' } });
});

/**
 * POST /api/v1/students/import
 * Bulk import students from a CSV string.
 * Expected CSV format: name,grade (header row optional)
 */
studentRoutes.post('/students/import', async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const parsed = z
    .object({ csv: z.string().min(1, 'CSV content is required') })
    .safeParse(body);

  if (!parsed.success) {
    return c.json(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      422,
    );
  }

  const lines = parsed.data.csv
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const results: Array<{ name: string; grade: string | null; id: number }> = [];
  const errors: Array<{ line: number; error: string }> = [];

  // Skip header row if it looks like one (contains 'name' literally)
  const startLine = lines[0]?.toLowerCase().startsWith('name') ? 1 : 0;

  for (let i = startLine; i < lines.length; i++) {
    const parts = lines[i].split(',').map((p) => p.trim());
    const name = parts[0];
    const grade = parts[1] || undefined;

    if (!name) {
      errors.push({ line: i + 1, error: 'Empty name' });
      continue;
    }

    try {
      const student = await createStudent(name, grade);
      results.push({ id: student.id, name, grade: grade ?? null });
    } catch (err) {
      logger.warn({ err, name }, 'Failed to import student row');
      errors.push({ line: i + 1, error: 'Insert failed' });
    }
  }

  logger.info({ imported: results.length, errors: errors.length }, 'Student CSV import complete');

  return c.json({
    data: {
      imported: results.length,
      failed: errors.length,
      students: results,
      errors,
    },
  }, results.length > 0 ? 201 : 422);
});
