const Stripe = require("stripe");
const Bookings = require("../models/bookingsModel");

exports.stripeWebhooks = async (req, res) => {
     console.log("🔥 Webhook hit!");
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
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Correct event for Stripe Checkout
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const bookingId = session.metadata.bookingId;

    // Mark booking as paid
  const updatedBooking = await Bookings.findByIdAndUpdate(
  bookingId,
  { isPaid: true, paymentMethod: "Stripe" },
  { new: true }
);

console.log("updatedBooking:", updatedBooking);
    console.log("Booking updated:", bookingId);
  } else {
    console.log("Unhandled event:", event.type);
  }

  res.json({ received: true });
};
