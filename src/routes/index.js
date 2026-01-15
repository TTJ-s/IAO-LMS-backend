const express = require("express");
const router = express.Router();
const role_route = require("../modules/role/role.routes");

router.use("/role", role_route);

module.exports = router;
