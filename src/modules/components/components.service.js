const { Component, Program } = require("../../models");

class components_service {
  async create(data) {
    return await Component.create(data);
  }

  async find_by_id(id) {
    return await Component.findById(id);
  }

  async find_by_name(name) {
    return await Component.findOne({ name });
  }

  async find_all(filters = {}, options = {}, sort = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;
    const data = await Component.find(filters)
      .sort(sort)
      .skip(skip)
      .limit(limit);
    return data;
  }

  async delete_by_id(id) {
    return await Component.findByIdAndDelete(id);
  }

  async update_by_id(id, data) {
    return await Component.findByIdAndUpdate(id, data, { new: true });
  }

  async find_currency_by_program_id(id) {
    const program = await Program.findById(id).populate({
      path: "city",
      populate: {
        path: "country",
        select: "currency",
      },
    });
    const data = program?.city?.country?.currency;
    return data;
  }

  async total_count(filters = {}) {
    return await Component.countDocuments(filters);
  }

  async find_dropdown(filters = {}) {
    const data = await Component.find(filters).select("name");
    return data;
  }
}

module.exports = new components_service();
