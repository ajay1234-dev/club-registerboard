import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes safely (handles conditional classes and conflicts).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a Firestore timestamp or Date to a human-readable string.
 */
export function formatDate(
  date: Date | { seconds: number; nanoseconds: number } | string | null
): string {
  if (!date) return "—";
  let d: Date;
  if (typeof date === "string") {
    d = new Date(date);
  } else if ("seconds" in date) {
    d = new Date(date.seconds * 1000);
  } else {
    d = date as Date;
  }
  return d.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Normalise an email address: trim and lowercase.
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Truncate text to a given length.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

/**
 * Format a number with locale-appropriate separators (e.g. 1,234).
 */
export function formatNumber(n: number): string {
  return n.toLocaleString("en-IN");
}

/**
 * Returns a percentage string, clamped to [0, 100].
 */
export function formatPercent(value: number, total: number): string {
  if (total === 0) return "0%";
  return `${Math.min(100, Math.round((value / total) * 100))}%`;
}

/**
 * Sleep utility for async flows.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Converts an array of registration objects to a CSV string.
 */
export function toCSV(
  rows: Array<Record<string, string | number | boolean | null>>
): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const csvRows = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const val = String(row[h] ?? "");
          // Escape fields that contain commas, quotes, or newlines
          return val.includes(",") || val.includes('"') || val.includes("\n")
            ? `"${val.replace(/"/g, '""')}"`
            : val;
        })
        .join(",")
    ),
  ];
  return csvRows.join("\n");
}
