import React from 'react';

interface SkeletonLoaderProps {
  variant?: 'card' | 'chart' | 'table' | 'text' | 'map';
  count?: number;
}

const SkeletonPulse: React.FC<{ width?: string; height?: string; borderRadius?: string; style?: React.CSSProperties }> = ({
  width = '100%',
  height = '20px',
  borderRadius = '8px',
  style,
}) => (
  <div
    className="skeleton-pulse"
    style={{
      width,
      height,
      borderRadius,
      background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite ease-in-out',
      ...style,
    }}
  />
);

const CardSkeleton: React.FC = () => (
  <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <SkeletonPulse width="120px" height="14px" />
      <SkeletonPulse width="36px" height="36px" borderRadius="10px" />
    </div>
    <SkeletonPulse width="80px" height="28px" />
    <SkeletonPulse width="160px" height="12px" />
  </div>
);

const ChartSkeleton: React.FC = () => (
  <div className="glass-panel" style={{ padding: '20px' }}>
    <SkeletonPulse width="200px" height="18px" style={{ marginBottom: '8px' }} />
    <SkeletonPulse width="300px" height="12px" style={{ marginBottom: '20px' }} />
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '180px', padding: '0 20px' }}>
      {[65, 85, 45, 72, 58, 90].map((h, i) => (
        <SkeletonPulse key={i} width="100%" height={`${h}%`} borderRadius="6px 6px 0 0" />
      ))}
    </div>
  </div>
);

const TableSkeleton: React.FC = () => (
  <div className="glass-panel" style={{ padding: '20px' }}>
    <SkeletonPulse width="240px" height="20px" style={{ marginBottom: '16px' }} />
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <SkeletonPulse width="25%" height="16px" />
          <SkeletonPulse width="15%" height="16px" />
          <SkeletonPulse width="15%" height="16px" />
          <SkeletonPulse width="10%" height="16px" />
          <SkeletonPulse width="20%" height="16px" />
          <SkeletonPulse width="15%" height="16px" />
        </div>
      ))}
    </div>
  </div>
);

const MapSkeleton: React.FC = () => (
  <div className="glass-panel" style={{ padding: '16px', height: '620px', display: 'flex', flexDirection: 'column' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
      <div>
        <SkeletonPulse width="260px" height="18px" style={{ marginBottom: '6px' }} />
        <SkeletonPulse width="200px" height="12px" />
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        {[1, 2, 3, 4].map(i => (
          <SkeletonPulse key={i} width="70px" height="28px" borderRadius="12px" />
        ))}
      </div>
    </div>
    <SkeletonPulse width="100%" height="100%" borderRadius="12px" style={{ flex: 1 }} />
  </div>
);

const TextSkeleton: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
    <SkeletonPulse width="100%" height="14px" />
    <SkeletonPulse width="85%" height="14px" />
    <SkeletonPulse width="70%" height="14px" />
  </div>
);

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ variant = 'card', count = 1 }) => {
  const items = Array.from({ length: count });

  switch (variant) {
    case 'card':
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', margin: '0 20px 24px 20px' }}>
          {items.map((_, i) => <CardSkeleton key={i} />)}
        </div>
      );
    case 'chart':
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', margin: '0 20px 24px 20px' }}>
          {items.map((_, i) => <ChartSkeleton key={i} />)}
        </div>
      );
    case 'table':
      return (
        <div style={{ margin: '0 20px 24px 20px' }}>
          {items.map((_, i) => <TableSkeleton key={i} />)}
        </div>
      );
    case 'map':
      return (
        <div style={{ margin: '0 20px 24px 20px' }}>
          {items.map((_, i) => <MapSkeleton key={i} />)}
        </div>
      );
    case 'text':
      return <>{items.map((_, i) => <TextSkeleton key={i} />)}</>;
    default:
      return null;
  }
};
