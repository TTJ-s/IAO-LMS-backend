const { generate_counter } = require("../../utils/generate_counter");
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
          name: user.first_name + " " + user.last_name,
          status: user.status,
          role_name: user.role_access.name,
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
      const { status } = req.body;
      if (!["active", "inactive"].includes(status)) {
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
      return error_response(res, {
        status: 500,
        message: error.message,
        errors: error.stack,
      });
    }
  }
}

module.exports = new user_controller();
