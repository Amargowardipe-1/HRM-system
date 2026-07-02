const crypto = require("crypto");


// Generate Secure Reset Token

const generateResetToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Hash Reset Token

const hashResetToken = (token) => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};

module.exports = {
  generateResetToken,
  hashResetToken,
};