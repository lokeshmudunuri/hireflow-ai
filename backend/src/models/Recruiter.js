const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Recruiter = sequelize.define('Recruiter', {
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
  agency: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  title: {
    type: DataTypes.STRING(100),
    defaultValue: 'Technical Recruiter'
  }
}, {
  tableName: 'recruiters'
});

module.exports = Recruiter;
