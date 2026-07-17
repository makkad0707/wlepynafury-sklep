// 1. Nasza "Baza Danych" - tablica z produktami
const products = [
    {
        id: 1,
        name: "Tatuś kupił",
        price: 14.99,
        image: "img/144szer x 79wys_tatuskupil.png", // Zmienisz nazwę pliku, jak będziesz miał zdjęcia
        inStock: true,
        description: "Chwała ojcu i jego pieniądzom",
        material: "Folia winylowa premium + Laminat UV",
        size: "14,4 cm x 7,9 cm"
    },
    {
        id: 2,
        name: "Z lewego tylko na stacje - Biała",
        price: 14.99,
        image: "img/bialy_99wys_x_124_szer_Z LEWEGO PASA ZJEŻDZAM TYLKO NA STACJE.png",
        inStock: true,
        description: "Niech wiedzą do kogo należy lewy (wersja biała)",
        material: "Folia winylowa premium + Laminat UV",
        size: "9,9 cm x 12,4 cm"
    },
    {
        id: 3,
        name: "Z lewego tylko na stacje - Czarna",
        price: 14.99,
        image: "img/czarny_99wys x 124 szer_Z LEWEGO PASA ZJEŻDZAM TYLKO NA STACJE.png",
        inStock: true,
        description: "Niech wiedzą do kogo należy lewy (wersja czarna)",
        material: "Folia winylowa premium + Laminat UV",
        size: "9,9 cm x 12,4 cm"
    },
    {
        id: 4,
        name: "Byłam Passanger Princess",
        price: 14.99,
        image: "img/BYŁAM PASSANGER PRINCESS 194 x 79.png",
        inStock: true,
        description: "Urodzona pasażerką, zmuszona do bycia kierowcą",
        material: "Folia winylowa premium + Laminat UV",
        size: "19,4 cm x 7,9 cm"
    },
    {
        id: 5,
        name: "WYŁUDZONE Z VATU",
        price: 14.99,
        image: "img/szer194_wys_79_WYŁUDZONE Z VAT-U.png",
        inStock: true,
        description: "Pochwal się skąd na to miałeś (miejmy nadzieje, że nikt z urzędu nie zobaczy)",
        material: "Folia winylowa premium + Laminat UV",
        size: "19,4 cm x 7,9 cm"
    },
    {
        id: 6,
        name: "Zdałam za ósmym, proszę o dystans",
        price: 14.99,
        image: "img/za osmym 194 x 79.png",
        inStock: true,
        description: "Kiedy boisz się nie tylko o swoje życie ale też innych",
        material: "Folia winylowa premium + Laminat UV",
        size: "19,4 cm x 7,9 cm"
    },

];

// 2. Inicjalizacja koszyka z localStorage
// Sprawdza, czy w przeglądarce są już jakieś zapisane zakupy. Jeśli nie, tworzy pustą tablicę.
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// 3. Pobieranie elementów z HTML
const productGrid = document.getElementById('product-grid');
const cartCount = document.getElementById('cart-count');

// 4. Funkcja renderująca produkty na stronie
function renderProducts() {
    const productGrid = document.getElementById('product-grid');
    if (!productGrid) return; // Zabezpieczenie: jeśli nie ma grida (np. jesteśmy na produkt.html), przerwij funkcję.

    productGrid.innerHTML = ''; 

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = `product-card ${product.inStock ? '' : 'out-of-stock'}`;

        card.innerHTML = `
            <a href="produkt.html?id=${product.id}" style="text-decoration: none; color: inherit;">
                <img src="${product.image}" alt="${product.name}" class="product-image">
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
// --- OBSŁUGA SUKCESU PŁATNOŚCI ---
// Sprawdzamy, czy w adresie URL jest parametr ?success=true
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('success') === 'true') {
    // 1. Czyścimy koszyk w pamięci przeglądarki
    localStorage.removeItem('cart');
    // 2. Wyświetlamy powiadomienie
    alert("Dziękujemy za zamówienie! Płatność przebiegła pomyślnie. Potwierdzenie wysłaliśmy na Twój e-mail.");
    // 3. Czyścimy pasek adresu, żeby po odświeżeniu alert nie wyskoczył ponownie
    window.history.replaceState(null, '', window.location.pathname);
}
// Inicjalizacja oficjalnego widgetu InPost
window.easyPackInit = function() {
    window.easyPack.init({});
};
// Odpalamy po załadowaniu strony
document.addEventListener("DOMContentLoaded", easyPackInit);

let chosenPaczkomat = null; // Tu będziemy trzymać kod paczkomatu (np. POZ12A)

// Funkcja otwierająca mapę
window.openInPostMap = function() {
    window.easyPack.modalMap(function(point, modal) {
        chosenPaczkomat = point.name;
        const infoDiv = document.getElementById('selected-paczkomat');
        infoDiv.textContent = `✓ Wybrano punkt: ${chosenPaczkomat}`;
        infoDiv.style.display = 'block'; // Pokazujemy div dopiero po wyborze
        modal.close();
    }, { width: 500, height: 400 });
};
// 5. Logika dodawania do koszyka
window.addToCart = function(productId) {
    const product = products.find(p => p.id === productId);
    
    // Zabezpieczenie na wypadek kliknięcia wyprzedanego produktu
    if (!product || !product.inStock) return; 

    // Sprawdzamy, czy ten wzór naklejki jest już w koszyku
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1; // Jeśli jest, zwiększamy ilość
    } else {
        cart.push({ ...product, quantity: 1 }); // Jeśli nie, dodajemy jako nową pozycję
    }

    saveCart();
    updateCartUI();
    toggleCart();
};

// 6. Zapisywanie koszyka do pamięci przeglądarki (żeby odświeżenie strony go nie zresetowało)
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// 7. Aktualizacja licznika na górze strony (w nawigacji)
function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = totalItems;
    renderCartItems(); // Zawsze aktualizuj widok, bo cena wysyłki mogła się zmienić
}

// 8. Uruchomienie głównych funkcji przy starcie strony
renderProducts();
updateCartUI();
// --- LOGIKA WYSUWANEGO KOSZYKA ---

// Pobieranie nowych elementów HTML
const cartOverlay = document.getElementById('cart-overlay');
const cartSidebar = document.getElementById('cart-sidebar');
const cartItemsContainer = document.getElementById('cart-items-container');
const cartTotalPrice = document.getElementById('cart-total-price');
const cartBtn = document.getElementById('cart-btn');

// Funkcja wysuwania/chowwania koszyka
window.toggleCart = function() {
    cartOverlay.classList.toggle('active');
    cartSidebar.classList.toggle('active');
    
    // Zawsze po otwarciu koszyka, odświeżamy jego widok
    if (cartSidebar.classList.contains('active')) {
        renderCartItems();
    }
}

// Podpięcie kliknięcia w ikonę koszyka w nawigacji
cartBtn.addEventListener('click', toggleCart);

// Funkcja rysująca produkty wewnątrz wysuniętego panelu


function renderCartItems() {
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const openMapBtn = document.getElementById('open-map-btn');
    const selectedPaczkomatDiv = document.getElementById('selected-paczkomat');
    
    cartItemsContainer.innerHTML = ''; 
    let productsTotal = 0;

    // Obliczanie wartości samych produktów
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

    // Logika Wysyłki
    const shippingMethod = document.querySelector('input[name="shipping"]:checked').value;
    let shippingCost = 0;

    // Pokaż/ukryj przycisk mapy w zależności od wyboru
    if (shippingMethod === 'inpost') {
        openMapBtn.style.display = 'block';
        selectedPaczkomatDiv.style.display = 'block';
    } else {
        openMapBtn.style.display = 'none';
        selectedPaczkomatDiv.style.display = 'none';
    }

    // Kalkulacja darmowej dostawy powyżej 70 zł
    if (productsTotal < 70) {
        shippingCost = (shippingMethod === 'inpost') ? 15.00 : 20.00;
    }

    // Wyświetlamy sumę końcową
    const finalTotal = productsTotal + shippingCost;
    cartTotalPrice.textContent = finalTotal.toFixed(2);
}

// Funkcja usuwania konkretnej pozycji z koszyka
window.removeFromCart = function(index) {
    cart.splice(index, 1); // Usuwa 1 element z tablicy na podanym indeksie
    saveCart();            // Zapisuje nowy stan do pamięci przeglądarki
    updateCartUI();        // Odświeża licznik w nawigacji
    renderCartItems();     // Od razu odświeża widok w otwartym koszyku
}

// Funkcja, która odpali się po kliknięciu "Kupuję" (na razie tylko placeholder)
// --- OBSŁUGA PŁATNOŚCI STRIPE ---

window.goToCheckout = async function() {
    if (cart.length === 0) {
        alert("Koszyk jest pusty!");
        return;
    }

    const shippingMethod = document.querySelector('input[name="shipping"]:checked').value;
    
    // Zabezpieczenie, jeśli ktoś kliknął InPost, ale nie wybrał punktu na mapie
    if (shippingMethod === 'inpost' && !chosenPaczkomat) {
        alert("Proszę wybrać paczkomat na mapie!");
        return;
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
                shippingType: shippingMethod,       // Wysyłamy info: inpost czy kurier
                paczkomatId: chosenPaczkomat || '' // Wysyłamy kod paczkomatu (jeśli jest)
            }),
        });

        const data = await response.json();
        if (data.url) {
            window.location.href = data.url; 
        } else {
            alert("Błąd serwera. Spróbuj ponownie.");
            checkoutBtn.textContent = 'Kupuję z obowiązkiem zapłaty';
            checkoutBtn.disabled = false;
        }
    } catch (error) {
        alert("Błąd połączenia.");
        checkoutBtn.textContent = 'Kupuję z obowiązkiem zapłaty';
        checkoutBtn.disabled = false;
    }
}
// --- LOGIKA PODSTRONY PRODUKTU ---
function renderSingleProduct() {
    // Sprawdzamy, czy jesteśmy na podstronie produktu
    const detailSection = document.getElementById('single-product-section');
    if (!detailSection) return; 

    // Pobieramy ID z adresu URL (np. ?id=2)
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    
    // Szukamy produktu w naszej bazie
    const product = products.find(p => p.id === productId);

    if (!product) {
        detailSection.innerHTML = '<h2 style="text-align:center; margin-top:50px;">Nie znaleziono produktu.</h2>';
        return;
    }

    // Wstrzykujemy dane do HTML
    document.getElementById('detail-image').src = product.image;
    document.getElementById('detail-title').textContent = product.name;
    document.getElementById('detail-price').textContent = product.price.toFixed(2) + ' zł';
    document.getElementById('detail-desc').textContent = product.description || 'Brak opisu.';
    document.getElementById('detail-material').textContent = product.material || 'Folia winylowa premium + Laminat UV';
    document.getElementById('detail-size').textContent = product.size || 'Wymiar uniwersalny';

    // Konfiguracja przycisku
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

// Odpalamy funkcję przy ładowaniu skryptu
renderSingleProduct();