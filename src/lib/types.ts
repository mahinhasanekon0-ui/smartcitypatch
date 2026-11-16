export type Role = 'donor' | 'receiver' | 'admin';

export type UserProfile = {
  name: string;
  email: string;
  role: Role;
  phone: string | null;
  profileImage: string | null;
  createdAt: string | null;
};

export const REPORT_STATUSES = ['pending', 'in-progress', 'resolved'] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

export const REPORT_CATEGORIES = [
  'Medical Emergency',
  'Accident',
  'Fire',
  'Crime / Safety',
  'Road Damage',
  'Water / Sanitation',
  'Electricity',
  'Other',
] as const;

export type Report = {
  id: string;
  userId: string;
  userName: string;
  description: string;
  category: string;
  status: ReportStatus;
  createdAt: string;
  fileUrl: string | null;
  location: { lat: number; lng: number } | null;
};

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
export type BloodGroup = (typeof BLOOD_GROUPS)[number];

export type Donor = {
  id: string;
  userId: string;
  name: string;
  bloodGroup: BloodGroup;
  phone: string;
  availability: boolean;
  locationName?: string;
  updatedAt: string;
};
