const jwt = require('jsonwebtoken');
const User = require('../models/user');

const requireAuth = async (req, res, next) => {
    // 1. Look for the token inside browser cookies
    const token = req.cookies.jwt;

    if (token) {
        // Use a try/catch or traditional verification
        jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
            if (err) {
                return res.redirect('/login');
            } else {
                try {
                    req.user = await User.findById(decodedToken.id);
                    return next();
                } catch (dbErr) {
                    return res.redirect('/login');
                }
            }
        });
    } else {
        return res.redirect('/login');
    }
};

const checkUser = (req, res, next) => {
    const token = req.cookies.jwt;

    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
            if (err) {
                res.locals.user = null;
                return next();
            } else {
                try {
                    let user = await User.findById(decodedToken.id);
                    res.locals.user = user;
                    return next();
                } catch (dbErr) {
                    res.locals.user = null;
                    return next();
                }
            }
        });
    } else {
        res.locals.user = null;
        return next();
    }
};

module.exports = { requireAuth, checkUser };
