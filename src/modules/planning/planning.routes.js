const express = require("express");
const planning_controller = require("./planning.controller");
const {
  rate_limit,
  PRESETS,
} = require("../../middlewares/ratelimit.middleware");
const { validate_object_id } = require("../../middlewares/objectid.middleware");

const router = express.Router();

router.post("/", rate_limit(PRESETS.api), planning_controller.create_planning);

router.get("/", rate_limit(PRESETS.public), planning_controller.get_plannings);

router.get(
  "/teacher",
  rate_limit(PRESETS.public),
  planning_controller.get_plannings_by_teacher,
);

router
  .route("/:id")
  .get(rate_limit(PRESETS.public), planning_controller.get_planning_by_id)
  .put(
    rate_limit(PRESETS.api),
    validate_object_id(),
    planning_controller.update_planning,
  )
  .delete(
    rate_limit(PRESETS.api),
    validate_object_id(),
    planning_controller.delete_planning,
  );

//* Update teacher status in a session
router.patch(
  "/:id/teacher-status",
  rate_limit(PRESETS.api),
  validate_object_id(),
  planning_controller.update_teacher_status,
);

module.exports = router;
