const express = require("express");
const intake_controller = require("./intake.controller");
const {
  rate_limit,
  PRESETS,
} = require("../../middlewares/ratelimit.middleware");
const { validate_object_id } = require("../../middlewares/objectid.middleware");
const router = express.Router();

router
  .route("/")
  .post(rate_limit(PRESETS.api), intake_controller.create_intake)
  .get(rate_limit(PRESETS.public), intake_controller.get_intakes);

router.get(
  "/active-program/:id",
  rate_limit(PRESETS.public),
  validate_object_id(),
  intake_controller.get_active_program_by_id,
);

router.get(
  "/batches",
  rate_limit(PRESETS.public),
  intake_controller.get_batches_by_program,
);

router.get(
  "/batches/:id",
  rate_limit(PRESETS.public),
  validate_object_id(),
  intake_controller.get_batches_by_intake_id,
);

router.get(
  "/batch/:id",
  rate_limit(PRESETS.public),
  validate_object_id(),
  intake_controller.get_batch,
);

router.get(
  "/batch/students/:id",
  rate_limit(PRESETS.public),
  validate_object_id(),
  intake_controller.get_batch_students,
);

router.get(
  "/application/student/:id",
  rate_limit(PRESETS.public),
  validate_object_id(),
  intake_controller.get_student_by_app_id,
);

router.get(
  "/enrollments/:id",
  rate_limit(PRESETS.public),
  validate_object_id(),
  intake_controller.get_enrollments_by_intake_id,
);

router
  .route("/:id")
  .get(
    rate_limit(PRESETS.public),
    validate_object_id(),
    intake_controller.get_intake,
  )
  .delete(
    rate_limit(PRESETS.api),
    validate_object_id(),
    intake_controller.delete_intake,
  )
  .put(
    rate_limit(PRESETS.api),
    validate_object_id(),
    intake_controller.update_intake,
  );

module.exports = router;
