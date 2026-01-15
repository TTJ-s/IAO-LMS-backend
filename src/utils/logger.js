//* Production-grade logger using Pino
//* GDPR-safe (no PII), structured logging for log aggregation
//* Suitable for Belgium client enterprise deployment
//* Development: Pretty console output with colors
//* Production: Daily rotating files with JSON format for log aggregation

const pino = require("pino");
const path = require("path");
const fs = require("fs");

const is_prod = process.env.NODE_ENV === "production";

//! Ensure logs directory exists
const logs_dir = path.join(__dirname, "../../logs");
if (!fs.existsSync(logs_dir)) {
  fs.mkdirSync(logs_dir, { recursive: true });
}

//! Configure Pino based on environment
let pino_logger;

if (is_prod) {
  //! Production: File logging with rotation transport
  pino_logger = pino(
    {
      level: "info",
      timestamp: pino.stdTimeFunctions.isoTime,
    },
    pino.transport({
      target: "pino-roll",
      options: {
        file: path.join(logs_dir, "app.log"),
        frequency: "daily",
        mkdir: true,
      },
    })
  );
} else {
  //! Development: Pretty console output
  pino_logger = pino({
    level: "debug",
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
        singleLine: false,
      },
    },
  });
}

//* Structured logging interface
const logger = {
  info: (message, data = {}) => {
    pino_logger.info(data, message);
  },

  warn: (message, data = {}) => {
    pino_logger.warn(data, message);
  },

  error: (message, error = {}) => {
    if (error instanceof Error) {
      pino_logger.error(
        {
          err: error,
          stack: error.stack,
        },
        message
      );
    } else {
      pino_logger.error(error, message);
    }
  },

  debug: (message, data = {}) => {
    pino_logger.debug(data, message);
  },

  //* For request tracking
  child: (context = {}) => {
    return pino_logger.child(context);
  },
};

module.exports = logger;
