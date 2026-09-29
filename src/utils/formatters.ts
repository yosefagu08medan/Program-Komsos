import { ProgramKerja, DAFTAR_BULAN, STATUS_CONFIG, Tahun } from '../types';

export function formatRupiah(value: number): string {
  if (isNaN(value) || value === null || value === undefined) return 'Rp 0';
  return 'Rp ' + Math.round(value).toLocaleString('id-ID');
}

export function parseRupiahInput(input: string): number {
  const clean = input.replace(/[^0-9]/g, '');
  return clean ? parseInt(clean, 10) : 0;
}

export function formatWhatsAppUrl(phoneNumber: string, message?: string): string {
  let cleaned = phoneNumber.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  } else if (!cleaned.startsWith('62')) {
    cleaned = '62' + cleaned;
  }
  const textParam = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${cleaned}${textParam}`;
}

export function exportProkerToCsv(
  prokers: ProgramKerja[],
  seksiName: string,
  scope: 'all' | '2026' | '2027' = 'all'
) {
  const targetProkers = prokers.filter((p) => {
    if (scope === 'all') return true;
    return p.tahun === scope;
  });

  const totalAnggaran = targetProkers.reduce((sum, p) => sum + (p.anggaran || 0), 0);
  const scopeLabel =
    scope === 'all'
      ? 'Kompilasi_2026_2027'
      : scope === '2026'
      ? 'Tahun_2026'
      : 'Tahun_2027';

  const scopeTitle =
    scope === 'all'
      ? 'KOMPILASI PROGRAM KERJA TAHUN 2026 & 2027'
      : scope === '2026'
      ? 'PROGRAM KERJA & PELAKSANAAN TAHUN 2026'
      : 'PERENCANAAN PROGRAM KERJA TAHUN 2027';

  // Metadata block at top for Secretariat compilation
  const metadataRows = [
    `"LAPORAN RESMI PERENCANAAN PROGRAM KERJA"`,
    `"SEKSI / UNIT KERJA:","${seksiName.replace(/"/g, '""')}"`,
    `"PERIODE LAPORAN:","${scopeTitle}"`,
    `"TANGGAL CETAK / EKSPOR:","${new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })}"`,
    `"TOTAL KEGIATAN:","${targetProkers.length} Program"`,
    `"TOTAL ESTIMASI ANGGARAN:","${formatRupiah(totalAnggaran)}"`,
    `"CATATAN SEKRETARIAT:","Format standar siap kompilasi buku laporan program kerja tahunan paroki."`,
    `""`, // empty spacer row
  ];

  const headers = [
    'No',
    'Tahun Anggaran',
    'Nama Program Kerja',
    'Seksi / Unit',
    'Sub-Seksi / Pelaksana',
    'Status Kegiatan',
    'Estimasi Anggaran (Rp)',
    'Pola Pelaksanaan',
    'Bulan Pelaksanaan',
    'Kepastian Tanggal',
    'Jadwal Rutin / Keterangan Waktu',
    'Rincian Jadwal Per Bulan (Jan-Des)',
    'Tujuan Kegiatan',
    'Target Sasaran / Output',
    'Nama PIC / Koordinator',
    'No Kontak / WhatsApp',
  ];

  const rows = targetProkers.map((p, idx) => {
    const bulanNames = (p.bulanTerpilih || [])
      .sort((a, b) => a - b)
      .map((b) => DAFTAR_BULAN.find((m) => m.id === b)?.name || `Bulan ${b}`)
      .join(', ');

    const rincianPerBulan = (p.bulanTerpilih || [])
      .sort((a, b) => a - b)
      .map((b) => {
        const bName = DAFTAR_BULAN.find((m) => m.id === b)?.short || `${b}`;
        const tgl = p.tanggalPerBulan?.[b] || '-';
        return `${bName}: ${tgl}`;
      })
      .join('; ');

    const polaText =
      p.polaJadwal === 'sepanjang_tahun'
        ? 'Sepanjang Tahun (12 Bulan)'
        : p.polaJadwal === 'multi_bulan'
        ? 'Multi Bulan Terjadwal'
        : 'Satu Kali Pelaksanaan';

    const kepastianText =
      p.tipeKepastianTanggal === 'pasti'
        ? 'Tanggal Tertentu (Sudah Pasti)'
        : p.tipeKepastianTanggal === 'rutin'
        ? 'Rutin Berkala'
        : 'Ditentukan Kemudian (Tentatif / TBD)';

    const statusText = STATUS_CONFIG[p.status]?.label || p.status;

    return [
      idx + 1,
      p.tahun,
      escapeCsvField(p.nama),
      escapeCsvField(seksiName),
      escapeCsvField(p.picSubSeksi || '-'),
      statusText,
      p.anggaran,
      escapeCsvField(polaText),
      escapeCsvField(bulanNames),
      escapeCsvField(kepastianText),
      escapeCsvField(p.keteranganTanggal || '-'),
      escapeCsvField(rincianPerBulan || '-'),
      escapeCsvField(p.tujuan || '-'),
      escapeCsvField(p.targetSasaran || '-'),
      escapeCsvField(p.picNama || '-'),
      escapeCsvField(p.picKontak || '-'),
    ];
  });

  const csvContent =
    '\uFEFF' +
    [
      ...metadataRows,
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  const cleanSeksi = seksiName.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 25);
  link.setAttribute('href', url);
  link.setAttribute('download', `Laporan_Proker_${cleanSeksi}_${scopeLabel}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCsvField(val: string | number | undefined): string {
  if (val === undefined || val === null) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

export function generateSecretariatReportText(
  prokers: ProgramKerja[],
  seksiName: string,
  scope: 'all' | '2026' | '2027' = 'all'
): string {
  const targetProkers = prokers.filter((p) => {
    if (scope === 'all') return true;
    return p.tahun === scope;
  });

  const totalAnggaran = targetProkers.reduce((sum, p) => sum + (p.anggaran || 0), 0);
  const title =
    scope === 'all'
      ? 'KOMPILASI PROGRAM KERJA TAHUN 2026 & 2027'
      : scope === '2026'
      ? 'PROGRAM KERJA & PELAKSANAAN TAHUN 2026'
      : 'PERENCANAAN PROGRAM KERJA TAHUN 2027';

  let text = `==========================================================\n`;
  text += `LAPORAN RESMI PERENCANAAN PROGRAM KERJA (PROKER)\n`;
  text += `UNTUK DISERAHKAN KEPADA SEKRETARIAT PAROKI\n`;
  text += `==========================================================\n`;
  text += `Seksi / Bidang : ${seksiName}\n`;
  text += `Periode        : ${title}\n`;
  text += `Tanggal Cetak  : ${new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })}\n`;
  text += `Total Program  : ${targetProkers.length} Kegiatan\n`;
  text += `Total Anggaran : ${formatRupiah(totalAnggaran)}\n`;
  text += `==========================================================\n\n`;

  if (targetProkers.length === 0) {
    text += `(Belum ada program kerja yang terdaftar untuk periode ini)\n`;
    return text;
  }

  targetProkers.forEach((p, idx) => {
    const bulanNames = (p.bulanTerpilih || [])
      .sort((a, b) => a - b)
      .map((b) => DAFTAR_BULAN.find((m) => m.id === b)?.name || `Bulan ${b}`)
      .join(', ');

    const rincianBulan = (p.bulanTerpilih || [])
      .sort((a, b) => a - b)
      .map((b) => {
        const bName = DAFTAR_BULAN.find((m) => m.id === b)?.name || `Bulan ${b}`;
        const tgl = p.tanggalPerBulan?.[b] || '-';
        return `     - ${bName}: ${tgl}`;
      })
      .join('\n');

    text += `${idx + 1}. [TAHUN ${p.tahun}] ${p.nama.toUpperCase()}\n`;
    text += `   Status            : ${STATUS_CONFIG[p.status]?.label || p.status}\n`;
    text += `   Estimasi Anggaran : ${formatRupiah(p.anggaran)}\n`;
    text += `   Sub-Seksi / Unit  : ${p.picSubSeksi || '-'}\n`;
    text += `   PIC / Koordinator : ${p.picNama || '-'} (Kontak: ${p.picKontak || '-'})\n`;
    text += `   Tujuan Kegiatan   : ${p.tujuan || '-'}\n`;
    text += `   Sasaran / Output  : ${p.targetSasaran || '-'}\n`;
    text += `   Pola Jadwal       : ${
      p.polaJadwal === 'sepanjang_tahun'
        ? 'Sepanjang Tahun (12 Bulan)'
        : p.polaJadwal === 'multi_bulan'
        ? 'Multi Bulan Terjadwal'
        : 'Satu Kali Pelaksanaan'
    }\n`;
    text += `   Bulan Aktif       : ${bulanNames || '-'}\n`;
    text += `   Jadwal Rutin/Ket  : ${p.keteranganTanggal || '-'}\n`;
    if (rincianBulan) {
      text += `   Jadwal Per Bulan  :\n${rincianBulan}\n`;
    }
    text += `----------------------------------------------------------\n\n`;
  });

  text += `Demikian laporan program kerja ini disusun untuk dapat dikompilasi oleh Sekretariat ke dalam Buku Laporan Program Kerja Tahunan Paroki.\n`;

  return text;
}
