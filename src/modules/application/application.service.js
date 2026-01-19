const { Application, Intake } = require("../../models");

class application_service {
  async create(payload) {
    const data = Application.create(payload);
    return data;
  }

  async find_by_id(id) {
    const data = await Application.findById(id).populate(
      "intake",
      "name start_date end_date",
    );
    return data;
  }

  async find_all(filters = {}, options = {}, sort = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;
    const data = await Application.find(filters)
      .skip(skip)
      .limit(limit)
      .sort(sort);
    return data;
  }

  async find_by_user(user) {
    const data = await Application.findOne({ user });
    return data;
  }

  async update(id, payload) {
    const data = await Application.findByIdAndUpdate(id, payload, {
      new: true,
    });
    return data;
  }

  async total_count(filters = {}) {
    const data = await Application.countDocuments(filters);
    return data;
  }

  async find_intake_by_id(id) {
    const data = await Intake.findById(id);
    return data;
  }
}

module.exports = new application_service();
