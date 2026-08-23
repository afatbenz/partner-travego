export type SeoLandingConfig = {
  path: string;
  keyword: string;
  city: string;
  /** Substrings matched (lowercased) against fleet_type_label / fleet_type. */
  typeTokens: string[];
  title: string;
  metaDescription: string;
  h1: string;
  intro: string[];
  faqs: { q: string; a: string }[];
};

const introBus = (city: string) => [
  `Butuh sewa bus di ${city} untuk acara keluarga, study tour, perjalanan kantor, atau pernikahan? Calista Prima menyediakan armada bus pariwisata yang terawat dan siap melayani rute lokal maupun antar kota. Kami melayani penjemputan di berbagai titik di ${city} dengan harga yang bersaing dan transparan.`,
  `Setiap bus dirawat rutin dan dikemudikan oleh sopir berpengalaman yang mengenal jalur di ${city} dengan baik. Fasilitas lengkap — AC, audio, dan kursi nyaman — membuat perjalanan Anda tetap menyenangkan sepanjang perjalanan. Pilih durasi sewa sesuai kebutuhan, dari city tour harian hingga perjalanan multi-hari.`,
];

const introHiace = (city: string) => [
  `Sewa Hiace di ${city} bersama Calista Prima untuk perjalanan keluarga, rombongan kerja, wisata, maupun antar-jemput tamu. Hiace Premio kami memiliki kapasitas hingga 14 penumpang, kabin luas, dan AC menyala penuh — nyaman untuk perjalanan jarak dekat maupun jauh.`,
  `Armada Hiace kami berstatus terawat, rutin diservis, dan didukung sopir yang hafal rute di ${city}. Anda bisa memilih sewa harian, city tour, atau overland antar kota dengan harga yang jelas tanpa biaya tersembunyi.`,
];

const introElf = (city: string) => [
  `Sewa Elf di ${city} menjadi pilihan tepat untuk rombongan berukuran sedang — 12 hingga 16 penumpang — dengan biaya lebih hemat dibanding bus besar. Calista Prima menyediakan Elf dengan kondisi prima untuk wisata, acara kantor, maupun perjalanan keluarga di ${city} dan sekitarnya.`,
  `Elf kami ringkas sehingga mudah melintasi jalanan padat di ${city}, tetap nyaman dengan AC dan kursi empuk. Harga sewa kompetitif, sopir berpengalaman, dan penjemputan fleksibel sesuai lokasi Anda.`,
];

export const seoLandingPages: SeoLandingConfig[] = [
  {
    path: '/sewa-bus-tangerang',
    keyword: 'Sewa Bus Tangerang',
    city: 'Tangerang',
    typeTokens: ['bus'],
    title: 'Sewa Bus Tangerang | Calista Prima',
    metaDescription:
      'Sewa bus pariwisata Tangerang dari Calista Prima. Armada terawat, harga bersaing, sopir berpengalaman. Melayani city tour & antar kota. Pesan sekarang!',
    h1: 'Sewa Bus Tangerang',
    intro: introBus('Tangerang'),
    faqs: [
      {
        q: 'Berapa harga sewa bus di Tangerang?',
        a: 'Harga sewa bus di Tangerang tergantung jenis armada, durasi, dan rute. Hubungi kami untuk penawaran terbaik yang disesuaikan dengan kebutuhan Anda.',
      },
      {
        q: 'Jenis bus apa saja yang tersedia di Tangerang?',
        a: 'Kami menyediakan berbagai armada bus pariwisata dengan kapasitas dan fasilitas berbeda, cocok untuk study tour, acara kantor, pernikahan, dan wisata.',
      },
      {
        q: 'Apakah bus dilengkapi sopir?',
        a: 'Ya, semua armada kami disediakan bersama sopir berpengalaman yang mengenal rute di Tangerang dengan baik.',
      },
      {
        q: 'Bagaimana cara memesan sewa bus di Tangerang?',
        a: 'Pilih armada di halaman ini, tentukan tanggal dan tujuan, lalu kirim permintaan. Tim kami akan segera menghubungi Anda untuk konfirmasi.',
      },
    ],
  },
  {
    path: '/sewa-hiace-tangerang',
    keyword: 'Sewa Hiace Tangerang',
    city: 'Tangerang',
    typeTokens: ['hiace', 'premio'],
    title: 'Sewa Hiace Tangerang | Calista Prima',
    metaDescription:
      'Sewa Hiace Premio Tangerang kapasitas 14 penumpang. AC, kursi nyaman, sopir berpengalaman. Harga bersaing untuk wisata & antar-jemput. Pesan sekarang!',
    h1: 'Sewa Hiace Tangerang',
    intro: introHiace('Tangerang'),
    faqs: [
      {
        q: 'Berapa kapasitas Hiace yang bisa disewa?',
        a: 'Hiace Premio kami berkapasitas hingga 14 penumpang, nyaman untuk keluarga maupun rombongan kerja.',
      },
      {
        q: 'Berapa harga sewa Hiace di Tangerang?',
        a: 'Harga sewa Hiace tergantung durasi dan rute. Hubungi kami untuk penawaran terbaik.',
      },
      {
        q: 'Apakah bisa antar-jemput ke lokasi di Tangerang?',
        a: 'Ya, kami melayani penjemputan di berbagai titik di Tangerang dan sekitarnya.',
      },
      {
        q: 'Apakah Hiace disewakan tanpa sopir?',
        a: 'Saat ini semua armada disewakan bersama sopir berpengalaman untuk keamanan dan kenyamanan Anda.',
      },
    ],
  },
  {
    path: '/sewa-elf-tangerang',
    keyword: 'Sewa Elf Tangerang',
    city: 'Tangerang',
    typeTokens: ['elf', 'commuter'],
    title: 'Sewa Elf Tangerang | Calista Prima',
    metaDescription:
      'Sewa Elf Tangerang untuk 12-16 penumpang. Hemat, nyaman, AC menyala, sopir berpengalaman. Ideal wisata & acara kantor. Pesan sekarang!',
    h1: 'Sewa Elf Tangerang',
    intro: introElf('Tangerang'),
    faqs: [
      {
        q: 'Berapa kapasitas Elf yang bisa disewa?',
        a: 'Armada Elf kami menampung sekitar 12 hingga 16 penumpang, cocok untuk rombongan berukuran sedang.',
      },
      {
        q: 'Apakah sewa Elf di Tangerang murah?',
        a: 'Ya, Elf adalah pilihan hemat untuk rombongan sedang. Harga kompetitif tanpa biaya tersembunyi.',
      },
      {
        q: 'Area mana saja yang dilayani?',
        a: 'Kami melayani area Tangerang, Jakarta, dan sekitarnya untuk rute lokal maupun antar kota.',
      },
      {
        q: 'Bagaimana cara mendapat penawaran harga?',
        a: 'Hubungi kami melalui form di halaman ini dengan tanggal dan tujuan Anda, kami akan kirim penawaran terbaik.',
      },
    ],
  },
  {
    path: '/sewa-bus-jakarta',
    keyword: 'Sewa Bus Jakarta',
    city: 'Jakarta',
    typeTokens: ['bus'],
    title: 'Sewa Bus Jakarta | Calista Prima',
    metaDescription:
      'Sewa bus pariwisata Jakarta dari Calista Prima. Armada terawat, harga bersaing, sopir hafal rute Jakarta. Melayani city tour & antar kota. Pesan sekarang!',
    h1: 'Sewa Bus Jakarta',
    intro: introBus('Jakarta'),
    faqs: [
      {
        q: 'Berapa harga sewa bus di Jakarta?',
        a: 'Harga tergantung jenis armada, durasi, dan rute. Hubungi kami untuk penawaran yang disesuaikan kebutuhan Anda.',
      },
      {
        q: 'Apakah bus tersedia untuk wisata keliling Jakarta?',
        a: 'Ya, kami melayani city tour Jakarta serta rute antar kota dan luar Jawa.',
      },
      {
        q: 'Apakah disediakan sopir?',
        a: 'Ya, semua armada disertai sopir berpengalaman yang mengenal jalur Jakarta.',
      },
      {
        q: 'Bagaimana cara pesan sewa bus Jakarta?',
        a: 'Pilih armada, tentukan tanggal dan tujuan, lalu kirim permintaan. Tim kami menghubungi Anda segera.',
      },
    ],
  },
  {
    path: '/sewa-hiace-jakarta',
    keyword: 'Sewa Hiace Jakarta',
    city: 'Jakarta',
    typeTokens: ['hiace', 'premio'],
    title: 'Sewa Hiace Jakarta | Calista Prima',
    metaDescription:
      'Sewa Hiace Premio Jakarta 14 penumpang. AC, nyaman, sopir hafal rute Jakarta. Harga bersaing untuk wisata & antar-jemput. Pesan sekarang!',
    h1: 'Sewa Hiace Jakarta',
    intro: introHiace('Jakarta'),
    faqs: [
      {
        q: 'Berapa harga sewa Hiace di Jakarta?',
        a: 'Harga tergantung durasi dan rute. Hubungi kami untuk penawaran terbaik.',
      },
      {
        q: 'Apakah melayani penjemputan di Jakarta?',
        a: 'Ya, kami melayani penjemputan di berbagai area Jakarta.',
      },
      {
        q: 'Apakah cocok untuk perjalanan dinas?',
        a: 'Sangat cocok. Hiace Premio nyaman untuk rombongan kerja maupun tamu perusahaan.',
      },
      {
        q: 'Bagaimana cara memesan?',
        a: 'Kirim permintaan via form dengan tanggal dan tujuan, kami hubungi Anda segera.',
      },
    ],
  },
  {
    path: '/sewa-elf-jakarta',
    keyword: 'Sewa Elf Jakarta',
    city: 'Jakarta',
    typeTokens: ['elf', 'commuter'],
    title: 'Sewa Elf Jakarta | Calista Prima',
    metaDescription:
      'Sewa Elf Jakarta untuk 12-16 penumpang. Hemat, nyaman, sopir hafal rute Jakarta. Ideal wisata & acara kantor. Pesan sekarang!',
    h1: 'Sewa Elf Jakarta',
    intro: introElf('Jakarta'),
    faqs: [
      {
        q: 'Berapa kapasitas Elf yang disewa di Jakarta?',
        a: 'Armada Elf kami menampung 12 hingga 16 penumpang.',
      },
      {
        q: 'Apakah sewa Elf di Jakarta hemat?',
        a: 'Ya, Elf adalah pilihan ekonomis untuk rombongan sedang dengan harga kompetitif.',
      },
      {
        q: 'Area mana yang dilayani?',
        a: 'Kami melayani Jakarta, Tangerang, dan sekitarnya.',
      },
      {
        q: 'Bagaimana mendapat penawaran?',
        a: 'Isi form dengan tanggal dan tujuan, tim kami kirim penawaran terbaik.',
      },
    ],
  },
];
