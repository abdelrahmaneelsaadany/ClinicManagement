import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi, extractError } from '../../api';
import { Stethoscope, CheckCircle } from 'lucide-react';
import { ErrBanner } from '../../components/ui';
import toast from 'react-hot-toast';

const COUNTRIES = ['Egypt','Saudi Arabia','UAE','USA','UK','Canada','Germany','Other'];

export function RegisterPatientPage() {
  const navigate = useNavigate();
  const [f, setF] = useState({ email:'',password:'',firstName:'',lastName:'',country:'Egypt',address:'',gender:'Male',role:'Patient' });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const set = (k,v) => setF(p=>({...p,[k]:v}));

  const submit = async e => {
    e.preventDefault(); setErr(''); setLoading(true);
    try {
      await authApi.registerPatient(f);
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (ex) { setErr(extractError(ex)); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div style={{ position:'absolute',bottom:-200,left:-200,width:500,height:500,background:'radial-gradient(circle,rgba(52,211,153,.06) 0%,transparent 70%)',pointerEvents:'none' }} />
      <div className="auth-box" style={{ maxWidth:500 }}>
        <div className="auth-logo">
          <div className="auth-icon" style={{ background:'linear-gradient(135deg,var(--green),var(--blue))' }}><Stethoscope size={22} color="#fff" /></div>
          <div className="auth-title">Patient Registration</div>
          <div className="auth-sub">Join ClinicMS to manage your health</div>
        </div>
        <div className="card card-lg">
          <ErrBanner err={err} />
          <form onSubmit={submit}>
            <div className="g2">
              <div className="fg"><label className="fl">First Name</label><input className="fi" placeholder="John" value={f.firstName} onChange={e=>set('firstName',e.target.value)} required /></div>
              <div className="fg"><label className="fl">Last Name</label><input className="fi" placeholder="Doe" value={f.lastName} onChange={e=>set('lastName',e.target.value)} required /></div>
            </div>
            <div className="fg"><label className="fl">Email</label><input className="fi" type="email" placeholder="you@example.com" value={f.email} onChange={e=>set('email',e.target.value)} required /></div>
            <div className="fg"><label className="fl">Password</label><input className="fi" type="password" placeholder="Min. 6 characters" value={f.password} onChange={e=>set('password',e.target.value)} required minLength={6} /></div>
            <div className="g2">
              <div className="fg"><label className="fl">Country</label><select className="fs" value={f.country} onChange={e=>set('country',e.target.value)}>{COUNTRIES.map(c=><option key={c}>{c}</option>)}</select></div>
              <div className="fg"><label className="fl">Gender</label><select className="fs" value={f.gender} onChange={e=>set('gender',e.target.value)}><option value="Male">Male</option><option value="Female">Female</option></select></div>
            </div>
            <div className="fg"><label className="fl">Address</label><input className="fi" placeholder="123 Main St" value={f.address} onChange={e=>set('address',e.target.value)} /></div>
            <button type="submit" className="btn btn-success btn-lg w-full" disabled={loading} style={{ marginTop:6 }}>
              {loading ? <><span className="spin" />Creating…</> : <><CheckCircle size={15}/>Create Account</>}
            </button>
          </form>
          <div className="auth-links">Already have an account? <Link to="/login">Sign in</Link></div>
        </div>
      </div>
    </div>
  );
}

const SPECS = ['Cardiology','Nephrology','Oncology','Pulmonology','Psychiatry','Endocrinology','Rheumatology','Neurology','Orthopedics','General'];

export function RegisterDoctorPage() {
  const navigate = useNavigate();
  const [f, setF] = useState({ email:'',password:'',firstName:'',lastName:'',country:'Egypt',address:'',specialization:'General',yearsExperience:1,role:'Doctor' });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const set = (k,v) => setF(p=>({...p,[k]:v}));

  const submit = async e => {
    e.preventDefault(); setErr(''); setLoading(true);
    try {
      await authApi.registerDoctor({ ...f, yearsExperience: Number(f.yearsExperience) });
      toast.success('Doctor account created! Please sign in.');
      navigate('/login');
    } catch (ex) { setErr(extractError(ex)); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div style={{ position:'absolute',top:-200,right:-200,width:500,height:500,background:'radial-gradient(circle,rgba(79,142,247,.07) 0%,transparent 70%)',pointerEvents:'none' }} />
      <div className="auth-box" style={{ maxWidth:500 }}>
        <div className="auth-logo">
          <div className="auth-icon"><Stethoscope size={22} color="#fff" /></div>
          <div className="auth-title">Doctor Registration</div>
          <div className="auth-sub">Join our medical team</div>
        </div>
        <div className="card card-lg">
          <ErrBanner err={err} />
          <form onSubmit={submit}>
            <div className="g2">
              <div className="fg"><label className="fl">First Name</label><input className="fi" placeholder="Dr. John" value={f.firstName} onChange={e=>set('firstName',e.target.value)} required /></div>
              <div className="fg"><label className="fl">Last Name</label><input className="fi" placeholder="Smith" value={f.lastName} onChange={e=>set('lastName',e.target.value)} required /></div>
            </div>
            <div className="fg"><label className="fl">Email</label><input className="fi" type="email" value={f.email} onChange={e=>set('email',e.target.value)} required /></div>
            <div className="fg"><label className="fl">Password</label><input className="fi" type="password" placeholder="Min. 6 characters" value={f.password} onChange={e=>set('password',e.target.value)} required minLength={6} /></div>
            <div className="g2">
              <div className="fg"><label className="fl">Specialization</label><select className="fs" value={f.specialization} onChange={e=>set('specialization',e.target.value)}>{SPECS.map(s=><option key={s}>{s}</option>)}</select></div>
              <div className="fg"><label className="fl">Years Experience</label><input className="fi" type="number" min={0} max={60} value={f.yearsExperience} onChange={e=>set('yearsExperience',e.target.value)} required /></div>
            </div>
            <div className="g2">
              <div className="fg"><label className="fl">Country</label><select className="fs" value={f.country} onChange={e=>set('country',e.target.value)}>{COUNTRIES.map(c=><option key={c}>{c}</option>)}</select></div>
              <div className="fg"><label className="fl">Address</label><input className="fi" placeholder="Clinic address" value={f.address} onChange={e=>set('address',e.target.value)} /></div>
            </div>
            <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading} style={{ marginTop:6 }}>
              {loading ? <><span className="spin" />Creating…</> : <><CheckCircle size={15}/>Register as Doctor</>}
            </button>
          </form>
          <div className="auth-links">Already have an account? <Link to="/login">Sign in</Link></div>
        </div>
      </div>
    </div>
  );
}
