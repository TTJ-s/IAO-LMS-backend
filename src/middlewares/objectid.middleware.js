const mongoose = require("mongoose");
const { error_response } = require("../utils/response");
const logger = require("../utils/logger");

//* Validate MongoDB ObjectId from request params
const validate_object_id = (param_name = "id") => {
  return (req, res, next) => {
    const id = req.params[param_name];

    if (!id) {
      return error_response(res, {
        status: 400,
        message: `${param_name} is required`,
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      logger.warn({
        context: "validate.middleware.validate_object_id",
        message: "Invalid ObjectId format",
        param: param_name,
        value: id,
        ip: req.ip,
      });

      return error_response(res, {
        status: 400,
        message: `Invalid ${param_name} format`,
      });
    }

    next();
  };
};

//* Validate multiple ObjectIds from request body
const validate_object_id_array = (field_name = "ids") => {
  return (req, res, next) => {
    const ids = req.body[field_name];

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return error_response(res, {
        status: 400,
        message: `${field_name} must be a non-empty array`,
      });
    }

    const invalid_ids = ids.filter(
      (id) => !mongoose.Types.ObjectId.isValid(id),
    );

    if (invalid_ids.length > 0) {
      logger.warn({
        context: "validate.middleware.validate_object_id_array",
        message: "Invalid ObjectId(s) in array",
        field: field_name,
        invalid_ids,
        ip: req.ip,
      });

      return error_response(res, {
        status: 400,
        message: `Invalid ID format in ${field_name}`,
      });
    }

    next();
  };
};

module.exports = {
  validate_object_id,
  validate_object_id_array,
};
