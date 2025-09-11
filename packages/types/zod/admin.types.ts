import { z } from "zod";

export const safePasswordSchema = z.string()
    .min(1, "Password must be at least 1 characters long")
    .max(100, "Password must be at most 100 characters long");

export const ProtectedNumberSchema = z.object({
    phoneNumber: z.string().min(9).max(15),
    reason: z.string().min(3, "Must be more than 3 letters").max(255, "Reason must be at most 255 characters long")
});

export const mobileNumberSchema = z.string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Invalid mobile number. Must be 10 digits starting with 6-9");

export const paginationSchema = z.object({
    page: z
        .number()
        .int()
        .min(1, { message: "Page must be at least 1" })
        .max(1000, { message: "Page cannot exceed 1000" }),
    limit: z
        .number()
        .int()
        .min(1, { message: "Limit must be at least 1" })
        .max(50, { message: "Limit cannot exceed 50" }),
});


