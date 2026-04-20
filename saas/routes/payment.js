const express = require('express');
const db = require('../db/database');
const { authMiddleware } = require('./middleware');

const router = express.Router();

const CREDIT_PLANS = [
  { id: 'plan_50',  credits: 50,  amount_cents: 1900, label: '50 listings — $19' },
  { id: 'plan_100', credits: 100, amount_cents: 3500, label: '100 listings — $35' },
  { id: 'plan_250', credits: 250, amount_cents: 7900, label: '250 listings — $79' }
];

router.get('/plans', (req, res) => res.json(CREDIT_PLANS));

router.post('/checkout', authMiddleware, async (req, res) => {
  const { plan_id } = req.body;
  const plan = CREDIT_PLANS.find(p => p.id === plan_id);
  if (!plan) return res.status(400).json({ error: 'Invalid plan' });

  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const user = db.prepare('SELECT email FROM users WHERE id = ?').get(req.userId);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    customer_email: user.email,
    line_items: [{
      price_data: {
        currency: 'usd',
        unit_amount: plan.amount_cents,
        product_data: { name: `eBay Listing Credits — ${plan.credits} listings` }
      },
      quantity: 1
    }],
    mode: 'payment',
    success_url: `${process.env.APP_URL}/dashboard.html?payment=success`,
    cancel_url: `${process.env.APP_URL}/dashboard.html?payment=cancelled`,
    metadata: { user_id: String(req.userId), plan_id, credits: String(plan.credits) }
  });

  db.prepare('INSERT INTO payments (user_id, stripe_session_id, credits, amount_cents) VALUES (?,?,?,?)')
    .run(req.userId, session.id, plan.credits, plan.amount_cents);

  res.json({ url: session.url });
});

// Stripe webhook — called by Stripe when payment completes
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return res.status(400).send('Webhook signature failed');
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = parseInt(session.metadata.user_id);
    const credits = parseInt(session.metadata.credits);

    db.prepare('UPDATE users SET credits = credits + ? WHERE id = ?').run(credits, userId);
    db.prepare('UPDATE payments SET status = ? WHERE stripe_session_id = ?').run('paid', session.id);
  }

  res.json({ received: true });
});

router.get('/credits', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT credits FROM users WHERE id = ?').get(req.userId);
  res.json({ credits: user.credits });
});

module.exports = router;
