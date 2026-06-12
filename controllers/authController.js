const User = require("../models/user");
const jwt = require("jsonwebtoken");

// Error handling function
const handleErrors = (err) => {
  console.log(err.message, err.code);
  let errors = { username: "", password: "" };

  // 1. Duplicate error code (e.g., username taken)
  if (err.code === 11000) {
    errors.username = "Username is already registered";
    return errors;
  }

  // 2. Mongoose Validation errors (Safely parsing path and message)
  if (err.name === "ValidationError") {
    Object.values(err.errors).forEach((errorItem) => {
      // Fallback to path/message directly if properties object is missing
      const path = errorItem.properties ? errorItem.properties.path : errorItem.path;
      const message = errorItem.properties ? errorItem.properties.message : errorItem.message;
      
      if (path === "password" || path === "username") {
        errors[path] = message;
      }
    });
    return errors;
  }

  // 3. Incorrect username or password (Login errors)
  if (err.message === "Incorrect username") {
    errors.username = "That username is not registered";
  }
  if (err.message === "Incorrect password") {
    errors.password = "That password is incorrect";
  }

  return errors;
};

// JWT TOKEN CONFIGURATION
const maxAge = 24 * 60 * 60; // 24 hours in seconds

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: maxAge });
};

// Production Cookie Configurations
const cookieOptions = {
  httpOnly: true,
  maxAge: maxAge * 1000, // Converted to milliseconds
  secure: process.env.NODE_ENV === "production", // HTTPS only in production
  sameSite: "lax" // Prevents CSRF token leakage
};

// --- CONTROLLER ACTIONS ---

module.exports = {
  signup_get: (req, res) => {
    res.render("signup");
  },

  // signup_post: async (req, res) => {
  //   const { username, password } = req.body;
  //   try {
  //     const user = await User.create({ username, password });
  //     const token = createToken(user._id);
      
  //     res.cookie("jwt", token, cookieOptions);
  //     res.status(201).json({ user: user._id }); // Standard practice is to omit the token from raw JSON when using cookies
  //   } catch (err) {
  //     const errors = handleErrors(err);
  //     res.status(400).json({ errors });
  //   }
  // },

  signup_post: async (req, res) => {
    const { username, password } = req.body;
    try {
      const user = await User.create({ username, password });
      const token = createToken(user._id);
      
      res.cookie("jwt", token, cookieOptions);
      // Added 'token' back to the JSON payload to satisfy the test assertions
      res.status(201).json({ user: user._id, token }); 
    } catch (err) {
      const errors = handleErrors(err);
      res.status(400).json({ errors });
    }
  },

  login_get: (req, res) => {
    res.render("login");
  },

  login_post: async (req, res) => {
    const { username, password } = req.body;
    try {
      const user = await User.login(username, password);
      const token = createToken(user._id);
      
      res.cookie("jwt", token, cookieOptions);
      res.status(200).json({ user: user._id, token });
    } catch (err) {
      const errors = handleErrors(err);
      res.status(400).json({ errors });
    }
  },

  logout_post: (req, res) => {
    // Clear cookie by explicitly settings maxAge to 0 
    res.cookie("jwt", "", { ...cookieOptions, maxAge: 0 });
    // Respond with JSON status so the frontend JS fetch can handle the window redirect safely
    res.status(200).json({ logout: true });
  }
};
