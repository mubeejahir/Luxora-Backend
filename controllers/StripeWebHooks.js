const Stripe = require("stripe");
const Bookings = require("../models/bookingsModel");

exports.stripeWebhooks = async (req, res) => {
 
  const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }


  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

   

    if (!session.metadata || !session.metadata.bookingId) {
      
      return res.json({ received: true });
    }

    const bookingId = session.metadata.bookingId;

    try {
      const updatedBooking = await Bookings.findByIdAndUpdate(
        bookingId.trim(),
        { isPaid: true, paymentMethod: "Stripe" },
        { new: true }
      );

      

      if (!updatedBooking) {
        console.log("Booking not found with ID:", bookingId);
      }
    } catch (err) {
      console.error("Error updating booking:", err.message);
    }
  }

  else if (event.type === "payment_intent.succeeded") {
    console.log("Payment Intent succeeded (ignored for metadata).");
  }

  else {
    console.log("Unhandled event:", event.type);
  }

  res.json({ received: true });
};
