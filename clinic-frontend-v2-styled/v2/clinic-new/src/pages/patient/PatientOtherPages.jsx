import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { doctorApi, appointmentApi, prescriptionApi, extractError } from '../../api';
import { PH, SpecBadge, ErrBanner, Empty } from '../../components/ui';
import { Search, CheckCircle, User, Stethoscope, Pill, Clock, AlignLeft } from 'lucide-react';
import toast from 'react-hot-toast';

// Keeps the local time — avoids UTC shift (e.g. Cairo UTC+3)
const toLocalISOString = (v) => !v ? null : v.length === 16 ? v + ":00.000" : v;

const SPECS = ['All','Cardiology','Nephrology','Oncology','Pulmonology','Psychiatry','Endocrinology','Rheumatology','Neurology','Orthopedics','General'];

// ── Book Appointment ───────────────────────────────────────────────────────────
export function BookAppointment() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [docs, setDocs]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr]     = useState('');
  const [spec, setSpec]   = useState('All');
  const [search, setSearch] = useState('');
  const [sel, setSel]     = useState(null);
  const [form, setForm]   = useState({ appointmentDt:'', notes:'' });
  const [submitting, setSub] = useState(false);

  useEffect(() => {
    setLoading(true);
    const call = spec === 'All' ? doctorApi.getAvailable() : doctorApi.getBySpec(spec);
    call.then(r => {
      const d = r?.data?.data ?? r?.data ?? [];
      setDocs(Array.isArray(d) ? d : []);
    }).catch(e => setErr(extractError(e))).finally(() => setLoading(false));
  }, [spec]);

  const filtered = docs.filter(d => `${d.firstName||''} ${d.lastName||''}`.toLowerCase().includes(search.toLowerCase()));

  const submit = async e => {
    e.preventDefault();
    if (!sel) return toast.error('Select a doctor first');
    setSub(true);
    try {
      await appointmentApi.book({
        patientId: user?.userId || user?.UserId,
        doctorId:  sel.userId  || sel.UserId,
        appointmentDt: toLocalISOString(form.appointmentDt),
        notes: form.notes || null,
      });
      toast.success('Appointment booked!');
      navigate('/patient/appointments');
    } catch (e) { toast.error(extractError(e)); }
    finally { setSub(false); }
  };

  return (
    <div>
      <PH title="Book Appointment" sub="Find a doctor and schedule your visit"/>
      <ErrBanner err={err}/>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:18 }}>
        <div>
          {/* filters */}
          <div style={{ display:'flex', gap:10, marginBottom:14 }}>
            <div className="search-wrap" style={{ flex:1 }}>
              <Search size={14}/><input className="fi" placeholder="Search doctors…" value={search} onChange={e=>setSearch(e.target.value)} style={{ paddingLeft:34 }}/>
            </div>
            <select className="fs" style={{ width:175 }} value={spec} onChange={e=>setSpec(e.target.value)}>
              {SPECS.map(s=><option key={s}>{s}</option>)}
            </select>
          </div>

          {loading ? (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              {Array.from({length:6}).map((_,i)=><div key={i} className="card pulse" style={{ height:95 }}/>)}
            </div>
          ) : filtered.length === 0 ? (
            <Empty icon={Stethoscope} title="No doctors found" desc="Try a different specialization"/>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              {filtered.map(doc => (
                <div key={doc.userId} className="card" onClick={()=>setSel(doc)} style={{ cursor:'pointer', border:`1px solid ${sel?.userId===doc.userId?'var(--blue)':'var(--border)'}`, background: sel?.userId===doc.userId?'var(--blue-d)':'var(--bg-card)', position:'relative' }}>
                  {sel?.userId===doc.userId && <CheckCircle size={15} color="var(--blue)" style={{ position:'absolute',top:11,right:11 }}/>}
                  <div style={{ display:'flex',alignItems:'center',gap:9,marginBottom:9 }}>
                    <div style={{ width:38,height:38,borderRadius:9,background:'var(--blue-d)',display:'flex',alignItems:'center',justifyContent:'center' }}><User size={17} color="var(--blue)"/></div>
                    <div>
                      <div style={{ fontWeight:600,fontSize:'.875rem' }}>Dr. {doc.firstName} {doc.lastName}</div>
                      <div style={{ fontSize:'.72rem',color:'var(--text-2)' }}>{doc.yearsExperience}y exp.</div>
                    </div>
                  </div>
                  <SpecBadge v={doc.specialization}/>
                  <span className={`badge ${doc.isAvailable?'b-green':'b-red'}`} style={{ marginLeft:5 }}>{doc.isAvailable?'Available':'Busy'}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* booking form */}
        <div>
          <div className="card">
            <div style={{ fontFamily:'var(--font-h)',fontWeight:700,marginBottom:14 }}>Appointment Details</div>
            {sel
              ? <div style={{ display:'flex',alignItems:'center',gap:9,padding:'10px 12px',background:'var(--blue-d)',borderRadius:8,marginBottom:14,border:'1px solid rgba(79,142,247,.2)' }}>
                  <div style={{ width:34,height:34,borderRadius:8,background:'var(--blue)',display:'flex',alignItems:'center',justifyContent:'center' }}><Stethoscope size={15} color="#fff"/></div>
                  <div><div style={{ fontWeight:600,fontSize:'.85rem' }}>Dr. {sel.firstName} {sel.lastName}</div><div style={{ fontSize:'.72rem',color:'var(--text-2)' }}>{sel.specialization}</div></div>
                </div>
              : <div style={{ padding:'20px',background:'var(--bg-s)',borderRadius:8,textAlign:'center',color:'var(--text-3)',fontSize:'.83rem',marginBottom:14 }}>← Select a doctor first</div>
            }
            <form onSubmit={submit}>
              <div className="fg"><label className="fl">Date & Time</label><input className="fi" type="datetime-local" value={form.appointmentDt} onChange={e=>setForm({...form,appointmentDt:e.target.value})} min={new Date().toISOString().slice(0,16)} required/></div>
              <div className="fg"><label className="fl">Notes (optional)</label><textarea className="fta" placeholder="Describe your symptoms…" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} style={{ minHeight:75 }}/></div>
              <button type="submit" className="btn btn-primary w-full" disabled={submitting||!sel}>
                {submitting?<><span className="spin spin-sm"/>Booking…</>:'Confirm Booking'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Patient Prescriptions ──────────────────────────────────────────────────────
export function PatientPrescriptions() {
  const { user } = useAuth();
  const [presc, setPresc] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    prescriptionApi.getMyPatient()
      .then(r => { const d = r?.data?.data ?? r?.data ?? []; setPresc(Array.isArray(d)?d:[]); })
      .catch(e => setErr(extractError(e)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PH title="My Prescriptions" sub="All medications prescribed by your doctors"/>
      <ErrBanner err={err}/>
      {loading
        ? <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:14 }}>{Array.from({length:6}).map((_,i)=><div key={i} className="card pulse" style={{ height:130 }}/>)}</div>
        : presc.length === 0
          ? <Empty icon={Pill} title="No prescriptions yet" desc="They'll appear after completed consultations"/>
          : <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:14 }}>
              {presc.map(p => (
                <div key={p.prescriptionId||p.id} className="card" style={{ borderTop:'3px solid var(--purple)' }}>
                  <div style={{ display:'flex',alignItems:'center',gap:9,marginBottom:12 }}>
                    <div style={{ width:38,height:38,borderRadius:9,background:'var(--purple-d)',display:'flex',alignItems:'center',justifyContent:'center' }}><Pill size={17} color="var(--purple)"/></div>
                    <div><div style={{ fontWeight:700,fontFamily:'var(--font-h)' }}>{p.medicationName||'Medication'}</div><div style={{ fontSize:'.72rem',color:'var(--text-2)' }}>{p.dosage}</div></div>
                  </div>
                  {p.frequency && <div style={{ display:'flex',alignItems:'center',gap:7,fontSize:'.8rem',marginBottom:5 }}><Clock size={12} color="var(--text-3)"/><span style={{ color:'var(--text-2)' }}>{p.frequency}</span></div>}
                  {p.durationDays && <div style={{ display:'flex',alignItems:'center',gap:7,fontSize:'.8rem',marginBottom:5 }}><AlignLeft size={12} color="var(--text-3)"/><span style={{ color:'var(--text-2)' }}>Duration: <strong>{p.durationDays} days</strong></span></div>}
                  {p.notes && <div style={{ marginTop:8,padding:'7px 10px',background:'var(--bg-s)',borderRadius:6,fontSize:'.78rem',color:'var(--text-2)' }}>{p.notes}</div>}
                </div>
              ))}
            </div>
      }
    </div>
  );
}
