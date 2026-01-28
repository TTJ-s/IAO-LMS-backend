const validation = require("./components.validation");
const components_service = require("./components.service");
const logger = require("../../utils/logger");
const { error_response, success_response } = require("../../utils/response");
const { generate_counter } = require("../../utils/generate_counter");

class components_controller {
  async create_component(req, res) {
    try {
      const { type } = req.body;

      const validation_map = {
        module: validation.create_module_component_validation,
        app: validation.create_app_component_validation,
        resource: validation.create_resource_component_validation,
      };

      if (!validation_map[type]) {
        logger.warn({
          context: "components.controller.create_component",
          message: `Invalid component type: ${type}`,
        });
        return error_response(res, {
          status: 400,
          message:
            "Invalid component type. Must be 'module', 'app', or 'resource'.",
        });
      }

      const { error, value } = validation_map[type].validate(req.body);

      if (error) {
        logger.warn({
          context: "components.controller.create_component",
          message: error.details[0].message,
          errors: error.details,
        });
        return error_response(res, {
          status: 400,
          message: error.details[0].message,
          errors: error.details,
        });
      }

      const existing_component = await components_service.find_by_name(
        value.name,
      );

      if (existing_component) {
        logger.warn({
          context: "components.controller.create_component",
          message: "Component already exists",
        });
        return error_response(res, {
          status: 400,
          message: "Component already exists",
        });
      }

      if (type === "module") {
        value.currency = await components_service.find_currency_by_program_id(
          value.program,
        );
      }

      // Generate UID based on component type
      const type_prefixes = {
        module: "MD",
        app: "AP",
        resource: "RS",
        exam: "EX",
      };

      const counter = await generate_counter(`component_${type}`);
      const padded_counter = String(counter).padStart(2, "0");
      const uid = `${type_prefixes[type]}-${padded_counter}`;
      value.uid = uid;

      const data = await components_service.create(value);

      return success_response(res, {
        status: 201,
        message: "Component created successfully",
        data,
      });
    } catch (error) {
      logger.error({
        context: "components.controller.create_component",
        message: error.message,
        stack: error.stack,
      });

      return error_response(res, {
        status: 500,
        message: error.message,
        stack: error.stack,
      });
    }
  }

  async get_components_by_type(req, res) {
    try {
      const { type } = req.query;
      if (!type) {
        return error_response(res, {
          status: 400,
          message: "Type is required",
        });
      }
      const { page = 1, limit = 10, program, status } = req.query;
      const filters = {
        type,
      };
      if (program) filters.program = program;
      if (status) filters.status = status;
      const options = {
        page,
        limit,
      };
      const sort = {};
      const [data, total_count] = await Promise.all([
        components_service.find_all(filters, options, sort),
        components_service.total_count(filters),
      ]);
      return success_response(res, {
        status: 200,
        message: "Components found successfully",
        data,
        total_count,
      });
    } catch (error) {
      logger.error({
        context: "components.controller.get_components_by_type",
        message: error.message,
        stack: error.stack,
      });

      return error_response(res, {
        status: 500,
        message: error.message,
        stack: error.stack,
      });
    }
  }

  async get_components_dropdown(req, res) {
    try {
      const { type } = req.query;
      const filters = {
        type,
      };
      const data = await components_service.find_dropdown(filters);
      return success_response(res, {
        status: 200,
        message: "Components found successfully",
        data,
      });
    } catch (error) {
      logger.error({
        context: "components.controller.get_components_dropdown",
        message: error.message,
        stack: error.stack,
      });

      return error_response(res, {
        status: 500,
        message: error.message,
        stack: error.stack,
      });
    }
  }

  async get_component_by_id(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return error_response(res, {
          status: 400,
          message: "Component ID is required",
        });
      }
      const data = await components_service.find_by_id(id);
      if (!data) {
        return error_response(res, {
          status: 404,
          message: "Component not found",
        });
      }
      return success_response(res, {
        status: 200,
        message: "Component found successfully",
        data,
      });
    } catch (error) {
      logger.error({
        context: "components.controller.get_component_by_id",
        message: error.message,
        stack: error.stack,
      });

      return error_response(res, {
        status: 500,
        message: error.message,
        stack: error.stack,
      });
    }
  }

  async update_component(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return error_response(res, {
          status: 400,
          message: "Component ID is required",
        });
      }
      const { error, value } =
        validation.update_module_component_validation.validate(req.body);
      if (error) {
        logger.warn({
          context: "components.controller.update_component",
          message: error.details[0].message,
          errors: error.details,
        });

        return error_response(res, {
          status: 400,
          message: error.details[0].message,
          errors: error.details,
        });
      }
      const data = await components_service.update_by_id(id, value);
      return success_response(res, {
        status: 200,
        message: "Component updated successfully",
        data,
      });
    } catch (error) {
      logger.error({
        context: "components.controller.update_component",
        message: error.message,
        stack: error.stack,
      });

      return error_response(res, {
        status: 500,
        message: error.message,
        stack: error.stack,
      });
    }
  }
}

module.exports = new components_controller();
