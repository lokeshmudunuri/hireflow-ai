const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Application = sequelize.define('Application', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  jobId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'jobs',
      key: 'id'
    },
    onDelete: 'CASCADE'
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
  status: {
    type: DataTypes.ENUM(
      'APPLIED',
      'SCREENING',
      'VALIDATED',
      'SHORTLISTED',
      'INTERVIEW_SCHEDULED',
      'INTERVIEW_COMPLETED',
      'SELECTED',
      'REJECTED',
      'HOLD'
    ),
    allowNull: false,
    defaultValue: 'APPLIED'
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  scoreBreakdown: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '{}',
    get() {
      const raw = this.getDataValue('scoreBreakdown');
      if (!raw) return {};
      try {
        return typeof raw === 'string' ? JSON.parse(raw) : raw;
      } catch (e) {
        return {};
      }
    },
    set(val) {
      this.setDataValue('scoreBreakdown', JSON.stringify(val || {}));
    }
  },
  validationChecklist: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: JSON.stringify({
      requiredDetails: false,
      resumeAvailable: false,
      qualificationMet: false,
      experienceMet: false,
      skillsAvailable: false
    }),
    get() {
      const raw = this.getDataValue('validationChecklist');
      if (!raw) return {};
      try {
        return typeof raw === 'string' ? JSON.parse(raw) : raw;
      } catch (e) {
        return {};
      }
    },
    set(val) {
      this.setDataValue('validationChecklist', JSON.stringify(val || {}));
    }
  },
  isValidated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  validatedById: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  validatedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  validationNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  appliedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'applications',
  indexes: [
    { unique: true, fields: ['job_id', 'candidate_id'] },
    { fields: ['status'] },
    { fields: ['score'] },
    { fields: ['applied_at'] }
  ]
});

module.exports = Application;
