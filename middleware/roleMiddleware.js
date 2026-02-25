const jwt = require('jsonwebtoken');

function authMiddleware(requiredRole) {
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Invalid or expired token" });
      }

      // decoded.user contains { id, role }
      if (requiredRole && decoded.user.role !== requiredRole) {
        return res.status(403).json({ message: "Access denied: insufficient role" });
      }

      req.user = decoded.user;
      next();
    });
  };
}

module.exports = authMiddleware;
