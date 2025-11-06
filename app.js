const express = require('express');
const app = express();
const routes = require('./routes/routes');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//test route
// app.get('/', (req, res) => {
//     res.send('API is running...');
// });


// Use routes
app.use('/api', routes);


// Export the configured Express app. The server is started from `server.js` so
// the app can be imported by tests without starting the HTTP listener.
module.exports = app;
