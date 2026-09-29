import { ProgramKerja } from '../types';

export const DEFAULT_SEED_PROKER: ProgramKerja[] = [
  {
    id: 'proker-komsos-streaming-01',
    nama: 'Streaming Misa Mingguan (Misa Pk 10:00 WIB)',
    tujuan: 'Menyediakan fasilitas siaran langsung (live streaming) perayaan Ekaristi mingguan bagi umat yang sakit, lansia, atau berhalangan hadir secara luring di gereja.',
    targetSasaran: 'Terlaksananya penayangan siaran langsung Misa Minggu jam 10:00 WIB secara rutin sepanjang tahun dengan kualitas visual dan audio yang prima melalui kanal media resmi paroki.',
    anggaran: 2500000,
    tahun: '2026',
    polaJadwal: 'sepanjang_tahun',
    bulanTerpilih: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    tipeKepastianTanggal: 'rutin',
    keteranganTanggal: 'Setiap Hari Minggu (Misa Pk 10:00 WIB)',
    tanggalPerBulan: {
      1: 'Setiap Minggu pk 10:00 WIB',
      2: 'Setiap Minggu pk 10:00 WIB',
      3: 'Setiap Minggu pk 10:00 WIB',
      4: 'Setiap Minggu pk 10:00 WIB',
      5: 'Setiap Minggu pk 10:00 WIB',
      6: 'Setiap Minggu pk 10:00 WIB',
      7: 'Setiap Minggu pk 10:00 WIB',
      8: 'Setiap Minggu pk 10:00 WIB',
      9: 'Setiap Minggu pk 10:00 WIB',
      10: 'Setiap Minggu pk 10:00 WIB',
      11: 'Setiap Minggu pk 10:00 WIB',
      12: 'Setiap Minggu pk 10:00 WIB',
    },
    picNama: 'Koordinator Tim Streaming & Multimedia Komsos',
    picSubSeksi: 'Sub-Seksi Broadcasting & Dokumentasi',
    picKontak: '081234567890',
    status: 'berjalan',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function createNewProker(tahun: '2026' | '2027' = '2026'): ProgramKerja {
  const newId = 'proker-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
  return {
    id: newId,
    nama: 'Program Kerja Baru',
    tujuan: '',
    targetSasaran: '',
    anggaran: 0,
    tahun,
    polaJadwal: 'satu_kali',
    bulanTerpilih: [new Date().getMonth() + 1],
    tipeKepastianTanggal: 'pasti',
    keteranganTanggal: '',
    tanggalPerBulan: {},
    picNama: '',
    picSubSeksi: '',
    picKontak: '',
    status: 'direncanakan',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
