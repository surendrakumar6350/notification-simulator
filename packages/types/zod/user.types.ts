import { z } from "zod";

export const feedbackSchema = z.object({
    category: z.string().min(1, "Category is required").max(100, "Category is too long"),
    message: z.string().min(1, "Message is required").max(1000, "Message is too long"),
    rating: z.number().min(1).max(5),
});

export const mobileSchema = z
    .string()
    .trim()
    .regex(/^\d{10}$/, "Invalid mobile number. It must be exactly 10 digits.");

export const mobileProtectionSchema = z.object({
    mobileNumber: z.string().min(10, "Mobile number is required"),
    message: z.string().min(1, "Message is required").max(500, "Message cannot exceed 500 characters"),
    screenshot: z.string().optional(),
});
