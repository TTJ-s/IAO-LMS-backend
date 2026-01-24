const moment = require("moment-timezone");
const { Intake, Batch, Application, Program } = require("../../models");
const { mask_user_contact } = require("../../utils/mask.util");
const { generate_counter } = require("../../utils/generate_counter");

class intake_service {
  async create(payload) {
    const data = await Intake.create(payload);
    return data;
  }

  async create_many(payload) {
    const data = await Intake.insertMany(payload);
    const batch_payloads = [];
    for (const intake of data) {
      const batch_count = 1; //* First batch
      const batch_name = this.create_batch_name(
        intake.name,
        intake.start_date,
        intake.end_date,
        batch_count,
      );

      const counter = await generate_counter("batch");
      const padded_counter = String(counter).padStart(2, "0");
      const batch_uid = `B-${padded_counter}`;

      batch_payloads.push({
        uid: batch_uid,
        name: batch_name,
        intake: intake._id,
        student_count: 0,
        is_full_filled: false,
        status: "open",
      });
    }
    if (batch_payloads.length > 0) {
      await Batch.insertMany(batch_payloads);
    }
    return data;
  }

  create_batch_name(intake_name, start_date, end_date, count) {
    //* Extract year from date using moment
    const extract_year = (date) => {
      return moment(date).year();
    };

    //* Convert count to letter (1=A, 2=B, 3=C, etc.)
    const count_to_letter = (count) => {
      return String.fromCharCode(64 + count); //* A=65, B=66, etc.
    };

    const start_year = extract_year(start_date);
    const end_year = extract_year(end_date);
    const letter = count_to_letter(count);

    return `${start_year}-${end_year} ${intake_name}-${letter}`;
  }

  async find_program_by_id(id) {
    const data = await Program.findById(id);
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
      academic: intake.academic,
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

    const user = await Application.find({
      $or: [{ intake: intake_id }, { batch: { $in: batch_ids } }],
      ...filters,
    })
      .populate("user", "uid first_name last_name phone email status")
      .populate("batch", "name createdAt")
      .skip(skip)
      .limit(limit)
      .sort(sort);
    const data = user.map((app) => {
      return {
        _id: app._id,
        uid: app.uid,
        first_name: app.user.first_name,
        last_name: app.user.last_name,
        ...mask_user_contact(app.user),
        batch_name: app.batch.name,
        enrolled_date: app.batch.createdAt,
        status: app.user.status,
      };
    });
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
      uid: batch?.uid,
      name: batch.name,
      program_name: batch?.intake?.program?.name,
      intake_name: batch?.intake?.name,
      intake_id: batch?.intake?._id,
      academic: batch?.intake?.academic,
      student_count: batch.student_count,
      student_per_batch: batch?.intake?.student_per_batch,
      start_date: batch?.intake?.start_date,
      end_date: batch?.intake?.end_date,
    };
    return data;
  }

  async find_batch_students_by_batch_id(filters = {}, options = {}, sort = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;
    const user = await Application.find(filters)
      .populate(
        "user",
        "uid first_name last_name phone email previous_education address postal_code country city status",
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
        status: user.user.status,
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

  async find_student_by_id(id) {
    const student = await Application.findById(id)
      .populate(
        "user",
        "uid first_name last_name phone email previous_education address postal_code country city status",
      )
      .populate({
        path: "batch",
        populate: {
          path: "intake",
          populate: {
            path: "program",
            select: "name",
          },
        },
      })
      .lean();
    const data = {
      uid: student?.user?.uid,
      first_name: student?.user?.first_name,
      last_name: student?.user?.last_name,
      ...mask_user_contact(student?.user),
      previous_education: student?.user?.previous_education,
      address: student?.user?.address,
      postal_code: student?.user?.postal_code,
      status: student?.user?.status,
      country: student?.user?.country,
      city: student?.user?.city,
      id_card: student.id_card,
      qualification_certificate: student.qualification_certificate,
      program_name: student?.batch?.intake?.program?.name,
      intake_name: student?.batch?.intake?.name,
      intake_id: student?.batch?.intake?._id,
      academic: student?.batch?.intake?.academic,
      batch_name: student?.batch?.name,
      batch_id: student?.batch?._id,
      enrolled_date: student?.batch?.createdAt,
    };
    return data;
  }

  async generate_intake_name(program_name, start_date, end_date) {
    const start_year = moment(start_date).year();
    const end_year = moment(end_date).year();
    return `${program_name}, ${start_year}-${end_year}`;
  }
}

module.exports = new intake_service();
