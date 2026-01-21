const express = require("express");
const auth_controller = require("./auth.controller");
const oauth_controller = require("./oauth.controller");
const { verify_jwt } = require("../../middlewares/auth.middleware");
const {
  rate_limit,
  PRESETS,
} = require("../../middlewares/ratelimit.middleware");
const router = express.Router();

//* OTP-based authentication for admin - 5 requests per 5 minutes
router.post("/send-otp", rate_limit(PRESETS.otp), auth_controller.send_otp);

//* OTP-based authentication/account creation for student - 5 requests per 5 minutes
router.post(
  "/student/send-otp",
  rate_limit(PRESETS.otp),
  auth_controller.student_send_otp,
);

//* Login after OTP verification - 5 requests per 15 minutes
router.post(
  "/verify-otp",
  rate_limit(PRESETS.auth),
  auth_controller.verify_otp,
);

//* Cookie (HttpOnly, Secure, SameSite) is sent automatically by browser
router.post("/refresh", auth_controller.refresh_token);

//* Requires: Authorization header with valid access token
router.post("/logout", verify_jwt, auth_controller.logout);

//* Get current authenticated user info
router.get("/me", verify_jwt, auth_controller.get_current_user);

//* Google OAuth login - 10 requests per 10 minutes
router.post(
  "/google",
  rate_limit(PRESETS.oauth),
  oauth_controller.google_callback,
);

//* Microsoft OAuth login - 10 requests per 10 minutes
router.post(
  "/microsoft",
  rate_limit(PRESETS.oauth),
  oauth_controller.microsoft_callback,
);

module.exports = router;
