const express = require("express");
const payment_controller = require("./payment.controller");
const {
  rate_limit,
  PRESETS,
} = require("../../middlewares/ratelimit.middleware");
const { validate_api_key } = require("../../middlewares/apikey.middleware");
const { verify_jwt } = require("../../middlewares/auth.middleware");
const {
  validate_webhook_secret,
} = require("../../middlewares/webhook.middleware");
const router = express.Router();

//* Webhook with secret token in URL: /payment/webhook/:secret
router.post(
  "/webhook/:secret",
  validate_webhook_secret,
  payment_controller.webhook,
);

router.use(validate_api_key);
router.use(verify_jwt);
router
  .route("/")
  .post(rate_limit(PRESETS.api), payment_controller.create_payment)
  .get(rate_limit(PRESETS.public), payment_controller.get_payments);

router.get(
  "/uid/:id",
  rate_limit(PRESETS.public),
  payment_controller.get_payment_by_uid,
);

module.exports = router;
