const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { items } = req.body;

        const lineItems = items.map(item => ({
            price_data: {
                currency: 'pln',
                product_data: {
                    name: item.name,
                },
                unit_amount: Math.round(item.price * 100), 
            },
            quantity: item.quantity,
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card', 'blik', 'p24'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${req.headers.origin}/?success=true`,
            cancel_url: `${req.headers.origin}/?canceled=true`,
            // Zbieranie adresu
            shipping_address_collection: {
                allowed_countries: ['PL'], 
            },
            // Zbieranie numeru telefonu
            phone_number_collection: {
                enabled: true,
            },
        });

        res.status(200).json({ url: session.url });

    } catch (error) {
        console.error("Błąd Stripe:", error);
        res.status(500).json({ error: 'Wystąpił błąd przy tworzeniu sesji płatności.' });
    }
}