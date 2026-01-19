const validation = require("./application.validation");
const application_service = require("./application.service");
const batch_service = require("../application/batch.service");
const logger = require("../../utils/logger");
const moment = require("moment-timezone");
const { error_response, success_response } = require("../../utils/response");
const { generate_counter } = require("../../utils/generate_counter");

class application_controller {
  async create_application(req, res) {
    try {
      const { error, value } =
        validation.create_application_validation.validate(req.body);
      if (error) {
        logger.warn({
          context: "application.controller.create_application",
          message: error.details[0].message,
          errors: error.details,
        });

        return error_response(res, {
          status: 400,
          message: error.details[0].message,
          errors: error.details,
        });
      }
      const existing_application = await application_service.find_by_user(
        value.user,
      );
      if (existing_application) {
        logger.warn({
          context: "application.controller.create_application",
          message: "Application already exists",
        });

        return error_response(res, {
          status: 400,
          message: "Application already exists",
        });
      }
      value.decision_date = moment().add(7, "days").toDate();
      if (value.is_paymentable === false) {
        value.payment_status = "paid";
      }
      const counter = await generate_counter("application");
      const padded_counter = String(counter).padStart(2, "0");
      const uid = `AP-${padded_counter}`;
      value.user = req.user._id;
      value.uid = uid;
      const data = await application_service.create(value);
      return success_response(res, {
        status: 200,
        message: "Application created successfully",
        data,
      });
    } catch (error) {
      logger.error({
        context: "application.controller.create_application",
        message: error.message,
        errors: error.stack,
      });

      return error_response(res, {
        status: 500,
        message: error.message,
        errors: error.stack,
      });
    }
  }

  async update_application(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return error_response(res, {
          status: 400,
          message: "Application ID is required",
        });
      }
      const { error, value } =
        validation.update_application_validation.validate(req.body);
      if (error) {
        logger.warn({
          context: "application.controller.update_application",
          message: error.details[0].message,
          errors: error.details,
        });

        return error_response(res, {
          status: 400,
          message: error.details[0].message,
          errors: error.details,
        });
      }
      const existing_application = await application_service.find_by_id(id);
      if (!existing_application) {
        logger.warn({
          context: "application.controller.update_application",
          message: "Application not found",
        });

        return error_response(res, {
          status: 400,
          message: "Application not found",
        });
      }
      const data = await application_service.update(id, value);
      return success_response(res, {
        status: 200,
        message: "Application updated successfully",
        data,
      });
    } catch (error) {
      logger.error({
        context: "application.controller.update_application",
        message: error.message,
        errors: error.stack,
      });

      return error_response(res, {
        status: 500,
        message: error.message,
        errors: error.stack,
      });
    }
  }

  async get_applications(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const filters = {};
      const options = {
        page,
        limit,
      };
      const sort = {};
      const [data, total_count] = await Promise.all([
        application_service.find_all(filters, options, sort),
        application_service.total_count(filters),
      ]);
      return success_response(res, {
        status: 200,
        message: "Applications found successfully",
        data,
        total_count,
      });
    } catch (error) {
      logger.error({
        context: "application.controller.find_applications",
        message: error.message,
        errors: error.stack,
      });

      return error_response(res, {
        status: 500,
        message: error.message,
        errors: error.stack,
      });
    }
  }

  async get_my_application(req, res) {
    try {
      const data = await application_service.find_by_user(req.user.id);

      if (!data) {
        return error_response(res, {
          status: 404,
          message: "Applications not found",
        });
      }

      return success_response(res, {
        status: 200,
        message: "Applications found successfully",
        data,
      });
    } catch (error) {
      logger.error({
        context: "application.controller.find_applications",
        message: error.message,
        errors: error.stack,
      });

      return error_response(res, {
        status: 500,
        message: error.message,
        errors: error.stack,
      });
    }
  }

  async find_application(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return error_response(res, {
          status: 400,
          message: "Application ID is required",
        });
      }
      const data = await application_service.find_by_id(id);
      if (!data) {
        return error_response(res, {
          status: 404,
          message: "Application not found",
        });
      }
      return success_response(res, {
        status: 200,
        message: "Application found successfully",
        data,
      });
    } catch (error) {
      logger.error({
        context: "application.controller.find_application",
        message: error.message,
        errors: error.stack,
      });

      return error_response(res, {
        status: 500,
        message: error.message,
        errors: error.stack,
      });
    }
  }

  async update_application_status(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return error_response(res, {
          status: 400,
          message: "Application ID is required",
        });
      }
      const { error, value } =
        validation.update_application_status_validation.validate(req.body);
      if (error) {
        logger.warn({
          context: "application.controller.update_application_status",
          message: error.details[0].message,
          errors: error.details,
        });

        return error_response(res, {
          status: 400,
          message: error.details[0].message,
          errors: error.details,
        });
      }
      const existing_application = await application_service.find_by_id(id);
      if (!existing_application) {
        logger.warn({
          context: "application.controller.update_application",
          message: "Application not found",
        });

        return error_response(res, {
          status: 400,
          message: "Application not found",
        });
      }
      if (
        value.status === "approved" &&
        existing_application.payment_status === "paid"
      ) {
        const find_existing_batch = await batch_service.find_batch_by_intake(
          existing_application.intake,
        );
        if (find_existing_batch.length === 0) {
          //TODO: create batch for this intake
        } else {
          //TODO: assign student to batch
        }
      }
      const data = await application_service.update(id, value);
      return success_response(res, {
        status: 200,
        message: "Application status updated successfully",
        data,
      });
    } catch (error) {
      logger.error({
        context: "application.controller.update_application_status",
        message: error.message,
        errors: error.stack,
      });

      return error_response(res, {
        status: 500,
        message: error.message,
        errors: error.stack,
      });
    }
  }
}

module.exports = new application_controller();
