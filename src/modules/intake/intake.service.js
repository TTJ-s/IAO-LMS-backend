const { Intake, Batch } = require("../../models");

class intake_service {
  async create(payload) {
    const data = Intake.create(payload);
    return data;
  }

  async find_by_name(name) {
    const data = await Intake.findOne({ name });
    return data;
  }

  async find_all(filters = {}, options = {}, sort = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;
    const data = await Intake.find(filters)
      .populate("program", "name")
      .skip(skip)
      .limit(limit)
      .sort(sort);
    return data;
  }

  async find_by_id(id) {
    const data = await Intake.findById(id);
    return data;
  }

  async find_active_intake_by_program_id(program_id) {
    const data = await Intake.findOne({
      program: program_id,
      status: "open",
    })
      .populate("program", "name")
      .populate({
        path: "program",
        populate: {
          path: "city",
          populate: {
            path: "country",
            select: "currency",
          },
        },
      });
    return data;
  }

  async update(id, payload) {
    const data = await Intake.findByIdAndUpdate(id, payload, { new: true });
    return data;
  }

  async delete(id) {
    const data = await Intake.findByIdAndUpdate(
      id,
      { status: "deleted" },
      { new: true },
    );
    return data;
  }

  async total_count(filters = {}) {
    const data = await Intake.countDocuments(filters);
    return data;
  }

  async find_batch_by_intake_id(intake) {
    const data = await Batch.find({ intake });
    return data;
  }

  async find_intake_by_id(id) {
    const intake = await Intake.findById(id);
    const batches = await this.find_batch_by_intake_id(id);

    const total_batch_count = batches.length;
    const total_student_count = batches.reduce(
      (sum, batch) => sum + batch.student_count,
      0,
    );

    return {
      _id: intake._id,
      start_date: intake.start_date,
      end_date: intake.end_date,
      total_batch_count,
      total_student_count,
    };
  }

  async find_all_batches_by_intake_id(filters = {}, options = {}, sort = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;
    const data = await Batch.find(filters).skip(skip).limit(limit).sort(sort);
    return data;
  }

  async total_count_batches_by_intake_id(filters = {}) {
    const data = await Batch.countDocuments(filters);
    return data;
  }
}

module.exports = new intake_service();
