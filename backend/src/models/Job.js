const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Job = sequelize.define('Job', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  department: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  location: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  employmentType: {
    type: DataTypes.ENUM('Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'),
    defaultValue: 'Full-time'
  },
  experienceRequirement: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Required years of experience'
  },
  qualification: {
    type: DataTypes.STRING(150),
    allowNull: false,
    defaultValue: "Bachelor's Degree"
  },
  requiredSkills: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: '[]',
    get() {
      const rawValue = this.getDataValue('requiredSkills');
      if (!rawValue) return [];
      try {
        return typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue;
      } catch (e) {
        return [];
      }
    },
    set(val) {
      this.setDataValue('requiredSkills', JSON.stringify(val || []));
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  salaryRange: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: '$130,000 - $175,000'
  },
  hiringManager: {
    type: DataTypes.STRING(150),
    allowNull: true,
    defaultValue: 'VP of Engineering'
  },
  deadline: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'CLOSED', 'DRAFT'),
    defaultValue: 'ACTIVE'
  },
  createdById: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'jobs',
  indexes: [
    { fields: ['status'] },
    { fields: ['department'] },
    { fields: ['created_by_id'] }
  ]
});

module.exports = Job;
