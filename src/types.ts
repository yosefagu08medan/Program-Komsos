export type Tahun = '2026' | '2027';
export type FilterTahun = 'all' | '2026' | '2027';

export type PolaJadwal = 'sepanjang_tahun' | 'multi_bulan' | 'satu_kali';

export type TipeKepastianTanggal = 'pasti' | 'tbd' | 'rutin';

export type StatusKegiatan = 'direncanakan' | 'berjalan' | 'selesai' | 'ditunda';

export interface ProgramKerja {
  id: string;
  nama: string;
  tujuan: string;
  targetSasaran: string;
  anggaran: number;
  tahun: Tahun;
  polaJadwal: PolaJadwal;
  bulanTerpilih: number[]; // 1 = Januari, 12 = Desember
  tipeKepastianTanggal: TipeKepastianTanggal;
  tanggalPerBulan: Record<number, string>; // e.g. { 1: "Minggu ke-2 (12 Jan)", ... }
  keteranganTanggal: string; // Ringkasan/keterangan umum jadwal tanggal
  picNama: string;
  picSubSeksi: string;
  picKontak: string;
  status: StatusKegiatan;
  createdAt: string;
  updatedAt: string;
}

export interface BulanInfo {
  id: number;
  name: string;
  short: string;
}

export const DAFTAR_BULAN: BulanInfo[] = [
  { id: 1, name: 'Januari', short: 'Jan' },
  { id: 2, name: 'Februari', short: 'Feb' },
  { id: 3, name: 'Maret', short: 'Mar' },
  { id: 4, name: 'April', short: 'Apr' },
  { id: 5, name: 'Mei', short: 'Mei' },
  { id: 6, name: 'Juni', short: 'Jun' },
  { id: 7, name: 'Juli', short: 'Jul' },
  { id: 8, name: 'Agustus', short: 'Ags' },
  { id: 9, name: 'September', short: 'Sep' },
  { id: 10, name: 'Oktober', short: 'Okt' },
  { id: 11, name: 'November', short: 'Nov' },
  { id: 12, name: 'Desember', short: 'Des' },
];

export const PRESET_SEKSI = [
  'Seksi Komsos (Komunikasi Sosial)',
  'Seksi Liturgi & Peribadatan',
  'Seksi PSE (Pengembangan Sosial Ekonomi)',
  'Seksi Kepemudaan (OMK)',
  'Seksi Katekese & Inisiasi',
  'Seksi Kerasulan Keluarga (SKK)',
  'Seksi Pewartaan & Evangelisasi',
  'Seksi Hubungan Antar Agama & Kepercayaan (HAK)',
];

export const STATUS_CONFIG: Record<
  StatusKegiatan,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  direncanakan: {
    label: 'Direncanakan',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  berjalan: {
    label: 'Sedang Berjalan',
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
  },
  selesai: {
    label: 'Selesai',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
  ditunda: {
    label: 'Ditunda',
    bg: 'bg-rose-50',
    text: 'text-rose-800',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
  },
};
