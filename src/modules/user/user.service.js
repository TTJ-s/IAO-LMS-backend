const { User } = require("../../models");
const { mask_user_contact } = require("../../utils/mask.util");

class user_service {
  async create(payload) {
    const data = await User.create(payload);
    return data;
  }

  async find_all(filters = {}, options = {}, sort = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;
    const data = await User.find(filters)
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .populate("role_access").populate("academic_degree").populate("teacher_role").populate("location").populate("language");
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

  async find_teacher_by_id(id) {
    const teacher = await User.findById(id)
      .populate({
        path: "location",
        populate: {
          path: "country",
          select: "name",
        },
      })
      .populate("language", "name")
      .populate("academic_degree", "name")
      .populate("teacher_role", "name");
    const data = {
      _id: teacher._id,
      first_name: teacher.first_name,
      last_name: teacher.last_name,
      ...mask_user_contact(teacher),
      location: teacher.location,
      language: teacher.language,
      academic_degree: teacher.academic_degree,
      teacher_role: teacher.teacher_role,
      status: teacher.status,
      iao_employment_start_date: teacher.iao_employment_start_date,
    };
    return data;
  }

  async update(id, payload) {
    const data = await User.findByIdAndUpdate(id, payload, { new: true });
    return data;
  }

  async delete(id, deleted_by) {
    const data = await User.findByIdAndUpdate(
      id,
      {
        status: "deleted",
        delete_action: { deleted_at: new Date(), deleted_by },
      },
      { new: true },
    );
    return data;
  }

  async bulk_delete(ids, deleted_by) {
    const data = await User.updateMany(
      { _id: { $in: ids } },
      {
        status: "deleted",
        delete_action: { deleted_at: new Date(), deleted_by },
      },
    );
    return data;
  }

  async total_count(filters = {}) {
    const data = await User.countDocuments(filters);
    return data;
  }
}

module.exports = new user_service();
