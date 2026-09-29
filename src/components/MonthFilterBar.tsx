import React, { useRef, useEffect } from 'react';
import { DAFTAR_BULAN, ProgramKerja } from '../types';

interface MonthFilterBarProps {
  filterBulan: number | 'all';
  onFilterBulanChange: (bulan: number | 'all') => void;
  prokers: ProgramKerja[];
}

export const MonthFilterBar: React.FC<MonthFilterBarProps> = ({
  filterBulan,
  onFilterBulanChange,
  prokers,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Compute count of active proker per month
  const monthCounts: Record<number, number> = {};
  for (let m = 1; m <= 12; m++) {
    monthCounts[m] = prokers.filter((p) => p.bulanTerpilih?.includes(m)).length;
  }
  const totalCount = prokers.length;

  return (
    <div className="bg-slate-100/90 border-b border-slate-200/70 py-1.5 px-2">
      <div
        ref={scrollRef}
        className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-0.5 px-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* All Months button */}
        <button
          type="button"
          onClick={() => onFilterBulanChange('all')}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all min-h-[40px] ${
            filterBulan === 'all'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>Semua Bulan</span>
          <span
            className={`text-[11px] px-1.5 py-0.2 rounded-full tabular-nums font-bold ${
              filterBulan === 'all'
                ? 'bg-indigo-700/80 text-white'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {totalCount}
          </span>
        </button>

        {/* Months Jan - Des */}
        {DAFTAR_BULAN.map((bulan) => {
          const isActive = filterBulan === bulan.id;
          const count = monthCounts[bulan.id] || 0;

          return (
            <button
              key={bulan.id}
              type="button"
              onClick={() => onFilterBulanChange(bulan.id)}
              className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all min-h-[40px] ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : count > 0
                  ? 'bg-white text-slate-800 border border-slate-200 hover:bg-slate-50'
                  : 'bg-slate-50/80 text-slate-400 border border-slate-200/60 hover:text-slate-600'
              }`}
            >
              <span>{bulan.short}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums font-bold ${
                  isActive
                    ? 'bg-indigo-700/80 text-white'
                    : count > 0
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'bg-slate-200/60 text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
