import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, Menu, X, MapPin, BarChart2, Trophy, User, LogOut, Shield, Plus } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); setProfileOpen(false); };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">
        <Leaf size={22} color="var(--green)" />
        Clean<span>City</span>
      </Link>

      <div className="nav-links" style={{ display: menuOpen ? 'flex' : '' }}>
        <NavLink to="/reports" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Reports</NavLink>
        <NavLink to="/map" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><MapPin size={15} />Map</span>
        </NavLink>
        <NavLink to="/leaderboard" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Trophy size={15} />Leaders</span>
        </NavLink>
        {user && (
          <NavLink to="/dashboard" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><BarChart2 size={15} />Dashboard</span>
          </NavLink>
        )}
        {user && (user.role === 'admin' || user.role === 'municipal_officer') && (
          <NavLink to="/admin" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Shield size={15} />Admin</span>
          </NavLink>
        )}
      </div>

      <div className="nav-actions">
        {user ? (
          <>
            <Link to="/report/new">
              <button className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Plus size={16} /> Report
              </button>
            </Link>
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                style={{ background: 'var(--green-glow)', border: '1px solid var(--border-bright)', borderRadius: '50%', width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--green)' }}
              >
                <User size={18} />
              </button>
              {profileOpen && (
                <div style={{ position: 'absolute', right: 0, top: 48, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 8, minWidth: 180, zIndex: 100, boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
                  <div style={{ padding: '8px 12px 12px', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{user.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{user.email}</div>
                    <div style={{ color: 'var(--green)', fontSize: '0.75rem', marginTop: 4 }}>⭐ {user.points || 0} pts</div>
                  </div>
                  <Link to="/profile" onClick={() => setProfileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', color: 'var(--text-secondary)', textDecoration: 'none', borderRadius: 8, fontSize: '0.9rem' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--green-glow)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                  ><User size={15} /> Profile</Link>
                  <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', width: '100%', borderRadius: 8, fontSize: '0.9rem' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                  ><LogOut size={15} /> Logout</button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/login"><button className="btn-ghost" style={{ padding: '8px 18px', fontSize: '0.9rem' }}>Login</button></Link>
            <Link to="/register"><button className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.9rem' }}>Sign Up</button></Link>
          </>
        )}
      </div>
    </nav>
  );
}
