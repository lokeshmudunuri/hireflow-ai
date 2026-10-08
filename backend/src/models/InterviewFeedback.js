const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const InterviewFeedback = sequelize.define('InterviewFeedback', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  interviewId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'interviews',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  applicationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'applications',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  interviewerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  technicalSkillsScore: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 10 }
  },
  problemSolvingScore: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 10 }
  },
  communicationScore: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 10 }
  },
  projectKnowledgeScore: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 10 }
  },
  roleFitScore: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 10 }
  },
  overallScore: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  recommendation: {
    type: DataTypes.ENUM('Strong Hire', 'Hire', 'Hold', 'No Hire', 'Strong No Hire', 'Reject'),
    allowNull: false
  },
  comments: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  submittedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'interview_feedbacks',
  indexes: [
    { fields: ['application_id'] },
    { fields: ['interviewer_id'] }
  ]
});

module.exports = InterviewFeedback;
