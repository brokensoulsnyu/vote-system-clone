import { NextApiRequest, NextApiResponse } from "next";
import db from "../../utils/mongodb";
import { voteOptions } from "../../VoteeData";

const CACHE_TTL = 15 * 60 * 1000; // 15 minutes in milliseconds
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cachedResults: any = null;
let lastCacheTime: number = 0;

// Define collection once, outside the handler
const resultsCollection = db.collection("results");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const currentTime = Date.now();

    // Check if cache is valid
    if (cachedResults && currentTime - lastCacheTime < CACHE_TTL) {
      return res.status(200).json(cachedResults);
    }

    const results = await resultsCollection.find({}).toArray();

    // Create a map of all possible options initialized to zero
    const resultsMap = new Map(voteOptions.map((option) => [option.name, 0]));

    // Update counts from actual results
    results.forEach((result) => {
      if (resultsMap.has(result.option)) {
        resultsMap.set(result.option, result.count);
      }
    });

    // Convert map back to array format
    const formattedResults = Array.from(resultsMap, ([option, count]) => ({
      option,
      count,
    }));

    // Update cache
    cachedResults = formattedResults;
    lastCacheTime = currentTime;

    return res.status(200).json(formattedResults);
  } catch (error) {
    console.error("Error fetching results:", error);
    return res.status(500).json({ message: "Error fetching results" });
  }
}

// import { NextApiRequest, NextApiResponse } from "next";
// import clientPromise from "../../utils/mongodb";
// import { voteOptions } from "../../VoteeData";

// const CACHE_TTL = 15 * 60 * 1000; // 5 minutes in milliseconds
// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// let cachedResults: any = null;
// let lastCacheTime: number = 0;

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   if (req.method !== "GET") {
//     return res.status(405).json({ message: "Method not allowed" });
//   }

//   try {
//     const currentTime = Date.now();

//     // Check if cache is valid
//     if (cachedResults && currentTime - lastCacheTime < CACHE_TTL) {
//       return res.status(200).json(cachedResults);
//     }

//     const client = await clientPromise;
//     const db = client.db("voting-system");

//     const results = await db.collection("results").find({}).toArray();

//     // Create a map of all possible options initialized to zero
//     const resultsMap = new Map(voteOptions.map((option) => [option.name, 0]));

//     // Update counts from actual results
//     results.forEach((result) => {
//       if (resultsMap.has(result.option)) {
//         resultsMap.set(result.option, result.count);
//       }
//     });

//     // Convert map back to array format
//     const formattedResults = Array.from(resultsMap, ([option, count]) => ({
//       option,
//       count,
//     }));

//     // Update cache
//     cachedResults = formattedResults;
//     lastCacheTime = currentTime;

//     return res.status(200).json(formattedResults);
//   } catch (error) {
//     console.error("Error fetching results:", error);
//     return res.status(500).json({ message: "Error fetching results" });
//   }
// }
