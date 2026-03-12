// ==========================================
// 1. SIHIR JAM REAL-TIME 
// ==========================================
const updateJam = () => {
  const sekarang = new Date();
  const jam = sekarang.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  // Kita ganti titik jadi titik dua biar estetik (standar digital clock)
  document.getElementById('realtime-clock').innerText = jam.replace(/\./g, ':');
};
setInterval(updateJam, 1000);
updateJam();

// ==========================================
// 2. DATABASE AGENDA LOKAL (Sistem Sementara)
// ==========================================
// Karena belum ada backend Golang buat jadwal, kita simpan di RAM browser dulu
let databaseAgenda = {
  '2026-03-11': [
    { id: 1, jam: '08:00', judul: 'Shift Pagi Bos Ghifari', tipe: 'shift' },
    { id: 2, jam: '14:00', judul: 'Restock Susu Aren', tipe: 'restock' }
  ]
};

let tanggalLagiDibuka = new Date(); // Bulan/Tahun yang lagi ditampilin
let tanggalYangDipilih = new Date(); // Tanggal yang diklik user

const namaBulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

// ==========================================
// 3. LOGIKA RENDER KALENDER (OTAKNYA)
// ==========================================
const renderKalender = () => {
  const tahun = tanggalLagiDibuka.getFullYear();
  const bulan = tanggalLagiDibuka.getMonth();
  
  // Ubah judul kalender
  document.getElementById('bulan-tahun').innerText = `${namaBulan[bulan]} ${tahun}`;
  
  const tanggalPertama = new Date(tahun, bulan, 1).getDay(); // Hari apa tgl 1?
  const jumlahHari = new Date(tahun, bulan + 1, 0).getDate(); // Berapa hari bulan ini?
  
  const grid = document.getElementById('grid-kalender');
  grid.innerHTML = '';

  // Bikin kotak kosong sebelum tanggal 1
  for (let i = 0; i < tanggalPertama; i++) {
    grid.innerHTML += `<div class="rounded-xl border border-transparent p-2"></div>`;
  }

  // Bikin kotak tanggal 1 sampai akhir
  const hariIniBeneran = new Date();
  
  for (let i = 1; i <= jumlahHari; i++) {
    const stringTanggal = `${tahun}-${String(bulan + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const adaAgenda = databaseAgenda[stringTanggal] ? true : false;
    
    // Cek apakah ini hari ini secara real time
    const isHariIni = i === hariIniBeneran.getDate() && bulan === hariIniBeneran.getMonth() && tahun === hariIniBeneran.getFullYear();
    // Cek apakah tanggal ini lagi diklik user
    const isDipilih = i === tanggalYangDipilih.getDate() && bulan === tanggalYangDipilih.getMonth() && tahun === tanggalYangDipilih.getFullYear();

    let classKotak = 'rounded-xl p-2 border transition-all cursor-pointer flex flex-col justify-between hover:border-mocha hover:bg-mocha/5 relative ';
    
    if (isDipilih) {
      classKotak += 'border-mocha bg-mocha/10 shadow-[0_0_15px_rgba(140,94,60,0.3)] ';
    } else if (isHariIni) {
      classKotak += 'border-white/20 bg-white/5 ';
    } else {
      classKotak += 'border-mocha/10 bg-macchiato ';
    }

    const titikAgenda = adaAgenda ? `<div class="w-1.5 h-1.5 rounded-full bg-mocha mx-auto mt-1 shadow-[0_0_5px_#8C5E3C]"></div>` : '';

    grid.innerHTML += `
      <div class="${classKotak}" onclick="pilihTanggal(${tahun}, ${bulan}, ${i})">
        <span class="text-lg font-bold ${isDipilih || isHariIni ? 'text-latte' : 'text-latte/60'}">${i}</span>
        ${titikAgenda}
      </div>
    `;
  }
};

const ubahBulan = (angka) => {
  tanggalLagiDibuka.setMonth(tanggalLagiDibuka.getMonth() + angka);
  renderKalender();
};

const pilihTanggal = (tahun, bulan, tanggal) => {
  tanggalYangDipilih = new Date(tahun, bulan, tanggal);
  renderKalender(); // Refresh kotak yang nyala
  renderAgenda(); // Nampilin list agenda di sebelah kanan
};

// ==========================================
// 4. LOGIKA AGENDA SEBELAH KANAN
// ==========================================
const renderAgenda = () => {
  const tglString = `${tanggalYangDipilih.getFullYear()}-${String(tanggalYangDipilih.getMonth() + 1).padStart(2, '0')}-${String(tanggalYangDipilih.getDate()).padStart(2, '0')}`;
  
  document.getElementById('agenda-tanggal').innerText = `${tanggalYangDipilih.getDate()} ${namaBulan[tanggalYangDipilih.getMonth()]} ${tanggalYangDipilih.getFullYear()}`;
  
  const listContainer = document.getElementById('list-agenda');
  listContainer.innerHTML = '';

  const jadwalHariIni = databaseAgenda[tglString] || [];

  if (jadwalHariIni.length === 0) {
    listContainer.innerHTML = `
      <div class="h-full flex flex-col items-center justify-center text-latte/30 pt-10">
        <svg class="w-12 h-12 mb-3 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <p class="text-sm font-medium">Belum ada agenda</p>
      </div>`;
  } else {
    // Urutin berdasarkan jam
    jadwalHariIni.sort((a, b) => a.jam.localeCompare(b.jam)).forEach(item => {
      let icon, warnaBorder, warnaText;
      
      if (item.tipe === 'shift') {
        icon = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>`;
        warnaBorder = 'border-blue-500/30';
        warnaText = 'text-blue-400';
      } else if (item.tipe === 'restock') {
        icon = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>`;
        warnaBorder = 'border-yellow-500/30';
        warnaText = 'text-yellow-400';
      } else {
        icon = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"></path>`;
        warnaBorder = 'border-matcha/30';
        warnaText = 'text-matcha';
      }

      listContainer.innerHTML += `
        <div class="p-4 bg-espresso/50 border ${warnaBorder} rounded-2xl flex items-center gap-4 group hover:bg-espresso transition-colors">
          <div class="w-12 h-12 shrink-0 bg-macchiato rounded-xl flex items-center justify-center border border-white/5 shadow-inner">
            <svg class="w-6 h-6 ${warnaText}" fill="none" stroke="currentColor" viewBox="0 0 24 24">${icon}</svg>
          </div>
          <div class="flex-1">
            <h4 class="font-bold text-sm text-latte">${item.judul}</h4>
            <p class="text-xs font-bold ${warnaText} mt-1">${item.jam} WIB</p>
          </div>
          <button onclick="hapusAgenda('${tglString}', ${item.id})" class="p-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20 rounded-lg">
             <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        </div>
      `;
    });
  }
};

// ==========================================
// 5. MODAL & TOAST NOTIF
// ==========================================
const modal = document.getElementById('modal-jadwal');
const modalContent = document.getElementById('modal-content-jadwal');

const bukaModalJadwal = () => {
  document.getElementById('input-judul').value = '';
  document.getElementById('input-jam').value = '09:00';
  modal.classList.remove('hidden');
  setTimeout(() => {
    modal.classList.remove('opacity-0');
    modalContent.classList.remove('scale-95');
  }, 10);
};

const tutupModalJadwal = () => {
  modal.classList.add('opacity-0');
  modalContent.classList.add('scale-95');
  setTimeout(() => modal.classList.add('hidden'), 300); 
};

const simpanAgenda = () => {
  const judul = document.getElementById('input-judul').value;
  const jam = document.getElementById('input-jam').value;
  const tipe = document.getElementById('input-tipe').value;

  if(!judul || !jam) {
    showToast("Isi lengkap dulu formnya Bos!", "error");
    return;
  }

  const tglString = `${tanggalYangDipilih.getFullYear()}-${String(tanggalYangDipilih.getMonth() + 1).padStart(2, '0')}-${String(tanggalYangDipilih.getDate()).padStart(2, '0')}`;
  
  if (!databaseAgenda[tglString]) databaseAgenda[tglString] = [];
  
  databaseAgenda[tglString].push({
    id: Date.now(),
    jam: jam,
    judul: judul,
    tipe: tipe
  });

  showToast("Agenda berhasil disimpan!", "success");
  tutupModalJadwal();
  renderAgenda();
  renderKalender(); // Refresh titik di kalender
};

const hapusAgenda = (tglString, id) => {
  databaseAgenda[tglString] = databaseAgenda[tglString].filter(item => item.id !== id);
  showToast("Agenda dihapus!", "success");
  renderAgenda();
  renderKalender();
};

const showToast = (message, type = 'success') => {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  let bgColor = type === 'error' ? 'bg-red-500/90 border-red-500/50' : 'bg-matcha border-matcha/50';
  let svgIcon = type === 'error' 
    ? `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`
    : `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`;

  toast.className = `flex items-center gap-3 px-5 py-4 text-white rounded-xl shadow-2xl border backdrop-blur-md transform transition-all duration-300 translate-x-full opacity-0 ${bgColor}`;
  toast.innerHTML = `${svgIcon}<span class="font-bold text-sm tracking-wide">${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.classList.remove('translate-x-full', 'opacity-0'), 10);
  setTimeout(() => {
    toast.classList.add('translate-x-full', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};

// Starter Engine
document.addEventListener('DOMContentLoaded', () => {
  renderKalender();
  renderAgenda();
});