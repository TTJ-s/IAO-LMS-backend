const { TeacherTitle } = require("../../../models");

class teacher_title_service {
  async create(payload) {
    const data = await TeacherTitle.create(payload);
    return data;
  }

  async find_by_name(name) {
    const data = await TeacherTitle.findOne({ name });
    return data;
  }

  async find_all(filters = {}, options = {}, sort = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;
    const data = await TeacherTitle.find(filters)
      .skip(skip)
      .limit(limit)
      .sort(sort);
    return data;
  }

  async find_by_id(id) {
    const data = await TeacherTitle.findById(id);
    return data;
  }

  async update(id, payload) {
    const data = await TeacherTitle.findByIdAndUpdate(id, payload, {
      new: true,
    });
    return data;
  }

  async delete(id) {
    const data = await TeacherTitle.findByIdAndUpdate(
      id,
      { status: false },
      {
        new: true,
      },
    );
    return data;
  }

  async total_count(filters = {}) {
    const data = await TeacherTitle.countDocuments(filters);
    return data;
  }
}

module.exports = new teacher_title_service();
