import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Stethoscope, Eye, EyeOff } from 'lucide-react';
import { ErrBanner } from '../../components/ui';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [f, setF] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [show, setShow] = useState(false);

  const submit = async e => {
    e.preventDefault(); setErr(''); setLoading(true);
    try {
      const u = await login(f.email, f.password);
      toast.success(`Welcome back!`);
      if (u.role === 'Doctor')  navigate('/doctor/dashboard');
      else if (u.role === 'Admin') navigate('/admin/dashboard');
      else navigate('/patient/dashboard');
    } catch (ex) {
      const d = ex?.response?.data;
      const msg = d?.error?.error || d?.result?.error || d?.message || d?.title
        || (typeof d === 'string' ? d : '') || ex.message || 'Login failed';
      setErr(msg);
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div style={{ position:'absolute', top:-200, right:-200, width:500, height:500, background:'radial-gradient(circle,rgba(79,142,247,.07) 0%,transparent 70%)', pointerEvents:'none' }} />
      <div className="auth-box">
        <div className="auth-logo">
          <div className="auth-icon"><Stethoscope size={22} color="#fff" /></div>
          <div className="auth-title">ClinicMS</div>
          <div className="auth-sub">Sign in to your account</div>
        </div>
        <div className="card card-lg">
          <ErrBanner err={err} />
          <form onSubmit={submit}>
            <div className="fg">
              <label className="fl">Email</label>
              <input className="fi" type="email" placeholder="you@example.com" value={f.email} onChange={e=>setF({...f,email:e.target.value})} required autoFocus />
            </div>
            <div className="fg">
              <label className="fl">Password</label>
              <div style={{ position:'relative' }}>
                <input className="fi" type={show?'text':'password'} placeholder="••••••••" value={f.password} onChange={e=>setF({...f,password:e.target.value})} required style={{ paddingRight:40 }} />
                <button type="button" onClick={()=>setShow(!show)} style={{ position:'absolute',right:11,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:'var(--text-3)',cursor:'pointer' }}>
                  {show?<EyeOff size={15}/>:<Eye size={15}/>}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading} style={{ marginTop:6 }}>
              {loading ? <><span className="spin" />Signing in…</> : 'Sign In'}
            </button>
          </form>
          <div className="auth-links">
            No account? <Link to="/register/patient">Register as Patient</Link> · <Link to="/register/doctor">Register as Doctor</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
