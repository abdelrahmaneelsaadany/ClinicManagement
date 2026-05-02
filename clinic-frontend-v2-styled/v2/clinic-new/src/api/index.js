import axios from 'axios';

const BASE = process.env.REACT_APP_API_URL || 'https://localhost:7047';

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
        const { data } = await axios.post(`${BASE}/api/Auth/auth/refresh-token`, { token: rt });
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

// ── error extractor — reads Result<T> shape from BaseController ───────────────
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

  // { error: { error: "msg" } }  (400, 500)
  if (d?.error?.error)   return d.error.error;
  if (d?.error?.message) return d.error.message;

  // { result: { error: "msg" } }  (401, 403, 404)
  if (d?.result?.error)   return d.result.error;
  if (d?.result?.message) return d.result.message;

  // validation errors array
  if (d?.errors && Array.isArray(d.errors)) return d.errors.join(' · ');

  // plain string / message / title
  if (typeof d === 'string' && d.length < 300) return d;
  if (d?.message) return d.message;
  if (d?.title)   return d.title;

  // fallback to friendly HTTP status message
  return STATUS_MSG[status] || `Error ${status}`;
}

// ── unwrap Result<T> data payload ─────────────────────────────────────────────
export function unwrap(res) {
  const d = res?.data;
  // Result<T> => { succeeded, data: T }
  if (d?.data !== undefined) return d.data;
  return d;
}

export function unwrapList(res) {
  const d = unwrap(res);
  return Array.isArray(d) ? d : [];
}

// ═══════════════════════════════════════════════════════════════════════════════
// Auth
// NOTE: register/doctor requires Admin role — only Admin can create doctors
// ═══════════════════════════════════════════════════════════════════════════════
export const authApi = {
  login:           dto => api.post('/api/Auth/auth/login', dto),
  registerPatient: dto => api.post('/api/Auth/auth/register/patient', dto),
  registerDoctor:  dto => api.post('/api/Auth/auth/register/doctor', dto), // Admin only
  refreshToken:    tok => api.post('/api/Auth/auth/refresh-token', { token: tok }),
};

// ═══════════════════════════════════════════════════════════════════════════════
// Users  [GET /api/User, /api/User/{id}, /api/User/by-email]
// ═══════════════════════════════════════════════════════════════════════════════
export const userApi = {
  getAll:     ()      => api.get('/api/User'),                              // Admin only
  getById:    id      => api.get(`/api/User/${id}`),                       // Admin,Doctor,Patient
  getByEmail: email   => api.get('/api/User/by-email', { params: { email } }), // Admin only
};

// ═══════════════════════════════════════════════════════════════════════════════
// Doctors
//   GET  /api/Doctor/{id}           Admin,Doctor (own ID only for Doctor)
//   GET  /api/Doctor/specialization  Admin,Patient
//   GET  /api/Doctor/available       Admin,Patient
//   PUT  /api/Doctor/availability    Admin,Doctor — uses CurrentUserId from token
// ═══════════════════════════════════════════════════════════════════════════════
export const doctorApi = {
  getById:      id   => api.get(`/api/Doctor/${id}`),
  getBySpec:    spec => api.get('/api/Doctor/specialization', { params: { specialization: spec } }),
  getAvailable: ()   => api.get('/api/Doctor/available'),
  setAvailability: flag => api.put('/api/Doctor/availability', null, { params: { available: flag } }),
};

// ═══════════════════════════════════════════════════════════════════════════════
// Appointments
//   GET  /api/Appointment/{Id}          Admin only
//   GET  /api/Appointment/patientId     Patient,Admin — CurrentUserId from token
//   GET  /api/Appointment/doctorId      Doctor,Admin  — CurrentUserId from token
//   POST /api/Appointment               Patient only
//   PUT  /api/Appointment/reschedule/{Id} Patient only
//   PUT  /api/Appointment/cancel/{Id}   Patient only
//   PUT  /api/Appointment/complete/{Id} Doctor,Admin
//   DELETE /api/Appointment/{Id}        Admin only
// ═══════════════════════════════════════════════════════════════════════════════
export const appointmentApi = {
  getById:      id  => api.get(`/api/Appointment/${id}`),         // Admin
  getMyPatient: ()  => api.get('/api/Appointment/patientId'),     // Patient — token based
  getMyDoctor:  ()  => api.get('/api/Appointment/doctorId'),      // Doctor  — token based
  book:         dto => api.post('/api/Appointment', dto),
  reschedule:   (id, dto)  => api.put(`/api/Appointment/reschedule/${id}`, dto),
  cancel:       id         => api.put(`/api/Appointment/cancel/${id}`),
  complete:     (id, dto)  => api.put(`/api/Appointment/complete/${id}`, dto),
  delete:       id         => api.delete(`/api/Appointment/${id}`),  // Admin only
};

// ═══════════════════════════════════════════════════════════════════════════════
// Doctor Schedules
//   GET  /api/DoctorSchedule/doctor      Admin,Doctor — CurrentUserId (NO {id} in URL)
//   GET  /api/DoctorSchedule/active      Patient,Admin
//   GET  /api/DoctorSchedule/day         Patient,Admin
//   POST /api/DoctorSchedule             Admin,Doctor
//   PUT  /api/DoctorSchedule/toggle-active/{Id}  Admin,Doctor
// ═══════════════════════════════════════════════════════════════════════════════
export const scheduleApi = {
  getMine:   ()       => api.get('/api/DoctorSchedule/doctor'),         // Doctor — token based
  getActive: ()       => api.get('/api/DoctorSchedule/active'),
  getByDay:  day      => api.get('/api/DoctorSchedule/day', { params: { dayOfWeek: day } }),
  create:    dto      => api.post('/api/DoctorSchedule', dto),
  toggle:    (id, active) => api.put(`/api/DoctorSchedule/toggle-active/${id}`, null, { params: { active } }),
};

// ═══════════════════════════════════════════════════════════════════════════════
// Prescriptions
//   GET /api/Prescription/{id}               Admin only
//   GET /api/Prescription/doctor             Doctor,Admin — CurrentUserId from token
//   GET /api/Prescription/patient            Patient,Admin — CurrentUserId from token
//   GET /api/Prescription/appointment/{id}   Doctor,Admin
// ═══════════════════════════════════════════════════════════════════════════════
export const prescriptionApi = {
  getById:          id  => api.get(`/api/Prescription/${id}`),           // Admin
  getMyDoctor:      ()  => api.get('/api/Prescription/doctor'),           // Doctor — token based
  getMyPatient:     ()  => api.get('/api/Prescription/patient'),          // Patient — token based
  getByAppointment: id  => api.get(`/api/Prescription/appointment/${id}`),
};

export default api;
