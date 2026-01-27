//* Standard API response handler
//* GDPR-safe, consistent, and frontend-friendly

const is_development = process.env.NODE_ENV !== "production";

const success_response = (res, options = {}) => {
  const {
    status = 200,
    message = "Success",
    data = null,
    total_count = null,
  } = options;

  return res.status(status).json({
    success: true,
    message,
    data,
    total_count,
  });
};

const error_response = (res, options = {}) => {
  const {
    status = 500,
    message = "Something went wrong",
    errors = null,
  } = options;

  //* Only include error details in development mode
  //* In production, hide stack traces and internal error details
  const safe_errors = is_development ? errors : undefined;

  return res.status(status).json({
    success: false,
    message,
    ...(safe_errors && { errors: safe_errors }),
  });
};

module.exports = {
  success_response,
  error_response,
};
