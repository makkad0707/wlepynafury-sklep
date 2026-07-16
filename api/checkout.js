const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { items, shippingType, paczkomatId } = req.body;

        // Obliczanie łącznej kwoty za produkty
        const productsTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Formatowanie naklejek dla Stripe
        const lineItems = items.map(item => ({
            price_data: {
                currency: 'pln',
                product_data: { name: item.name },
                unit_amount: Math.round(item.price * 100), 
            },
            quantity: item.quantity,
        }));

        // Dynamiczne dodawanie kosztów wysyłki (jako osobny produkt na rachunku)
       // Dynamiczne dodawanie kosztów wysyłki i wstrzykiwanie numeru paczkomatu do rachunku
        let shippingCost = 0;
        let shippingName = '';

        if (productsTotal < 70) {
            shippingCost = (shippingType === 'inpost') ? 1500 : 2000;
            // Dodajemy identyfikator paczkomatu bezpośrednio do nazwy, by klient to widział
            shippingName = (shippingType === 'inpost') ? `Wysyłka - Paczkomat InPost (${paczkomatId})` : 'Wysyłka - Kurier';
        } else {
            shippingCost = 0;
            shippingName = (shippingType === 'inpost') ? `Darmowa Wysyłka - Paczkomat (${paczkomatId})` : 'Darmowa Wysyłka - Kurier';
        }
        // Dodajemy koszty logistyki do koszyka Stripe'a
        if (shippingCost > 0) {
            lineItems.push({
                price_data: {
                    currency: 'pln',
                    product_data: { name: shippingName },
                    unit_amount: shippingCost,
                },
                quantity: 1,
            });
        }

        // Dynamiczny komunikat o wysyłce
        let shippingMessage = '';
        if (shippingType === 'inpost') {
            shippingMessage = 'WYSYŁKA PACZKOMATEM: Podany niżej adres domowy to jedynie formalność rozliczeniowa. Twoja paczka zostanie wysłana do wybranego Paczkomatu. Podanie numeru telefonu jest niezbędne do odbioru paczki!';
        } else {
            shippingMessage = 'Wysyłka Kurierem: Zamówienie zostanie wysłane na podany poniżej adres w ciągu max 3 dni roboczych.';
        }

        // Tworzymy sesję płatności
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card', 'blik', 'p24'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${req.headers.origin}/?success=true`,
            cancel_url: `${req.headers.origin}/?canceled=true`,
            shipping_address_collection: {
                allowed_countries: ['PL'], 
            },
            phone_number_collection: {
                enabled: true,
            },
            metadata: {
                'Rodzaj_Dostawy': shippingType === 'inpost' ? 'Paczkomat InPost' : 'Kurier',
                'Paczkomat_ID': paczkomatId || 'Nie dotyczy'
            },
            custom_text: {
                shipping_address: {
                    message: shippingMessage, // Tu wstrzykujemy nasz dynamiczny tekst
                },
            },
        });

        res.status(200).json({ url: session.url });

    } catch (error) {
        console.error("Błąd Stripe:", error);
        res.status(500).json({ error: 'Wystąpił błąd przy tworzeniu sesji płatności.' });
    }
}