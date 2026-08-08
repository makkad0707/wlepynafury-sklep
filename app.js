// --- 1. BAZA PRODUKTÓW ---
const products = [
    { id: 1, name: "Certified Gruz", category: "klasyka", gallery: ["img/CertifiedGruz.png"], price: 13.99, image: "img/CertifiedGruz.png", inStock: true, bgColor: "#fdfdff", description: "Na upalare", material: "Folia standardowa", size: "17 cm x 3 cm" },
    { id: 2, name: "Zdałam za ósmym, proszę o dystans", category: "girls", gallery: ["img/za osmym 194 x 79.png"], price: 14.99, image: "img/za osmym 194 x 79.png", inStock: true, bgColor: "#fdfdff", description: "Kiedy boisz się nie tylko o swoje życie ale też innych", material: "Folia standardowa", size: "19,4 cm x 7,9 cm" },
    { id: 3, name: "Tatuś kupił", category: "girls", gallery: ["img/144szer x 79wys_tatuskupil.png"], price: 14.99, image: "img/144szer x 79wys_tatuskupil.png", inStock: true, bgColor: "#fdfdff", description: "Chwała ojcu i jego pieniądzom", material: "Folia standardowa", size: "13 cm x 7,5 cm" },
    { id: 4, name: "Byłam Passenger Princess", category: "girls", gallery: ["img/POPRAWIONABYLAMPASSENGER.png"], price: 14.99, image: "img/POPRAWIONABYLAMPASSENGER.png", inStock: true, bgColor: "#fdfdff", description: "Urodzona pasażerką, zmuszona do bycia kierowcą", material: "Folia standardowa", size: "19,4 cm x 7,9 cm" },
    { id: 5, name: "WYŁUDZONE Z VATU", category: "klasyka", gallery: ["img/poprawionewyludzonezvatu.png", "img/pht_wyludzone.jpg"], price: 14.99, image: "img/poprawionewyludzonezvatu.png", inStock: true, bgColor: "#fdfdff", description: "Pochwal się skąd na to miałeś (miejmy nadzieje, że nikt z urzędu nie zobaczy)", material: "Folia standardowa", size: "13,5 cm x 6 cm" },
    { id: 6, name: "Z Lewego tylko na stacje - tło białe", category: "klasyka", gallery: ["img/stacjabialewlasciwe.png"], price: 14.99, image: "img/stacjabialewlasciwe.png", inStock: true, bgColor: "#000000", description: "Wytłumacz wszystkim swoje zachowanie", material: "Folia standardowa", size: "9 cm x 11 cm" },
    { id: 7, name: "Z Lewego tylko na stacje - tło czarne", category: "klasyka", gallery: ["img/POPRAWIONEczarnetloZLEWEGOPASZJEŻDZAMTYLKONASTACJE.png"], price: 14.99, image: "img/POPRAWIONEczarnetloZLEWEGOPASZJEŻDZAMTYLKONASTACJE.png", inStock: true, bgColor: "#fdfdff", description: "Wytłumacz wszystkim swoje zachowanie", material: "Folia standardowa", size: "9 cm x 11 cm" },
    { id: 8, name: "WlepynaFury", category: "klasyka", gallery: ["img/naklejkawlepynafury.png"], price: 8.99, image: "img/naklejkawlepynafury.png", inStock: true, bgColor: "#fdfdff", description: "Pochwal się skąd to masz", material: "Folia standardowa", size: "11 cm x 7,5 cm" },
    { id: 9, name: "Error 404", category: "klasyka", gallery: ["img/404error.png"], price: 10.99, image: "img/404error.png", inStock: true, bgColor: "#fdfdff", description: "Na przypale albo wcale", material: "Folia standardowa", size: "7,5 cm x 7,5 cm" },
    { id: 10, name: "JTCNW - kolorowe", category: "klasyka", gallery: ["img/jtcnw-kolorowe.png"], price: 11.99, image: "img/jtcnw-kolorowe.png", inStock: true, bgColor: "#fdfdff", description: "Nie słuchaj fałszywych proroków", material: "Folia standardowa", size: "10,2 cm x 5,8" },
    { id: 11, name: "JTCNW - białe", category: "klasyka", gallery: ["img/jtcnw-biale.png"], price: 11.99, image: "img/jtcnw-biale.png", inStock: true, bgColor: "#fdfdff", description: "Nie słuchaj fałszywych proroków", material: "Folia standardowa", size: "10,2 cm x 5,8 cm" }
    
];

// --- 2. KOSZYK ---
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// --- 3. MAPA INPOST V4 BEZ TOKENU (PANCERNA WERSJA) ---
let chosenPaczkomat = null; 

window.easyPackInit = function() {
    if (window.easyPack) window.easyPack.init({});
};
document.addEventListener("DOMContentLoaded", easyPackInit);

window.openInPostMap = function() {
    document.getElementById('inpost-custom-modal').style.display = 'flex';
    
    // Używamy setTimeout, aby dać przeglądarce 150ms na fizyczne "namalowanie" czarnego tła. 
    // Dzięki temu mapa Leaflet widzi swoje wymiary i nie generuje białego ekranu.
    setTimeout(() => {
        const mapContainer = document.getElementById('map-container');
        if (mapContainer && !mapContainer.innerHTML) {
            window.easyPack.mapWidget('map-container', function(point) {
                chosenPaczkomat = point.name; 
                const infoDiv = document.getElementById('selected-paczkomat');
                infoDiv.textContent = `✓ Wybrano punkt: ${chosenPaczkomat}`;
                infoDiv.style.display = 'block'; 
                closeInPostMap(); 
            });
        } else {
            // Jeśli mapa już była załadowana, wymuszamy odświeżenie (fix na szare kafelki po zamknięciu i otwarciu)
            window.dispatchEvent(new Event('resize'));
        }
    }, 150);
};

window.closeInPostMap = function() {
    document.getElementById('inpost-custom-modal').style.display = 'none';
};

// --- 4. RENDEROWANIE PRODUKTÓW (STRONA GŁÓWNA) ---
function renderProducts() {
    const gridGirls = document.getElementById('grid-girls');
    const gridKlasyka = document.getElementById('grid-klasyka');

    if (gridGirls) gridGirls.innerHTML = ''; 
    if (gridKlasyka) gridKlasyka.innerHTML = ''; 

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

        // Tu system sprawdza kategorię z bazy i wrzuca do odpowiedniego grida
        if (product.category === 'girls' && gridGirls) {
            gridGirls.appendChild(card);
        } else if (product.category === 'klasyka' && gridKlasyka) {
            gridKlasyka.appendChild(card);
        }
    });
}

// --- 5. RENDEROWANIE POJEDYNCZEGO PRODUKTU ---
let sliderInterval; // Pamięć naszego pokazu slajdów

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
    imgEl.style.backgroundColor = product.bgColor || 'rgba(0,0,0,0.6)'; 

   // --- LOGIKA GALERII ---
    const galleryContainer = document.getElementById('detail-gallery');
    const imagesList = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];
    
    let currentIndex = 0;
    
    // Funkcja podmieniająca główne zdjęcie z flagą początkowego ładowania
    function changeImage(index, isInitialLoad = false) {
        const imgEl = document.getElementById('detail-image');
        
        const updateVisuals = () => {
            currentIndex = index;
            const newSrc = imagesList[currentIndex];
            imgEl.src = newSrc;
            
            // Sprytne kadrowanie: JPG bez marginesów, PNG z marginesami
            if(newSrc.toLowerCase().includes('.jpg') || newSrc.toLowerCase().includes('.jpeg')) {
                imgEl.style.objectFit = 'cover';
                imgEl.style.padding = '0';
            } else {
                imgEl.style.objectFit = 'contain';
                imgEl.style.padding = '30px';
            }
            
            // Podświetlanie odpowiedniej miniaturki
            if(galleryContainer) {
                const thumbs = galleryContainer.querySelectorAll('.thumbnail-img');
                thumbs.forEach((th, idx) => {
                    if(idx === index) th.classList.add('active');
                    else th.classList.remove('active');
                });
            }
        };

        if (isInitialLoad) {
            // Natychmiastowe załadowanie pierwszego zdjęcia (Brak opóźnienia!)
            imgEl.style.opacity = 1;
            updateVisuals();
        } else {
            // Płynna animacja przejścia przy kolejnych kliknięciach
            imgEl.style.opacity = 0;
            setTimeout(() => {
                updateVisuals();
                imgEl.style.opacity = 1;
            }, 300); 
        }
    }

    // Generowanie zoptymalizowanych miniaturek pod spodem
    if (galleryContainer) {
        galleryContainer.innerHTML = ''; 
        if (imagesList.length > 1) { 
            imagesList.forEach((imgSrc, index) => {
                const thumb = document.createElement('img');
                thumb.src = imgSrc;
                thumb.className = 'thumbnail-img';
                
                // Dynamiczne tło dla miniaturki (używa koloru z bazy, by usunąć czerń)
                thumb.style.backgroundColor = product.bgColor || 'rgba(0,0,0,0.6)';
                
                // Inteligentne kadrowanie samej miniaturki
                if(imgSrc.toLowerCase().includes('.jpg') || imgSrc.toLowerCase().includes('.jpeg')) {
                    thumb.style.objectFit = 'cover';
                } else {
                    thumb.style.objectFit = 'contain';
                    thumb.style.padding = '5px';
                }

                thumb.onclick = () => {
                    changeImage(index);
                    clearInterval(sliderInterval); 
                };
                galleryContainer.appendChild(thumb);
            });
        }
    }

    // Ładujemy pierwsze zdjęcie Z FLAGĄ TRUE (natychmiastowo)
    changeImage(0, true);

    // Automatyczne przewijanie co 4 sekundy
    if (imagesList.length > 1) {
        clearInterval(sliderInterval);
        sliderInterval = setInterval(() => {
            let nextIndex = (currentIndex + 1) % imagesList.length;
            changeImage(nextIndex);
        }, 4000); 
    }

    // --- RESZTA TEKSTÓW PRODUKTU ---
    document.getElementById('detail-title').textContent = product.name;
    document.getElementById('detail-price').textContent = product.price.toFixed(2) + ' zł';
    document.getElementById('detail-desc').textContent = product.description || 'Brak opisu.';
    document.getElementById('detail-material').textContent = product.material || 'Folia standardowa';
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

    if (productsTotal < 70) {
        if (shippingMethod === 'inpost') shippingCost = 15.00;
        else if (shippingMethod === 'kurier') shippingCost = 20.00;
        else if (shippingMethod === 'poczta') shippingCost = 8.00;
    }

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

    const noteInput = document.getElementById('seller-note');
    const sellerNote = noteInput ? noteInput.value.trim() : '';
    
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
    if (!localStorage.getItem('cookiesAccepted')) {
        const banner = document.getElementById('cookie-banner');
        if (banner) banner.style.display = 'flex';
    }
});

window.acceptCookies = function() {
    localStorage.setItem('cookiesAccepted', 'true');
    const banner = document.getElementById('cookie-banner');
    if (banner) banner.style.display = 'none';
};

// Uruchomienie na starcie
renderProducts();
updateCartUI();
renderSingleProduct();