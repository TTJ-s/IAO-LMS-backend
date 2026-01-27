const express = require("express");
const academic_controller = require("./academic.controller");
const {
  rate_limit,
  PRESETS,
} = require("../../middlewares/ratelimit.middleware");
const { validate_object_id } = require("../../middlewares/objectid.middleware");
const router = express.Router();

router
  .route("/")
  .post(rate_limit(PRESETS.api), academic_controller.create_academic)
  .get(rate_limit(PRESETS.public), academic_controller.get_academics);

router.get(
  "/intakes/:id",
  rate_limit(PRESETS.public),
  validate_object_id(),
  academic_controller.get_intakes_by_academic_id,
);

router
  .route("/:id")
  .put(rate_limit(PRESETS.api), validate_object_id(), academic_controller.update_academic)
  .patch(rate_limit(PRESETS.api), validate_object_id(), academic_controller.duplicate_academic);

module.exports = router;
