const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

const isTest = process.env.NODE_ENV === 'test';
const dialect = isTest ? 'sqlite' : (process.env.DB_DIALECT || 'mysql');

let sequelize;

if (dialect === 'sqlite') {
  const storagePath = isTest 
    ? ':memory:' 
    : path.resolve(__dirname, '../../', process.env.SQLITE_STORAGE || 'hireflow_dev.sqlite');

  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: storagePath,
    logging: false,
    define: {
      timestamps: true,
      underscored: true
    }
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'hireflow',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      logging: false,
      define: {
        timestamps: true,
        underscored: true
      },
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
}

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`Database connected successfully (${sequelize.getDialect().toUpperCase()})`);
  } catch (error) {
    if (dialect === 'mysql') {
      console.warn(`Could not connect to MySQL: ${error.message}. Falling back to SQLite local database.`);
      const storagePath = path.resolve(__dirname, '../../hireflow_dev.sqlite');
      sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: storagePath,
        logging: false,
        define: {
          timestamps: true,
          underscored: true
        }
      });
      await sequelize.authenticate();
      console.log('Database connected successfully (SQLITE Fallback)');
      return sequelize;
    }
    console.error('Unable to connect to database:', error);
    throw error;
  }
  return sequelize;
};

module.exports = {
  sequelize,
  connectDB
};
