const { User, Recruiter, Interviewer } = require('../models');

const getUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      include: [
        { model: Recruiter, as: 'recruiterProfile' },
        { model: Interviewer, as: 'interviewerProfile' }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      users
    });
  } catch (err) {
    next(err);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, department, phone, title, agency, specialization } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email already exists'
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'recruiter',
      department,
      phone
    });

    if (user.role === 'recruiter') {
      await Recruiter.create({
        userId: user.id,
        agency: agency || 'Talent Acquisition',
        title: title || 'Recruiter'
      });
    } else if (user.role === 'interviewer') {
      await Interviewer.create({
        userId: user.id,
        specialization: specialization || 'General Engineering',
        title: title || 'Engineering Interviewer'
      });
    }

    const fullUser = await User.findByPk(user.id, {
      attributes: { exclude: ['password'] },
      include: [
        { model: Recruiter, as: 'recruiterProfile' },
        { model: Interviewer, as: 'interviewerProfile' }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: fullUser
    });
  } catch (err) {
    next(err);
  }
};

const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User status changed to ${user.isActive ? 'active' : 'inactive'}`,
      user
    });
  } catch (err) {
    next(err);
  }
};

const getInterviewers = async (req, res, next) => {
  try {
    const interviewers = await User.findAll({
      where: { role: 'interviewer', isActive: true },
      attributes: ['id', 'name', 'email', 'department'],
      include: [
        { model: Interviewer, as: 'interviewerProfile' }
      ]
    });

    res.json({
      success: true,
      interviewers
    });
  } catch (err) {
    next(err);
  }
};

const changeUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const validRoles = ['admin', 'recruiter', 'interviewer'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be admin, recruiter, or interviewer'
      });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: `User role changed to ${role}`,
      user
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getUsers,
  createUser,
  toggleUserStatus,
  changeUserRole,
  getInterviewers
};
