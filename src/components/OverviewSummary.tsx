import React from 'react';
import { X, PieChart, CheckCircle2, Clock, AlertCircle, Calendar } from 'lucide-react';
import { ProgramKerja, STATUS_CONFIG, DAFTAR_BULAN } from '../types';
import { formatRupiah } from '../utils/formatters';

interface OverviewSummaryProps {
  prokers: ProgramKerja[];
  onClose: () => void;
  onSelectProker: (id: string) => void;
}

export const OverviewSummary: React.FC<OverviewSummaryProps> = ({
  prokers,
  onClose,
  onSelectProker,
}) => {
  const totalAnggaran = prokers.reduce((acc, p) => acc + (p.anggaran || 0), 0);

  const statusCounts = {
    direncanakan: prokers.filter((p) => p.status === 'direncanakan').length,
    berjalan: prokers.filter((p) => p.status === 'berjalan').length,
    selesai: prokers.filter((p) => p.status === 'selesai').length,
    ditunda: prokers.filter((p) => p.status === 'ditunda').length,
  };

  const proker2026 = prokers.filter((p) => p.tahun === '2026');
  const proker2027 = prokers.filter((p) => p.tahun === '2027');

  const anggaran2026 = proker2026.reduce((sum, p) => sum + (p.anggaran || 0), 0);
  const anggaran2027 = proker2027.reduce((sum, p) => sum + (p.anggaran || 0), 0);

  return (
    <div className="bg-white border-b border-indigo-100 p-4 space-y-4 shadow-sm animate-in fade-in duration-150">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <PieChart className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">
            Rekapitulasi Program Kerja & Anggaran
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
          aria-label="Tutup Rekap"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Grid of Key Totals */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-[11px] font-semibold text-slate-500 block">
            Total Kegiatan
          </span>
          <span className="text-lg font-bold text-slate-900 tabular-nums">
            {prokers.length}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            2026 ({proker2026.length}) · 2027 ({proker2027.length})
          </span>
        </div>

        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
          <span className="text-[11px] font-semibold text-emerald-800 block">
            Total Anggaran
          </span>
          <span className="text-base sm:text-lg font-bold text-emerald-700 tabular-nums truncate block">
            {formatRupiah(totalAnggaran)}
          </span>
          <span className="text-[10px] text-emerald-600 block mt-0.5 truncate">
            2026: {formatRupiah(anggaran2026)} · 2027: {formatRupiah(anggaran2027)}
          </span>
        </div>

        <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
          <span className="text-[11px] font-semibold text-blue-800 block">
            Sedang Berjalan
          </span>
          <span className="text-lg font-bold text-blue-700 tabular-nums">
            {statusCounts.berjalan}
          </span>
          <span className="text-[10px] text-blue-600 block mt-0.5">
            Direncanakan: {statusCounts.direncanakan}
          </span>
        </div>

        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
          <span className="text-[11px] font-semibold text-emerald-800 block">
            Selesai
          </span>
          <span className="text-lg font-bold text-emerald-700 tabular-nums">
            {statusCounts.selesai}
          </span>
          <span className="text-[10px] text-emerald-600 block mt-0.5">
            Ditunda: {statusCounts.ditunda}
          </span>
        </div>
      </div>

      {/* Mini Quick List of All Activities */}
      <div>
        <span className="text-xs font-bold text-slate-700 block mb-1.5">
          Daftar Cepat Semua Program ({prokers.length}):
        </span>
        <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
          {prokers.map((p, idx) => {
            const stCfg = STATUS_CONFIG[p.status];
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  onSelectProker(p.id);
                  onClose();
                }}
                className="w-full text-left p-2 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 transition-colors flex items-center justify-between gap-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {idx + 1}. {p.nama || 'Tanpa Nama'}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate flex items-center gap-1.5 mt-0.5">
                    <span>Th {p.tahun}</span>
                    <span>·</span>
                    <span className="text-emerald-700 font-semibold">
                      {formatRupiah(p.anggaran)}
                    </span>
                    <span>·</span>
                    <span>PIC: {p.picNama || '-'}</span>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${stCfg.bg} ${stCfg.text}`}
                >
                  {stCfg.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
