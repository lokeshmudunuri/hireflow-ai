const app = require('./app');
const { connectDB, sequelize } = require('./config/database');
const { User, Job, Candidate, Application } = require('./models');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();
    // Sync models to ensure tables and indexes exist
    await sequelize.sync({ alter: false });
    console.log('Sequelize models synchronized successfully.');

    app.listen(PORT, () => {
      console.log(`HireFlow Backend Server running on http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app;
