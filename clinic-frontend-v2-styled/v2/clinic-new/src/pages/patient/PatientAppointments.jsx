import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentApi, extractError } from '../../api';
import { PH, StatusBadge, SkeletonRows, Modal, Confirm, ErrBanner } from '../../components/ui';
import { Plus, RefreshCw, X, Trash2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const unwrapList = res => {
  const d = res?.data;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d)) return d;
  return [];
};

const toLocalISOString = (v) => !v ? null : v.length === 16 ? v + ':00.000' : v;

const FILTERS = ['All','Scheduled','Completed','Cancelled','NoShow'];

export default function PatientAppointments() {
  const navigate = useNavigate();
  const [apts, setApts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr]     = useState('');
  const [filter, setFilter] = useState('All');

  const [resch, setResch] = useState({ open:false, id:null });
  const [newDt, setNewDt] = useState('');
  const [rLoading, setRL] = useState(false);

  const [cancel, setCancel] = useState({ open:false, id:null });
  const [cLoading, setCL]   = useState(false);

  const [del, setDel]     = useState({ open:false, id:null });
  const [dLoading, setDL] = useState(false);

  const load = async () => {
    setLoading(true); setErr('');
    try { setApts(unwrapList(await appointmentApi.getMyPatient())); }
    catch (e) { setErr(extractError(e)); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = filter === 'All' ? apts : apts.filter(a => a.status === filter);

  const doReschedule = async () => {
    if (!newDt) return toast.error('Pick a date/time');
    setRL(true);
    try {
      await appointmentApi.reschedule(resch.id, { newDateTime: toLocalISOString(newDt) });
      toast.success('Rescheduled!'); setResch({open:false,id:null}); load();
    } catch (e) { toast.error(extractError(e)); }
    finally { setRL(false); }
  };

  const doCancel = async () => {
    setCL(true);
    try { await appointmentApi.cancel(cancel.id); toast.success('Cancelled'); setCancel({open:false,id:null}); load(); }
    catch (e) { toast.error(extractError(e)); }
    finally { setCL(false); }
  };

  const doDelete = async () => {
    setDL(true);
    try { await appointmentApi.delete(del.id); toast.success('Deleted'); setDel({open:false,id:null}); load(); }
    catch (e) { toast.error(extractError(e)); }
    finally { setDL(false); }
  };

  return (
    <div>
      <PH title="My Appointments" sub="Manage all your appointments"
        action={<button className="btn btn-primary" onClick={()=>navigate('/patient/book')}><Plus size={15}/>Book New</button>}
      />
      <ErrBanner err={err} />

      <div className="pills">
        {FILTERS.map(f => (
          <button key={f} className={`pill${filter===f?' active':''}`} onClick={() => setFilter(f)}>
            {f}{f!=='All' && <> ({apts.filter(a=>a.status===f).length})</>}
          </button>
        ))}
      </div>

      <div className="tbl-wrap">
        <table>
          <thead><tr><th>Doctor</th><th>Specialization</th><th>Date & Time</th><th>Status</th><th>Notes</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? <SkeletonRows cols={6}/>
            : filtered.length === 0
              ? <tr><td colSpan={6}><div style={{ textAlign:'center',padding:'44px 0',color:'var(--text-3)' }}><Calendar size={32} style={{ margin:'0 auto 10px',display:'block',opacity:.2 }}/>No appointments found</div></td></tr>
              : filtered.map(a => (
                <tr key={a.appointmentId}>
                  <td><div style={{ fontWeight:600,fontSize:'.875rem' }}>Dr. {a.doctorName}</div></td>
                  <td><span className="badge b-blue">{a.doctorSpecialization}</span></td>
                  <td style={{ fontSize:'.85rem' }}>
                    {a.appointmentDt ? format(new Date(a.appointmentDt),'MMM dd, yyyy') : '—'}
                    <div style={{ fontSize:'.72rem',color:'var(--text-2)' }}>{a.appointmentDt ? format(new Date(a.appointmentDt),'HH:mm') : ''}</div>
                  </td>
                  <td><StatusBadge v={a.status}/></td>
                  <td style={{ fontSize:'.8rem',color:'var(--text-2)',maxWidth:160 }}><span className="trunc" style={{ display:'block' }}>{a.notes||'—'}</span></td>
                  <td>
                    <div style={{ display:'flex',gap:5 }}>
                      {a.status === 'Scheduled' && <>
                        <button className="btn btn-secondary btn-sm" onClick={()=>setResch({open:true,id:a.appointmentId})} title="Reschedule"><RefreshCw size={12}/></button>
                        <button className="btn btn-danger btn-sm" onClick={()=>setCancel({open:true,id:a.appointmentId})} title="Cancel"><X size={12}/></button>
                      </>}
                      <button className="btn btn-danger btn-sm" onClick={()=>setDel({open:true,id:a.appointmentId})} title="Delete"><Trash2 size={12}/></button>
                    </div>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {/* Reschedule */}
      <Modal open={resch.open} onClose={()=>setResch({open:false,id:null})} title="Reschedule Appointment">
        <div className="fg">
          <label className="fl">New Date & Time</label>
          <input className="fi" type="datetime-local" value={newDt} onChange={e=>setNewDt(e.target.value)} min={new Date().toISOString().slice(0,16)} />
        </div>
        <div className="modal-foot">
          <button className="btn btn-secondary" onClick={()=>setResch({open:false,id:null})}>Cancel</button>
          <button className="btn btn-primary" onClick={doReschedule} disabled={rLoading}>{rLoading?<span className="spin spin-sm"/>:'Reschedule'}</button>
        </div>
      </Modal>

      <Confirm open={cancel.open} onClose={()=>setCancel({open:false,id:null})} onConfirm={doCancel} title="Cancel Appointment" message="Are you sure you want to cancel this appointment?" label="Cancel Appointment" danger loading={cLoading}/>
      <Confirm open={del.open} onClose={()=>setDel({open:false,id:null})} onConfirm={doDelete} title="Delete Appointment" message="This will permanently delete the appointment record." label="Delete" danger loading={dLoading}/>
    </div>
  );
}
