const express = require("express");
const intake_controller = require("./intake.controller");
const { rate_limit, PRESETS } = require("../../middlewares/ratelimit.middleware");
const router = express.Router();

router
  .route("/")
  .post(rate_limit(PRESETS.api), intake_controller.create_intake)
  .get(rate_limit(PRESETS.public), intake_controller.get_intakes);

router
  .route("/:id")
  .delete(rate_limit(PRESETS.api), intake_controller.delete_intake)
  .put(rate_limit(PRESETS.api), intake_controller.update_intake);

module.exports = router;
