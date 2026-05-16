const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "sovely_b2c_secret_2026";

function signToken(payload, expiresIn = "7d") {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

function authenticate(role) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (role && decoded.role !== role) {
        return res
          .status(403)
          .json({ message: "Forbidden: insufficient role" });
      }
      req.user = decoded;
      next();
    } catch {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  };
}

module.exports = { signToken, authenticate };
