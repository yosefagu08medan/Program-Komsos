import React, { useState } from 'react';
import {
  Download,
  FileSpreadsheet,
  FileText,
  Copy,
  Check,
  X,
  Building2,
  Calendar,
  Layers,
} from 'lucide-react';
import { ProgramKerja } from '../types';
import {
  exportProkerToCsv,
  generateSecretariatReportText,
  formatRupiah,
} from '../utils/formatters';

interface SecretariatExportPanelProps {
  prokers: ProgramKerja[];
  seksiName: string;
  onClose: () => void;
}

export const SecretariatExportPanel: React.FC<SecretariatExportPanelProps> = ({
  prokers,
  seksiName,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | '2026' | '2027'>('all');

  const prokers2026 = prokers.filter((p) => p.tahun === '2026');
  const prokers2027 = prokers.filter((p) => p.tahun === '2027');

  const anggaran2026 = prokers2026.reduce((s, p) => s + (p.anggaran || 0), 0);
  const anggaran2027 = prokers2027.reduce((s, p) => s + (p.anggaran || 0), 0);
  const totalAnggaran = prokers.reduce((s, p) => s + (p.anggaran || 0), 0);

  const handleCopyText = (scope: 'all' | '2026' | '2027') => {
    const text = generateSecretariatReportText(prokers, seksiName, scope);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = (scope: 'all' | '2026' | '2027') => {
    const text = generateSecretariatReportText(prokers, seksiName, scope);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const cleanSeksi = seksiName.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 25);
    link.href = url;
    link.download = `Laporan_Sekretariat_${cleanSeksi}_${scope}_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-emerald-50/60 border-b border-emerald-200 p-4 space-y-3.5 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-emerald-200/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-600 text-white rounded-lg">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
              Ekspor Data & Laporan Sekretariat Paroki
            </h3>
            <p className="text-[11px] text-slate-500 leading-tight">
              Format terstruktur siap kompilasi buku program kerja tahunan
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
          aria-label="Tutup panel ekspor"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scope Selector Tabs */}
      <div className="flex bg-white p-1 rounded-xl border border-emerald-200 gap-1 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-center transition-all ${
            activeTab === 'all'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Semua Data ({prokers.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('2026')}
          className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-center transition-all ${
            activeTab === '2026'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Tahun 2026 ({prokers2026.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('2027')}
          className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-center transition-all ${
            activeTab === '2027'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Tahun 2027 ({prokers2027.length})
        </button>
      </div>

      {/* Summary of selected tab */}
      <div className="p-2.5 bg-white rounded-xl border border-emerald-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold text-slate-700">
            {activeTab === 'all'
              ? 'Kompilasi Tahun 2026 & 2027'
              : activeTab === '2026'
              ? 'Pelaksanaan Tahun 2026'
              : 'Program Kerja Tahun 2027'}
          </span>
        </div>
        <div className="font-bold text-emerald-800 tabular-nums">
          {activeTab === 'all'
            ? formatRupiah(totalAnggaran)
            : activeTab === '2026'
            ? formatRupiah(anggaran2026)
            : formatRupiah(anggaran2027)}
        </div>
      </div>

      {/* Action Buttons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {/* 1. Download Excel / CSV */}
        <button
          type="button"
          onClick={() => exportProkerToCsv(prokers, seksiName, activeTab)}
          className="p-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl flex items-center gap-2.5 shadow-xs transition-all text-left"
        >
          <FileSpreadsheet className="w-5 h-5 shrink-0" />
          <div className="min-w-0">
            <span className="text-xs font-bold block leading-tight">
              Unduh Excel / CSV
            </span>
            <span className="text-[10px] text-emerald-100 block leading-tight mt-0.5 truncate">
              {activeTab === 'all'
                ? 'Semua data 2026 & 2027'
                : activeTab === '2026'
                ? 'Khusus pelaksanaan 2026'
                : 'Khusus rencana kerja 2027'}
            </span>
          </div>
        </button>

        {/* 2. Download Text Document (.txt) */}
        <button
          type="button"
          onClick={() => handleDownloadTxt(activeTab)}
          className="p-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 active:scale-98 rounded-xl flex items-center gap-2.5 shadow-xs transition-all text-left"
        >
          <FileText className="w-5 h-5 text-indigo-600 shrink-0" />
          <div className="min-w-0">
            <span className="text-xs font-bold block leading-tight">
              Unduh Dokumen (.txt)
            </span>
            <span className="text-[10px] text-slate-500 block leading-tight mt-0.5 truncate">
              Format memo teks resmi sekretariat
            </span>
          </div>
        </button>

        {/* 3. Copy text to clipboard */}
        <button
          type="button"
          onClick={() => handleCopyText(activeTab)}
          className="p-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 active:scale-98 rounded-xl flex items-center gap-2.5 shadow-xs transition-all text-left sm:col-span-2"
        >
          {copied ? (
            <Check className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <Copy className="w-5 h-5 text-slate-600 shrink-0" />
          )}
          <div className="min-w-0">
            <span className="text-xs font-bold block leading-tight">
              {copied ? 'Berhasil Disalin ke Clipboard!' : 'Salin Teks Format Laporan'}
            </span>
            <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">
              Siap ditempelkan (paste) ke Microsoft Word, Email, atau WhatsApp Sekretariat
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};
