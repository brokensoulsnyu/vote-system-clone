import { Db } from "mongodb";

export async function cleanupExpiredSessions(db: Db) {
  const startTime = Date.now();
  try {
    const sessionsCollection = db.collection("sessions");

    const result = await sessionsCollection.deleteMany({
      expiresAt: { $lt: new Date() },
    });

    const duration = Date.now() - startTime;
    console.log(
      `Cleaned up ${result.deletedCount} expired sessions in ${duration}ms`
    );

    return result.deletedCount;
  } catch (error) {
    console.error("Error cleaning up expired sessions:", error);
    throw error; // Rethrow to handle it in the calling function
  }
}
