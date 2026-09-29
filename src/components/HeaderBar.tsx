import React, { useState } from 'react';
import { Download, ChevronDown, Check, Edit2, BarChart3, Calendar } from 'lucide-react';
import { FilterTahun, PRESET_SEKSI } from '../types';
import { formatRupiah } from '../utils/formatters';

interface HeaderBarProps {
  seksiName: string;
  onSeksiChange: (name: string) => void;
  filterTahun: FilterTahun;
  onFilterTahunChange: (tahun: FilterTahun) => void;
  onExportCsv: () => void;
  onToggleExport: () => void;
  isExportOpen: boolean;
  totalProker: number;
  totalAnggaran: number;
  onToggleSummary: () => void;
  isSummaryOpen: boolean;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  seksiName,
  onSeksiChange,
  filterTahun,
  onFilterTahunChange,
  onExportCsv,
  onToggleExport,
  isExportOpen,
  totalProker,
  totalAnggaran,
  onToggleSummary,
  isSummaryOpen,
}) => {
  const [isEditingSeksi, setIsEditingSeksi] = useState(false);
  const [customInput, setCustomInput] = useState(seksiName);

  const handleSelectPreset = (preset: string) => {
    onSeksiChange(preset);
    setCustomInput(preset);
    setIsEditingSeksi(false);
  };

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim()) {
      onSeksiChange(customInput.trim());
      setIsEditingSeksi(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top compact line: Seksi & Year Selector */}
      <div className="px-3.5 py-2.5">
        <div className="flex items-center justify-between gap-2">
          {/* Seksi Title with Click to Edit */}
          <div className="min-w-0 flex-1">
            <button
              onClick={() => setIsEditingSeksi(!isEditingSeksi)}
              className="text-left w-full group flex items-center gap-1.5 focus:outline-hidden"
              title="Ketuk untuk mengganti nama Seksi / Bidang"
            >
              <div className="min-w-0">
                <span className="text-[11px] font-semibold tracking-wider uppercase text-indigo-600 block leading-tight">
                  Perencanaan Proker
                </span>
                <span className="text-sm font-bold text-slate-900 truncate block leading-tight group-hover:text-indigo-600 transition-colors">
                  {seksiName}
                </span>
              </div>
              <Edit2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 shrink-0 transition-colors" />
            </button>
          </div>

          {/* Action buttons: Summary Toggle & Export CSV */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={onToggleSummary}
              className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors min-h-[40px] ${
                isSummaryOpen
                  ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Lihat Rekapitulasi Anggaran & Status"
              aria-label="Ringkasan"
            >
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline text-xs font-semibold">Rekap</span>
            </button>

            <button
              onClick={onToggleExport}
              className={`px-2.5 py-1.5 rounded-lg active:scale-95 transition-all text-xs font-semibold flex items-center gap-1.5 min-h-[40px] shadow-xs ${
                isExportOpen
                  ? 'bg-emerald-700 text-white ring-2 ring-emerald-300'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
              title="Unduh & Ekspor Laporan Sekretariat"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor / Unduh</span>
            </button>
          </div>
        </div>

        {/* Inline Seksi Switcher Panel */}
        {isEditingSeksi && (
          <div className="mt-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Pilih atau Ganti Seksi / Bidang:</span>
              <button
                onClick={() => setIsEditingSeksi(false)}
                className="text-slate-400 hover:text-slate-600 text-xs px-1"
              >
                Tutup
              </button>
            </div>
            
            {/* Quick preset chips */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {PRESET_SEKSI.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`text-xs px-2.5 py-1 rounded-md text-left transition-colors ${
                    seksiName === preset
                      ? 'bg-indigo-600 text-white font-medium'
                      : 'bg-white border border-slate-200 text-slate-700 hover:border-indigo-300'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>

            {/* Custom input */}
            <form onSubmit={handleSaveCustom} className="flex gap-1.5 pt-1">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Ketik nama seksi / bidang lain..."
                className="flex-1 text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 shrink-0"
              >
                Simpan
              </button>
            </form>
          </div>
        )}

        {/* Filter Tahun Bar */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium text-slate-600 mr-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              Tahun:
            </span>
            {(['all', '2026', '2027'] as FilterTahun[]).map((yr) => {
              const active = filterTahun === yr;
              const label = yr === 'all' ? 'Semua' : yr;
              return (
                <button
                  key={yr}
                  onClick={() => onFilterTahunChange(yr)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all min-h-[34px] min-w-[48px] ${
                    active
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Quick metric pill without pill enclosure */}
          <div className="text-right text-xs text-slate-600 font-medium tabular-nums">
            <span className="font-bold text-slate-900">{totalProker}</span> Proker ·{' '}
            <span className="font-semibold text-emerald-700">{formatRupiah(totalAnggaran)}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
