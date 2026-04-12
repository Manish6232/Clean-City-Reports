import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { MapPin, ThumbsUp, MessageSquare, Calendar, User, Zap, ArrowLeft, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png', iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png' });

export default function ReportDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [upvoted, setUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(0);
  const [selectedImg, setSelectedImg] = useState(0);

  useEffect(() => {
    axios.get(`/api/reports/${id}`)
      .then(res => {
        setReport(res.data);
        setUpvoteCount(res.data.upvotes?.length || 0);
        if (user) setUpvoted(res.data.upvotes?.includes(user._id));
      })
      .catch(() => toast.error('Report not found'))
      .finally(() => setLoading(false));
  }, [id, user]);

  const handleUpvote = async () => {
    if (!user) return toast.error('Login to upvote');
    try {
      const res = await axios.post(`/api/reports/${id}/upvote`);
      setUpvoted(res.data.upvoted);
      setUpvoteCount(res.data.upvotes);
    } catch { toast.error('Failed to upvote'); }
  };

  const handleComment = async e => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmittingComment(true);
    try {
      const res = await axios.post(`/api/reports/${id}/comments`, { text: comment });
      setReport(prev => ({ ...prev, comments: res.data }));
      setComment('');
      toast.success('Comment added!');
    } catch { toast.error('Failed to add comment'); }
    finally { setSubmittingComment(false); }
  };

  if (loading) return <div className="loading-screen"><div className="loader" /></div>;
  if (!report) return <div className="page-container"><p>Report not found.</p></div>;

  const coords = report.location?.coordinates;

  return (
    <div className="page-container">
      <button onClick={() => navigate(-1)} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
        <ArrowLeft size={16} /> Back
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 28 }}>
        {/* Main */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Header */}
          <div className="glass-card" style={{ padding: 28 }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
              <span className={`badge badge-${report.status}`}>{report.status?.replace(/_/g, ' ')}</span>
              <span className={`badge badge-${report.severity}`}>{report.severity}</span>
              <span className="tag">{report.category?.replace(/_/g, ' ')}</span>
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: 12 }}>{report.title}</h1>

            <div style={{ display: 'flex', gap: 20, color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 20, flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><User size={14} />{report.reporter?.name}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Calendar size={14} />{new Date(report.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={14} />{report.location?.city || report.location?.address || 'Location not specified'}</span>
            </div>

            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{report.description}</p>

            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button onClick={handleUpvote}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, border: `1px solid ${upvoted ? 'var(--green)' : 'var(--border)'}`, background: upvoted ? 'var(--green-glow)' : 'transparent', color: upvoted ? 'var(--green)' : 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, transition: 'all 0.2s' }}>
                <ThumbsUp size={16} /> {upvoteCount} Upvotes
              </button>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <MessageSquare size={16} /> {report.comments?.length || 0} Comments
              </span>
            </div>
          </div>

          {/* Images */}
          {report.images?.length > 0 && (
            <div className="glass-card" style={{ padding: 24 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Photos</h3>
              <img src={report.images[selectedImg]?.url} alt="" style={{ width: '100%', maxHeight: 400, objectFit: 'cover', borderRadius: 12, marginBottom: 12 }} />
              {report.images.length > 1 && (
                <div style={{ display: 'flex', gap: 8 }}>
                  {report.images.map((img, i) => (
                    <img key={i} src={img.url} alt="" onClick={() => setSelectedImg(i)}
                      style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: 8, cursor: 'pointer', border: `2px solid ${selectedImg === i ? 'var(--green)' : 'transparent'}`, opacity: selectedImg === i ? 1 : 0.6, transition: 'all 0.2s' }} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* AI Analysis */}
          {report.aiAnalysis?.priorityScore && (
            <div className="glass-card" style={{ padding: 24 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Zap size={18} color="var(--green)" /> AI Analysis
              </h3>
              <div className="ai-panel">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                  <div style={{ textAlign: 'center', padding: 16, background: 'rgba(0,0,0,0.2)', borderRadius: 10 }}>
                    <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: report.aiAnalysis.priorityScore >= 7 ? 'var(--red)' : report.aiAnalysis.priorityScore >= 4 ? 'var(--amber)' : 'var(--green)' }}>{report.aiAnalysis.priorityScore}/10</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4, textTransform: 'uppercase' }}>Priority Score</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: 16, background: 'rgba(0,0,0,0.2)', borderRadius: 10 }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--cyan)' }}>{report.aiAnalysis.estimatedResolutionTime}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4, textTransform: 'uppercase' }}>Est. Resolution</div>
                  </div>
                </div>
                {report.aiAnalysis.detectedIssues?.length > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>DETECTED ISSUES</div>
                    {report.aiAnalysis.detectedIssues.map((issue, i) => <div key={i} style={{ fontSize: '0.85rem', padding: '3px 0', color: 'var(--text-primary)' }}>⚠ {issue}</div>)}
                  </div>
                )}
                {report.aiAnalysis.recommendedActions?.length > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>RECOMMENDED ACTIONS</div>
                    {report.aiAnalysis.recommendedActions.map((a, i) => <div key={i} style={{ fontSize: '0.85rem', padding: '3px 0', color: 'var(--text-primary)' }}>✓ {a}</div>)}
                  </div>
                )}
                {report.aiAnalysis.environmentalImpact && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', padding: 10, background: 'rgba(245,158,11,0.1)', borderRadius: 8 }}>
                    🌱 {report.aiAnalysis.environmentalImpact}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status History */}
          {report.statusHistory?.length > 0 && (
            <div className="glass-card" style={{ padding: 24 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Clock size={18} color="var(--cyan)" /> Status Timeline</h3>
              <div style={{ position: 'relative', paddingLeft: 20 }}>
                <div style={{ position: 'absolute', left: 6, top: 8, bottom: 8, width: 2, background: 'var(--border)', borderRadius: 1 }} />
                {report.statusHistory.map((h, i) => (
                  <div key={i} style={{ position: 'relative', paddingBottom: 20 }}>
                    <div style={{ position: 'absolute', left: -17, top: 6, width: 10, height: 10, borderRadius: '50%', background: 'var(--green)', border: '2px solid var(--bg-primary)' }} />
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'capitalize' }}>{h.status?.replace(/_/g, ' ')}</div>
                    {h.note && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>{h.note}</div>}
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{new Date(h.timestamp).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          <div className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}><MessageSquare size={18} /> Comments ({report.comments?.length || 0})</h3>
            {user && (
              <form onSubmit={handleComment} style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                <input className="form-input" value={comment} onChange={e => setComment(e.target.value)} placeholder="Add a comment..." style={{ flex: 1 }} />
                <button type="submit" className="btn-primary" disabled={submittingComment} style={{ padding: '11px 20px' }}>{submittingComment ? '...' : 'Post'}</button>
              </form>
            )}
            {report.comments?.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No comments yet. Be the first!</p>}
            {report.comments?.map((c, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '14px 0', borderBottom: i < report.comments.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--green-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--green)', fontWeight: 700, fontSize: '0.85rem' }}>
                  {c.user?.name?.[0] || 'U'}
                </div>
                <div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{c.user?.name || 'User'}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(c.createdAt).toLocaleString()}</span>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.5 }}>{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Map */}
          {coords && (
            <div className="glass-card" style={{ padding: 16 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 14, fontSize: '0.95rem' }}>📍 Location</h3>
              <div style={{ borderRadius: 12, overflow: 'hidden', height: 220 }}>
                <MapContainer center={[coords[1], coords[0]]} zoom={15} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[coords[1], coords[0]]}>
                    <Popup>{report.title}</Popup>
                  </Marker>
                </MapContainer>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 10 }}>
                {report.location?.address && <>{report.location.address}<br /></>}
                {report.location?.city && <>{report.location.city} {report.location?.pincode}</>}
              </p>
            </div>
          )}

          {/* Reporter */}
          <div className="glass-card" style={{ padding: 20 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 14, fontSize: '0.95rem' }}>Reporter</h3>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--green-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green)', fontWeight: 700 }}>
                {report.reporter?.name?.[0]}
              </div>
              <div>
                <div style={{ fontWeight: 700 }}>{report.reporter?.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{report.reporter?.email}</div>
              </div>
            </div>
          </div>

          {/* Assigned officer */}
          {report.assignedTo && (
            <div className="glass-card" style={{ padding: 20 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 12, fontSize: '0.95rem' }}>Assigned Officer</h3>
              <div style={{ fontSize: '0.9rem' }}>{report.assignedTo?.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{report.assignedTo?.email}</div>
            </div>
          )}

          {/* Quick info */}
          <div className="glass-card" style={{ padding: 20 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 14, fontSize: '0.95rem' }}>Details</h3>
            {[
              ['Reported', new Date(report.createdAt).toLocaleDateString()],
              ['Category', report.category?.replace(/_/g, ' ')],
              ['Severity', report.severity],
              ['Upvotes', report.upvotes?.length || 0],
              report.resolvedAt ? ['Resolved', new Date(report.resolvedAt).toLocaleDateString()] : null,
            ].filter(Boolean).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
