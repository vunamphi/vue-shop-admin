const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET;

const createToken = (payload) => {
  return jwt.sign(payload, SECRET, { expiresIn: "1h" });
};

const verifyToken = (token) => {
  return jwt.verify(token, SECRET);
};

module.exports = { createToken, verifyToken };