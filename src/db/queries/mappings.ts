import { query } from '../client.js';
import { decryptField } from '../../lib/crypto.js';
import type { StudentWithTeacher } from '../../types/index.js';

/**
 * Get all active children for a parent, with their assigned teachers.
 */
export async function getChildrenForParent(parentUserId: number): Promise<StudentWithTeacher[]> {
  const result = await query(
    `SELECT
       s.id AS student_id,
       s.name AS student_name,
       s.grade AS student_grade,
       t_user.id AS teacher_user_id,
       t_user.chat_id AS teacher_chat_id,
       t_user.display_name AS teacher_display_name
     FROM parent_student_mappings psm
     JOIN students s ON s.id = psm.student_id AND s.is_active = TRUE
     JOIN teacher_student_mappings tsm ON tsm.student_id = s.id AND tsm.is_active = TRUE
     JOIN users t_user ON t_user.id = tsm.teacher_user_id AND t_user.is_active = TRUE
     WHERE psm.parent_user_id = $1 AND psm.is_active = TRUE
     ORDER BY s.name`,
    [parentUserId],
  );

  return result.rows.map((row) => ({
    studentId: row.student_id as number,
    studentName: row.student_name as string,
    studentGrade: row.student_grade as string | null,
    teacherUserId: row.teacher_user_id as number,
    teacherChatId: decryptField(row.teacher_chat_id as Buffer),
    teacherDisplayName: decryptField(row.teacher_display_name as Buffer),
  }));
}

/**
 * Get the teacher for a specific student.
 */
export async function getTeacherForStudent(
  studentId: number,
): Promise<{ userId: number; chatId: string; displayName: string } | null> {
  const result = await query(
    `SELECT u.id, u.chat_id, u.display_name
     FROM teacher_student_mappings tsm
     JOIN users u ON u.id = tsm.teacher_user_id AND u.is_active = TRUE
     WHERE tsm.student_id = $1 AND tsm.is_active = TRUE
     LIMIT 1`,
    [studentId],
  );

  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    userId: row.id as number,
    chatId: decryptField(row.chat_id as Buffer),
    displayName: decryptField(row.display_name as Buffer),
  };
}

/**
 * Get the parent for a specific student (used in teacher→parent relay).
 */
export async function getParentsForStudent(
  studentId: number,
): Promise<Array<{ userId: number; chatId: string; displayName: string }>> {
  const result = await query(
    `SELECT u.id, u.chat_id, u.display_name
     FROM parent_student_mappings psm
     JOIN users u ON u.id = psm.parent_user_id AND u.is_active = TRUE
     WHERE psm.student_id = $1 AND psm.is_active = TRUE`,
    [studentId],
  );

  return result.rows.map((row) => ({
    userId: row.id as number,
    chatId: decryptField(row.chat_id as Buffer),
    displayName: decryptField(row.display_name as Buffer),
  }));
}

/**
 * Check if a student is still actively mapped to a parent.
 */
export async function isStudentActiveForParent(
  parentUserId: number,
  studentId: number,
): Promise<boolean> {
  const result = await query(
    `SELECT 1 FROM parent_student_mappings
     WHERE parent_user_id = $1 AND student_id = $2 AND is_active = TRUE`,
    [parentUserId, studentId],
  );
  return result.rows.length > 0;
}
