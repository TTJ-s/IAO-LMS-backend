const { Intake } = require("../../models");

class intake_service {
  async create(payload) {
    const data = Intake.create(payload);
    return data;
  }

  async find_by_name(name) {
    const data = await Intake.findOne({ name });
    return data;
  }

  async find_all(filters = {}, options = {}, sort = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;
    const data = await Intake.find(filters)
      .populate("program", "name")
      .skip(skip)
      .limit(limit)
      .sort(sort);
    return data;
  }

  async find_by_id(id) {
    const data = await Intake.findById(id);
    return data;
  }

  async update(id, payload) {
    const data = await Intake.findByIdAndUpdate(id, payload, { new: true });
    return data;
  }

  async delete(id) {
    const data = await Intake.findByIdAndUpdate(
      id,
      { status: "deleted" },
      { new: true }
    );
    return data;
  }

  async total_count(filters = {}) {
    const data = await Intake.countDocuments(filters);
    return data;
  }
}

module.exports = new intake_service();
