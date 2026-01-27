const express = require("express");
const program_controller = require("./program.controller");
const {
  rate_limit,
  PRESETS,
} = require("../../middlewares/ratelimit.middleware");
const router = express.Router();
router
  .route("/")
  .get(rate_limit(PRESETS.public), program_controller.get_active_aprograms);

module.exports = router;
