const stripe = require('stripe')('sk_test_51QOgcwAWI44r05bCmg1tOcbblz7VGA1uI2zEmpD72f3LInenzFAbG3cqFaVaBkOsZ4CDyMAGwb8OkXvbBg4mdGM700QiLRjNOf'); // Stripe secret key
const cors = require('cors');

module.exports = async (req, res) => {
  // Enable CORS with the frontend URL
  const corsOptions = {
    origin: '*', // your frontend deployed URL
    methods: ['GET', 'POST'], // Allow these methods
    allowedHeaders: ['Content-Type'], // Allow these headers
  };

  // Apply CORS to all routes
  cors(corsOptions)(req, res, async () => {
    if (req.method === 'POST') {
      try {
        const { items } = req.body; // Get items from the frontend cart

        // Map the items to line items for Stripe
        const lineItems = items.map((item) => ({
          price_data: {
            currency: 'gbp',
            product_data: {
              name: item.name,
            },
            unit_amount: Math.round(item.price * 100), // Price in smallest unit (pence for GBP)
          },
          quantity: 1,
        }));

        // Create a new Stripe checkout session
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: lineItems,
          mode: 'payment',
          success_url: 'https://frontend-91xreq181-ismaaels-projects.vercel.app/success.html',
          cancel_url: 'https://frontend-91xreq181-ismaaels-projects.vercel.app/cancel.html',
        });

        // Send the session ID to the frontend
        res.status(200).json({ id: session.id });
      } catch (error) {
        console.error('Error creating checkout session:', error.message);
        res.status(500).json({ error: error.message });
      }
    } else {
      res.status(405).json({ error: 'Method Not Allowed' });
    }
  });
};