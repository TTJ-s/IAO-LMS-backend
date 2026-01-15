const { Role } = require("../../models");

class role_service {
  async create(payload) {
    const data = Role.create(payload);
    return data;
  }

  async find_all(filters = {}, options = {}, sort = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;
    const data = await Role.find(filters).skip(skip).limit(limit).sort(sort);
    return data;
  }

  async find_by_id(id) {
    const data = await Role.findById(id);
    return data;
  }

  async update(id, payload) {
    const data = await Role.findByIdAndUpdate(id, payload, { new: true });
    return data;
  }

  async delete(id) {
    const data = await Role.findByIdAndDelete(id);
    return data;
  }

  async total_count(filters = {}) {
    const data = await Role.countDocuments(filters);
    return data;
  }
}

module.exports = new role_service();
