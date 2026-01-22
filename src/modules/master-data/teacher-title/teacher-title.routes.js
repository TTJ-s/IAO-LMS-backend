const express = require("express");
const teacher_title_controller = require("./teacher-title.controller");
const {
  rate_limit,
  PRESETS,
} = require("../../../middlewares/ratelimit.middleware");
const router = express.Router();

router
  .route("/")
  .post(rate_limit(PRESETS.api), teacher_title_controller.create_teacher_title)
  .get(rate_limit(PRESETS.public), teacher_title_controller.get_teacher_titles);

router
  .route("/:id")
  .put(rate_limit(PRESETS.api), teacher_title_controller.update_teacher_title)
  .delete(
    rate_limit(PRESETS.api),
    teacher_title_controller.delete_teacher_title,
  );

module.exports = router;
