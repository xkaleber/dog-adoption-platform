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

  // 2. Mongoose Validation errors (e.g., password too short, empty fields)
  if (err.message.includes("User validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      if (properties.path === "password") {
        errors.password = properties.message;
      } else if (properties.path === "username") {
        errors.username = properties.message;
      } else {
        errors[properties.path] = properties.message;
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

// JWT TOKEN CREATION

//24 hrs in seconds
const maxAge = 24 * 60 * 60;

// Create JWT token
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: maxAge,
  });
};

// Controller function to handle user signup
module.exports.signup_get = (req, res) => {
  res.render("signup");
};

module.exports.signup_post = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.create({ username, password });
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(201).json({ user: user._id, token });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
    console.log(err);
  }
};

// Controller function to handle user login
module.exports.login_get = (req, res) => {
  res.render("login");
};

module.exports.login_post = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.login(username, password);
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(200).json({ user: user._id, token });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
    console.log(err);
  }
};

// Controller function to handle user logout

module.exports.logout_get = (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.redirect("/");
};
