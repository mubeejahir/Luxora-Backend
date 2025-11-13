const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { stripeWebhooks } = require("./controllers/StripeWebHooks");

const app = express();

// ========== STRIPE WEBHOOK MUST COME FIRST ==========
app.post(
  "/api/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhooks
);

// ========== THEN NORMAL BODY PARSERS ==========
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========== COOKIES ==========
app.use(cookieParser());

// ========== CORS ==========
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// ========== NORMAL ROUTES ==========
const routes = require("./routes/routes");
app.use("/api", routes);

// ========== ERROR HANDLER ==========
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({ status: "error", message: err.message });
});

module.exports = app;
