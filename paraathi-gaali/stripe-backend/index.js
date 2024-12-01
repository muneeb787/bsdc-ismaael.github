const stripe = require('stripe')('sk_test_51QOgcwAWI44r05bCmg1tOcbblz7VGA1uI2zEmpD72f3LInenzFAbG3cqFaVaBkOsZ4CDyMAGwb8OkXvbBg4mdGM700QiLRjNOf'); // Stripe secret key
const cors = require('cors');
const bodyParser = require('body-parser');  // Add body-parser
const nodemailer = require('nodemailer'); // Add nodemailer for sending emails

module.exports = async (req, res) => {
  // Enable CORS with the frontend URL
  const corsOptions = {
    origin: '*', // your frontend deployed URL
    methods: ['GET', 'POST'], // Allow these methods
    allowedHeaders: ['Content-Type'], // Allow these headers
  };

  // Apply CORS to all routes
  cors(corsOptions)(req, res, async () => {
    // Handle the Stripe checkout session creation
    if (req.method === 'POST' && req.url === '/create-checkout-session') {
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
    }
    // Handle the Stripe webhook for payment success
    else if (req.method === 'POST' && req.url === '/webhook') {
      const sig = req.headers['stripe-signature'];
      const endpointSecret = 'whsec_test_key';  // Hardcode your webhook secret key for testing
      const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);

      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;

        // Send email confirmation using nodemailer
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'ismaaelbaig2003@gmail.com', // Your email
            pass: 'loljokes123',   // Your email password (or app-specific password)
          },
        });

        const mailOptions = {
          from: 'ismaaelbaig2003@gmail.com', // Sender address
          to: paymentIntent.receipt_email, // Customer's email
          subject: 'Payment Successful - Order Confirmation',
          text: `Your payment of £${(paymentIntent.amount_received / 100).toFixed(2)} was successful! Thank you for your purchase.`,
        };

        // Send the email
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error('Error sending email:', error);
          } else {
            console.log('Email sent:', info.response);
          }
        });
      }

      res.status(200).json({ received: true });
    } else {
      res.status(405).json({ error: 'Method Not Allowed' });
    }
  });
};
