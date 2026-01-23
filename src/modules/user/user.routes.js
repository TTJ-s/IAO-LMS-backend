const express = require("express");
const user_controller = require("./user.controller");
const {
  rate_limit,
  PRESETS,
} = require("../../middlewares/ratelimit.middleware");
const router = express.Router();

router
  .route("/admin")
  .post(rate_limit(PRESETS.api), user_controller.create_admin)
  .get(rate_limit(PRESETS.public), user_controller.get_admins);

router
  .route("/teacher")
  .post(rate_limit(PRESETS.api), user_controller.create_teacher)
  .get(rate_limit(PRESETS.public), user_controller.get_teachers);

router.put(
  "/profile-update",
  rate_limit(PRESETS.api),
  user_controller.update_profile,
);

router.post(
  "/bulk-delete-admins",
  rate_limit(PRESETS.api),
  user_controller.bulk_delete_admins,
);

router.get(
  "/teacher/:id",
  rate_limit(PRESETS.public),
  user_controller.get_teacher,
);

router.patch(
  "/:id/status",
  rate_limit(PRESETS.api),
  user_controller.update_status,
);

router
  .route("/:id")
  .delete(rate_limit(PRESETS.api), user_controller.delete_admin);

module.exports = router;
