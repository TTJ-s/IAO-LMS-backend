const express = require("express");
const application_controller = require("./application.controller");
const {
  rate_limit,
  PRESETS,
} = require("../../middlewares/ratelimit.middleware");
const router = express.Router();

router
  .route("/")
  .post(rate_limit(PRESETS.api), application_controller.create_application)
  .get(rate_limit(PRESETS.public), application_controller.get_applications);

router.get("/my-application", application_controller.get_my_application);

router
  .route("/:id")
  .get(rate_limit(PRESETS.public), application_controller.find_application)
  .put(rate_limit(PRESETS.api), application_controller.update_application)
  .patch(
    rate_limit(PRESETS.api),
    application_controller.update_application_status,
  );

module.exports = router;
