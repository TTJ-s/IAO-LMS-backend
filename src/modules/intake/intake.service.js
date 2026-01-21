const { Intake, Batch, Application } = require("../../models");
const { mask_user_contact } = require("../../utils/mask.util");

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
    const intake = await Intake.findById(id).populate({
      path: "program",
      populate: {
        path: "city",
        populate: {
          path: "country",
          select: "name currency",
        },
      },
    });
    const batches = await this.find_batch_by_intake_id(id);

    const total_batch_count = batches.length;
    const total_student_count = batches.reduce(
      (sum, batch) => sum + batch.student_count,
      0,
    );

    return {
      _id: intake._id,
      uid: intake.uid,
      name: intake.name,
      registration_deadline: intake.registration_deadline,
      admission_fee: intake.admission_fee,
      country: intake.program?.city?.country?.name,
      currency: intake.program?.city?.country?.currency,
      city: intake.program?.city?.name,
      start_date: intake.start_date,
      end_date: intake.end_date,
      total_batch_count,
      total_student_count,
      max_student_enrollment: intake.max_student_enrollment,
    };
  }

  async find_all_batches_by_intake_id(filters = {}, options = {}, sort = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;
    const data = await Batch.find(filters)
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .populate("intake", "student_per_batch");
    return data;
  }

  async total_count_batches_by_intake_id(filters = {}) {
    const data = await Batch.countDocuments(filters);
    return data;
  }

  async find_all_enrollments_by_intake_id(
    intake_id,
    filters = {},
    options = {},
    sort = {},
  ) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const batches = await Batch.find({ intake: intake_id });
    const batch_ids = batches.map((batch) => batch._id);

    const data = await Application.find({
      $or: [{ intake: intake_id }, { batch: { $in: batch_ids } }],
      ...filters,
    })
      .skip(skip)
      .limit(limit)
      .sort(sort);
    return data;
  }

  async total_count_enrollments_by_intake_id(intake_id, filters = {}) {
    const batches = await Batch.find({ intake: intake_id });
    const batch_ids = batches.map((batch) => batch._id);

    const data = await Application.countDocuments({
      $or: [{ intake: intake_id }, { batch: { $in: batch_ids } }],
      ...filters,
    });
    return data;
  }

  async find_batch_by_id(id) {
    const batch = await Batch.findById(id).populate({
      path: "intake",
      populate: {
        path: "program",
        select: "name",
      },
    });
    const data = {
      _id: batch._id,
      name: batch.name,
      program_name: batch?.intake?.program?.name,
      intake_name: batch?.intake?.name,
      student_count: batch.student_count,
      student_per_batch: batch?.intake?.student_per_batch,
      start_date: batch.start_date,
      end_date: batch.end_date,
    };
    return data;
  }

  async find_batch_students_by_batch_id(filters = {}, options = {}, sort = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;
    const user = await Application.find(filters)
      .populate(
        "user",
        "uid first_name last_name phone email previous_education address postal_code country city",
      )
      .skip(skip)
      .limit(limit)
      .sort(sort);
    const data = user.map((user) => {
      return {
        _id: user._id,
        uid: user.uid,
        first_name: user.user.first_name,
        last_name: user.user.last_name,
        ...mask_user_contact(user.user),
        previous_education: user.user.previous_education,
        address: user.user.address,
        postal_code: user.user.postal_code,
        country: user.user.country,
        city: user.user.city,
      };
    });
    return data;
  }

  async total_count_batch_students_by_batch_id(filters = {}) {
    const data = await Application.countDocuments(filters);
    return data;
  }
}

module.exports = new intake_service();
