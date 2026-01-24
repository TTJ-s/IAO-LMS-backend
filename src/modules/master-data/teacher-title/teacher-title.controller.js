const validation = require("./teacher-title.validation");
const teacher_title_service = require("./teacher-title.service");
const logger = require("../../../utils/logger");
const { error_response, success_response } = require("../../../utils/response");

class teacher_title_controller {
  async create_teacher_title(req, res) {
    try {
      const { error, value } =
        validation.create_teacher_title_validation.validate(req.body);
      if (error) {
        logger.warn({
          context: "teacher-title.controller.create_teacher_title",
          message: error.details[0].message,
          errors: error.details,
        });

        return error_response(res, {
          status: 400,
          message: error.details[0].message,
          errors: error.details,
        });
      }

      const existing_teacher_title = await teacher_title_service.find_by_name(
        value.teacher_title_name,
      );
      if (existing_teacher_title) {
        logger.warn({
          context: "teacher-title.controller.create_teacher_title",
          message: "Teacher title already exists",
        });

        return error_response(res, {
          status: 400,
          message: "Teacher title already exists",
        });
      }

      const teacher_title = await teacher_title_service.create(value);
      return success_response(res, {
        status: 200,
        message: "Teacher title created successfully",
        data: teacher_title,
      });
    } catch (error) {
      logger.error({
        context: "teacher-title.controller.create_teacher_title",
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

  async get_teacher_titles(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const filters = {};
      const options = {
        page,
        limit,
      };
      const sort = {};
      const [data, total_count] = await Promise.all([
        teacher_title_service.find_all(filters, options, sort),
        teacher_title_service.total_count(filters),
      ]);
      return success_response(res, {
        status: 200,
        message: "Teacher titles fetched successfully",
        data,
        total_count,
      });
    } catch (error) {
      logger.error({
        context: "teacher-title.controller.get_teacher_titles",
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

  async update_teacher_title(req, res) {
    try {
      const { error, value } =
        validation.update_teacher_title_validation.validate(req.body);
      if (error) {
        logger.warn({
          context: "teacher-title.controller.update_teacher_title",
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
          message: "Teacher title ID is required",
        });
      }
      const teacher_title = await teacher_title_service.update(id, value);
      return success_response(res, {
        status: 200,
        message: "Teacher title updated successfully",
        data: teacher_title,
      });
    } catch (error) {
      logger.error({
        context: "teacher-title.controller.update_teacher_title",
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

  async delete_teacher_title(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return error_response(res, {
          status: 400,
          message: "Teacher title ID is required",
        });
      }
      const data = await teacher_title_service.delete(id);
      return success_response(res, {
        status: 200,
        message: "Teacher title deleted successfully",
        data,
      });
    } catch (error) {
      logger.error({
        context: "teacher-title.controller.delete_teacher_title",
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
  async get_teacher_title_dropdown(req, res) {
    try {
      const filters = { status: true };
      const data = await teacher_title_service.find_for_dropdown(filters);
      return success_response(res, {
        status: 200,
        message: "Teacher title fetched successfully",
        data,
      });
    } catch (error) {
      logger.error({
        context: "teacher-title.controller.get_teacher_title_dropdown",
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

module.exports = new teacher_title_controller();
