const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CandidateSkill = sequelize.define('CandidateSkill', {
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
  skillId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'skills',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  yearsOfExperience: {
    type: DataTypes.FLOAT,
    defaultValue: 1.0
  },
  proficiencyLevel: {
    type: DataTypes.ENUM('Beginner', 'Intermediate', 'Advanced', 'Expert'),
    defaultValue: 'Intermediate'
  }
}, {
  tableName: 'candidate_skills',
  indexes: [
    { unique: true, fields: ['candidate_id', 'skill_id'] }
  ]
});

module.exports = CandidateSkill;
