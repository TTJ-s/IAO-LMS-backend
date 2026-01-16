const express = require("express");
const program_controller = require("./program.controller");
const router = express.Router();

router
  .route("/")
  .post(program_controller.create)
  .get(program_controller.get_programs);

router
  .route("/:id")
  .get(program_controller.get_program)
  .patch(program_controller.duplicate_program)
  .put(program_controller.update_program)
  .delete(program_controller.delete_program);

module.exports = router;
