import React from 'react';
import type { SourceMetadata } from '../types/karhutla.ts';

interface SourceMetadataBadgeProps {
  metadata: SourceMetadata;
  className?: string;
}

export const SourceMetadataBadge: React.FC<SourceMetadataBadgeProps> = ({ metadata, className = '' }) => {
  return (
    <div className={`flex flex-wrap items-center gap-2 text-xs text-slate-400 py-1.5 ${className}`}>
      <span className="font-semibold text-slate-200">{metadata.agency}</span>
      <span aria-hidden="true" className="text-slate-600">·</span>
      <span>{metadata.name}</span>
      <span aria-hidden="true" className="text-slate-600">·</span>
      <span className="font-mono tabular-nums text-slate-300">Periode: {metadata.period}</span>
      <span aria-hidden="true" className="text-slate-600">·</span>
      <span className="font-mono tabular-nums text-slate-400">Sinkronisasi: {metadata.timestamp}</span>
      <span aria-hidden="true" className="text-slate-600">·</span>
      <span className="text-amber-400">Validasi: {metadata.validationStatus}</span>
      <span aria-hidden="true" className="text-slate-600">·</span>
      <span className={metadata.connectionStatus === 'TERHUBUNG' ? 'text-emerald-400 font-medium' : 'text-slate-400'}>
        Status: {metadata.connectionStatus}
      </span>
      {metadata.details && (
        <>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="text-slate-400 italic">{metadata.details}</span>
        </>
      )}
    </div>
  );
};
