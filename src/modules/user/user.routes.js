const express = require("express");
const user_controller = require("./user.controller");
const router = express.Router();

router
  .route("/admin")
  .post(user_controller.create_admin)
  .get(user_controller.get_admins);

router.post("/bulk-delete-admins", user_controller.bulk_delete_admins);

router.patch("/:id/status", user_controller.update_status);

router.route("/:id").delete(user_controller.delete_admin);

module.exports = router;
