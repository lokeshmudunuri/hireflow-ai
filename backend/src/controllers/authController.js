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

    // Check duplicate email
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A user account with this email address already exists.'
      });
    }

    const validRoles = ['admin', 'recruiter', 'interviewer'];
    const assignedRole = validRoles.includes(role) ? role : 'recruiter';

    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
      phone,
      department
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
        specialization: specialization || 'Full Stack Engineering',
        title: title || 'Senior Software Engineer'
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

    const user = await User.findOne({
      where: { email },
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

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        { model: Recruiter, as: 'recruiterProfile' },
        { model: Interviewer, as: 'interviewerProfile' }
      ]
    });

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
  getMe
};
