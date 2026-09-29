import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Copy, Trash2, AlertCircle } from 'lucide-react';
import { ProgramKerja, STATUS_CONFIG } from '../types';

interface ProkerSwitcherProps {
  prokers: ProgramKerja[];
  activeProkerId: string | null;
  onSelectProker: (id: string) => void;
  onAddProker: () => void;
  onDuplicateProker: (id: string) => void;
  onDeleteProker: (id: string) => void;
  currentFilterLabel?: string;
}

export const ProkerSwitcher: React.FC<ProkerSwitcherProps> = ({
  prokers,
  activeProkerId,
  onSelectProker,
  onAddProker,
  onDuplicateProker,
  onDeleteProker,
  currentFilterLabel,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const currentIndex = prokers.findIndex((p) => p.id === activeProkerId);
  const currentProker = currentIndex !== -1 ? prokers[currentIndex] : null;

  const handlePrev = () => {
    if (prokers.length === 0) return;
    const nextIdx = currentIndex > 0 ? currentIndex - 1 : prokers.length - 1;
    onSelectProker(prokers[nextIdx].id);
    setShowDeleteConfirm(false);
  };

  const handleNext = () => {
    if (prokers.length === 0) return;
    const nextIdx = currentIndex < prokers.length - 1 ? currentIndex + 1 : 0;
    onSelectProker(prokers[nextIdx].id);
    setShowDeleteConfirm(false);
  };

  return (
    <div className="bg-white border-b border-slate-200/90 p-3 shadow-xs">
      {/* Top row: Dropdown selector & + Baru button */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 min-w-0">
          <label htmlFor="proker-select" className="sr-only">
            Pilih Program Kerja
          </label>
          <select
            id="proker-select"
            value={activeProkerId || ''}
            onChange={(e) => {
              onSelectProker(e.target.value);
              setShowDeleteConfirm(false);
            }}
            className="w-full appearance-none bg-slate-50 border border-slate-300 hover:border-indigo-400 focus:border-indigo-500 focus:bg-white text-slate-900 font-semibold text-xs sm:text-sm rounded-xl py-2.5 pl-3.5 pr-8 transition-colors truncate focus:outline-hidden focus:ring-2 focus:ring-indigo-100 min-h-[44px]"
          >
            {prokers.length === 0 ? (
              <option value="">(Belum ada program untuk filter ini)</option>
            ) : (
              prokers.map((p, idx) => {
                const statusLabel = STATUS_CONFIG[p.status]?.label || p.status;
                return (
                  <option key={p.id} value={p.id}>
                    {idx + 1}. {p.nama || 'Tanpa Nama'} ({p.tahun} · {statusLabel})
                  </option>
                );
              })
            )}
          </select>
          {/* Custom chevron indicator */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Tombol + Baru */}
        <button
          type="button"
          onClick={() => {
            onAddProker();
            setShowDeleteConfirm(false);
          }}
          className="shrink-0 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-xs min-h-[44px]"
          title="Tambah Program Kerja Baru"
        >
          <Plus className="w-4 h-4" />
          <span className="font-bold">+ Baru</span>
        </button>
      </div>

      {/* Bottom navigation bar: Prev, Counter, Next, Duplicate, Delete */}
      <div className="flex items-center justify-between gap-1.5 mt-2.5 pt-2 border-t border-slate-100">
        {/* Tombol Sebelumnya */}
        <button
          type="button"
          onClick={handlePrev}
          disabled={prokers.length <= 1}
          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-slate-700 text-xs font-semibold flex items-center gap-1 min-h-[42px] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Sebelumnya</span>
        </button>

        {/* Counter indicator */}
        <div className="text-center px-1">
          {prokers.length > 0 ? (
            <div className="text-xs text-slate-500 font-medium">
              <span className="font-bold text-slate-900 tabular-nums">
                {currentIndex + 1}
              </span>{' '}
              dari <span className="font-bold tabular-nums">{prokers.length}</span>
              {currentFilterLabel && (
                <span className="hidden sm:inline text-indigo-600 text-[11px] block sm:inline sm:ml-1">
                  ({currentFilterLabel})
                </span>
              )}
            </div>
          ) : (
            <span className="text-xs text-slate-400 italic">0 kegiatan</span>
          )}
        </div>

        {/* Tombol Berikutnya */}
        <button
          type="button"
          onClick={handleNext}
          disabled={prokers.length <= 1}
          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-slate-700 text-xs font-semibold flex items-center gap-1 min-h-[42px] transition-colors"
        >
          <span>Berikutnya</span>
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Quick Duplicate & Delete tools */}
        {currentProker && (
          <div className="flex items-center gap-1 ml-1 pl-1 border-l border-slate-200">
            <button
              type="button"
              onClick={() => onDuplicateProker(currentProker.id)}
              className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 min-h-[42px] min-w-[38px] flex items-center justify-center transition-colors"
              title="Duplikasi Program Ini"
            >
              <Copy className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
              className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 min-h-[42px] min-w-[38px] flex items-center justify-center transition-colors"
              title="Hapus Program"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Inline delete confirmation (No modal!) */}
      {showDeleteConfirm && currentProker && (
        <div className="mt-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-2 animate-in fade-in duration-150">
          <div className="flex items-center gap-2 text-rose-800 text-xs min-w-0">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span className="truncate">Hapus "{currentProker.nama}"?</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              className="px-2 py-1 text-xs rounded-md bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => {
                onDeleteProker(currentProker.id);
                setShowDeleteConfirm(false);
              }}
              className="px-2.5 py-1 text-xs font-semibold rounded-md bg-rose-600 text-white hover:bg-rose-700 shadow-xs"
            >
              Ya, Hapus
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
