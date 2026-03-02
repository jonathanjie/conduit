-- Migration: 001_initial-schema
-- Description: Complete Conduit MVP schema
-- Date: 2026-03-03

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- Core: Users (Telegram users — parents, teachers, admins, superadmins)
-- ============================================================
CREATE TABLE users (
    id                    BIGSERIAL PRIMARY KEY,
    telegram_user_id      BYTEA NOT NULL,               -- AES-256 encrypted
    telegram_user_id_hash BYTEA NOT NULL UNIQUE,         -- SHA-256 hash for indexed lookups
    chat_id               BYTEA NOT NULL,                -- AES-256 encrypted
    role                  VARCHAR(20) NOT NULL
                          CHECK (role IN ('parent', 'teacher', 'admin', 'superadmin')),
    display_name          BYTEA NOT NULL,                -- AES-256 encrypted
    registered_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    pdpa_consent_at       TIMESTAMPTZ,
    is_active             BOOLEAN NOT NULL DEFAULT TRUE,
    deactivated_at        TIMESTAMPTZ,
    deactivated_by        BIGINT REFERENCES users(id)
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_tg_hash ON users(telegram_user_id_hash);
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = TRUE;

-- ============================================================
-- Core: Students
-- ============================================================
CREATE TABLE students (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(200) NOT NULL,
    grade       VARCHAR(50),
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active   BOOLEAN NOT NULL DEFAULT TRUE
);

-- ============================================================
-- Core: Teacher-Student Mappings
-- ============================================================
CREATE TABLE teacher_student_mappings (
    id              BIGSERIAL PRIMARY KEY,
    teacher_user_id BIGINT NOT NULL REFERENCES users(id),
    student_id      BIGINT NOT NULL REFERENCES students(id),
    assigned_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    assigned_by     BIGINT REFERENCES users(id),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    deactivated_at  TIMESTAMPTZ,
    UNIQUE (teacher_user_id, student_id)
);

CREATE INDEX idx_tsm_student ON teacher_student_mappings(student_id) WHERE is_active = TRUE;
CREATE INDEX idx_tsm_teacher ON teacher_student_mappings(teacher_user_id) WHERE is_active = TRUE;

-- ============================================================
-- Core: Parent-Student Mappings
-- ============================================================
CREATE TABLE parent_student_mappings (
    id             BIGSERIAL PRIMARY KEY,
    parent_user_id BIGINT NOT NULL REFERENCES users(id),
    student_id     BIGINT NOT NULL REFERENCES students(id),
    relationship   VARCHAR(50) NOT NULL DEFAULT 'parent'
                   CHECK (relationship IN ('parent', 'guardian', 'sibling')),
    assigned_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    assigned_by    BIGINT REFERENCES users(id),
    is_active      BOOLEAN NOT NULL DEFAULT TRUE,
    deactivated_at TIMESTAMPTZ,
    UNIQUE (parent_user_id, student_id)
);

CREATE INDEX idx_psm_parent ON parent_student_mappings(parent_user_id) WHERE is_active = TRUE;
CREATE INDEX idx_psm_student ON parent_student_mappings(student_id) WHERE is_active = TRUE;

-- ============================================================
-- Core: Onboarding Tokens
-- ============================================================
CREATE TABLE onboarding_tokens (
    id              BIGSERIAL PRIMARY KEY,
    token           VARCHAR(64) NOT NULL UNIQUE,
    role            VARCHAR(20) NOT NULL CHECK (role IN ('parent', 'teacher')),
    student_id      BIGINT REFERENCES students(id),
    teacher_user_id BIGINT REFERENCES users(id),
    created_by      BIGINT REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '72 hours'),
    used_at         TIMESTAMPTZ,
    used_by         BIGINT REFERENCES users(id)
);

CREATE INDEX idx_tokens_lookup ON onboarding_tokens(token) WHERE used_at IS NULL;
CREATE INDEX idx_tokens_expiry ON onboarding_tokens(expires_at) WHERE used_at IS NULL;

-- ============================================================
-- Audit: Message Relay Log (NEVER stores content — metadata only)
-- ============================================================
CREATE TABLE message_audit_log (
    id                 BIGSERIAL PRIMARY KEY,
    source_user_id     BIGINT NOT NULL REFERENCES users(id),
    target_user_id     BIGINT NOT NULL REFERENCES users(id),
    student_id         BIGINT REFERENCES students(id),
    direction          VARCHAR(30) NOT NULL
                       CHECK (direction IN ('parent_to_teacher', 'teacher_to_parent', 'ai_to_parent')),
    message_type       VARCHAR(30) NOT NULL
                       CHECK (message_type IN ('text', 'photo', 'video', 'voice', 'document',
                                               'sticker', 'animation', 'media_group', 'other')),
    relayed_message_id BIGINT,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
    -- NO content columns — PDPA minimization enforced at schema level
);

CREATE INDEX idx_audit_source ON message_audit_log(source_user_id, created_at DESC);
CREATE INDEX idx_audit_student ON message_audit_log(student_id, created_at DESC);
CREATE INDEX idx_audit_created ON message_audit_log(created_at DESC);

-- ============================================================
-- Audit: Broadcast Log
-- ============================================================
CREATE TABLE broadcast_log (
    id              BIGSERIAL PRIMARY KEY,
    admin_user_id   BIGINT NOT NULL REFERENCES users(id),
    scope           VARCHAR(50) NOT NULL,
    message_preview VARCHAR(200),
    target_count    INTEGER NOT NULL DEFAULT 0,
    delivered_count INTEGER NOT NULL DEFAULT 0,
    failed_count    INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at    TIMESTAMPTZ
);

CREATE INDEX idx_broadcast_created ON broadcast_log(created_at DESC);

-- ============================================================
-- Web Dashboard Users (separate from Telegram users)
-- ============================================================
CREATE TABLE dashboard_users (
    id               BIGSERIAL PRIMARY KEY,
    email            VARCHAR(255) NOT NULL UNIQUE,
    password_hash    VARCHAR(255) NOT NULL,
    role             VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'superadmin')),
    display_name     VARCHAR(200) NOT NULL,
    telegram_user_id BIGINT REFERENCES users(id),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by       BIGINT REFERENCES dashboard_users(id),
    last_login_at    TIMESTAMPTZ,
    is_active        BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE UNIQUE INDEX idx_dashboard_email ON dashboard_users(email) WHERE is_active = TRUE;

-- ============================================================
-- Phase 2 Stub: Attendance Records
-- ============================================================
CREATE TABLE attendance_records (
    id              BIGSERIAL PRIMARY KEY,
    student_id      BIGINT NOT NULL REFERENCES students(id),
    class_date      DATE NOT NULL,
    teacher_user_id BIGINT NOT NULL REFERENCES users(id),
    status          VARCHAR(20) NOT NULL
                    CHECK (status IN ('present', 'absent', 'late', 'makeup')),
    notes           VARCHAR(500),
    marked_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, class_date, teacher_user_id)
);

CREATE INDEX idx_attendance_student ON attendance_records(student_id, class_date DESC);

-- ============================================================
-- Phase 3 Stub: Invoices
-- ============================================================
CREATE TABLE invoices (
    id                       BIGSERIAL PRIMARY KEY,
    student_id               BIGINT NOT NULL REFERENCES students(id),
    parent_user_id           BIGINT NOT NULL REFERENCES users(id),
    amount_cents             INTEGER NOT NULL CHECK (amount_cents > 0),
    currency                 VARCHAR(3) NOT NULL DEFAULT 'SGD',
    stripe_payment_intent_id VARCHAR(200),
    stripe_qr_code_url       TEXT,
    status                   VARCHAR(20) NOT NULL DEFAULT 'pending'
                             CHECK (status IN ('pending', 'sent', 'paid', 'overdue', 'cancelled')),
    due_date                 DATE NOT NULL,
    paid_at                  TIMESTAMPTZ,
    created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by               BIGINT REFERENCES users(id)
);

CREATE INDEX idx_invoices_student ON invoices(student_id, due_date DESC);
CREATE INDEX idx_invoices_status ON invoices(status) WHERE status IN ('pending', 'sent', 'overdue');
