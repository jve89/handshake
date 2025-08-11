import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import authMiddleware, { AuthenticatedRequest } from '../middleware/authMiddleware';
import { db } from '../db/client';

const stripeKey = process.env.STRIPE_SECRET_KEY || '';
const priceId = process.env.STRIPE_PRICE_ID || '';

const stripe = new Stripe(stripeKey);

const router = Router();

/**
 * POST /api/billing/create-checkout-session
 * Auth required. Returns { url } for Stripe Checkout.
 */
router.post('/create-checkout-session', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!stripeKey || !priceId) {
      return res.status(500).json({ error: 'stripe_not_configured' });
    }

    const userId = req.user!.id;

    // Ensure we have (or create) a Stripe Customer
    const userRow = await db.query<{
      id: number;
      email: string;
      stripe_customer_id: string | null;
    }>('SELECT id, email, stripe_customer_id FROM users WHERE id = $1', [userId]);

    if (userRow.rowCount === 0) return res.status(401).json({ error: 'user_not_found' });

    const user = userRow.rows[0];

    let customerId = user.stripe_customer_id || null;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: String(userId) },
      });
      customerId = customer.id;
      await db.query(
        'UPDATE users SET stripe_customer_id = $1 WHERE id = $2',
        [customerId, userId],
      );
    }

    // Build return URLs using Origin header (fallback to relative)
    const origin = (req.headers.origin as string) || '';
    const successUrl = origin ? `${origin}/dashboard/handshakes?billing=success` : '/dashboard/handshakes?billing=success';
    const cancelUrl = origin ? `${origin}/dashboard/handshakes?billing=cancel` : '/dashboard/handshakes?billing=cancel';

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: String(userId),
    });

    return res.json({ url: session.url });
  } catch (err) {
    console.error('create-checkout-session error', err);
    return res.status(500).json({ error: 'internal_error' });
  }
});

/**
 * Webhook handler (mounted with express.raw in index.ts)
 * Exported separately to keep raw-body route un-authenticated & isolated.
 */
export async function billingWebhook(req: Request, res: Response) {
  const sig = req.headers['stripe-signature'] as string | undefined;
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

  if (!sig || !whSecret) {
    return res.status(400).send('missing_signature_or_secret');
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body as Buffer, sig, whSecret);
  } catch (err) {
    console.error('Webhook signature verification failed', err);
    return res.status(400).send('bad_signature');
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string | null;
        const subscriptionId = session.subscription as string | null;
        const refId = session.client_reference_id;

        // Update by customer_id or user id, whichever is available
        if (customerId) {
          await db.query(
            `UPDATE users
             SET stripe_customer_id = COALESCE(stripe_customer_id, $1),
                 stripe_subscription_id = COALESCE($2, stripe_subscription_id),
                 subscription_status = 'active'
             WHERE stripe_customer_id = $1
                OR id = COALESCE($3::int, id)`,
            [customerId, subscriptionId, refId ?? null],
          );
        } else if (refId) {
          await db.query(
            `UPDATE users
             SET stripe_subscription_id = COALESCE($1, stripe_subscription_id),
                 subscription_status = 'active'
             WHERE id = $2::int`,
            [subscriptionId, refId],
          );
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        const status = normalizeStripeStatus(sub.status);

        await db.query(
          `UPDATE users
           SET stripe_subscription_id = $1,
               subscription_status = $2
           WHERE stripe_customer_id = $3`,
          [sub.id, status, customerId],
        );
        break;
      }

      default:
        // no-op for other events
        break;
    }

    return res.status(200).send('ok');
  } catch (err) {
    console.error('Webhook handler error', err);
    return res.status(500).send('webhook_error');
  }
}

function normalizeStripeStatus(s: Stripe.Subscription.Status | string): string {
  // Minimal mapping for MVP
  if (s === 'active' || s === 'trialing') return 'active';
  if (s === 'past_due' || s === 'unpaid' || s === 'incomplete') return 'past_due';
  // canceled, incomplete_expired, etc.
  return 'canceled';
}

export default router;
