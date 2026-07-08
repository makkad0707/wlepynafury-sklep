// 1. Nasza "Baza Danych" - tablica z produktami
const products = [
    {
        id: 1,
        name: "Kiedyś Passanger princess",
        price: 14.99,
        image: "img/kiedys_passanger.png", // Zmienisz nazwę pliku, jak będziesz miał zdjęcia
        inStock: true
    },
    {
        id: 2,
        name: "QR Code Prank",
        price: 14.99,
        image: "img/qr-prank.png",
        inStock: true
    },
    {
        id: 3,
        name: "Tylko Lewy Pas",
        price: 14.99,
        image: "img/tylkolewy.png",
        inStock: false
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
    productGrid.innerHTML = ''; // Czyścimy grid przed wrzuceniem naklejek

    products.forEach(product => {
        // Tworzymy nowy "klocek" dla każdego produktu
        const card = document.createElement('div');
        // Jeśli inStock to false, dodajemy klasę .out-of-stock, którą napisaliśmy w CSS
        card.className = `product-card ${product.inStock ? '' : 'out-of-stock'}`;

        // Wstrzykujemy strukturę HTML do karty
        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <h3 class="product-title">${product.name}</h3>
            <div class="product-price">${product.price.toFixed(2)} zł</div>
            <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                ${product.inStock ? 'Do koszyka' : 'Wyprzedane'}
            </button>
        `;

        // Wrzucamy gotową kartę do głównego gridu na stronie
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
        chosenPaczkomat = point.name; // point.name zwraca kod paczkomatu
        document.getElementById('selected-paczkomat').textContent = `Wybrano punkt: ${chosenPaczkomat}`;
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