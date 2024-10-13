import { NextApiRequest, NextApiResponse } from "next";
import db from "../../utils/mongodb"; // Assuming this is your DB connection

const sessionsCollection = db.collection("sessions");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.cookies.voteToken;
  
  if (!token) {
    return res.status(200).json({ hasVoted: false });
  }

  try {
    const session = await sessionsCollection.findOne({ token });
    if (session && session.expiresAt > new Date()) {
      return res.status(200).json({ hasVoted: true });
    } else {
      return res.status(200).json({ hasVoted: false });
    }
  } catch (err) {
    console.error("Error checking vote session:", err);
    return res.status(500).json({ message: "Error checking vote session" });
  }
}
