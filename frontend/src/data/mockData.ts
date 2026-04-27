import type {
  AttendanceClaim,
  EarningsEntry,
  FeeCollectionEntry,
  FeeEntry,
  MarksEntry,
  Notification,
  PlatformMetric,
  Session,
  Student,
  Tutor,
  User,
} from '@/lib/types';

// ── Users ──────────────────────────────────────────
export const mockUsers: User[] = [
  { id: '1', name: 'Priya Ramesh', role: 'tutor', joined: 'Jan 2024', status: 'active' },
  { id: '2', name: 'Rahul Kumar', role: 'tutor', joined: 'Feb 2024', status: 'active' },
  { id: '3', name: 'Meena Suresh', role: 'tutor', joined: 'Jan 2024', status: 'active' },
  { id: '4', name: 'Anil Joseph', role: 'tutor', joined: 'Mar 2024', status: 'active' },
  { id: '5', name: 'Arjun Menon', role: 'student', joined: 'Feb 2024', status: 'active' },
  { id: '6', name: 'Sneha Thomas', role: 'student', joined: 'Mar 2024', status: 'active' },
  { id: '7', name: 'Fatima Ali', role: 'student', joined: 'Feb 2024', status: 'active' },
  { id: '8', name: 'Rohit Pillai', role: 'student', joined: 'Apr 2024', status: 'active' },
  { id: '9', name: 'Divya Nair', role: 'student', joined: 'Jan 2024', status: 'active' },
];

// ── Tutors ──────────────────────────────────────────
export const mockTutors: Tutor[] = [
  {
    id: '1', name: 'Priya Ramesh', initials: 'PR', avatarColor: 'bg-blue-100 text-blue-700',
    subjects: ['Maths', 'Chemistry'], languages: 'Malayalam, English', rating: 4.8,
    slots: ['Mon 9–11', 'Wed 2–4', 'Fri 3–5'], students: 6, sessions: 52,
  },
  {
    id: '2', name: 'Rahul Kumar', initials: 'RK', avatarColor: 'bg-purple-100 text-purple-700',
    subjects: ['Physics', 'Maths'], languages: 'Malayalam, Hindi', rating: 4.5,
    slots: ['Tue 10–12', 'Thu 9–11', 'Sat 2–4'], students: 4, sessions: 38,
  },
  {
    id: '3', name: 'Meena Suresh', initials: 'MS', avatarColor: 'bg-emerald-100 text-emerald-700',
    subjects: ['English', 'Social Studies'], languages: 'Malayalam, English, Tamil', rating: 4.9,
    slots: ['Mon 2–4', 'Wed 9–11', 'Fri 9–11'], students: 7, sessions: 64,
  },
  {
    id: '4', name: 'Anil Joseph', initials: 'AJ', avatarColor: 'bg-amber-100 text-amber-700',
    subjects: ['Biology', 'Chemistry'], languages: 'Malayalam, English', rating: 4.6,
    slots: ['Tue 2–4', 'Thu 3–5'], students: 3, sessions: 29,
  },
];

// ── Students (Tutor's "My Students") ──────────────
export const mockStudents: Student[] = [
  { id: '1', name: 'Arjun Menon', grade: 8, initials: 'AM', avatarColor: 'bg-blue-100 text-blue-700', subject: 'Maths', hoursCompleted: 12, targetHours: 20 },
  { id: '2', name: 'Rohit Pillai', grade: 9, initials: 'RP', avatarColor: 'bg-rose-100 text-rose-700', subject: 'Chemistry', hoursCompleted: 7, targetHours: 16 },
  { id: '3', name: 'Divya Nair', grade: 12, initials: 'DN', avatarColor: 'bg-emerald-100 text-emerald-700', subject: 'Biology', hoursCompleted: 18, targetHours: 24 },
  { id: '4', name: 'Sneha Thomas', grade: 10, initials: 'ST', avatarColor: 'bg-purple-100 text-purple-700', subject: 'Maths', hoursCompleted: 9, targetHours: 20 },
  { id: '5', name: 'Lakshmi K.', grade: 7, initials: 'LK', avatarColor: 'bg-amber-100 text-amber-700', subject: 'Science', hoursCompleted: 14, targetHours: 18 },
];

// ── Coordinator assignment table ──────────────────
export const mockAssignments: Session[] = [
  { id: 'a1', date: '', tutor: 'Priya R.', student: 'Arjun M.', subject: 'Maths', grade: 8, status: 'completed', duration: '12' },
  { id: 'a2', date: '', tutor: 'Rahul K.', student: 'Sneha T.', subject: 'Physics', grade: 10, status: 'completed', duration: '8' },
  { id: 'a3', date: '', tutor: 'Meena S.', student: 'Fatima A.', subject: 'English', grade: 6, status: 'completed', duration: '15' },
  { id: 'a4', date: '', tutor: 'Priya R.', student: 'Rohit P.', subject: 'Chemistry', grade: 9, status: 'cancelled', duration: '5' },
  { id: 'a5', date: '', tutor: 'Anil J.', student: 'Divya N.', subject: 'Biology', grade: 12, status: 'completed', duration: '20' },
];

// ── Sessions ──────────────────────────────────────
export const mockUpcomingSessions: Session[] = [
  { id: 's1', date: 'Apr 22, 10:00 AM', tutor: 'Priya R.', student: 'Arjun M.', subject: 'Maths', meetLink: 'meet.google.com/abc-xyz', status: 'scheduled' },
  { id: 's2', date: 'Apr 22, 11:00 AM', tutor: 'Meena S.', student: 'Fatima A.', subject: 'English', meetLink: 'meet.google.com/def-uvw', status: 'scheduled' },
  { id: 's3', date: 'Apr 23, 2:00 PM', tutor: 'Rahul K.', student: 'Sneha T.', subject: 'Physics', meetLink: 'meet.google.com/ghi-rst', status: 'scheduled' },
];

export const mockCompletedSessions: Session[] = [
  { id: 'c1', date: 'Apr 20', tutor: 'Priya R.', student: 'Arjun M.', subject: 'Maths', duration: '1h 10m', status: 'completed' },
  { id: 'c2', date: 'Apr 19', tutor: 'Meena S.', student: 'Fatima A.', subject: 'English', duration: '1h 05m', status: 'completed' },
];

// ── Tutor's today's classes ──────────────────────
export const mockTodayClasses: Session[] = [
  { id: 't1', date: 'Today', time: '10:00 AM', tutor: 'You', student: 'Arjun M.', subject: 'Maths', grade: 8, meetLink: 'meet.google.com/abc', status: 'in-progress' },
  { id: 't2', date: 'Today', time: '11:30 AM', tutor: 'You', student: 'Rohit P.', subject: 'Chemistry', grade: 9, meetLink: 'meet.google.com/def', status: 'scheduled' },
];

// ── Attendance Claims ─────────────────────────────
export const mockAttendanceClaims: AttendanceClaim[] = [
  { id: 'ac1', tutor: 'Priya R.', student: 'Arjun M.', date: 'Apr 21', startTime: '10:02 AM', endTime: '11:18 AM', claimedDuration: '1h 16m', status: 'pending' },
  { id: 'ac2', tutor: 'Rahul K.', student: 'Sneha T.', date: 'Apr 21', startTime: '2:05 PM', endTime: '3:10 PM', claimedDuration: '1h 05m', status: 'pending' },
  { id: 'ac3', tutor: 'Meena S.', student: 'Fatima A.', date: 'Apr 20', startTime: '9:00 AM', endTime: '10:30 AM', claimedDuration: '1h 30m', status: 'pending' },
];

// ── Marks ──────────────────────────────────────────
export const mockCoordinatorMarks: MarksEntry[] = [
  { id: 'm1', student: 'Arjun M.', exam: 'Unit Test 2', subject: 'Maths', marks: 78, total: 100 },
  { id: 'm2', student: 'Sneha T.', exam: 'Unit Test 2', subject: 'Physics', marks: 91, total: 100 },
  { id: 'm3', student: 'Fatima A.', exam: 'Unit Test 2', subject: 'English', marks: 85, total: 100 },
];

export const mockTutorMarks: MarksEntry[] = [
  { id: 'tm1', student: 'Arjun M.', exam: 'Unit Test 2', subject: 'Maths', marks: null, total: 100 },
  { id: 'tm2', student: 'Rohit P.', exam: 'Unit Test 2', subject: 'Chemistry', marks: null, total: 100 },
  { id: 'tm3', student: 'Divya N.', exam: 'Unit Test 2', subject: 'Biology', marks: null, total: 100 },
];

export const mockStudentMarks: MarksEntry[] = [
  { id: 'sm1', student: 'Arjun M.', exam: 'Unit Test 1', subject: 'Maths', marks: 82, total: 100, grade: 'A', date: 'Mar 10' },
  { id: 'sm2', student: 'Arjun M.', exam: 'Unit Test 1', subject: 'Chemistry', marks: 74, total: 100, grade: 'B+', date: 'Mar 12' },
  { id: 'sm3', student: 'Arjun M.', exam: 'Mid-term', subject: 'Maths', marks: 91, total: 100, grade: 'A+', date: 'Feb 20' },
  { id: 'sm4', student: 'Arjun M.', exam: 'Mid-term', subject: 'Chemistry', marks: 68, total: 100, grade: 'B', date: 'Feb 22' },
];

// ── Notifications ─────────────────────────────────
export const mockNotifications: Notification[] = [
  { id: 'n1', session: 'Maths – Apr 22', recipients: 'Priya R., Arjun M.', time: '30 min before', channel: 'WhatsApp', status: 'sent' },
  { id: 'n2', session: 'English – Apr 22', recipients: 'Meena S., Fatima A.', time: '30 min before', channel: 'WhatsApp', status: 'queued' },
];

// ── Tutor past submissions ────────────────────────
export const mockTutorSubmissions: Session[] = [
  { id: 'ts1', date: 'Apr 20', student: 'Arjun M.', tutor: '', subject: '', duration: '1h 16m', status: 'pending' as SessionStatus | ApprovalStatus },
  { id: 'ts2', date: 'Apr 19', student: 'Divya N.', tutor: '', subject: '', duration: '1h 30m', status: 'approved' as SessionStatus | ApprovalStatus },
  { id: 'ts3', date: 'Apr 18', student: 'Rohit P.', tutor: '', subject: '', duration: '0h 55m', status: 'rejected' as SessionStatus | ApprovalStatus },
];

// ── Earnings ──────────────────────────────────────
export const mockEarnings: EarningsEntry[] = [
  { name: 'Arjun M. (Gr 8)', hours: 12, rate: 250, earned: 3000 },
  { name: 'Rohit P. (Gr 9)', hours: 7, rate: 300, earned: 2100 },
  { name: 'Divya N. (Gr 12)', hours: 8, rate: 350, earned: 2800 },
  { name: 'Sneha T. (Gr 10)', hours: 5.5, rate: 300, earned: 1650 },
  { name: 'Lakshmi K. (Gr 7)', hours: 6, rate: 250, earned: 1500 },
];

// ── Student schedule ──────────────────────────────
export const mockStudentSchedule = [
  { day: 'Monday', subject: 'Maths', tutor: 'Priya R.', time: '10:00 AM', status: 'Regular' },
  { day: 'Wednesday', subject: 'Chemistry', tutor: 'Priya R.', time: '11:00 AM', status: 'Regular' },
  { day: 'Friday', subject: 'Maths', tutor: 'Priya R.', time: '10:00 AM', status: 'Regular' },
];

export const mockStudentUpcoming: Session[] = [
  { id: 'su1', date: 'Apr 22', student: 'Arjun M.', tutor: 'Priya R.', subject: 'Maths', time: '10:00 AM', status: 'scheduled' },
  { id: 'su2', date: 'Apr 24', student: 'Arjun M.', tutor: 'Priya R.', subject: 'Maths', time: '10:00 AM', status: 'scheduled' },
  { id: 'su3', date: 'Apr 26', student: 'Arjun M.', tutor: 'Priya R.', subject: 'Chemistry', time: '11:00 AM', status: 'scheduled' },
];

// ── Parent ────────────────────────────────────────
export const mockParentSessionHistory: Session[] = [
  { id: 'ps1', date: 'Apr 20', tutor: 'Priya R.', student: '', subject: 'Maths', duration: '1h 16m', status: 'completed' },
  { id: 'ps2', date: 'Apr 18', tutor: 'Priya R.', student: '', subject: 'Chemistry', duration: '1h 00m', status: 'completed' },
  { id: 'ps3', date: 'Apr 15', tutor: 'Priya R.', student: '', subject: 'Maths', duration: '1h 10m', status: 'completed' },
  { id: 'ps4', date: 'Apr 12', tutor: 'Priya R.', student: '', subject: 'Chemistry', duration: '0h 55m', status: 'completed' },
];

export const mockFeeHistory: FeeEntry[] = [
  { month: 'March', hours: '12h', rate: '₹250/h', amount: '₹3,000', status: 'paid' },
  { month: 'April (so far)', hours: '3h', rate: '₹250/h', amount: '₹750', status: 'pending' },
];

// ── Admin ─────────────────────────────────────────
export const mockPlatformMetrics: PlatformMetric[] = [
  { metric: 'Sessions Held', thisMonth: '342', lastMonth: '298', trend: '+14.8%' },
  { metric: 'Hours Tutored', thisMonth: '412', lastMonth: '361', trend: '+14.1%' },
  { metric: 'New Enrollments', thisMonth: '8', lastMonth: '5', trend: '+60%' },
  { metric: 'Avg Tutor Rating', thisMonth: '4.7', lastMonth: '4.6', trend: '+0.1' },
];

export const mockFeeCollection: FeeCollectionEntry[] = [
  { month: 'April 2026', invoiced: '₹92,400', collected: '₹76,200', pending: '₹16,200' },
  { month: 'March 2026', invoiced: '₹87,500', collected: '₹87,500', pending: '₹0' },
  { month: 'February 2026', invoiced: '₹81,000', collected: '₹79,000', pending: '₹2,000' },
];

// Status type union for mock data
type SessionStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
type ApprovalStatus = 'pending' | 'approved' | 'rejected';
