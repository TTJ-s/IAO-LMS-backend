const { error_response, success_response } = require("../../utils/response");
const validation = require("./role.validation");
const role_service = require("./role.service");
const logger = require("../../utils/logger");

class role_controller {
  async create_role(req, res) {
    try {
      const { error, value } = validation.create_role_validation.validate(
        req.body
      );
      if (error) {
        logger.warn({
          context: "role.controller.create_role",
          message: error.details[0].message,
          errors: error.details,
        });

        return error_response(res, {
          status: 400,
          message: error.details[0].message,
          errors: error.details,
        });
      }
      const data = await role_service.create(value);
      return success_response(res, {
        status: 201,
        message: "Role created successfully",
        data,
      });
    } catch (error) {
      logger.error({
        context: "role.controller.create_role",
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

  async get_roles(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const filters = {};
      const options = {
        page,
        limit,
      };
      const sort = {};
      const [data, total_count] = await Promise.all([
        role_service.find_all(filters, options, sort),
        role_service.total_count(filters),
      ]);
      return success_response(res, {
        status: 200,
        message: "Roles fetched successfully",
        data,
        total_count,
      });
    } catch (error) {
      logger.error({
        context: "role.controller.get_roles",
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

  async update_role(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return error_response(res, {
          status: 400,
          message: "Role ID is required",
        });
      }
      const { error, value } = validation.update_role_validation.validate(
        req.body
      );
      if (error) {
        logger.warn({
          context: "role.controller.update_role",
          message: error.details[0].message,
          errors: error.details,
        });

        return error_response(res, {
          status: 400,
          message: error.details[0].message,
          errors: error.details,
        });
      }
      const data = await role_service.update(id, value);
      return success_response(res, {
        status: 200,
        message: "Role updated successfully",
        data,
      });
    } catch (error) {
      logger.error({
        context: "role.controller.update_role",
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

  async delete_role(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return error_response(res, {
          status: 400,
          message: "Role ID is required",
        });
      }
      const existing_admin_role_access =
        await role_service.find_admin_role_access(id);
      if (existing_admin_role_access.length) {
        logger.warn({
          context: "role.controller.delete_role",
          message: "Cannot delete, Role Access associated with admin",
        });
        return error_response(res, {
          status: 400,
          message: "Cannot delete, Role Access associated with admin",
        });
      }
      const data = await role_service.delete(id);
      return success_response(res, {
        status: 200,
        message: "Role deleted successfully",
        data,
      });
    } catch (error) {
      logger.error({
        context: "role.controller.delete_role",
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

  async bulk_delete_roles(req, res) {
    try {
      const { ids } = req.body;
      if (!ids || !ids.length) {
        return error_response(res, {
          status: 400,
          message: "Role ids are required",
        });
      }
      const data = await role_service.bulk_delete(ids);
      return success_response(res, {
        status: 200,
        message: "Roles deleted successfully",
        data,
      });
    } catch (error) {
      logger.error({
        context: "role.controller.bulk_delete_roles",
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
  async get_role_dropdown(req, res) {
    try {
      const filters = { status: true };
      const data = await role_service.find_for_dropdown(filters);
      return success_response(res, {
        status: 200,
        message: "Role fetched successfully",
        data,
      });
    } catch (error) {
      logger.error({
        context: "role.controller.get_role_dropdown",
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

module.exports = new role_controller();
