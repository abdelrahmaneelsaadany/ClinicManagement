import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { appointmentApi, prescriptionApi } from '../../api';
import { PH, StatusBadge, Empty } from '../../components/ui';
import { Calendar, FileText, Clock, Activity, Plus, ArrowRight, Pill } from 'lucide-react';
import { format } from 'date-fns';

// result.data is the actual payload because API wraps in Result<T>
const unwrap = res => {
  const d = res?.data;
  if (d?.data !== undefined) return Array.isArray(d.data) ? d.data : (d.data ? [d.data] : []);
  return Array.isArray(d) ? d : [];
};

export default function PatientDashboard() {
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const [apts, setApts] = useState([]);
  const [presc, setPresc] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      appointmentApi.getMyPatient().catch(() => ({ data: { data: [] } })),
      prescriptionApi.getMyPatient().catch(() => ({ data: { data: [] } })),
    ]).then(([a, p]) => {
      setApts(unwrap(a));
      setPresc(unwrap(p));
    }).finally(() => setLoading(false));
  }, []);

  const upcoming   = apts.filter(a => a.status === 'Scheduled');
  const completed  = apts.filter(a => a.status === 'Completed');
  const cancelled  = apts.filter(a => a.status === 'Cancelled');

  const stats = [
    { label:'Upcoming',     val: upcoming.length,  color:'var(--blue)',   bg:'var(--blue-d)',   icon: Clock },
    { label:'Completed',    val: completed.length,  color:'var(--green)',  bg:'var(--green-d)',  icon: Activity },
    { label:'Cancelled',    val: cancelled.length,  color:'var(--red)',    bg:'var(--red-d)',    icon: Calendar },
    { label:'Prescriptions',val: presc.length,      color:'var(--purple)', bg:'var(--purple-d)', icon: Pill },
  ];

  return (
    <div>
      <PH
        title={`Hello, ${user?.fullName?.split(' ')[0] || 'Patient'} 👋`}
        sub="Here's your health overview"
        action={<button className="btn btn-primary" onClick={() => navigate('/patient/book')}><Plus size={15}/>Book Appointment</button>}
      />

      <div className="stat-grid">
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}><s.icon size={17} color={s.color} /></div>
            <div className="stat-val" style={{ color: s.color }}>{loading ? '—' : s.val}</div>
            <div className="stat-lbl">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="dash-cols">
        {/* Upcoming */}
        <div className="card">
          <div className="flex items-c justify-b mb-4">
            <span style={{ fontFamily:'var(--font-h)', fontWeight:700 }}>Upcoming Appointments</span>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/patient/appointments')}>View all <ArrowRight size={12}/></button>
          </div>
          {loading ? <div style={{ display:'flex',justifyContent:'center',padding:40 }}><span className="spin"/></div>
          : upcoming.length === 0
            ? <Empty icon={Calendar} title="No upcoming appointments" action={<button className="btn btn-primary btn-sm" onClick={()=>navigate('/patient/book')}><Plus size={13}/>Book Now</button>} />
            : <div className="flex flex-col gap-3">
                {upcoming.slice(0,4).map(a => (
                  <div key={a.appointmentId} style={{ display:'flex',alignItems:'center',gap:10,padding:'10px 12px',background:'var(--bg-s)',borderRadius:8,border:'1px solid var(--border)' }}>
                    <div style={{ width:34,height:34,borderRadius:8,background:'var(--blue-d)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}><Calendar size={15} color="var(--blue)"/></div>
                    <div style={{ flex:1,minWidth:0 }}>
                      <div style={{ fontSize:'.85rem',fontWeight:600 }}>Dr. {a.doctorName}</div>
                      <div style={{ fontSize:'.73rem',color:'var(--text-2)' }}>{a.appointmentDt ? format(new Date(a.appointmentDt),'MMM dd, yyyy · HH:mm') : '—'}</div>
                    </div>
                    <StatusBadge v={a.status}/>
                  </div>
                ))}
              </div>
          }
        </div>

        {/* Prescriptions */}
        <div className="card">
          <div className="flex items-c justify-b mb-4">
            <span style={{ fontFamily:'var(--font-h)', fontWeight:700 }}>Recent Prescriptions</span>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/patient/prescriptions')}>View all <ArrowRight size={12}/></button>
          </div>
          {loading ? <div style={{ display:'flex',justifyContent:'center',padding:40 }}><span className="spin"/></div>
          : presc.length === 0
            ? <Empty icon={FileText} title="No prescriptions yet" desc="They'll appear after consultations"/>
            : <div className="flex flex-col gap-3">
                {presc.slice(0,4).map(p => (
                  <div key={p.prescriptionId||p.id} style={{ display:'flex',alignItems:'center',gap:10,padding:'10px 12px',background:'var(--bg-s)',borderRadius:8,border:'1px solid var(--border)' }}>
                    <div style={{ width:34,height:34,borderRadius:8,background:'var(--purple-d)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}><Pill size={15} color="var(--purple)"/></div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:'.85rem',fontWeight:600 }}>{p.medicationName||'Medication'}</div>
                      <div style={{ fontSize:'.73rem',color:'var(--text-2)' }}>{p.dosage} · {p.frequency}</div>
                    </div>
                    {p.durationDays && <span className="badge b-purple">{p.durationDays}d</span>}
                  </div>
                ))}
              </div>
          }
        </div>
      </div>
    </div>
  );
}
