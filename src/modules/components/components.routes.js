const express = require("express");
const components_controller = require("./components.controller");
const {
  rate_limit,
  PRESETS,
} = require("../../middlewares/ratelimit.middleware");
const router = express.Router();

router
  .route("/")
  .post(rate_limit(PRESETS.api), components_controller.create_component)
  .get(
    rate_limit(PRESETS.public),
    components_controller.get_components_by_type,
  );

router
  .route("/:id")
  .get(rate_limit(PRESETS.public), components_controller.get_component_by_id)
  .put(rate_limit(PRESETS.api), components_controller.update_component);

module.exports = router;
