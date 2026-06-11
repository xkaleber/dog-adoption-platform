const cors = require('cors');

const corsOptions = {
    origin: 'http://localhost:3000', // Adjust this to your frontend's URL
    methods: ['GET', 'POST', 'DELETE'], // Allowed HTTP methods
    credentials: true, // Allow cookies to be sent with requests
};

module.exports = cors(corsOptions);