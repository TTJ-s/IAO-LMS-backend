const express = require("express");
const city_controller = require("./city.controller");
const {
  rate_limit,
  PRESETS,
} = require("../../../middlewares/ratelimit.middleware");
const { validate_object_id } = require("../../../middlewares/objectid.middleware");
const router = express.Router();

router
  .route("/")
  .post(rate_limit(PRESETS.api), city_controller.create_city)
  .get(rate_limit(PRESETS.public), city_controller.get_cities);

router
  .route("/dropdown")
  .get(rate_limit(PRESETS.public), city_controller.get_cities_dropdown);

router
  .route("/:id")
  .put(rate_limit(PRESETS.api), validate_object_id(), city_controller.update_city)
  .delete(rate_limit(PRESETS.api), validate_object_id(), city_controller.delete_city);

module.exports = router;
