import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, User, Mail, Lock, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.phone);
      toast.success('Account created! Welcome to Clean City!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const fields = [
    { name: 'name', label: 'Full Name', type: 'text', icon: <User size={16} />, placeholder: 'John Doe' },
    { name: 'email', label: 'Email', type: 'email', icon: <Mail size={16} />, placeholder: 'you@example.com' },
    { name: 'phone', label: 'Phone (optional)', type: 'tel', icon: <Phone size={16} />, placeholder: '+91 98765 43210' },
    { name: 'password', label: 'Password', type: 'password', icon: <Lock size={16} />, placeholder: 'Min. 6 characters' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', background: 'radial-gradient(ellipse at center, rgba(34,197,94,0.05) 0%, transparent 70%)' }}>
      <div className="glass-card animate-fadeInUp" style={{ width: '100%', maxWidth: 440, padding: 40 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ display: 'inline-flex', padding: 12, background: 'rgba(34,197,94,0.1)', borderRadius: 14, marginBottom: 16 }}>
            <Leaf size={28} color="var(--green)" />
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900 }}>Join Clean City</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>Start making a difference today</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {fields.map(f => (
            <div key={f.name} className="form-group">
              <label className="form-label">{f.label}</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>{f.icon}</span>
                <input name={f.name} type={f.type} className="form-input" style={{ paddingLeft: 40 }} value={form[f.name]} onChange={handleChange} placeholder={f.placeholder} required={f.name !== 'phone'} />
              </div>
            </div>
          ))}

          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '1rem', marginTop: 8 }} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Already a member? <Link to="/login" style={{ color: 'var(--green)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </div>

        <div style={{ marginTop: 20, padding: 14, background: 'rgba(34,197,94,0.05)', borderRadius: 10, border: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          🌱 Earn points for every report. Help make your city cleaner!
        </div>
      </div>
    </div>
  );
}
