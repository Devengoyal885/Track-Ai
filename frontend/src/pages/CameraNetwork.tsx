/**
 * TrackAI — City-Wide Camera Surveillance Network
 */

import { useState, useEffect, useRef } from 'react';
import {
  Search,
  Maximize2,
  X,
} from 'lucide-react';
import { apiFetch } from '../lib/api';

interface CameraItem {
  id: number;
  name: string;
  location_name: string;
  latitude: number;
  longitude: number;
  is_online: boolean;
  camera_type: string;
  zone_id?: number;
  last_detection_at?: string;
}

const SAMPLE_CAMERAS: CameraItem[] = [
  { id: 1, name: 'CAM-CP-01', location_name: 'Connaught Place Inner Circle', latitude: 28.6315, longitude: 77.2167, is_online: true, camera_type: 'ANPR' },
  { id: 2, name: 'CAM-CP-02', location_name: 'Barakhamba Road Junction', latitude: 28.6330, longitude: 77.2250, is_online: true, camera_type: 'ANPR' },
  { id: 3, name: 'CAM-CP-03', location_name: 'Minto Road Crossing', latitude: 28.6355, longitude: 77.2310, is_online: true, camera_type: 'CCTV' },
  { id: 4, name: 'CAM-IG-01', location_name: 'India Gate Roundabout', latitude: 28.6129, longitude: 77.2295, is_online: true, camera_type: 'ANPR' },
  { id: 5, name: 'CAM-RP-01', location_name: 'Kartavya Path (Rajpath)', latitude: 28.6145, longitude: 77.2090, is_online: true, camera_type: 'Speed' },
  { id: 6, name: 'CAM-ND-01', location_name: 'Janpath - Tolstoy Marg Junction', latitude: 28.6250, longitude: 77.2180, is_online: true, camera_type: 'ANPR' },
  { id: 7, name: 'CAM-HK-01', location_name: 'Hauz Khas Village Entrance', latitude: 28.5494, longitude: 77.2001, is_online: true, camera_type: 'CCTV' },
  { id: 8, name: 'CAM-AI-01', location_name: 'AIIMS Flyover', latitude: 28.5672, longitude: 77.2100, is_online: true, camera_type: 'ANPR' },
  { id: 9, name: 'CAM-SK-01', location_name: 'Saket Metro Station', latitude: 28.5237, longitude: 77.2139, is_online: true, camera_type: 'ANPR' },
  { id: 10, name: 'CAM-ITO-01', location_name: 'ITO Crossing', latitude: 28.6280, longitude: 77.2450, is_online: true, camera_type: 'ANPR' },
  { id: 11, name: 'CAM-PM-01', location_name: 'Pragati Maidan Gate', latitude: 28.6170, longitude: 77.2490, is_online: true, camera_type: 'Speed' },
  { id: 12, name: 'CAM-AD-01', location_name: 'Akshardham Temple Road', latitude: 28.6127, longitude: 77.2773, is_online: true, camera_type: 'CCTV' },
  { id: 13, name: 'CAM-KG-01', location_name: 'Kashmere Gate ISBT', latitude: 28.6692, longitude: 77.2260, is_online: true, camera_type: 'ANPR' },
  { id: 14, name: 'CAM-CL-01', location_name: 'Civil Lines Main Road', latitude: 28.6810, longitude: 77.2210, is_online: true, camera_type: 'ANPR' },
  { id: 15, name: 'CAM-RG-01', location_name: 'Rajouri Garden Metro', latitude: 28.6493, longitude: 77.1215, is_online: true, camera_type: 'ANPR' },
];

export default function CameraNetwork() {
  const [cameras, setCameras] = useState<CameraItem[]>(SAMPLE_CAMERAS);
  const [filterType, setFilterType] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeModalCamera, setActiveModalCamera] = useState<CameraItem | null>(null);

  useEffect(() => {
    apiFetch<CameraItem[]>('/cameras')
      .then((data) => {
        if (data && data.length > 0) setCameras(data);
      })
      .catch((err) => console.warn('Cameras fetch error:', err));
  }, []);

  const filteredCameras = cameras.filter((c) => {
    const matchesType = filterType === 'ALL' || c.camera_type.toUpperCase() === filterType;
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.location_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top Metrics Banner */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
        }}
      >
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(148, 163, 184, 0.12)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
            SURVEILLANCE GRID
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', marginTop: 4 }}>
            {cameras.length} Active Feeds
          </div>
        </div>

        <div
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(148, 163, 184, 0.12)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
            ANPR HIGHWAYS
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-success)', marginTop: 4 }}>
            {cameras.filter((c) => c.camera_type === 'ANPR').length} Nodes
          </div>
        </div>

        <div
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(148, 163, 184, 0.12)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
            SPEED RADAR ENFORCEMENT
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#F59E0B', marginTop: 4 }}>
            {cameras.filter((c) => c.camera_type === 'Speed').length} Radars
          </div>
        </div>

        <div
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(148, 163, 184, 0.12)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
            EDGE INFERENCE FPS
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#A78BFA', marginTop: 4 }}>
            30.0 FPS / Node
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(148, 163, 184, 0.12)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px 24px',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['ALL', 'ANPR', 'SPEED', 'CCTV'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                border: filterType === t ? '1px solid var(--color-primary)' : '1px solid rgba(148, 163, 184, 0.15)',
                background: filterType === t ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                color: filterType === t ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                fontSize: 12,
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {t === 'ALL' ? 'ALL NODES' : `${t} UNITS`}
            </button>
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(11, 17, 32, 0.8)',
            border: '1px solid rgba(148, 163, 184, 0.15)',
            borderRadius: 'var(--radius-full)',
            padding: '6px 14px',
            width: 280,
          }}
        >
          <Search size={14} style={{ color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            placeholder="Search location or camera..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              background: 'none',
              border: 'none',
              outline: 'none',
              color: 'var(--color-text-primary)',
              fontSize: 12,
              fontFamily: 'var(--font-mono)',
              width: '100%',
            }}
          />
        </div>
      </div>

      {/* Camera Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 20,
        }}
      >
        {filteredCameras.map((cam) => (
          <div
            key={cam.id}
            style={{
              background: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid rgba(148, 163, 184, 0.12)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              backdropFilter: 'blur(20px)',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
            }}
          >
            {/* Live Video Canvas Stream */}
            <div style={{ position: 'relative', height: 180, background: '#0B1120' }}>
              <MiniCameraCanvas cameraName={cam.name} type={cam.camera_type} />

              {/* Status Pill */}
              <div
                style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(16, 185, 129, 0.25)',
                  border: '1px solid rgba(16, 185, 129, 0.5)',
                  color: 'var(--color-success)',
                  fontSize: 10,
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  backdropFilter: 'blur(8px)',
                }}
              >
                <span className="status-online" />
                ONLINE
              </div>

              {/* Type Badge */}
              <div
                style={{
                  position: 'absolute',
                  top: 10,
                  left: 10,
                  padding: '3px 8px',
                  borderRadius: 4,
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  color: 'var(--color-primary)',
                  fontSize: 10,
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  backdropFilter: 'blur(8px)',
                }}
              >
                {cam.camera_type}
              </div>
            </div>

            {/* Info Body */}
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }}>{cam.name}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{cam.location_name}</div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: 8,
                  borderTop: '1px solid rgba(148, 163, 184, 0.1)',
                }}
              >
                <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
                  GPS: {cam.latitude.toFixed(4)}, {cam.longitude.toFixed(4)}
                </div>

                <button
                  onClick={() => setActiveModalCamera(cam)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: 6,
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    background: 'rgba(56, 189, 248, 0.1)',
                    color: 'var(--color-primary)',
                    fontSize: 12,
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <Maximize2 size={13} />
                  Inspect Node
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Camera Inspector Full Modal */}
      {activeModalCamera && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(16px)',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 780,
              background: 'rgba(15, 23, 42, 0.96)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{activeModalCamera.name} Surveillance Inspector</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{activeModalCamera.location_name}</div>
              </div>

              <button
                onClick={() => setActiveModalCamera(null)}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ height: 260, borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(148, 163, 184, 0.2)' }}>
                <MiniCameraCanvas cameraName={activeModalCamera.name} type={activeModalCamera.camera_type} isLarge />
              </div>

              {/* Node Diagnostics HUD */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 12,
                  fontSize: 12,
                  fontFamily: 'var(--font-mono)',
                }}
              >
                <div style={{ background: 'rgba(11, 17, 32, 0.8)', padding: 12, borderRadius: 8 }}>
                  <div style={{ color: 'var(--color-text-muted)' }}>STREAM LATENCY</div>
                  <div style={{ color: 'var(--color-success)', fontSize: 16, fontWeight: 700, marginTop: 4 }}>14.2 ms</div>
                </div>
                <div style={{ background: 'rgba(11, 17, 32, 0.8)', padding: 12, borderRadius: 8 }}>
                  <div style={{ color: 'var(--color-text-muted)' }}>EDGE GPU LOAD</div>
                  <div style={{ color: 'var(--color-primary)', fontSize: 16, fontWeight: 700, marginTop: 4 }}>32.4%</div>
                </div>
                <div style={{ background: 'rgba(11, 17, 32, 0.8)', padding: 12, borderRadius: 8 }}>
                  <div style={{ color: 'var(--color-text-muted)' }}>SENSOR TEMP</div>
                  <div style={{ color: '#F59E0B', fontSize: 16, fontWeight: 700, marginTop: 4 }}>41.8 °C</div>
                </div>
                <div style={{ background: 'rgba(11, 17, 32, 0.8)', padding: 12, borderRadius: 8 }}>
                  <div style={{ color: 'var(--color-text-muted)' }}>PTZ STATUS</div>
                  <div style={{ color: '#A78BFA', fontSize: 16, fontWeight: 700, marginTop: 4 }}>LOCKED / AUTO</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MiniCameraCanvas({ cameraName, type, isLarge = false }: { cameraName: string; type: string; isLarge?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameId: number;
    let carX = Math.random() * 100;
    let speed = 1.4;

    const render = () => {
      ctx.fillStyle = '#0B1120';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Perspective Road
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height * 0.7);
      ctx.lineTo(canvas.width, canvas.height * 0.7);
      ctx.stroke();

      // Moving Vehicle
      carX += speed;
      if (carX > canvas.width + 60) carX = -80;

      const vW = isLarge ? 120 : 70;
      const vH = isLarge ? 70 : 40;
      const vY = canvas.height * 0.45;

      // Cyan detection box
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 2;
      ctx.strokeRect(carX, vY, vW, vH);

      // Plate OCR box
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 2;
      ctx.strokeRect(carX + vW * 0.2, vY + vH * 0.65, vW * 0.6, vH * 0.28);

      // HUD Text
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.font = isLarge ? '11px monospace' : '9px monospace';
      ctx.fillText(`${cameraName} · REC ●`, 10, 18);
      ctx.fillText(`FPS: 30.0 · RESOLUTION: 1080P`, 10, 32);

      frameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(frameId);
  }, [cameraName, type, isLarge]);

  return (
    <canvas
      ref={canvasRef}
      width={isLarge ? 700 : 320}
      height={isLarge ? 260 : 180}
      style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
    />
  );
}
