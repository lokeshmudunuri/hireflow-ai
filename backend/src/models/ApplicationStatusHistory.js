const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ApplicationStatusHistory = sequelize.define('ApplicationStatusHistory', {
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
  previousStatus: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  newStatus: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  changedById: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'application_status_history',
  updatedAt: false,
  indexes: [
    { fields: ['application_id'] },
    { fields: ['created_at'] }
  ]
});

module.exports = ApplicationStatusHistory;
