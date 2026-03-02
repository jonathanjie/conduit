import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth.js';

// ─── Phase 2 Stub: AI Routes ──────────────────────────────────────────────────
// These endpoints will be implemented in Phase 2 (AI-assisted communication).
// They are stubbed here to allow frontend integration work to proceed.

export const aiRoutes = new Hono();

aiRoutes.use('/ai/*', requireAuth);

aiRoutes.get('/ai/suggestions', (c) => {
  return c.json({ status: 'coming_soon', phase: 2, feature: 'AI message suggestions' });
});

aiRoutes.post('/ai/suggestions', (c) => {
  return c.json({ status: 'coming_soon', phase: 2, feature: 'AI message suggestions' });
});

aiRoutes.get('/ai/summaries', (c) => {
  return c.json({ status: 'coming_soon', phase: 2, feature: 'AI conversation summaries' });
});

aiRoutes.post('/ai/translate', (c) => {
  return c.json({ status: 'coming_soon', phase: 2, feature: 'AI translation' });
});
