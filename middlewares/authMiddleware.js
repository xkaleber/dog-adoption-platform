const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Helper to promisify jwt.verify for cleaner async/await syntax
const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
      if (err) reject(err);
      else resolve(decodedToken);
    });
  });
};

// 1. Enforces authentication for protected routes
const requireAuth = async (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    return res.redirect('/login');
  }

  try {
    const decodedToken = await verifyToken(token);
    const user = await User.findById(decodedToken.id);
    
    if (!user) {
      return res.redirect('/login'); // Token valid, but user deleted from DB
    }

    req.user = user;
    return next();
  } catch (err) {
    return res.redirect('/login'); // Catch JWT expiration or DB errors safely
  }
};

// 2. Checks user status for UI injection (views), never blocks execution
const checkUser = async (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    res.locals.user = null;
    return next();
  }

  try {
    const decodedToken = await verifyToken(token);
    const user = await User.findById(decodedToken.id);
    
    res.locals.user = user || null;
    return next();
  } catch (err) {
    res.locals.user = null;
    return next();
  }
};

module.exports = { requireAuth, checkUser };
