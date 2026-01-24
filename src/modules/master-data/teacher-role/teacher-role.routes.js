const express = require("express");
const teacher_role_controller = require("./teacher-role.controller");
const {
  rate_limit,
  PRESETS,
} = require("../../../middlewares/ratelimit.middleware");
const router = express.Router();

router
  .route("/")
  .post(rate_limit(PRESETS.api), teacher_role_controller.create_teacher_role)
  .get(rate_limit(PRESETS.public), teacher_role_controller.get_teacher_roles);

router
  .route("/dropdown")
  .get(
    rate_limit(PRESETS.public),
    teacher_role_controller.get_teacher_role_dropdown,
  );

router
  .route("/:id")
  .put(rate_limit(PRESETS.api), teacher_role_controller.update_teacher_role)
  .delete(rate_limit(PRESETS.api), teacher_role_controller.delete_teacher_role);

module.exports = router;
