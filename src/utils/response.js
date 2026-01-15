//* Standard API response handler
//* GDPR-safe, consistent, and frontend-friendly

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

  return res.status(status).json({
    success: false,
    message,
    errors,
  });
};

module.exports = {
  success_response,
  error_response,
};
