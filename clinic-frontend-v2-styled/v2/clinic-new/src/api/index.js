import axios from 'axios';

const BASE = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({ baseURL: BASE, headers: { 'Content-Type': 'application/json' } });

// ── attach token ──────────────────────────────────────────────────────────────
api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('accessToken');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

// ── auto refresh on 401 ───────────────────────────────────────────────────────
api.interceptors.response.use(
  r => r,
  async err => {
    const orig = err.config;
    if (err.response?.status === 401 && !orig._retry) {
      orig._retry = true;
      try {
        const rt = localStorage.getItem('refreshToken');
        if (!rt) throw new Error('no refresh token');
        const { data } = await axios.post(`${BASE}/Auth/auth/refresh-token`, { token: rt });
        const payload  = data?.data ?? data;
        const newToken = payload.accessToken || payload.AccessToken;
        localStorage.setItem('accessToken', newToken);
        orig.headers.Authorization = `Bearer ${newToken}`;
        return api(orig);
      } catch {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

// ── error extractor ───────────────────────────────────────────────────────────
const STATUS_MSG = {
  400: 'Validation Failed',
  401: 'Unauthorized — please log in again',
  403: 'Forbidden — access denied',
  404: 'Resource not found',
  409: 'Already exists — duplicate record',
  500: 'Internal server error — please try again',
};

export function extractError(err) {
  if (!err?.response) return err?.message || 'Network error — is the API running?';
  const d      = err.response.data;
  const status = err.response.status;

  if (d?.error?.error)   return d.error.error;
  if (d?.error?.message) return d.error.message;
  if (d?.result?.error)   return d.result.error;
  if (d?.result?.message) return d.result.message;
  if (d?.errors && Array.isArray(d.errors)) return d.errors.join(' · ');
  if (typeof d === 'string' && d.length < 300) return d;
  if (d?.message) return d.message;
  if (d?.title)   return d.title;

  return STATUS_MSG[status] || `Error ${status}`;
}

// ── unwrap Result<T> ──────────────────────────────────────────────────────────
export function unwrap(res) {
  const d = res?.data;
  if (d?.data !== undefined) return d.data;
  return d;
}

export function unwrapList(res) {
  const d = unwrap(res);
  return Array.isArray(d) ? d : [];
}

// ═══════════════════════════════════════════════════════════════════════════════
// Auth
// ═══════════════════════════════════════════════════════════════════════════════
export const authApi = {
  login:           dto => api.post('/Auth/auth/login', dto),
  registerPatient: dto => api.post('/Auth/auth/register/patient', dto),
  registerDoctor:  dto => api.post('/Auth/auth/register/doctor', dto),
  refreshToken:    tok => api.post('/Auth/auth/refresh-token', { token: tok }),
};

// ═══════════════════════════════════════════════════════════════════════════════
// Users
// ═══════════════════════════════════════════════════════════════════════════════
export const userApi = {
  getAll:     ()      => api.get('/User'),
  getById:    id      => api.get(`/User/${id}`),
  getByEmail: email   => api.get('/User/by-email', { params: { email } }),
};

// ═══════════════════════════════════════════════════════════════════════════════
// Doctors
// ═══════════════════════════════════════════════════════════════════════════════
export const doctorApi = {
  getById:         id   => api.get(`/Doctor/${id}`),
  getBySpec:       spec => api.get('/Doctor/specialization', { params: { specialization: spec } }),
  getAvailable:    ()   => api.get('/Doctor/available'),
  setAvailability: flag => api.put('/Doctor/availability', null, { params: { available: flag } }),
};

// ═══════════════════════════════════════════════════════════════════════════════
// Appointments
// ═══════════════════════════════════════════════════════════════════════════════
export const appointmentApi = {
  getById:      id          => api.get(`/Appointment/${id}`),
  getMyPatient: ()          => api.get('/Appointment/patientId'),
  getMyDoctor:  ()          => api.get('/Appointment/doctorId'),
  book:         dto         => api.post('/Appointment', dto),
  reschedule:   (id, dto)   => api.put(`/Appointment/reschedule/${id}`, dto),
  cancel:       id          => api.put(`/Appointment/cancel/${id}`),
  complete:     (id, dto)   => api.put(`/Appointment/complete/${id}`, dto),
  delete:       id          => api.delete(`/Appointment/${id}`),
};

// ═══════════════════════════════════════════════════════════════════════════════
// Doctor Schedules
// ═══════════════════════════════════════════════════════════════════════════════
export const scheduleApi = {
  getMine:   ()               => api.get('/DoctorSchedule/doctor'),
  getActive: ()               => api.get('/DoctorSchedule/active'),
  getByDay:  day              => api.get('/DoctorSchedule/day', { params: { dayOfWeek: day } }),
  create:    dto              => api.post('/DoctorSchedule', dto),
  toggle:    (id, active)     => api.put(`/DoctorSchedule/toggle-active/${id}`, null, { params: { active } }),
};

// ═══════════════════════════════════════════════════════════════════════════════
// Prescriptions
// ═══════════════════════════════════════════════════════════════════════════════
export const prescriptionApi = {
  getById:          id => api.get(`/Prescription/${id}`),
  getMyDoctor:      ()  => api.get('/Prescription/doctor'),
  getMyPatient:     ()  => api.get('/Prescription/patient'),
  getByAppointment: id  => api.get(`/Prescription/appointment/${id}`),
};

export default api;