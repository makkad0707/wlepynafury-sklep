// --- 1. BAZA PRODUKTÓW ---
const products = [
    { id: 1, name: "Tatuś kupił", price: 14.99, image: "img/144szer x 79wys_tatuskupil.png", inStock: true, bgColor: "#fdfdff", description: "Chwała ojcu i jego pieniądzom", material: "Folia winylowa premium + Laminat UV", size: "14,4 cm x 7,9 cm" },
    { id: 2, name: "Z lewego tylko na stacje - Biała", price: 14.99, image: "img/bialy_99wys_x_124_szer_Z LEWEGO PASA ZJEŻDZAM TYLKO NA STACJE.png", inStock: true, bgColor: "#fdfdff", description: "Niech wiedzą do kogo należy lewy (wersja biała)", material: "Folia winylowa premium + Laminat UV", size: "9,9 cm x 12,4 cm" },
    { id: 3, name: "Z lewego tylko na stacje - Czarna", price: 14.99, image: "img/czarny_99wys x 124 szer_Z LEWEGO PASA ZJEŻDZAM TYLKO NA STACJE.png", inStock: true, bgColor: "#0a0a0a", description: "Niech wiedzą do kogo należy lewy (wersja czarna)", material: "Folia winylowa premium + Laminat UV", size: "9,9 cm x 12,4 cm" },
    { id: 4, name: "Byłam Passanger Princess", price: 14.99, image: "img/BYŁAM PASSANGER PRINCESS 194 x 79.png", inStock: true, bgColor: "#fdfdff", description: "Urodzona pasażerką, zmuszona do bycia kierowcą", material: "Folia winylowa premium + Laminat UV", size: "19,4 cm x 7,9 cm" },
    { id: 5, name: "WYŁUDZONE Z VATU", price: 14.99, image: "img/szer194_wys_79_WYŁUDZONE Z VAT-U.png", inStock: true, bgColor: "#fdfdff", description: "Pochwal się skąd na to miałeś (miejmy nadzieje, że nikt z urzędu nie zobaczy)", material: "Folia winylowa premium + Laminat UV", size: "19,4 cm x 7,9 cm" },
    { id: 6, name: "Zdałam za ósmym, proszę o dystans", price: 14.99, image: "img/za osmym 194 x 79.png", inStock: true, bgColor: "#fdfdff", description: "Kiedy boisz się nie tylko o swoje życie ale też innych", material: "Folia winylowa premium + Laminat UV", size: "19,4 cm x 7,9 cm" }
];

// --- 2. KOSZYK ---
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// --- 3. MAPA INPOST V4 BEZ TOKENU ---
let chosenPaczkomat = null; 

window.easyPackInit = function() {
    if (window.easyPack) window.easyPack.init({});
};
document.addEventListener("DOMContentLoaded", easyPackInit);

window.openInPostMap = function() {
    document.getElementById('inpost-custom-modal').style.display = 'flex';
    
    if (!document.getElementById('map-container').innerHTML) {
        window.easyPack.mapWidget('map-container', function(point) {
            chosenPaczkomat = point.name; 
            const infoDiv = document.getElementById('selected-paczkomat');
            infoDiv.textContent = `✓ Wybrano punkt: ${chosenPaczkomat}`;
            infoDiv.style.display = 'block'; 
            closeInPostMap(); 
        });
    }
};

window.closeInPostMap = function() {
    document.getElementById('inpost-custom-modal').style.display = 'none';
};

// --- 4. RENDEROWANIE PRODUKTÓW (STRONA GŁÓWNA) ---
function renderProducts() {
    const productGrid = document.getElementById('product-grid');
    if (!productGrid) return; 

    productGrid.innerHTML = ''; 

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = `product-card ${product.inStock ? '' : 'out-of-stock'}`;

        card.innerHTML = `
            <a href="produkt.html?id=${product.id}" style="text-decoration: none; color: inherit;">
                <img src="${product.image}" alt="${product.name}" class="product-image" style="background-color: ${product.bgColor || 'rgba(0,0,0,0.5)'};">
                <h3 class="product-title">${product.name}</h3>
            </a>
            <div class="product-price">${product.price.toFixed(2)} zł</div>
            <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                ${product.inStock ? 'Do koszyka' : 'Wyprzedane'}
            </button>
        `;
        productGrid.appendChild(card);
    });
}

// --- 5. RENDEROWANIE POJEDYNCZEGO PRODUKTU ---
function renderSingleProduct() {
    const detailSection = document.getElementById('single-product-section');
    if (!detailSection) return; 

    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    const product = products.find(p => p.id === productId);

    if (!product) {
        detailSection.innerHTML = '<h2 style="text-align:center; margin-top:50px;">Nie znaleziono produktu.</h2>';
        return;
    }

    const imgEl = document.getElementById('detail-image');
    imgEl.src = product.image;
    imgEl.style.backgroundColor = product.bgColor || 'rgba(0,0,0,0.6)'; 

    document.getElementById('detail-title').textContent = product.name;
    document.getElementById('detail-price').textContent = product.price.toFixed(2) + ' zł';
    document.getElementById('detail-desc').textContent = product.description || 'Brak opisu.';
    document.getElementById('detail-material').textContent = product.material || 'Folia winylowa premium + Laminat UV';
    document.getElementById('detail-size').textContent = product.size || 'Wymiar uniwersalny';

    const btn = document.getElementById('detail-add-btn');
    if (product.inStock) {
        btn.onclick = function() { addToCart(product.id); };
    } else {
        btn.textContent = 'WYPRZEDANE';
        btn.style.backgroundColor = '#27272a';
        btn.style.color = '#555';
        btn.disabled = true;
    }
}

// --- 6. LOGIKA DODAWANIA I KOSZYKA ---
window.addToCart = function(productId) {
    const product = products.find(p => p.id === productId);
    if (!product || !product.inStock) return; 

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) existingItem.quantity += 1; 
    else cart.push({ ...product, quantity: 1 }); 

    saveCart();
    updateCartUI();
    toggleCart();
};

function saveCart() { localStorage.setItem('cart', JSON.stringify(cart)); }

function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const countElement = document.getElementById('cart-count');
    if (countElement) countElement.textContent = totalItems;
    renderCartItems(); 
}

window.toggleCart = function() {
    const cartOverlay = document.getElementById('cart-overlay');
    const cartSidebar = document.getElementById('cart-sidebar');
    
    if(cartOverlay && cartSidebar) {
        cartOverlay.classList.toggle('active');
        cartSidebar.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
        if (cartSidebar.classList.contains('active')) renderCartItems();
    }
}

const cartBtn = document.getElementById('cart-btn');
if (cartBtn) cartBtn.addEventListener('click', toggleCart);

function renderCartItems() {
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const openMapBtn = document.getElementById('open-map-btn');
    const selectedPaczkomatDiv = document.getElementById('selected-paczkomat');
    
    if (!cartItemsContainer) return;

    cartItemsContainer.innerHTML = ''; 
    let productsTotal = 0;

    cart.forEach((item, index) => {
        productsTotal += item.price * item.quantity;
        const itemEl = document.createElement('div');
        itemEl.className = 'cart-item';
        itemEl.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.name} (x${item.quantity})</h4>
                <div class="cart-item-price">${(item.price * item.quantity).toFixed(2)} zł</div>
            </div>
            <button class="remove-item" onclick="removeFromCart(${index})">Usuń</button>
        `;
        cartItemsContainer.appendChild(itemEl);
    });

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="color: var(--text-muted); text-align: center;">Koszyk jest pusty.</p>';
        cartTotalPrice.textContent = '0.00';
        return;
    }

    const shippingMethodInput = document.querySelector('input[name="shipping"]:checked');
    let shippingMethod = shippingMethodInput ? shippingMethodInput.value : 'inpost';
    let shippingCost = 0;

    if (shippingMethod === 'inpost') {
        if(openMapBtn) openMapBtn.style.display = 'block';
        if(selectedPaczkomatDiv) selectedPaczkomatDiv.style.display = 'block';
    } else {
        if(openMapBtn) openMapBtn.style.display = 'none';
        if(selectedPaczkomatDiv) selectedPaczkomatDiv.style.display = 'none';
    }

    if (productsTotal < 70) shippingCost = (shippingMethod === 'inpost') ? 15.00 : 20.00;

    const finalTotal = productsTotal + shippingCost;
    if(cartTotalPrice) cartTotalPrice.textContent = finalTotal.toFixed(2);
}

window.removeFromCart = function(index) {
    cart.splice(index, 1); 
    saveCart();            
    updateCartUI();        
}

// --- 7. OBSŁUGA PŁATNOŚCI STRIPE ---
window.goToCheckout = async function() {
    if (cart.length === 0) { alert("Koszyk jest pusty!"); return; }

    const shippingMethod = document.querySelector('input[name="shipping"]:checked').value;
    if (shippingMethod === 'inpost' && !chosenPaczkomat) {
        alert("Proszę wybrać paczkomat na mapie!"); return;
    }

    const checkoutBtn = document.querySelector('.checkout-btn');
    checkoutBtn.textContent = 'Trwa przekierowanie...';
    checkoutBtn.disabled = true;

    try {
        const response = await fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                items: cart,
                shippingType: shippingMethod,       
                paczkomatId: chosenPaczkomat || '' 
            }),
        });

        const data = await response.json();
        if (data.url) window.location.href = data.url; 
        else {
            alert("Błąd serwera. Spróbuj ponownie.");
            checkoutBtn.textContent = 'Kupuję';
            checkoutBtn.disabled = false;
        }
    } catch (error) {
        alert("Błąd połączenia.");
        checkoutBtn.textContent = 'Kupuję';
        checkoutBtn.disabled = false;
    }
}

// --- 8. OBSŁUGA SUKCESU PŁATNOŚCI ---
const urlParamsCheck = new URLSearchParams(window.location.search);
if (urlParamsCheck.get('success') === 'true') {
    localStorage.removeItem('cart');
    alert("Dziękujemy za zamówienie! Płatność przebiegła pomyślnie. Potwierdzenie wysłaliśmy na Twój e-mail.");
    window.history.replaceState(null, '', window.location.pathname);
}
// --- 9. LOGIKA BANERA COOKIES ---
document.addEventListener("DOMContentLoaded", function() {
    // Sprawdzamy, czy użytkownik już zaakceptował ciasteczka
    if (!localStorage.getItem('cookiesAccepted')) {
        // Jeśli nie, pokazujemy baner
        const banner = document.getElementById('cookie-banner');
        if (banner) banner.style.display = 'flex';
    }
});

window.acceptCookies = function() {
    // Zapisujemy zgodę w LocalStorage
    localStorage.setItem('cookiesAccepted', 'true');
    // Chowamy baner
    const banner = document.getElementById('cookie-banner');
    if (banner) banner.style.display = 'none';
};
// Uruchomienie na starcie
renderProducts();
updateCartUI();
renderSingleProduct();