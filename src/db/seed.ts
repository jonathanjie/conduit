/**
 * Seed script for local development.
 * Inserts test data: 2 teachers, 1 parent, 2 students with mappings.
 * Run: npm run seed
 */
import 'dotenv/config';
import pg from 'pg';
import bcrypt from 'bcrypt';
import { encryptField, hashTelegramId } from '../lib/crypto.js';

const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://conduit:conduit@localhost:5432/conduit';
const pool = new Pool({ connectionString: DATABASE_URL });

// Aliases for readability in seed context
const encrypt = encryptField;
const hashId = hashTelegramId;

async function seed() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Clean existing seed data
    await client.query('DELETE FROM parent_student_mappings');
    await client.query('DELETE FROM teacher_student_mappings');
    await client.query('DELETE FROM onboarding_tokens');
    await client.query('DELETE FROM message_audit_log');
    await client.query('DELETE FROM broadcast_log');
    await client.query('DELETE FROM students');
    await client.query('DELETE FROM dashboard_users');
    await client.query('DELETE FROM users');

    // === Users ===
    const teacherLim = await client.query(
      `INSERT INTO users (telegram_user_id, telegram_user_id_hash, chat_id, role, display_name, pdpa_consent_at)
       VALUES ($1, $2, $3, 'teacher', $4, NOW())
       RETURNING id`,
      [encrypt('100001'), hashId('100001'), encrypt('100001'), encrypt('Ms Lim Boon Hui')],
    );

    const teacherTan = await client.query(
      `INSERT INTO users (telegram_user_id, telegram_user_id_hash, chat_id, role, display_name, pdpa_consent_at)
       VALUES ($1, $2, $3, 'teacher', $4, NOW())
       RETURNING id`,
      [encrypt('100003'), hashId('100003'), encrypt('100003'), encrypt('Mr Tan Kah Wai')],
    );

    const parentSarah = await client.query(
      `INSERT INTO users (telegram_user_id, telegram_user_id_hash, chat_id, role, display_name, pdpa_consent_at)
       VALUES ($1, $2, $3, 'parent', $4, NOW())
       RETURNING id`,
      [encrypt('100002'), hashId('100002'), encrypt('100002'), encrypt('Sarah Tan')],
    );

    const teacherLimId = teacherLim.rows[0].id;
    const teacherTanId = teacherTan.rows[0].id;
    const parentSarahId = parentSarah.rows[0].id;

    // === Students ===
    const weiMing = await client.query(
      `INSERT INTO students (name, grade) VALUES ('Wei Ming', 'Primary 5') RETURNING id`,
    );
    const jiaHui = await client.query(
      `INSERT INTO students (name, grade) VALUES ('Jia Hui', 'Primary 3') RETURNING id`,
    );

    const weiMingId = weiMing.rows[0].id;
    const jiaHuiId = jiaHui.rows[0].id;

    // === Teacher-Student Mappings ===
    await client.query(
      `INSERT INTO teacher_student_mappings (teacher_user_id, student_id) VALUES ($1, $2)`,
      [teacherLimId, weiMingId],
    );
    await client.query(
      `INSERT INTO teacher_student_mappings (teacher_user_id, student_id) VALUES ($1, $2)`,
      [teacherTanId, jiaHuiId],
    );

    // === Parent-Student Mappings ===
    await client.query(
      `INSERT INTO parent_student_mappings (parent_user_id, student_id) VALUES ($1, $2)`,
      [parentSarahId, weiMingId],
    );
    await client.query(
      `INSERT INTO parent_student_mappings (parent_user_id, student_id) VALUES ($1, $2)`,
      [parentSarahId, jiaHuiId],
    );

    // === Dashboard Superadmin ===
    const passwordHash = await bcrypt.hash('changeme123', 12);
    await client.query(
      `INSERT INTO dashboard_users (email, password_hash, role, display_name)
       VALUES ('admin@conduit.dev', $1, 'superadmin', 'Conduit Admin')`,
      [passwordHash],
    );

    await client.query('COMMIT');

    console.log('✓ Seed complete!');
    console.log(`  Teachers: Ms Lim (id=${teacherLimId}), Mr Tan (id=${teacherTanId})`);
    console.log(`  Parent: Sarah Tan (id=${parentSarahId})`);
    console.log(`  Students: Wei Ming (id=${weiMingId}) → Ms Lim, Jia Hui (id=${jiaHuiId}) → Mr Tan`);
    console.log(`  Dashboard: admin@conduit.dev / changeme123 (superadmin)`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
