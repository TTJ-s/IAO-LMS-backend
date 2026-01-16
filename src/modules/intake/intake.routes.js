const express = require("express");
const intake_controller = require("./intake.controller");
const router = express.Router();

router
  .route("/")
  .post(intake_controller.create_intake)
  .get(intake_controller.get_intakes);

router
  .route("/:id")
  .delete(intake_controller.delete_intake)
  .put(intake_controller.update_intake);

module.exports = router;
