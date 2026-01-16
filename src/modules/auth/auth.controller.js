const { success_response, error_response } = require("../../utils/response");
const auth_service = require("./auth.service");
const logger = require("../../utils/logger");
const { User } = require("../../models");

//* Cookie configuration for GDPR compliance
const get_cookie_options = () => ({
  httpOnly: true, //* GDPR: Not accessible to JavaScript
  secure: process.env.NODE_ENV === "production", //* HTTPS only in prod
  sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax", //* CSRF protection
  path: "/api", //* Only for API endpoints
  maxAge: 7 * 24 * 60 * 60 * 1000, //* 7 days (matches refresh token expiry)
});

class auth_controller {
  async send_otp(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        return error_response(res, {
          status: 400,
          message: "Email is required",
        });
      }
      const user = await auth_service.find_by_email(email);
      if (!user) {
        logger.warn({
          context: "auth.controller.send_otp",
          message: "Admin not found",
        });

        return error_response(res, {
          status: 400,
          message: "Admin not found",
        });
      }
      //* Check if user is locked out from sending OTP
      if (
        user.otp_tracking?.send_locked_until &&
        user.otp_tracking.send_locked_until > Date.now()
      ) {
        const remaining_seconds = Math.ceil(
          (user.otp_tracking.send_locked_until - Date.now()) / 1000
        );

        logger.warn({
          context: "auth.controller.send_otp",
          message: `Too many OTP send attempts. Try again in ${remaining_seconds} seconds`,
        });

        return error_response(res, {
          status: 400,
          message: `Too many OTP send attempts. Try again in ${remaining_seconds} seconds`,
        });
      }

      //* Reset OTP related fields for new request
      if (!user.otp_tracking) {
        user.otp_tracking = {};
      }
      user.otp_tracking.failed_attempts = 0;
      user.otp_tracking.locked_until = null;

      //TODO: change after development
      //const otp = generate_OTP(6);
      const otp = "123456";
      user.otp = otp;
      user.otp_tracking.created_at = new Date();
      await auth_service.add_otp(user._id, otp);
      //TODO: send OTP via email

      //* Update OTP send attempt tracking
      user.otp_tracking.send_attempts =
        (user.otp_tracking.send_attempts || 0) + 1;
      if (user.otp_tracking.send_attempts > 5) {
        //* Lock user for 15 minutes after 5 OTP send attempts
        user.otp_tracking.send_locked_until = new Date(
          Date.now() + 15 * 60 * 1000
        );
      }
      await user.save();

      return success_response(res, {
        status: 200,
        message: "OTP sent successfully",
      });
    } catch (error) {
      logger.error({
        context: "auth.controller.send_otp",
        message: error.message,
        stack: error.stack,
      });

      return error_response(res, {
        status: 500,
        message: error.message,
        errors: error.stack,
      });
    }
  }

  async student_send_otp(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        return error_response(res, {
          status: 400,
          message: "Email is required",
        });
      }
      let user = await auth_service.find_by_email(email);
      if (!user) {
        const payload = {
          email,
          role: "student",
        };
        user = await auth_service.create_user(payload);
      }
      //* Check if user is locked out from sending OTP
      if (
        user.otp_tracking?.send_locked_until &&
        user.otp_tracking.send_locked_until > Date.now()
      ) {
        const remaining_seconds = Math.ceil(
          (user.otp_tracking.send_locked_until - Date.now()) / 1000
        );

        logger.warn({
          context: "auth.controller.send_otp",
          message: `Too many OTP send attempts. Try again in ${remaining_seconds} seconds`,
        });

        return error_response(res, {
          status: 400,
          message: `Too many OTP send attempts. Try again in ${remaining_seconds} seconds`,
        });
      }

      //* Reset OTP related fields for new request
      if (!user.otp_tracking) {
        user.otp_tracking = {};
      }
      user.otp_tracking.failed_attempts = 0;
      user.otp_tracking.locked_until = null;

      //TODO: change after development
      //const otp = generate_OTP(6);
      const otp = "123456";
      user.otp = otp;
      user.otp_tracking.created_at = new Date();
      await auth_service.add_otp(user._id, otp);
      //TODO: send OTP via email

      //* Update OTP send attempt tracking
      user.otp_tracking.send_attempts =
        (user.otp_tracking.send_attempts || 0) + 1;
      if (user.otp_tracking.send_attempts > 5) {
        //* Lock user for 15 minutes after 5 OTP send attempts
        user.otp_tracking.send_locked_until = new Date(
          Date.now() + 15 * 60 * 1000
        );
      }
      await user.save();

      return success_response(res, {
        status: 200,
        message: "OTP sent successfully",
      });
    } catch (error) {
      logger.error({
        context: "auth.controller.send_otp",
        message: error.message,
        stack: error.stack,
      });

      return error_response(res, {
        status: 500,
        message: error.message,
        errors: error.stack,
      });
    }
  }

  //* Cookies:
  //* - refreshToken: HttpOnly, Secure, SameSite (7 days)
  async verify_otp(req, res) {
    try {
      const { email, otp } = req.body;

      //* Validate input
      if (!email || !otp) {
        return error_response(res, {
          status: 400,
          message: "Email and OTP are required",
        });
      }

      //* Find user
      const user = await User.findOne({ email });
      if (!user) {
        logger.warn({
          context: "auth.controller.login",
          message: "Login attempt for non-existent user",
        });

        return error_response(res, {
          status: 401,
          message: "Invalid credentials",
        });
      }

      //* Verify user is active
      if (user.status !== "active") {
        logger.warn({
          context: "auth.controller.login",
          message: "Login attempt for inactive user",
          user_id: user._id,
          user_status: user.status,
        });

        return error_response(res, {
          status: 403,
          message: "User account is not active",
        });
      }

      //* Verify OTP (check expiry and validity)
      if (!user.otp || user.otp !== otp) {
        //* Increment failed attempts
        user.otp_tracking = user.otp_tracking || {};
        user.otp_tracking.failed_attempts =
          (user.otp_tracking.failed_attempts || 0) + 1;

        //* Lock after 5 failed attempts (15 minutes)
        if (user.otp_tracking.failed_attempts > 5) {
          user.otp_tracking.locked_until = new Date(
            Date.now() + 15 * 60 * 1000
          );
          await user.save();

          logger.warn({
            context: "auth.controller.login",
            message: "User locked due to failed OTP attempts",
            user_id: user._id,
          });

          return error_response(res, {
            status: 429,
            message: "Too many failed attempts. Try again after 15 minutes.",
          });
        }

        await user.save();

        logger.warn({
          context: "auth.controller.login",
          message: "OTP verification failed",
          user_id: user._id,
        });

        return error_response(res, {
          status: 401,
          message: "Invalid OTP",
        });
      }

      //* Check OTP expiry (typically 10 minutes)
      const otp_age_minutes =
        (Date.now() - user.otp_tracking?.created_at) / 1000 / 60;
      if (otp_age_minutes > 10) {
        logger.warn({
          context: "auth.controller.login",
          message: "OTP expired",
          user_id: user._id,
          otp_age_minutes,
        });

        return error_response(res, {
          status: 401,
          message: "OTP expired. Request a new one.",
        });
      }

      //* ===== OTP Verified - Generate Tokens =====

      //* Generate JWT token pair (access + refresh)
      const { access_token, refresh_token } =
        await auth_service.generate_tokens(
          user._id.toString(),
          user.role,
          user.token_version
        );

      //* Clear OTP from database (GDPR: remove sensitive data after use)
      user.otp = null;
      user.otp_tracking = {
        created_at: null,
        failed_attempts: 0,
        locked_until: null,
        send_attempts: 0,
        send_locked_until: null,
      };
      await user.save();

      //* Set refresh token in HttpOnly cookie (secure, GDPR-compliant)
      res.cookie("refreshToken", refresh_token, get_cookie_options());

      //* Return access token in response (client stores in memory)
      //* Never send refresh token in response body
      //* Never send in localStorage (localStorage is vulnerable to XSS)
      const access_expires_in = process.env.JWT_ACCESS_EXPIRES_IN || "15m";

      logger.info({
        context: "auth.controller.login",
        message: "User login successful",
        user_id: user._id,
        user_role: user.role,
      });

      return success_response(res, {
        status: 200,
        message: "Login successful",
        data: {
          user: {
            _id: user._id,
            role: user.role,
            status: user.status,
          },
          access_token, //* Client stores in memory (expires in 15m)
          access_token_expires_in: access_expires_in,
          //* Refresh token is in HttpOnly cookie (not sent in body)
        },
      });
    } catch (error) {
      logger.error({
        context: "auth.controller.login",
        message: "Login error",
        error: error.message,
      });

      return error_response(res, {
        status: 500,
        message: "Internal server error during login",
      });
    }
  }

  //* Exchange refresh token for new access token
  //* Called when access token is about to expire (or just expired)
  async refresh_token(req, res) {
    try {
      //* Extract refresh token from HttpOnly cookie
      const refresh_token = req.cookies.refreshToken;

      if (!refresh_token) {
        logger.warn({
          context: "auth.controller.refresh_token",
          message: "Refresh token missing from cookies",
        });

        return error_response(res, {
          status: 401,
          message: "Unauthorized: Refresh token missing",
        });
      }

      //* Verify refresh token
      let decoded;
      try {
        decoded = auth_service.verify_refresh_token(refresh_token);
      } catch (jwt_error) {
        logger.warn({
          context: "auth.controller.refresh_token",
          message: "Refresh token verification failed",
          error: jwt_error.name,
        });

        //* Clear invalid refresh token cookie
        res.clearCookie("refreshToken", { path: "/api" });

        return error_response(res, {
          status: 401,
          message: "Unauthorized: Invalid or expired refresh token",
        });
      }

      const { sub: user_id, token_version } = decoded;

      //* Fetch user to verify:
      //* 1. Still exists and active
      //* 2. token_version matches (not revoked)
      const user = await User.findById(user_id).select(
        "_id role status token_version"
      );

      if (!user || user.status !== "active") {
        logger.warn({
          context: "auth.controller.refresh_token",
          message: "User not found or inactive during token refresh",
          user_id,
        });

        //* Clear invalid refresh token cookie
        res.clearCookie("refreshToken", { path: "/api" });

        return error_response(res, {
          status: 403,
          message: "Forbidden: User not found or inactive",
        });
      }

      //* Check token revocation (version mismatch)
      if (user.token_version !== token_version) {
        logger.warn({
          context: "auth.controller.refresh_token",
          message: "Refresh token revoked (version mismatch)",
          user_id,
          stored_version: user.token_version,
          token_version,
        });

        //* Clear revoked refresh token cookie
        res.clearCookie("refreshToken", { path: "/api" });

        return error_response(res, {
          status: 401,
          message: "Unauthorized: Refresh token revoked",
        });
      }

      //* ===== Token Valid - Issue New Access Token =====
      const new_access_token = auth_service.generate_access_token(
        user_id,
        user.role,
        user.token_version
      );

      const access_expires_in = process.env.JWT_ACCESS_EXPIRES_IN || "15m";

      logger.info({
        context: "auth.controller.refresh_token",
        message: "Token refreshed successfully",
        user_id,
      });

      return success_response(res, {
        status: 200,
        message: "Token refreshed",
        data: {
          user: {
            _id: user._id,
            role: user.role,
            status: user.status,
          },
          access_token: new_access_token,
          access_token_expires_in: access_expires_in,
        },
      });
    } catch (error) {
      logger.error({
        context: "auth.controller.refresh_token",
        message: "Token refresh error",
        error: error.message,
      });

      return error_response(res, {
        status: 500,
        message: "Internal server error during token refresh",
      });
    }
  }

  //* Revoke all tokens for authenticated user
  //* Requires: Authorization header with valid access token
  async logout(req, res) {
    try {
      //* req.user is set by verify_jwt middleware
      //* Contains: { id, role, token_version, issued_at }
      const user_id = req.user?._id;

      if (!user_id) {
        logger.warn({
          context: "auth.controller.logout",
          message: "Logout attempt without user context",
        });

        return error_response(res, {
          status: 401,
          message: "Unauthorized: User not found in request context",
        });
      }

      //* Revoke all tokens (increment token_version)
      await auth_service.revoke_all_tokens(user_id);

      //* Clear refresh token from HttpOnly cookie
      res.clearCookie("refreshToken", { path: "/api" });

      logger.info({
        context: "auth.controller.logout",
        message: "User logout successful",
        user_id,
      });

      return success_response(res, {
        status: 200,
        message: "Logout successful",
      });
    } catch (error) {
      logger.error({
        context: "auth.controller.logout",
        message: "Logout error",
        error: error.message,
        user_id: req.user?._id,
      });

      return error_response(res, {
        status: 500,
        message: "Internal server error during logout",
      });
    }
  }

  //* Get current authenticated user info
  async get_current_user(req, res) {
    try {
      const user_id = req.user?._id;

      if (!user_id) {
        return error_response(res, {
          status: 401,
          message: "Unauthorized",
        });
      }

      //* Fetch user from database
      const user = await User.findById(user_id)
        .select("email role status uid first_name last_name role_access")
        .populate("role_access");

      if (!user) {
        return error_response(res, {
          status: 404,
          message: "User not found",
        });
      }

      logger.debug({
        context: "auth.controller.get_current_user",
        message: "User info retrieved",
        user_id,
      });

      return success_response(res, {
        status: 200,
        message: "User info retrieved",
        data: {
          _id: user._id,
          uid: user.uid,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          role_access: user.role_access,
          status: user.status,
        },
      });
    } catch (error) {
      logger.error({
        context: "auth.controller.get_current_user",
        message: "Error retrieving user info",
        error: error.message,
        user_id: req.user?._id,
      });

      return error_response(res, {
        status: 500,
        message: "Internal server error",
      });
    }
  }
}

module.exports = new auth_controller();
