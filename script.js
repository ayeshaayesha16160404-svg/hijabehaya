// ====================== CONFIG ======================
// Yahan apni URLs daalo
const PRODUCTS_API = "https://script.google.com/macros/s/AKfycbypksr8TvMRX9TA2Dnxw6EhySvWgZMknrbXOLBx-pQJCn2pAUWv6BNbk0sjH2rqP9DT3g/exec";
const ORDERS_API   = "https://script.google.com/macros/s/AKfycbxYTCOZoPX7TKTlJOC5VJlLMNk7slA1y57XdcZ8hablaSIondnTN4961P7RfCnD40gC/exec";
const WHATSAPP_NUMBER = "923707695136"; // Apna number (92 ke sath)

// ====================== GLOBAL ======================
let products = [];
let cart = JSON.parse(localStorage.getItem('haya_cart')) || [];

// ====================== LOAD PRODUCTS FROM GOOGLE SHEET ======================
async function loadProducts() {
  const grid = document.getElementById('products-grid');
  if (grid) {
    grid.innerHTML = `<p style="text-align:center;grid-column:1/-1;padding:40px;">Loading products...</p>`;
  }

  try {
    const res = await fetch(PRODUCTS_API);
    products = await res.json();
    displayProducts();
  } catch (err) {
    console.error(err);
    if (grid) {
      grid.innerHTML = `<p style="text-align:center;grid-column:1/-1;color:red;">Products load nahi ho sake. API check karein.</p>`;
    }
  }
}

// ====================== DISPLAY PRODUCTS ======================
function displayProducts(filter = 'all') {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  // Active button
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.textContent.toLowerCase().includes(filter) || (filter === 'all' && btn.textContent === 'All')) {
      btn.classList.add('active');
    }
  });

  const filtered = filter === 'all' ? products : products.filter(p => p.category === filter);
  grid.innerHTML = '';

  if (filtered.length === 0) {
    grid.innerHTML = `<p style="text-align:center;grid-column:1/-1;">No products found</p>`;
    return;
  }

  filtered.forEach(product => {
    const mainImage = (product.images && product.images[0]) ? product.images[0] : '';
    const saleBadge = product.oldPrice ? `<div class="sale-badge">Sale</div>` : '';
    const oldPriceHtml = product.oldPrice ? `<span class="old-price">Rs. ${Number(product.oldPrice).toLocaleString()}</span>` : '';

    grid.innerHTML += `
      <div class="product-card">
        <a href="product.html?id=${product.id}" style="text-decoration:none;color:inherit;">
          <div class="product-image">
            ${saleBadge}
            <img src="${mainImage}" alt="${product.name}" loading="lazy">
          </div>
          <div class="product-info">
            <h3>${product.name}</h3>
            <div class="price-box">
              <span class="current-price">Rs. ${Number(product.price).toLocaleString()}</span>
              ${oldPriceHtml}
            </div>
          </div>
        </a>
        <div style="padding:0 18px 18px;text-align:center;">
          <button class="add-btn" onclick="event.preventDefault(); addToCart(${product.id})">Add to Bag</button>
        </div>
      </div>
    `;
  });
}

function filterProducts(category) {
  displayProducts(category);
}

// ====================== PRODUCT DETAIL PAGE ======================
async function loadProductPage() {
  const container = document.getElementById('product-detail');
  if (!container) return;

  // Agar products abhi load nahi hue to pehle load karo
  if (products.length === 0) {
    try {
      const res = await fetch(PRODUCTS_API);
      products = await res.json();
    } catch (e) {
      container.innerHTML = `<p style="text-align:center;">Product load nahi ho saka</p>`;
      return;
    }
  }

  const id = parseInt(new URLSearchParams(window.location.search).get('id'));
  const product = products.find(p => p.id === id);

  if (!product) {
    container.innerHTML = `<p style="text-align:center;">Product not found. <a href="index.html">Back to Store</a></p>`;
    return;
  }

  document.title = `${product.name} | Hijab-e-Haya`;

  const productImages = product.images && product.images.length ? product.images : [];
  const oldPriceHtml = product.oldPrice ? `<span class="old-price" style="font-size:16px;margin-left:10px;">Rs. ${Number(product.oldPrice).toLocaleString()}</span>` : '';

  let thumbnails = '';
  productImages.forEach((img, index) => {
    thumbnails += `
      <img src="${img}" class="thumb ${index === 0 ? 'active' : ''}" 
           onclick="changeMainImage('${img}', this)" alt="thumb">
    `;
  });

  container.innerHTML = `
    <div>
      <a href="index.html" class="back-link">← Back to Collection</a>
      <div class="product-detail-image">
        <img id="main-product-image" src="${productImages[0] || ''}" alt="${product.name}">
      </div>
      <div class="thumbnails">${thumbnails}</div>
    </div>
    <div class="product-detail-info">
      <h1>${product.name}</h1>
      <div class="price">
        Rs. ${Number(product.price).toLocaleString()} ${oldPriceHtml}
      </div>
      <p class="desc">${product.desc || ''}</p>
      <button class="add-btn-large" onclick="addToCart(${product.id})">Add to Bag</button>
    </div>
  `;
}

function changeMainImage(src, el) {
  document.getElementById('main-product-image').src = src;
  document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
}

// ====================== CART ======================
function addToCart(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  saveCart();
  updateCartUI();
  alert(`${product.name} added to bag !`);
}

function saveCart() {
  localStorage.setItem('haya_cart', JSON.stringify(cart));
}

function updateCartUI() {
  const cartItems = document.getElementById('cart-items');
  const cartCount = document.getElementById('cart-count');
  const totalEl = document.getElementById('total');
  if (!cartItems) return;

  cartItems.innerHTML = '';
  let total = 0;
  let count = 0;

  if (cart.length === 0) {
    cartItems.innerHTML = `<p style="text-align:center;color:#999;margin-top:50px;">Your bag is empty</p>`;
  }

  cart.forEach(item => {
    total += item.price * item.quantity;
    count += item.quantity;
    const img = (item.images && item.images[0]) ? item.images[0] : '';

    cartItems.innerHTML += `
      <div class="cart-item">
        <img src="${img}" alt="${item.name}">
        <div class="cart-item-info">
          <h4 style="font-size:14px;margin-bottom:4px;">${item.name}</h4>
          <p style="font-size:13px;color:#666;">Rs. ${item.price} × ${item.quantity}</p>
        </div>
        <button onclick="removeFromCart(${item.id})" style="background:none;border:none;font-size:16px;cursor:pointer;">🗑️</button>
      </div>
    `;
  });

  if (cartCount) cartCount.innerText = count;
  if (totalEl) totalEl.innerText = `Rs. ${total.toLocaleString()}`;
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
  updateCartUI();
}

function clearCart() {
  cart = [];
  saveCart();
  updateCartUI();
}

function toggleCart() {
  document.getElementById('cart').classList.toggle('active');
  document.getElementById('overlay').classList.toggle('active');
}

// ====================== ORDER (Sheet + WhatsApp) ======================


function orderOnWhatsApp() {
  if (cart.length === 0) {
    alert("Your bag is empty!");
    return;
  }

  const name = prompt("Name :");
  if (!name) return;

  const phone = prompt(" Phone Number :");
  if (!phone) return;

  const address = prompt(" Complete Address :");
  if (!address) return;

  let productsText = "";
  cart.forEach(item => {
    productsText += `• ${item.name} (Qty: ${item.quantity}) - Rs.${item.price}\n`;
  });

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const message = `Assalam o Alaikum!
*Hijab-e-Haya* se naya order:

*Name:* ${name}
*Phone:* ${phone}
*Address:* ${address}

*Order:*
${productsText}
*Total: Rs. ${total.toLocaleString()}*

Please confirm. JazakAllah!`;

  // Google Sheet mein save
  try {
    fetch(ORDERS_API, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify({
        name: name,
        phone: phone,
        address: address,
        products: productsText,
        total: total
      })
    });
  } catch (e) {}

  // ========== MOBILE PE SEEDHA WHATSAPP APP ==========
  const number = "923707695136"; // ← Apna number yahan daalo (92 se start)
  const text = encodeURIComponent(message);

  // Yeh mobile pe seedha WhatsApp App kholta hai
  window.location.href = `whatsapp://send?phone=${number}&text=${text}`;

  clearCart();
}

// ====================== INIT ======================
loadProducts();
loadProductPage();
updateCartUI();
