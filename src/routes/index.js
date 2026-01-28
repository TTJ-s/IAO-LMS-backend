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
const application_route = require("../modules/application/application.routes");
const payment_route = require("../modules/payment/payment.routes");
const academic_route = require("../modules/academic/academic.routes");
const teacher_title_route = require("../modules/master-data/teacher-title/teacher-title.routes");
const teacher_role_route = require("../modules/master-data/teacher-role/teacher-role.routes");
const components_routes = require("../modules/components/components.routes");
const planning_route = require("../modules/planning/planning.routes");
const program_test_route = require("../modules/program/program.test.routes");
const { verify_jwt } = require("../middlewares/auth.middleware");
const { validate_api_key } = require("../middlewares/apikey.middleware");

//* Payment management routes
router.use("/payment", payment_route);
//* Test routes (no auth required)
router.use("/test/program", program_test_route);
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
router.use("/master-data/teacher-title", teacher_title_route);
router.use("/master-data/teacher-role", teacher_role_route);
//* Program management routes
router.use("/program", program_route);
//* Intake management routes
router.use("/intake", intake_route);
//* Application management routes
router.use("/application", application_route);
//* Academic management routes
router.use("/academic", academic_route);
//* Components management routes
router.use("/components", components_routes);
//* Planning management routes
router.use("/planning", planning_route);

module.exports = router;
