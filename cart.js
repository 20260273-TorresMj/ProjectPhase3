let cart = JSON.parse(localStorage.getItem('wimpyCart')) || [];

function saveCart() {
    localStorage.setItem('wimpyCart', JSON.stringify(cart));
    updateCartUI();
}

function formatPrice(amount) {
    return '₱' + amount.toLocaleString();
}

function updateCartUI() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElem = document.getElementById('cart-count');
    if (cartCountElem) cartCountElem.innerText = count;
    
    const cartItemsDiv = document.getElementById('cartItemsList');
    const totalSpan = document.getElementById('cartTotal');
    if (!cartItemsDiv) return;
    
    let total = 0;
    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<div class="empty-cart"><i class="fas fa-shopping-cart"></i> Your cart is empty. Add some preloved treasures!</div>';
        if (totalSpan) totalSpan.innerText = 'Total: ₱0.00';
        return;
    }
    
    cartItemsDiv.innerHTML = cart.map(item => {
        total += item.price * item.quantity;
        return `
            <div class="cart-item">
                <img src="${item.img}" class="cart-item-img" onerror="this.src='https://placehold.co/70x70/4A7C59/white?text=Item'">
                <div style="flex:1">
                    <strong>${item.name}</strong><br>
                    ${formatPrice(item.price)} x ${item.quantity}
                    <div style="margin-top:8px;">
                        <button class="remove-item" data-id="${item.id}" style="background:#EBE3D8; border:none; padding:4px 12px; border-radius:20px; font-size:0.75rem; cursor:pointer;">
                            <i class="fas fa-trash-alt"></i> Remove
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    if (totalSpan) totalSpan.innerText = `Total: ${formatPrice(total)}`;
    
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(btn.dataset.id);
            cart = cart.filter(i => i.id !== id);
            saveCart();
            showNotification('Item removed from cart');
        });
    });
}

window.addToCart = function(product) {
    const existing = cart.find(i => i.id === product.id);
    if (existing) {
        existing.quantity++;
        showNotification(`${product.name} quantity updated`);
    } else {
        cart.push({ ...product, quantity: 1 });
        showNotification(`♻️ ${product.name} added to cart!`);
    }
    saveCart();
};

function showNotification(msg) {
    let notif = document.createElement('div');
    notif.innerHTML = `<i class="fas fa-shopping-cart"></i> ${msg}`;
    notif.style.position = 'fixed';
    notif.style.bottom = '20px';
    notif.style.left = '20px';
    notif.style.background = '#4A7C59';
    notif.style.color = 'white';
    notif.style.padding = '12px 20px';
    notif.style.borderRadius = '40px';
    notif.style.zIndex = '3000';
    notif.style.fontWeight = '500';
    notif.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 2500);
}

function showShippingModal() {
    const existing = document.getElementById('shippingModal');
    if (existing) existing.remove();
    
    const subtotal = cart.reduce((t, i) => t + (i.price * i.quantity), 0);
    const shipping = 150;
    const total = subtotal + shipping;
    
    const modalHTML = `
        <div id="shippingModal" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:3000; display:flex; align-items:center; justify-content:center;">
            <div style="background:white; max-width:450px; width:90%; border-radius:30px; padding:28px; animation: fadeIn 0.3s ease;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                    <h3 style="color:#1E2320;"><i class="fas fa-truck"></i> Shipping Details</h3>
                    <button id="closeModalBtn" style="background:none; border:none; font-size:1.5rem; cursor:pointer;">&times;</button>
                </div>
                <input type="text" id="shipName" placeholder="Full Name *" style="width:100%; padding:12px; margin:10px 0; border-radius:40px; border:1px solid #EBE3D8;">
                <input type="email" id="shipEmail" placeholder="Email Address *" style="width:100%; padding:12px; margin:10px 0; border-radius:40px; border:1px solid #EBE3D8;">
                <input type="tel" id="shipPhone" placeholder="Phone Number" style="width:100%; padding:12px; margin:10px 0; border-radius:40px; border:1px solid #EBE3D8;">
                <input type="text" id="shipAddress" placeholder="Street Address *" style="width:100%; padding:12px; margin:10px 0; border-radius:40px; border:1px solid #EBE3D8;">
                <div style="display:flex; gap:10px;">
                    <input type="text" id="shipCity" placeholder="City" style="flex:1; padding:12px; margin:10px 0; border-radius:40px; border:1px solid #EBE3D8;">
                    <input type="text" id="shipPostal" placeholder="Postal" style="flex:1; padding:12px; margin:10px 0; border-radius:40px; border:1px solid #EBE3D8;">
                </div>
                <div style="background:#F5EFE6; padding:16px; border-radius:20px; margin:15px 0;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:8px;">Subtotal: <span>${formatPrice(subtotal)}</span></div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:8px;">Shipping: <span>${formatPrice(shipping)}</span></div>
                    <div style="display:flex; justify-content:space-between; font-weight:800; font-size:1.1rem; border-top:1px solid #D6CDBC; padding-top:10px;">Total: <span>${formatPrice(total)}</span></div>
                </div>
                <button id="confirmOrderBtn" style="background:#4A7C59; width:100%; padding:14px; border-radius:40px; color:white; font-weight:700; border:none; cursor:pointer;">
                    <i class="fas fa-check"></i> Place Order
                </button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add animation style
    const style = document.createElement('style');
    style.textContent = `@keyframes fadeIn { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }`;
    document.head.appendChild(style);
    
    document.getElementById('confirmOrderBtn').onclick = () => {
        const name = document.getElementById('shipName').value.trim();
        const email = document.getElementById('shipEmail').value.trim();
        const address = document.getElementById('shipAddress').value.trim();
        
        if (!name || !email || !address) {
            alert("Please fill in all required fields (*)");
            return;
        }
        
        const orderSummary = cart.map(item => `${item.name} x${item.quantity}`).join('\n');
        alert(`🎉 ORDER CONFIRMED!\n\nThank you ${name} for shopping preloved!\n\n━━━━━━━━━━━━━━━━━━━━\n📦 Order Summary:\n${orderSummary}\n\n━━━━━━━━━━━━━━━━━━━━\n💰 Total: ${formatPrice(total)}\n\n━━━━━━━━━━━━━━━━━━━━\n📧 Confirmation sent to: ${email}\n\n♻️ You just saved a piece from landfill!\nThank you for choosing circular fashion.`);
        
        cart = [];
        saveCart();
        document.getElementById('shippingModal').remove();
        
        const cartSidebar = document.getElementById('cartSidebar');
        const overlay = document.getElementById('cartOverlay');
        if (cartSidebar && cartSidebar.classList.contains('active')) {
            cartSidebar.classList.remove('active');
            if (overlay) overlay.classList.remove('active');
        }
    };
    
    document.getElementById('closeModalBtn').onclick = () => {
        document.getElementById('shippingModal').remove();
    };
}

// Cart sidebar controls
document.addEventListener('DOMContentLoaded', () => {
    const cartBtn = document.getElementById('cart-btn');
    const cartSidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    const closeBtn = document.getElementById('closeCartBtn');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    function openCart() { 
        if(cartSidebar && overlay) { 
            cartSidebar.classList.add('active'); 
            overlay.classList.add('active'); 
        } 
    }
    
    function closeCart() { 
        if(cartSidebar && overlay) { 
            cartSidebar.classList.remove('active'); 
            overlay.classList.remove('active'); 
        } 
    }
    
    if(cartBtn) cartBtn.addEventListener('click', openCart);
    if(closeBtn) closeBtn.addEventListener('click', closeCart);
    if(overlay) overlay.addEventListener('click', closeCart);
    
    if(checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if(cart.length === 0) {
                alert('Your cart is empty. Add some preloved pieces first!');
            } else { 
                closeCart();
                setTimeout(() => { showShippingModal(); }, 200);
            }
        });
    }
    
    updateCartUI();
});