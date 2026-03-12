// ==========================================
// 1. ALAT BANTU (FORMAT & TOAST)
// ==========================================
const formatRupiah = (angka) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
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

// Database Foto Local (Sama kayak di kasir)
const getFotoMenu = (name) => {
  const fotos = {
    'Iced Americano': './img/icedamericano.jpg',
    'Caramel Macchiato': './img/caramelmacchiato.jpg',
    'Matcha Latte': './img/matcha.jpg',
    'Butter Croissant': './img/buttercroissant.jpg',
    'Espresso Shot': './img/espressoshot.jpg',
    'Red Velvet': './img/redvelevet.jpg', 
    'Kopi Susu Gula Aren': './img/palmsugar.jpg'
  };
  return fotos[name] || './img/icedamericano.jpg'; 
};

// ==========================================
// 2. AMBIL DATA DARI GOLANG & RENDER TABEL
// ==========================================
let globalStok = []; // Buat nyimpen data sementara
let idYangLagiDiedit = null; // Penanda rahasia buat mode edit

const fetchStok = async () => {
  try {
    const response = await fetch('http://localhost:8080/api/products');
    globalStok = await response.json();
    renderTabel(globalStok);
  } catch (error) {
    showToast("Server Backend mati Bos!", "error");
  }
};

const renderTabel = (data) => {
  const tbody = document.getElementById('tabel-stok');
  tbody.innerHTML = '';

  data.forEach(item => {
    const kategoriStr = item.category_id === 1 ? 'Coffee' : 'Non-Coffee';
    const kategoriClass = item.category_id === 1 
      ? 'bg-mocha/20 text-mocha border border-mocha/30' 
      : 'bg-latte/10 text-latte/70 border border-latte/20';

    const tr = document.createElement('tr');
    tr.className = 'hover:bg-white/5 transition-colors group';
    tr.innerHTML = `
      <td class="p-5">
        <div class="w-14 h-14 rounded-xl overflow-hidden border border-white/10">
          <img src="${getFotoMenu(item.name)}" class="w-full h-full object-cover group-hover:scale-110 transition-transform">
        </div>
      </td>
      <td class="p-5 font-bold text-base text-latte">${item.name}</td>
      <td class="p-5">
        <span class="px-3 py-1 rounded-full text-xs font-bold ${kategoriClass}">${kategoriStr}</span>
      </td>
      <td class="p-5 font-black text-mocha">${formatRupiah(item.price)}</td>
      <td class="p-5 text-center">
        <div class="flex justify-center gap-2">
          <button onclick="bukaModalEdit(${item.id})" class="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg transition-colors border border-blue-500/20" title="Edit">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
          </button>
          <button onclick="hapusMenu(${item.id})" class="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors border border-red-500/20" title="Hapus">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
};

// ==========================================
// 3. LOGIKA MODAL (TAMBAH & EDIT)
// ==========================================
const modal = document.getElementById('modal-form');
const modalContent = document.getElementById('modal-content');

// Fungsi khusus buat buka Modal versi Tambah Baru
const bukaModal = () => {
  idYangLagiDiedit = null; // Reset penanda edit
  document.querySelector('#modal-content h3').innerText = 'Tambah Menu Baru';
  document.getElementById('input-nama').value = '';
  document.getElementById('input-harga').value = '';
  document.getElementById('input-kategori').value = '1';
  
  tampilkanModalAja();
};

// Fungsi khusus buat buka Modal versi Edit
const bukaModalEdit = (id) => {
  idYangLagiDiedit = id; // Setel penanda edit
  const item = globalStok.find(p => p.id === id); // Cari data lama
  if(!item) return;

  document.querySelector('#modal-content h3').innerText = 'Edit Menu';
  document.getElementById('input-nama').value = item.name;
  document.getElementById('input-harga').value = item.price;
  document.getElementById('input-kategori').value = item.category_id;

  tampilkanModalAja();
};

const tampilkanModalAja = () => {
  modal.classList.remove('hidden');
  setTimeout(() => {
    modal.classList.remove('opacity-0');
    modalContent.classList.remove('scale-95');
  }, 10);
};

const tutupModal = () => {
  modal.classList.add('opacity-0');
  modalContent.classList.add('scale-95');
  setTimeout(() => modal.classList.add('hidden'), 300); 
};

// ==========================================
// 4. LOGIKA CRUD KAWIN SAMA GOLANG
// ==========================================
const simpanMenu = async () => {
  const nama = document.getElementById('input-nama').value;
  const harga = document.getElementById('input-harga').value;
  const kategori = document.getElementById('input-kategori').value;
  
  if(!nama || !harga) {
    showToast("Isi dulu formnya Bos!", "error");
    return;
  }
  
  try {
    // Jalur bercabang: Kalau ada ID berarti PUT (Edit), kalau gak ada berarti POST (Tambah)
    const url = idYangLagiDiedit ? `http://localhost:8080/api/products/${idYangLagiDiedit}` : 'http://localhost:8080/api/products';
    const method = idYangLagiDiedit ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: nama,
        price: parseFloat(harga),
        category_id: parseInt(kategori)
      })
    });

    if(response.ok) {
      showToast(idYangLagiDiedit ? "Menu sukses diupdate!" : "Menu baru sukses mendarat!", "success");
      tutupModal();
      fetchStok(); 
    }
  } catch (error) {
    showToast("Gagal nyambung ke Backend!", "error");
  }
};

const hapusMenu = async (id) => {
  const konfirmasi = confirm("Yakin mau hapus menu ini secara permanen?");
  if(!konfirmasi) return;

  try {
    const response = await fetch(`http://localhost:8080/api/products/${id}`, { method: 'DELETE' });
    if(response.ok) {
      showToast("Menu berhasil dibumihanguskan!", "success");
      fetchStok();
    }
  } catch (error) {
    showToast("Server error, gagal hapus!", "error");
  }
};

// Starter Engine
document.addEventListener('DOMContentLoaded', fetchStok);