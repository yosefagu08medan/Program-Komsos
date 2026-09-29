import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  Target,
  UserCheck,
  Send,
  Sparkles,
  CalendarCheck,
  HelpCircle,
  Repeat,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  ProgramKerja,
  PolaJadwal,
  TipeKepastianTanggal,
  StatusKegiatan,
  Tahun,
  DAFTAR_BULAN,
  STATUS_CONFIG,
} from '../types';
import { formatRupiah, parseRupiahInput, formatWhatsAppUrl } from '../utils/formatters';

interface ProkerEditorProps {
  proker: ProgramKerja;
  onChange: (updated: ProgramKerja) => void;
}

export const ProkerEditor: React.FC<ProkerEditorProps> = ({ proker, onChange }) => {
  const [showAutoScheduleTool, setShowAutoScheduleTool] = useState(false);
  const [autoSchedulePattern, setAutoSchedulePattern] = useState(
    proker.keteranganTanggal || 'Minggu ke-2'
  );

  const updateField = <K extends keyof ProgramKerja>(field: K, value: ProgramKerja[K]) => {
    onChange({
      ...proker,
      [field]: value,
      updatedAt: new Date().toISOString(),
    });
  };

  // Schedule pattern changes
  const handlePolaJadwalChange = (pola: PolaJadwal) => {
    let newMonths = [...(proker.bulanTerpilih || [])];
    if (pola === 'sepanjang_tahun') {
      newMonths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    } else if (pola === 'satu_kali') {
      newMonths = newMonths.length > 0 ? [newMonths[0]] : [1];
    }
    onChange({
      ...proker,
      polaJadwal: pola,
      bulanTerpilih: newMonths,
      updatedAt: new Date().toISOString(),
    });
  };

  const toggleMonth = (monthId: number) => {
    const current = proker.bulanTerpilih || [];
    let updated: number[];
    if (current.includes(monthId)) {
      updated = current.filter((m) => m !== monthId);
    } else {
      updated = [...current, monthId].sort((a, b) => a - b);
    }
    updateField('bulanTerpilih', updated);
  };

  const applyMonthShortcut = (months: number[]) => {
    updateField('bulanTerpilih', months);
  };

  // Monthly date update
  const handleMonthDateChange = (monthId: number, value: string) => {
    const updatedDates = { ...(proker.tanggalPerBulan || {}) };
    if (value.trim()) {
      updatedDates[monthId] = value;
    } else {
      delete updatedDates[monthId];
    }
    updateField('tanggalPerBulan', updatedDates);
  };

  // Batch auto fill dates
  const applyBatchDatePattern = (pattern: string) => {
    const newDates: Record<number, string> = { ...(proker.tanggalPerBulan || {}) };
    (proker.bulanTerpilih || []).forEach((m) => {
      newDates[m] = pattern;
    });
    onChange({
      ...proker,
      tanggalPerBulan: newDates,
      keteranganTanggal: pattern,
      updatedAt: new Date().toISOString(),
    });
  };

  const activeMonthsList = (proker.bulanTerpilih || []).sort((a, b) => a - b);

  return (
    <div className="p-3.5 space-y-4 pb-20">
      {/* SECTION 1: NAMA, TAHUN & STATUS */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            01. Identitas Program
          </span>
          {/* Tahun Selector */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg">
            {(['2026', '2027'] as Tahun[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => updateField('tahun', t)}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                  proker.tahun === t
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tahun {t}
              </button>
            ))}
          </div>
        </div>

        {/* Input Nama Proker */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Nama Program Kerja <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={proker.nama}
            onChange={(e) => updateField('nama', e.target.value)}
            placeholder="Contoh: Pertemuan Rutin Pengurus Seksi..."
            className="w-full text-sm font-semibold px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 min-h-[44px]"
          />
        </div>

        {/* Status Kegiatan */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Status Kegiatan
          </label>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            {(Object.keys(STATUS_CONFIG) as StatusKegiatan[]).map((st) => {
              const cfg = STATUS_CONFIG[st];
              const isSelected = proker.status === st;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => updateField('status', st)}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all min-h-[42px] ${
                    isSelected
                      ? `${cfg.bg} ${cfg.text} ${cfg.border} ring-2 ring-indigo-500/20 font-bold shadow-xs`
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${cfg.dot} shrink-0`} />
                  <span className="truncate">{cfg.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 2: TUJUAN & TARGET SASARAN / OUTPUT */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3.5">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Target className="w-3.5 h-3.5 text-indigo-600" />
          <span className="text-[11px] font-bold uppercase tracking-wider">
            02. Tujuan & Sasaran Output
          </span>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Tujuan Kegiatan
          </label>
          <textarea
            rows={2}
            value={proker.tujuan}
            onChange={(e) => updateField('tujuan', e.target.value)}
            placeholder="Jelaskan maksud dan tujuan diadakannya kegiatan ini..."
            className="w-full text-xs sm:text-sm px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 resize-y"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Target Sasaran / Output Kegiatan
          </label>
          <textarea
            rows={2}
            value={proker.targetSasaran}
            onChange={(e) => updateField('targetSasaran', e.target.value)}
            placeholder="Target peserta, output yang diharapkan, atau indikator keberhasilan..."
            className="w-full text-xs sm:text-sm px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 resize-y"
          />
        </div>
      </div>

      {/* SECTION 3: ESTIMASI ANGGARAN */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-400">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[11px] font-bold uppercase tracking-wider">
              03. Estimasi Anggaran
            </span>
          </div>
          <span className="text-xs font-bold text-emerald-700 tabular-nums">
            {formatRupiah(proker.anggaran || 0)}
          </span>
        </div>

        {/* Input Anggaran with Rupiah formatting */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <span className="text-slate-500 font-bold text-sm">Rp</span>
          </div>
          <input
            type="text"
            inputMode="numeric"
            value={proker.anggaran ? proker.anggaran.toLocaleString('id-ID') : ''}
            onChange={(e) => updateField('anggaran', parseRupiahInput(e.target.value))}
            placeholder="0"
            className="w-full text-base sm:text-lg font-bold pl-11 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-900 tabular-nums min-h-[44px]"
          />
        </div>
      </div>

      {/* SECTION 4: JADWAL PELAKSANAAN (3 POLA) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3.5">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Calendar className="w-3.5 h-3.5 text-indigo-600" />
          <span className="text-[11px] font-bold uppercase tracking-wider">
            04. Jadwal Pelaksanaan (3 Pola)
          </span>
        </div>

        {/* 3 Pola Pelaksanaan Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => handlePolaJadwalChange('sepanjang_tahun')}
            className={`p-2.5 rounded-xl border text-left transition-all ${
              proker.polaJadwal === 'sepanjang_tahun'
                ? 'bg-indigo-50 border-indigo-300 text-indigo-950 ring-1 ring-indigo-300 shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white'
            }`}
          >
            <div className="text-xs font-bold flex items-center justify-between">
              <span>Sepanjang Tahun</span>
              {proker.polaJadwal === 'sepanjang_tahun' && (
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
              )}
            </div>
            <span className="text-[11px] text-slate-500 block mt-0.5 leading-tight">
              12 Bulan Penuh
            </span>
          </button>

          <button
            type="button"
            onClick={() => handlePolaJadwalChange('multi_bulan')}
            className={`p-2.5 rounded-xl border text-left transition-all ${
              proker.polaJadwal === 'multi_bulan'
                ? 'bg-indigo-50 border-indigo-300 text-indigo-950 ring-1 ring-indigo-300 shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white'
            }`}
          >
            <div className="text-xs font-bold flex items-center justify-between">
              <span>Multi Bulan</span>
              {proker.polaJadwal === 'multi_bulan' && (
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
              )}
            </div>
            <span className="text-[11px] text-slate-500 block mt-0.5 leading-tight">
              Pilihan Bebas / Terjadwal
            </span>
          </button>

          <button
            type="button"
            onClick={() => handlePolaJadwalChange('satu_kali')}
            className={`p-2.5 rounded-xl border text-left transition-all ${
              proker.polaJadwal === 'satu_kali'
                ? 'bg-indigo-50 border-indigo-300 text-indigo-950 ring-1 ring-indigo-300 shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white'
            }`}
          >
            <div className="text-xs font-bold flex items-center justify-between">
              <span>Satu Kali</span>
              {proker.polaJadwal === 'satu_kali' && (
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
              )}
            </div>
            <span className="text-[11px] text-slate-500 block mt-0.5 leading-tight">
              Pilih 1 Bulan Khusus
            </span>
          </button>
        </div>

        {/* Shortcuts for Multi Bulan */}
        {proker.polaJadwal === 'multi_bulan' && (
          <div className="pt-1 border-t border-slate-100">
            <span className="text-[11px] text-slate-500 font-medium block mb-1.5">
              Shortcut Pilihan Periode:
            </span>
            <div className="flex flex-wrap gap-1 mb-2">
              <button
                type="button"
                onClick={() => applyMonthShortcut([1, 2, 3])}
                className="text-[11px] font-semibold px-2 py-1 rounded bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 transition-colors"
              >
                Triwulan I (Jan-Mar)
              </button>
              <button
                type="button"
                onClick={() => applyMonthShortcut([4, 5, 6])}
                className="text-[11px] font-semibold px-2 py-1 rounded bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 transition-colors"
              >
                Triwulan II (Apr-Jun)
              </button>
              <button
                type="button"
                onClick={() => applyMonthShortcut([7, 8, 9])}
                className="text-[11px] font-semibold px-2 py-1 rounded bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 transition-colors"
              >
                Triwulan III (Jul-Sep)
              </button>
              <button
                type="button"
                onClick={() => applyMonthShortcut([10, 11, 12])}
                className="text-[11px] font-semibold px-2 py-1 rounded bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 transition-colors"
              >
                Triwulan IV (Okt-Des)
              </button>
              <button
                type="button"
                onClick={() => applyMonthShortcut([1, 2, 3, 4, 5, 6])}
                className="text-[11px] font-semibold px-2 py-1 rounded bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 transition-colors"
              >
                Semester 1 (Jan-Jun)
              </button>
              <button
                type="button"
                onClick={() => applyMonthShortcut([7, 8, 9, 10, 11, 12])}
                className="text-[11px] font-semibold px-2 py-1 rounded bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 transition-colors"
              >
                Semester 2 (Jul-Des)
              </button>
              <button
                type="button"
                onClick={() => applyMonthShortcut([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])}
                className="text-[11px] font-semibold px-2 py-1 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
              >
                Pilih Semua (12)
              </button>
              <button
                type="button"
                onClick={() => applyMonthShortcut([])}
                className="text-[11px] font-semibold px-2 py-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
              >
                Hapus Semua
              </button>
            </div>
          </div>
        )}

        {/* 12 Bulan Grid Checkboxes (Multi Bulan or Satu Kali) */}
        <div>
          <span className="text-[11px] text-slate-500 font-medium block mb-1.5">
            {proker.polaJadwal === 'sepanjang_tahun'
              ? 'Status Bulan: Aktif 12 Bulan Sepanjang Tahun'
              : proker.polaJadwal === 'satu_kali'
              ? 'Pilih 1 Bulan Pelaksanaan:'
              : 'Centang Bulan Pelaksanaan Yang Diinginkan:'}
          </span>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
            {DAFTAR_BULAN.map((m) => {
              const isChecked = proker.bulanTerpilih?.includes(m.id);
              const isDisabled = proker.polaJadwal === 'sepanjang_tahun';

              return (
                <button
                  key={m.id}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => {
                    if (proker.polaJadwal === 'satu_kali') {
                      updateField('bulanTerpilih', [m.id]);
                    } else if (proker.polaJadwal === 'multi_bulan') {
                      toggleMonth(m.id);
                    }
                  }}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition-all min-h-[42px] border ${
                    isChecked
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  } ${isDisabled ? 'cursor-default opacity-95' : 'active:scale-95'}`}
                >
                  {m.short}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 5: KEPASTIAN TANGGAL & RINCIAN PER BULAN */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-400">
            <CalendarCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-[11px] font-bold uppercase tracking-wider">
              05. Kepastian Tanggal Pelaksanaan
            </span>
          </div>
          <span className="text-[11px] font-semibold text-indigo-600">
            {activeMonthsList.length} Bulan Aktif
          </span>
        </div>

        {/* 3 Pilihan Kepastian Tanggal */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
          {[
            {
              id: 'pasti' as TipeKepastianTanggal,
              label: 'Tanggal Tertentu',
              desc: 'Sudah Pasti Tanggalnya',
              icon: CalendarCheck,
            },
            {
              id: 'rutin' as TipeKepastianTanggal,
              label: 'Rutin Berkala',
              desc: 'Contoh: Setiap Minggu ke-2',
              icon: Repeat,
            },
            {
              id: 'tbd' as TipeKepastianTanggal,
              label: 'Tentatif / TBD',
              desc: 'Ditentukan Kemudian',
              icon: HelpCircle,
            },
          ].map((item) => {
            const isSel = proker.tipeKepastianTanggal === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => updateField('tipeKepastianTanggal', item.id)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  isSel
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-950 ring-1 ring-indigo-300 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <Icon className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>{item.label}</span>
                </div>
                <span className="text-[11px] text-slate-500 block mt-0.5 leading-tight">
                  {item.desc}
                </span>
              </button>
            );
          })}
        </div>

        {/* Ringkasan / Keterangan Jadwal Tanggal */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Keterangan Jadwal Umum / Catatan Tanggal
          </label>
          <input
            type="text"
            value={proker.keteranganTanggal}
            onChange={(e) => updateField('keteranganTanggal', e.target.value)}
            placeholder="Contoh: Setiap Minggu kedua tiap bulan / Tanggal 15..."
            className="w-full text-xs sm:text-sm px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900"
          />
        </div>

        {/* Otomatisasi Pengisian Jadwal Bulanan Toggle */}
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowAutoScheduleTool(!showAutoScheduleTool)}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-indigo-50/80 hover:bg-indigo-50 text-indigo-900 border border-indigo-100 transition-colors"
          >
            <div className="flex items-center gap-2 text-xs font-bold">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Otomatisasi Pengisian Tanggal Bulanan</span>
            </div>
            {showAutoScheduleTool ? (
              <ChevronUp className="w-4 h-4 text-indigo-600" />
            ) : (
              <ChevronDown className="w-4 h-4 text-indigo-600" />
            )}
          </button>

          {showAutoScheduleTool && (
            <div className="mt-2 p-3 bg-indigo-50/40 border border-indigo-100 rounded-xl space-y-2 animate-in fade-in duration-150">
              <div className="text-xs text-indigo-950 font-medium">
                Pilih atau ketik format otomatis untuk diterapkan ke semua bulan aktif:
              </div>

              {/* Preset quick buttons */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Setiap Minggu ke-2',
                  'Setiap Minggu ke-3',
                  'Setiap Tanggal 15',
                  'Jumat Pertama',
                  'Sabtu Terakhir',
                  'Tentatif / Menyesuaikan',
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setAutoSchedulePattern(preset);
                      applyBatchDatePattern(preset);
                    }}
                    className="text-[11px] px-2 py-1 rounded-md bg-white border border-indigo-200 text-indigo-800 font-semibold hover:bg-indigo-600 hover:text-white transition-colors"
                  >
                    {preset}
                  </button>
                ))}
              </div>

              {/* Custom input + apply button */}
              <div className="flex gap-1.5 pt-1">
                <input
                  type="text"
                  value={autoSchedulePattern}
                  onChange={(e) => setAutoSchedulePattern(e.target.value)}
                  placeholder="Ketik pola tanggal khusus..."
                  className="flex-1 text-xs px-2.5 py-1.5 bg-white border border-indigo-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => applyBatchDatePattern(autoSchedulePattern)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors shrink-0 shadow-xs"
                >
                  Terapkan ke Semua ({activeMonthsList.length} Bln)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Rincian Rencana Tanggal Per Bulan Aktif */}
        <div>
          <span className="text-xs font-bold text-slate-700 block mb-2">
            Rincian Tanggal Per Bulan:
          </span>

          {activeMonthsList.length === 0 ? (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>Belum ada bulan yang dipilih pada Bagian 04 di atas.</span>
            </div>
          ) : (
            <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
              {activeMonthsList.map((mId) => {
                const bInfo = DAFTAR_BULAN.find((b) => b.id === mId);
                const currentVal = proker.tanggalPerBulan?.[mId] || '';

                return (
                  <div
                    key={mId}
                    className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200/80 rounded-xl"
                  >
                    <div className="w-16 shrink-0 text-xs font-bold text-slate-800">
                      {bInfo?.name || `Bulan ${mId}`}
                    </div>
                    <input
                      type="text"
                      value={currentVal}
                      onChange={(e) => handleMonthDateChange(mId, e.target.value)}
                      placeholder={`Rencana tanggal ${bInfo?.short}... (misal: 12 ${bInfo?.short})`}
                      className="flex-1 text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-900"
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 6: PENANGGUNG JAWAB (PIC) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3.5">
        <div className="flex items-center gap-1.5 text-slate-400">
          <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
          <span className="text-[11px] font-bold uppercase tracking-wider">
            06. Penanggung Jawab (PIC)
          </span>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Nama PIC / Koordinator Kegiatan
          </label>
          <input
            type="text"
            value={proker.picNama}
            onChange={(e) => updateField('picNama', e.target.value)}
            placeholder="Contoh: Fransiscus Xaverius / Maria Goretti..."
            className="w-full text-xs sm:text-sm px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Sub-Seksi / Unit Kerja
          </label>
          <input
            type="text"
            value={proker.picSubSeksi}
            onChange={(e) => updateField('picSubSeksi', e.target.value)}
            placeholder="Contoh: Sub-Seksi Putra Altar / Pengurus Inti / Tim Musik..."
            className="w-full text-xs sm:text-sm px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900"
          />
        </div>

        {/* Nomor Kontak WhatsApp with direct 1-tap WhatsApp action */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Nomor Kontak / WhatsApp
          </label>
          <div className="flex items-center gap-2">
            <input
              type="tel"
              value={proker.picKontak}
              onChange={(e) => updateField('picKontak', e.target.value)}
              placeholder="Contoh: 081234567890"
              className="flex-1 text-xs sm:text-sm px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900"
            />

            {/* Direct WhatsApp button */}
            {proker.picKontak ? (
              <a
                href={formatWhatsAppUrl(
                  proker.picKontak,
                  `Halo ${proker.picNama || 'Rekan'}, perihal koordinasi Program Kerja: ${proker.nama} (${proker.tahun})...`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs shrink-0 min-h-[42px]"
                title="Buka WhatsApp langsung"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Chat WA</span>
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="px-3 py-2 bg-slate-100 text-slate-400 text-xs font-bold rounded-xl flex items-center gap-1.5 shrink-0 opacity-60 min-h-[42px]"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Chat WA</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
