import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Calendar, FileText, Clock, Users, Stethoscope, BookOpen, LogOut, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

const NAV = {
  Patient: [
    { label: 'Dashboard',        path: '/patient/dashboard', icon: LayoutDashboard },
    { label: 'My Appointments',  path: '/patient/appointments', icon: Calendar },
    { label: 'Book Appointment', path: '/patient/book', icon: BookOpen },
    { label: 'Prescriptions',    path: '/patient/prescriptions', icon: FileText },
  ],
  Doctor: [
    { label: 'Dashboard',     path: '/doctor/dashboard',     icon: LayoutDashboard },
    { label: 'Appointments',  path: '/doctor/appointments',  icon: Calendar },
    { label: 'My Schedule',   path: '/doctor/schedule',      icon: Clock },
    { label: 'Prescriptions', path: '/doctor/prescriptions', icon: FileText },
  ],
  Admin: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Users',     path: '/admin/users',     icon: Users },
    { label: 'Doctors',   path: '/admin/doctors',   icon: Stethoscope },
  ],
};

const ROLE_COLOR = { Patient: 'var(--green)', Doctor: 'var(--blue)', Admin: 'var(--purple)' };

export default function AppLayout({ role }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); toast.success('Logged out'); navigate('/login'); };

  const initials = user
    ? ((user.fullName || `${user.firstName||''} ${user.lastName||''}`).trim().split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2))
    : '?';

  const displayName = user?.fullName || `${user?.firstName||''} ${user?.lastName||''}`.trim() || user?.email || '';

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sb-logo">
          <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:4 }}>
            <div style={{ width:28, height:28, borderRadius:8, background:'var(--blue-d)', border:'1px solid rgba(0,217,166,.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Activity size={14} color="var(--blue)" />
            </div>
            <h1>MediCore</h1>
          </div>
          <span>Clinic Management</span>
        </div>

        <nav className="sb-nav">
          <div className="nav-label">{role} Portal</div>
          {(NAV[role]||[]).map(({ label, path, icon: Icon }) => (
            <NavLink key={path} to={path} className={({ isActive }) => `nav-item${isActive?' active':''}`}>
              <Icon size={15} />{label}
            </NavLink>
          ))}
        </nav>

        <div className="sb-user">
          <div className="avatar">{initials}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div className="u-name trunc">{displayName}</div>
            <div className="u-role">{role}</div>
          </div>
          <button className="btn-icon" onClick={handleLogout} title="Logout" style={{ color:'var(--text-3)' }}>
            <LogOut size={14} />
          </button>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <span style={{ fontFamily:'var(--font-h)', fontWeight:700, fontSize:'.9rem', color:'var(--text-2)' }}>
            {role} Portal
          </span>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:'var(--blue)', boxShadow:'0 0 8px var(--blue-g)' }} />
            <span style={{ fontSize:'.75rem', color:'var(--text-2)' }}>System Online</span>
          </div>
        </header>
        <main className="page"><Outlet /></main>
      </div>
    </div>
  );
}
