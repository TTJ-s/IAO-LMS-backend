const moment = require("moment-timezone");
const validation = require("./intake.validation");
const intake_service = require("./intake.service");
const logger = require("../../utils/logger");
const { error_response, success_response } = require("../../utils/response");
const { generate_counter } = require("../../utils/generate_counter");

class intake_controller {
  async create_intake(req, res) {
    try {
      const { error, value } = validation.create_intake_validation.validate(
        req.body,
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

      if (value.end_date) {
        value.end_date = moment(value.end_date).endOf("day").toDate();
      }

      if (value.registration_deadline) {
        value.end_date = moment(value.registration_deadline)
          .endOf("day")
          .toDate();
      }
      let payload = [];
      for (let i = 0; i < value.program.length; i++) {
        const counter = await generate_counter("intake");
        const padded_counter = String(counter).padStart(2, "0");
        const uid = `IN-${padded_counter}`;
        const program = await intake_service.find_program_by_id(
          value.program[i],
        );
        const intake_end_date = moment
          .tz(value.start_date, "YYYY-MM-DD", "UTC")
          .add(program.year, "years")
          .format("YYYY-MM-DD");
        const name = intake_service.generate_intake_name(
          program.name,
          value.start_date,
          intake_end_date,
        );
        payload.push({
          uid,
          name,
          program: value.program[i],
          academic: value.academic,
          start_date: value.start_date,
          end_date: intake_end_date,
          registration_deadline: value.registration_deadline,
          admission_fee: value.admission_fee,
          student_per_batch: value.student_per_batch,
          max_student_enrollment: value.max_student_enrollment,
        });
      }
      const data = await intake_service.create_many(payload);
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

  async get_intake(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return error_response(res, {
          status: 400,
          message: "Intake ID is required",
        });
      }
      const data = await intake_service.find_intake_by_id(id);
      if (!data) {
        return error_response(res, {
          status: 404,
          message: "Intake not found",
        });
      }

      return success_response(res, {
        status: 200,
        message: "Intake found successfully",
        data,
      });
    } catch (error) {
      logger.error({
        context: "intake.controller.get_intake",
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
        req.body,
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

  async get_active_program_by_id(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return error_response(res, {
          status: 400,
          message: "Intake ID is required",
        });
      }
      const data = await intake_service.find_active_intake_by_program_id(id);
      const mapped_data = {
        _id: data._id,
        name: data.name,
        program: data.program,
        start_date: data.start_date,
        end_date: data.end_date,
        registration_deadline: data.registration_deadline,
        status: data.status,
        admission_fee: data.admission_fee,
        currency: data.program?.city?.country?.currency,
      };
      return success_response(res, {
        status: 200,
        message: "Intake found successfully",
        data: mapped_data,
      });
    } catch (error) {
      logger.error({
        context: "intake.controller.get_active_program_by_id",
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

  async get_batches_by_intake_id(req, res) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const filters = {
        intake: id,
      };
      const options = {
        page,
        limit,
      };
      const sort = {};
      if (!id) {
        return error_response(res, {
          status: 400,
          message: "Intake ID is required",
        });
      }
      const [data, total_count] = await Promise.all([
        intake_service.find_all_batches_by_intake_id(filters, options, sort),
        intake_service.total_count_batches_by_intake_id(filters),
      ]);
      return success_response(res, {
        status: 200,
        message: "Batches found successfully",
        data,
        total_count,
      });
    } catch (error) {
      logger.error({
        context: "intake.controller.get_batches_by_intake_id",
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

  async get_enrollments_by_intake_id(req, res) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const filters = {};
      const options = {
        page,
        limit,
      };
      const sort = {};
      if (!id) {
        return error_response(res, {
          status: 400,
          message: "Intake ID is required",
        });
      }
      const [data, total_count] = await Promise.all([
        intake_service.find_all_enrollments_by_intake_id(
          id,
          filters,
          options,
          sort,
        ),
        intake_service.total_count_enrollments_by_intake_id(id, filters),
      ]);
      return success_response(res, {
        status: 200,
        message: "Enrollments found successfully",
        data,
        total_count,
      });
    } catch (error) {
      logger.error({
        context: "intake.controller.get_enrollments_by_intake_id",
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

  async get_batch(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return error_response(res, {
          status: 400,
          message: "Batch ID is required",
        });
      }
      const data = await intake_service.find_batch_by_id(id);
      return success_response(res, {
        status: 200,
        message: "Batch found successfully",
        data,
      });
    } catch (error) {
      logger.error({
        context: "intake.controller.get_batch",
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

  async get_batch_students(req, res) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const filters = {
        batch: id,
      };
      const options = {
        page,
        limit,
      };
      const sort = {};
      if (!id) {
        return error_response(res, {
          status: 400,
          message: "Batch ID is required",
        });
      }
      const [data, total_count] = await Promise.all([
        intake_service.find_batch_students_by_batch_id(filters, options, sort),
        intake_service.total_count_batch_students_by_batch_id(filters),
      ]);
      return success_response(res, {
        status: 200,
        message: "Batch students found successfully",
        data,
        total_count,
      });
    } catch (error) {
      logger.error({
        context: "intake.controller.get_batch_students",
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

  async get_student_by_app_id(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return error_response(res, {
          status: 400,
          message: "Application ID is required",
        });
      }
      const data = await intake_service.find_student_by_id(id);
      return success_response(res, {
        status: 200,
        message: "Student found successfully",
        data,
      });
    } catch (error) {
      logger.error({
        context: "intake.controller.get_student",
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
