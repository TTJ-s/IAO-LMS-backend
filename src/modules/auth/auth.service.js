//* GDPR-Compliant JWT Token Generation Service
//* EU Fintech/EdTech Best Practice
//* No PII in tokens - only user_id, role, token_version

const jwt = require("jsonwebtoken");
const { User, Application } = require("../../models");
const logger = require("../../utils/logger");

class auth_service {
  async find_by_email(email) {
    const data = await User.findOne({ email });
    return data;
  }

  async add_otp(user_id, otp) {
    const data = await User.findOneAndUpdate(
      { _id: user_id },
      { otp },
      { new: true },
    );
    return data;
  }

  //* Generate short-lived Access Token (15 minutes)
  generate_access_token(user_id, role, token_version) {
    if (!user_id || !role || token_version === undefined) {
      throw new Error(
        "Missing required parameters for access token generation",
      );
    }

    const payload = {
      sub: user_id, //* Subject (user ID)
      role: role, //* Role for authorization checks
      token_version: token_version, //* For token revocation
    };

    const options = {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
      issuer: "iao-lms-backend",
      audience: "iao-lms-clients",
    };

    try {
      const token = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, options);

      logger.debug({
        context: "auth.service.generate_access_token",
        message: "Access token generated",
        user_id,
        role,
        expires_in: options.expiresIn,
      });

      return token;
    } catch (error) {
      logger.error({
        context: "auth.service.generate_access_token",
        message: "Failed to generate access token",
        error: error.message,
        user_id,
      });

      throw error;
    }
  }

  //* Generate long-lived Refresh Token (7 days)
  generate_refresh_token(user_id, role, token_version) {
    if (!user_id || !role || token_version === undefined) {
      throw new Error(
        "Missing required parameters for refresh token generation",
      );
    }

    const payload = {
      sub: user_id, //* Subject (user ID)
      role: role, //* Role (for consistency, though not used in refresh)
      token_version: token_version, //* For token revocation
    };

    const options = {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
      issuer: "iao-lms-backend",
      audience: "iao-lms-clients",
    };

    try {
      const token = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, options);

      logger.debug({
        context: "auth.service.generate_refresh_token",
        message: "Refresh token generated",
        user_id,
        expires_in: options.expiresIn,
      });

      return token;
    } catch (error) {
      logger.error({
        context: "auth.service.generate_refresh_token",
        message: "Failed to generate refresh token",
        error: error.message,
        user_id,
      });

      throw error;
    }
  }

  //* Generate both access and refresh tokens
  async generate_tokens(user_id, role, token_version = 0) {
    if (!user_id || !role) {
      throw new Error("User ID and role are required");
    }

    try {
      const access_token = this.generate_access_token(
        user_id,
        role,
        token_version,
      );
      const refresh_token = this.generate_refresh_token(
        user_id,
        role,
        token_version,
      );

      logger.info({
        context: "auth.service.generate_tokens",
        message: "Token pair generated successfully",
        user_id,
        role,
      });

      return {
        access_token,
        refresh_token,
      };
    } catch (error) {
      logger.error({
        context: "auth.service.generate_tokens",
        message: "Failed to generate token pair",
        error: error.message,
        user_id,
      });

      throw error;
    }
  }

  //* Revoke all existing tokens for a user
  async revoke_all_tokens(user_id) {
    if (!user_id) {
      throw new Error("User ID is required for token revocation");
    }

    try {
      const user = await User.findByIdAndUpdate(
        user_id,
        { $inc: { token_version: 1 } }, //* Increment version
        { new: true },
      );

      if (!user) {
        throw new Error(`User not found: ${user_id}`);
      }

      logger.info({
        context: "auth.service.revoke_all_tokens",
        message: "All tokens revoked for user",
        user_id,
        new_token_version: user.token_version,
      });

      return user;
    } catch (error) {
      logger.error({
        context: "auth.service.revoke_all_tokens",
        message: "Failed to revoke tokens",
        error: error.message,
        user_id,
      });

      throw error;
    }
  }

  //* Verify refresh token and return user info
  verify_refresh_token(token) {
    if (!token) {
      throw new Error("Refresh token is required");
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

      logger.debug({
        context: "auth.service.verify_refresh_token",
        message: "Refresh token verified successfully",
        user_id: decoded.sub,
      });

      return decoded;
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        logger.info({
          context: "auth.service.verify_refresh_token",
          message: "Refresh token expired",
        });
      } else {
        logger.warn({
          context: "auth.service.verify_refresh_token",
          message: "Invalid refresh token",
          error: error.name,
        });
      }

      throw error;
    }
  }

  async find_my_application(user_id) {
    const data = await Application.findOne({ user: user_id });
    return data;
  }

  async build_user_info(user) {
    try {
      const user_info = {
        _id: user._id,
        role: user.role,
        status: user.status,
      };

      if (user.role === "student") {
        const application = await this.find_my_application(user._id);

        if (user.previous_education) {
          user_info.current_step = 1;
        } else {
          user_info.current_step = 0;
        }

        if (application) {
          if (application.id_card?.url) {
            user_info.current_step = 2;
          } else {
            user_info.current_step = 1;
          }
          if (application.payment_status === "paid") {
            user_info.is_application_submitted = true;
          }
        } else {
          user_info.is_application_submitted = false;
        }
      }

      return user_info;
    } catch (error) {
      logger.error({
        context: "auth.service.build_user_info",
        message: "Error building user info",
        error: error.message,
        user_id: user._id,
      });
      throw error;
    }
  }
}

module.exports = new auth_service();
