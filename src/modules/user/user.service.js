const { User } = require("../../models");

class user_service {
  async create(payload) {
    const data = User.create(payload);
    return data;
  }

  async find_all(filters = {}, options = {}, sort = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;
    const data = await User.find(filters)
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .populate("role_access");
    return data;
  }

  async find_by_email_or_phone(email, phone) {
    const data = await User.findOne({ $or: [{ email }, { phone }] });
    return data;
  }

  async find_by_id(id) {
    const data = await User.findById(id);
    return data;
  }

  async update(id, payload) {
    const data = await User.findByIdAndUpdate(id, payload, { new: true });
    return data;
  }

  async delete(id) {
    const data = await User.findByIdAndDelete(id);
    return data;
  }

  async bulk_delete(ids) {
    const data = await User.updateMany(
      { _id: { $in: ids } },
      { status: "deleted" }
    );
    return data;
  }

  async total_count(filters = {}) {
    const data = await User.countDocuments(filters);
    return data;
  }
}

module.exports = new user_service();
