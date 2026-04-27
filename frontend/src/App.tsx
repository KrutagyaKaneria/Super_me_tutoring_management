import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { RoleContext } from '@/hooks/useRole';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import type { Role } from '@/lib/types';

// Coordinator
import { CoordinatorOverview } from '@/pages/coordinator/CoordinatorOverview';
import { TutorDirectory } from '@/pages/coordinator/TutorDirectory';
import { SessionManagement } from '@/pages/coordinator/SessionManagement';
import { AttendanceVerification } from '@/pages/coordinator/AttendanceVerification';
import { CoordinatorMarks } from '@/pages/coordinator/CoordinatorMarks';
import { NotificationCenter } from '@/pages/coordinator/NotificationCenter';

// Tutor
import { TutorDashboard } from '@/pages/tutor/TutorDashboard';
import { MyStudents } from '@/pages/tutor/MyStudents';
import { TutorSessions } from '@/pages/tutor/TutorSessions';
import { TutorMarks } from '@/pages/tutor/TutorMarks';
import { Earnings } from '@/pages/tutor/Earnings';

// Student
import { StudentDashboard } from '@/pages/student/StudentDashboard';
import { ExamsMarks } from '@/pages/student/ExamsMarks';
import { StudentSchedule } from '@/pages/student/StudentSchedule';

// Parent
import { ParentOverview } from '@/pages/parent/ParentOverview';
import { ClassReports } from '@/pages/parent/ClassReports';
import { FeeDetails } from '@/pages/parent/FeeDetails';
import { ParentMarks } from '@/pages/parent/ParentMarks';

// Admin
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { UserManagement } from '@/pages/admin/UserManagement';
import { FeeConfig } from '@/pages/admin/FeeConfig';
import { AdminReports } from '@/pages/admin/AdminReports';

// Auth
import { Login } from '@/pages/Login';
import { TutorProfile } from './pages/tutor/TutorProfile';

function App() {
  const [role, setRole] = useState<Role>(() => {
    return (localStorage.getItem('role') as Role) || 'student';
  });

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route element={<DashboardLayout />}>
            {/* Coordinator Routes */}
            <Route path="/coordinator" element={<CoordinatorOverview />} />
            <Route path="/coordinator/tutors" element={<TutorDirectory />} />
            <Route path="/coordinator/sessions" element={<SessionManagement />} />
            <Route path="/coordinator/attendance" element={<AttendanceVerification />} />
            <Route path="/coordinator/marks" element={<CoordinatorMarks />} />
            <Route path="/coordinator/notifications" element={<NotificationCenter />} />

            {/* Tutor Routes */}
            <Route path="/tutor" element={<TutorDashboard />} />
            <Route path="/tutor/profile" element={<TutorProfile />} />
            <Route path="/tutor/students" element={<MyStudents />} />
            <Route path="/tutor/sessions" element={<TutorSessions />} />
            <Route path="/tutor/marks" element={<TutorMarks />} />
            <Route path="/tutor/earnings" element={<Earnings />} />

            {/* Student Routes */}
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/student/exams" element={<ExamsMarks />} />
            <Route path="/student/schedule" element={<StudentSchedule />} />

            {/* Parent Routes */}
            <Route path="/parent" element={<ParentOverview />} />
            <Route path="/parent/reports" element={<ClassReports />} />
            <Route path="/parent/fees" element={<FeeDetails />} />
            <Route path="/parent/marks" element={<ParentMarks />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/fees" element={<FeeConfig />} />
            <Route path="/admin/reports" element={<AdminReports />} />

            {/* Default redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            fontFamily: 'Inter, sans-serif',
            fontSize: '13px',
          },
        }}
        richColors
        closeButton
      />
    </RoleContext.Provider>
  );
}

export default App;
