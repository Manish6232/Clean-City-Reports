import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { MapPin, Upload, Zap, X, Loader } from 'lucide-react';

const CATEGORIES = [
  { value: 'garbage_dump', label: '🗑️ Garbage Dump' },
  { value: 'overflowing_bin', label: '🗂️ Overflowing Bin' },
  { value: 'littering', label: '🚮 Littering' },
  { value: 'hazardous_waste', label: '☢️ Hazardous Waste' },
  { value: 'drain_blockage', label: '🌊 Drain Blockage' },
  { value: 'street_cleaning', label: '🧹 Street Cleaning' },
  { value: 'other', label: '📋 Other' },
];

const SEVERITIES = [
  { value: 'low', label: '🟢 Low', desc: 'Minor issue, not urgent' },
  { value: 'medium', label: '🟡 Medium', desc: 'Needs attention soon' },
  { value: 'high', label: '🔴 High', desc: 'Urgent, health risk' },
  { value: 'critical', label: '🚨 Critical', desc: 'Immediate action needed' },
];

export default function ReportForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ title: '', description: '', category: 'garbage_dump', severity: 'medium', address: '', city: '', pincode: '' });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [location, setLocation] = useState({ lat: '', lng: '' });
  const [gettingLocation, setGettingLocation] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onDrop = useCallback(files => {
    const validFiles = files.filter(f => f.type.startsWith('image/')).slice(0, 5 - images.length);
    setImages(prev => [...prev, ...validFiles]);
    validFiles.forEach(f => {
      const reader = new FileReader();
      reader.onload = e => setPreviews(prev => [...prev, e.target.result]);
      reader.readAsDataURL(f);
    });
  }, [images.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] }, maxFiles: 5 });

  const removeImage = idx => {
    setImages(prev => prev.filter((_, i) => i !== idx));
    setPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const getLocation = () => {
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLocation({ lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6) });
        setGettingLocation(false);
        toast.success('Location detected!');
      },
      () => { toast.error('Could not get location. Please enter manually.'); setGettingLocation(false); }
    );
  };

  const runAiAnalysis = async () => {
    if (!form.description || !form.category) return toast.error('Fill in description first');
    setAnalyzing(true);
    try {
      const res = await axios.post('/api/ai/analyze', {
        description: form.description,
        category: form.category,
        severity: form.severity,
        imageUrls: previews
      });
      setAiAnalysis(res.data.analysis);
      toast.success('AI analysis complete!');
    } catch { toast.error('AI analysis failed, but you can still submit'); }
    finally { setAnalyzing(false); }
  };

  const handleSubmit = async () => {
    if (!location.lat || !location.lng) return toast.error('Location is required');
    if (!form.title || !form.description) return toast.error('Title and description are required');
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append('lat', location.lat);
      fd.append('lng', location.lng);
      images.forEach(img => fd.append('images', img));

      const res = await axios.post('/api/reports', fd, { headers: { 'Content-Type': 'multipart/form-data' } });

      // Save AI analysis
      if (aiAnalysis) {
        await axios.post(`/api/ai/analyze/${res.data._id}`, { analysis: aiAnalysis });
      }

      toast.success('Report submitted successfully!');
      navigate(`/reports/${res.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit report');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="page-container" style={{ maxWidth: 800 }}>
      <div style={{ marginBottom: 36 }}>
        <h1 className="section-title">Report an Issue</h1>
        <p className="section-subtitle">Help keep your city clean. Every report matters.</p>
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 36 }}>
        {['Details', 'Photos', 'Location', 'AI Review'].map((s, i) => (
          <div key={s} style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ height: 4, borderRadius: 2, background: step > i ? 'var(--green)' : step === i + 1 ? 'var(--green)' : 'var(--border)', marginBottom: 8, transition: 'background 0.3s' }} />
            <span style={{ fontSize: '0.75rem', color: step === i + 1 ? 'var(--green)' : 'var(--text-muted)', fontWeight: step === i + 1 ? 700 : 400 }}>{s}</span>
          </div>
        ))}
      </div>

      {/* Step 1: Details */}
      {step === 1 && (
        <div className="glass-card animate-fadeInUp" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Brief description of the issue" required />
          </div>
          <div className="form-group">
            <label className="form-label">Category *</label>
            <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Severity *</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {SEVERITIES.map(s => (
                <div key={s.value} onClick={() => setForm({ ...form, severity: s.value })}
                  style={{ padding: '12px 16px', border: `1px solid ${form.severity === s.value ? 'var(--green)' : 'var(--border)'}`, background: form.severity === s.value ? 'var(--green-glow)' : 'rgba(255,255,255,0.02)', borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{s.label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea className="form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe the issue in detail. What do you see? How severe is it? Any immediate risks?" rows={5} required />
          </div>
          <button className="btn-primary" style={{ alignSelf: 'flex-end', padding: '12px 32px' }} onClick={() => setStep(2)}>
            Next: Photos →
          </button>
        </div>
      )}

      {/* Step 2: Photos */}
      {step === 2 && (
        <div className="glass-card animate-fadeInUp" style={{ padding: 32 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 20 }}>Upload Photos (up to 5)</h2>
          <div {...getRootProps()} style={{ border: `2px dashed ${isDragActive ? 'var(--green)' : 'var(--border)'}`, borderRadius: 14, padding: 40, textAlign: 'center', cursor: 'pointer', background: isDragActive ? 'var(--green-glow)' : 'rgba(255,255,255,0.02)', transition: 'all 0.2s', marginBottom: 20 }}>
            <input {...getInputProps()} />
            <Upload size={32} color={isDragActive ? 'var(--green)' : 'var(--text-muted)'} style={{ marginBottom: 12 }} />
            <p style={{ color: isDragActive ? 'var(--green)' : 'var(--text-secondary)', fontWeight: 600 }}>
              {isDragActive ? 'Drop photos here!' : 'Drag & drop or click to upload photos'}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 6 }}>JPG, PNG, WebP — max 10MB each</p>
          </div>
          {previews.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12, marginBottom: 24 }}>
              {previews.map((p, i) => (
                <div key={i} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', aspectRatio: '1' }}>
                  <img src={p} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button onClick={() => removeImage(i)} style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button className="btn-ghost" onClick={() => setStep(1)}>← Back</button>
            <button className="btn-primary" onClick={() => setStep(3)}>Next: Location →</button>
          </div>
        </div>
      )}

      {/* Step 3: Location */}
      {step === 3 && (
        <div className="glass-card animate-fadeInUp" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Set Location *</h2>
          <button className="btn-outline" onClick={getLocation} disabled={gettingLocation} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 8 }}>
            {gettingLocation ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <MapPin size={16} />}
            {gettingLocation ? 'Getting location...' : 'Use My Current Location'}
          </button>
          {location.lat && (
            <div style={{ padding: 12, background: 'var(--green-glow)', border: '1px solid var(--border)', borderRadius: 10, fontSize: '0.85rem', color: 'var(--green)' }}>
              ✅ Location detected: {location.lat}, {location.lng}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Latitude</label>
              <input className="form-input" value={location.lat} onChange={e => setLocation({ ...location, lat: e.target.value })} placeholder="e.g. 12.9716" />
            </div>
            <div className="form-group">
              <label className="form-label">Longitude</label>
              <input className="form-input" value={location.lng} onChange={e => setLocation({ ...location, lng: e.target.value })} placeholder="e.g. 77.5946" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Address</label>
            <input className="form-input" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Street address or landmark" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">City</label>
              <input className="form-input" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="Bengaluru" />
            </div>
            <div className="form-group">
              <label className="form-label">Pincode</label>
              <input className="form-input" value={form.pincode} onChange={e => setForm({ ...form, pincode: e.target.value })} placeholder="560001" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button className="btn-ghost" onClick={() => setStep(2)}>← Back</button>
            <button className="btn-primary" onClick={() => setStep(4)}>Next: AI Review →</button>
          </div>
        </div>
      )}

      {/* Step 4: AI Review */}
      {step === 4 && (
        <div className="animate-fadeInUp" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="glass-card" style={{ padding: 28 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Zap size={18} color="var(--green)" /> AI-Powered Analysis
            </h2>
            {!aiAnalysis ? (
              <div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: '0.9rem' }}>
                  Get instant AI analysis of your report — priority score, recommended actions and environmental impact assessment.
                </p>
                <button className="btn-primary" onClick={runAiAnalysis} disabled={analyzing} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {analyzing ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Analyzing...</> : <><Zap size={16} /> Run AI Analysis</>}
                </button>
              </div>
            ) : (
              <div className="ai-panel">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Priority Score</div>
                    <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: aiAnalysis.priorityScore >= 7 ? 'var(--red)' : aiAnalysis.priorityScore >= 4 ? 'var(--amber)' : 'var(--green)' }}>
                      {aiAnalysis.priorityScore}/10
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Est. Resolution</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--cyan)' }}>{aiAnalysis.estimatedResolutionTime}</div>
                  </div>
                </div>

                {aiAnalysis.detectedIssues && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase' }}>Detected Issues</div>
                    {aiAnalysis.detectedIssues.map((issue, i) => (
                      <div key={i} style={{ fontSize: '0.85rem', color: 'var(--text-primary)', padding: '4px 0', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <span style={{ color: 'var(--red)', marginTop: 2 }}>⚠</span> {issue}
                      </div>
                    ))}
                  </div>
                )}

                {aiAnalysis.recommendedActions && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase' }}>Recommended Actions</div>
                    {aiAnalysis.recommendedActions.map((action, i) => (
                      <div key={i} style={{ fontSize: '0.85rem', color: 'var(--text-primary)', padding: '4px 0', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <span style={{ color: 'var(--green)', marginTop: 2 }}>✓</span> {action}
                      </div>
                    ))}
                  </div>
                )}

                {aiAnalysis.environmentalImpact && (
                  <div style={{ padding: 12, background: 'rgba(245,158,11,0.1)', borderRadius: 8, border: '1px solid rgba(245,158,11,0.2)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    🌱 <strong>Environmental Impact:</strong> {aiAnalysis.environmentalImpact}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Report Summary</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: '0.9rem' }}>
              <div><span style={{ color: 'var(--text-muted)' }}>Title:</span> <span style={{ fontWeight: 600 }}>{form.title}</span></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Category:</span> <span style={{ fontWeight: 600 }}>{form.category?.replace(/_/g, ' ')}</span></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Severity:</span> <span className={`badge badge-${form.severity}`}>{form.severity}</span></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Photos:</span> <span style={{ fontWeight: 600 }}>{images.length} uploaded</span></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Location:</span> <span style={{ fontWeight: 600 }}>{location.lat ? `${location.lat}, ${location.lng}` : 'Not set'}</span></div>
              <div><span style={{ color: 'var(--text-muted)' }}>City:</span> <span style={{ fontWeight: 600 }}>{form.city || 'Not set'}</span></div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button className="btn-ghost" onClick={() => setStep(3)}>← Back</button>
            <button className="btn-primary" onClick={handleSubmit} disabled={submitting} style={{ padding: '12px 32px', display: 'flex', alignItems: 'center', gap: 8 }}>
              {submitting ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Submitting...</> : '🚀 Submit Report'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
