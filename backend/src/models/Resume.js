const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Resume = sequelize.define('Resume', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  candidateId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'candidates',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  fileName: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  mimeType: {
    type: DataTypes.STRING(100),
    defaultValue: 'application/pdf'
  },
  fileUrl: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  parsedText: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'resumes'
});

module.exports = Resume;
