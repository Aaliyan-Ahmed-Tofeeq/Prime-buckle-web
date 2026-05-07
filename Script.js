// ─── PRODUCT DATA ───
const SHEET_URL = 'https://opensheet.elk.sh/1VSfKi0ucrn1-ZpbgBxndEFLQfyJFNA_e2aFFecQ0MfU/Sheet1';
let PRODUCTS = [];
let currentProduct = null;
let selectedSize = '';
let selectedColor = '';
// ─── TOGGLE SEARCH ───
function toggleSearch() {
  const dropdown = document.getElementById('navSearchDropdown');
  const input = document.getElementById('searchInput');
  const isOpen = dropdown.classList.toggle('open');
  if (isOpen) {
    setTimeout(() => input.focus(), 300);
  } else {
    input.value = '';
    renderProducts('all');
  }
}

// Close when clicking outside
// ─── GLOBAL CLICK HANDLER ───
document.addEventListener('click', (e) => {

  // Search dropdown close
  const dropdown = document.getElementById('navSearchDropdown');
  const icon = document.getElementById('navSearchIcon');
  if (dropdown && dropdown.classList.contains('open') &&
      !dropdown.contains(e.target) &&
      !icon.contains(e.target)) {
    toggleSearch();
  }

  // Image zoom toggle
  if (e.target && e.target.id === 'modalMainImg') {
    scale = scale === 1 ? 2.5 : 1;
    applyTransform();
  }

});

async function loadProducts() {
  try {
    const res = await fetch(SHEET_URL);
    const data = await res.json();
    PRODUCTS = data.map(row => ({
      id: row.id,
      name: row.name,
      cat: row.category,
      desc: row.desc,
      images: row.images ? row.images.split(',').map(i => i.trim()) : [],
      specs: {
        Material: row.material,
        Finish: row.finish,
        Width: row.width,
        MOQ: row.moq
      },
      sizes: row.sizes ? row.sizes.split(',').map(s => s.trim()) : [],
      colors: row.colors ? row.colors.split(',').map(c => c.trim()) : []
    }));
    renderProducts();
  } catch (err) {
    document.getElementById('productsGrid').innerHTML =
      '<p style="color:red;grid-column:1/-1;text-align:center;padding:48px 0;">Failed to load products. Check Sheet URL.</p>';
  }
}

// ─── RENDER PRODUCTS ───
function renderProducts(filter = 'all') {
  const grid = document.getElementById('productsGrid');

  const filtered =
    filter === 'all'
      ? PRODUCTS
      : PRODUCTS.filter(p => p.cat === filter);

  if (filtered.length === 0) {
    grid.innerHTML = '<p style="color:var(--text-muted);grid-column:1/-1;text-align:center;padding:48px 0;">No products found.</p>';
    return;
  }

  grid.innerHTML = filtered.map(p => `
    <div class="product-card" onclick="openModal('${p.id}')">
      <div class="product-card-img">
        <div class="product-card-img-inner">
          <img src="${p.images[0] || ''}" alt="${p.name}" loading="lazy">
        </div>
        <div class="product-article-badge">${p.id}</div>
        <div class="product-cat-badge">${p.cat ? p.cat.split(' ')[0] : ''}</div>
      </div>
      <div class="product-card-body">
        <div class="product-card-name">${p.name}</div>
        <div class="product-card-desc">${(p.desc || '').substring(0, 80)}…</div>
        <div class="product-card-footer">
          <div class="product-card-article">${p.id}</div>
          <button class="btn-details" onclick="event.stopPropagation(); openModal('${p.id}')">
            View Details
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}
// ─── SEARCH ───
function searchProducts(query) {
  const grid = document.getElementById('productsGrid');
  document.getElementById('products')
    .scrollIntoView({ behavior: 'smooth', block: 'start' });

  if (!query || query.trim() === '') {
    renderProducts('all');
    return;
  }

  const q = query.toLowerCase().trim();
  const filtered = PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.cat.toLowerCase().includes(q) ||
    p.id.toLowerCase().includes(q) ||
    (p.desc && p.desc.toLowerCase().includes(q)) ||
    (p.specs.Material && p.specs.Material.toLowerCase().includes(q)) ||
    (p.specs.Finish && p.specs.Finish.toLowerCase().includes(q))
  );

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="search-no-results">
        <span>🔍</span>
        No products found for "<strong>${query}</strong>"
        <br><br>
        <button class="btn-primary" onclick="clearSearch()">Clear Search</button>
      </div>`;
    return;
  }

  grid.innerHTML = filtered.map(p => `
    <div class="product-card" onclick="openModal('${p.id}')">
      <div class="product-card-img">
        <div class="product-card-img-inner">
          <img src="${p.images[0] || ''}" alt="${p.name}" loading="lazy">
        </div>
        <div class="product-article-badge">${p.id}</div>
        <div class="product-cat-badge">${p.cat ? p.cat.split(' ')[0] : ''}</div>
      </div>
      <div class="product-card-body">
        <div class="product-card-name">${p.name}</div>
        <div class="product-card-desc">${(p.desc || '').substring(0, 80)}…</div>
        <div class="product-card-footer">
          <div class="product-card-article">${p.id}</div>
          <button class="btn-details" onclick="event.stopPropagation(); openModal('${p.id}')">
            View Details
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function clearSearch() {
  document.getElementById('searchInput').value = '';
  renderProducts('all');
}
// ─── FILTER ───
function filterProducts(cat, btn) {
  renderProducts(cat);
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  document.getElementById('products').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function filterByCategory(cat) {
  document.querySelectorAll('.cat-card').forEach(c => c.classList.remove('active'));
  event.currentTarget.classList.add('active');
  renderProducts(cat);
  document.querySelectorAll('.filter-btn').forEach(b => {
    b.classList.remove('active');
    if ((cat === 'all' && b.textContent.trim() === 'All') || b.textContent.trim() === cat) {
      b.classList.add('active');
    }
  });
  document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
}

// ─── MODAL OPEN ───
function openModal(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;

  currentProduct = p;
  selectedSize = p.sizes[0] || '';
  selectedColor = p.colors[0] || '';

  // Basic info
  document.getElementById('modalCat').textContent = p.cat;
  document.getElementById('modalTitle').textContent = p.name;
  document.getElementById('modalArticle').textContent = 'Article No: ' + p.id;
  document.getElementById('modalArticleBadge').textContent = p.id;
  document.getElementById('modalDesc').textContent = p.desc;

  // Main image
  const imgs = p.images && p.images.length ? p.images : [];
  document.getElementById('modalMainImg').src = imgs[0] || '';

  // Thumbnails
  const thumbsEl = document.getElementById('modalThumbs');
  thumbsEl.innerHTML = imgs.map((src, i) =>
    `<div class="modal-thumb${i === 0 ? ' active' : ''}" onclick="setThumb(this, '${src}')">
      <img src="${src}" alt="View ${i + 1}">
    </div>`
  ).join('');

  // Specs
  const specsEl = document.getElementById('modalSpecs');
  specsEl.innerHTML = `<div class="modal-specs-title">Specifications</div>` +
    Object.entries(p.specs).map(([k, v]) =>
      `<div class="modal-spec">
        <span class="modal-spec-key">${k}</span>
        <span class="modal-spec-val">${v || '-'}</span>
      </div>`
    ).join('');

  // Options
  const optsEl = document.getElementById('modalOptions');
  optsEl.innerHTML = `
    <div class="modal-option-group">
      <div class="modal-option-label">Size</div>
      <div class="modal-option-chips" id="sizeChips">
        ${p.sizes.map((s, i) =>
          `<button class="option-chip${i === 0 ? ' selected' : ''}" onclick="selectSize(this,'${s}')">${s}</button>`
        ).join('')}
      </div>
    </div>
    <div class="modal-option-group">
      <div class="modal-option-label">Color / Finish</div>
      <div class="modal-option-chips" id="colorChips">
        ${p.colors.map((c, i) =>
          `<button class="option-chip${i === 0 ? ' selected' : ''}" onclick="selectColor(this,'${c}')">${c}</button>`
        ).join('')}
      </div>
    </div>
  `;

  updateWaButton();

  // Open modal
  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
// Arrow buttons
document.getElementById('modalPrev').onclick = () => {
  const thumbs = document.querySelectorAll('.modal-thumb');
  let activeIndex = 0;
  thumbs.forEach((t, i) => { if (t.classList.contains('active')) activeIndex = i; });
  const prev = activeIndex - 1 >= 0 ? activeIndex - 1 : thumbs.length - 1;
  thumbs[prev].click();
};

document.getElementById('modalNext').onclick = () => {
  const thumbs = document.querySelectorAll('.modal-thumb');
  let activeIndex = 0;
  thumbs.forEach((t, i) => { if (t.classList.contains('active')) activeIndex = i; });
  const next = activeIndex + 1 < thumbs.length ? activeIndex + 1 : 0;
  thumbs[next].click();
};
// ─── THUMBNAIL CLICK ───
function setThumb(el, src) {
  resetZoom();
  document.getElementById('modalMainImg').src = src;
  document.querySelectorAll('.modal-thumb').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
}

// ─── SIZE & COLOR SELECT ───
function selectSize(el, val) {
  selectedSize = val;
  document.querySelectorAll('#sizeChips .option-chip').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  updateWaButton();
}

function selectColor(el, val) {
  selectedColor = val;
  document.querySelectorAll('#colorChips .option-chip').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  updateWaButton();
}

// ─── WHATSAPP BUTTON ───
function updateWaButton() {
  if (!currentProduct) return;
  const p = currentProduct;
  const link = `https://primebuckle.com/product/${p.id}`;
  const msg = `Hello, I want to inquire about this product:\n\nArticle No: ${p.id}\nProduct Name: ${p.name}\nCategory: ${p.cat}\nSelected Size: ${selectedSize}\nSelected Color: ${selectedColor}\nProduct Link: ${link}\n\nPlease share price and details.`;
  const waUrl = `https://wa.me/923454105434?text=${encodeURIComponent(msg)}`;
  document.getElementById('modalWaBtn').onclick = () => window.open(waUrl, '_blank');
}


// ─── CONTACT WHATSAPP ───
function submitContactWhatsApp() {
  const inputs = document.querySelectorAll('.contact-form .form-input');
  const name = inputs[0]?.value || '';
  const email = inputs[1]?.value || '';
  const company = inputs[2]?.value || '';
  const message = document.querySelector('.contact-form .form-textarea')?.value || '';
  const msg = `Hello Prime Buckle,\n\nMy name is ${name || '(not provided)'}.\nCompany: ${company || '(not provided)'}\nEmail: ${email || '(not provided)'}\n\nMessage:\n${message || '(no message)'}`;
  window.open(`https://wa.me/923454105434?text=${encodeURIComponent(msg)}`, '_blank');
}

// ─── NAV SCROLL ───
window.addEventListener('scroll', () => {
  document.getElementById('nav').classList.toggle('scrolled', window.scrollY > 40);
});

// ─── HAMBURGER ───
function toggleMenu() {
  const menu = document.getElementById('navMobile');
  const burger = document.getElementById('hamburger');
  menu.classList.toggle('open');
  burger.classList.toggle('open');

  // Clear search when closing menu
  if (!menu.classList.contains('open')) {
    const mobileInput = document.getElementById('mobileSearchInput');
    if (mobileInput) mobileInput.value = '';
  }
}
// ─── ESC KEY ───
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModalBtn();
});

// ─── INIT ───
document.getElementById('productsGrid').innerHTML =
  '<p style="color:var(--text-muted);grid-column:1/-1;text-align:center;padding:48px 0;">Loading products…</p>';

loadProducts();
// ─── ZOOM & PAN ───
let scale = 1;
let posX = 0;
let posY = 0;
let startX = 0;
let startY = 0;
let isDragging = false;
let lastScale = 1;
let initialDistance = 0;

function getModalImg() {
  return document.getElementById('modalMainImg');
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

function resetZoom() {
  scale = 1;
  posX = 0;
  posY = 0;
  applyTransform();
}

function applyTransform() {
  const img = getModalImg();
  if (!img) return;
  if (scale <= 1) { posX = 0; posY = 0; }
  const limit = 200 * scale;
  posX = clamp(posX, -limit, limit);
  posY = clamp(posY, -limit, limit);
  img.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
}

// Reset zoom when modal closes
function closeModalBtn() {
  resetZoom(); // ← add here
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
  currentProduct = null;
}

// ─── DESKTOP DRAG ───
document.addEventListener('mousedown', (e) => {
  if (e.target.id !== 'modalMainImg' || scale === 1) return;
  isDragging = true;
  startX = e.clientX - posX;
  startY = e.clientY - posY;
  e.target.style.cursor = 'grabbing';
});

document.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  posX = e.clientX - startX;
  posY = e.clientY - startY;
  applyTransform();
});

document.addEventListener('mouseup', (e) => {
  isDragging = false;
  const img = getModalImg();
  if (img) img.style.cursor = scale > 1 ? 'grab' : 'zoom-in';
});

// ─── MOBILE PINCH & DRAG ───
document.addEventListener('touchstart', (e) => {
  if (!e.target || e.target.id !== 'modalMainImg') return;
  if (e.touches.length === 2) {
    initialDistance = Math.hypot(
      e.touches[1].clientX - e.touches[0].clientX,
      e.touches[1].clientY - e.touches[0].clientY
    );
    lastScale = scale;
  }
  if (e.touches.length === 1 && scale > 1) {
    isDragging = true;
    startX = e.touches[0].clientX - posX;
    startY = e.touches[0].clientY - posY;
  }
}, { passive: true });

document.addEventListener('touchmove', (e) => {
  if (!e.target || e.target.id !== 'modalMainImg') return;
  if (e.touches.length === 2) {
    const newDist = Math.hypot(
      e.touches[1].clientX - e.touches[0].clientX,
      e.touches[1].clientY - e.touches[0].clientY
    );
    scale = clamp(lastScale * (newDist / initialDistance), 1, 4);
    applyTransform();
  }
  if (e.touches.length === 1 && isDragging) {
    posX = e.touches[0].clientX - startX;
    posY = e.touches[0].clientY - startY;
    applyTransform();
  }
}, { passive: true });

document.addEventListener('touchend', () => {
  isDragging = false;
  if (scale <= 1) resetZoom();
});
