let menus = [];
let cart = [];

const formatRupiah = (angka) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
};

const showToast = (message, type = 'success') => {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  
  let bgColor = 'bg-matcha border-matcha/50';
  let svgIcon = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`;
  
  if (type === 'error') {
    bgColor = 'bg-red-500/90 border-red-500/50';
    svgIcon = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`;
  } else if (type === 'warning') {
    bgColor = 'bg-yellow-500/90 border-yellow-500/50';
    svgIcon = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>`;
  }

  toast.className = `flex items-center gap-3 px-5 py-4 text-white rounded-xl shadow-2xl border backdrop-blur-md transform transition-all duration-300 translate-x-full opacity-0 ${bgColor}`;
  toast.innerHTML = `${svgIcon}<span class="font-bold text-sm tracking-wide">${message}</span>`;

  container.appendChild(toast);
  setTimeout(() => toast.classList.remove('translate-x-full', 'opacity-0'), 10);
  setTimeout(() => {
    toast.classList.add('translate-x-full', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};



const fetchMenus = async () => {
  try {
    const response = await fetch('http://localhost:8080/api/products');
    if (!response.ok) throw new Error("Gagal ambil data");
    
    const data = await response.json();
    
    
    menus = data.map(item => ({
      ...item,
      category: item.category_id === 1 ? 'Coffee' : 'Non-Coffee'
    }));

    
    filterMenu('Semua'); 
  } catch (error) {
    console.error("Error:", error);
    showToast("Gagal ambil menu dari server!", "error");
  }
};

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

const filterMenu = (kategori) => {
  const menuGrid = document.getElementById('menu-grid');
  if (!menuGrid) return;
  menuGrid.innerHTML = ''; 

  const menuYangDitampilin = kategori === 'Semua' 
    ? menus 
    : menus.filter(menu => menu.category === kategori);

  menuYangDitampilin.forEach(menu => {
    const btn = document.createElement('button');
    btn.className = 'bg-macchiato border border-mocha/20 rounded-3xl p-5 text-left hover:border-mocha hover:-translate-y-1 transition-all duration-300 group shadow-xl hover:shadow-mocha/10';
    btn.onclick = () => addToCart(menu);
    
    btn.innerHTML = `
      <div class="w-full h-48 bg-espresso rounded-2xl mb-5 overflow-hidden relative border border-white/5">
        <img src="${getFotoMenu(menu.name)}" alt="${menu.name}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60 group-hover:opacity-30 transition-opacity"></div>
      </div>
      <h3 class="font-bold text-base mb-1 truncate text-latte">${menu.name}</h3>
      <p class="text-mocha font-black text-sm tracking-wide">${formatRupiah(menu.price)}</p>
    `;
    menuGrid.appendChild(btn);
  });
};


const addToCart = (menu) => {
  const existingItem = cart.find(item => item.id === menu.id);
  if (existingItem) {
    existingItem.qty += 1; 
  } else {
    cart.push({ ...menu, qty: 1 }); 
  }
  renderCart(); 
};

const removeFromCart = (id) => {
  cart = cart.filter(item => item.id !== id);
  renderCart();
};

const renderCart = () => {
  const cartContainer = document.getElementById('cart-items');
  cartContainer.innerHTML = '';
  
  let subtotal = 0;

  if (cart.length === 0) {
    cartContainer.innerHTML = `<div class="h-full flex flex-col items-center justify-center text-latte/40"><svg class="w-12 h-12 mb-3 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg><p class="text-sm font-medium">Belum ada pesanan</p></div>`;
  } else {
    cart.forEach(item => {
      const itemTotal = item.price * item.qty;
      subtotal += itemTotal;

      cartContainer.innerHTML += `
        <div class="flex justify-between items-center pb-4 border-b border-mocha/10">
          <div>
            <h4 class="font-bold text-sm">${item.name}</h4>
            <p class="text-xs text-latte/50">${item.qty}x @ ${formatRupiah(item.price)}</p>
          </div>
          <div class="text-right">
            <p class="font-bold text-sm text-mocha mb-1">${formatRupiah(itemTotal)}</p>
            <button onclick="removeFromCart(${item.id})" class="text-xs text-red-500 hover:text-red-400 font-bold transition-colors">Hapus</button>
          </div>
        </div>
      `;
    });
  }

  const tax = subtotal * 0.10;
  const total = subtotal + tax;

  document.getElementById('subtotal-text').innerText = formatRupiah(subtotal);
  document.getElementById('tax-text').innerText = formatRupiah(tax);
  document.getElementById('total-text').innerText = formatRupiah(total);
};


const tesBayar = async () => {
  if (cart.length === 0) {
    showToast("Keranjang masih kosong Bos!", "warning");
    return;
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const total = subtotal + (subtotal * 0.10);

  try {
    const response = await fetch('http://localhost:8080/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ total: total, items: cart })
    });

    if (response.ok) {
      showToast("Pembayaran Lunas! Data masuk Dashboard ✅", "success");
      cart = [];
      renderCart();
    } else {
      showToast("Gagal proses pembayaran!", "error");
    }
  } catch (error) {
    showToast("Waduh, gagal nyambung ke Server Backend!", "error");
  }
};


document.addEventListener('DOMContentLoaded', () => {
  fetchMenus();
  
  const btnBayar = document.querySelector('.bg-matcha');
  if(btnBayar) {
    btnBayar.removeAttribute('onclick'); 
    btnBayar.onclick = tesBayar;
  }
});
