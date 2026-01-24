const express = require("express");
const country_controller = require("./country.controller");
const {
  rate_limit,
  PRESETS,
} = require("../../../middlewares/ratelimit.middleware");
const router = express.Router();

router
  .route("/")
  .post(rate_limit(PRESETS.api), country_controller.create_country)
  .get(rate_limit(PRESETS.public), country_controller.get_countries);

router
  .route("/dropdown")
  .get(rate_limit(PRESETS.public), country_controller.get_countries_dropdown);

router
  .route("/:id")
  .put(rate_limit(PRESETS.api), country_controller.update_country)
  .delete(rate_limit(PRESETS.api), country_controller.delete_country);

module.exports = router;
