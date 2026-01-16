const jwt = require("jsonwebtoken");
const { error_response } = require("../utils/response");
const logger = require("../utils/logger");
const { User } = require("../models");

//* Verify JWT access token and attach user to request
const verify_jwt = async (req, res, next) => {
  try {
    //* Extract token from Authorization header (Bearer scheme)
    const authorization_header = req.headers.authorization;

    if (!authorization_header || !authorization_header.startsWith("Bearer ")) {
      logger.warn({
        context: "auth.middleware.verify_jwt",
        message: "Missing or invalid Authorization header format",
      });

      return error_response(res, {
        status: 401,
        message: "Unauthorized: Missing or invalid token format",
      });
    }

    //* Extract token (everything after "Bearer ")
    const token = authorization_header.substring(7);

    //* Verify JWT signature and expiration
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (jwt_error) {
      if (jwt_error.name === "TokenExpiredError") {
        logger.info({
          context: "auth.middleware.verify_jwt",
          message: "Access token expired",
          user_id: jwt_error.decoded?.sub,
        });

        return error_response(res, {
          status: 401,
          message: "Unauthorized: Access token expired. Please refresh.",
        });
      } else if (jwt_error.name === "JsonWebTokenError") {
        logger.warn({
          context: "auth.middleware.verify_jwt",
          message: "Invalid token signature or format",
        });

        return error_response(res, {
          status: 401,
          message: "Unauthorized: Invalid token",
        });
      }

      throw jwt_error;
    }

    //* Extract claims (payload) from decoded token
    const { sub: user_id, role, token_version, iat } = decoded;

    //* Validate required claims
    if (!user_id || !role || token_version === undefined) {
      logger.warn({
        context: "auth.middleware.verify_jwt",
        message: "Token missing required claims",
        user_id,
      });

      return error_response(res, {
        status: 401,
        message: "Unauthorized: Invalid token claims",
      });
    }

    //* Fetch user from database to verify
    const user = await User.findById(user_id).select(
      "_id role status token_version"
    );

    if (!user) {
      logger.warn({
        context: "auth.middleware.verify_jwt",
        message: "Token user not found or deleted",
        user_id,
      });

      return error_response(res, {
        status: 401,
        message: "Unauthorized: User not found",
      });
    }

    if (user.status !== "active") {
      logger.warn({
        context: "auth.middleware.verify_jwt",
        message: "User account inactive or deleted",
        user_id,
        user_status: user.status,
      });

      return error_response(res, {
        status: 403,
        message: "Forbidden: User account is not active",
      });
    }

    //* Token revocation check: verify token_version matches
    if (user.token_version !== token_version) {
      logger.info({
        context: "auth.middleware.verify_jwt",
        message: "Token revoked (version mismatch)",
        user_id,
        stored_version: user.token_version,
        token_version,
      });

      return error_response(res, {
        status: 401,
        message: "Unauthorized: Token has been revoked. Please log in again.",
      });
    }

    //* Attach user info to request for downstream handlers
    req.user = {
      _id: user._id,
      role: user.role,
      token_version: user.token_version,
      issued_at: new Date(iat * 1000), //* Convert Unix timestamp to Date
    };

    logger.debug({
      context: "auth.middleware.verify_jwt",
      message: "Token verified successfully",
      user_id: req.user._id,
      user_role: req.user.role,
    });

    next();
  } catch (error) {
    logger.error({
      context: "auth.middleware.verify_jwt",
      message: "Unexpected error during JWT verification",
      error: error.message,
    });

    return error_response(res, {
      status: 500,
      message: "Internal server error during authentication",
    });
  }
};

module.exports = {
  verify_jwt,
};
