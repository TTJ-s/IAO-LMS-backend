const { Program, Component } = require("../../models");

class program_service {
  async create(payload) {
    const data = await Program.create(payload);
    return data;
  }

  async find_by_name(name) {
    const data = await Program.findOne({ name });
    return data;
  }

  async find_all(filters = {}, options = {}, sort = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;
    const data = await Program.find(filters)
      .populate("language")
      .populate("city")
      .populate({
        path: "city",
        populate: {
          path: "country",
        },
      })
      .skip(skip)
      .limit(limit)
      .sort(sort);
    return data;
  }

  async find_by_id(id) {
    const data = await Program.findById(id)
      .populate("language")
      .populate("city")
      .populate({
        path: "city",
        populate: {
          path: "country",
        },
      })
      .lean();
    const components = await this.find_components_by_program_id(id);
    if (components.length > 0) {
      const types = [...new Set(components.map((item) => item.type))];
      data.types = types;
    }
    return data;
  }

  async find_components_by_program_id(id) {
    const data = await Component.find({ program: id });
    return data;
  }

  async update(id, payload) {
    const data = await Program.findByIdAndUpdate(id, payload, { new: true });
    return data;
  }

  async delete(id) {
    const data = await Program.findByIdAndUpdate(
      id,
      { status: false },
      { new: true },
    );
    return data;
  }

  async total_count(filters = {}) {
    const data = await Program.countDocuments(filters);
    return data;
  }

  async duplicate_component(payload) {
    const data = await Component.insertMany(payload);
    return data;
  }
}

module.exports = new program_service();
