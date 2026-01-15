const mongoose = require("mongoose");
const logger = require("../utils/logger");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      autoIndex: false, //! Better performance in prod
    });
    logger.info(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error("❌ MongoDB connection failed", error);
    process.exit(1); //! Stop app if DB fails
  }
};

module.exports = connectDB;
