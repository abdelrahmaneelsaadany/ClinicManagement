import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

// Auth
import LoginPage from './pages/auth/LoginPage';
import { RegisterPatientPage, RegisterDoctorPage } from './pages/auth/RegisterPages';

// Layout
import AppLayout from './components/layout/AppLayout';

// Patient
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientAppointments from './pages/patient/PatientAppointments';
import { BookAppointment, PatientPrescriptions } from './pages/patient/PatientOtherPages';

// Doctor
import { DoctorDashboard, DoctorAppointments, DoctorSchedule, DoctorPrescriptions } from './pages/doctor/DoctorPages';

// Admin
import { AdminDashboard, AdminUsers, AdminDoctors } from './pages/admin/AdminPages';

// ── Guards ────────────────────────────────────────────────────────────────────
function Private({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="loading-full">
      <span className="spin" style={{ width: 28, height: 28 }} />
      <span style={{ color: 'var(--text-3)', fontSize: '.85rem' }}>Loading…</span>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function RoleRedirect() {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="loading-full">
      <span className="spin" style={{ width: 28, height: 28 }} />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'Doctor') return <Navigate to="/doctor/dashboard" replace />;
  if (user.role === 'Admin')  return <Navigate to="/admin/dashboard"  replace />;
  return <Navigate to="/patient/dashboard" replace />;
}

// ── Routes ────────────────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login"             element={<LoginPage />} />
      <Route path="/register/patient"  element={<RegisterPatientPage />} />
      <Route path="/register/doctor"   element={<RegisterDoctorPage />} />

      {/* Root redirect */}
      <Route path="/" element={<RoleRedirect />} />

      {/* Patient */}
      <Route path="/patient" element={<Private roles={['Patient']}><AppLayout role="Patient" /></Private>}>
        <Route path="dashboard"    element={<PatientDashboard />} />
        <Route path="appointments" element={<PatientAppointments />} />
        <Route path="book"         element={<BookAppointment />} />
        <Route path="prescriptions"element={<PatientPrescriptions />} />
      </Route>

      {/* Doctor */}
      <Route path="/doctor" element={<Private roles={['Doctor']}><AppLayout role="Doctor" /></Private>}>
        <Route path="dashboard"    element={<DoctorDashboard />} />
        <Route path="appointments" element={<DoctorAppointments />} />
        <Route path="schedule"     element={<DoctorSchedule />} />
        <Route path="prescriptions"element={<DoctorPrescriptions />} />
      </Route>

      {/* Admin */}
      <Route path="/admin" element={<Private roles={['Admin']}><AppLayout role="Admin" /></Private>}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users"     element={<AdminUsers />} />
        <Route path="doctors"   element={<AdminDoctors />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--bg-card)',
              color: 'var(--text)',
              border: '1px solid var(--border-l)',
              borderRadius: 'var(--r-s)',
              fontFamily: 'var(--font-b)',
              fontSize: '.85rem',
            },
            success: { iconTheme: { primary: 'var(--green)', secondary: 'transparent' } },
            error:   { iconTheme: { primary: 'var(--red)',   secondary: 'transparent' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
