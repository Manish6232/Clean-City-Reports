import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { Shield, CheckCircle, Clock, Users, BarChart2, Filter, Eye } from 'lucide-react';

const STATUSES = ['pending', 'under_review', 'in_progress', 'resolved', 'rejected'];

export default function AdminPanel() {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('reports');
  const [filterStatus, setFilterStatus] = useState('');
  const [users, setUsers] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    Promise.all([
      axios.get('/api/reports?limit=50'),
      axios.get('/api/stats/overview'),
      axios.get('/api/users')
    ]).then(([r, s, u]) => {
      setReports(r.data.reports);
      setStats(s.data);
      setUsers(u.data);
    }).catch(() => toast.error('Failed to load admin data'))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (reportId, status) => {
    const note = prompt(`Note for status change to "${status}":`);
    if (note === null) return;
    setUpdatingId(reportId);
    try {
      const res = await axios.put(`/api/reports/${reportId}/status`, { status, note });
      setReports(prev => prev.map(r => r._id === reportId ? res.data : r));
      toast.success(`Status updated to ${status}`);
    } catch { toast.error('Failed to update status'); }
    finally { setUpdatingId(null); }
  };

  const filtered = filterStatus ? reports.filter(r => r.status === filterStatus) : reports;

  if (loading) return <div className="loading-screen"><div className="loader" /></div>;

  return (
    <div className="page-container">
      <div style={{ marginBottom: 32 }}>
        <h1 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Shield size={28} color="var(--green)" /> Admin Panel
        </h1>
        <p className="section-subtitle">Manage reports and municipal operations</p>
      </div>

      {/* Overview Stats */}
      {stats && (
        <div className="grid-4" style={{ marginBottom: 32 }}>
          {[
            { label: 'Total Reports', value: stats.total, color: 'var(--text-primary)', icon: <BarChart2 size={18} /> },
            { label: 'Pending', value: stats.pending, color: 'var(--amber)', icon: <Clock size={18} /> },
            { label: 'In Progress', value: stats.inProgress, color: '#818cf8', icon: <Filter size={18} /> },
            { label: 'Resolved', value: stats.resolved, color: 'var(--green)', icon: <CheckCircle size={18} /> },
          ].map(s => (
            <div key={s.label} className="glass-card" style={{ padding: 20 }}>
              <div style={{ color: s.color, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 4, width: 'fit-content' }}>
        {['reports', 'users'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: tab === t ? 'var(--green-glow)' : 'transparent', color: tab === t ? 'var(--green)' : 'var(--text-muted)', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', textTransform: 'capitalize', borderColor: tab === t ? 'var(--border-bright)' : 'transparent' }}>
            {t === 'reports' ? '📋 Reports' : '👥 Users'}
          </button>
        ))}
      </div>

      {tab === 'reports' && (
        <>
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
            <select className="form-select" style={{ maxWidth: 200 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">All Status</option>
              {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </select>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{filtered.length} reports</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(r => (
              <div key={r._id} className="glass-card" style={{ padding: 20, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                {r.images?.[0] ? (
                  <img src={r.images[0].url} alt="" style={{ width: 60, height: 60, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 60, height: 60, borderRadius: 10, background: 'var(--green-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>🗑️</div>
                )}

                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>{r.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                    {r.reporter?.name} · {r.location?.city || 'No location'} · {new Date(r.createdAt).toLocaleDateString()}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span className={`badge badge-${r.severity}`}>{r.severity}</span>
                    <span className="tag" style={{ fontSize: '0.72rem' }}>{r.category?.replace(/_/g, ' ')}</span>
                    {r.aiAnalysis?.priorityScore && <span className="tag" style={{ fontSize: '0.72rem', color: 'var(--green)' }}>🤖 AI:{r.aiAnalysis.priorityScore}/10</span>}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span className={`badge badge-${r.status}`}>{r.status?.replace(/_/g, ' ')}</span>
                  <select
                    value={r.status}
                    onChange={e => updateStatus(r._id, e.target.value)}
                    disabled={updatingId === r._id}
                    style={{ padding: '7px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'var(--font-display)' }}>
                    {STATUSES.map(s => <option key={s} value={s} style={{ background: 'var(--bg-secondary)' }}>{s.replace(/_/g, ' ')}</option>)}
                  </select>
                  <Link to={`/reports/${r._id}`}>
                    <button className="btn-ghost" style={{ padding: '7px 12px', display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.85rem' }}>
                      <Eye size={14} /> View
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {users.map(u => (
            <div key={u._id} className="glass-card" style={{ padding: 20, display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--green-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green)', fontWeight: 700, fontSize: '1.1rem', flexShrink: 0 }}>
                {u.name?.[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{u.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.email} · Joined {new Date(u.createdAt).toLocaleDateString()}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--green)', fontWeight: 700 }}>⭐ {u.points || 0} pts</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.reportsSubmitted || 0} reports</div>
              </div>
              <div>
                <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, background: u.role === 'admin' ? 'rgba(239,68,68,0.15)' : u.role === 'municipal_officer' ? 'rgba(99,102,241,0.15)' : 'rgba(34,197,94,0.1)', color: u.role === 'admin' ? 'var(--red)' : u.role === 'municipal_officer' ? '#818cf8' : 'var(--green)' }}>
                  {u.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
