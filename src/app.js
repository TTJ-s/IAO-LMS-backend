//! DEPENDENCIES
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const { error_response, success_response } = require("./utils/response");

//! APP
const app = express();

//! SECURITY HEADERS
app.use(helmet());

//! BODY PARSER
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

//! COOKIE PARSER - GDPR safe, for HttpOnly refresh tokens
app.use(cookieParser());

//! CORS - Strict production configuration
const allowed_origins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
  : [];

if (process.env.NODE_ENV === "production" && allowed_origins.length === 0) {
  throw new Error("CORS_ORIGIN must be defined in production");
}

app.use(
  cors({
    origin: allowed_origins.length ? allowed_origins : false,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-API-Key"],
  })
);

//! COMPRESSION
app.use(compression());

//! LOGGING (DEV ONLY)
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

//! HEALTH CHECK
app.get("/health", (req, res) => {
  const uptime = process.uptime();
  const memory = process.memoryUsage();

  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(uptime),
    environment: process.env.NODE_ENV,
    memory: {
      heapUsed: Math.round(memory.heapUsed / 1024 / 1024) + "MB",
      heapTotal: Math.round(memory.heapTotal / 1024 / 1024) + "MB",
    },
  });
});

//! BASE PATH
const BASE_PATH = `/api/${process.env.API_VERSION || "v1"}`;

//! BASE ROUTE
app.get(BASE_PATH, (req, res) => {
  return success_response(res, {
    status: 200,
    message: "IAO LMS API Gateway Active",
  });
});

//! OTHER ROUTES
app.use(BASE_PATH, require("./routes"));

//! 404 HANDLER
app.use((req, res) => {
  return error_response(res, {
    status: 404,
    message: "🚫 Route not found",
  });
});

//! ERROR HANDLER
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const isDev = process.env.NODE_ENV !== "production";

  return error_response(res, {
    status,
    message: err.message || "Internal Server Error",
    errors: isDev ? err.errors : undefined,
  });
});

module.exports = app;
