import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    level: { type: String, required: true },
    message: { type: String, required: true }
});

export const Log = mongoose.models.Log || mongoose.model("Log", logSchema);
