const validation = require("./country.validation");
const country_service = require("./country.service");
const { error_response, success_response } = require("../../../utils/response");
const logger = require("../../../utils/logger");

class country_controller {
  async create_country(req, res) {
    try {
      const { error, value } = validation.create_country_validation.validate(
        req.body
      );
      if (error) {
        logger.warn({
          context: "country.controller.create_country",
          message: error.details[0].message,
          errors: error.details,
        });

        return error_response(res, {
          status: 400,
          message: error.details[0].message,
          errors: error.details,
        });
      }

      const existing_country = await country_service.find_by_name(
        value.country_name
      );
      if (existing_country) {
        logger.warn({
          context: "country.controller.create_country",
          message: "Country already exists",
        });

        return error_response(res, {
          status: 400,
          message: "Country already exists",
        });
      }
      const data = await country_service.create(value);
      return success_response(res, {
        status: 201,
        message: "Country created successfully",
        data,
      });
    } catch (error) {
      logger.error({
        context: "country.controller.create_country",
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

  async get_countries(req, res) {
    try {
      const [data, total_count] = await Promise.all([
        country_service.find_all(),
        country_service.total_count(),
      ]);
      return success_response(res, {
        status: 200,
        message: "Countries fetched successfully",
        data,
        total_count,
      });
    } catch (error) {
      logger.error({
        context: "country.controller.get_countries",
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

  async update_country(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return error_response(res, {
          status: 400,
          message: "Country ID is required",
        });
      }
      const { error, value } = validation.update_country_validation.validate(
        req.body
      );
      if (error) {
        logger.warn({
          context: "country.controller.update_country",
          message: error.details[0].message,
          errors: error.details,
        });

        return error_response(res, {
          status: 400,
          message: error.details[0].message,
          errors: error.details,
        });
      }

      const existing_country = await country_service.find_by_id(id);
      if (!existing_country) {
        logger.warn({
          context: "country.controller.update_country",
          message: "Country not found",
        });

        return error_response(res, {
          status: 404,
          message: "Country not found",
        });
      }

      const data = await country_service.update(id, value);
      return success_response(res, {
        status: 200,
        message: "Country updated successfully",
        data,
      });
    } catch (error) {
      logger.error({
        context: "country.controller.update_country",
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

  async delete_country(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return error_response(res, {
          status: 400,
          message: "Country ID is required",
        });
      }
      const data = await country_service.delete(id);
      return success_response(res, {
        status: 200,
        message: "Country deleted successfully",
        data,
      });
    } catch (error) {
      logger.error({
        context: "country.controller.delete_country",
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

module.exports = new country_controller();
