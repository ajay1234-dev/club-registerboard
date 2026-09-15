import { z } from "zod";

// ── Registration Schema ───────────────────────────────────────────────────────

export const registrationSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be under 100 characters")
    .regex(/^[a-zA-Z\s.'-]+$/, "Name can only contain letters, spaces, and basic punctuation")
    .transform((v) => v.trim()),

  email: z
    .string()
    .email("Please enter a valid email address")
    .max(254, "Email address is too long")
    .transform((v) => v.trim().toLowerCase()),

  phone: z
    .string()
    .regex(/^\d{10}$/, "Please enter a valid 10-digit phone number")
    .transform((v) => v.trim()),

  department: z
    .string()
    .min(1, "Please select your department")
    .max(100, "Department name is too long"),

  section: z
    .string()
    .min(1, "Please select your section")
    .max(20, "Section name is too long"),

  clubId: z
    .string()
    .min(1, "Please select a club")
    .max(100, "Invalid club ID"),

  deviceId: z
    .string()
    .uuid("Invalid device ID format")
    .min(36, "Invalid device ID"),
});

export type ValidatedRegistration = z.infer<typeof registrationSchema>;

// ── Login Schema ──────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  idToken: z.string().min(1, "ID token is required"),
});

// ── Club Schema ───────────────────────────────────────────────────────────────

export const clubSchema = z.object({
  name: z
    .string()
    .min(2, "Club name must be at least 2 characters")
    .max(80, "Club name must be under 80 characters")
    .transform((v) => v.trim()),

  description: z
    .string()
    .max(500, "Description must be under 500 characters")
    .transform((v) => v.trim()),

  displayOrder: z
    .number()
    .int("Display order must be an integer")
    .min(0, "Display order must be non-negative")
    .max(100, "Display order must be under 100"),

  active: z.boolean(),
});

// ── Department / Section Schema ───────────────────────────────────────────────

export const departmentSchema = z.object({
  name: z
    .string()
    .min(1, "Department name is required")
    .max(100, "Department name too long")
    .transform((v) => v.trim()),
  active: z.boolean().optional().default(true),
  displayOrder: z.number().int().min(0).max(999).optional().default(0),
});

export const sectionSchema = z.object({
  name: z
    .string()
    .min(1, "Section name is required")
    .max(20, "Section name too long")
    .transform((v) => v.trim()),
  active: z.boolean().optional().default(true),
  displayOrder: z.number().int().min(0).max(999).optional().default(0),
});

// ── Settings Schema ───────────────────────────────────────────────────────────

export const eventSettingsSchema = z.object({
  eventName: z
    .string()
    .min(2)
    .max(200)
    .optional()
    .transform((v) => v?.trim()),
  registrationOpen: z.boolean().optional(),
  totalExpectedStudents: z.number().int().min(1).max(10000).optional(),
});
