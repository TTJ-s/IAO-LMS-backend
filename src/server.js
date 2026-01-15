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

//! Bootstrap server
async function start_server() {
  try {
    await connect_db();

    server.listen(PORT, () => {
      logger.info(
        `🚀 LMS Backend running on port ${PORT} [${process.env.NODE_ENV}]`
      );
    });
  } catch (error) {
    logger.error("❌ Server startup failed", err);
    process.exit(1);
  }
}

start_server();

//! Graceful shutdown
function shutdown(signal) {
  logger.warn(`⚠️ Received ${signal}. Closing server...`);

  server.close(() => {
    logger.info("🛑 HTTP server closed");
    process.exit(0);
  });

  setTimeout(() => {
    logger.error("⏳ Force shutdown");
    process.exit(1);
  }, 10000);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Rejection:", reason);
  shutdown("unhandledRejection");
});
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  shutdown("uncaughtException");
});
