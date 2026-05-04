const roleMiddleware = (...allowedRoles) => {
    return (req, res, next) => {
      try {
        if (!req.user) {
          return res.status(401).json({ message: 'Not authenticated' });
        }
  
        if (!allowedRoles.includes(req.user.role)) {
          return res.status(403).json({ message: 'Access denied' });
        }
  
        next();
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    };
  };
  
  module.exports = roleMiddleware;