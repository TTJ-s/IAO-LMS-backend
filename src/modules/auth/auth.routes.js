const express = require("express");
const auth_controller = require("./auth.controller");
const { verify_jwt } = require("../../middlewares/auth.middleware");
const router = express.Router();

//* OTP-based authentication for admin
router.post("/send-otp", auth_controller.send_otp);

//* OTP-based authentication/account creation for student
router.post("/student/send-otp", auth_controller.student_send_otp);

//* Login after OTP verification - Get access token + refresh cookie
router.post("/verify-otp", auth_controller.verify_otp);

//* Cookie (HttpOnly, Secure, SameSite) is sent automatically by browser
router.post("/refresh", auth_controller.refresh_token);

//* Requires: Authorization header with valid access token
router.post("/logout", verify_jwt, auth_controller.logout);

//* Get current authenticated user info
router.get("/me", verify_jwt, auth_controller.get_current_user);

module.exports = router;
