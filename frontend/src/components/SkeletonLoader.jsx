import React from 'react';

export function SkeletonBox({ width = '100%', height = '20px', borderRadius = 'var(--radius-sm)', style = {} }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.04) 25%, rgba(255, 255, 255, 0.08) 50%, rgba(255, 255, 255, 0.04) 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeletonShimmer 1.5s infinite',
        ...style
      }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="card-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <SkeletonBox width="45%" height="16px" />
        <SkeletonBox width="28px" height="28px" borderRadius="var(--radius-sm)" />
      </div>
      <SkeletonBox width="60%" height="28px" />
      <SkeletonBox width="80%" height="12px" />
    </div>
  );
}

export function SkeletonCards({ count = 4 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', width: '100%' }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonTableRows({ rows = 5, cols = 5 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <tr key={rIdx}>
          {Array.from({ length: cols }).map((_, cIdx) => (
            <td key={cIdx} style={{ padding: '0.85rem 1rem' }}>
              <SkeletonBox width={cIdx === 0 ? '70%' : '50%'} height="14px" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function SkeletonTable({ rows = 5, cols = 5 }) {
  return (
    <div className="card-panel" style={{ padding: '1rem', width: '100%' }}>
      <table className="table" style={{ width: '100%' }}>
        <tbody>
          <SkeletonTableRows rows={rows} cols={cols} />
        </tbody>
      </table>
    </div>
  );
}

export default {
  SkeletonBox,
  SkeletonCard,
  SkeletonCards,
  SkeletonTableRows,
  SkeletonTable
};
