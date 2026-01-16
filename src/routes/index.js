const express = require("express");
const router = express.Router();
const auth_route = require("../modules/auth/auth.routes");
const role_route = require("../modules/role/role.routes");
const user_route = require("../modules/user/user.routes");
const country_route = require("../modules/master-data/country/country.routes");
const city_route = require("../modules/master-data/city/city.routes");
const language_route = require("../modules/master-data/language/language.routes");
const program_route = require("../modules/program/program.routes");
const intake_route = require("../modules/intake/intake.routes");
const { verify_jwt } = require("../middlewares/auth.middleware");
const { validate_api_key } = require("../middlewares/apikey.middleware");

//* Validate API key
router.use(validate_api_key);
//* Authentication routes (login, refresh, logout, etc.)
router.use("/auth", auth_route);
//* Requires: Authorization header with valid access token
router.use(verify_jwt);
//* Role management routes
router.use("/role", role_route);
//* User management routes
router.use("/user", user_route);
//* Master data management routes
router.use("/master-data/country", country_route);
router.use("/master-data/city", city_route);
router.use("/master-data/language", language_route);
//* Program management routes
router.use("/program", program_route);
//* Intake management routes
router.use("/intake", intake_route);

module.exports = router;
