const express = require("express")
const cors = require('cors')
const app = express()
app.use(cors())

const routes = require("./routes/routes")




app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use((req,res,next) => {
   
    next();
})

app.use("/api", routes)

module.exports = app
