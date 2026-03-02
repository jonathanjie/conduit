-- Rollback: 001_initial-schema
-- Drop all tables in reverse dependency order

DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS attendance_records;
DROP TABLE IF EXISTS dashboard_users;
DROP TABLE IF EXISTS broadcast_log;
DROP TABLE IF EXISTS message_audit_log;
DROP TABLE IF EXISTS onboarding_tokens;
DROP TABLE IF EXISTS parent_student_mappings;
DROP TABLE IF EXISTS teacher_student_mappings;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS users;
DROP EXTENSION IF EXISTS pgcrypto;
