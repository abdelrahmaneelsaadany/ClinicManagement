import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi, doctorApi, scheduleApi, extractError } from '../../api';
import { PH, SpecBadge, SkeletonRows, ErrBanner } from '../../components/ui';
import { Users, Stethoscope, Calendar, Activity, ArrowRight, Search, ToggleLeft, ToggleRight, Mail, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const unwrapList = res => { const d=res?.data; if(Array.isArray(d?.data)) return d.data; if(Array.isArray(d)) return d; return []; };
const COLORS = ['#4f8ef7','#34d399','#fbbf24','#f87171','#a78bfa','#60a5fa','#fb923c','#4ade80','#f472b6','#94a3b8'];

// ── Admin Dashboard ───────────────────────────────────────────────────────────
export function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers]   = useState([]);
  const [docs, setDocs]     = useState([]);
  const [scheds, setScheds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      userApi.getAll().catch(()=>({data:{data:[]}})),
      doctorApi.getAvailable().catch(()=>({data:{data:[]}})),
      scheduleApi.getActive().catch(()=>({data:{data:[]}})),
    ]).then(([u,d,s])=>{ setUsers(unwrapList(u)); setDocs(unwrapList(d)); setScheds(unwrapList(s)); })
    .finally(()=>setLoading(false));
  },[]);

  const patients = users.filter(u=>u.role==='Patient'||u.userRole==='Patient');
  const specMap  = docs.reduce((a,d)=>{ const s=d.specialization||'General'; a[s]=(a[s]||0)+1; return a; },{});
  const specData = Object.entries(specMap).map(([name,value])=>({name,value}));

  const stats = [
    {label:'Total Users',    val:users.length,   color:'var(--blue)',   bg:'var(--blue-d)',   icon:Users,      path:'/admin/users'},
    {label:'Patients',       val:patients.length, color:'var(--green)',  bg:'var(--green-d)',  icon:Activity,   path:'/admin/users'},
    {label:'Avail. Doctors', val:docs.length,     color:'var(--purple)', bg:'var(--purple-d)', icon:Stethoscope,path:'/admin/doctors'},
    {label:'Active Schedules',val:scheds.length,  color:'var(--yellow)', bg:'var(--yellow-d)', icon:Calendar,   path:'/admin/doctors'},
  ];

  return (
    <div>
      <PH title="Admin Dashboard" sub="System overview and management"/>
      <div className="stat-grid">
        {stats.map(s=>(
          <div key={s.label} className="stat-card" style={{cursor:'pointer'}} onClick={()=>navigate(s.path)}>
            <div className="stat-icon" style={{background:s.bg}}><s.icon size={17} color={s.color}/></div>
            <div className="stat-val" style={{color:s.color}}>{loading?'—':s.val}</div>
            <div className="stat-lbl">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="dash-cols">
        <div className="card">
          <div style={{fontFamily:'var(--font-h)',fontWeight:700,marginBottom:18}}>Doctors by Specialization</div>
          {loading ? <div style={{display:'flex',justifyContent:'center',padding:60}}><span className="spin"/></div>
          : specData.length===0 ? <div style={{textAlign:'center',padding:40,color:'var(--text-3)'}}>No data</div>
          : <ResponsiveContainer width="100%" height={210}>
              <PieChart>
                <Pie data={specData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                  {specData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                </Pie>
                <Tooltip contentStyle={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:8,fontFamily:'var(--font-b)',fontSize:12}}/>
              </PieChart>
            </ResponsiveContainer>
          }
        </div>

        <div className="card">
          <div style={{fontFamily:'var(--font-h)',fontWeight:700,marginBottom:14}}>Quick Actions</div>
          {[{label:'Manage All Users',sub:'View and search user accounts',path:'/admin/users',color:'var(--blue)'},
            {label:'Manage Doctors', sub:'Toggle availability, view schedules',path:'/admin/doctors',color:'var(--purple)'}
          ].map(a=>(
            <button key={a.path} onClick={()=>navigate(a.path)} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'13px 15px',background:'var(--bg-s)',border:'1px solid var(--border)',borderRadius:9,cursor:'pointer',textAlign:'left',width:'100%',marginBottom:9,color:'var(--text)',fontFamily:'var(--font-b)',transition:'all var(--tr)'}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=a.color;e.currentTarget.style.background='var(--bg-card)';}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='var(--bg-s)';}}>
              <div><div style={{fontWeight:600,fontSize:'.88rem',marginBottom:2}}>{a.label}</div><div style={{fontSize:'.78rem',color:'var(--text-2)'}}>{a.sub}</div></div>
              <ArrowRight size={15} color={a.color}/>
            </button>
          ))}
          <div style={{marginTop:16}}>
            <div style={{fontSize:'.75rem',fontWeight:700,color:'var(--text-3)',marginBottom:9,letterSpacing:'.08em',textTransform:'uppercase'}}>Recent Users</div>
            {loading ? <span className="spin"/> : users.slice(0,4).map(u=>(
              <div key={u.id||u.userId} style={{display:'flex',alignItems:'center',gap:9,padding:'7px 0',borderBottom:'1px solid var(--border)'}}>
                <div style={{width:28,height:28,borderRadius:'50%',background:'var(--blue-d)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.7rem',fontWeight:700,color:'var(--blue)',flexShrink:0}}>
                  {u.firstName?.[0]}{u.lastName?.[0]}
                </div>
                <div style={{flex:1}}><div style={{fontSize:'.8rem',fontWeight:600}}>{u.firstName} {u.lastName}</div><div style={{fontSize:'.7rem',color:'var(--text-3)'}}>{u.email}</div></div>
                <span className={`badge ${u.role==='Doctor'||u.userRole==='Doctor'?'b-blue':u.role==='Admin'||u.userRole==='Admin'?'b-purple':'b-green'}`} style={{fontSize:'.63rem'}}>{u.role||u.userRole}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Admin Users ───────────────────────────────────────────────────────────────
export function AdminUsers() {
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr]       = useState('');
  const [search, setSearch] = useState('');
  const [role, setRole]     = useState('All');

  useEffect(() => {
    userApi.getAll().then(r=>setUsers(unwrapList(r))).catch(e=>setErr(extractError(e))).finally(()=>setLoading(false));
  },[]);

  const emailSearch = async () => {
    if (!search.includes('@')) return;
    setLoading(true);
    try { const r=await userApi.getByEmail(search); const d=r?.data?.data??r?.data; setUsers(d?[d]:[]); }
    catch(e) { setErr(extractError(e)); }
    finally { setLoading(false); }
  };

  const filtered = users.filter(u=>{
    const name=`${u.firstName||''} ${u.lastName||''} ${u.email||''}`.toLowerCase();
    const mS = name.includes(search.toLowerCase());
    const uRole = u.role||u.userRole||'';
    const mR = role==='All' || uRole===role;
    return mS&&mR;
  });

  return (
    <div>
      <PH title="Users" sub={`${users.length} total users`}/>
      <ErrBanner err={err}/>
      <div style={{display:'flex',gap:10,marginBottom:18}}>
        <div className="search-wrap" style={{flex:1}}>
          <Search size={14}/><input className="fi" placeholder="Search by name or email (press Enter to search by email)…" value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&emailSearch()} style={{paddingLeft:34}}/>
        </div>
        <select className="fs" style={{width:145}} value={role} onChange={e=>setRole(e.target.value)}>
          <option value="All">All Roles</option>
          <option value="Patient">Patients</option>
          <option value="Doctor">Doctors</option>
          <option value="Admin">Admins</option>
        </select>
      </div>
      <div className="tbl-wrap">
        <table>
          <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Country</th><th>Gender</th></tr></thead>
          <tbody>
            {loading ? <SkeletonRows cols={5}/>
            : filtered.length===0 ? <tr><td colSpan={5} style={{textAlign:'center',padding:'44px 0',color:'var(--text-3)'}}>No users found</td></tr>
            : filtered.map(u=>(
              <tr key={u.id||u.userId}>
                <td><div style={{display:'flex',alignItems:'center',gap:9}}>
                  <div style={{width:32,height:32,borderRadius:'50%',background:'var(--blue-d)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.72rem',fontWeight:700,color:'var(--blue)',flexShrink:0}}>{u.firstName?.[0]}{u.lastName?.[0]}</div>
                  <div><div style={{fontWeight:600,fontSize:'.875rem'}}>{u.firstName} {u.lastName}</div><div style={{fontSize:'.7rem',color:'var(--text-3)'}}>ID: {(u.id||u.userId||'').toString().slice(0,8)}…</div></div>
                </div></td>
                <td><div style={{display:'flex',alignItems:'center',gap:5,fontSize:'.83rem'}}><Mail size={12} color="var(--text-3)"/>{u.email}</div></td>
                <td><span className={`badge ${u.role==='Doctor'||u.userRole==='Doctor'?'b-blue':u.role==='Admin'||u.userRole==='Admin'?'b-purple':'b-green'}`}>{u.role||u.userRole}</span></td>
                <td><div style={{display:'flex',alignItems:'center',gap:5,fontSize:'.83rem',color:'var(--text-2)'}}><MapPin size={12} color="var(--text-3)"/>{u.country||'—'}</div></td>
                <td style={{fontSize:'.83rem',color:'var(--text-2)'}}>{u.gender||'—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Admin Doctors ─────────────────────────────────────────────────────────────
export function AdminDoctors() {
  const [docs, setDocs]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr]       = useState('');
  const [search, setSearch] = useState('');
  const [spec, setSpec]     = useState('All');
  const [toggling, setTog]  = useState({});
  const [selDoc, setSelDoc] = useState(null);
  const [sched, setSched]   = useState([]);
  const [sLoad, setSLoad]   = useState(false);

  const SPECS = ['All','Cardiology','Nephrology','Oncology','Pulmonology','Psychiatry','Endocrinology','Rheumatology','Neurology','Orthopedics','General'];

  const load = () => {
    setLoading(true);
    const call = spec==='All' ? doctorApi.getAvailable() : doctorApi.getBySpec(spec);
    call.then(r=>setDocs(unwrapList(r))).catch(e=>setErr(extractError(e))).finally(()=>setLoading(false));
  };
  useEffect(()=>{ load(); },[spec]);

  const toggleAvail = async (uid, cur) => {
    setTog(t=>({...t,[uid]:true}));
    try {
      // admin can't use setAvailability (it uses CurrentUserId) — show info
      toast('Availability can only be toggled by the doctor themselves.',{icon:'ℹ️'});
    } finally { setTog(t=>({...t,[uid]:false})); }
  };

  const viewSched = async doc => {
    setSelDoc(doc); setSLoad(true);
    try {
      // NOTE: /api/DoctorSchedule/doctor uses CurrentUserId from token
      // Admin can view active schedules filtered by doctor name only
      const all = unwrapList(await scheduleApi.getActive());
      const docUserId = doc.userId || doc.UserId;
      // filter by doctorId field in the response if available
      const filtered = all.filter(s => s.doctorUserId === docUserId || s.doctorId === docUserId);
      setSched(filtered.length > 0 ? filtered : all.slice(0, 5));
    }
    catch { setSched([]); }
    finally { setSLoad(false); }
  };

  const filtered = docs.filter(d=>`${d.firstName||''} ${d.lastName||''}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <PH title="Doctors" sub="View doctor profiles and schedules"/>
      <ErrBanner err={err}/>
      <div style={{display:'grid',gridTemplateColumns:selDoc?'1fr 300px':'1fr',gap:18}}>
        <div>
          <div style={{display:'flex',gap:10,marginBottom:18}}>
            <div className="search-wrap" style={{flex:1}}><Search size={14}/><input className="fi" placeholder="Search doctors…" value={search} onChange={e=>setSearch(e.target.value)} style={{paddingLeft:34}}/></div>
            <select className="fs" style={{width:175}} value={spec} onChange={e=>setSpec(e.target.value)}>{SPECS.map(s=><option key={s}>{s}</option>)}</select>
          </div>
          <div className="tbl-wrap">
            <table>
              <thead><tr><th>Doctor</th><th>Specialization</th><th>Experience</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {loading ? <SkeletonRows cols={5}/>
                : filtered.length===0 ? <tr><td colSpan={5} style={{textAlign:'center',padding:'40px 0',color:'var(--text-3)'}}>No doctors found</td></tr>
                : filtered.map(d=>(
                  <tr key={d.userId}>
                    <td><div style={{display:'flex',alignItems:'center',gap:9}}>
                      <div style={{width:32,height:32,borderRadius:'50%',background:'var(--blue-d)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.72rem',fontWeight:700,color:'var(--blue)',flexShrink:0}}>{d.firstName?.[0]}{d.lastName?.[0]}</div>
                      <div><div style={{fontWeight:600,fontSize:'.875rem'}}>Dr. {d.firstName} {d.lastName}</div><div style={{fontSize:'.7rem',color:'var(--text-3)'}}>{d.country}</div></div>
                    </div></td>
                    <td><SpecBadge v={d.specialization}/></td>
                    <td style={{fontSize:'.85rem'}}>{d.yearsExperience}y</td>
                    <td><span className={`badge ${d.isAvailable?'b-green':'b-red'}`}>{d.isAvailable?'Available':'Unavailable'}</span></td>
                    <td><button className="btn btn-secondary btn-sm" onClick={()=>viewSched(d)}><Calendar size={13}/>Schedule</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selDoc && (
          <div>
            <div className="card">
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                <div><div style={{fontFamily:'var(--font-h)',fontWeight:700,fontSize:'.92rem'}}>Dr. {selDoc.firstName}'s Schedule</div><div style={{fontSize:'.72rem',color:'var(--text-2)'}}>{selDoc.specialization}</div></div>
                <button className="btn-icon btn-secondary" onClick={()=>setSelDoc(null)} style={{color:'var(--text-2)',background:'var(--bg-s)',border:'1px solid var(--border)',borderRadius:6,padding:5,cursor:'pointer'}}>✕</button>
              </div>
              {sLoad ? <div style={{display:'flex',justifyContent:'center',padding:40}}><span className="spin"/></div>
              : sched.length===0 ? <div style={{textAlign:'center',padding:'28px 0',color:'var(--text-3)',fontSize:'.83rem'}}>No schedule configured</div>
              : <div className="flex flex-col gap-2">
                  {sched.map(s=>(
                    <div key={s.id} style={{padding:'9px 11px',background:'var(--bg-s)',borderRadius:8,border:`1px solid ${s.isActive?'rgba(52,211,153,.2)':'var(--border)'}`}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                        <span style={{fontWeight:600,fontSize:'.83rem'}}>{s.weekDay}</span>
                        <span className={`badge ${s.isActive?'b-green':'b-red'}`} style={{fontSize:'.63rem'}}>{s.isActive?'Active':'Inactive'}</span>
                      </div>
                      <div style={{fontSize:'.75rem',color:'var(--text-2)',marginTop:3}}>{s.startTime?.slice(0,5)}–{s.endTime?.slice(0,5)} · {s.slotDurationMinutes}min slots</div>
                    </div>
                  ))}
                </div>
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
