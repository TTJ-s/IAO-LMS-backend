//! DEPENDENCIES
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
const sanitize = require("mongo-sanitize");
const { error_response } = require("./utils/response");

//! MIDDLEWARE
const app = express();

//! SECURITY
app.use(helmet());

//! DATA SANITIZATION - Prevent NoSQL injection
app.use((req, res, next) => {
  if (req.body) {
    req.body = sanitize(req.body);
  }
  if (req.params) {
    req.params = sanitize(req.params);
  }
  if (req.query) {
    req.query = sanitize(req.query);
  }
  next();
});

//! CORS - Strict production configuration
const allowed_origins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
  : [];

if (process.env.NODE_ENV === "production" && allowed_origins.length === 0) {
  throw new Error("CORS_ORIGIN must be defined in production environment");
}

app.use(
  cors({
    origin: allowed_origins.length > 0 ? allowed_origins : false,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-API-Key"],
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

//! HEALTH CHECK - For Kubernetes/monitoring probes
app.get("/health", (req, res) => {
  const uptime = process.uptime();
  const memory_usage = process.memory_usage();

  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(uptime),
    environment: process.env.NODE_ENV,
    memory: {
      heapUsed: Math.round(memory_usage.heapUsed / 1024 / 1024) + "MB",
      heapTotal: Math.round(memory_usage.heapTotal / 1024 / 1024) + "MB",
    },
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
app.use((err, req, res) => {
  const status = err.status || err.statusCode || 500;
  const is_dev = process.env.NODE_ENV !== "production";

  return error_response(res, {
    status,
    message: err.message || "Internal Server Error",
    errors: is_dev ? err.errors : null,
  });
});

module.exports = app;
