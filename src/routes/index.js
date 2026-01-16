const express = require("express");
const router = express.Router();
const auth_route = require("../modules/auth/auth.routes");
const role_route = require("../modules/role/role.routes");
const user_route = require("../modules/user/user.routes");
const { verify_jwt } = require("../middlewares/auth.middleware");

//* Authentication routes (login, refresh, logout, etc.)
router.use("/auth", auth_route);
//* Requires: Authorization header with valid access token
router.use(verify_jwt);
//* Role management routes
router.use("/role", role_route);
//* User management routes
router.use("/user", user_route);

module.exports = router;
