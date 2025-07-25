import mongoose from "mongoose";

const mobileProtectionRequestSchema = new mongoose.Schema({
    mobileNumber: String,
    message: String,
    screenshot: String,
}, { timestamps: true });

export const MobileProtectionRequest = mongoose.models.MobileProtectionRequest ||
    mongoose.model("MobileProtectionRequest", mobileProtectionRequestSchema);