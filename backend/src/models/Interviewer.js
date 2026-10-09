const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Interviewer = sequelize.define('Interviewer', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  specialization: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  title: {
    type: DataTypes.STRING(100),
    defaultValue: 'Senior Software Engineer'
  },
  skills: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  maxInterviewsPerWeek: {
    type: DataTypes.INTEGER,
    defaultValue: 5
  }
}, {
  tableName: 'interviewers'
});

module.exports = Interviewer;
