//* Simple in-memory store for rate limiting
const logger = require("../utils/logger");
const { error_response } = require("../utils/response");

//TODO: Replace with Redis
//* For production with multiple instances, use Redis
const rate_limit_store = new Map();

//* Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rate_limit_store.entries()) {
    if (now - value.created_at > 60 * 60 * 1000) {
      //* Delete entries older than 1 hour
      rate_limit_store.delete(key);
    }
  }
}, 5 * 60 * 1000);

//* Rate limiting options
const DEFAULT_OPTIONS = {
  window_size_ms: 60 * 1000, //* 1 minute
  max_requests: 5, //* 5 requests per window
  key_generator: (req) => req.ip, //* By IP address
  skip_on_success: false, //* Count all requests
  message: "Too many requests. Please try again later.",
};

//* Create rate limiting middleware
const rate_limit = (options = {}) => {
  const config = { ...DEFAULT_OPTIONS, ...options };

  return (req, res, next) => {
    try {
      //* Generate unique key for this request
      const key = config.key_generator(req);

      if (!key) {
        logger.warn({
          context: "rate_limit.middleware",
          message: "Unable to generate rate limit key",
        });
        return next();
      }

      const now = Date.now();
      let request_data = rate_limit_store.get(key);

      //* Initialize or reset if window expired
      if (
        !request_data ||
        now - request_data.created_at > config.window_size_ms
      ) {
        request_data = {
          count: 0,
          created_at: now,
          requests: [],
        };
      }

      //* Increment request count
      request_data.count += 1;
      request_data.requests.push({
        timestamp: now,
        path: req.path,
        method: req.method,
      });

      //* Check if limit exceeded
      if (request_data.count > config.max_requests) {
        const reset_time = new Date(
          request_data.created_at + config.window_size_ms
        );
        const remaining_seconds = Math.ceil((reset_time - now) / 1000);

        logger.warn({
          context: "rate_limit.middleware",
          message: "Rate limit exceeded",
          key,
          count: request_data.count,
          max: config.max_requests,
          remaining_seconds,
          ip: req.ip,
          path: req.path,
        });

        //* Add rate limit headers
        res.set({
          "X-RateLimit-Limit": config.max_requests,
          "X-RateLimit-Remaining": Math.max(
            0,
            config.max_requests - request_data.count
          ),
          "X-RateLimit-Reset": reset_time.toISOString(),
          "Retry-After": remaining_seconds,
        });

        return error_response(res, {
          status: 429,
          message: config.message,
        });
      }

      //* Store updated data
      rate_limit_store.set(key, request_data);

      //* Add rate limit headers to response
      res.set({
        "X-RateLimit-Limit": config.max_requests,
        "X-RateLimit-Remaining": config.max_requests - request_data.count,
        "X-RateLimit-Reset": new Date(
          request_data.created_at + config.window_size_ms
        ).toISOString(),
      });

      logger.debug({
        context: "rate_limit.middleware",
        message: "Rate limit check passed",
        key,
        count: request_data.count,
        max: config.max_requests,
      });

      next();
    } catch (error) {
      logger.error({
        context: "rate_limit.middleware",
        message: "Rate limiting error",
        error: error.message,
      });

      //* Don't block request on rate limit error
      next();
    }
  };
};

//* Preset configurations for common scenarios
const PRESETS = {
  //* Strict limit for authentication endpoints
  auth: {
    window_size_ms: 15 * 60 * 1000, //* 15 minutes
    max_requests: 5,
    message: "Too many login attempts. Please try again in 15 minutes.",
  },

  //* OAuth endpoints
  oauth: {
    window_size_ms: 10 * 60 * 1000, //* 10 minutes
    max_requests: 10,
    message: "Too many OAuth requests. Please try again later.",
  },

  //* OTP endpoints
  otp: {
    window_size_ms: 5 * 60 * 1000, //* 5 minutes
    max_requests: 3,
    message: "Too many OTP requests. Please try again in 5 minutes.",
  },

  //* API endpoints
  api: {
    window_size_ms: 60 * 1000, //* 1 minute
    max_requests: 100,
    message: "Rate limit exceeded. Please slow down.",
  },

  //* Public endpoints
  public: {
    window_size_ms: 60 * 1000, //* 1 minute
    max_requests: 30,
    message: "Too many requests. Please try again later.",
  },
};

module.exports = {
  rate_limit,
  PRESETS,
  rate_limit_store, //* For testing/monitoring
};
