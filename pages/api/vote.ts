import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../utils/mongodb';
import { generateToken } from '../../utils/token';
import { hashIP } from '../../utils/ip';
import { SessionToken, Vote, VoteCount } from '../../types/database';
import { Collection } from 'mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { option } = req.body;
  const token = req.cookies.voteToken;
  
  // Get IP address - in production, ensure your proxy setup is correct
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const ipHash = hashIP(ip as string);

  try {
    const client = await clientPromise;
    const db = client.db('voting-system');
    const sessionsCollection = db.collection<SessionToken>('sessions');
    const votesCollection = db.collection<Vote>('votes');
    const resultsCollection = db.collection<VoteCount>('results');

    let sessionToken: string;
    let isNewSession = false;

    // Check existing session
    if (token) {
      const existingSession = await sessionsCollection.findOne({
        token,
        expiresAt: { $gt: new Date() }
      });

      if (existingSession) {
        sessionToken = existingSession.token;
      } else {
        // Token expired or invalid, create new one
        sessionToken = await createNewSession(sessionsCollection, ipHash);
        isNewSession = true;
        setTokenCookie(res, sessionToken);
      }
    } else {
      // No token, create new session
      sessionToken = await createNewSession(sessionsCollection, ipHash);
      isNewSession = true;
      setTokenCookie(res, sessionToken);
    }

    // Check if IP has voted within the cooldown period
    const recentIPVote = await votesCollection.findOne({
      ipHash,
      votedAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) } // 24 hour cooldown
    });

    if (recentIPVote) {
      return res.status(400).json({
        message: 'A vote has already been cast from this location recently. Please try again later.',
        cooldownRemaining: Math.ceil((recentIPVote.votedAt.getTime() + 24 * 60 * 60 * 1000 - Date.now()) / (60 * 1000)) // minutes
      });
    }

    // Check if session has already voted
    const existingVote = await votesCollection.findOne({
      sessionToken
    });

    if (existingVote) {
      return res.status(400).json({ message: 'You have already voted with this session.' });
    }

    // Record the vote
    await votesCollection.insertOne({
      sessionToken,
      ipHash,
      option,
      votedAt: new Date()
    });

    // Update vote counts
    await resultsCollection.updateOne(
      { option },
      { $inc: { count: 1 } },
      { upsert: true }
    );

    return res.status(200).json({
      message: 'Vote recorded successfully',
      isNewSession
    });
  } catch (error) {
    console.error('Voting error:', error);
    return res.status(500).json({ message: 'Error recording vote' });
  }
}

async function createNewSession(
  sessionsCollection: Collection<SessionToken>,
  ipHash: string
): Promise<string> {
  const token = generateToken();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days

  await sessionsCollection.insertOne({
    token,
    ipHash,
    createdAt: now,
    expiresAt
  });

  return token;
}

function setTokenCookie(res: NextApiResponse, token: string) {
  res.setHeader(
    'Set-Cookie',
    `voteToken=${token}; Path=/; HttpOnly; Max-Age=${3 * 24 * 60 * 60}; SameSite=Strict`
  );
}
