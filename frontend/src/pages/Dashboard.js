import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FileText, CheckCircle, Clock, AlertTriangle, Star, Plus, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

const PIE_COLORS = ['#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#818cf8', '#f43f5e'];

const statusColors = {
  pending: 'var(--amber)', under_review: 'var(--cyan)', in_progress: '#818cf8', resolved: 'var(--green)', rejected: 'var(--red)'
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [myReports, setMyReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('/api/stats/overview'),
      axios.get('/api/reports/user/my-reports')
    ]).then(([s, r]) => {
      setStats(s.data);
      setMyReports(r.data);
    }).catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen"><div className="loader" /></div>;

  const myStats = [
    { icon: <FileText size={20} />, label: 'Total Reports', value: user.reportsSubmitted || 0, color: 'var(--cyan)' },
    { icon: <CheckCircle size={20} />, label: 'Resolved', value: user.reportsResolved || 0, color: 'var(--green)' },
    { icon: <Clock size={20} />, label: 'Active Reports', value: myReports.filter(r => r.status !== 'resolved' && r.status !== 'rejected').length, color: 'var(--amber)' },
    { icon: <Star size={20} />, label: 'Points Earned', value: user.points || 0, color: '#f43f5e' },
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="section-title">My Dashboard</h1>
          <p className="section-subtitle">Welcome back, {user.name}! 👋</p>
        </div>
        <Link to="/report/new">
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Plus size={18} /> New Report
          </button>
        </Link>
      </div>

      {/* My Stats */}
      <div className="grid-4" style={{ marginBottom: 32 }}>
        {myStats.map(s => (
          <div key={s.label} className="glass-card stat-card animate-fadeInUp">
            <div style={{ color: s.color }}>{s.icon}</div>
            <div className="stat-number" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* City Stats + Charts */}
      {stats && (
        <>
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={20} color="var(--green)" /> City Overview
            </h2>
          </div>

          <div className="grid-2" style={{ marginBottom: 32 }}>
            {/* Bar chart */}
            <div className="glass-card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 20 }}>Reports Last 7 Days</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats.last7Days}>
                  <XAxis dataKey="_id" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} />
                  <Bar dataKey="count" fill="var(--green)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie chart */}
            <div className="glass-card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 20 }}>By Category</h3>
              <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie data={stats.categoryCounts} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={80} strokeWidth={0}>
                      {stats.categoryCounts.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex: 1 }}>
                  {stats.categoryCounts.map((c, i) => (
                    <div key={c._id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: '0.8rem' }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                      <span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{c._id?.replace(/_/g, ' ')}</span>
                      <span style={{ marginLeft: 'auto', fontWeight: 700 }}>{c.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Global counters */}
          <div className="grid-4" style={{ marginBottom: 40 }}>
            {[
              { label: 'Total Reports', value: stats.total, color: 'var(--text-primary)' },
              { label: 'Pending', value: stats.pending, color: 'var(--amber)' },
              { label: 'In Progress', value: stats.inProgress, color: '#818cf8' },
              { label: 'Resolved', value: stats.resolved, color: 'var(--green)' },
            ].map(s => (
              <div key={s.label} className="glass-card" style={{ padding: 20, textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: s.color }}>{s.value}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* My Reports */}
      <div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 20 }}>My Recent Reports</h2>
        {myReports.length === 0 ? (
          <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
            <AlertTriangle size={40} color="var(--text-muted)" style={{ marginBottom: 16 }} />
            <p style={{ color: 'var(--text-muted)' }}>No reports yet. <Link to="/report/new" style={{ color: 'var(--green)' }}>File your first one!</Link></p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {myReports.slice(0, 8).map(r => (
              <Link to={`/reports/${r._id}`} key={r._id} style={{ textDecoration: 'none' }}>
                <div className="glass-card report-card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  {r.images?.[0] ? (
                    <img src={r.images[0].url} alt="" style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 56, height: 56, borderRadius: 10, background: 'var(--green-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>🗑️</div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{r.location?.address || r.location?.city || 'Location not set'} · {new Date(r.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <span className={`badge badge-${r.status}`}>{r.status?.replace(/_/g, ' ')}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
