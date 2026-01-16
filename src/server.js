const path = require("path");
const dotenv = require("dotenv");

//! Load env file based on NODE_ENV
const env = process.env.NODE_ENV;
dotenv.config({
  path: path.resolve(__dirname, `.env/.env.${env}`),
});

const http = require("http");
const app = require("./app");
const connect_db = require("./config/database");
const logger = require("./utils/logger");

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

//! Validate required environment variables
function validate_env() {
  const required = [
    "MONGO_URI",
    "NODE_ENV",
    "CORS_ORIGIN",
    "API_KEY",
    "API_VERSION",
    "JWT_ACCESS_SECRET",
    "JWT_REFRESH_SECRET",
    "JWT_ACCESS_EXPIRES_IN",
    "JWT_REFRESH_EXPIRES_IN",
  ];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(`❌ Missing required env vars: ${missing.join(", ")}`);
    process.exit(1);
  }
}

//! Bootstrap server
async function start_server() {
  try {
    validate_env();
    await connect_db();

    server.listen(PORT, () => {
      logger.info(
        `🚀 LMS Backend running on port ${PORT} [${process.env.NODE_ENV}]`
      );
    });
  } catch (error) {
    logger.error("❌ Server startup failed", error);
    process.exit(1);
  }
}

start_server();

//! Graceful shutdown
function shutdown(signal = "UNKNOWN") {
  logger.warn(`⚠️ Received ${signal}. Closing server...`);

  server.close(() => {
    logger.info("🛑 HTTP server closed");
    process.exit(0);
  });

  setTimeout(() => {
    logger.error("⏳ Force shutdown after 10s timeout");
    process.exit(1);
  }, 10000);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Rejection:", reason);
  shutdown("unhandledRejection");
});
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  shutdown("uncaughtException");
});
