const express = require("express");
const role_controller = require("./role.controller");
const {
  rate_limit,
  PRESETS,
} = require("../../middlewares/ratelimit.middleware");
const router = express.Router();

router
  .route("/")
  .post(rate_limit(PRESETS.api), role_controller.create_role)
  .get(rate_limit(PRESETS.public), role_controller.get_roles);

router
  .route("/:id")
  .put(rate_limit(PRESETS.api), role_controller.update_role)
  .delete(rate_limit(PRESETS.api), role_controller.delete_role);

module.exports = router;
