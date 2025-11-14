const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { stripeWebhooks } = require("./controllers/StripeWebHooks");

const app = express();

// -----------------------------------------------
// 1) Stripe webhook MUST be registered FIRST
// -----------------------------------------------
app.post(
  "/api/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhooks
);

// -----------------------------------------------
// 2) NOW load other middlewares
// -----------------------------------------------
app.use(express.json()); // ← does NOT affect webhook anymore
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);


// -----------------------------------------------
// 3) Normal routes
// -----------------------------------------------
app.get("/", (req, res) => res.send("Backend running!"));

const routes = require("./routes/routes");
app.use("/api", routes);
app.use("/uploads", express.static("uploads"));

// -----------------------------------------------
// 4) Global error handler
// -----------------------------------------------
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({ status: "error", message: err.message });
});

module.exports = app;
