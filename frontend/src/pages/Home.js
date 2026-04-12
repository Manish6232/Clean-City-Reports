import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, MapPin, Camera, TrendingUp, Zap, Shield, Users, ArrowRight } from 'lucide-react';
import * as THREE from 'three';

function ThreeScene() {
  const mountRef = useRef(null);

  useEffect(() => {
    const w = mountRef.current.clientWidth;
    const h = mountRef.current.clientHeight;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // Globe
    const geo = new THREE.SphereGeometry(1, 64, 64);
    const mat = new THREE.MeshPhongMaterial({
      color: 0x0f172a,
      emissive: 0x022c22,
      wireframe: false,
      transparent: true,
      opacity: 0.9
    });
    const globe = new THREE.Mesh(geo, mat);
    scene.add(globe);

    // Wireframe overlay
    const wireMat = new THREE.MeshBasicMaterial({ color: 0x22c55e, wireframe: true, transparent: true, opacity: 0.08 });
    const wireGlobe = new THREE.Mesh(new THREE.SphereGeometry(1.01, 32, 32), wireMat);
    scene.add(wireGlobe);

    // Glow sphere
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x22c55e, transparent: true, opacity: 0.04, side: THREE.BackSide });
    const glow = new THREE.Mesh(new THREE.SphereGeometry(1.3, 32, 32), glowMat);
    scene.add(glow);

    // Particles — hotspots on globe
    const ptsGeo = new THREE.BufferGeometry();
    const positions = [];
    for (let i = 0; i < 200; i++) {
      const phi = Math.acos(-1 + (2 * i) / 200);
      const theta = Math.sqrt(200 * Math.PI) * phi;
      positions.push(
        1.05 * Math.cos(theta) * Math.sin(phi),
        1.05 * Math.sin(theta) * Math.sin(phi),
        1.05 * Math.cos(phi)
      );
    }
    ptsGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const ptsMat = new THREE.PointsMaterial({ color: 0x22c55e, size: 0.018, transparent: true, opacity: 0.7 });
    scene.add(new THREE.Points(ptsGeo, ptsMat));

    // Orbiting ring
    const ringGeo = new THREE.TorusGeometry(1.4, 0.003, 8, 100);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x22c55e, transparent: true, opacity: 0.3 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.5;
    scene.add(ring);

    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.002, 8, 100), new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.2 }));
    ring2.rotation.x = Math.PI / 3;
    ring2.rotation.z = Math.PI / 6;
    scene.add(ring2);

    // Lights
    scene.add(new THREE.AmbientLight(0x1a2e1a, 1));
    const pLight = new THREE.PointLight(0x22c55e, 2, 10);
    pLight.position.set(3, 3, 3);
    scene.add(pLight);
    const pLight2 = new THREE.PointLight(0x06b6d4, 1, 10);
    pLight2.position.set(-3, -2, -3);
    scene.add(pLight2);

    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      globe.rotation.y += 0.003;
      wireGlobe.rotation.y += 0.003;
      ring.rotation.z += 0.005;
      ring2.rotation.y += 0.004;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w2 = mountRef.current.clientWidth;
      const h2 = mountRef.current.clientHeight;
      camera.aspect = w2 / h2;
      camera.updateProjectionMatrix();
      renderer.setSize(w2, h2);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement.parentNode) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
}

const features = [
  { icon: <Camera size={24} />, title: 'Photo Reports', desc: 'Upload photos of garbage spots with AI-powered issue detection and categorization.' },
  { icon: <MapPin size={24} />, title: 'GPS Location', desc: 'Auto-detect location or pin on map. Track issues on interactive city heat map.' },
  { icon: <TrendingUp size={24} />, title: 'Track Status', desc: 'Real-time updates on complaint status from pending to resolved with notifications.' },
  { icon: <Zap size={24} />, title: 'AI Recommendations', desc: 'Claude AI analyzes reports, scores priority and recommends resolution actions.' },
  { icon: <Shield size={24} />, title: 'Admin Panel', desc: 'Municipal officers get a dedicated dashboard to manage and resolve reports.' },
  { icon: <Users size={24} />, title: 'Community', desc: 'Upvote issues, earn points, climb the leaderboard. Make your city cleaner.' },
];

const stats = [
  { number: '2,400+', label: 'Reports Filed' },
  { number: '87%', label: 'Resolution Rate' },
  { number: '12K+', label: 'Active Citizens' },
  { number: '48hr', label: 'Avg. Resolution' },
];

export default function Home() {
  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Hero */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        {/* BG */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 20% 50%, rgba(34,197,94,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(6,182,212,0.06) 0%, transparent 50%)' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(34,197,94,0.06) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div style={{ maxWidth: 1300, margin: '0 auto', padding: '0 24px', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center', paddingTop: 80 }}>
          {/* Left */}
          <div className="animate-fadeInUp">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 50, padding: '6px 16px', marginBottom: 28 }}>
              <Leaf size={14} color="var(--green)" />
              <span style={{ fontSize: '0.8rem', color: 'var(--green)', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>AI-Powered Smart City Tool</span>
            </div>
            <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-1px', marginBottom: 20 }}>
              Report Garbage.<br />
              <span className="gradient-text">Clean Your City.</span>
            </h1>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 36, maxWidth: 480 }}>
              A community-powered platform where citizens report waste issues, AI analyzes and prioritizes them, and municipal teams resolve complaints — all in real-time.
            </p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <Link to="/report/new">
                <button className="btn-primary" style={{ fontSize: '1rem', padding: '14px 32px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Camera size={18} /> Report an Issue <ArrowRight size={16} />
                </button>
              </Link>
              <Link to="/map">
                <button className="btn-outline" style={{ fontSize: '1rem', padding: '14px 32px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MapPin size={18} /> View Map
                </button>
              </Link>
            </div>

            {/* Mini stats */}
            <div style={{ display: 'flex', gap: 32, marginTop: 48 }}>
              {stats.map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--green)', fontFamily: 'var(--font-mono)' }}>{s.number}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 3D Globe */}
          <div className="animate-float" style={{ height: 520, position: 'relative' }}>
            <ThreeScene />
            {/* Floating cards */}
            <div style={{ position: 'absolute', top: '10%', right: '-5%', background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 12, padding: '12px 16px', backdropFilter: 'blur(10px)', minWidth: 160 }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>New Report</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: 4 }}>🗑️ Overflowing Bin</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--green)', marginTop: 4 }}>AI Priority: High</div>
            </div>
            <div style={{ position: 'absolute', bottom: '20%', left: '-5%', background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(6,182,212,0.3)', borderRadius: 12, padding: '12px 16px', backdropFilter: 'blur(10px)', minWidth: 160 }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Resolved ✅</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: 4 }}>MG Road, Bengaluru</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--cyan)', marginTop: 4 }}>In 36 hours</div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Scroll</div>
          <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, var(--green), transparent)', animation: 'float 2s ease-in-out infinite' }} />
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '100px 24px', maxWidth: 1300, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div className="section-title">Everything you need to fight waste</div>
          <p className="section-subtitle">Built for citizens, powered by AI, managed by municipalities</p>
        </div>
        <div className="grid-3">
          {features.map((f, i) => (
            <div key={f.title} className={`glass-card stagger-${(i % 4) + 1} animate-fadeInUp`} style={{ padding: 28 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green)', marginBottom: 18 }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 10 }}>{f.title}</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.9rem' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', background: 'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(6,182,212,0.08))', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 24, padding: '60px 40px' }}>
          <Leaf size={40} color="var(--green)" style={{ marginBottom: 20 }} />
          <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: 16 }}>Ready to make a difference?</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: '1.05rem' }}>
            Join thousands of citizens who are actively making their cities cleaner and smarter.
          </p>
          <Link to="/register">
            <button className="btn-primary" style={{ fontSize: '1rem', padding: '14px 40px' }}>
              Join Clean City Reporter →
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '30px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
          <Leaf size={16} color="var(--green)" />
          <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Clean City Reporter</span>
        </div>
        Built for Smart Cities · Sustainability · AI for Good
      </footer>
    </div>
  );
}
