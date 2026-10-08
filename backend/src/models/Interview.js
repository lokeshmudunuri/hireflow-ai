const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Interview = sequelize.define('Interview', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
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
  scheduledDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  scheduledTime: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  interviewType: {
    type: DataTypes.ENUM('Technical', 'HR', 'System Design', 'Cultural', 'Final'),
    defaultValue: 'Technical'
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: 'Virtual Video Call'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'),
    defaultValue: 'SCHEDULED'
  },
  scheduledById: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'interviews',
  indexes: [
    { fields: ['application_id'] },
    { fields: ['interviewer_id'] },
    { fields: ['scheduled_date'] },
    { fields: ['status'] }
  ]
});

module.exports = Interview;
