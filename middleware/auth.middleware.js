const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = header.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Invalid token format' });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'lumiera_secret'
    );

    req.user = decoded; // { id, role, salonId }

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized', error: err.message });
  }
};

module.exports = authMiddleware;