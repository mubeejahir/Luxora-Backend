const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const { stripeWebhooks } = require("./controllers/StripeWebHooks")

const app = express()

app.post("/api/stripe", express.raw({ type: "application/json" }), stripeWebhooks)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(
	cors({
		origin: process.env.ALLOWED_ORIGIN,
		credentials: true,
	})
)

app.get("/", (req, res) => res.send("Backend running!"))

const routes = require("./routes/routes")
app.use("/api", routes)
app.use("/uploads", express.static("uploads"))

app.use((err, req, res, next) => {
	console.error("Error:", err.message)
	res.status(500).json({ status: "error", message: err.message })
})

module.exports = app
