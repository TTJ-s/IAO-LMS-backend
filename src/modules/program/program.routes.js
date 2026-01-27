const express = require("express");
const program_controller = require("./program.controller");
const {
  rate_limit,
  PRESETS,
} = require("../../middlewares/ratelimit.middleware");
const { validate_object_id } = require("../../middlewares/objectid.middleware");
const router = express.Router();

router
  .route("/")
  .post(rate_limit(PRESETS.api), program_controller.create)
  .get(rate_limit(PRESETS.public), program_controller.get_programs);

router
  .route("/dropdown")
  .get(rate_limit(PRESETS.public), program_controller.get_program_dropdown);

router
  .route("/:id")
  .get(rate_limit(PRESETS.public), validate_object_id(), program_controller.get_program)
  .patch(rate_limit(PRESETS.api), validate_object_id(), program_controller.duplicate_program)
  .put(rate_limit(PRESETS.api), validate_object_id(), program_controller.update_program)
  .delete(rate_limit(PRESETS.api), validate_object_id(), program_controller.delete_program);

module.exports = router;
