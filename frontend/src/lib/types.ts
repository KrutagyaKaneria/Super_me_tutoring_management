export type Role = 'admin' | 'coordinator' | 'tutor' | 'student' | 'parent';

export type SessionStatus = 'scheduled' | 'in_progress' | 'pending_approval' | 'approved' | 'rejected' | 'cancelled';
export type ApprovalStatus = 'pending_approval' | 'approved' | 'rejected';
export type UserStatus = 'active' | 'inactive' | 'on-hold';
export type PaymentStatus = 'paid' | 'pending' | 'overdue';
export type BadgeVariant = 'green' | 'amber' | 'blue' | 'red' | 'gray' | 'purple';

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
}

export interface StatsCardData {
  label: string;
  value: string | number;
  subText?: string;
  highlight?: boolean;
}

export interface User {
  id: string;
  name: string;
  role: Role;
  email?: string;
  phone?: string;
  joined: string;
  status: UserStatus;
}

export interface Tutor {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  subjects: string[];
  languages: string;
  rating: number;
  slots: string[];
  students: number;
  sessions: number;
}

export interface Student {
  id: string;
  name: string;
  grade: number;
  initials: string;
  avatarColor: string;
  subject: string;
  hoursCompleted: number;
  targetHours: number;
}

export interface Session {
  id: string;
  date: string;
  time?: string;
  tutor: string;
  student: string;
  subject: string;
  grade?: number;
  duration?: string;
  meetLink?: string;
  status: SessionStatus | ApprovalStatus;
}

export interface AttendanceClaim {
  id: string;
  tutor: string;
  student: string;
  date: string;
  startTime: string;
  endTime: string;
  claimedDuration: string;
  status: ApprovalStatus;
}

export interface MarksEntry {
  id: string;
  student: string;
  exam: string;
  subject: string;
  marks: number | null;
  total: number;
  grade?: string;
  date?: string;
}

export interface EarningsEntry {
  name: string;
  hours: number;
  rate: number;
  earned: number;
}

export interface GradeRate {
  gradeBand: string;
  rate: number;
}

export interface Notification {
  id: string;
  session: string;
  recipients: string;
  time: string;
  channel: string;
  status: 'sent' | 'queued' | 'failed';
}

export interface FeeEntry {
  month: string;
  hours: string;
  rate: string;
  amount: string;
  status: PaymentStatus;
}

export interface PlatformMetric {
  metric: string;
  thisMonth: string;
  lastMonth: string;
  trend: string;
}

export interface FeeCollectionEntry {
  month: string;
  invoiced: string;
  collected: string;
  pending: string;
}
