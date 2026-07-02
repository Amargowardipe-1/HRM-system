const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/**
 * Hash a plain text password using bcrypt.
 * @param {string} password 
 * @returns {Promise<string>}
 */
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

/** 
 * Compare a plain text password with a hashed password.
 * @param {string} password 
 * @param {string} hashedPassword 
 * @returns {Promise<boolean>}
 */
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

/**
 * Generate a JWT token containing a payload.
 * @param {object} payload 
 * @returns {string}
 */
const generateToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET || "mysecretkey4597",
    { expiresIn: "1d" }
  );
};

const verifyJwt = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET || "mysecretkey4597");
};

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyJwt,
};
