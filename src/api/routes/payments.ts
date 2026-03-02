import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth.js';

// ─── Phase 3 Stub: Payment Routes ─────────────────────────────────────────────
// These endpoints will be implemented in Phase 3 (Stripe payments + invoicing).
// They are stubbed here to allow frontend integration work to proceed.

export const paymentRoutes = new Hono();

paymentRoutes.use('/payments/*', requireAuth);
paymentRoutes.use('/invoices/*', requireAuth);

paymentRoutes.get('/payments/config', (c) => {
  return c.json({ status: 'coming_soon', phase: 3, feature: 'Payment configuration' });
});

paymentRoutes.get('/invoices', (c) => {
  return c.json({ status: 'coming_soon', phase: 3, feature: 'Invoice list' });
});

paymentRoutes.post('/invoices', (c) => {
  return c.json({ status: 'coming_soon', phase: 3, feature: 'Create invoice' });
});

paymentRoutes.get('/invoices/:id', (c) => {
  return c.json({ status: 'coming_soon', phase: 3, feature: 'Invoice detail' });
});

paymentRoutes.post('/invoices/:id/send', (c) => {
  return c.json({ status: 'coming_soon', phase: 3, feature: 'Send invoice' });
});

paymentRoutes.post('/payments/webhook', (c) => {
  return c.json({ status: 'coming_soon', phase: 3, feature: 'Stripe webhook handler' });
});
