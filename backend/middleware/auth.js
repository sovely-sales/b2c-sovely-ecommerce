const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'sovely_b2c_secret_2026';

/**
 * Generate a signed JWT for the given payload.
 * @param {object} payload - { id, email, role }
 * @param {string} expiresIn - e.g. '7d'
 */
function signToken(payload, expiresIn = '7d') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Express middleware — verifies the Bearer token.
 * Attaches decoded payload to req.user.
 * Optional `role` parameter restricts access to a specific role.
 */
function authenticate(role) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (role && decoded.role !== role) {
        return res.status(403).json({ message: 'Forbidden: insufficient role' });
      }
      req.user = decoded;
      next();
    } catch {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  };
}

module.exports = { signToken, authenticate };
