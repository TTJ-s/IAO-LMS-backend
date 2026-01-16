const axios = require("axios");
const { User } = require("../../models");
const logger = require("../../utils/logger");
const auth_service = require("./auth.service");

class oauth_service {
  //* Verify Google token and extract user info
  async verify_google_token(token) {
    try {
      const response = await axios.get(
        `https://www.googleapis.com/oauth2/v2/userinfo`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { email, name, picture, id } = response.data;

      logger.info({
        context: "oauth.service.verify_google_token",
        message: "Google token verified successfully",
        email,
      });

      return {
        email,
        name,
        picture,
        provider: "google",
        provider_id: id,
      };
    } catch (error) {
      logger.error({
        context: "oauth.service.verify_google_token",
        message: "Failed to verify Google token",
        error: error.message,
      });

      throw new Error("Invalid Google token");
    }
  }

  //* Verify Microsoft token and extract user info
  async verify_microsoft_token(token) {
    try {
      const response = await axios.get(`https://graph.microsoft.com/v1.0/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const { mail, id, userPrincipalName } = response.data;
      const email = mail || userPrincipalName;

      logger.info({
        context: "oauth.service.verify_microsoft_token",
        message: "Microsoft token verified successfully",
        email,
      });

      return {
        email,
        provider: "microsoft",
        provider_id: id,
      };
    } catch (error) {
      logger.error({
        context: "oauth.service.verify_microsoft_token",
        message: "Failed to verify Microsoft token",
        error: error.message,
      });

      throw new Error("Invalid Microsoft token");
    }
  }

  //* Find or create user from OAuth provider
  async find_or_create_oauth_user(oauth_data) {
    try {
      const { email, provider, provider_id } = oauth_data;

      //* Check if user exists
      let user = await User.findOne({ email });

      if (user) {
        //* Update OAuth provider info if not already linked
        if (!user.oauth_providers) {
          user.oauth_providers = {};
        }

        if (!user.oauth_providers[provider]) {
          user.oauth_providers[provider] = {
            provider_id,
            connected_at: new Date(),
          };
          await user.save();

          logger.info({
            context: "oauth.service.find_or_create_oauth_user",
            message: `${provider} provider linked to existing user`,
            email,
          });
        }

        return user;
      }

      //* Create new user from OAuth
      user = new User({
        email,
        role: "student",
        oauth_providers: {
          [provider]: {
            provider_id,
            connected_at: new Date(),
          },
        },
        is_verified: true, //* OAuth users are considered verified
      });

      await user.save();

      logger.info({
        context: "oauth.service.find_or_create_oauth_user",
        message: `New user created via ${provider} OAuth`,
        email,
        user_id: user._id,
      });

      return user;
    } catch (error) {
      logger.error({
        context: "oauth.service.find_or_create_oauth_user",
        message: "Failed to find or create OAuth user",
        error: error.message,
      });

      throw error;
    }
  }

  //* Generate tokens for OAuth user
  async generate_oauth_tokens(user) {
    try {
      const { access_token, refresh_token } =
        await auth_service.generate_tokens(
          user._id.toString(),
          user.role,
          user.token_version
        );

      //* Update last login
      user.last_login = new Date();
      await user.save();

      const access_expires_in = process.env.JWT_ACCESS_EXPIRES_IN || "15m";

      logger.info({
        context: "oauth.service.generate_oauth_tokens",
        message: "OAuth tokens generated",
        user_id: user._id,
      });

      return {
        access_token,
        refresh_token,
        access_token_expires_in: access_expires_in,
        user: {
          _id: user._id,
          role: user.role,
          status: user.status,
        },
      };
    } catch (error) {
      logger.error({
        context: "oauth.service.generate_oauth_tokens",
        message: "Failed to generate OAuth tokens",
        error: error.message,
      });

      throw error;
    }
  }
}

module.exports = new oauth_service();
