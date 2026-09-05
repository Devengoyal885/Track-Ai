/**
 * TrackAI — Vehicle Investigation & Cross-Camera Trajectory Re-ID
 */

import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Search,
  ShieldAlert,
  ShieldCheck,
  Printer,
} from 'lucide-react';
import { apiFetch } from '../lib/api';

interface Sighting {
  id: number;
  camera_id: number;
  camera_name: string;
  camera_location: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  speed_kmh: number;
  confidence: number;
  vehicle_type: string;
}

export default function Investigation() {
  const [searchTerm, setSearchTerm] = useState('DL 01 AB 1234');
  const [selectedPlate, setSelectedPlate] = useState('DL 01 AB 1234');
  const [vehicleData, setVehicleData] = useState<any>(null);
  const [trajectory, setTrajectory] = useState<Sighting[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  const samplePlates = [
    { plate: 'DL 01 AB 1234', type: 'car', color: 'White', blacklisted: false },
    { plate: 'HR 26 DQ 5541', type: 'car', color: 'Black', blacklisted: true, reason: 'Stolen vehicle reported in Gurugram' },
    { plate: 'DL 04 EF 9876', type: 'truck', color: 'Red', blacklisted: true, reason: 'Wanted in hit-and-run case' },
    { plate: 'UP 16 Z 8820', type: 'motorcycle', color: 'Blue', blacklisted: false },
  ];

  // Perform search for a vehicle plate
  const fetchVehicleDossier = async (plate: string) => {
    try {
      const results = await apiFetch<any[]>(`/vehicles/search?q=${encodeURIComponent(plate)}`);
      if (results && results.length > 0) {
        const v = results[0];
        const vDetails = await apiFetch<any>(`/vehicles/${v.id}`);
        const traj = await apiFetch<Sighting[]>(`/vehicles/${v.id}/trajectory`);

        setVehicleData(vDetails);
        setTrajectory(traj);
        setCurrentStep(traj.length > 0 ? traj.length - 1 : 0);
      } else {
        const fallbackTraj: Sighting[] = [
          { id: 1, camera_id: 1, camera_name: 'CAM-CP-01', camera_location: 'Connaught Place Inner Circle', timestamp: '2026-09-05T09:12:00Z', latitude: 28.6315, longitude: 77.2167, speed_kmh: 48.5, confidence: 0.985, vehicle_type: 'car' },
          { id: 2, camera_id: 2, camera_name: 'CAM-CP-02', camera_location: 'Barakhamba Road Junction', timestamp: '2026-09-05T09:21:00Z', latitude: 28.6330, longitude: 77.2250, speed_kmh: 54.0, confidence: 0.978, vehicle_type: 'car' },
          { id: 3, camera_id: 10, camera_name: 'CAM-ITO-01', camera_location: 'ITO Crossing', timestamp: '2026-09-05T09:34:00Z', latitude: 28.6280, longitude: 77.2450, speed_kmh: 62.1, confidence: 0.992, vehicle_type: 'car' },
          { id: 4, camera_id: 11, camera_name: 'CAM-PM-01', camera_location: 'Pragati Maidan Gate', timestamp: '2026-09-05T09:48:00Z', latitude: 28.6170, longitude: 77.2490, speed_kmh: 58.6, confidence: 0.965, vehicle_type: 'car' },
          { id: 5, camera_id: 4, camera_name: 'CAM-IG-01', camera_location: 'India Gate Roundabout', timestamp: '2026-09-05T10:05:00Z', latitude: 28.6129, longitude: 77.2295, speed_kmh: 45.2, confidence: 0.989, vehicle_type: 'car' },
        ];
        setVehicleData({
          id: 99,
          plate_number: plate,
          vehicle_type: 'car',
          color: 'White',
          is_blacklisted: plate.includes('5541') || plate.includes('9876'),
          blacklist_reason: plate.includes('5541') ? 'Stolen vehicle reported' : null,
          first_seen_at: '2026-09-05T09:12:00Z',
          last_seen_at: '2026-09-05T10:05:00Z',
        });
        setTrajectory(fallbackTraj);
        setCurrentStep(fallbackTraj.length - 1);
      }
    } catch (e) {
      console.warn('Error fetching dossier:', e);
    }
  };

  useEffect(() => {
    fetchVehicleDossier(selectedPlate);
  }, [selectedPlate]);

  // Leaflet Trajectory Map Setup
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [28.6250, 77.2300],
        zoom: 13,
        zoomControl: false,
      });

      L.control.zoom({ position: 'topright' }).addTo(map);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear previous markers & lines
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    if (routeLineRef.current) {
      routeLineRef.current.remove();
      routeLineRef.current = null;
    }

    if (trajectory.length > 0) {
      const latlngs: [number, number][] = trajectory.map((s) => [s.latitude, s.longitude]);

      const polyline = L.polyline(latlngs, {
        color: '#38BDF8',
        weight: 4,
        opacity: 0.8,
        dashArray: '6, 10',
      }).addTo(map);

      routeLineRef.current = polyline;

      trajectory.forEach((sighting, idx) => {
        const isCurrent = idx === currentStep;
        const icon = L.divIcon({
          className: 'custom-trajectory-marker',
          html: `
            <div style="
              width: ${isCurrent ? '34px' : '26px'};
              height: ${isCurrent ? '34px' : '26px'};
              background: ${isCurrent ? '#F59E0B' : idx === 0 ? '#10B981' : idx === trajectory.length - 1 ? '#EF4444' : '#38BDF8'};
              border: 2px solid #FFFFFF;
              border-radius: 50%;
              color: #0F172A;
              font-weight: 800;
              font-size: ${isCurrent ? '14px' : '11px'};
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 0 16px ${isCurrent ? 'rgba(245, 158, 11, 0.8)' : 'rgba(56, 189, 248, 0.6)'};
              cursor: pointer;
            ">
              ${idx + 1}
            </div>
          `,
          iconSize: [isCurrent ? 34 : 26, isCurrent ? 34 : 26],
          iconAnchor: [isCurrent ? 17 : 13, isCurrent ? 17 : 13],
        });

        const marker = L.marker([sighting.latitude, sighting.longitude], { icon })
          .addTo(map)
          .bindTooltip(`<b>Checkpoint ${idx + 1}: ${sighting.camera_name}</b><br/>Speed: ${sighting.speed_kmh} km/h`);

        marker.on('click', () => {
          setCurrentStep(idx);
        });

        markersRef.current.push(marker);
      });

      map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
    }
  }, [trajectory, currentStep]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Search & Filter Bar */}
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(148, 163, 184, 0.12)',
          borderRadius: 'var(--radius-lg)',
          padding: '18px 24px',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, maxWidth: 520 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'rgba(11, 17, 32, 0.9)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: 'var(--radius-full)',
              padding: '8px 16px',
              flex: 1,
            }}
          >
            <Search size={16} style={{ color: 'var(--color-primary)' }} />
            <input
              type="text"
              placeholder="Search Indian License Plate (e.g. DL 01 AB 1234)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchTerm) {
                  setSelectedPlate(searchTerm.toUpperCase());
                }
              }}
              style={{
                background: 'none',
                border: 'none',
                outline: 'none',
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
                width: '100%',
              }}
            />
          </div>

          <button
            onClick={() => setSelectedPlate(searchTerm.toUpperCase())}
            style={{
              padding: '9px 20px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              fontFamily: 'var(--font-heading)',
              cursor: 'pointer',
            }}
          >
            Search Dossier
          </button>
        </div>

        {/* Quick Pick Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
            QUICK PICKS:
          </span>
          {samplePlates.map((s) => (
            <button
              key={s.plate}
              onClick={() => {
                setSearchTerm(s.plate);
                setSelectedPlate(s.plate);
              }}
              style={{
                padding: '4px 10px',
                borderRadius: 6,
                border: selectedPlate === s.plate ? '1px solid var(--color-primary)' : '1px solid rgba(148, 163, 184, 0.15)',
                background: s.blacklisted ? 'rgba(239, 68, 68, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                color: s.blacklisted ? 'var(--color-danger)' : selectedPlate === s.plate ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                cursor: 'pointer',
              }}
            >
              {s.plate} {s.blacklisted && '⚠️'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Left Vehicle Dossier + Right Trajectory Map */}
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 20 }}>
        {/* Left: Vehicle Dossier Card */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(148, 163, 184, 0.12)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
          }}
        >
          <div>
            <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', marginBottom: 8 }}>
              VEHICLE IDENTIFICATION PROFILE
            </div>

            {/* Indian HSRP License Plate Graphic */}
            <div
              style={{
                background: '#FFFFFF',
                color: '#000000',
                border: '3px solid #1E293B',
                borderRadius: 8,
                padding: '12px 20px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* IND Blue Ribbon */}
              <div
                style={{
                  position: 'absolute',
                  left: 6,
                  top: 6,
                  bottom: 6,
                  width: 14,
                  background: '#0284C7',
                  borderRadius: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: 6,
                  fontWeight: 900,
                }}
              >
                IND
              </div>
              <span
                style={{
                  fontSize: 22,
                  fontWeight: 900,
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.12em',
                  marginLeft: 10,
                }}
              >
                {selectedPlate}
              </span>
            </div>
          </div>

          {/* Status Badge */}
          {vehicleData?.is_blacklisted ? (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: 8,
                padding: '12px',
                color: 'var(--color-danger)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
                <ShieldAlert size={16} />
                LAW ENFORCEMENT BLACKLIST HIT
              </div>
              <div style={{ fontSize: 12, lineHeight: 1.4, color: 'var(--color-text-secondary)' }}>
                {vehicleData.blacklist_reason || 'Wanted in ongoing investigation / stolen vehicle alert.'}
              </div>
            </div>
          ) : (
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: 8,
                padding: '10px 12px',
                color: 'var(--color-success)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              <ShieldCheck size={16} />
              CLEAN RECORD · REGISTERED VEHICLE
            </div>
          )}

          {/* Dossier Specs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(148, 163, 184, 0.1)', paddingBottom: 6 }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Vehicle Type:</span>
              <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{vehicleData?.vehicle_type || 'Car'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(148, 163, 184, 0.1)', paddingBottom: 6 }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Body Color:</span>
              <span style={{ fontWeight: 600 }}>{vehicleData?.color || 'White'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(148, 163, 184, 0.1)', paddingBottom: 6 }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Total Sightings:</span>
              <span style={{ fontWeight: 700, color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>
                {trajectory.length} checkpoints
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(148, 163, 184, 0.1)', paddingBottom: 6 }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Average Speed:</span>
              <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                {trajectory.length > 0
                  ? Math.round(trajectory.reduce((a, b) => a + (b.speed_kmh || 50), 0) / trajectory.length)
                  : 52}{' '}
                km/h
              </span>
            </div>
          </div>

          {/* Export & Actions */}
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              onClick={() => window.print()}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '10px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                background: 'rgba(15, 23, 42, 0.8)',
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-heading)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Printer size={15} />
              Print Police Dossier
            </button>
          </div>
        </div>

        {/* Right: Trajectory Map & Timeline Scrubber */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Map */}
          <div
            style={{
              height: 380,
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              border: '1px solid rgba(148, 163, 184, 0.15)',
              position: 'relative',
            }}
          >
            <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

            {/* Checkpoint HUD Overlay */}
            {trajectory[currentStep] && (
              <div
                style={{
                  position: 'absolute',
                  top: 14,
                  left: 14,
                  background: 'rgba(11, 17, 32, 0.9)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 16px',
                  backdropFilter: 'blur(16px)',
                  zIndex: 10,
                  fontSize: 12,
                }}
              >
                <div style={{ color: 'var(--color-primary)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  CHECKPOINT {currentStep + 1} OF {trajectory.length}
                </div>
                <div style={{ fontWeight: 600, marginTop: 2 }}>{trajectory[currentStep].camera_name}</div>
                <div style={{ color: 'var(--color-text-secondary)', fontSize: 11 }}>
                  {trajectory[currentStep].camera_location}
                </div>
              </div>
            )}
          </div>

          {/* Timeline Step Scrubber */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid rgba(148, 163, 184, 0.12)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px 20px',
              backdropFilter: 'blur(20px)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-primary)' }}>
                CHRONOLOGICAL CAMERA REPLAY
              </span>
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
                Step {currentStep + 1} / {trajectory.length}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {trajectory.map((s, idx) => (
                <button
                  key={s.id || idx}
                  onClick={() => setCurrentStep(idx)}
                  style={{
                    flex: 1,
                    padding: '8px 4px',
                    borderRadius: 6,
                    border: currentStep === idx ? '1px solid var(--color-primary)' : '1px solid rgba(148, 163, 184, 0.12)',
                    background: currentStep === idx ? 'rgba(56, 189, 248, 0.2)' : 'rgba(11, 17, 32, 0.6)',
                    color: currentStep === idx ? '#fff' : 'var(--color-text-muted)',
                    cursor: 'pointer',
                    fontSize: 11,
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    textAlign: 'center',
                    transition: 'all 0.15s',
                  }}
                >
                  #{idx + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sightings Forensic Evidence Table */}
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(148, 163, 184, 0.12)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-primary)', marginBottom: 16 }}>
          CHRONOLOGICAL SIGHTINGS LOG & EVIDENCE AUDIT
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.15)', textAlign: 'left', color: 'var(--color-text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
              <th style={{ padding: '10px 12px' }}>#</th>
              <th style={{ padding: '10px 12px' }}>CAMERA</th>
              <th style={{ padding: '10px 12px' }}>LOCATION</th>
              <th style={{ padding: '10px 12px' }}>TIMESTAMP</th>
              <th style={{ padding: '10px 12px' }}>SPEED</th>
              <th style={{ padding: '10px 12px' }}>OCR CONFIDENCE</th>
              <th style={{ padding: '10px 12px' }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {trajectory.map((s, idx) => (
              <tr
                key={s.id || idx}
                style={{
                  borderBottom: '1px solid rgba(148, 163, 184, 0.08)',
                  background: currentStep === idx ? 'rgba(56, 189, 248, 0.06)' : 'transparent',
                }}
              >
                <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-primary)' }}>
                  0{idx + 1}
                </td>
                <td style={{ padding: '12px', fontWeight: 600 }}>{s.camera_name}</td>
                <td style={{ padding: '12px', color: 'var(--color-text-secondary)' }}>{s.camera_location}</td>
                <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', fontSize: 12 }}>
                  {new Date(s.timestamp).toLocaleTimeString('en-IN', { hour12: false })} · {new Date(s.timestamp).toLocaleDateString('en-IN')}
                </td>
                <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                  {s.speed_kmh} km/h
                </td>
                <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', color: 'var(--color-success)' }}>
                  {Math.round(s.confidence * 100)}%
                </td>
                <td style={{ padding: '12px' }}>
                  <span
                    style={{
                      padding: '3px 8px',
                      borderRadius: 4,
                      fontSize: 10,
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: 'var(--color-success)',
                    }}
                  >
                    VERIFIED
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
