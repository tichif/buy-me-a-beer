import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { buffer } from 'micro';

import { STRIPE_API_KEY, STRIPE_WEBHOOK_SECRET } from '../../config';

const stripe = new Stripe(STRIPE_API_KEY, {
  apiVersion: '2022-08-01',
});

export const config = {
  api: {
    bodyParser: false,
  },
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const signature = req.headers['stripe-signature'] as string;

  if (!signature) {
    return res.status(400).json({ message: 'Missing signature' });
  }

  let event: Stripe.Event;

  const buff = await buffer(req);

  try {
    event = stripe.webhooks.constructEvent(
      buff,
      signature,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Invalid signature' });
  }

  if (event.type !== 'checkout.session.completed') {
    return res.status(400).json({ message: 'Invalid event type' });
  }

  const metadata = (
    event.data.object as { metadata: { name: string; message: string } }
  ).metadata;

  console.log(metadata);

  return res.status(200).json({ message: 'Success' });
}

export default handler;
