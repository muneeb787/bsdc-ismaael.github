const stripe = require('stripe')('sk_test_51QOgcwAWI44r05bCmg1tOcbblz7VGA1uI2zEmpD72f3LInenzFAbG3cqFaVaBkOsZ4CDyMAGwb8OkXvbBg4mdGM700QiLRjNOf'); // Stripe secret key
const cors = require('cors');
const bodyParser = require('body-parser');  // Import body-parser
const express = require('express');  // Import express

const app = express();

// Enable body-parser middleware for JSON parsing
app.use(bodyParser.json());  // This will parse the incoming request body as JSON

const endpointSecret = 'whsec_...';  // Replace with your actual Stripe webhook secret

// Webhook endpoint for Stripe events
app.post('/webhook', bodyParser.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];  // Get the signature from the headers
  let event;

  try {
    // Verify the webhook signature to make sure it's from Stripe
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;  // The payment intent object
    console.log('PaymentIntent was successful!', paymentIntent);

    // Call function to send email confirmation (we will set this up in the next step)
    sendEmailConfirmation(paymentIntent);
  }

  res.status(200).send('Event received');
});

// Dummy function to simulate sending an email (we will implement this next)
function sendEmailConfirmation(paymentIntent) {
  console.log('Send email to:', paymentIntent.receipt_email);
  // We will implement email functionality in the next step
}

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
          success_url: 'https://front-end-beta-tawny.vercel.app/success.html',
          cancel_url: 'https://front-end-beta-tawny.vercel.app/cancel.html',
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
