const { error_response } = require("../utils/response");
const logger = require("../utils/logger");

//* Validate API key from headers
const validate_api_key = (req, res, next) => {
  try {
    //* Extract API key from X-API-Key header
    const api_key = req.headers["x-api-key"];

    if (!api_key) {
      logger.warn({
        context: "apikey.middleware.validate_api_key",
        message: "Missing API key header",
        ip: req.ip,
      });

      return error_response(res, {
        status: 401,
        message: "Unauthorized: Missing API key",
      });
    }

    //* Verify API key against environment variable
    if (api_key !== process.env.API_KEY) {
      logger.warn({
        context: "apikey.middleware.validate_api_key",
        message: "Invalid API key",
        ip: req.ip,
      });

      return error_response(res, {
        status: 401,
        message: "Unauthorized: Invalid API key",
      });
    }

    //* API key is valid, proceed to next middleware/route
    logger.info({
      context: "apikey.middleware.validate_api_key",
      message: "API key validation successful",
      ip: req.ip,
    });

    next();
  } catch (error) {
    logger.error({
      context: "apikey.middleware.validate_api_key",
      message: "Error validating API key",
      error: error.message,
    });

    return error_response(res, {
      status: 500,
      message: "Internal server error",
    });
  }
};

module.exports = {
  validate_api_key,
};
