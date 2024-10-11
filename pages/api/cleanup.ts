import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../utils/mongodb';
import { cleanupExpiredSessions } from '../../utils/cleanup';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const client = await clientPromise;
    const db = client.db('voting-system');

    await cleanupExpiredSessions(db);

    return res.status(200).json({ message: 'Cleanup completed successfully' });
  } catch (error) {
    console.error('Cleanup error:', error);
    return res.status(500).json({ message: 'Error during cleanup' });
  }
}