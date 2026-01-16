const { Language } = require("../../../models");

class language_service {
  async create(payload) {
    const data = await Language.create(payload);
    return data;
  }

  async find_by_name(name) {
    const data = await Language.findOne({ name });
    return data;
  }

  async find_all(filters = {}, options = {}, sort = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;
    const data = await Language.find(filters)
      .skip(skip)
      .limit(limit)
      .sort(sort);
    return data;
  }

  async find_by_id(id) {
    const data = await Language.findById(id);
    return data;
  }

  async update(id, payload) {
    const data = await Language.findByIdAndUpdate(id, payload, { new: true });
    return data;
  }

  async delete(id) {
    const data = await Language.findByIdAndUpdate(
      id,
      { status: false },
      { new: true }
    );
    return data;
  }

  async total_count(filters = {}) {
    const data = await Language.countDocuments(filters);
    return data;
  }
}

module.exports = new language_service();
