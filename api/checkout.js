const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
    // Zabezpieczenie: Akceptujemy tylko metodę POST
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { items } = req.body; // Pobieramy zawartość koszyka wysłaną z app.js

        // Formatujemy produkty tak, jak wymaga tego Stripe
        const lineItems = items.map(item => ({
            price_data: {
                currency: 'pln',
                product_data: {
                    name: item.name,
                },
                // Stripe wymaga podawania kwot w najmniejszej jednostce waluty (groszach)
                unit_amount: Math.round(item.price * 100), 
            },
            quantity: item.quantity,
        }));

        // Tworzymy nową sesję płatności
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card', 'blik', 'p24'], // Opcje płatności
            line_items: lineItems,
            mode: 'payment',
            // Gdzie odesłać klienta po udanej/anulowanej płatności
            success_url: `${req.headers.origin}/?success=true`,
            cancel_url: `${req.headers.origin}/?canceled=true`,
            // Bardzo ważne: zbieramy adres do wysyłki dla wlepek (ograniczamy do PL)
            shipping_address_collection: {
                allowed_countries: ['PL'], 
            },
        });

        // Odsyłamy wygenerowany link z powrotem do przeglądarki klienta
        res.status(200).json({ url: session.url });

    } catch (error) {
        console.error("Błąd Stripe:", error);
        res.status(500).json({ error: 'Wystąpił błąd przy tworzeniu sesji płatności.' });
    }
}