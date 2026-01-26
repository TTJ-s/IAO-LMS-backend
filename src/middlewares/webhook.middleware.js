const { error_response } = require("../utils/response");
const logger = require("../utils/logger");

//* Validate Mollie webhook secret token from URL params
const validate_webhook_secret = (req, res, next) => {
  const { secret } = req.params;

  if (!process.env.MOLLIE_WEBHOOK_SECRET) {
    logger.error({
      context: "webhook.middleware.validate_webhook_secret",
      message: "MOLLIE_WEBHOOK_SECRET not configured",
    });
    return error_response(res, {
      status: 500,
      message: "Webhook not configured",
    });
  }

  if (secret !== process.env.MOLLIE_WEBHOOK_SECRET) {
    logger.warn({
      context: "webhook.middleware.validate_webhook_secret",
      message: "Invalid webhook secret",
      ip: req.ip,
    });
    return error_response(res, {
      status: 403,
      message: "Forbidden",
    });
  }

  next();
};

module.exports = {
  validate_webhook_secret,
};
