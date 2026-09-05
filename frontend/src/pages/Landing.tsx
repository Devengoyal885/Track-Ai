/**
 * TrackAI — Futuristic Landing Page
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Radio,
  Crosshair,
  Search,
  Cctv,
  BarChart3,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { useSimulationStore } from '../stores/simulationStore';

export default function Landing() {
  const navigate = useNavigate();
  const activeVehicleCount = useSimulationStore((s) => s.activeVehicles.length) || 18;
  const [testPlate, setTestPlate] = useState('DL 01 AB 1234');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);

  const runSampleScan = () => {
    setIsScanning(true);
    setScanResult(null);
    setTimeout(() => {
      setIsScanning(false);
      setScanResult({
        plate: testPlate,
        vehicleType: 'Car (Sedan)',
        confidence: '98.8%',
        state: 'Delhi (DL)',
        status: testPlate.includes('1234') ? 'Clean / Registered' : 'Flagged Suspect',
        speed: '58.4 km/h',
        latency: '18.2 ms',
      });
    }, 900);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg-deep)',
        color: 'var(--color-text-primary)',
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      {/* Animated background grid */}
      <div className="animated-grid-bg" />

      {/* Cyber ambient spotlights */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '900px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, rgba(99, 102, 241, 0.08) 50%, transparent 80%)',
          pointerEvents: 'none',
        }}
      />

      {/* Top Navigation Bar */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px 48px',
          maxWidth: 1300,
          margin: '0 auto',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #38BDF8 0%, #6366F1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 0 20px rgba(56, 189, 248, 0.5)',
            }}
          >
            <Radio size={20} />
          </div>
          <div>
            <span style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
              Track<span style={{ color: 'var(--color-primary)' }}>AI</span>
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <button
            onClick={() => navigate('/try-it')}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              background: 'rgba(15, 23, 42, 0.6)',
              color: 'var(--color-text-secondary)',
              fontSize: 13,
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            AI Playground
          </button>
          <button
            onClick={() => navigate('/command-center')}
            style={{
              padding: '9px 22px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              fontFamily: 'var(--font-heading)',
              cursor: 'pointer',
              boxShadow: '0 0 20px var(--color-primary-glow)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            Launch Control Room
            <ArrowRight size={14} />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          maxWidth: 1150,
          margin: '0 auto',
          padding: '40px 24px 60px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 5,
        }}
      >
        {/* Status Chip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 16px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(56, 189, 248, 0.1)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            color: 'var(--color-primary)',
            fontSize: 12,
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            marginBottom: 28,
            letterSpacing: '0.04em',
          }}
        >
          <span className="status-online" />
          CITY-WIDE ANPR SURVEILLANCE & AI TRAFFIC INTELLIGENCE
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            fontSize: 'clamp(38px, 5.5vw, 68px)',
            fontWeight: 800,
            lineHeight: 1.12,
            letterSpacing: '-0.04em',
            maxWidth: 950,
            margin: '0 auto 24px',
          }}
        >
          Real-Time Vehicle Tracking &{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #38BDF8 20%, #818CF8 80%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Multi-Camera Re-ID
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            fontSize: 18,
            color: 'var(--color-text-secondary)',
            lineHeight: 1.6,
            maxWidth: 680,
            margin: '0 auto 40px',
          }}
        >
          High-accuracy Indian license plate recognition (ANPR), cross-junction Kalman trajectory
          tracking, speed violation radar, and law enforcement suspect interception for Smart Cities.
        </motion.p>

        {/* CTA Group */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 56 }}
        >
          <button
            onClick={() => navigate('/command-center')}
            style={{
              padding: '16px 36px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: 'linear-gradient(135deg, #38BDF8 0%, #6366F1 100%)',
              color: '#fff',
              fontSize: 16,
              fontWeight: 700,
              fontFamily: 'var(--font-heading)',
              cursor: 'pointer',
              boxShadow: '0 0 35px var(--color-primary-glow)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              transition: 'transform 0.15s ease',
            }}
          >
            <Crosshair size={18} />
            Open Command Center Map
          </button>

          <button
            onClick={() => navigate('/investigation')}
            style={{
              padding: '16px 28px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(148, 163, 184, 0.25)',
              background: 'rgba(15, 23, 42, 0.8)',
              color: 'var(--color-text-primary)',
              fontSize: 15,
              fontWeight: 600,
              fontFamily: 'var(--font-heading)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              backdropFilter: 'blur(12px)',
            }}
          >
            <Search size={18} />
            Vehicle Dossier & Re-ID
          </button>
        </motion.div>

        {/* Live Metrics Ticker Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
            background: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid rgba(148, 163, 184, 0.12)',
            borderRadius: 'var(--radius-xl)',
            padding: '24px 32px',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div>
            <div style={{ fontSize: 32, fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-primary)' }}>
              99.2%
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
              ANPR OCR ACCURACY
            </div>
          </div>
          <div>
            <div style={{ fontSize: 32, fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-success)' }}>
              &lt; 25ms
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
              INFERENCE LATENCY
            </div>
          </div>
          <div>
            <div style={{ fontSize: 32, fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#F59E0B' }}>
              15 CAMERAS
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
              DELHI CORRIDOR GRID
            </div>
          </div>
          <div>
            <div style={{ fontSize: 32, fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#A78BFA' }}>
              {activeVehicleCount} FLEET
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
              LIVE ACTIVE TARGETS
            </div>
          </div>
        </motion.div>
      </section>

      {/* Interactive Mini ANPR Scanner Teaser */}
      <section
        style={{
          maxWidth: 1100,
          margin: '0 auto 80px',
          padding: '0 24px',
          position: 'relative',
          zIndex: 5,
        }}
      >
        <div
          style={{
            background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: 'var(--radius-xl)',
            padding: '36px 40px',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 0 40px rgba(56, 189, 248, 0.08)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-primary)', fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                <Zap size={14} />
                INSTANT ANPR BENCHMARK TEST
              </div>
              <h3 style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>
                Test Indian License Plate OCR Engine
              </h3>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              {['DL 01 AB 1234', 'HR 26 DQ 5541', 'DL 04 EF 9876'].map((plate) => (
                <button
                  key={plate}
                  onClick={() => {
                    setTestPlate(plate);
                    setScanResult(null);
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    border: testPlate === plate ? '1px solid var(--color-primary)' : '1px solid rgba(148, 163, 184, 0.15)',
                    background: testPlate === plate ? 'rgba(56, 189, 248, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                    color: testPlate === plate ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    cursor: 'pointer',
                  }}
                >
                  {plate}
                </button>
              ))}
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 24,
              alignItems: 'center',
            }}
          >
            {/* Plate Display Card */}
            <div
              style={{
                background: 'rgba(11, 17, 32, 0.8)',
                border: '1px solid rgba(148, 163, 184, 0.15)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {isScanning && (
                <motion.div
                  initial={{ top: '0%' }}
                  animate={{ top: '100%' }}
                  transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    height: 2,
                    background: 'var(--color-primary)',
                    boxShadow: '0 0 15px var(--color-primary), 0 0 30px var(--color-primary)',
                    zIndex: 10,
                  }}
                />
              )}

              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 16 }}>
                SIMULATED HIGH-SPEED ROAD CAMERA FEED
              </div>

              {/* Indian HSRP License Plate graphic */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  background: '#FFFFFF',
                  color: '#000000',
                  border: '3px solid #111827',
                  borderRadius: 6,
                  padding: '10px 24px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: 6,
                    top: 6,
                    bottom: 6,
                    width: 14,
                    background: '#0284C7',
                    borderRadius: 2,
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
                    fontSize: 26,
                    fontWeight: 900,
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: '0.12em',
                    marginLeft: 12,
                  }}
                >
                  {testPlate}
                </span>
              </div>

              <div style={{ marginTop: 20 }}>
                <button
                  onClick={runSampleScan}
                  disabled={isScanning}
                  style={{
                    padding: '10px 24px',
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
                  {isScanning ? 'Running Neural OCR...' : 'Run Live Inference Scan'}
                </button>
              </div>
            </div>

            {/* Inference Results Output */}
            <div
              style={{
                background: 'rgba(11, 17, 32, 0.8)',
                border: '1px solid rgba(148, 163, 184, 0.15)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
              }}
            >
              <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', marginBottom: 14 }}>
                AI TELEMETRY OUTPUT
              </div>

              {scanResult ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(148, 163, 184, 0.1)', paddingBottom: 6 }}>
                    <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Detected Plate:</span>
                    <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-primary)' }}>
                      {scanResult.plate}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(148, 163, 184, 0.1)', paddingBottom: 6 }}>
                    <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Vehicle Class:</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{scanResult.vehicleType}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(148, 163, 184, 0.1)', paddingBottom: 6 }}>
                    <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>OCR Confidence:</span>
                    <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-success)' }}>
                      {scanResult.confidence}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(148, 163, 184, 0.1)', paddingBottom: 6 }}>
                    <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Inference Latency:</span>
                    <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
                      {scanResult.latency}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4 }}>
                    <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Security Status:</span>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        background: scanResult.status.includes('Clean') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: scanResult.status.includes('Clean') ? 'var(--color-success)' : 'var(--color-danger)',
                      }}
                    >
                      {scanResult.status}
                    </span>
                  </div>
                </div>
              ) : (
                <div style={{ color: 'var(--color-text-muted)', fontSize: 13, textAlign: 'center', padding: '30px 0' }}>
                  Click &ldquo;Run Live Inference Scan&rdquo; to test the detection pipeline.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Core Feature Pillars */}
      <section style={{ maxWidth: 1150, margin: '0 auto 80px', padding: '0 24px', position: 'relative', zIndex: 5 }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', fontWeight: 700, letterSpacing: '0.08em' }}>
            INTELLIGENT SURVEILLANCE MODULES
          </div>
          <h2 style={{ fontSize: 36, fontWeight: 800, marginTop: 6, letterSpacing: '-0.02em' }}>
            Designed for Law Enforcement & City Traffic Control
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          {[
            {
              icon: Crosshair,
              title: 'Live Mission Control Map',
              desc: 'Real-time Leaflet GIS mapping with moving vehicle coordinates, camera radar pins, and congestion zone heatmaps.',
              link: '/command-center',
              btn: 'Open Map',
            },
            {
              icon: Search,
              title: 'Cross-Camera Re-ID Dossier',
              desc: 'Reconstruct complete chronological vehicle journeys across Delhi junctions with numbered breadcrumb trails and timeline playback.',
              link: '/investigation',
              btn: 'Search Dossiers',
            },
            {
              icon: Cctv,
              title: 'Camera Surveillance Network',
              desc: 'Monitor 15+ high-definition Delhi surveillance camera feeds with real-time AI bounding boxes, FPS counters, and PTZ status.',
              link: '/cameras',
              btn: 'View Cameras',
            },
            {
              icon: BarChart3,
              title: 'Predictive Traffic Intelligence',
              desc: 'Hourly traffic volume curves, corridor bottleneck rankings, incident trends, and vehicle fleet distribution analytics.',
              link: '/analytics',
              btn: 'Explore Analytics',
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                style={{
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid rgba(148, 163, 184, 0.12)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '28px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  backdropFilter: 'blur(16px)',
                }}
              >
                <div>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(56, 189, 248, 0.1)',
                      border: '1px solid rgba(56, 189, 248, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-primary)',
                      marginBottom: 18,
                    }}
                  >
                    <Icon size={22} />
                  </div>
                  <h4 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{card.title}</h4>
                  <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: 20 }}>
                    {card.desc}
                  </p>
                </div>

                <button
                  onClick={() => navigate(card.link)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-primary)',
                    fontSize: 13,
                    fontWeight: 700,
                    fontFamily: 'var(--font-heading)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: 0,
                  }}
                >
                  {card.btn} →
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid rgba(148, 163, 184, 0.1)',
          background: 'rgba(7, 13, 26, 0.9)',
          padding: '36px 48px',
          maxWidth: 1300,
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Radio size={18} style={{ color: 'var(--color-primary)' }} />
          <span style={{ fontSize: 14, fontWeight: 700 }}>TrackAI Surveillance System</span>
          <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>· Smart India Hackathon 2024 (SIH26127)</span>
        </div>

        <div style={{ fontSize: 12, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
          FastAPI + YOLOv8 + Leaflet + Socket.IO + React 19
        </div>
      </footer>
    </div>
  );
}
