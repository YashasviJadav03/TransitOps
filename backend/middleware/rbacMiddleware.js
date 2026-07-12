const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // req.user is set by authMiddleware
    if (!req.user || !req.user.role_name) {
      return res.status(403).json({ status: 'error', message: 'Forbidden: No role assigned' });
    }

    if (!allowedRoles.includes(req.user.role_name)) {
      return res.status(403).json({ status: 'error', message: `Forbidden: Access denied for role '${req.user.role_name}'` });
    }

    next();
  };
};

module.exports = authorizeRoles;
