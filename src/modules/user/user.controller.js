const { generate_counter } = require("../../utils/generate_counter");
const logger = require("../../utils/logger");
const { mask_user_contact } = require("../../utils/mask.util");
const { error_response, success_response } = require("../../utils/response");
const user_service = require("./user.service");
const validation = require("./user.validation");

class user_controller {
  async create_admin(req, res) {
    try {
      const { error, value } = validation.create_admin_validation.validate(
        req.body
      );
      if (error) {
        logger.warn({
          context: "user.controller.create_admin",
          message: error.details[0].message,
          errors: error.details,
        });

        return error_response(res, {
          status: 400,
          message: error.details[0].message,
          errors: error.details,
        });
      }

      const find_existing_admin = await user_service.find_by_email_or_phone(
        value.email,
        value.phone
      );
      if (find_existing_admin) {
        logger.warn({
          context: "user.controller.create_admin",
          message: "Admin with this email or phone already exists",
        });

        return error_response(res, {
          status: 400,
          message: "Admin with this email or phone already exists",
        });
      }

      const counter = await generate_counter("admin");
      const padded_counter = String(counter).padStart(2, "0");
      const uid = `ADM-${padded_counter}`;
      value.uid = uid;
      value.role = "admin";
      const data = await user_service.create(value);
      const user_obj = {
        _id: data._id,
        uid: data.uid,
        first_name: data.first_name,
        last_name: data.last_name,
        status: data.status,
        role_name: data.role_access.name,
        ...mask_user_contact(data),
      };
      return success_response(res, {
        status: 201,
        message: "User created successfully",
        data: user_obj,
      });
    } catch (error) {
      logger.error({
        context: "user.controller.create_admin",
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

  async get_admins(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const filters = {};
      const options = {
        page,
        limit,
      };
      const sort = {};
      const [data, total_count] = await Promise.all([
        user_service.find_all(filters, options, sort),
        user_service.total_count(filters),
      ]);
      const mapped_data = data.map((user) => {
        return {
          _id: user._id,
          first_name: user.first_name,
          last_name: user.last_name,
          status: user.status,
          role_name: user.role_access.name,
          role_id: user.role_access._id,
          ...mask_user_contact(user),
        };
      });

      return success_response(res, {
        status: 200,
        message: "Users fetched successfully",
        data: mapped_data,
        total_count,
      });
    } catch (error) {
      logger.error({
        context: "user.controller.get_admins",
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

  async update_status(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return error_response(res, {
          status: 400,
          message: "User ID is required",
        });
      }
      const { status } = req.body;
      if (!["active", "inactive"].includes(status)) {
        logger.warn({
          context: "user.controller.update_status",
          message: "Invalid status",
        });

        return error_response(res, {
          status: 400,
          message: "Invalid status",
        });
      }
      const data = await user_service.update(id, { status });
      const user_obj = {
        _id: data._id,
        uid: data.uid,
        first_name: data.first_name,
        last_name: data.last_name,
        status: data.status,
        role_name: data.role_access.name,
        ...mask_user_contact(data),
      };
      return success_response(res, {
        status: 200,
        message: "User status updated successfully",
        user_obj,
      });
    } catch (error) {
      logger.error({
        context: "user.controller.update_status",
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

  async bulk_delete_admins(req, res) {
    try {
      const { ids } = req.body;
      if (!ids || !ids.length) {
        return error_response(res, {
          status: 400,
          message: "Admin IDs are required",
        });
      }
      const data = await user_service.bulk_delete(ids);
      return success_response(res, {
        status: 200,
        message: "Admins deleted successfully",
        data,
      });
    } catch (error) {
      logger.error({
        context: "user.controller.bulk_delete_admins",
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

  async delete_admin(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return error_response(res, {
          status: 400,
          message: "Admin ID is required",
        });
      }
      const data = await user_service.delete(id);
      return success_response(res, {
        status: 200,
        message: "Admin deleted successfully",
        data,
      });
    } catch (error) {
      logger.error({
        context: "user.controller.delete_admin",
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

module.exports = new user_controller();
