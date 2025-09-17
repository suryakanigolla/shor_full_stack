// Shared enums and constants for the MVP schema

export const userTypes = ["student", "artist", "studio_owner", "admin"] as const;
export const classLevels = ["beginner", "intermediate", "advanced", "all"] as const;
export const danceForms = [
  "contemporary", "hip-hop", "ballet", "jazz", "kathak", 
  "bharatanatyam", "bollywood", "salsa", "freestyle", "breaking",
  "urban", "classical", "folk", "tango", "bachata", "other"
] as const;

export const classTypes = ["workshop", "regular", "bundle"] as const;
export const bookingStatuses = ["pending", "confirmed", "cancelled", "completed"] as const;
export const gigStatuses = ["open", "closed", "filled", "cancelled"] as const;
export const applicationStatuses = ["applied", "accepted", "rejected"] as const;

export type UserType = typeof userTypes[number];
export type ClassLevel = typeof classLevels[number];
export type DanceForm = typeof danceForms[number];
export type ClassType = typeof classTypes[number];
export type BookingStatus = typeof bookingStatuses[number];
export type GigStatus = typeof gigStatuses[number];
export type ApplicationStatus = typeof applicationStatuses[number];
