import type { NextApiRequest, NextApiResponse } from 'next';

import { AIRTABLE_API_KEY, AIRTABLE_APP_ID } from '../../config';
import { AirtableRecord } from '../../types';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const response = await fetch(
    `https://api.airtable.com/v0/${AIRTABLE_APP_ID}/donations?maxRecords=3&view=Grid%20view`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      },
    }
  );

  const data = (await response.json()) as AirtableRecord;

  return res.status(200).json(data.records);
}

export default handler;
