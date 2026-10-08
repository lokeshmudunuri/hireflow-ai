const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Candidate = sequelize.define('Candidate', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  firstName: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  location: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  headline: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  educationLevel: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: "Bachelor's Degree"
  },
  educationInstitution: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  educationMajor: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  educationYear: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  yearsOfExperience: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
  currentCompany: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  currentTitle: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  linkedinUrl: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  githubUrl: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  portfolioUrl: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  summary: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  noticePeriod: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: '30 Days'
  },
  expectedSalary: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: '$130k - $160k'
  },
  projects: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '[]',
    get() {
      const raw = this.getDataValue('projects');
      if (!raw) return [];
      try {
        return typeof raw === 'string' ? JSON.parse(raw) : raw;
      } catch (e) {
        return [];
      }
    },
    set(val) {
      this.setDataValue('projects', JSON.stringify(val || []));
    }
  },
  certifications: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '[]',
    get() {
      const raw = this.getDataValue('certifications');
      if (!raw) return [];
      try {
        return typeof raw === 'string' ? JSON.parse(raw) : raw;
      } catch (e) {
        return [];
      }
    },
    set(val) {
      this.setDataValue('certifications', JSON.stringify(val || []));
    }
  }
}, {
  tableName: 'candidates',
  indexes: [
    { fields: ['email'] },
    { fields: ['years_of_experience'] }
  ]
});

module.exports = Candidate;
