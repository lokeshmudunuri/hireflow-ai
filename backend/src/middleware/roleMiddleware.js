/**
 * Role-Based Access Control (RBAC) Middleware
 * @param  {...string} roles Allowed roles ('admin', 'recruiter', 'interviewer')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required prior to authorization check.'
      });
    }

    // Admin has master access to all recruiter and interviewer routes
    if (req.user.role === 'admin' || roles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access denied. Role "${req.user.role}" does not have permission for this resource. Required: ${roles.join(' or ')}.`
    });
  };
};

module.exports = {
  authorize
};
