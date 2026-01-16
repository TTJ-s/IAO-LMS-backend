const moment = require("moment-timezone");
const validation = require("./intake.validation");
const intake_service = require("./intake.service");
const logger = require("../../utils/logger");
const { error_response, success_response } = require("../../utils/response");

class intake_controller {
  async create_intake(req, res) {
    try {
      const { error, value } = validation.create_intake_validation.validate(
        req.body
      );
      if (error) {
        logger.warn({
          context: "intake.controller.create_intake",
          message: error.details[0].message,
          errors: error.details,
        });

        return error_response(res, {
          status: 400,
          message: error.details[0].message,
          errors: error.details,
        });
      }

      const existing_intake = await intake_service.find_by_name(
        value.intake_name
      );
      if (existing_intake) {
        logger.warn({
          context: "intake.controller.create_intake",
          message: "Intake already exists",
        });

        return error_response(res, {
          status: 400,
          message: "Intake already exists",
        });
      }

      if (value.end_date) {
        value.end_date = moment(value.end_date).endOf("day").toDate();
      }

      if (value.registration_deadline) {
        value.end_date = moment(value.registration_deadline)
          .endOf("day")
          .toDate();
      }

      const data = await intake_service.create(value);
      return success_response(res, {
        status: 200,
        message: "Intake created successfully",
        data: data,
      });
    } catch (error) {
      logger.error({
        context: "intake.controller.create_intake",
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

  async get_intakes(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const filters = {};
      const options = {
        page,
        limit,
      };
      const sort = {};
      const [data, total_count] = await Promise.all([
        intake_service.find_all(filters, options, sort),
        intake_service.total_count(filters),
      ]);
      return success_response(res, {
        status: 200,
        message: "Intakes fetched successfully",
        data,
        total_count,
      });
    } catch (error) {
      logger.error({
        context: "intake.controller.get_intakes",
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

  async delete_intake(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return error_response(res, {
          status: 400,
          message: "Intake ID is required",
        });
      }
      const data = await intake_service.delete(id);
      return success_response(res, {
        status: 200,
        message: "Intake deleted successfully",
        data,
      });
    } catch (error) {
      logger.error({
        context: "intake.controller.delete_intake",
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

  async update_intake(req, res) {
    try {
      const { error, value } = validation.update_intake_validation.validate(
        req.body
      );
      if (error) {
        logger.warn({
          context: "intake.controller.update_intake",
          message: error.details[0].message,
          errors: error.details,
        });

        return error_response(res, {
          status: 400,
          message: error.details[0].message,
          errors: error.details,
        });
      }
      const { id } = req.params;
      if (!id) {
        return error_response(res, {
          status: 400,
          message: "Intake ID is required",
        });
      }

      const existing_intake = await intake_service.find_by_id(id);
      if (!existing_intake) {
        logger.warn({
          context: "intake.controller.update_intake",
          message: "Intake not found",
        });

        return error_response(res, {
          status: 400,
          message: "Intake not found",
        });
      }

      const data = await intake_service.update(id, value);
      return success_response(res, {
        status: 200,
        message: "Intake updated successfully",
        data,
      });
    } catch (error) {
      logger.error({
        context: "intake.controller.update_intake",
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

module.exports = new intake_controller();
