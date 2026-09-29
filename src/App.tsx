import React, { useState, useEffect, useMemo } from 'react';
import { HeaderBar } from './components/HeaderBar';
import { MonthFilterBar } from './components/MonthFilterBar';
import { ProkerSwitcher } from './components/ProkerSwitcher';
import { ProkerEditor } from './components/ProkerEditor';
import { OverviewSummary } from './components/OverviewSummary';
import { SecretariatExportPanel } from './components/SecretariatExportPanel';
import {
  ProgramKerja,
  FilterTahun,
  DAFTAR_BULAN,
} from './types';
import { DEFAULT_SEED_PROKER, createNewProker } from './data/defaultSeed';
import { exportProkerToCsv } from './utils/formatters';
import { Check, Plus, Calendar, AlertCircle } from 'lucide-react';

const STORAGE_KEY_PROKER = 'proker_planner_komsos_2026_2027_v2';
const STORAGE_KEY_SEKSI = 'proker_planner_komsos_seksi_v1';

export default function App() {
  // State for Seksi Name
  const [seksiName, setSeksiName] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SEKSI);
    return saved || 'Seksi Komsos (Komunikasi Sosial)';
  });

  // State for Proker list
  const [prokers, setProkers] = useState<ProgramKerja[]>(() => {
    try {
      const saved =
        localStorage.getItem(STORAGE_KEY_PROKER) ||
        localStorage.getItem('proker_planner_komsos_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Normalize any old 2025 to 2026
          return parsed.map((p) => ({
            ...p,
            tahun: p.tahun === '2025' ? '2026' : p.tahun,
          }));
        }
      }
    } catch (e) {
      console.error('Failed to parse saved proker data', e);
    }
    return DEFAULT_SEED_PROKER;
  });

  // Active Proker ID
  const [activeProkerId, setActiveProkerId] = useState<string>(() => {
    return prokers[0]?.id || '';
  });

  // Filters
  const [filterTahun, setFilterTahun] = useState<FilterTahun>('all');
  const [filterBulan, setFilterBulan] = useState<number | 'all'>('all');

  // Summary & Export Toggles
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Autosave toast status
  const [saveIndicator, setSaveIndicator] = useState<boolean>(false);

  // Sync to LocalStorage on prokers change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROKER, JSON.stringify(prokers));
      setSaveIndicator(true);
      const timer = setTimeout(() => setSaveIndicator(false), 1400);
      return () => clearTimeout(timer);
    } catch (e) {
      console.error('Failed to save proker to localStorage', e);
    }
  }, [prokers]);

  // Sync Seksi name to LocalStorage
  const handleSeksiChange = (name: string) => {
    setSeksiName(name);
    localStorage.setItem(STORAGE_KEY_SEKSI, name);
  };

  // Filtered Prokers based on Year and Month
  const filteredProkers = useMemo(() => {
    return prokers.filter((p) => {
      // Filter Tahun
      if (filterTahun !== 'all' && p.tahun !== filterTahun) {
        return false;
      }
      // Filter Bulan
      if (filterBulan !== 'all') {
        if (!p.bulanTerpilih || !p.bulanTerpilih.includes(filterBulan)) {
          return false;
        }
      }
      return true;
    });
  }, [prokers, filterTahun, filterBulan]);

  // Ensure activeProkerId points to a valid item in filtered list if available
  useEffect(() => {
    if (filteredProkers.length > 0) {
      const exists = filteredProkers.some((p) => p.id === activeProkerId);
      if (!exists) {
        setActiveProkerId(filteredProkers[0].id);
      }
    }
  }, [filteredProkers, activeProkerId]);

  // Active Proker Object
  const currentProker = useMemo(() => {
    return prokers.find((p) => p.id === activeProkerId) || filteredProkers[0] || null;
  }, [prokers, activeProkerId, filteredProkers]);

  // Total summary calculations
  const totalAnggaran = useMemo(() => {
    return filteredProkers.reduce((acc, p) => acc + (p.anggaran || 0), 0);
  }, [filteredProkers]);

  // Handlers
  const handleUpdateProker = (updated: ProgramKerja) => {
    setProkers((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    );
  };

  const handleAddProker = () => {
    const targetTahun = filterTahun === 'all' ? '2026' : filterTahun;
    const newProker = createNewProker(targetTahun);

    // If a month filter is active, preset that month
    if (filterBulan !== 'all') {
      newProker.bulanTerpilih = [filterBulan];
    }

    setProkers((prev) => [newProker, ...prev]);
    setActiveProkerId(newProker.id);
  };

  const handleDuplicateProker = (id: string) => {
    const target = prokers.find((p) => p.id === id);
    if (!target) return;

    const duplicated: ProgramKerja = {
      ...target,
      id: 'proker-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6),
      nama: `${target.nama} (Salinan)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProkers((prev) => [duplicated, ...prev]);
    setActiveProkerId(duplicated.id);
  };

  const handleDeleteProker = (id: string) => {
    setProkers((prev) => {
      const remaining = prev.filter((p) => p.id !== id);
      if (remaining.length > 0) {
        setActiveProkerId(remaining[0].id);
      } else {
        // If all are deleted, provide a fresh blank item
        const fresh = createNewProker();
        setActiveProkerId(fresh.id);
        return [fresh];
      }
      return remaining;
    });
  };

  const handleExportCsv = () => {
    exportProkerToCsv(filteredProkers, seksiName);
  };

  // Label for active filter
  const filterLabel = useMemo(() => {
    const parts: string[] = [];
    if (filterTahun !== 'all') parts.push(`Th ${filterTahun}`);
    if (filterBulan !== 'all') {
      const mName = DAFTAR_BULAN.find((m) => m.id === filterBulan)?.name;
      if (mName) parts.push(`Bulan ${mName}`);
    }
    return parts.length > 0 ? parts.join(' · ') : undefined;
  }, [filterTahun, filterBulan]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center">
      {/* Mobile-first centered unified container */}
      <div className="w-full max-w-xl min-h-screen bg-slate-50 border-x border-slate-200/80 shadow-md flex flex-col relative">
        {/* 1. Header with Seksi, Year Selector & Actions */}
        <HeaderBar
          seksiName={seksiName}
          onSeksiChange={handleSeksiChange}
          filterTahun={filterTahun}
          onFilterTahunChange={setFilterTahun}
          onExportCsv={handleExportCsv}
          onToggleExport={() => {
            setIsExportOpen(!isExportOpen);
            if (isSummaryOpen) setIsSummaryOpen(false);
          }}
          isExportOpen={isExportOpen}
          totalProker={filteredProkers.length}
          totalAnggaran={totalAnggaran}
          onToggleSummary={() => {
            setIsSummaryOpen(!isSummaryOpen);
            if (isExportOpen) setIsExportOpen(false);
          }}
          isSummaryOpen={isSummaryOpen}
        />

        {/* Expandable Secretariat Export Panel */}
        {isExportOpen && (
          <SecretariatExportPanel
            prokers={prokers}
            seksiName={seksiName}
            onClose={() => setIsExportOpen(false)}
          />
        )}

        {/* Expandable Overview Summary */}
        {isSummaryOpen && (
          <OverviewSummary
            prokers={prokers}
            onClose={() => setIsSummaryOpen(false)}
            onSelectProker={(id) => {
              setActiveProkerId(id);
              setIsSummaryOpen(false);
            }}
          />
        )}

        {/* 2. Interactive Month Filter Bar */}
        <MonthFilterBar
          filterBulan={filterBulan}
          onFilterBulanChange={setFilterBulan}
          prokers={
            filterTahun === 'all'
              ? prokers
              : prokers.filter((p) => p.tahun === filterTahun)
          }
        />

        {/* 3. 1-Touch Proker Switcher (Dropdown & Navigation) */}
        <ProkerSwitcher
          prokers={filteredProkers}
          activeProkerId={activeProkerId}
          onSelectProker={setActiveProkerId}
          onAddProker={handleAddProker}
          onDuplicateProker={handleDuplicateProker}
          onDeleteProker={handleDeleteProker}
          currentFilterLabel={filterLabel}
        />

        {/* 4. Unified Single-Screen Editor Form */}
        <main className="flex-1">
          {currentProker ? (
            <ProkerEditor
              key={currentProker.id}
              proker={currentProker}
              onChange={handleUpdateProker}
            />
          ) : (
            /* Empty Filter State */
            <div className="p-6 text-center space-y-3 my-8">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Tidak Ada Program Kerja di Filter Ini
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Belum ada program kerja untuk filter{' '}
                <span className="font-semibold text-slate-700">
                  {filterLabel || 'yang dipilih'}
                </span>
                . Anda dapat menambah program baru atau mengubah filter.
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleAddProker}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Buat Proker Baru</span>
                </button>
                {(filterBulan !== 'all' || filterTahun !== 'all') && (
                  <button
                    type="button"
                    onClick={() => {
                      setFilterBulan('all');
                      setFilterTahun('all');
                    }}
                    className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                  >
                    Reset Filter
                  </button>
                )}
              </div>
            </div>
          )}
        </main>

        {/* Floating Autosave Indicator */}
        <div
          className={`fixed bottom-3 right-3 sm:right-[calc(50%-18rem+1rem)] z-40 flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 text-white text-xs font-medium rounded-full shadow-lg backdrop-blur-xs transition-all duration-300 pointer-events-none ${
            saveIndicator ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>Tersimpan otomatis</span>
        </div>
      </div>
    </div>
  );
}
