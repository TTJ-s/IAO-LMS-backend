const validation = require("./planning.validation");
const planning_service = require("./planning.service");
const logger = require("../../utils/logger");
const { error_response, success_response } = require("../../utils/response");

class planning_controller {
  async create_planning(req, res) {
    try {
      const { error, value } = validation.create_planning_validation.validate(
        req.body,
      );

      if (error) {
        logger.warn({
          context: "planning.controller.create_planning",
          message: error.details[0].message,
          errors: error.details,
        });
        return error_response(res, {
          status: 400,
          message: error.details[0].message,
          errors: error.details,
        });
      }

      const data = await planning_service.create(value);

      logger.info({
        context: "planning.controller.create_planning",
        message: "Planning created successfully",
        planning_id: data._id,
      });

      return success_response(res, {
        status: 201,
        message: "Planning created successfully",
        data,
      });
    } catch (error) {
      logger.error({
        context: "planning.controller.create_planning",
        message: error.message,
        stack: error.stack,
      });

      return error_response(res, {
        status: 500,
        message: error.message,
        errors: error.stack,
      });
    }
  }

  async get_plannings(req, res) {
    try {
      const { page = 1, limit = 10, batch, component, status } = req.query;

      const filters = {};
      if (batch) filters.batch = batch;
      if (component) filters.component = component;
      if (status) filters.status = status;

      const options = { page: parseInt(page), limit: parseInt(limit) };
      const sort = { createdAt: -1 };

      const [data, total_count] = await Promise.all([
        planning_service.find_all(filters, options, sort),
        planning_service.total_count(filters),
      ]);

      return success_response(res, {
        status: 200,
        message: "Plannings retrieved successfully",
        data,
        total_count,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(total_count / parseInt(limit)),
      });
    } catch (error) {
      logger.error({
        context: "planning.controller.get_plannings",
        message: error.message,
        stack: error.stack,
      });

      return error_response(res, {
        status: 500,
        message: error.message,
        errors: error.stack,
      });
    }
  }

  async get_plannings_by_teacher(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const teacher = req.user._id.toString();
      const filters = { "sessions.teachers.teacher": teacher };
      const options = { page: parseInt(page), limit: parseInt(limit) };
      const sort = { createdAt: -1 };
      const [data, total_count] = await Promise.all([
        planning_service.find_all(filters, options, sort),
        planning_service.total_count(filters),
      ]);
      return success_response(res, {
        status: 200,
        message: "Plannings retrieved successfully",
        data,
        total_count,
      });
    } catch (error) {
      logger.error({
        context: "planning.controller.get_plannings_by_teacher",
        message: error.message,
        stack: error.stack,
      });

      return error_response(res, {
        status: 500,
        message: error.message,
        errors: error.stack,
      });
    }
  }

  async get_planning_by_id(req, res) {
    try {
      const { id } = req.params;

      const data = await planning_service.find_by_id(id);

      if (!data) {
        return error_response(res, {
          status: 404,
          message: "Planning not found",
        });
      }

      return success_response(res, {
        status: 200,
        message: "Planning retrieved successfully",
        data,
      });
    } catch (error) {
      logger.error({
        context: "planning.controller.get_planning_by_id",
        message: error.message,
        stack: error.stack,
      });

      return error_response(res, {
        status: 500,
        message: error.message,
        errors: error.stack,
      });
    }
  }

  async update_planning(req, res) {
    try {
      const { id } = req.params;

      const { error, value } = validation.update_planning_validation.validate(
        req.body,
      );

      if (error) {
        logger.warn({
          context: "planning.controller.update_planning",
          message: error.details[0].message,
          errors: error.details,
        });
        return error_response(res, {
          status: 400,
          message: error.details[0].message,
          errors: error.details,
        });
      }

      const existing = await planning_service.find_by_id(id);
      if (!existing) {
        return error_response(res, {
          status: 404,
          message: "Planning not found",
        });
      }

      const data = await planning_service.update(id, value);

      logger.info({
        context: "planning.controller.update_planning",
        message: "Planning updated successfully",
        planning_id: id,
      });

      return success_response(res, {
        status: 200,
        message: "Planning updated successfully",
        data,
      });
    } catch (error) {
      logger.error({
        context: "planning.controller.update_planning",
        message: error.message,
        stack: error.stack,
      });

      return error_response(res, {
        status: 500,
        message: error.message,
        errors: error.stack,
      });
    }
  }

  async delete_planning(req, res) {
    try {
      const { id } = req.params;

      const existing = await planning_service.find_by_id(id);
      if (!existing) {
        return error_response(res, {
          status: 404,
          message: "Planning not found",
        });
      }

      const data = await planning_service.delete(id);

      logger.info({
        context: "planning.controller.delete_planning",
        message: "Planning deleted successfully",
        planning_id: id,
      });

      return success_response(res, {
        status: 200,
        message: "Planning deleted successfully",
        data,
      });
    } catch (error) {
      logger.error({
        context: "planning.controller.delete_planning",
        message: error.message,
        stack: error.stack,
      });

      return error_response(res, {
        status: 500,
        message: error.message,
        errors: error.stack,
      });
    }
  }

  async update_teacher_status(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const teacher_id = req.user._id.toString();

      if (!status) {
        return error_response(res, {
          status: 400,
          message: "status is required",
        });
      }

      if (!["accepted", "rejected"].includes(status)) {
        return error_response(res, {
          status: 400,
          message:
            "Invalid status. Must be 'pending', 'accepted', or 'rejected'",
        });
      }

      const data = await planning_service.update_teacher_status(
        id,
        teacher_id,
        status,
      );

      if (!data) {
        return error_response(res, {
          status: 404,
          message: "Planning or teacher assignment not found",
        });
      }

      logger.info({
        context: "planning.controller.update_teacher_status",
        message: "Teacher status updated successfully",
        planning_id: id,
        teacher_id,
        status,
      });

      return success_response(res, {
        status: 200,
        message: "Teacher status updated successfully",
        data,
      });
    } catch (error) {
      logger.error({
        context: "planning.controller.update_teacher_status",
        message: error.message,
        stack: error.stack,
      });

      return error_response(res, {
        status: 500,
        message: error.message,
        errors: error.stack,
      });
    }
  }
}

module.exports = new planning_controller();
