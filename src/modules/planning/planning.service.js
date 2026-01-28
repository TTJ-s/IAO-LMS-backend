const Planning = require("../../models/planning.model");

class planning_service {
  async create(payload) {
    const data = await Planning.create(payload);
    return data;
  }

  async find_by_id(id) {
    const data = await Planning.findById(id)
      .populate("batch")
      .populate("component")
      .populate("sessions.teachers.teacher", "first_name last_name email");
    return data;
  }

  async find_all(filters = {}, options = {}, sort = { createdAt: -1 }) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;
    const data = await Planning.find(filters)
      .populate("batch")
      .populate("component")
      .populate("sessions.teachers.teacher", "first_name last_name email")
      .skip(skip)
      .limit(limit)
      .sort(sort);
    return data;
  }

  async update(id, payload) {
    const data = await Planning.findByIdAndUpdate(id, payload, { new: true })
      .populate("batch")
      .populate("component")
      .populate("sessions.teachers.teacher", "first_name last_name email");
    return data;
  }

  async delete(id) {
    const data = await Planning.findByIdAndUpdate(
      id,
      { status: "deleted" },
      { new: true }
    );
    return data;
  }

  async hard_delete(id) {
    const data = await Planning.findByIdAndDelete(id);
    return data;
  }

  async total_count(filters = {}) {
    const data = await Planning.countDocuments(filters);
    return data;
  }

  async update_teacher_status(planning_id, teacher_id, status) {
    const planning = await Planning.findById(planning_id);
    if (!planning) return null;

    let teacher_found = false;

    //* Update teacher status in all sessions where they are assigned
    for (const session of planning.sessions) {
      const teacher_entry = session.teachers.find(
        (t) => t.teacher.toString() === teacher_id
      );
      if (teacher_entry) {
        teacher_entry.status = status;
        teacher_found = true;
      }
    }

    if (!teacher_found) return null;

    await planning.save();
    return planning;
  }
}

module.exports = new planning_service();
