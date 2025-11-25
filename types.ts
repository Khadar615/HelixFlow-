export type UserRole = 'COORDINATOR' | 'HOD' | 'PRINCIPAL' | 'ADMIN';

export type ApprovalStatus = 'PENDING_HOD' | 'PENDING_PRINCIPAL' | 'PENDING_ADMIN' | 'APPROVED' | 'REJECTED' | 'COMPLETED';

export interface Venue {
  id: string;
  name: string;
  capacity: number;
  features: string[];
  image: string;
}

export interface EventReport {
  attendance: number;
  summary: string;
  photos: string[]; // URLs
  submittedAt: string;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'NEEDS_REVISION';
}

export interface Event {
  id: string;
  title: string;
  organizer: string;
  department: string;
  venueId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  description: string;
  status: ApprovalStatus;
  report?: EventReport;
}

export interface DashboardStats {
  totalEvents: number;
  pendingApprovals: number;
  venueUtilization: number;
  complianceRate: number;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  read: boolean;
  createdAt: string;
}