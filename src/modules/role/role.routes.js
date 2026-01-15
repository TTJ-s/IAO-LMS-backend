const express = require("express");
const role_controller = require("./role.controller");
const router = express.Router();

router
  .route("/")
  .post(role_controller.create_role)
  .get(role_controller.get_roles);

router
  .route("/:id")
  .put(role_controller.update_role)
  .delete(role_controller.delete_role);

module.exports = router;
