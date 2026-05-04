const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lumiera');
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ DB error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;