import mongoose from "mongoose";

export async function withMongoTransaction<T>(
  callback: (session: mongoose.ClientSession) => Promise<T>
): Promise<T> {
  const session = await mongoose.startSession();
  let result: T | undefined = undefined;

  try {
    await session.withTransaction(async () => {
      result = await callback(session);
    });

    if (result === undefined) {
      throw new Error("Transaction did not return a result");
    }

    return result;
  } catch (error) {
    throw error;
  } finally {
    session.endSession();
  }
}
