// ====================== CONFIG ======================
const PRODUCTS_API = "https://script.google.com/macros/s/AKfycbypksr8TvMRX9TA2Dnxw6EhySvWgZMknrbXOLBx-pQJCn2pAUWv6BNbk0sjH2rqP9DT3g/exec";
const ORDERS_API   = "https://script.google.com/macros/s/AKfycbzeDWzb9MjDeXjwCIqMO-isuHYAOfNHEtRm6jXosJ9Azgx9VnYZ4f4fUi8kBy_hH3W0/exec";
const WHATSAPP_NUMBER = "923707695136";

// Common colour name → hex (for swatches when sheet has names)
const COLOUR_MAP = {
  black: "#1a1a1a",
  white: "#f5f5f5",
  cream: "#f5e6d3",
  beige: "#d4c4a8",
  brown: "#6b4423",
  navy: "#1a2a4a",
  blue: "#3a5a8c",
  grey: "#8a8a8a",
  gray: "#8a8a8a",
  pink: "#e8b4b8",
  rose: "#d4a5a5",
  red: "#c45c5c",
  maroon: "#6b2d2d",
  green: "#4a6b4a",
  olive: "#6b6b3a",
  gold: "#c9a86c",
  purple: "#6b4a6b",
  orange: "#d4894a",
  yellow: "#e8d48a",
  teal: "#3a6b6b"
};

// ====================== GLOBAL ======================
let products = [];
let cart = JSON.parse(localStorage.getItem("haya_cart")) || [];
let toastTimer = null;
let selectedColour = "";

// ====================== MOBILE MENU ======================
function toggleMobileMenu() {
  var nav = document.getElementById("mainNav");
  var btn = document.getElementById("menuToggle");
  if (!nav) return;
  nav.classList.toggle("open");
  if (btn) btn.classList.toggle("active");
}

function navFilter(category) {
  filterProducts(category);
  var nav = document.getElementById("mainNav");
  var btn = document.getElementById("menuToggle");
  if (nav) nav.classList.remove("open");
  if (btn) btn.classList.remove("active");
  var section = document.getElementById("products");
  if (section) section.scrollIntoView({ behavior: "smooth" });
}

// ====================== TOAST ======================
function showToast(msg, withCartBtn) {
  var t = document.getElementById("toastMsg");
  if (!t) {
    t = document.createElement("div");
    t.id = "toastMsg";
    t.className = "toast";
    document.body.appendChild(t);
  }
  if (toastTimer) {
    clearTimeout(toastTimer);
    toastTimer = null;
  }
  var html = '<div class="toast-msg">' + msg + "</div>";
  if (withCartBtn) {
    html +=
      '<div class="toast-actions">' +
      '<button type="button" class="toast-btn" onclick="openCartFromToast()">View Cart</button>' +
      '<button type="button" class="toast-btn secondary" onclick="hideToast()">Close</button>' +
      "</div>";
  }
  t.innerHTML = html;
  t.classList.add("show");
  var duration = withCartBtn ? 4500 : 2500;
  toastTimer = setTimeout(function () {
    hideToast();
  }, duration);
}

function hideToast() {
  var t = document.getElementById("toastMsg");
  if (t) t.classList.remove("show");
  if (toastTimer) {
    clearTimeout(toastTimer);
    toastTimer = null;
  }
}

function openCartFromToast() {
  hideToast();
  var cartEl = document.getElementById("cart");
  var overlay = document.getElementById("overlay");
  if (cartEl && !cartEl.classList.contains("active")) {
    cartEl.classList.add("active");
    if (overlay) overlay.classList.add("active");
  }
}

// ====================== LOAD PRODUCTS ======================
async function loadProducts() {
  const grid = document.getElementById("products-grid");
  if (grid) {
    grid.innerHTML =
      '<p style="text-align:center;grid-column:1/-1;padding:40px;">Loading products...</p>';
  }
  try {
    const res = await fetch(PRODUCTS_API);
    products = await res.json();
    var saved = sessionStorage.getItem("haya_filter");
    if (saved) {
      sessionStorage.removeItem("haya_filter");
      displayProducts(saved);
    } else {
      displayProducts();
    }
  } catch (err) {
    console.error(err);
    if (grid) {
      grid.innerHTML =
        '<p style="text-align:center;grid-column:1/-1;color:red;">Products load nahi ho sake. API check karein.</p>';
    }
  }
}

// ====================== COLOURS HELPER ======================
function parseColours(product) {
  var raw = product.colors || product.colours || product.color || product.colour || "";
  if (Array.isArray(raw)) {
    return raw.map(function (c) { return String(c).trim(); }).filter(Boolean);
  }
  if (typeof raw === "string" && raw.trim()) {
    return raw.split(/[,|/]+/).map(function (c) { return c.trim(); }).filter(Boolean);
  }
  return [];
}

function colourToHex(name) {
  var key = String(name).toLowerCase().trim();
  if (COLOUR_MAP[key]) return COLOUR_MAP[key];
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(key)) return key;
  return "#c9a86c";
}

function selectColour(name, el) {
  selectedColour = name;
  document.querySelectorAll(".colour-swatch").forEach(function (s) {
    s.classList.remove("active");
  });
  if (el) el.classList.add("active");
  var nameEl = document.getElementById("selectedColourName");
  if (nameEl) nameEl.textContent = name;
}

// ====================== DESCRIPTION → BULLETS ======================
function descToBullets(desc, maxPoints) {
  if (!desc || typeof desc !== "string") return "";
  maxPoints = maxPoints || 3;
  var points = desc
    .split(/[\n\r]+|•|–|—|\s[-–]\s/)
    .map(function (s) {
      return s.replace(/^[\s•\-–—*]+/, "").trim();
    })
    .filter(function (s) {
      return s.length > 2;
    });
  if (points.length === 0) {
    var short = desc.trim();
    if (short.length > 90) short = short.slice(0, 87) + "...";
    return '<ul class="card-desc"><li>' + short + "</li></ul>";
  }
  var limited = points.slice(0, maxPoints);
  var html = '<ul class="card-desc">';
  limited.forEach(function (p) {
    var text = p.length > 70 ? p.slice(0, 67) + "..." : p;
    html += "<li>" + text + "</li>";
  });
  if (points.length > maxPoints) {
    html += '<li class="more-dots">...</li>';
  }
  html += "</ul>";
  return html;
}

function descToFullBullets(desc) {
  if (!desc || typeof desc !== "string") return "";
  var points = desc
    .split(/[\n\r]+|•|–|—|\s[-–]\s/)
    .map(function (s) {
      return s.replace(/^[\s•\-–—*]+/, "").trim();
    })
    .filter(function (s) {
      return s.length > 2;
    });
  if (points.length === 0) {
    return '<p class="desc">' + desc + "</p>";
  }
  var html = '<ul class="detail-desc">';
  points.forEach(function (p) {
    html += "<li>" + p + "</li>";
  });
  html += "</ul>";
  return html;
}

// ====================== DISPLAY PRODUCTS ======================
function displayProducts(filter) {
  filter = filter || "all";
  const grid = document.getElementById("products-grid");
  if (!grid) return;

  document.querySelectorAll(".filter-btn").forEach(function (btn) {
    btn.classList.remove("active");
    if (
      btn.textContent.toLowerCase().includes(filter) ||
      (filter === "all" && btn.textContent === "All")
    ) {
      btn.classList.add("active");
    }
  });

  const filtered =
    filter === "all"
      ? products
      : products.filter(function (p) {
          return p.category === filter;
        });

  grid.innerHTML = "";
  if (filtered.length === 0) {
    grid.innerHTML =
      '<p style="text-align:center;grid-column:1/-1;">No products found</p>';
    return;
  }

  filtered.forEach(function (product) {
    const mainImage =
      product.images && product.images[0] ? product.images[0] : "";
    const saleBadge = product.oldPrice
      ? '<div class="sale-badge">Sale</div>'
      : "";
    const oldPriceHtml = product.oldPrice
      ? '<span class="old-price">Rs. ' +
        Number(product.oldPrice).toLocaleString() +
        "</span>"
      : "";
    const bulletsHtml = descToBullets(product.desc, 3);

    grid.innerHTML +=
      '<div class="product-card">' +
      '<a href="product.html?id=' +
      product.id +
      '" style="text-decoration:none;color:inherit;">' +
      '<div class="product-image">' +
      saleBadge +
      '<img src="' +
      mainImage +
      '" alt="' +
      product.name +
      '" loading="lazy">' +
      "</div>" +
      '<div class="product-info">' +
      "<h3>" +
      product.name +
      "</h3>" +
      '<div class="price-box">' +
      '<span class="current-price">Rs. ' +
      Number(product.price).toLocaleString() +
      "</span>" +
      oldPriceHtml +
      "</div>" +
      bulletsHtml +
      "</div>" +
      "</a>" +
      '<div style="padding:0 16px 16px;text-align:center;">' +
      '<button class="add-btn" onclick="event.preventDefault(); addToCart(' +
      product.id +
      ')">Add to Cart</button>' +
      "</div>" +
      "</div>";
  });
}

function filterProducts(category) {
  displayProducts(category);
}

// ====================== PRODUCT DETAIL ======================
async function loadProductPage() {
  const container = document.getElementById("product-detail");
  if (!container) return;

  if (products.length === 0) {
    try {
      const res = await fetch(PRODUCTS_API);
      products = await res.json();
    } catch (e) {
      container.innerHTML =
        '<p style="text-align:center;">Product load nahi ho saka</p>';
      return;
    }
  }

  const id = parseInt(
    new URLSearchParams(window.location.search).get("id"),
    10
  );
  const product = products.find(function (p) {
    return p.id === id;
  });

  if (!product) {
    container.innerHTML =
      '<p style="text-align:center;">Product not found. <a href="index.html">Back to Store</a></p>';
    return;
  }

  document.title = product.name + " | Hijab-e-Haya";

  const productImages =
    product.images && product.images.length ? product.images : [];
  const oldPriceHtml = product.oldPrice
    ? '<span class="old-price" style="font-size:16px;margin-left:10px;">Rs. ' +
      Number(product.oldPrice).toLocaleString() +
      "</span>"
    : "";

  let thumbnails = "";
  productImages.forEach(function (img, index) {
    thumbnails +=
      '<img src="' +
      img +
      '" class="thumb ' +
      (index === 0 ? "active" : "") +
      '" onclick="changeMainImage(\'' +
      img +
      "', this)\" alt=\"thumb\">";
  });

  const descHtml = descToFullBullets(product.desc || "");
  const colours = parseColours(product);
  selectedColour = colours.length ? colours[0] : "";

  let colourHtml = "";
  if (colours.length > 0) {
    colourHtml = '<div class="colour-section"><span class="colour-label">Colour</span><div class="colour-options">';
    colours.forEach(function (c, i) {
      var hex = colourToHex(c);
      var isLight = /white|cream|beige|yellow|pink|rose/i.test(c);
      colourHtml +=
        '<button type="button" class="colour-swatch' +
        (i === 0 ? " active" : "") +
        '" style="background:' +
        hex +
        (isLight ? ";border-color:#ccc" : "") +
        '" title="' +
        c +
        '" onclick="selectColour(\'' +
        c.replace(/'/g, "\\'") +
        "', this)\"></button>";
    });
    colourHtml +=
      '</div><p class="colour-name">Selected: <strong id="selectedColourName">' +
      selectedColour +
      "</strong></p></div>";
  }

  container.innerHTML =
    "<div>" +
    '<a href="index.html" class="back-link">← Back to Collection</a>' +
    '<div class="product-detail-image">' +
    '<img id="main-product-image" src="' +
    (productImages[0] || "") +
    '" alt="' +
    product.name +
    '">' +
    "</div>" +
    '<div class="thumbnails">' +
    thumbnails +
    "</div>" +
    "</div>" +
    '<div class="product-detail-info">' +
    "<h1>" +
    product.name +
    "</h1>" +
    '<div class="price">Rs. ' +
    Number(product.price).toLocaleString() +
    " " +
    oldPriceHtml +
    "</div>" +
    colourHtml +
    descHtml +
    '<button class="add-btn-large" onclick="addToCart(' +
    product.id +
    ')">Add to Cart</button>' +
    "</div>";
}

function changeMainImage(src, el) {
  document.getElementById("main-product-image").src = src;
  document.querySelectorAll(".thumb").forEach(function (t) {
    t.classList.remove("active");
  });
  el.classList.add("active");
}

// ====================== CART ======================
function addToCart(id) {
  const product = products.find(function (p) {
    return p.id === id;
  });
  if (!product) return;

  var colour = selectedColour || "";
  // On listing page, no colour selected — still allow add
  if (document.getElementById("product-detail") && parseColours(product).length > 0 && !colour) {
    showToast("Please select a colour");
    return;
  }

  const existing = cart.find(function (item) {
    return item.id === id && (item.colour || "") === colour;
  });

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push(
      Object.assign({}, product, {
        quantity: 1,
        colour: colour
      })
    );
  }

  saveCart();
  updateCartUI();
  var msg = product.name + " cart mein add ho gaya ✓";
  if (colour) msg = product.name + " (" + colour + ") cart mein add ho gaya ✓";
  showToast(msg, true);
}

function saveCart() {
  localStorage.setItem("haya_cart", JSON.stringify(cart));
}

function updateCartUI() {
  const cartItems = document.getElementById("cart-items");
  const cartCount = document.getElementById("cart-count");
  const totalEl = document.getElementById("total");
  if (!cartItems) return;

  cartItems.innerHTML = "";
  let total = 0;
  let count = 0;

  if (cart.length === 0) {
    cartItems.innerHTML =
      '<p style="text-align:center;color:#999;margin-top:50px;">Your cart is empty</p>';
  }

  cart.forEach(function (item, index) {
    total += item.price * item.quantity;
    count += item.quantity;
    const img = item.images && item.images[0] ? item.images[0] : "";
    var colourLine = item.colour
      ? '<p style="font-size:12px;color:#888;">Colour: ' + item.colour + "</p>"
      : "";

    cartItems.innerHTML +=
      '<div class="cart-item">' +
      '<img src="' +
      img +
      '" alt="' +
      item.name +
      '">' +
      '<div class="cart-item-info">' +
      '<h4 style="font-size:13px;margin-bottom:2px;">' +
      item.name +
      "</h4>" +
      colourLine +
      '<p style="font-size:12px;color:#666;">Rs. ' +
      item.price +
      " × " +
      item.quantity +
      "</p>" +
      "</div>" +
      '<button onclick="removeFromCartAt(' +
      index +
      ')" style="background:none;border:none;font-size:16px;cursor:pointer;">🗑️</button>' +
      "</div>";
  });

  if (cartCount) cartCount.innerText = count;
  if (totalEl) totalEl.innerText = "Rs. " + total.toLocaleString();
}

function removeFromCartAt(index) {
  cart.splice(index, 1);
  saveCart();
  updateCartUI();
}

function removeFromCart(id) {
  cart = cart.filter(function (item) {
    return item.id !== id;
  });
  saveCart();
  updateCartUI();
}

function clearCart() {
  cart = [];
  saveCart();
  updateCartUI();
}

function toggleCart() {
  document.getElementById("cart").classList.toggle("active");
  document.getElementById("overlay").classList.toggle("active");
}

// ====================== ORDER MODAL ======================
function orderOnWhatsApp() {
  if (cart.length === 0) {
    showToast("Your cart is empty");
    return;
  }
  var modal = document.getElementById("orderModal");
  if (!modal) {
    showToast("Order form missing");
    return;
  }
  modal.classList.add("active");
}

function closeOrderModal() {
  var modal = document.getElementById("orderModal");
  if (modal) modal.classList.remove("active");
}

async function submitOrder() {
  var nameEl = document.getElementById("orderName");
  var phoneEl = document.getElementById("orderPhone");
  var cityEl = document.getElementById("orderCity");
  var addressEl = document.getElementById("orderAddress");
  var deliveryEl = document.getElementById("orderDelivery");

  if (!nameEl || !phoneEl || !cityEl || !addressEl || !deliveryEl) {
    showToast("Order form incomplete");
    return;
  }

  var name = nameEl.value.trim();
  var phone = phoneEl.value.trim();
  var city = cityEl.value.trim();
  var address = addressEl.value.trim();
  var delivery = deliveryEl.value;

  if (!name || !phone || !city || !address) {
    showToast("Please fill name, phone, city & address");
    return;
  }
  if (!delivery) {
    showToast("Please select delivery option");
    return;
  }

  var productsText = "";
  cart.forEach(function (item) {
    productsText +=
      item.name +
      (item.colour ? " [" + item.colour + "]" : "") +
      " (Qty: " +
      item.quantity +
      ") - Rs." +
      item.price +
      " | ";
  });

  var total = cart.reduce(function (sum, item) {
    return sum + item.price * item.quantity;
  }, 0);

  var message =
    "Assalam o Alaikum!\n\n" +
    "*Hijab-e-Haya* — New Order\n\n" +
    "*Name:* " +
    name +
    "\n" +
    "*Phone:* " +
    phone +
    "\n" +
    "*City:* " +
    city +
    "\n" +
    "*Address:* " +
    address +
    "\n\n" +
    "*Payment:*\n" +
    "• COD available (products)\n" +
    "• Delivery charges: ADVANCE\n" +
    "• Customer choice: " +
    delivery +
    "\n\n" +
    "*Order:*\n" +
    productsText +
    "\n" +
    "*Products Total: Rs. " +
    total.toLocaleString() +
    "*\n\n" +
    "Please confirm. JazakAllah!";

  var sheetProducts =
    productsText +
    " || City: " +
    city +
    " || Delivery: " +
    delivery +
    " || COD products + Advance delivery";

  var sheetUrl =
    ORDERS_API +
    "?name=" +
    encodeURIComponent(name) +
    "&phone=" +
    encodeURIComponent(phone) +
    "&address=" +
    encodeURIComponent(city + " — " + address) +
    "&products=" +
    encodeURIComponent(sheetProducts) +
    "&total=" +
    encodeURIComponent(total);

  try {
    await fetch(sheetUrl, { mode: "no-cors" });
  } catch (e) {}

  await new Promise(function (r) {
    setTimeout(r, 800);
  });

  closeOrderModal();
  clearCart();
  showToast("Order placed — opening WhatsApp...");

  setTimeout(function () {
    window.location.href =
      "https://wa.me/" +
      WHATSAPP_NUMBER +
      "?text=" +
      encodeURIComponent(message);
  }, 600);
}

document.addEventListener("click", function (e) {
  var modal = document.getElementById("orderModal");
  if (modal && e.target === modal) closeOrderModal();
});

// ====================== INIT ======================
loadProducts();
loadProductPage();
updateCartUI();
