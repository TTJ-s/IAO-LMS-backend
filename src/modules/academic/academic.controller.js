const validation = require("./academic.validation");
const academic_service = require("./academic.service");
const logger = require("../../utils/logger");
const { error_response, success_response } = require("../../utils/response");
const { generate_counter } = require("../../utils/generate_counter");

class academic_controller {
  async create_academic(req, res) {
    try {
      const { error, value } = validation.create_academic_validation.validate(
        req.body,
      );
      if (error) {
        logger.warn({
          context: "academic.controller.create_academic",
          message: error.details[0].message,
          errors: error.details,
        });

        return error_response(res, {
          status: 400,
          message: error.details[0].message,
          errors: error.details,
        });
      }
      const existing_academic = await academic_service.find_by_name(
        value.academic_name,
      );
      if (existing_academic) {
        logger.warn({
          context: "academic.controller.create_academic",
          message: "Academic already exists",
        });

        return error_response(res, {
          status: 400,
          message: "Academic already exists",
        });
      }

      const academic = await academic_service.create(value);
      return success_response(res, {
        status: 200,
        message: "Academic created successfully",
        data: academic,
      });
    } catch (error) {
      logger.error({
        context: "academic.controller.create_academic",
        message: error.message,
        errors: error.stack,
      });
      return error_response(res, {
        status: 400,
        message: error.message,
        errors: error.stack,
      });
    }
  }

  async get_academics(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const filters = {};
      const options = {
        page,
        limit,
      };
      const sort = {};
      const [data, total_count] = await Promise.all([
        academic_service.find_all(filters, options, sort),
        academic_service.total_count(filters),
      ]);
      return success_response(res, {
        status: 200,
        message: "Academics found successfully",
        data,
        total_count,
      });
    } catch (error) {
      logger.error({
        context: "academic.controller.find_academics",
        message: error.message,
        errors: error.stack,
      });
      return error_response(res, {
        status: 400,
        message: error.message,
        errors: error.stack,
      });
    }
  }

  async update_academic(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return error_response(res, {
          status: 400,
          message: "Academic ID is required",
        });
      }
      const { error, value } = validation.update_academic_validation.validate(
        req.body,
      );
      if (error) {
        logger.warn({
          context: "academic.controller.update_academic",
          message: error.details[0].message,
          errors: error.details,
        });

        return error_response(res, {
          status: 400,
          message: error.details[0].message,
          errors: error.details,
        });
      }
      const data = await academic_service.update(id, value);
      return success_response(res, {
        status: 200,
        message: "Academic updated successfully",
        data,
      });
    } catch (error) {
      logger.error({
        context: "academic.controller.update_academic",
        message: error.message,
        errors: error.stack,
      });
      return error_response(res, {
        status: 400,
        message: error.message,
        errors: error.stack,
      });
    }
  }

  async duplicate_academic(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return error_response(res, {
          status: 400,
          message: "Academic ID is required",
        });
      }
      const academic = await academic_service.find_by_id(id);
      if (!academic) {
        return error_response(res, {
          status: 404,
          message: "Academic not found",
        });
      }
      const new_payload = {
        name: `${academic.name} (copy)`,
        registartion_start_date: academic.registartion_start_date,
        registartion_end_date: academic.registartion_end_date,
      };

      const new_academic = await academic_service.create(new_payload);
      const intakes = await academic_service.find_intakes_by_academic_id(id);
      const payload = [];
      for (let i = 0; i < intakes.length; i++) {
        const counter = await generate_counter("intake");
        const padded_counter = String(counter).padStart(2, "0");
        const uid = `IN-${padded_counter}`;
        payload.push({
          uid,
          name: `${intakes[i].name} (copy)`,
          academic: new_academic._id,
          program: intakes[i].program,
          admission_fee: intakes[i].admission_fee,
          start_date: intakes[i].start_date,
          end_date: intakes[i].end_date,
          registration_deadline: intakes[i].registration_deadline,
          student_per_batch: intakes[i].student_per_batch,
          max_student_enrollment: intakes[i].max_student_enrollment,
        });
      }
      await academic_service.duplicate_intakes(payload);
      return success_response(res, {
        status: 200,
        message: "Academic duplicated successfully",
        data: new_academic,
      });
    } catch (error) {
      logger.error({
        context: "academic.controller.duplicate_academic",
        message: error.message,
        errors: error.stack,
      });
      return error_response(res, {
        status: 400,
        message: error.message,
        errors: error.stack,
      });
    }
  }
}

module.exports = new academic_controller();
