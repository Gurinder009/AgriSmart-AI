import React from 'react';

export const LoadingSkeleton: React.FC<{ rows?: number; height?: string }> = ({
  rows = 3,
  height = 'h-5',
}) => {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={`bg-slate-200/70 rounded-xl ${height} ${
            i === 0 ? 'w-3/4' : i === rows - 1 ? 'w-1/2' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
};
