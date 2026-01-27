const validation = require("./program.validation");
const program_service = require("./program.service");
const logger = require("../../utils/logger");
const { error_response, success_response } = require("../../utils/response");
const { generate_counter } = require("../../utils/generate_counter");

class program_controller {
  async create(req, res) {
    try {
      const { error, value } = validation.create_program_validation.validate(
        req.body,
      );
      if (error) {
        logger.warn({
          context: "program.controller.create",
          message: error.details[0].message,
          errors: error.details,
        });

        return error_response(res, {
          status: 400,
          message: error.details[0].message,
          errors: error.details,
        });
      }

      const existing_program = await program_service.find_by_name(
        value.program_name,
      );
      if (existing_program) {
        logger.warn({
          context: "program.controller.create",
          message: "Program already exists",
        });

        return error_response(res, {
          status: 400,
          message: "Program already exists",
        });
      }

      const counter = await generate_counter("program");
      const padded_counter = String(counter).padStart(2, "0");
      const uid = `PR-${padded_counter}`;
      value.uid = uid;

      const data = await program_service.create(value);
      return success_response(res, {
        status: 201,
        message: "Program created successfully",
        data,
      });
    } catch (error) {
      logger.error({
        context: "program.controller.create",
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

  async duplicate_program(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return error_response(res, {
          status: 400,
          message: "Program ID is required",
        });
      }
      const program = await program_service.find_by_id(id);
      if (!program) {
        return error_response(res, {
          status: 400,
          message: "Program not found",
        });
      }

      const counter = await generate_counter("program");
      const padded_counter = String(counter).padStart(2, "0");
      const uid = `PR-${padded_counter}`;

      const payload = {
        uid,
        name: `Copy of ${program.name}`,
        description: `Copy of ${program.description}`,
        program_type: program.program_type,
        year: program.year,
        city: program.city,
        language: program.language,
      };

      const data = await program_service.create(payload);
      const components =
        await program_service.find_components_by_program_id(id);
      if (components.length > 0) {
        const payload = [];
        for (let i = 0; i < components.length; i++) {
          const type_prefixes = {
            module: "MD",
            app: "AP",
            resource: "RS",
            exam: "EX",
          };

          const counter = await generate_counter(
            `component_${components[i].type}`,
          );
          const padded_counter = String(counter).padStart(2, "0");
          const uid = `${type_prefixes[components[i].type]}-${padded_counter}`;

          const component_data = {
            program: data._id,
            uid: uid,
            type: components[i].type,
            name: components[i].name,
            year: components[i].year,
            files: components[i].files,
            status: components[i].status,
          };
          if (components[i].type === "module") {
            component_data.amount = components[i].amount;
            component_data.currency = components[i].currency;
          } else if (components[i].type === "app") {
            component_data.submission_deadline =
              components[i].submission_deadline;
            component_data.instruction = components[i].instruction;
            component_data.submissions = components[i].submissions;
          }
          payload.push(component_data);
        }
        await program_service.duplicate_component(payload);
      }
      return success_response(res, {
        status: 201,
        message: "Program created successfully",
        data,
      });
    } catch (error) {
      logger.error({
        context: "program.controller.duplicate_program",
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

  async get_programs(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const filters = {};
      const options = {
        page,
        limit,
      };
      const sort = {};
      const [data, total_count] = await Promise.all([
        program_service.find_all(filters, options, sort),
        program_service.total_count(filters),
      ]);
      return success_response(res, {
        status: 200,
        message: "Programs fetched successfully",
        data,
        total_count,
      });
    } catch (error) {
      logger.error({
        context: "program.controller.get_programs",
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

  async get_active_aprograms(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const filters = {
        status: true,
      };
      const options = {
        page,
        limit,
      };
      const sort = {};
      const [data, total_count] = await Promise.all([
        program_service.find_programs_with_intakes(filters, options, sort),
        program_service.total_count(filters),
      ]);
      return success_response(res, {
        status: 200,
        message: "Programs fetched successfully",
        data,
        total_count,
      });
    } catch (error) {
      logger.error({
        context: "program.controller.get_programs",
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

  async get_program(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return error_response(res, {
          status: 400,
          message: "Program ID is required",
        });
      }
      const data = await program_service.find_by_id(id);
      if (!data) {
        return error_response(res, {
          status: 404,
          message: "Program not found",
        });
      }
      return success_response(res, {
        status: 200,
        message: "Program fetched successfully",
        data,
      });
    } catch (error) {
      logger.error({
        context: "program.controller.get_program",
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

  async delete_program(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return error_response(res, {
          status: 400,
          message: "Program ID is required",
        });
      }
      const data = await program_service.delete(id);
      return success_response(res, {
        status: 200,
        message: "Program deleted successfully",
        data,
      });
    } catch (error) {
      logger.error({
        context: "program.controller.delete_program",
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

  async update_program(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return error_response(res, {
          status: 400,
          message: "Program ID is required",
        });
      }
      const { error, value } = validation.update_program_validation.validate(
        req.body,
      );
      if (error) {
        logger.warn({
          context: "program.controller.update_program",
          message: error.details[0].message,
          errors: error.details,
        });

        return error_response(res, {
          status: 400,
          message: error.details[0].message,
          errors: error.details,
        });
      }

      const existing_program = await program_service.find_by_id(id);
      if (!existing_program) {
        logger.warn({
          context: "program.controller.update_program",
          message: "Program not found",
        });

        return error_response(res, {
          status: 404,
          message: "Program not found",
        });
      }

      const data = await program_service.update(id, value);
      return success_response(res, {
        status: 200,
        message: "Program updated successfully",
        data,
      });
    } catch (error) {
      logger.error({
        context: "program.controller.update_program",
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
  async get_program_dropdown(req, res) {
    try {
      const filters = { status: true };
      const data = await program_service.find_for_dropdown(filters);
      return success_response(res, {
        status: 200,
        message: "Program fetched successfully",
        data,
      });
    } catch (error) {
      logger.error({
        context: "program.controller.get_program_dropdown",
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

module.exports = new program_controller();
