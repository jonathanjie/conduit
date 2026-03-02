// ============================================================
// Core domain types for Conduit
// ============================================================

export type UserRole = 'parent' | 'teacher' | 'admin' | 'superadmin';
export type MessageDirection = 'parent_to_teacher' | 'teacher_to_parent' | 'ai_to_parent';
export type MessageType =
  | 'text'
  | 'photo'
  | 'video'
  | 'voice'
  | 'document'
  | 'sticker'
  | 'animation'
  | 'media_group'
  | 'other';
export type TokenRole = 'parent' | 'teacher';
export type Relationship = 'parent' | 'guardian' | 'sibling';
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'makeup';
export type InvoiceStatus = 'pending' | 'sent' | 'paid' | 'overdue' | 'cancelled';
export type DashboardUserRole = 'admin' | 'superadmin';

// ============================================================
// Database row types (post-decryption)
// ============================================================

export interface DbUser {
  id: number;
  telegramUserId: string;
  chatId: string;
  role: UserRole;
  displayName: string;
  registeredAt: Date;
  pdpaConsentAt: Date | null;
  isActive: boolean;
  deactivatedAt: Date | null;
  deactivatedBy: number | null;
}

export interface DbStudent {
  id: number;
  name: string;
  grade: string | null;
  enrolledAt: Date;
  isActive: boolean;
}

export interface DbTeacherStudentMapping {
  id: number;
  teacherUserId: number;
  studentId: number;
  assignedAt: Date;
  assignedBy: number | null;
  isActive: boolean;
}

export interface DbParentStudentMapping {
  id: number;
  parentUserId: number;
  studentId: number;
  relationship: Relationship;
  assignedAt: Date;
  assignedBy: number | null;
  isActive: boolean;
}

export interface DbOnboardingToken {
  id: number;
  token: string;
  role: TokenRole;
  studentId: number | null;
  teacherUserId: number | null;
  createdBy: number | null;
  createdAt: Date;
  expiresAt: Date;
  usedAt: Date | null;
  usedBy: number | null;
}

export interface DbAuditLogEntry {
  id: number;
  sourceUserId: number;
  targetUserId: number;
  studentId: number | null;
  direction: MessageDirection;
  messageType: MessageType;
  relayedMessageId: number | null;
  createdAt: Date;
}

export interface DbBroadcastLog {
  id: number;
  adminUserId: number;
  scope: string;
  messagePreview: string | null;
  targetCount: number;
  deliveredCount: number;
  failedCount: number;
  createdAt: Date;
  completedAt: Date | null;
}

export interface DbDashboardUser {
  id: number;
  email: string;
  passwordHash: string;
  role: DashboardUserRole;
  displayName: string;
  telegramUserId: number | null;
  createdAt: Date;
  createdBy: number | null;
  lastLoginAt: Date | null;
  isActive: boolean;
}

// ============================================================
// Composite / query-result types
// ============================================================

export interface StudentWithTeacher {
  studentId: number;
  studentName: string;
  studentGrade: string | null;
  teacherUserId: number;
  teacherChatId: string;
  teacherDisplayName: string;
}

// ============================================================
// Service input types
// ============================================================

export interface CreateUserParams {
  telegramUserId: string;
  chatId: string;
  role: UserRole;
  displayName: string;
  pdpaConsentAt?: Date;
}

export interface RelayParams {
  fromChatId: string;
  toChatId: string;
  messageId: number;
  studentName: string;
  studentId: number;
  sourceUserId: number;
  targetUserId: number;
  direction: MessageDirection;
  messageType: MessageType;
}

export interface BroadcastParams {
  adminUserId: number;
  scope: string;
  messageText: string;
  targetChatIds: string[];
}
