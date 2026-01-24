const validation = require("./language.validation");
const language_service = require("./language.service");
const logger = require("../../../utils/logger");
const { error_response, success_response } = require("../../../utils/response");

class language_controller {
  async create(req, res) {
    try {
      const { error, value } = validation.create_language_validation.validate(
        req.body
      );
      if (error) {
        logger.warn({
          context: "language.controller.create",
          message: error.details[0].message,
          errors: error.details,
        });

        return error_response(res, {
          status: 400,
          message: error.details[0].message,
          errors: error.details,
        });
      }

      const existing_language = await language_service.find_by_name(
        value.language_name
      );
      if (existing_language) {
        logger.warn({
          context: "language.controller.create",
          message: "Language already exists",
        });

        return error_response(res, {
          status: 400,
          message: "Language already exists",
        });
      }

      const data = await language_service.create(value);
      return success_response(res, {
        status: 201,
        message: "Language created successfully",
        data,
      });
    } catch (error) {
      logger.error({
        context: "language.controller.create",
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

  async get_languages(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const filters = {};
      const options = {
        page,
        limit,
      };
      const sort = {};
      const [data, total_count] = await Promise.all([
        language_service.find_all(filters, options, sort),
        language_service.total_count(filters),
      ]);
      return success_response(res, {
        status: 200,
        message: "Languages fetched successfully",
        data,
        total_count,
      });
    } catch (error) {
      logger.error({
        context: "language.controller.get_languages",
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

  async delete_language(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return error_response(res, {
          status: 400,
          message: "Language ID is required",
        });
      }
      const data = await language_service.delete(id);
      return success_response(res, {
        status: 200,
        message: "Language deleted successfully",
        data,
      });
    } catch (error) {
      logger.error({
        context: "language.controller.delete_language",
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

  async update_language(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return error_response(res, {
          status: 400,
          message: "Language ID is required",
        });
      }
      const { error, value } = validation.update_language_validation.validate(
        req.body
      );
      if (error) {
        logger.warn({
          context: "language.controller.update_language",
          message: error.details[0].message,
          errors: error.details,
        });

        return error_response(res, {
          status: 400,
          message: error.details[0].message,
          errors: error.details,
        });
      }
      const existing_language = await language_service.find_by_id(id);
      if (!existing_language) {
        logger.warn({
          context: "language.controller.update_language",
          message: "Language not found",
        });

        return error_response(res, {
          status: 400,
          message: "Language not found",
        });
      }
      const data = await language_service.update(id, value);
      return success_response(res, {
        status: 200,
        message: "Language updated successfully",
        data,
      });
    } catch (error) {
      logger.error({
        context: "language.controller.update_language",
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
  async get_language_dropdown(req, res) {
    try {
      const filters = { status: true };
      const data = await language_service.find_for_dropdown(filters);
      return success_response(res, {
        status: 200,
        message: "Language fetched successfully",
        data,
      });
    } catch (error) {
      logger.error({
        context: "language.controller.get_language_dropdown",
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

module.exports = new language_controller();
