const express = require("express");
const language_controller = require("./language.controller");
const {
  rate_limit,
  PRESETS,
} = require("../../../middlewares/ratelimit.middleware");
const { validate_object_id } = require("../../../middlewares/objectid.middleware");

const router = express.Router();

router
  .route("/")
  .post(rate_limit(PRESETS.api), language_controller.create)
  .get(rate_limit(PRESETS.public), language_controller.get_languages);

router
  .route("/dropdown")
  .get(rate_limit(PRESETS.public), language_controller.get_language_dropdown);

router
  .route("/:id")
  .put(rate_limit(PRESETS.api), validate_object_id(), language_controller.update_language)
  .delete(rate_limit(PRESETS.api), validate_object_id(), language_controller.delete_language);

module.exports = router;
