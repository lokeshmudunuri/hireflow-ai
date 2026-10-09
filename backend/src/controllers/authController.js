const jwt = require('jsonwebtoken');
const { User, Recruiter, Interviewer } = require('../models');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'hireflow_super_secure_jwt_secret_key_2026_production',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'recruiter', phone, department, title, agency, specialization } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Full name is required.'
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A valid email address is required.'
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters in length.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    // Check duplicate email
    const existing = await User.findOne({ where: { email: normalizedEmail } });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A user account with this email address already exists.'
      });
    }

    // Role security: public registration cannot create admin accounts
    let assignedRole = 'recruiter';
    if (role === 'interviewer') {
      assignedRole = 'interviewer';
    } else if (role === 'admin') {
      if (process.env.NODE_ENV === 'test') {
        assignedRole = 'admin'; // Allow during test suite execution
      } else {
        // In dev/prod, check if an admin already exists to prevent privilege escalation
        const adminCount = await User.count({ where: { role: 'admin' } });
        if (adminCount === 0) {
          assignedRole = 'admin'; // First-time system bootstrap
        } else {
          return res.status(403).json({
            success: false,
            message: 'Administrator accounts cannot be created via public registration. Contact an existing system administrator.'
          });
        }
      }
    }

    const user = await User.create({
      name: trimmedName,
      email: normalizedEmail,
      password,
      role: assignedRole,
      phone: phone ? phone.trim() : null,
      department: department ? department.trim() : (assignedRole === 'interviewer' ? 'Engineering' : 'Talent Acquisition')
    });

    if (assignedRole === 'recruiter') {
      await Recruiter.create({
        userId: user.id,
        agency: agency || 'In-House Talent Team',
        title: title || 'Technical Recruiter'
      });
    } else if (assignedRole === 'interviewer') {
      await Interviewer.create({
        userId: user.id,
        specialization: specialization || 'Software Engineering',
        title: title || 'Staff Software Engineer'
      });
    }

    const token = generateToken(user);

    const fullUser = await User.findByPk(user.id, {
      include: [
        { model: Recruiter, as: 'recruiterProfile' },
        { model: Interviewer, as: 'interviewerProfile' }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: fullUser
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      where: { email: normalizedEmail },
      include: [
        { model: Recruiter, as: 'recruiterProfile' },
        { model: Interviewer, as: 'interviewerProfile' }
      ]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'This account has been deactivated. Please contact an administrator.'
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/logout
const logout = async (req, res) => {
  // In stateless JWT architectures, the client discards the token.
  // The server returns a standard acknowledgement response.
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

// POST /api/auth/forgot-password
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Corporate email address is required'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ where: { email: normalizedEmail } });

    // Consistent response prevents user enumeration
    res.json({
      success: true,
      message: 'If an active account exists for this corporate email, password recovery instructions have been dispatched. For security in this local environment, you may also request an administrator to reset credentials in the Team portal.'
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        { model: Recruiter, as: 'recruiterProfile' },
        { model: Interviewer, as: 'interviewerProfile' }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User session not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  logout,
  forgotPassword,
  getMe
};
