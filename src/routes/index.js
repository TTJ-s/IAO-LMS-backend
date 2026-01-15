const express = require("express");
const router = express.Router();
const role_route = require("../modules/role/role.routes");
const user_route = require("../modules/user/user.routes");

router.use("/role", role_route);
router.use("/user", user_route);

module.exports = router;
