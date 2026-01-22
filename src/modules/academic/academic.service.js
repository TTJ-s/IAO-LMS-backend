const Academic = require("../../models/academic.model");

class academic_service {
  async create(data) {
    return await Academic.create(data);
  }

  async find_by_name(name) {
    return await Academic.findOne({ name });
  }

  async find_by_id(id) {
    return await Academic.findById(id);
  }

  async find_all(filters = {}, options = {}, sort = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;
    const data = await Academic.find(filters)
      .skip(skip)
      .limit(limit)
      .sort(sort);
    return data;
  }

  async update(id, data) {
    return await Academic.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    return await Academic.findByIdAndDelete(id);
  }

  async total_count(filters = {}) {
    return await Academic.countDocuments(filters);
  }
}

module.exports = new academic_service();
