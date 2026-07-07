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
    // Zlicza łączną ilość sztuk wszystkich naklejek w koszyku
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
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
    cartItemsContainer.innerHTML = ''; // Czyścimy przed nowym renderowaniem
    let total = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="color: var(--text-muted); text-align: center; margin-top: 20px;">Twój koszyk świeci pustkami. Dorzuć jakąś wlepę!</p>';
    } else {
        cart.forEach((item, index) => {
            total += item.price * item.quantity;
            
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
    }

    // Aktualizacja łącznej kwoty
    cartTotalPrice.textContent = total.toFixed(2);
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

    // Zabezpieczenie: Zmieniamy tekst i blokujemy przycisk na czas ładowania
    const checkoutBtn = document.querySelector('.checkout-btn');
    checkoutBtn.textContent = 'Trwa przekierowanie...';
    checkoutBtn.disabled = true;

    try {
        // Wysyłamy zawartość koszyka do naszej nowej funkcji bezserwerowej
        const response = await fetch('/api/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ items: cart }),
        });

        const data = await response.json();

        // Jeśli backend zwróci link do Stripe Checkout, przekierowujemy klienta
        if (data.url) {
            window.location.href = data.url; 
        } else {
            console.error("Błąd odpowiedzi serwera:", data);
            alert("Serwer napotkał problem. Spróbuj ponownie.");
            resetCheckoutBtn(checkoutBtn);
        }
    } catch (error) {
        console.error("Błąd połączenia:", error);
        alert("Błąd połączenia. Sprawdź swój internet i spróbuj ponownie.");
        resetCheckoutBtn(checkoutBtn);
    }
}

// Funkcja pomocnicza przywracająca przycisk
function resetCheckoutBtn(btn) {
    btn.textContent = 'Kupuję';
    btn.disabled = false;
}