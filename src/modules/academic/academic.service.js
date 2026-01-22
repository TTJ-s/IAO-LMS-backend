const { Intake, Academic } = require("../../models");

class academic_service {
  async create(data) {
    return await Academic.create(data);
  }

  async find_by_name(name) {
    return await Academic.findOne({ name });
  }

  async find_intakes_by_academic_id(academic) {
    const data = await Intake.find({ academic });
    return data;
  }

  async duplicate_intakes(payload) {
    //TODO: duplicate modules also
    const data = await Intake.insertMany(payload);
    return data;
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

  async find_intakes_list_by_academic_id(filters = {}, options = {}, sort = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;
    const data = await Intake.find(filters).sort(sort).skip(skip).limit(limit);
    return data;
  }

  async total_intake_count(filters = {}) {
    return await Intake.countDocuments(filters);
  }

  async total_count(filters = {}) {
    return await Academic.countDocuments(filters);
  }
}

module.exports = new academic_service();
