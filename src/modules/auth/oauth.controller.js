const { success_response, error_response } = require("../../utils/response");
const oauth_service = require("./oauth.service");
const logger = require("../../utils/logger");

const get_cookie_options = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  path: "/api",
  maxAge: 7 * 24 * 60 * 60 * 1000, //* 7 days
});

class oauth_controller {
  //* Google OAuth callback
  async google_callback(req, res) {
    try {
      const { token } = req.body;

      if (!token) {
        return error_response(res, {
          status: 400,
          message: "Google token is required",
        });
      }

      //* Verify Google token and extract user info
      const oauth_data = await oauth_service.verify_google_token(token);

      //* Find or create user
      const user = await oauth_service.find_or_create_oauth_user(oauth_data);

      //* Generate tokens - same format as normal auth
      const {
        access_token,
        refresh_token,
        access_token_expires_in,
        user: user_info,
      } = await oauth_service.generate_oauth_tokens(user);

      //* Set refresh token in HttpOnly cookie
      res.cookie("refreshToken", refresh_token, get_cookie_options());

      logger.info({
        context: "oauth.controller.google_callback",
        message: "Google login successful",
        user_id: user._id,
      });

      return success_response(res, {
        status: 200,
        message: "Google login successful",
        data: {
          user: user_info,
          access_token,
          access_token_expires_in,
        },
      });
    } catch (error) {
      logger.error({
        context: "oauth.controller.google_callback",
        message: "Google OAuth callback failed",
        error: error.message,
      });

      return error_response(res, {
        status: 401,
        message: error.message || "Google authentication failed",
      });
    }
  }

  //* Microsoft OAuth callback
  async microsoft_callback(req, res) {
    try {
      const { token } = req.body;

      if (!token) {
        return error_response(res, {
          status: 400,
          message: "Microsoft token is required",
        });
      }

      //* Verify Microsoft token and extract user info
      const oauth_data = await oauth_service.verify_microsoft_token(token);

      //* Find or create user
      const user = await oauth_service.find_or_create_oauth_user(oauth_data);

      //* Generate tokens - same format as normal auth
      const {
        access_token,
        refresh_token,
        access_token_expires_in,
        user: user_info,
      } = await oauth_service.generate_oauth_tokens(user);

      //* Set refresh token in HttpOnly cookie
      res.cookie("refreshToken", refresh_token, get_cookie_options());

      logger.info({
        context: "oauth.controller.microsoft_callback",
        message: "Microsoft login successful",
        user_id: user._id,
      });

      return success_response(res, {
        status: 200,
        message: "Microsoft login successful",
        data: {
          user: user_info,
          access_token,
          access_token_expires_in,
        },
      });
    } catch (error) {
      logger.error({
        context: "oauth.controller.microsoft_callback",
        message: "Microsoft OAuth callback failed",
        error: error.message,
      });

      return error_response(res, {
        status: 401,
        message: error.message || "Microsoft authentication failed",
      });
    }
  }
}

module.exports = new oauth_controller();
