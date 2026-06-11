require('dotenv').config(); // Load environment variables from .env file to access JWT_SECRET and other configurations
const express = require('express');
const corsMiddleware = require('./cors'); // Import the configured CORS middleware

const mongoose = require('mongoose');
const { connectToDb } = require('./db'); 

const authRoutes = require('./routes/authRoutes');
const dogRoutes = require('./routes/dogRoutes');

const cookieParser = require('cookie-parser');
const { requireAuth, checkUser } = require('./middlewares/authMiddleware');

// Initialize app
const app = express();

// Middleware
app.use(corsMiddleware); // Use the configured CORS middleware
app.use(express.static('public')); // Serve static files from the 'public' directory
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Middleware to parse cookies

// view engine
app.set('view engine', 'ejs');

// DB Connection & Server Startup
connectToDb((err) => {
  if (err) {
    console.error('Failed to start server due to database error:', err);
    process.exit(1); // Stop the app if DB fails to connect
  }
  
  // ONLY start listening after a successful db connection
  app.listen(3000, () => {
    console.log('App is listening on port 3000');
  });
});

// Routes
app.get(/.*/, checkUser); // Ensure user is checked for all routes, including static files
app.get('/', (req, res) => {res.render('home');});
app.use(authRoutes);
app.use('/dogs', dogRoutes);

module.exports = app; // Export the app for testing purposes
