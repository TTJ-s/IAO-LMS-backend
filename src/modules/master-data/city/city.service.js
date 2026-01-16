const { City } = require("../../../models");

class city_service {
  async create(payload) {
    const data = City.create(payload);
    return data;
  }

  async find_by_name(name) {
    const data = await City.findOne({ name });
    return data;
  }

  async find_by_id(id) {
    const data = await City.findById(id);
    return data;
  }

  async find_by_country(country) {
    const data = await City.findOne({ country });
    return data;
  }

  async find_all(filters = {}, options = {}, sort = {}) {
    const data = await City.find(filters, options).sort(sort);
    return data;
  }

  async update(id, payload) {
    const data = await City.findByIdAndUpdate(id, payload, { new: true });
    return data;
  }

  async delete(id) {
    const data = await City.findByIdAndUpdate(
      id,
      { status: false },
      { new: true }
    );
    return data;
  }
}

module.exports = new city_service();
