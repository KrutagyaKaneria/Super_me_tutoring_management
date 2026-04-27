import type { NavItem, Role } from './types';

export const APP_NAME = 'EduConnect';

export const ROLES: { value: Role; label: string }[] = [
  { value: 'coordinator', label: 'Coordinator' },
  { value: 'tutor', label: 'Tutor' },
  { value: 'student', label: 'Student' },
  { value: 'parent', label: 'Parent' },
  { value: 'admin', label: 'Admin' },
];

export const NAV_CONFIG: Record<Role, NavItem[]> = {
  coordinator: [
    { id: 'overview', label: 'Overview', icon: 'LayoutGrid', path: '' },
    { id: 'tutors', label: 'Tutors', icon: 'Users', path: 'tutors' },
    { id: 'sessions', label: 'Sessions', icon: 'Calendar', path: 'sessions' },
    { id: 'attendance', label: 'Attendance', icon: 'CheckCircle', path: 'attendance' },
    { id: 'marks', label: 'Marks', icon: 'PenLine', path: 'marks' },
    { id: 'notifications', label: 'Notifications', icon: 'Bell', path: 'notifications' },
  ],
  tutor: [
    { id: 'dash', label: 'Dashboard', icon: 'LayoutGrid', path: '' },
    { id: 'profile', label: 'My Profile', icon: 'User', path: 'profile' },
    { id: 'mystudents', label: 'My Students', icon: 'Users', path: 'students' },
    { id: 'sessions', label: 'Sessions', icon: 'Calendar', path: 'sessions' },
    { id: 'marks', label: 'Update Marks', icon: 'PenLine', path: 'marks' },
    { id: 'earnings', label: 'Earnings', icon: 'DollarSign', path: 'earnings' },
  ],
  student: [
    { id: 'dash', label: 'Dashboard', icon: 'LayoutGrid', path: '' },
    { id: 'exams', label: 'Exams & Marks', icon: 'PenLine', path: 'exams' },
    { id: 'schedule', label: 'Schedule', icon: 'Calendar', path: 'schedule' },
  ],
  parent: [
    { id: 'overview', label: 'Overview', icon: 'LayoutGrid', path: '' },
    { id: 'reports', label: 'Class Reports', icon: 'FileText', path: 'reports' },
    { id: 'fees', label: 'Fees', icon: 'DollarSign', path: 'fees' },
    { id: 'marks', label: 'Marks', icon: 'PenLine', path: 'marks' },
  ],
  admin: [
    { id: 'dash', label: 'Dashboard', icon: 'LayoutGrid', path: '' },
    { id: 'users', label: 'Users', icon: 'Users', path: 'users' },
    { id: 'fees', label: 'Fee Config', icon: 'DollarSign', path: 'fees' },
    { id: 'reports', label: 'Reports', icon: 'FileText', path: 'reports' },
  ],
};

export const GRADE_RATES = [
  { gradeBand: 'Grade 1–5', rate: 200 },
  { gradeBand: 'Grade 6–8', rate: 250 },
  { gradeBand: 'Grade 9–10', rate: 300 },
  { gradeBand: 'Grade 11–12', rate: 350 },
];
