import { query } from '../client.js';
import { decryptField } from '../../lib/crypto.js';
import { logger } from '../../lib/logger.js';
import type { DbAuditLogEntry } from '../../types/index.js';

// ── Mapping management ────────────────────────────────────────────────────────

export interface CreateMappingParams {
  studentId: number;
  teacherUserId: number;
  parentUserId: number;
  assignedBy: number;
}

/**
 * Create teacher_student and parent_student mappings for a student.
 * Uses INSERT ... ON CONFLICT DO UPDATE to reactivate any existing soft-deleted mapping.
 */
export async function createMapping(params: CreateMappingParams): Promise<void> {
  const { studentId, teacherUserId, parentUserId, assignedBy } = params;

  await query(
    `INSERT INTO teacher_student_mappings (teacher_user_id, student_id, assigned_by)
     VALUES ($1, $2, $3)
     ON CONFLICT (teacher_user_id, student_id)
       DO UPDATE SET is_active = TRUE, assigned_by = EXCLUDED.assigned_by, assigned_at = NOW(), deactivated_at = NULL`,
    [teacherUserId, studentId, assignedBy],
  );

  await query(
    `INSERT INTO parent_student_mappings (parent_user_id, student_id, assigned_by)
     VALUES ($1, $2, $3)
     ON CONFLICT (parent_user_id, student_id)
       DO UPDATE SET is_active = TRUE, assigned_by = EXCLUDED.assigned_by, assigned_at = NOW(), deactivated_at = NULL`,
    [parentUserId, studentId, assignedBy],
  );

  logger.info({ studentId, teacherUserId, parentUserId, assignedBy }, 'Mappings created');
}

/**
 * Soft-delete all active mappings for a student (teacher + parent).
 */
export async function deactivateMapping(studentId: number): Promise<void> {
  await query(
    `UPDATE teacher_student_mappings
     SET is_active = FALSE, deactivated_at = NOW()
     WHERE student_id = $1 AND is_active = TRUE`,
    [studentId],
  );

  await query(
    `UPDATE parent_student_mappings
     SET is_active = FALSE, deactivated_at = NOW()
     WHERE student_id = $1 AND is_active = TRUE`,
    [studentId],
  );

  logger.info({ studentId }, 'All mappings deactivated for student');
}

/**
 * Reassign a student to a new teacher.
 * Deactivates the current teacher mapping and creates a new one.
 */
export async function reassignTeacher(
  studentId: number,
  newTeacherUserId: number,
  assignedBy: number,
): Promise<void> {
  // Deactivate existing teacher mapping
  await query(
    `UPDATE teacher_student_mappings
     SET is_active = FALSE, deactivated_at = NOW()
     WHERE student_id = $1 AND is_active = TRUE`,
    [studentId],
  );

  // Create new teacher mapping (upsert to handle prior tombstone)
  await query(
    `INSERT INTO teacher_student_mappings (teacher_user_id, student_id, assigned_by)
     VALUES ($1, $2, $3)
     ON CONFLICT (teacher_user_id, student_id)
       DO UPDATE SET is_active = TRUE, assigned_by = EXCLUDED.assigned_by, assigned_at = NOW(), deactivated_at = NULL`,
    [newTeacherUserId, studentId, assignedBy],
  );

  logger.info({ studentId, newTeacherUserId, assignedBy }, 'Teacher reassigned for student');
}

// ── Audit log ─────────────────────────────────────────────────────────────────

/**
 * Fetch the last N entries from message_audit_log.
 */
export async function getAuditLog(limit: number): Promise<DbAuditLogEntry[]> {
  const result = await query(
    `SELECT * FROM message_audit_log ORDER BY created_at DESC LIMIT $1`,
    [limit],
  );

  return result.rows.map((row) => ({
    id: row.id as number,
    sourceUserId: row.source_user_id as number,
    targetUserId: row.target_user_id as number,
    studentId: row.student_id as number | null,
    direction: row.direction as DbAuditLogEntry['direction'],
    messageType: row.message_type as DbAuditLogEntry['messageType'],
    relayedMessageId: row.relayed_message_id as number | null,
    createdAt: row.created_at as Date,
  }));
}

// ── System stats ──────────────────────────────────────────────────────────────

export interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalStudents: number;
  activeStudents: number;
  totalTeachers: number;
  totalParents: number;
  activeMappings: number;
  uptimeSeconds: number;
}

/**
 * Gather system-wide counts for the /system command.
 */
export async function getSystemStats(): Promise<SystemStats> {
  const [usersResult, studentsResult, mappingsResult] = await Promise.all([
    query(`
      SELECT
        COUNT(*) FILTER (WHERE TRUE)                     AS total_users,
        COUNT(*) FILTER (WHERE is_active = TRUE)         AS active_users,
        COUNT(*) FILTER (WHERE role = 'teacher' AND is_active = TRUE) AS total_teachers,
        COUNT(*) FILTER (WHERE role = 'parent'  AND is_active = TRUE) AS total_parents
      FROM users
    `),
    query(`
      SELECT
        COUNT(*)                                         AS total_students,
        COUNT(*) FILTER (WHERE is_active = TRUE)         AS active_students
      FROM students
    `),
    query(`
      SELECT COUNT(*) AS active_mappings
      FROM teacher_student_mappings WHERE is_active = TRUE
    `),
  ]);

  const u = usersResult.rows[0];
  const s = studentsResult.rows[0];
  const m = mappingsResult.rows[0];

  return {
    totalUsers: Number(u.total_users),
    activeUsers: Number(u.active_users),
    totalStudents: Number(s.total_students),
    activeStudents: Number(s.active_students),
    totalTeachers: Number(u.total_teachers),
    totalParents: Number(u.total_parents),
    activeMappings: Number(m.active_mappings),
    uptimeSeconds: Math.floor(process.uptime()),
  };
}

// ── Broadcast targets ─────────────────────────────────────────────────────────

/**
 * Resolve target chat IDs for a broadcast.
 * scope = "all"           → every active user's chat_id
 * scope = "<student_id>"  → teacher + all parents for that student
 */
export async function getBroadcastTargets(scope: string): Promise<string[]> {
  if (scope === 'all') {
    const result = await query(
      `SELECT chat_id FROM users WHERE is_active = TRUE`,
    );
    return result.rows.map((row) => decryptField(row.chat_id as Buffer));
  }

  const studentId = parseInt(scope, 10);
  if (isNaN(studentId)) return [];

  // Teacher for student
  const teacherResult = await query(
    `SELECT u.chat_id FROM teacher_student_mappings tsm
     JOIN users u ON u.id = tsm.teacher_user_id AND u.is_active = TRUE
     WHERE tsm.student_id = $1 AND tsm.is_active = TRUE`,
    [studentId],
  );

  // Parents for student
  const parentResult = await query(
    `SELECT u.chat_id FROM parent_student_mappings psm
     JOIN users u ON u.id = psm.parent_user_id AND u.is_active = TRUE
     WHERE psm.student_id = $1 AND psm.is_active = TRUE`,
    [studentId],
  );

  const chatIds = [
    ...teacherResult.rows.map((row) => decryptField(row.chat_id as Buffer)),
    ...parentResult.rows.map((row) => decryptField(row.chat_id as Buffer)),
  ];

  // Deduplicate (a user might appear as both teacher and parent in edge cases)
  return [...new Set(chatIds)];
}

// ── User lists for admin commands ─────────────────────────────────────────────

export interface AdminUserRow {
  id: number;
  displayName: string;
  role: string;
  isActive: boolean;
}

/**
 * List all active users of a given role.
 */
export async function listUsersByRole(role: 'teacher' | 'parent' | 'admin' | 'superadmin'): Promise<AdminUserRow[]> {
  const result = await query(
    `SELECT id, display_name, role, is_active FROM users WHERE role = $1 AND is_active = TRUE ORDER BY id`,
    [role],
  );

  return result.rows.map((row) => ({
    id: row.id as number,
    displayName: decryptField(row.display_name as Buffer),
    role: row.role as string,
    isActive: row.is_active as boolean,
  }));
}

// ── Broadcast log ─────────────────────────────────────────────────────────────

/**
 * Insert a new broadcast_log row and return its ID.
 */
export async function insertBroadcastLog(params: {
  adminUserId: number;
  scope: string;
  messagePreview: string;
  targetCount: number;
}): Promise<number> {
  const result = await query(
    `INSERT INTO broadcast_log (admin_user_id, scope, message_preview, target_count)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    [params.adminUserId, params.scope, params.messagePreview.slice(0, 200), params.targetCount],
  );
  return result.rows[0].id as number;
}

/**
 * Update a broadcast_log row with final delivery counts.
 */
export async function completeBroadcastLog(params: {
  logId: number;
  deliveredCount: number;
  failedCount: number;
}): Promise<void> {
  await query(
    `UPDATE broadcast_log
     SET delivered_count = $2, failed_count = $3, completed_at = NOW()
     WHERE id = $1`,
    [params.logId, params.deliveredCount, params.failedCount],
  );
}
