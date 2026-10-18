const products = [
    // Hijabs
    {
        id: 1,
        name: "Soft Chiffon Hijab",
        price: 1299,
        oldPrice: 1599,
        category: "hijab",
        image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=700&q=80",
        desc: "Lightweight breathable chiffon with elegant drape. Perfect for daily wear."
    },
    {
        id: 2,
        name: "Premium Satin Silk Hijab",
        price: 1899,
        oldPrice: 2299,
        category: "hijab",
        image: "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=700&q=80",
        desc: "Luxurious satin silk with beautiful shine and soft feel."
    },
    {
        id: 3,
        name: "Everyday Jersey Hijab",
        price: 899,
        oldPrice: null,
        category: "hijab",
        image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=700&q=80",
        desc: "Stretchable jersey hijab for maximum comfort and all-day wear."
    },
    {
        id: 4,
        name: "Embroidered Luxury Hijab",
        price: 2499,
        oldPrice: 2999,
        category: "hijab",
        image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=700&q=80",
        desc: "Delicate embroidery for special occasions and formal events."
    },

    // Abayas
    {
        id: 5,
        name: "Classic Black Abaya",
        price: 3499,
        oldPrice: 4200,
        category: "abaya",
        image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=700&q=80",
        desc: "Timeless black abaya with clean silhouette and premium fabric."
    },
    {
        id: 6,
        name: "Front Open Abaya - Maroon",
        price: 3999,
        oldPrice: null,
        category: "abaya",
        image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=700&q=80",
        desc: "Elegant front open design with soft flowing fabric."
    },
    {
        id: 7,
        name: "Nidha Abaya - Bottle Green",
        price: 2990,
        oldPrice: 3800,
        category: "abaya",
        image: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=700&q=80",
        desc: "Premium nidha fabric abaya with graceful fall."
    },
    {
        id: 8,
        name: "Turkish Style Abaya",
        price: 5499,
        oldPrice: 6500,
        category: "abaya",
        image: "https://images.unsplash.com/photo-1572804013309-59a95bff53ce?w=700&q=80",
        desc: "Luxury Turkish style abaya with beautiful detailing."
    },

    // Accessories
    {
        id: 9,
        name: "Magnetic Hijab Pins (Set of 6)",
        price: 499,
        oldPrice: 699,
        category: "accessory",
        image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=700&q=80",
        desc: "Strong magnetic pins that hold hijab securely without damage."
    },
    {
        id: 10,
        name: "Undercap - Soft Cotton",
        price: 350,
        oldPrice: null,
        category: "accessory",
        image: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=700&q=80",
        desc: "Breathable cotton undercap for all-day comfort."
    },
    {
        id: 11,
        name: "Hijab Cap with Ties",
        price: 450,
        oldPrice: 550,
        category: "accessory",
        image: "https://images.unsplash.com/photo-1576566588028-4147f3842fbf?w=700&q=80",
        desc: "Adjustable hijab cap with soft ties for perfect fit."
    },
    {
        id: 12,
        name: "Luxury Scarf Ring",
        price: 799,
        oldPrice: null,
        category: "accessory",
        image: "https://images.unsplash.com/photo-1611652022419-a9419f74343a?w=700&q=80",
        desc: "Elegant metal scarf ring to elevate your hijab style."
    }
];

let cart = JSON.parse(localStorage.getItem('noor_cart')) || [];
let currentFilter = 'all';

// Display Products
function displayProducts(filter = 'all') {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    currentFilter = filter;
    grid.innerHTML = '';

    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase().includes(filter) || (filter === 'all' && btn.textContent === 'All')) {
            btn.classList.add('active');
        }
    });

    const filtered = filter === 'all' ? products : products.filter(p => p.category === filter);

    filtered.forEach(product => {
        const saleBadge = product.oldPrice ? `<div class="sale-badge">Sale</div>` : '';
        const oldPriceHtml = product.oldPrice ? `<span class="old-price">Rs. ${product.oldPrice.toLocaleString()}</span>` : '';

        grid.innerHTML += `
            <div class="product-card">
                <a href="product.html?id=${product.id}" style="text-decoration:none;color:inherit;">
                    <div class="product-image">
                        ${saleBadge}
                        <img src="${product.image}" alt="${product.name}" loading="lazy">
                    </div>
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <div class="price-box">
                            <span class="current-price">Rs. ${product.price.toLocaleString()}</span>
                            ${oldPriceHtml}
                        </div>
                    </div>
                </a>
                <div style="padding: 0 18px 18px; text-align:center;">
                    <button class="add-btn" onclick="event.preventDefault(); addToCart(${product.id})">Add to Bag</button>
                </div>
            </div>
        `;
    });
}

function filterProducts(category) {
    displayProducts(category);
}

// Product Detail Page
function loadProductPage() {
    const container = document.getElementById('product-detail');
    if (!container) return;

    const id = parseInt(new URLSearchParams(window.location.search).get('id'));
    const product = products.find(p => p.id === id);

    if (!product) {
        container.innerHTML = `<p style="text-align:center;">Product not found. <a href="index.html">Back to Store</a></p>`;
        return;
    }

    document.title = `${product.name} | Noor`;

    const oldPriceHtml = product.oldPrice ? `<span class="old-price" style="font-size:16px;margin-left:10px;">Rs. ${product.oldPrice.toLocaleString()}</span>` : '';

    container.innerHTML = `
        <div>
            <a href="index.html" class="back-link">← Back to Collection</a>
            <div class="product-detail-image">
                <img src="${product.image}" alt="${product.name}">
            </div>
        </div>
        <div class="product-detail-info">
            <h1>${product.name}</h1>
            <div class="price">
                Rs. ${product.price.toLocaleString()}
                ${oldPriceHtml}
            </div>
            <p class="desc">${product.desc}</p>
            <button class="add-btn-large" onclick="addToCart(${product.id})">Add to Bag</button>
        </div>
    `;
}

// Cart Functions
function addToCart(id) {
    const product = products.find(p => p.id === id);
    const existing = cart.find(item => item.id === id);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart();
    updateCartUI();
    alert(`${product.name} bag mein add ho gaya!`);
}

function saveCart() {
    localStorage.setItem('noor_cart', JSON.stringify(cart));
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

        cartItems.innerHTML += `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
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

function orderOnWhatsApp() {
    if (cart.length === 0) {
        alert("Your bag is empty!");
        return;
    }

    let message = "Assalam o Alaikum!%0A%0A*Noor Store* se order:%0A%0A";
    cart.forEach(item => {
        message += `• ${item.name}%0A  Qty: ${item.quantity} × Rs.${item.price}%0A%0A`;
    });

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    message += `*Total: Rs. ${total.toLocaleString()}*%0A%0AName: %0AAddress: %0APhone: %0A%0APlease confirm. JazakAllah!`;

    const phone = "923707695136"; // ← Apna number yahan change karo
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
}

// Init
displayProducts();
loadProductPage();
updateCartUI();
