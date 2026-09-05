/**
 * TrackAI — Command Center (Mission Control Map & Real-Time Telemetry)
 */

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Crosshair,
  Cctv,
  Activity,
  ShieldAlert,
  Gauge,
  Play,
  Pause,
  PlusCircle,
  AlertTriangle,
  RotateCcw,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useSimulationStore, type SimulatedVehicleData } from '../stores/simulationStore';

// Delhi Camera Locations
const DELHI_CAMERAS = [
  { id: 1, name: 'CAM-CP-01', location: 'Connaught Place Inner Circle', lat: 28.6315, lng: 77.2167, type: 'ANPR', zone: 'Central' },
  { id: 2, name: 'CAM-CP-02', location: 'Barakhamba Road Junction', lat: 28.6330, lng: 77.2250, type: 'ANPR', zone: 'Central' },
  { id: 3, name: 'CAM-CP-03', location: 'Minto Road Crossing', lat: 28.6355, lng: 77.2310, type: 'CCTV', zone: 'Central' },
  { id: 4, name: 'CAM-IG-01', location: 'India Gate Roundabout', lat: 28.6129, lng: 77.2295, type: 'ANPR', zone: 'New Delhi' },
  { id: 5, name: 'CAM-RP-01', location: 'Kartavya Path (Rajpath)', lat: 28.6145, lng: 77.2090, type: 'Speed', zone: 'New Delhi' },
  { id: 6, name: 'CAM-ND-01', location: 'Janpath - Tolstoy Marg Junction', lat: 28.6250, lng: 77.2180, type: 'ANPR', zone: 'New Delhi' },
  { id: 7, name: 'CAM-HK-01', location: 'Hauz Khas Village Entrance', lat: 28.5494, lng: 77.2001, type: 'CCTV', zone: 'South Delhi' },
  { id: 8, name: 'CAM-AI-01', location: 'AIIMS Flyover', lat: 28.5672, lng: 77.2100, type: 'ANPR', zone: 'South Delhi' },
  { id: 9, name: 'CAM-SK-01', location: 'Saket Metro Station', lat: 28.5237, lng: 77.2139, type: 'ANPR', zone: 'South Delhi' },
  { id: 10, name: 'CAM-ITO-01', location: 'ITO Crossing', lat: 28.6280, lng: 77.2450, type: 'ANPR', zone: 'East Delhi' },
  { id: 11, name: 'CAM-PM-01', location: 'Pragati Maidan Gate', lat: 28.6170, lng: 77.2490, type: 'Speed', zone: 'East Delhi' },
  { id: 12, name: 'CAM-AD-01', location: 'Akshardham Temple Road', lat: 28.6127, lng: 77.2773, type: 'CCTV', zone: 'East Delhi' },
  { id: 13, name: 'CAM-KG-01', location: 'Kashmere Gate ISBT', lat: 28.6692, lng: 77.2260, type: 'ANPR', zone: 'North Delhi' },
  { id: 14, name: 'CAM-CL-01', location: 'Civil Lines Main Road', lat: 28.6810, lng: 77.2210, type: 'ANPR', zone: 'North Delhi' },
  { id: 15, name: 'CAM-RG-01', location: 'Rajouri Garden Metro', lat: 28.6493, lng: 77.1215, type: 'ANPR', zone: 'West Delhi' },
];

export default function CommandCenter() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const vehicleMarkersRef = useRef<Map<number, L.Marker>>(new Map());

  const {
    isRunning,
    speedMultiplier,
    activeVehicles,
    liveDetections,
    stats,
    startSimulation,
    pauseSimulation,
    setSpeedMultiplier,
    spawnSuspectVehicle,
    triggerEmergencyAlert,
    resetSimulation,
  } = useSimulationStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<SimulatedVehicleData | null>(null);
  const [selectedCamera, setSelectedCamera] = useState<any | null>(null);
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [28.6139, 77.2150],
      zoom: 13,
      zoomControl: false,
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    const zones = [
      { name: 'Central Delhi Zone', lat: 28.6315, lng: 77.2167, radius: 1800, color: '#EF4444', fillOpacity: 0.12 },
      { name: 'New Delhi Corridor', lat: 28.6129, lng: 77.2295, radius: 1600, color: '#F59E0B', fillOpacity: 0.09 },
      { name: 'South Delhi Grid', lat: 28.5494, lng: 77.2001, radius: 2200, color: '#38BDF8', fillOpacity: 0.08 },
      { name: 'East Delhi Expressway', lat: 28.6280, lng: 77.2550, radius: 2000, color: '#818CF8', fillOpacity: 0.08 },
    ];

    zones.forEach((z) => {
      L.circle([z.lat, z.lng], {
        radius: z.radius,
        color: z.color,
        fillColor: z.color,
        fillOpacity: z.fillOpacity,
        weight: 1.5,
        dashArray: '4, 8',
      }).addTo(map);
    });

    DELHI_CAMERAS.forEach((cam) => {
      const camIcon = L.divIcon({
        className: 'custom-camera-marker',
        html: `
          <div style="
            position: relative;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(15, 23, 42, 0.9);
            border: 2px solid ${cam.type === 'Speed' ? '#F59E0B' : '#38BDF8'};
            border-radius: 50%;
            box-shadow: 0 0 12px ${cam.type === 'Speed' ? 'rgba(245, 158, 11, 0.6)' : 'rgba(56, 189, 248, 0.6)'};
            color: #fff;
            font-size: 13px;
            cursor: pointer;
          ">
            <span style="font-size: 12px;">📹</span>
            <div style="
              position: absolute;
              top: -2px;
              right: -2px;
              width: 8px;
              height: 8px;
              background: #10B981;
              border-radius: 50%;
              box-shadow: 0 0 6px #10B981;
            "></div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([cam.lat, cam.lng], { icon: camIcon })
        .addTo(map)
        .bindTooltip(`<b>${cam.name}</b><br/>${cam.location}<br/><span style="color:#10B981">● ANPR ONLINE</span>`, {
          direction: 'top',
          className: 'custom-map-tooltip',
        });

      marker.on('click', () => {
        setSelectedCamera(cam);
      });
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Moving Vehicle Markers in Real-time
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const currentMarkers = vehicleMarkersRef.current;
    const activeIds = new Set<number>();

    activeVehicles.forEach((v) => {
      activeIds.add(v.id);

      const isSuspect = v.is_blacklisted;
      const isSelected = selectedVehicle?.id === v.id;
      const markerColor = isSuspect ? '#EF4444' : isSelected ? '#F59E0B' : '#38BDF8';
      const glowColor = isSuspect ? 'rgba(239, 68, 68, 0.7)' : 'rgba(56, 189, 248, 0.5)';

      const vehicleIcon = L.divIcon({
        className: 'custom-vehicle-marker',
        html: `
          <div style="
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
            background: ${markerColor};
            border: 2px solid #FFFFFF;
            border-radius: 50%;
            box-shadow: 0 0 14px ${glowColor};
            transform: rotate(${v.heading}deg);
            transition: all 0.3s linear;
            cursor: pointer;
          ">
            <div style="
              width: 0;
              height: 0;
              border-left: 4px solid transparent;
              border-right: 4px solid transparent;
              border-bottom: 8px solid #0F172A;
              transform: translateY(-2px);
            "></div>
            ${
              isSuspect
                ? `<div style="
                    position: absolute;
                    top: -16px;
                    background: #EF4444;
                    color: #fff;
                    font-size: 8px;
                    font-weight: 800;
                    padding: 1px 4px;
                    border-radius: 3px;
                    font-family: monospace;
                    white-space: nowrap;
                  ">WANTED</div>`
                : ''
            }
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      if (currentMarkers.has(v.id)) {
        const marker = currentMarkers.get(v.id)!;
        marker.setLatLng([v.latitude, v.longitude]);
        marker.setIcon(vehicleIcon);
      } else {
        const marker = L.marker([v.latitude, v.longitude], { icon: vehicleIcon })
          .addTo(map)
          .bindTooltip(
            `<b>${v.plate_number}</b><br/>${v.vehicle_type.toUpperCase()} · ${v.speed_kmh} km/h<br/>Route: ${v.route_name}`,
            { direction: 'top' }
          );

        marker.on('click', () => {
          setSelectedVehicle(v);
        });

        currentMarkers.set(v.id, marker);
      }
    });

    currentMarkers.forEach((marker, id) => {
      if (!activeIds.has(id)) {
        marker.remove();
        currentMarkers.delete(id);
      }
    });
  }, [activeVehicles, selectedVehicle]);

  return (
    <div style={{ position: 'relative', height: 'calc(100vh - 104px)', display: 'flex', flexDirection: 'column' }}>
      {/* Top HUD Metrics Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 14,
          marginBottom: 14,
          zIndex: 20,
        }}
      >
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(148, 163, 184, 0.12)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 18px',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
              ACTIVE FLEET
            </span>
            <Crosshair size={15} style={{ color: 'var(--color-primary)' }} />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', marginTop: 4 }}>
            {activeVehicles.length} Targets
          </div>
        </div>

        <div
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(148, 163, 184, 0.12)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 18px',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
              SURVEILLANCE CAMERAS
            </span>
            <Cctv size={15} style={{ color: 'var(--color-success)' }} />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-success)', marginTop: 4 }}>
            {DELHI_CAMERAS.length} Online
          </div>
        </div>

        <div
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(148, 163, 184, 0.12)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 18px',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
              AVG CORRIDOR SPEED
            </span>
            <Gauge size={15} style={{ color: '#F59E0B' }} />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#F59E0B', marginTop: 4 }}>
            {stats.average_speed || 54.2} km/h
          </div>
        </div>

        <div
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(148, 163, 184, 0.12)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 18px',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
              SECURITY ALERTS
            </span>
            <ShieldAlert size={15} style={{ color: 'var(--color-danger)' }} />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-danger)', marginTop: 4 }}>
            {stats.open_alerts || 4} Critical
          </div>
        </div>

        <div
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(148, 163, 184, 0.12)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 18px',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
              TOTAL DETECTIONS
            </span>
            <Activity size={15} style={{ color: '#A78BFA' }} />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#A78BFA', marginTop: 4 }}>
            {stats.total_detections_today || 240}
          </div>
        </div>
      </div>

      {/* Main Map Container + Overlay Drawers */}
      <div style={{ flex: 1, position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        {/* Leaflet Map Div */}
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />

        {/* Left Drawer: Real-Time Telemetry Feed */}
        <div
          style={{
            position: 'absolute',
            top: 14,
            left: 14,
            bottom: 14,
            width: isLeftPanelOpen ? 320 : 44,
            background: 'rgba(11, 17, 32, 0.92)',
            border: '1px solid rgba(148, 163, 184, 0.15)',
            borderRadius: 'var(--radius-lg)',
            backdropFilter: 'blur(20px)',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            transition: 'width 0.25s ease',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 16px',
              borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {isLeftPanelOpen && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="status-online" />
                <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-primary)' }}>
                  LIVE ANPR TELEMETRY
                </span>
              </div>
            )}
            <button
              onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
                padding: 2,
              }}
            >
              {isLeftPanelOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
          </div>

          {/* Body */}
          {isLeftPanelOpen && (
            <>
              {/* Search Plate Filter */}
              <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(148, 163, 184, 0.08)' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'rgba(15, 23, 42, 0.8)',
                    borderRadius: 6,
                    padding: '6px 10px',
                    border: '1px solid rgba(148, 163, 184, 0.15)',
                  }}
                >
                  <Search size={13} style={{ color: 'var(--color-text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Filter plate or vehicle..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
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

              {/* Feed List */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
                {liveDetections.length === 0 ? (
                  <div style={{ padding: 20, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 12 }}>
                    Listening for ANPR camera triggers...
                  </div>
                ) : (
                  liveDetections
                    .filter(
                      (d) =>
                        !searchQuery ||
                        d.plate_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        d.camera_name.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .slice(0, 25)
                    .map((d) => (
                      <div
                        key={d.id || Math.random()}
                        onClick={() => {
                          const v = activeVehicles.find((av) => av.plate_number === d.plate_number);
                          if (v && mapInstanceRef.current) {
                            mapInstanceRef.current.flyTo([v.latitude, v.longitude], 15);
                            setSelectedVehicle(v);
                          }
                        }}
                        style={{
                          padding: '10px 12px',
                          marginBottom: 6,
                          borderRadius: 8,
                          background: d.is_blacklisted ? 'rgba(239, 68, 68, 0.12)' : 'rgba(15, 23, 42, 0.6)',
                          border: d.is_blacklisted ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid rgba(148, 163, 184, 0.08)',
                          cursor: 'pointer',
                          transition: 'background 0.15s',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: 12,
                              fontWeight: 700,
                              color: d.is_blacklisted ? 'var(--color-danger)' : 'var(--color-primary)',
                            }}
                          >
                            {d.plate_number}
                          </span>
                          <span style={{ fontSize: 10, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                            {d.speed_kmh} km/h
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                          <span>{d.camera_name}</span>
                          <span style={{ textTransform: 'capitalize', color: 'var(--color-text-muted)' }}>{d.vehicle_type}</span>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </>
          )}
        </div>

        {/* Right Drawer: Live Simulated CCTV Stream */}
        <div
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            width: isRightPanelOpen ? 330 : 44,
            background: 'rgba(11, 17, 32, 0.94)',
            border: '1px solid rgba(148, 163, 184, 0.15)',
            borderRadius: 'var(--radius-lg)',
            backdropFilter: 'blur(20px)',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            transition: 'width 0.25s ease',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 16px',
              borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <button
              onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
                padding: 2,
              }}
            >
              {isRightPanelOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
            {isRightPanelOpen && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="status-online" />
                <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-primary)' }}>
                  LIVE CAMERA FEED
                </span>
              </div>
            )}
          </div>

          {/* Live Video Canvas Stream */}
          {isRightPanelOpen && (
            <div style={{ padding: '14px' }}>
              <SimulatedCameraCanvas cameraName={selectedCamera?.name || 'CAM-CP-01 (Connaught Place)'} />

              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {selectedCamera ? selectedCamera.name : 'CAM-CP-01 · Central Delhi'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                  {selectedCamera ? selectedCamera.location : 'Connaught Place Inner Circle'}
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 8,
                    marginTop: 12,
                    fontSize: 11,
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: 6, borderRadius: 4 }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>STREAM: </span>
                    <span style={{ color: 'var(--color-success)' }}>1080p @ 30 FPS</span>
                  </div>
                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: 6, borderRadius: 4 }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>AI MODEL: </span>
                    <span style={{ color: 'var(--color-primary)' }}>YOLOv8x</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Floating Simulation Dock */}
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(11, 17, 32, 0.95)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: 'var(--radius-full)',
            padding: '8px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            zIndex: 10,
            backdropFilter: 'blur(20px)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
          }}
        >
          <button
            onClick={() => (isRunning ? pauseSimulation() : startSimulation())}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: isRunning ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
              color: isRunning ? 'var(--color-warning)' : 'var(--color-success)',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              fontSize: 12,
            }}
          >
            {isRunning ? <Pause size={14} /> : <Play size={14} />}
            {isRunning ? 'PAUSE' : 'RUN'}
          </button>

          {/* Speed toggles */}
          <div style={{ display: 'flex', gap: 4 }}>
            {[1.0, 2.0, 5.0].map((spd) => (
              <button
                key={spd}
                onClick={() => setSpeedMultiplier(spd)}
                style={{
                  padding: '4px 8px',
                  borderRadius: 4,
                  border: 'none',
                  background: speedMultiplier === spd ? 'var(--color-primary)' : 'rgba(148, 163, 184, 0.1)',
                  color: speedMultiplier === spd ? '#0F172A' : 'var(--color-text-secondary)',
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {spd}x
              </button>
            ))}
          </div>

          <div style={{ width: 1, height: 18, background: 'rgba(148, 163, 184, 0.2)' }} />

          <button
            onClick={() => spawnSuspectVehicle()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 6,
              border: '1px solid rgba(239, 68, 68, 0.4)',
              background: 'rgba(239, 68, 68, 0.15)',
              color: 'var(--color-danger)',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            <PlusCircle size={13} />
            Spawn Wanted Target
          </button>

          <button
            onClick={() => triggerEmergencyAlert('Speed Violation Triggered: Ring Road Corridor')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 6,
              border: '1px solid rgba(245, 158, 11, 0.4)',
              background: 'rgba(245, 158, 11, 0.15)',
              color: 'var(--color-warning)',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            <AlertTriangle size={13} />
            Trigger Incident
          </button>

          <button
            onClick={() => resetSimulation()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 10px',
              borderRadius: 6,
              border: '1px solid rgba(148, 163, 184, 0.2)',
              background: 'rgba(15, 23, 42, 0.6)',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
            }}
            title="Reset simulation fleet"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Canvas Component simulating real-time CCTV camera feed with AI bounding boxes
function SimulatedCameraCanvas({ cameraName }: { cameraName: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameId: number;
    let carX = 40;
    let carY = 70;
    let speed = 1.2;

    const render = () => {
      ctx.fillStyle = '#0B1120';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Road markings
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 110);
      ctx.lineTo(canvas.width, 110);
      ctx.stroke();

      // Moving Car representation
      carX += speed;
      if (carX > canvas.width + 50) carX = -60;

      // Draw vehicle bounding box (cyan)
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 2;
      ctx.strokeRect(carX, carY, 90, 50);

      // Label
      ctx.fillStyle = '#38BDF8';
      ctx.fillRect(carX, carY - 16, 75, 16);
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('CAR 98.4%', carX + 4, carY - 4);

      // License plate OCR box (emerald green)
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 2;
      ctx.strokeRect(carX + 22, carY + 32, 45, 14);

      ctx.fillStyle = '#10B981';
      ctx.fillRect(carX + 22, carY + 46, 50, 12);
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 8px monospace';
      ctx.fillText('DL 01 AB', carX + 24, carY + 55);

      // Camera HUD Scanlines and Time
      ctx.fillStyle = 'rgba(241, 245, 249, 0.8)';
      ctx.font = '10px monospace';
      ctx.fillText(`REC ● ${new Date().toLocaleTimeString()}`, 10, 18);
      ctx.fillText(cameraName, 10, 32);

      frameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(frameId);
  }, [cameraName]);

  return (
    <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(148, 163, 184, 0.2)' }}>
      <canvas ref={canvasRef} width={300} height={170} style={{ display: 'block', width: '100%', height: 'auto' }} />
    </div>
  );
}
