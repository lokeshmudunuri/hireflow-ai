const jwt = require('jsonwebtoken');
const { User, Recruiter, Interviewer } = require('../models');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hireflow_super_secure_jwt_secret_key_2026_production');

    const user = await User.findByPk(decoded.id, {
      include: [
        { model: Recruiter, as: 'recruiterProfile' },
        { model: Interviewer, as: 'interviewerProfile' }
      ]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The token belongs to a user that no longer exists.'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact an administrator.'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.'
    });
  }
};

module.exports = {
  protect
};
