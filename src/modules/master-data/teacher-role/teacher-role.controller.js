const validation = require("./teacher-role.validation");
const teacher_role_service = require("./teacher-role.service");
const logger = require("../../../utils/logger");
const { error_response, success_response } = require("../../../utils/response");

class teacher_role_controller {
  async create_teacher_role(req, res) {
    try {
      const { error, value } =
        validation.create_teacher_role_validation.validate(req.body);
      if (error) {
        logger.warn({
          context: "teacher-role.controller.create_teacher_role",
          message: error.details[0].message,
          errors: error.details,
        });

        return error_response(res, {
          status: 400,
          message: error.details[0].message,
          errors: error.details,
        });
      }

      const existing_teacher_role = await teacher_role_service.find_by_name(
        value.teacher_role_name,
      );
      if (existing_teacher_role) {
        logger.warn({
          context: "teacher-role.controller.create_teacher_role",
          message: "Teacher role already exists",
        });

        return error_response(res, {
          status: 400,
          message: "Teacher role already exists",
        });
      }

      const teacher_role = await teacher_role_service.create(value);
      return success_response(res, {
        status: 200,
        message: "Teacher role created successfully",
        data: teacher_role,
      });
    } catch (error) {
      logger.error({
        context: "teacher-role.controller.create_teacher_role",
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

  async get_teacher_roles(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const filters = {};
      const options = {
        page,
        limit,
      };
      const sort = {};
      const [data, total_count] = await Promise.all([
        teacher_role_service.find_all(filters, options, sort),
        teacher_role_service.total_count(filters),
      ]);
      return success_response(res, {
        status: 200,
        message: "Teacher roles fetched successfully",
        data,
        total_count,
      });
    } catch (error) {
      logger.error({
        context: "teacher-role.controller.get_teacher_roles",
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

  async update_teacher_role(req, res) {
    try {
      const { error, value } =
        validation.update_teacher_role_validation.validate(req.body);
      if (error) {
        logger.warn({
          context: "teacher-role.controller.update_teacher_role",
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
          message: "Teacher role ID is required",
        });
      }
      const teacher_role = await teacher_role_service.update(id, value);
      return success_response(res, {
        status: 200,
        message: "Teacher role updated successfully",
        data: teacher_role,
      });
    } catch (error) {
      logger.error({
        context: "teacher-role.controller.update_teacher_role",
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

  async delete_teacher_role(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return error_response(res, {
          status: 400,
          message: "Teacher role ID is required",
        });
      }
      const data = await teacher_role_service.delete(id);
      return success_response(res, {
        status: 200,
        message: "Teacher role deleted successfully",
        data,
      });
    } catch (error) {
      logger.error({
        context: "teacher-role.controller.delete_teacher_role",
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

module.exports = new teacher_role_controller();
