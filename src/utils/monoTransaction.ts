import mongoose from "mongoose";

export async function withMongoTransaction<T>(
  callback: (session: mongoose.ClientSession) => Promise<T>
): Promise<T> {
  const session = await mongoose.startSession();

  try {
    let result: T | null = null;

    await session.withTransaction(
      async () => {
        result = await callback(session);
      },
      {
        readPreference: "primary",
        writeConcern: { w: "majority" },
        readConcern: { level: "majority" },
      }
    );

    if (result === null) {
      throw new Error("Transaction did not return a result");
    }

    return result;
  } finally {
    await session.endSession();
  }
}
