// ==========================================
// 1. TARIK DATA ANALYTICS DARI GOLANG
// ==========================================
const formatRupiah = (angka) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
};

const formatPersen = (elementId, value) => {
  const el = document.getElementById(elementId);
  if(!el) return;
  if (value >= 0) {
    el.innerHTML = `<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg> +${value.toFixed(1)}% dari kemarin`;
    el.className = "text-matcha text-xs font-bold mt-2 relative z-10 flex items-center gap-1";
  } else {
    el.innerHTML = `<svg class="w-3 h-3 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg> ${value.toFixed(1)}% dari kemarin`;
    el.className = "text-red-500 text-xs font-bold mt-2 relative z-10 flex items-center gap-1";
  }
};

const fetchDashboard = async () => {
  try {
    const response = await fetch('http://localhost:8080/api/dashboard');
    const data = await response.json();
    
    // Update Angka
    document.getElementById('dash-revenue').innerText = formatRupiah(data.today_revenue || 0);
    document.getElementById('dash-orders').innerHTML = `${data.today_orders || 0} <span class="text-lg text-latte/40 font-medium">Transaksi</span>`;
    
    formatPersen('dash-rev-pct', data.revenue_pct || 0);
    formatPersen('dash-ord-pct', data.orders_pct || 0);

    document.getElementById('dash-best-name').innerText = data.best_item || "Belum Ada Data";
    document.getElementById('dash-best-qty').innerText = `${data.best_qty || 0} Terjual hari ini`;
    
    // Update Transaksi Terakhir (Ini yang bikin error kemaren, sekarang udah bener!)
    const listContainer = document.getElementById('dash-recent');
    if(listContainer) {
        listContainer.innerHTML = '';
        if (data.recent_transactions && data.recent_transactions.length > 0) {
          data.recent_transactions.forEach(trx => {
            listContainer.innerHTML += `
              <div class="flex justify-between items-center pb-3 border-b border-mocha/10">
                <div>
                  <p class="font-semibold text-sm">#${trx.order_id}</p>
                  <p class="text-xs text-matcha font-bold mt-1">Selesai</p>
                </div>
                <p class="font-bold text-mocha text-sm">${formatRupiah(trx.total)}</p>
              </div>
            `;
          });
        } else {
          listContainer.innerHTML = '<p class="text-sm text-latte/50 italic">Belum ada transaksi hari ini.</p>';
        }
    }

    // Render ulang Grafik pakai data asli
    renderChartAsli(data.chart_data);

  } catch(e) {
    console.error("Gagal load data dashboard:", e);
  }
};

fetchDashboard();

// ==========================================
// 2. LOGIKA GRAFIK MINGGUAN (CHART.JS) ASLI
// ==========================================
let myChart = null; // Penampung chart biar gak kencet

const renderChartAsli = (dataMingguan) => {
  const ctx = document.getElementById('revenueChart');
  if (!ctx) return;

  // Kalo chart lama ada, ancurin dulu biar gak error kencet
  if (myChart) myChart.destroy();

  let gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, 'rgba(140, 94, 60, 0.5)'); 
  gradient.addColorStop(1, 'rgba(18, 14, 11, 0)');    

  myChart = new Chart(ctx, {
    type: 'line',
    data: {
      // Data backend SQLite kirim array 0-6 (Min-Sab). Kita ubah urutannya biar grafik mulai dari Senin.
      labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
      datasets: [{
        label: 'Pendapatan Seminggu (Rp)',
        // Kita urutin datanya: [Senin(1), Selasa(2), ... , Sabtu(6), Minggu(0)]
        data: [
          dataMingguan[1], dataMingguan[2], dataMingguan[3], dataMingguan[4], dataMingguan[5], dataMingguan[6], dataMingguan[0]
        ], 
        borderColor: '#8C5E3C', 
        backgroundColor: gradient,
        borderWidth: 3,
        pointBackgroundColor: '#F3E5D8', 
        pointBorderColor: '#8C5E3C',
        pointRadius: 4,
        fill: true,
        tension: 0.4 
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { 
          beginAtZero: true, 
          grid: { color: 'rgba(140, 94, 60, 0.1)' }, 
          ticks: { color: '#F3E5D8', callback: (value) => formatRupiah(value) } 
        },
        x: { grid: { display: false }, ticks: { color: '#F3E5D8' } }
      },
      interaction: { intersect: false, mode: 'index' },
    }
  });
};

// ==========================================
// 3. TOGGLE SIDEBAR 
// ==========================================
const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('toggleSidebar');

if (sidebar && toggleBtn) {
  toggleBtn.addEventListener('click', () => {
    if (sidebar.classList.contains('w-64')) {
      sidebar.classList.remove('w-64');
      sidebar.classList.add('w-0');
      sidebar.style.opacity = '0';
    } else {
      sidebar.classList.remove('w-0');
      sidebar.classList.add('w-64');
      sidebar.style.opacity = '1';
    }
  });
}

// ==========================================
// 4. SIHIR TANGGAL REAL-TIME
// ==========================================
const updateTanggal = () => {
  const dateElement = document.getElementById('current-date');
  if (!dateElement) return;

  const sekarang = new Date();
  // Setting format jadi bahasa Indonesia (Contoh: Rabu, 11 Maret 2026)
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  
  dateElement.innerText = sekarang.toLocaleDateString('id-ID', options);
};

// Langsung panggil pas web dibuka
updateTanggal();

// ==========================================
// 5. MODAL RIWAYAT TRANSAKSI FULL
// ==========================================
const modalRiwayat = document.getElementById('modal-riwayat');
const modalContentRiwayat = document.getElementById('modal-content-riwayat');

const bukaModalRiwayat = async () => {
  // Munculin Modal
  modalRiwayat.classList.remove('hidden');
  setTimeout(() => {
    modalRiwayat.classList.remove('opacity-0');
    modalContentRiwayat.classList.remove('scale-95');
  }, 10);

  const container = document.getElementById('list-semua-riwayat');
  container.innerHTML = '<p class="text-center text-latte/50 mt-10 animate-pulse font-bold">Menarik data dari database...</p>';

  try {
    const response = await fetch('http://localhost:8080/api/orders');
    const orders = await response.json();
    
    container.innerHTML = '';
    
    if (orders.length === 0) {
      container.innerHTML = '<p class="text-center text-latte/50 mt-10">Belum ada riwayat transaksi sama sekali.</p>';
      return;
    }

    orders.forEach(order => {
      // Bikin format tanggal cantik
      const tgl = new Date(order.created_at).toLocaleString('id-ID', {
        dateStyle: 'medium', timeStyle: 'short'
      });
      
      // Susun list barang yang dibeli (Contoh: 2x Kopi, 1x Roti)
      const itemsText = order.items && order.items.length > 0
        ? order.items.map(i => `<span class="text-mocha font-black">${i.qty}x</span> ${i.name}`).join(' • ') 
        : '<span class="italic opacity-50">Tidak ada detail item</span>';

      container.innerHTML += `
        <div class="bg-espresso p-5 rounded-2xl border border-mocha/10 hover:border-mocha/30 transition-colors group relative overflow-hidden">
          <div class="absolute -right-10 -top-10 w-32 h-32 bg-matcha/5 rounded-full blur-3xl group-hover:bg-matcha/10 transition-colors"></div>
          
          <div class="flex justify-between items-start mb-3 border-b border-mocha/10 pb-3 relative z-10">
            <div>
              <h4 class="font-black text-lg text-latte tracking-wide">#${order.order_id}</h4>
              <p class="text-xs text-latte/40 mt-1 flex items-center gap-1">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                ${tgl}
              </p>
            </div>
            <div class="text-right">
              <p class="font-black text-xl text-matcha">${formatRupiah(order.total)}</p>
              <span class="px-2 py-1 bg-matcha/20 text-matcha border border-matcha/30 rounded text-[10px] font-bold mt-2 inline-block tracking-widest">LUNAS</span>
            </div>
          </div>
          
          <div class="relative z-10">
            <p class="text-[11px] text-latte/50 mb-1 font-bold uppercase tracking-wider">Detail Pembelian:</p>
            <p class="text-sm text-latte/80 leading-relaxed">${itemsText}</p>
          </div>
        </div>
      `;
    });
  } catch (error) {
    container.innerHTML = '<p class="text-center text-red-500 mt-10 font-bold">Waduh, gagal nyambung ke Server Backend!</p>';
  }
};

const tutupModalRiwayat = () => {
  modalRiwayat.classList.add('opacity-0');
  modalContentRiwayat.classList.add('scale-95');
  setTimeout(() => modalRiwayat.classList.add('hidden'), 300);
};