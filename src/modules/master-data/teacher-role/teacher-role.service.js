const { TeacherRole } = require("../../../models");

class teacher_role_service {
  async create(payload) {
    const data = await TeacherRole.create(payload);
    return data;
  }

  async find_by_name(name) {
    const data = await TeacherRole.findOne({ name });
    return data;
  }

  async find_all(filters = {}, options = {}, sort = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;
    const data = await TeacherRole.find(filters)
      .skip(skip)
      .limit(limit)
      .sort(sort);
    return data;
  }

  async find_by_id(id) {
    const data = await TeacherRole.findById(id);
    return data;
  }

  async update(id, payload) {
    const data = await TeacherRole.findByIdAndUpdate(id, payload, {
      new: true,
    });
    return data;
  }

  async delete(id) {
    const data = await TeacherRole.findByIdAndUpdate(
      id,
      { status: false },
      {
        new: true,
      },
    );
    return data;
  }

  async total_count(filters = {}) {
    const data = await TeacherRole.countDocuments(filters);
    return data;
  }
  async find_for_dropdown(filters = { status: true }) {
    const data = await TeacherRole.find(filters)
      .select("name")
      .sort({ name: 1 });
    return data;
  }
}

module.exports = new teacher_role_service();
