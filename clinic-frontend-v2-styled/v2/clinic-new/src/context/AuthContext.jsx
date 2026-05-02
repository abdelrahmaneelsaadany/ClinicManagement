import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api';

const Ctx = createContext(null);

// LoginResponseDto => { accessToken, refreshToken, userId, fullName, role }
// role comes as enum string: "Patient" | "Doctor" | "Admin"
const INT = { 0:'Patient',1:'Doctor',2:'Admin','0':'Patient','1':'Doctor','2':'Admin' };

function resolveRole(data) {
  const raw = data.role ?? data.Role ?? data.userRole ?? data.UserRole;
  if (raw !== undefined && raw !== null) {
    if (INT[raw]) return INT[raw];
    if (typeof raw === 'string') {
      const n = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
      if (['Patient','Doctor','Admin'].includes(n)) return n;
    }
  }
  // last resort: decode JWT
  const tok = data.accessToken || data.AccessToken || data.token;
  if (tok) {
    try {
      const p = JSON.parse(atob(tok.split('.')[1]));
      const r = p.role || p.Role ||
        p['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      if (r) { if (INT[r]) return INT[r]; const n=String(r).charAt(0).toUpperCase()+String(r).slice(1).toLowerCase(); if(['Patient','Doctor','Admin'].includes(n)) return n; }
    } catch {}
  }
  return 'Patient';
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      const token  = localStorage.getItem('accessToken');
      if (stored && token) {
        const u = JSON.parse(stored);
        if (!['Patient','Doctor','Admin'].includes(u.role))
          u.role = resolveRole(u);
        setUser(u);
      }
    } catch { localStorage.clear(); }
    finally { setLoading(false); }
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await authApi.login({ email, password });
    // data.data because your API returns Result<T> => { succeeded, data: LoginResponseDto }
    const payload = data?.data ?? data;
    console.log('Login payload:', payload);

    const token   = payload.accessToken || payload.AccessToken;
    const refresh = payload.refreshToken || payload.RefreshToken;
    const role    = resolveRole(payload);

    if (!token) throw new Error('No token in response');

    localStorage.setItem('accessToken', token);
    if (refresh) localStorage.setItem('refreshToken', refresh);

    const u = { ...payload, email, role };
    localStorage.setItem('user', JSON.stringify(u));
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => { localStorage.clear(); setUser(null); }, []);

  return <Ctx.Provider value={{ user, login, logout, loading }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
