import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { buffer } from 'micro';

import {
  AIRTABLE_API_KEY,
  AIRTABLE_APP_ID,
  STRIPE_API_KEY,
  STRIPE_WEBHOOK_SECRET,
} from '../../config';

const stripe = new Stripe(STRIPE_API_KEY, {
  apiVersion: '2022-08-01',
});

export const config = {
  api: {
    bodyParser: false,
  },
};

async function insertToAirtable({
  name,
  message,
  amount,
}: {
  name: string;
  message: string;
  amount: number;
}) {
  const url = `https://api.airtable.com/v0/${AIRTABLE_APP_ID}/donations`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      records: [
        {
          fields: {
            name,
            message,
            amount,
          },
        },
      ],
    }),
  });

  return response.json();
}

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

  const amount =
    (event.data.object as { amount_total: number }).amount_total / 100;

  await insertToAirtable({ ...metadata, amount });

  return res.status(200).json({ message: 'Success' });
}

export default handler;
