const { Program } = require("../../models");

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
      });
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
      { new: true }
    );
    return data;
  }

  async total_count(filters = {}) {
    const data = await Program.countDocuments(filters);
    return data;
  }
}

module.exports = new program_service();
