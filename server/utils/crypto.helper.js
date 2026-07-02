const crypto = require("crypto");

// 32-byte secret key
const ENCRYPTION_KEY = crypto
  .createHash("sha256")
  .update(process.env.ENCRYPTION_KEY)
  .digest();

const ALGORITHM = "aes-256-cbc";


// Encrypt Text

const encrypt = (text) => {
  if (!text) return "";

  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(
    ALGORITHM,
    ENCRYPTION_KEY,
    iv
  );

  let encrypted = cipher.update(
    text,
    "utf8",
    "hex"
  );

  encrypted += cipher.final("hex");

  return (
    iv.toString("hex") +
    ":" +
    encrypted
  );
};

// Decrypt Text

const decrypt = (encryptedText) => {
  if (!encryptedText) return "";

  const parts = encryptedText.split(":");

  const iv = Buffer.from(parts[0], "hex");

  const encrypted = parts[1];

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    ENCRYPTION_KEY,
    iv
  );

  let decrypted = decipher.update(
    encrypted,
    "hex",
    "utf8"
  );

  decrypted += decipher.final("utf8");

  return decrypted;
};

module.exports = {
  encrypt,
  decrypt,
};