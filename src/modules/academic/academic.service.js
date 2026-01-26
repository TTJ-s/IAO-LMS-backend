const { Intake, Academic, Program, Batch } = require("../../models");

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
      .sort(sort)
      .lean();
    const academic_ids = data.map((academic) => academic._id);
    const intakes = await Intake.find({
      academic: { $in: academic_ids },
    }).lean();
    const intake_ids = intakes.map((intake) => intake._id);
    const batches = await Batch.find({ intake: { $in: intake_ids } }).lean();
    const enriched_data = data.map((academic) => {
      const academic_intakes = intakes.filter(
        (intake) => intake.academic.toString() === academic._id.toString(),
      );

      const academic_intake_ids = academic_intakes.map((intake) =>
        intake._id.toString(),
      );
      const academic_batches = batches.filter((batch) =>
        academic_intake_ids.includes(batch.intake.toString()),
      );

      const unique_programs = [
        ...new Set(academic_intakes.map((intake) => intake.program.toString())),
      ];

      return {
        ...academic,
        program_count: unique_programs.length,
        batch_count: academic_batches.length,
      };
    });

    return enriched_data;
  }

  async update(id, data) {
    return await Academic.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    return await Academic.findByIdAndDelete(id);
  }

  async find_intakes_list_by_academic_id(
    filters = {},
    options = {},
    sort = {},
  ) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;
    const data = await Intake.find(filters)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("program", "name");
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
