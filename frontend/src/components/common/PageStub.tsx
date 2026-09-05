/**
 * TrackAI — Page stub component factory
 */

import { motion } from 'framer-motion';

interface PageStubProps {
  title: string;
  icon: string;
  description: string;
  milestone: string;
}

export default function PageStub({ title, icon, description, milestone }: PageStubProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 200px)',
        textAlign: 'center',
        gap: '16px',
      }}
    >
      <div
        style={{
          fontSize: 64,
          marginBottom: 8,
        }}
      >
        {icon}
      </div>
      <h1
        style={{
          fontSize: 28,
          fontFamily: 'var(--font-heading)',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          letterSpacing: '-0.03em',
        }}
      >
        {title}
      </h1>
      <p
        style={{
          fontSize: 14,
          color: 'var(--color-text-secondary)',
          maxWidth: 480,
          lineHeight: 1.6,
        }}
      >
        {description}
      </p>
      <span className="badge badge-simulation" style={{ marginTop: 8 }}>
        🔨 {milestone}
      </span>
    </motion.div>
  );
}
