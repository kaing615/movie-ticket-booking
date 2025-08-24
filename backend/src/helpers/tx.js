import mongoose from "mongoose";

export async function withOptionalTransaction(task) {
  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
    const result = await task(session);
    await session.commitTransaction();
    return result;
  } catch (err) {
    if (session) {
      try { await session.abortTransaction(); } catch {}
    }
    const msg = String(err?.message || "");
    if (err?.code === 20 || msg.includes("Transaction numbers are only allowed")) {
      return task(null);                      
    }
    throw err;
  } finally {
    if (session) session.endSession();
  }
}
