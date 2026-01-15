const express = require("express");
const user_controller = require("./user.controller");
const router = express.Router();

router
  .route("/admin")
  .post(user_controller.create_admin)
  .get(user_controller.get_admins);

router.patch("/:id/status", user_controller.update_status);

module.exports = router;
