const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const RecruiterNote = sequelize.define('RecruiterNote', {
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
  applicationId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'applications',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  authorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'recruiter_notes',
  indexes: [
    { fields: ['candidate_id'] },
    { fields: ['application_id'] },
    { fields: ['author_id'] }
  ]
});

module.exports = RecruiterNote;
