import React from 'react';
import { X } from 'lucide-react';

// ── Modal ──────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, size }) {
  if (!open) return null;
  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`modal${size === 'lg' ? ' modal-lg' : ''}`}>
        <div className="modal-head">
          <span className="modal-title">{title}</span>
          <button className="btn-icon" onClick={onClose} style={{ color: 'var(--text-2)' }}><X size={17} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Confirm ────────────────────────────────────────────────────────────────────
export function Confirm({ open, onClose, onConfirm, title, message, label = 'Confirm', danger, loading }) {
  if (!open) return null;
  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 370 }}>
        <div className="modal-head">
          <span className="modal-title">{title}</span>
          <button className="btn-icon" onClick={onClose} style={{ color: 'var(--text-2)' }}><X size={17} /></button>
        </div>
        <p style={{ color: 'var(--text-2)', fontSize: '.88rem', lineHeight: 1.6 }}>{message}</p>
        <div className="modal-foot">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm} disabled={loading}>
            {loading ? <span className="spin spin-sm" /> : label}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page Header ────────────────────────────────────────────────────────────────
export function PH({ title, sub, action }) {
  return (
    <div className="ph">
      <div><div className="ph-title">{title}</div>{sub && <div className="ph-sub">{sub}</div>}</div>
      {action}
    </div>
  );
}

// ── Smart Error Banner ─────────────────────────────────────────────────────────
const ERR_MAP = [
  { match: /not found|resource not found/i,      icon:'🔍', title:'Not Found',       color:'var(--yellow)', bg:'rgba(227,179,65,.08)', border:'rgba(227,179,65,.2)',  hint:"This resource doesn't exist or may have been removed." },
  { match: /network|ECONNREFUSED|api running/i,  icon:'📡', title:'Connection Error', color:'var(--red)',    bg:'rgba(248,81,73,.08)',   border:'rgba(248,81,73,.2)',   hint:'Cannot reach the server. Make sure the API is running on localhost:7047.' },
  { match: /unauthorized|not authenticated/i,    icon:'🔒', title:'Session Expired',  color:'var(--red)',    bg:'rgba(248,81,73,.08)',   border:'rgba(248,81,73,.2)',   hint:'Your session may have expired. Try logging out and back in.' },
  { match: /forbidden|access denied/i,           icon:'🚫', title:'Access Denied',    color:'var(--red)',    bg:'rgba(248,81,73,.08)',   border:'rgba(248,81,73,.2)',   hint:"You don't have permission to perform this action." },
  { match: /validation|required|invalid/i,       icon:'⚠️', title:'Validation Error', color:'var(--yellow)', bg:'rgba(227,179,65,.08)', border:'rgba(227,179,65,.2)', hint:null },
  { match: /already exists|duplicate/i,          icon:'📋', title:'Already Exists',   color:'var(--yellow)', bg:'rgba(227,179,65,.08)', border:'rgba(227,179,65,.2)', hint:'A record with this information already exists.' },
  { match: /server error|internal/i,             icon:'⚙️', title:'Server Error',     color:'var(--red)',    bg:'rgba(248,81,73,.08)',   border:'rgba(248,81,73,.2)',   hint:'Something went wrong on the server. Please try again.' },
];

export function ErrBanner({ err }) {
  if (!err) return null;
  const msg = typeof err === 'string' ? err : err?.message || 'Something went wrong';
  const matched = ERR_MAP.find(e => e.match.test(msg));
  const { icon, title, color, bg, border, hint } = matched || {
    icon: '❌', title: 'Error', color: 'var(--red)',
    bg: 'rgba(248,81,73,.08)', border: 'rgba(248,81,73,.2)', hint: null,
  };
  const showDetail = msg && msg.toLowerCase() !== title.toLowerCase();

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 14,
      background: bg, border: `1px solid ${border}`,
      borderRadius: 'var(--r)', padding: '14px 16px',
      marginBottom: 18, animation: 'slideUp .2s ease',
    }}>
      <span style={{ fontSize: '1.15rem', lineHeight: 1.2, flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: '.88rem', color, fontFamily: 'var(--font-h)', marginBottom: 2 }}>
          {title}
        </div>
        {showDetail && (
          <div style={{ fontSize: '.81rem', color, opacity: .8, marginBottom: hint ? 5 : 0, lineHeight: 1.5 }}>
            {msg}
          </div>
        )}
        {hint && (
          <div style={{ fontSize: '.77rem', color, opacity: .55, lineHeight: 1.5 }}>
            {hint}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Status Badge ───────────────────────────────────────────────────────────────
const STS = { Scheduled:'b-blue', Completed:'b-green', Cancelled:'b-red', NoShow:'b-yellow' };
export function StatusBadge({ v }) {
  return <span className={`badge ${STS[v] || 'b-gray'}`}>{v}</span>;
}

// ── Spec Badge ─────────────────────────────────────────────────────────────────
const SPC = { Cardiology:'b-red', Nephrology:'b-blue', Oncology:'b-purple', Pulmonology:'b-blue',
  Psychiatry:'b-purple', Endocrinology:'b-yellow', Rheumatology:'b-yellow',
  Neurology:'b-purple', Orthopedics:'b-green', General:'b-gray' };
export function SpecBadge({ v }) {
  return <span className={`badge ${SPC[v] || 'b-gray'}`}>{v}</span>;
}

// ── Skeleton rows ──────────────────────────────────────────────────────────────
export function SkeletonRows({ rows = 5, cols = 4 }) {
  return Array.from({ length: rows }).map((_, i) => (
    <tr key={i}>{Array.from({ length: cols }).map((_, j) => (
      <td key={j}><div className="pulse" style={{ height: 13, background: 'var(--bg-s)', borderRadius: 4, width: j === 0 ? '55%' : '75%' }} /></td>
    ))}</tr>
  ));
}

// ── Empty State ────────────────────────────────────────────────────────────────
export function Empty({ icon: Icon, title, desc, action }) {
  return (
    <div className="empty">
      {Icon && <Icon size={44} />}
      <h3>{title}</h3>
      {desc && <p>{desc}</p>}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}

// ── Small info row ─────────────────────────────────────────────────────────────
export function InfoRow({ icon: Icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
      {Icon && <Icon size={13} color="var(--text-3)" />}
      <span style={{ fontSize: '.8rem', color: 'var(--text-2)', minWidth: 90 }}>{label}</span>
      <span style={{ fontSize: '.82rem', fontWeight: 600 }}>{value || '—'}</span>
    </div>
  );
}
