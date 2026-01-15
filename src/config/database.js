const mongoose = require("mongoose");
const logger = require("../utils/logger");

const connect_db = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI environment variable is not defined");
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      tls: true, //! Explicit TLS (GDPR / EU requirement)
      autoIndex: false, //! Disable automatic index creation for better performance in production
      serverSelectionTimeoutMS: 5000, //! Set server selection timeout to 5 seconds
      socketTimeoutMS: 45000, //! Set socket timeout to 45 seconds
      retryWrites: true, //! Enable retry writes
      w: "majority", //! Ensure write acknowledgment from majority of replica set nodes for durability
      maxPoolSize: 10, //! Prevent connection explosion
      minPoolSize: 1,
    });
    logger.info(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connect_db;
