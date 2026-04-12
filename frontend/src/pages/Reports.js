import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Search, Filter, MapPin, ThumbsUp, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';

const CATS = ['', 'garbage_dump', 'overflowing_bin', 'littering', 'hazardous_waste', 'drain_blockage', 'street_cleaning', 'other'];
const STATUSES = ['', 'pending', 'under_review', 'in_progress', 'resolved', 'rejected'];
const SEVERITIES = ['', 'low', 'medium', 'high', 'critical'];

const catEmoji = { garbage_dump: '🗑️', overflowing_bin: '🗂️', littering: '🚮', hazardous_waste: '☢️', drain_blockage: '🌊', street_cleaning: '🧹', other: '📋' };

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', category: '', severity: '' });
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 12 });
    if (filters.status) params.append('status', filters.status);
    if (filters.category) params.append('category', filters.category);
    if (filters.severity) params.append('severity', filters.severity);

    axios.get(`/api/reports?${params}`)
      .then(res => { setReports(res.data.reports); setTotal(res.data.total); setPages(res.data.pages); })
      .finally(() => setLoading(false));
  }, [page, filters]);

  const filtered = search ? reports.filter(r =>
    r.title?.toLowerCase().includes(search.toLowerCase()) ||
    r.location?.address?.toLowerCase().includes(search.toLowerCase()) ||
    r.location?.city?.toLowerCase().includes(search.toLowerCase())
  ) : reports;

  return (
    <div className="page-container">
      <div style={{ marginBottom: 32 }}>
        <h1 className="section-title">All Reports</h1>
        <p className="section-subtitle">{total} reports filed by the community</p>
      </div>

      {/* Search & Filters */}
      <div className="glass-card" style={{ padding: 20, marginBottom: 28, display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 180 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="form-input" style={{ paddingLeft: 38, margin: 0 }} placeholder="Search reports..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-select" style={{ flex: '1 1 140px', maxWidth: 180 }} value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All Status</option>
          {STATUSES.filter(Boolean).map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
        <select className="form-select" style={{ flex: '1 1 160px', maxWidth: 200 }} value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })}>
          <option value="">All Categories</option>
          {CATS.filter(Boolean).map(c => <option key={c} value={c}>{catEmoji[c]} {c.replace(/_/g, ' ')}</option>)}
        </select>
        <select className="form-select" style={{ flex: '1 1 130px', maxWidth: 160 }} value={filters.severity} onChange={e => setFilters({ ...filters, severity: e.target.value })}>
          <option value="">All Severity</option>
          {SEVERITIES.filter(Boolean).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="loading-screen" style={{ minHeight: 300 }}><div className="loader" /></div>
      ) : filtered.length === 0 ? (
        <div className="glass-card" style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
          No reports found matching your filters.
        </div>
      ) : (
        <div className="grid-3">
          {filtered.map((r, i) => (
            <Link to={`/reports/${r._id}`} key={r._id} style={{ textDecoration: 'none' }}>
              <div className={`glass-card report-card stagger-${(i % 4) + 1} animate-fadeInUp`} style={{ height: '100%' }}>
                {r.images?.[0] ? (
                  <img src={r.images[0].url} alt={r.title} style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: '12px 12px 0 0', margin: '-20px -20px 16px', width: 'calc(100% + 40px)' }} />
                ) : (
                  <div style={{ background: 'rgba(34,197,94,0.08)', borderRadius: '8px 8px 0 0', margin: '-20px -20px 16px', width: 'calc(100% + 40px)', height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>
                    {catEmoji[r.category] || '📋'}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                  <span className={`badge badge-${r.status}`}>{r.status?.replace(/_/g, ' ')}</span>
                  <span className={`badge badge-${r.severity}`}>{r.severity}</span>
                </div>

                <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 8, lineHeight: 1.4 }}>{r.title}</h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 12 }}>
                  <MapPin size={12} />
                  {r.location?.city || r.location?.address || 'Location not set'}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 'auto' }}>
                  <span>By {r.reporter?.name || 'Anonymous'}</span>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><ThumbsUp size={12} />{r.upvotes?.length || 0}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MessageSquare size={12} />{r.comments?.length || 0}</span>
                  </div>
                </div>

                {r.aiAnalysis?.priorityScore && (
                  <div style={{ marginTop: 10, padding: '6px 10px', background: 'var(--green-glow)', borderRadius: 8, fontSize: '0.75rem', color: 'var(--green)' }}>
                    🤖 AI Priority: {r.aiAnalysis.priorityScore}/10
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40 }}>
          <button className="btn-ghost" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
            <ChevronLeft size={18} />
          </button>
          {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              style={{ padding: '8px 14px', border: `1px solid ${p === page ? 'var(--green)' : 'var(--border)'}`, background: p === page ? 'var(--green-glow)' : 'transparent', color: p === page ? 'var(--green)' : 'var(--text-secondary)', borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-display)' }}>
              {p}
            </button>
          ))}
          <button className="btn-ghost" onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}>
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
