import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { User, Mail, Phone, MapPin, Star, FileText, CheckCircle, Edit2, Save } from 'lucide-react';

export function Profile() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await axios.put('/api/auth/profile', form);
      updateUser(res.data);
      toast.success('Profile updated!');
      setEditing(false);
    } catch { toast.error('Failed to update profile'); }
    finally { setSaving(false); }
  };

  if (!user) return null;

  return (
    <div className="page-container" style={{ maxWidth: 700 }}>
      <h1 className="section-title" style={{ marginBottom: 32 }}>My Profile</h1>

      {/* Avatar + basic */}
      <div className="glass-card" style={{ padding: 32, marginBottom: 24, display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, var(--green), var(--cyan))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 900, color: 'var(--bg-primary)', flexShrink: 0 }}>
          {user.name?.[0]}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{user.name}</h2>
              <span style={{ padding: '3px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, background: user.role === 'admin' ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.1)', color: user.role === 'admin' ? 'var(--red)' : 'var(--green)' }}>
                {user.role}
              </span>
            </div>
            <button onClick={() => setEditing(!editing)} className={editing ? 'btn-ghost' : 'btn-outline'} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontSize: '0.85rem' }}>
              {editing ? 'Cancel' : <><Edit2 size={14} /> Edit</>}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <Mail size={15} color="var(--text-muted)" /> {user.email}
            </div>
            {editing ? (
              <>
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input className="form-input" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Your address" />
                </div>
                <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            ) : (
              <>
                {user.phone && <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-secondary)', fontSize: '0.9rem' }}><Phone size={15} color="var(--text-muted)" /> {user.phone}</div>}
                {user.address && <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-secondary)', fontSize: '0.9rem' }}><MapPin size={15} color="var(--text-muted)" /> {user.address}</div>}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        {[
          { icon: <Star size={22} color="#f59e0b" />, label: 'Points', value: user.points || 0, color: '#f59e0b' },
          { icon: <FileText size={22} color="var(--cyan)" />, label: 'Reports Filed', value: user.reportsSubmitted || 0, color: 'var(--cyan)' },
          { icon: <CheckCircle size={22} color="var(--green)" />, label: 'Resolved', value: user.reportsResolved || 0, color: 'var(--green)' },
        ].map(s => (
          <div key={s.label} className="glass-card" style={{ padding: 20, textAlign: 'center' }}>
            <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'center' }}>{s.icon}</div>
            <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Joined */}
      <div className="glass-card" style={{ padding: 20, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        Member since {new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
      </div>
    </div>
  );
}

export function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/stats/leaderboard').then(res => setUsers(res.data)).finally(() => setLoading(false));
  }, []);

  const medals = ['🥇', '🥈', '🥉'];

  if (loading) return <div className="loading-screen"><div className="loader" /></div>;

  return (
    <div className="page-container" style={{ maxWidth: 700 }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h1 className="section-title">🏆 Leaderboard</h1>
        <p className="section-subtitle">Top citizens making their city cleaner</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {users.map((u, i) => (
          <div key={u._id} className="glass-card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16, transition: 'all 0.3s', border: i === 0 ? '1px solid rgba(245,158,11,0.3)' : 'var(--border)' }}>
            <div style={{ fontSize: '1.5rem', width: 36, textAlign: 'center', flexShrink: 0 }}>
              {medals[i] || `#${i + 1}`}
            </div>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: i === 0 ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'var(--green-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.1rem', color: i === 0 ? 'var(--bg-primary)' : 'var(--green)', flexShrink: 0 }}>
              {u.name?.[0]}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>{u.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.reportsSubmitted || 0} reports · {u.reportsResolved || 0} resolved</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: i === 0 ? '#f59e0b' : 'var(--green)' }}>
                {u.points || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>points</div>
            </div>
          </div>
        ))}

        {users.length === 0 && (
          <div className="glass-card" style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
            No rankings yet. Be the first to report an issue!
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
