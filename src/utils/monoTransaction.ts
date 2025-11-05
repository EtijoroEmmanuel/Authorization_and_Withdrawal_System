import mongoose from "mongoose";

export async function withMongoTransaction<T>(
  callback: (session: mongoose.ClientSession) => Promise<T>
): Promise<T> {
  const session = await mongoose.startSession();

  try {
    const result = await session.withTransaction(
      async () => await callback(session),
      {
        readPreference: "primary",
        writeConcern: { w: "majority" },
        readConcern: { level: "majority" },
      }
    );

    return result!;
  } finally {
    await session.endSession();
  }
}
