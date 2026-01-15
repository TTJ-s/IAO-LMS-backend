const { error_response, success_response } = require("../../utils/response");
const validation = require("./role.validation");
const role_service = require("./role.service");

class role_controller {
  async create_role(req, res) {
    try {
      const { error, value } = validation.create_role_validation.validate(
        req.body
      );
      if (error) {
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
      return error_response(res, {
        status: 500,
        message: error.message,
        errors: error.stack,
      });
    }
  }

  async get_role_by_id(req, res) {
    try {
      const { id } = req.params;
      const data = await role_service.find_by_id(id);
      return success_response(res, {
        status: 200,
        message: "Role fetched successfully",
        data,
      });
    } catch (error) {
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
      const { error, value } = validation.update_role_validation.validate(
        req.body
      );
      if (error) {
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
      const data = await role_service.delete(id);
      return success_response(res, {
        status: 200,
        message: "Role deleted successfully",
        data,
      });
    } catch (error) {
      return error_response(res, {
        status: 500,
        message: error.message,
        errors: error.stack,
      });
    }
  }
}

module.exports = new role_controller();
