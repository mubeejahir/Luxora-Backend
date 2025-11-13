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
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // ==========================
  // ⭐ HANDLE CHECKOUT SESSION
  // ==========================
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    console.log("🔥 Checkout session completed");
    console.log("🔥 Session metadata:", session.metadata);

    if (!session.metadata || !session.metadata.bookingId) {
      console.log("❌ No bookingId found in metadata!");
      return res.json({ received: true });
    }

    const bookingId = session.metadata.bookingId;

    try {
      const updatedBooking = await Bookings.findByIdAndUpdate(
        bookingId.trim(),
        { isPaid: true, paymentMethod: "Stripe" },
        { new: true }
      );

      console.log("🔥 UPDATED BOOKING:", updatedBooking);

      if (!updatedBooking) {
        console.log("❌ Booking not found with ID:", bookingId);
      }
    } catch (err) {
      console.error("❌ Error updating booking:", err.message);
    }
  }

  // ==================================================
  // ⭐ IGNORE payment_intent.succeeded (not used here)
  // ==================================================
  else if (event.type === "payment_intent.succeeded") {
    console.log("⚠️ Payment Intent succeeded (ignored for metadata).");
  }

  // ==========================
  // ⭐ UNHANDLED EVENT
  // ==========================
  else {
    console.log("Unhandled event:", event.type);
  }

  res.json({ received: true });
};
