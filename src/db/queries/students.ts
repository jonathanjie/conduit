import { query } from '../client.js';
import { logger } from '../../lib/logger.js';
import type { DbStudent } from '../../types/index.js';

function rowToDbStudent(row: Record<string, unknown>): DbStudent {
  return {
    id: row.id as number,
    name: row.name as string,
    grade: row.grade as string | null,
    enrolledAt: row.enrolled_at as Date,
    isActive: row.is_active as boolean,
  };
}

/**
 * Create a new student record.
 */
export async function createStudent(name: string, grade?: string): Promise<{ id: number }> {
  const result = await query(
    `INSERT INTO students (name, grade) VALUES ($1, $2) RETURNING id`,
    [name, grade ?? null],
  );
  const id = result.rows[0].id as number;
  logger.info({ studentId: id, name, grade }, 'Student created');
  return { id };
}

/**
 * Find a student by their internal ID.
 */
export async function findStudentById(id: number): Promise<DbStudent | null> {
  const result = await query(`SELECT * FROM students WHERE id = $1`, [id]);
  if (result.rows.length === 0) return null;
  return rowToDbStudent(result.rows[0]);
}

/**
 * List all active students, ordered by name, with pagination.
 */
export async function listActiveStudents(
  offset = 0,
  limit = 20,
): Promise<DbStudent[]> {
  const result = await query(
    `SELECT * FROM students WHERE is_active = TRUE ORDER BY name LIMIT $1 OFFSET $2`,
    [limit, offset],
  );
  return result.rows.map(rowToDbStudent);
}

/**
 * Soft-delete a student by setting is_active = FALSE.
 */
export async function deactivateStudent(id: number): Promise<void> {
  await query(`UPDATE students SET is_active = FALSE WHERE id = $1`, [id]);
  logger.info({ studentId: id }, 'Student deactivated');
}
