// ====================== HIJAB PRODUCTS ======================
const products = [
    {
        id: 1,
        name: "Soft Chiffon Hijab",
        price: 1299,
        image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80"
    },
    {
        id: 2,
        name: "Premium Satin Silk",
        price: 1899,
        image: "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=600&q=80"
    },
    {
        id: 3,
        name: "Everyday Jersey Hijab",
        price: 899,
        image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80"
    },
    {
        id: 4,
        name: "Embroidered Luxury",
        price: 2499,
        image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600&q=80"
    },
    {
        id: 5,
        name: "Floral Print Hijab",
        price: 1499,
        image: "https://images.unsplash.com/photo-1572804013309-59a95bff53ce?w=600&q=80"
    },
    {
        id: 6,
        name: "Classic Black Elegance",
        price: 1599,
        image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80"
    },
    {
        id: 7,
        name: "Soft Cotton Comfort",
        price: 999,
        image: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600&q=80"
    },
    {
        id: 8,
        name: "Golden Thread Hijab",
        price: 2199,
        image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&q=80"
    }
];

// Cart
let cart = JSON.parse(localStorage.getItem('noor_cart')) || [];

// Display Products
function displayProducts() {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = '';

    products.forEach(product => {
        grid.innerHTML += `
            <div class="product-card" data-id="${product.id}">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <div class="price">Rs. ${product.price.toLocaleString()}</div>
                    <button class="add-btn" onclick="addToCart(${product.id})">Add to Bag</button>
                </div>
            </div>
        `;
    });
}

// Add to Cart
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
    
    // Small feedback
    const btn = event.target;
    btn.innerText = "Added ✓";
    setTimeout(() => btn.innerText = "Add to Bag", 1200);
}

function saveCart() {
    localStorage.setItem('noor_cart', JSON.stringify(cart));
}

function updateCartUI() {
    const cartItems = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const totalEl = document.getElementById('total');

    cartItems.innerHTML = '';
    let total = 0;
    let count = 0;

    if (cart.length === 0) {
        cartItems.innerHTML = `<p style="text-align:center;color:#999;margin-top:40px;">Your bag is empty</p>`;
    }

    cart.forEach(item => {
        total += item.price * item.quantity;
        count += item.quantity;

        cartItems.innerHTML += `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>Rs. ${item.price} × ${item.quantity}</p>
                </div>
                <button onclick="removeFromCart(${item.id})" style="background:none;border:none;font-size:18px;cursor:pointer;">🗑️</button>
            </div>
        `;
    });

    cartCount.innerText = count;
    totalEl.innerText = `Rs. ${total.toLocaleString()}`;
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

// WhatsApp Order
function orderOnWhatsApp() {
    if (cart.length === 0) {
        alert("Your bag is empty!");
        return;
    }

    let message = "Assalam o Alaikum!%0A%0AI want to order from *Noor Hijab Store*:%0A%0A";
    
    cart.forEach(item => {
        message += `• ${item.name}%0A  Qty: ${item.quantity} × Rs.${item.price}%0A%0A`;
    });

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    message += `*Total: Rs. ${total.toLocaleString()}*%0A%0A`;
    message += `Name: %0AAddress: %0APhone: %0A%0APlease confirm my order. JazakAllah!`;

    // ←←← Yahan apna WhatsApp number daalo (92 ke sath)
    const phone = "923001234567";
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
}

// Init
displayProducts();
updateCartUI();
