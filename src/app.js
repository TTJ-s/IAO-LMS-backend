//! DEPENDENCIES
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
const mongo_sanitize = require("express-mongo-sanitize");
const { error_response } = require("./utils/response");

//! MIDDLEWARE
const app = express();

//! SECURITY
app.use(helmet());
app.use(mongo_sanitize());

//! CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "*",
    credentials: true,
  })
);

//! BODY PARSER
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

//! COMPRESSION
app.use(compression());

//! LOGS
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

//! HEALTH CHECK
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date(),
  });
});

//! 404 HANDLER
app.use((req, res) => {
  return error_response(res, {
    status: 404,
    message: "🚫 Route not found",
  });
});

//! ERROR HANDLER
app.use((err, req, res, next) => {
  return error_response(res, {
    status: err.status || 500,
    message: err.message,
    errors: err.errors,
  });
});

module.exports = app;
