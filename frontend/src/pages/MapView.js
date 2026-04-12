import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png', iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png' });

const severityColors = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444', critical: '#dc2626' };

export default function MapView() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [center] = useState([12.9716, 77.5946]); // Bengaluru default

  useEffect(() => {
    axios.get('/api/reports?limit=100')
      .then(res => setReports(res.data.reports.filter(r => r.location?.coordinates)))
      .finally(() => setLoading(false));
  }, []);

  const validReports = reports.filter(r => {
    const c = r.location?.coordinates;
    return c && c.length === 2 && !isNaN(c[0]) && !isNaN(c[1]);
  });

  return (
    <div style={{ paddingTop: 64, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px 24px', background: 'rgba(3,7,18,0.9)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.2rem', fontWeight: 800 }}>📍 Issue Map</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{validReports.length} reports plotted</p>
        </div>
        <div style={{ display: 'flex', gap: 16, fontSize: '0.8rem' }}>
          {Object.entries(severityColors).map(([s, c]) => (
            <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: c, display: 'inline-block' }} />
              {s}
            </span>
          ))}
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; OpenStreetMap contributors &copy; CARTO'
          />
          {validReports.map(r => {
            const [lng, lat] = r.location.coordinates;
            const color = severityColors[r.severity] || '#22c55e';
            return (
              <React.Fragment key={r._id}>
                <Circle center={[lat, lng]} radius={80} pathOptions={{ color, fillColor: color, fillOpacity: 0.2, weight: 1 }} />
                <Marker position={[lat, lng]}>
                  <Popup>
                    <div style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', minWidth: 220 }}>
                      <div style={{ fontWeight: 700, marginBottom: 6 }}>{r.title}</div>
                      <div style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: 8 }}>{r.location?.address || r.location?.city}</div>
                      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                        <span className={`badge badge-${r.status}`} style={{ fontSize: '0.7rem' }}>{r.status?.replace(/_/g, ' ')}</span>
                        <span className={`badge badge-${r.severity}`} style={{ fontSize: '0.7rem' }}>{r.severity}</span>
                      </div>
                      <a href={`/reports/${r._id}`} style={{ color: '#22c55e', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 600 }}>View Details →</a>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
