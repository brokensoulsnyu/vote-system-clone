import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI as string;
if (!uri) {
  throw new Error("Please add your MongoDB Atlas URI to .env.local");
}

const client = new MongoClient(uri);
const dbName = 'voting-system';
const db = client.db(dbName);

async function ensureIndexes() {
  try {
    // Check if the collection exists
    const collections = await db.listCollections({ name: 'sessions' }).toArray();
    if (collections.length === 0) {
      await db.createCollection('sessions');
    }

    // Ensure the index exists
    const indexes = await db.collection("sessions").indexes();
    if (!indexes.some(idx => idx.name === 'expiresAt_1')) {
      await db.collection("sessions").createIndex(
        { expiresAt: 1 },
        { expireAfterSeconds: 3 * 24 * 60 * 60, name: 'expiresAt_1' } // 3 days
      );
    }
  } catch (error) {
    console.error('Error ensuring indexes:', error);
  }
}

// Connect to the database and ensure indexes
client.connect().then(() => {
  console.log('Connected to MongoDB');
  ensureIndexes();
}).catch(err => {
  console.error('Failed to connect to MongoDB', err);
});

export default db;

// import { MongoClient, MongoClientOptions } from "mongodb";

// declare global {
//   // eslint-disable-next-line no-var
//   var _mongoClientPromise: Promise<MongoClient> | undefined;
// }

// const MONGODB_URI = process.env.MONGODB_URI;

// if (!MONGODB_URI) {
//   throw new Error("Please add your MongoDB Atlas URI to .env.local");
// }

// const options: MongoClientOptions = {
//   // Add recommended options for MongoDB Atlas
//   maxPoolSize: 10, // Maintain up to 10 socket connections
//   minPoolSize: 5, // Maintain at least 5 socket connections
//   retryWrites: true,
//   w: "majority", // Write concern
//   connectTimeoutMS: 30000, // How long to wait for a connection
// };

// let client: MongoClient;
// let clientPromise: Promise<MongoClient>;

// if (process.env.NODE_ENV === "development") {
//   const globalWithMongo = global as typeof globalThis & {
//     _mongoClientPromise?: Promise<MongoClient>;
//   };

//   if (!globalWithMongo._mongoClientPromise) {
//     client = new MongoClient(MONGODB_URI, options);
//     globalWithMongo._mongoClientPromise = client.connect();
//   }
//   clientPromise = globalWithMongo._mongoClientPromise;
// } else {
//   client = new MongoClient(MONGODB_URI, options);
//   clientPromise = client.connect();
// }

// export default clientPromise;

// // Add a new utility function for graceful shutdown
// export async function closeMongoConnection() {
//   try {
//     await client.close();
//     console.log("MongoDB connection closed.");
//   } catch (error) {
//     console.error("Error closing MongoDB connection:", error);
//   }
// }
