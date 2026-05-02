import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { appointmentApi, prescriptionApi, doctorApi, scheduleApi, extractError } from '../../api';
import { PH, StatusBadge, SkeletonRows, Modal, Confirm, ErrBanner, Empty } from '../../components/ui';
import { Calendar, FileText, Clock, Activity, ToggleLeft, ToggleRight, CheckCircle, X, Plus, Trash2, Pill, AlignLeft } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const unwrapList = res => { const d=res?.data; if(Array.isArray(d?.data)) return d.data; if(Array.isArray(d)) return d; return []; };
const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const EMPTY_RX = { medicationName:'', dosage:'', frequency:'', durationDays:'', notes:'' };

// ── Doctor Dashboard ──────────────────────────────────────────────────────────
export function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const uid = user?.userId || user?.UserId;

  const [apts, setApts]     = useState([]);
  const [presc, setPresc]   = useState([]);
  const [doc, setDoc]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [avLoading, setAv]  = useState(false);

  useEffect(() => {
    Promise.all([
      appointmentApi.getMyDoctor().catch(()=>({data:{data:[]}})),
      prescriptionApi.getMyDoctor().catch(()=>({data:{data:[]}})),
      doctorApi.getById(uid).catch(()=>({data:{data:null}})),
    ]).then(([a,p,d]) => {
      setApts(unwrapList(a)); setPresc(unwrapList(p));
      setDoc(d?.data?.data ?? d?.data ?? null);
    }).finally(()=>setLoading(false));
  }, [uid]);

  const toggleAvail = async () => {
    setAv(true);
    try {
      await doctorApi.setAvailability(!doc?.isAvailable);
      setDoc(d => ({...d, isAvailable: !d?.isAvailable}));
      toast.success(`Now ${!doc?.isAvailable?'available':'unavailable'}`);
    } catch(e) { toast.error(extractError(e)); }
    finally { setAv(false); }
  };

  const upcoming  = apts.filter(a=>a.status==='Scheduled');
  const completed = apts.filter(a=>a.status==='Completed');
  const cancelled = apts.filter(a=>a.status==='Cancelled');
  const noshow    = apts.filter(a=>a.status==='NoShow');

  const chart = [
    {name:'Scheduled', val:upcoming.length,  color:'var(--blue)'},
    {name:'Completed',  val:completed.length, color:'var(--green)'},
    {name:'Cancelled',  val:cancelled.length, color:'var(--red)'},
    {name:'NoShow',     val:noshow.length,    color:'var(--yellow)'},
  ];

  const stats = [
    {label:'Upcoming',     val:upcoming.length,  color:'var(--blue)',   bg:'var(--blue-d)',   icon:Clock},
    {label:'Completed',    val:completed.length,  color:'var(--green)',  bg:'var(--green-d)',  icon:Activity},
    {label:'Prescriptions',val:presc.length,      color:'var(--purple)', bg:'var(--purple-d)', icon:FileText},
    {label:'Total',        val:apts.length,       color:'var(--yellow)', bg:'var(--yellow-d)', icon:Calendar},
  ];

  return (
    <div>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:26,flexWrap:'wrap',gap:12 }}>
        <div>
          <div className="ph-title">Welcome, Dr. {user?.fullName?.split(' ')[0] || 'Doctor'} 👨‍⚕️</div>
          <div className="ph-sub">{doc?.specialization||'Specialist'} · {doc?.yearsExperience}y experience</div>
        </div>
        <button className={`btn ${doc?.isAvailable?'btn-success':'btn-secondary'}`} onClick={toggleAvail} disabled={avLoading}>
          {avLoading ? <span className="spin spin-sm"/> : doc?.isAvailable ? <><ToggleRight size={17}/>Available</> : <><ToggleLeft size={17}/>Unavailable</>}
        </button>
      </div>

      <div className="stat-grid">
        {stats.map(s=>(
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{background:s.bg}}><s.icon size={17} color={s.color}/></div>
            <div className="stat-val" style={{color:s.color}}>{loading?'—':s.val}</div>
            <div className="stat-lbl">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="dash-cols">
        <div className="card">
          <div style={{fontFamily:'var(--font-h)',fontWeight:700,marginBottom:18}}>Appointments Overview</div>
          {loading ? <div style={{display:'flex',justifyContent:'center',padding:60}}><span className="spin"/></div> : (
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={chart} barSize={32}>
                <XAxis dataKey="name" tick={{fill:'var(--text-2)',fontSize:11}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:'var(--text-3)',fontSize:11}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:8,fontFamily:'var(--font-b)',fontSize:12}} labelStyle={{color:'var(--text)'}} itemStyle={{color:'var(--text-2)'}}/>
                <Bar dataKey="val" radius={[4,4,0,0]}>{chart.map((d,i)=><Cell key={i} fill={d.color} opacity={.85}/>)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
            <span style={{fontFamily:'var(--font-h)',fontWeight:700}}>Upcoming Appointments</span>
            <button className="btn btn-secondary btn-sm" onClick={()=>navigate('/doctor/appointments')}>View all</button>
          </div>
          {loading ? <div style={{display:'flex',justifyContent:'center',padding:40}}><span className="spin"/></div>
          : upcoming.length===0 ? <div style={{textAlign:'center',padding:'28px 0',color:'var(--text-3)',fontSize:'.85rem'}}>No upcoming appointments</div>
          : <div className="flex flex-col gap-3">
              {upcoming.slice(0,5).map(a=>(
                <div key={a.appointmentId} style={{display:'flex',alignItems:'center',gap:9,padding:'9px 11px',background:'var(--bg-s)',borderRadius:8,border:'1px solid var(--border)'}}>
                  <div style={{width:7,height:7,borderRadius:'50%',background:'var(--blue)',flexShrink:0}}/>
                  <div style={{flex:1}}><div style={{fontSize:'.83rem',fontWeight:600}}>{a.patientName}</div><div style={{fontSize:'.72rem',color:'var(--text-2)'}}>{a.appointmentDt?format(new Date(a.appointmentDt),'MMM dd · HH:mm'):'—'}</div></div>
                  <StatusBadge v={a.status}/>
                </div>
              ))}
            </div>
          }
        </div>
      </div>
    </div>
  );
}

// ── Doctor Appointments ───────────────────────────────────────────────────────
export function DoctorAppointments() {
  const [apts, setApts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr]   = useState('');
  const [filter, setFilter] = useState('All');

  const [comp, setComp] = useState({open:false,id:null});
  const [rxs, setRxs]   = useState([{...EMPTY_RX}]);
  const [cStatus, setCStatus] = useState('Completed');
  const [cLoad, setCLoad] = useState(false);

  const [cancel, setCancel] = useState({open:false,id:null});
  const [canLoad, setCanLoad] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setApts(unwrapList(await appointmentApi.getMyDoctor())); }
    catch(e) { setErr(extractError(e)); }
    finally { setLoading(false); }
  };
  useEffect(()=>{load();},[]);

  const FILTERS = ['All','Scheduled','Completed','Cancelled','NoShow'];
  const filtered = filter==='All' ? apts : apts.filter(a=>a.status===filter);

  const addRx  = () => setRxs(r=>[...r,{...EMPTY_RX}]);
  const delRx  = i => setRxs(r=>r.filter((_,j)=>j!==i));
  const updRx  = (i,k,v) => setRxs(r=>r.map((x,j)=>j===i?{...x,[k]:v}:x));

  const doComplete = async () => {
    setCLoad(true);
    try {
      const prescriptions = rxs.filter(r=>r.medicationName.trim()).map(r=>({...r,durationDays:r.durationDays?Number(r.durationDays):null}));
      await appointmentApi.complete(comp.id,{status:cStatus,prescriptions:prescriptions.length?prescriptions:null});
      toast.success('Appointment completed!'); setComp({open:false,id:null}); setRxs([{...EMPTY_RX}]); load();
    } catch(e) { toast.error(extractError(e)); }
    finally { setCLoad(false); }
  };

  const doCancel = async () => {
    setCanLoad(true);
    try { await appointmentApi.cancel(cancel.id); toast.success('Cancelled'); setCancel({open:false,id:null}); load(); }
    catch(e) { toast.error(extractError(e)); }
    finally { setCanLoad(false); }
  };

  return (
    <div>
      <PH title="Appointments" sub="Manage patient appointments"/>
      <ErrBanner err={err}/>
      <div className="pills">{FILTERS.map(f=><button key={f} className={`pill${filter===f?' active':''}`} onClick={()=>setFilter(f)}>{f}</button>)}</div>
      <div className="tbl-wrap">
        <table>
          <thead><tr><th>Patient</th><th>Date & Time</th><th>Specialization</th><th>Status</th><th>Notes</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? <SkeletonRows cols={6}/>
            : filtered.length===0 ? <tr><td colSpan={6} style={{textAlign:'center',padding:'40px 0',color:'var(--text-3)'}}>No appointments found</td></tr>
            : filtered.map(a=>(
              <tr key={a.appointmentId}>
                <td><div style={{fontWeight:600,fontSize:'.875rem'}}>{a.patientName}</div></td>
                <td style={{fontSize:'.85rem'}}>{a.appointmentDt?format(new Date(a.appointmentDt),'MMM dd, yyyy'):'—'}<div style={{fontSize:'.72rem',color:'var(--text-2)'}}>{a.appointmentDt?format(new Date(a.appointmentDt),'HH:mm'):''}</div></td>
                <td><span className="badge b-blue">{a.doctorSpecialization}</span></td>
                <td><StatusBadge v={a.status}/></td>
                <td style={{fontSize:'.8rem',color:'var(--text-2)',maxWidth:150}}><span className="trunc" style={{display:'block'}}>{a.notes||'—'}</span></td>
                <td>{a.status==='Scheduled'&&<div style={{display:'flex',gap:5}}>
                  <button className="btn btn-success btn-sm" onClick={()=>setComp({open:true,id:a.appointmentId})}><CheckCircle size={12}/> Complete</button>
                  <button className="btn btn-danger btn-sm" onClick={()=>setCancel({open:true,id:a.appointmentId})}><X size={12}/></button>
                </div>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Complete modal */}
      <Modal open={comp.open} onClose={()=>setComp({open:false,id:null})} title="Complete Appointment" size="lg">
        <div className="fg">
          <label className="fl">Final Status</label>
          <select className="fs" value={cStatus} onChange={e=>setCStatus(e.target.value)}>
            <option value="Completed">Completed</option>
            <option value="NoShow">NoShow</option>
          </select>
        </div>
        <div style={{borderTop:'1px solid var(--border)',paddingTop:14,marginTop:6}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
            <span style={{fontFamily:'var(--font-h)',fontWeight:700,fontSize:'.92rem'}}>Prescriptions</span>
            <button className="btn btn-secondary btn-sm" onClick={addRx}><Plus size={12}/>Add</button>
          </div>
          {rxs.map((rx,i)=>(
            <div key={i} style={{background:'var(--bg-s)',border:'1px solid var(--border)',borderRadius:8,padding:12,marginBottom:9}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:9}}>
                <span style={{fontSize:'.78rem',fontWeight:600,color:'var(--text-2)'}}>Rx #{i+1}</span>
                {rxs.length>1&&<button className="btn btn-danger btn-sm" onClick={()=>delRx(i)}><Trash2 size={11}/></button>}
              </div>
              <div className="g2">
                <div className="fg" style={{marginBottom:8}}><label className="fl">Medication Name</label><input className="fi" placeholder="e.g. Amoxicillin" value={rx.medicationName} onChange={e=>updRx(i,'medicationName',e.target.value)}/></div>
                <div className="fg" style={{marginBottom:8}}><label className="fl">Dosage</label><input className="fi" placeholder="e.g. 500mg" value={rx.dosage} onChange={e=>updRx(i,'dosage',e.target.value)}/></div>
                <div className="fg" style={{marginBottom:8}}><label className="fl">Frequency</label><input className="fi" placeholder="e.g. Twice daily" value={rx.frequency} onChange={e=>updRx(i,'frequency',e.target.value)}/></div>
                <div className="fg" style={{marginBottom:8}}><label className="fl">Duration (days)</label><input className="fi" type="number" placeholder="7" value={rx.durationDays} onChange={e=>updRx(i,'durationDays',e.target.value)}/></div>
              </div>
              <div className="fg" style={{marginBottom:0}}><label className="fl">Notes</label><input className="fi" placeholder="Additional notes…" value={rx.notes} onChange={e=>updRx(i,'notes',e.target.value)}/></div>
            </div>
          ))}
        </div>
        <div className="modal-foot">
          <button className="btn btn-secondary" onClick={()=>setComp({open:false,id:null})}>Cancel</button>
          <button className="btn btn-success" onClick={doComplete} disabled={cLoad}>{cLoad?<span className="spin spin-sm"/>:<><CheckCircle size={13}/>Complete</>}</button>
        </div>
      </Modal>

      <Confirm open={cancel.open} onClose={()=>setCancel({open:false,id:null})} onConfirm={doCancel} title="Cancel Appointment" message="Are you sure you want to cancel this appointment?" label="Yes, Cancel" danger loading={canLoad}/>
    </div>
  );
}

// ── Doctor Schedule ───────────────────────────────────────────────────────────
export function DoctorSchedule() {
  const { user } = useAuth();
  const uid = user?.userId||user?.UserId;
  const [scheds, setScheds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({weekDay:'Monday',startTime:'09:00:00',endTime:'17:00:00',slotDurationMinutes:30,isActive:true});
  const [submitting, setSub] = useState(false);
  const [toggling, setTog]   = useState({});

  const load = async () => {
    setLoading(true);
    try { setScheds(unwrapList(await scheduleApi.getMine())); }
    catch(e) { setErr(extractError(e)); }
    finally { setLoading(false); }
  };
  useEffect(()=>{load();},[]);

  const doAdd = async e => {
    e.preventDefault(); setSub(true);
    try {
      await scheduleApi.create({...form, doctorUserId: uid, slotDurationMinutes: Number(form.slotDurationMinutes)});
      toast.success('Schedule added!'); setAddOpen(false); load();
    } catch(e) { toast.error(extractError(e)); }
    finally { setSub(false); }
  };

  const doToggle = async (id, cur) => {
    setTog(t=>({...t,[id]:true}));
    try { await scheduleApi.toggle(id,!cur); setScheds(s=>s.map(x=>x.id===id?{...x,isActive:!cur}:x)); toast.success('Updated'); }
    catch(e) { toast.error(extractError(e)); }
    finally { setTog(t=>({...t,[id]:false})); }
  };

  const byDay = DAYS.reduce((acc,d)=>{ acc[d]=scheds.filter(s=>s.weekDay===d); return acc; },{});

  return (
    <div>
      <PH title="My Schedule" sub="Configure your weekly availability"
        action={<button className="btn btn-primary" onClick={()=>setAddOpen(true)}><Plus size={15}/>Add Slot</button>}
      />
      <ErrBanner err={err}/>
      {loading ? <div style={{display:'flex',justifyContent:'center',padding:80}}><span className="spin"/></div> : (
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:8}}>
          {DAYS.map((day,i) => (
            <div key={day} style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:10,overflow:'hidden'}}>
              <div style={{padding:'9px 10px',background:byDay[day].length?'var(--blue-d)':'var(--bg-s)',borderBottom:'1px solid var(--border)',textAlign:'center'}}>
                <div style={{fontSize:'.65rem',fontWeight:800,letterSpacing:'.1em',textTransform:'uppercase',color:byDay[day].length?'var(--blue)':'var(--text-3)'}}>{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][i]}</div>
              </div>
              <div style={{padding:8,display:'flex',flexDirection:'column',gap:5,minHeight:75}}>
                {byDay[day].length===0
                  ? <div style={{textAlign:'center',padding:'14px 0',color:'var(--text-3)',fontSize:'.68rem'}}>—</div>
                  : byDay[day].map(s=>(
                    <div key={s.id} style={{padding:'7px 9px',borderRadius:6,background:s.isActive?'rgba(52,211,153,.07)':'var(--bg-s)',border:`1px solid ${s.isActive?'rgba(52,211,153,.2)':'var(--border)'}`}}>
                      <div style={{fontSize:'.68rem',color:s.isActive?'var(--green)':'var(--text-2)',fontWeight:600}}>{s.startTime?.slice(0,5)}–{s.endTime?.slice(0,5)}</div>
                      <div style={{fontSize:'.64rem',color:'var(--text-3)',margin:'3px 0'}}>{s.slotDurationMinutes}min</div>
                      <button onClick={()=>doToggle(s.id,s.isActive)} disabled={toggling[s.id]} style={{background:'none',border:'none',cursor:'pointer',padding:0,color:s.isActive?'var(--green)':'var(--text-3)'}}>
                        {toggling[s.id]?<span className="spin" style={{width:12,height:12}}/>:s.isActive?<ToggleRight size={14}/>:<ToggleLeft size={14}/>}
                      </button>
                    </div>
                  ))
                }
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={addOpen} onClose={()=>setAddOpen(false)} title="Add Schedule Slot">
        <form onSubmit={doAdd}>
          <div className="fg"><label className="fl">Day of Week</label><select className="fs" value={form.weekDay} onChange={e=>setForm(f=>({...f,weekDay:e.target.value}))}>{DAYS.map(d=><option key={d}>{d}</option>)}</select></div>
          <div className="g2">
            <div className="fg"><label className="fl">Start Time</label><input className="fi" type="time" value={form.startTime.slice(0,5)} onChange={e=>setForm(f=>({...f,startTime:e.target.value+':00'}))} required/></div>
            <div className="fg"><label className="fl">End Time</label><input className="fi" type="time" value={form.endTime.slice(0,5)} onChange={e=>setForm(f=>({...f,endTime:e.target.value+':00'}))} required/></div>
          </div>
          <div className="fg"><label className="fl">Slot Duration (minutes)</label><select className="fs" value={form.slotDurationMinutes} onChange={e=>setForm(f=>({...f,slotDurationMinutes:Number(e.target.value)}))}>
            {[15,20,30,45,60].map(m=><option key={m} value={m}>{m} minutes</option>)}
          </select></div>
          <div style={{display:'flex',alignItems:'center',gap:9,marginBottom:8}}>
            <input type="checkbox" id="ia" checked={form.isActive} onChange={e=>setForm(f=>({...f,isActive:e.target.checked}))} style={{width:15,height:15,accentColor:'var(--blue)'}}/>
            <label htmlFor="ia" style={{fontSize:'.875rem',cursor:'pointer'}}>Active immediately</label>
          </div>
          <div className="modal-foot">
            <button type="button" className="btn btn-secondary" onClick={()=>setAddOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting?<span className="spin spin-sm"/>:'Add Schedule'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ── Doctor Prescriptions ──────────────────────────────────────────────────────
export function DoctorPrescriptions() {
  const { user } = useAuth();
  const uid = user?.userId||user?.UserId;
  const [presc, setPresc] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    prescriptionApi.getMyDoctor()
      .then(r=>{ const d=r?.data?.data??r?.data??[]; setPresc(Array.isArray(d)?d:[]); })
      .catch(e=>setErr(extractError(e))).finally(()=>setLoading(false));
  },[uid]);

  return (
    <div>
      <PH title="Prescriptions Issued" sub="All prescriptions you have written"/>
      <ErrBanner err={err}/>
      {loading ? <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:14}}>{Array.from({length:6}).map((_,i)=><div key={i} className="card pulse" style={{height:120}}/>)}</div>
      : presc.length===0 ? <Empty icon={FileText} title="No prescriptions issued" desc="They appear after completing appointments"/>
      : <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:14}}>
          {presc.map(p=>(
            <div key={p.prescriptionId||p.id} className="card" style={{borderTop:'3px solid var(--blue)'}}>
              <div style={{display:'flex',alignItems:'center',gap:9,marginBottom:12}}>
                <div style={{width:38,height:38,borderRadius:9,background:'var(--blue-d)',display:'flex',alignItems:'center',justifyContent:'center'}}><Pill size={17} color="var(--blue)"/></div>
                <div><div style={{fontWeight:700,fontFamily:'var(--font-h)'}}>{p.medicationName||'Medication'}</div><div style={{fontSize:'.72rem',color:'var(--text-2)'}}>{p.dosage}</div></div>
              </div>
              {p.frequency&&<div style={{display:'flex',alignItems:'center',gap:7,fontSize:'.8rem',marginBottom:5}}><Clock size={12} color="var(--text-3)"/><span style={{color:'var(--text-2)'}}>{p.frequency}</span></div>}
              {p.durationDays&&<span className="badge b-blue" style={{marginBottom:6}}>{p.durationDays} days</span>}
              {p.notes&&<div style={{marginTop:6,padding:'7px 10px',background:'var(--bg-s)',borderRadius:6,fontSize:'.78rem',color:'var(--text-2)'}}>{p.notes}</div>}
            </div>
          ))}
        </div>
      }
    </div>
  );
}
