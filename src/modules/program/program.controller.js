const validation = require("./program.validation");
const program_service = require("./program.service");
const logger = require("../../utils/logger");
const { error_response, success_response } = require("../../utils/response");
const { generate_counter } = require("../../utils/generate_counter");

class program_controller {
  async create(req, res) {
    try {
      const { error, value } = validation.create_program_validation.validate(
        req.body
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
        value.program_name
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
        req.body
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
}

module.exports = new program_controller();
