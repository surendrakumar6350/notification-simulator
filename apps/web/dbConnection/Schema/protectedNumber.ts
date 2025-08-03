import mongoose from "mongoose";

const protectedNumberChangeSchema = new mongoose.Schema({
    phoneNumber: {
        type: String,
        required: true,
    },
    reason: {
        type: String,
        default: 'No reason provided',
    },
    changedBy: {
        type: String,
        required: true,
        default: 'admin',
    },
    timestamp: {
        type: Date,
        default: Date.now,
    }
});

export const ProtectedNumber =
    mongoose.models.ProtectedNumber ||
    mongoose.model("ProtectedNumber", protectedNumberChangeSchema);