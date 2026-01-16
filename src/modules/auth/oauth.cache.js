//* In-memory cache for OAuth token validation
const logger = require("../../utils/logger");

//TODO: Replace with Redis
//* For production with multiple instances, use Redis
const token_cache = new Map();

//* Configuration
const CACHE_CONFIG = {
  ttl_ms: 15 * 60 * 1000, //* 15 minutes
  max_cache_size: 10000, //* Maximum cached tokens
};

//* Retry configuration
const RETRY_CONFIG = {
  max_retries: 3,
  initial_delay_ms: 1000, //* 1 second
  max_delay_ms: 10000, //* 10 seconds
  backoff_multiplier: 2, //* Exponential backoff
};

//* Clean up old entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, value] of token_cache.entries()) {
    if (now - value.cached_at > CACHE_CONFIG.ttl_ms) {
      token_cache.delete(key);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    logger.info({
      context: "oauth.cache",
      message: "Cache cleanup completed",
      entries_removed: cleaned,
      cache_size: token_cache.size,
    });
  }
}, 10 * 60 * 1000);

//* Generate cache key from token
const get_cache_key = (token, provider) => {
  return `${provider}:${token.substring(0, 20)}`; //* Use first 20 chars of token
};

//* Cache token validation result
const cache_token = (token, provider, data) => {
  try {
    //* Limit cache size
    if (token_cache.size >= CACHE_CONFIG.max_cache_size) {
      //* Remove oldest entry
      const firstKey = token_cache.keys().next().value;
      token_cache.delete(firstKey);
      logger.warn({
        context: "oauth.cache",
        message: "Cache size limit reached, removing oldest entry",
      });
    }

    const key = get_cache_key(token, provider);
    token_cache.set(key, {
      data,
      cached_at: Date.now(),
      provider,
    });

    logger.debug({
      context: "oauth.cache",
      message: "Token cached",
      provider,
      cache_size: token_cache.size,
    });
  } catch (error) {
    logger.error({
      context: "oauth.cache",
      message: "Failed to cache token",
      error: error.message,
    });
  }
};

//* Get cached token validation
const get_cached_token = (token, provider) => {
  try {
    const key = get_cache_key(token, provider);
    const cached = token_cache.get(key);

    if (!cached) {
      return null;
    }

    const age_ms = Date.now() - cached.cached_at;
    if (age_ms > CACHE_CONFIG.ttl_ms) {
      token_cache.delete(key);
      return null;
    }

    logger.debug({
      context: "oauth.cache",
      message: "Token found in cache",
      provider,
      age_ms,
    });

    return cached.data;
  } catch (error) {
    logger.error({
      context: "oauth.cache",
      message: "Failed to retrieve cached token",
      error: error.message,
    });
    return null;
  }
};

//* Retry logic with exponential backoff
const retry_async = async (fn, options = {}) => {
  const config = {
    max_retries: RETRY_CONFIG.max_retries,
    initial_delay_ms: RETRY_CONFIG.initial_delay_ms,
    max_delay_ms: RETRY_CONFIG.max_delay_ms,
    backoff_multiplier: RETRY_CONFIG.backoff_multiplier,
    ...options,
  };

  let last_error;
  let delay_ms = config.initial_delay_ms;

  for (let attempt = 1; attempt <= config.max_retries; attempt++) {
    try {
      logger.debug({
        context: "oauth.retry",
        message: `Attempt ${attempt}/${config.max_retries}`,
      });

      return await fn();
    } catch (error) {
      last_error = error;

      //* Don't retry on specific errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        logger.warn({
          context: "oauth.retry",
          message: "Auth error - not retrying",
          status: error.response.status,
          attempt,
        });
        throw error;
      }

      if (attempt < config.max_retries) {
        logger.warn({
          context: "oauth.retry",
          message: `Attempt ${attempt} failed, retrying in ${delay_ms}ms`,
          error: error.message,
          status: error.response?.status,
        });

        //* Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, delay_ms));

        //* Increase delay with exponential backoff
        delay_ms = Math.min(
          delay_ms * config.backoff_multiplier,
          config.max_delay_ms
        );
      } else {
        logger.error({
          context: "oauth.retry",
          message: `All ${config.max_retries} attempts failed`,
          error: error.message,
          status: error.response?.status,
        });
      }
    }
  }

  throw last_error;
};

//* Clear cache (for testing)
const clear_cache = () => {
  const size = token_cache.size;
  token_cache.clear();
  logger.info({
    context: "oauth.cache",
    message: "Cache cleared",
    entries: size,
  });
};

//* Get cache stats
const get_cache_stats = () => ({
  size: token_cache.size,
  max_size: CACHE_CONFIG.max_cache_size,
  ttl_ms: CACHE_CONFIG.ttl_ms,
  usage_percent: (token_cache.size / CACHE_CONFIG.max_cache_size) * 100,
});

module.exports = {
  cache_token,
  get_cached_token,
  retry_async,
  clear_cache,
  get_cache_stats,
  CACHE_CONFIG,
  RETRY_CONFIG,
};
