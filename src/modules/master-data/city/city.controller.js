const validation = require("./city.validation");
const city_service = require("./city.service");
const logger = require("../../../utils/logger");
const { error_response, success_response } = require("../../../utils/response");

class city_controller {
  async create_city(req, res) {
    try {
      const { error, value } = validation.create_city_validation.validate(
        req.body
      );
      if (error) {
        logger.warn({
          context: "city.controller.create_city",
          message: error.details[0].message,
          errors: error.details,
        });

        return error_response(res, {
          status: 400,
          message: error.details[0].message,
          errors: error.details,
        });
      }

      const existing_city = await city_service.find_by_name(value.city_name);
      if (existing_city) {
        logger.warn({
          context: "city.controller.create_city",
          message: "City already exists",
        });

        return error_response(res, {
          status: 400,
          message: "City already exists",
        });
      }

      const data = await city_service.create(value);
      return success_response(res, {
        status: 201,
        message: "City created successfully",
        data,
      });
    } catch (error) {
      logger.error({
        context: "city.controller.create_city",
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

  async get_cities(req, res) {
    try {
      const { page = 1, limit = 10, country } = req.query;
      const filters = {};
      const options = {
        page,
        limit,
      };
      const sort = {};
      if (country) {
        filters.country = country;
      }
      const [data, total_count] = await Promise.all([
        city_service.find_all(filters, options, sort),
        city_service.total_count(filters),
      ]);
      return success_response(res, {
        status: 200,
        message: "Cities fetched successfully",
        data,
        total_count,
      });
    } catch (error) {
      logger.error({
        context: "city.controller.get_cities",
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

  async delete_city(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return error_response(res, {
          status: 400,
          message: "City ID is required",
        });
      }
      const data = await city_service.delete(id);
      return success_response(res, {
        status: 200,
        message: "City deleted successfully",
        data,
      });
    } catch (error) {
      logger.error({
        context: "city.controller.delete_city",
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

  async update_city(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return error_response(res, {
          status: 400,
          message: "City ID is required",
        });
      }
      const { error, value } = validation.update_city_validation.validate(
        req.body
      );
      if (error) {
        logger.warn({
          context: "city.controller.update_city",
          message: error.details[0].message,
          errors: error.details,
        });

        return error_response(res, {
          status: 400,
          message: error.details[0].message,
          errors: error.details,
        });
      }
      const existing_city = await city_service.find_by_id(id);
      if (!existing_city) {
        logger.warn({
          context: "city.controller.update_city",
          message: "City not found",
        });

        return error_response(res, {
          status: 404,
          message: "City not found",
        });
      }
      const data = await city_service.update(id, value);
      return success_response(res, {
        status: 200,
        message: "City updated successfully",
        data,
      });
    } catch (error) {
      logger.error({
        context: "city.controller.update_city",
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

  async get_cities_dropdown(req, res) {
    try {
      const { country } = req.query;
      const filters = { status: true };

      if (country) {
        filters.country = country;
      }

      const data = await city_service.find_for_dropdown(filters);
      return success_response(res, {
        status: 200,
        message: "Cities dropdown fetched successfully",
        data,
      });
    } catch (error) {
      logger.error({
        context: "city.controller.get_cities_dropdown",
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

module.exports = new city_controller();
