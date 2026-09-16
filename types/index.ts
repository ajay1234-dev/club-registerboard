// ============================================================
// ALL APPLICATION TYPES
// ============================================================

// --- Firestore Document Types ---

export interface Club {
  id: string;
  name: string;
  logoUrl: string;
  description: string;
  registrationCount: number;
  displayOrder: number;
  active: boolean;
  createdAt: Date | FirestoreTimestamp;
  updatedAt: Date | FirestoreTimestamp;
}

export interface Registration {
  id: string;
  name: string;
  email: string;
  phone: string;
  normalizedEmail: string;
  department: string;
  section: string;
  clubId: string;
  clubName: string;
  deviceId: string;
  createdAt: Date | FirestoreTimestamp;
}

export interface DeviceRegistration {
  registrationId: string;
  clubId: string;
  createdAt: Date | FirestoreTimestamp;
}

export interface EmailRegistration {
  registrationId: string;
  clubId: string;
  createdAt: Date | FirestoreTimestamp;
}

export interface EventSettings {
  eventName: string;
  registrationOpen: boolean;
  totalExpectedStudents: number;
  totalRegistrationCount: number;
  departments: DepartmentConfig[];
  sections: SectionConfig[];
  createdAt: Date | FirestoreTimestamp;
  updatedAt: Date | FirestoreTimestamp;
}

export interface DepartmentConfig {
  id: string;
  name: string;
  active: boolean;
  displayOrder: number;
}

export interface SectionConfig {
  id: string;
  name: string;
  active: boolean;
  displayOrder: number;
}

// Firestore server timestamp type
export interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
  toDate(): Date;
}

// --- Leaderboard Types ---

export interface LeaderboardEntry {
  id: string;
  name: string;
  logoUrl: string;
  description: string;
  registrationCount: number;
  displayOrder: number;
  rank: number;
  active: boolean;
}

export interface LeaderboardState {
  entries: LeaderboardEntry[];
  totalRegistrations: number;
  totalExpected: number;
  eventName: string;
  registrationOpen: boolean;
  lastUpdated: Date | null;
}

// --- Registration Form Types ---

export interface RegistrationFormData {
  name: string;
  email: string;
  phone: string;
  department: string;
  section: string;
  clubId: string;
  deviceId: string;
}

export interface RegistrationFormErrors {
  name?: string;
  email?: string;
  department?: string;
  section?: string;
  clubId?: string;
  general?: string;
}

// --- API Response Types ---

export interface ApiResponse<T = null> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export type RegistrationResult = ApiResponse<{
  registrationId: string;
  clubName: string;
  clubLogoUrl: string;
}>;

// --- Auth Types ---

export type UserRole = "admin" | "organizer";

export interface AuthenticatedUser {
  uid: string;
  email: string | null;
  role: UserRole;
}

export interface SessionPayload {
  uid: string;
  email: string | null;
  role: UserRole;
  expiresAt: number;
}

// --- Admin Panel Types ---

export interface AdminRegistration {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  section: string;
  clubId: string;
  clubName: string;
  createdAt: string; // ISO string for serialisation
}

export interface AdminStats {
  totalRegistrations: number;
  totalExpected: number;
  percentFilled: number;
  clubCount: number;
  activeClubCount: number;
  registrationOpen: boolean;
  topThree: LeaderboardEntry[];
  lastRegistrationAt: string | null;
}

// --- Club Management Types ---

export interface ClubFormData {
  name: string;
  description: string;
  displayOrder: number;
  active: boolean;
  logoUrl?: string;
}

// Error codes for duplicate rejection
export type RegistrationErrorCode =
  | "REGISTRATION_CLOSED"
  | "DEVICE_ALREADY_REGISTERED"
  | "EMAIL_ALREADY_REGISTERED"
  | "PHONE_ALREADY_REGISTERED"
  | "CLUB_NOT_FOUND"
  | "CLUB_INACTIVE"
  | "VALIDATION_ERROR"
  | "TRANSACTION_FAILED"
  | "INTERNAL_ERROR";
