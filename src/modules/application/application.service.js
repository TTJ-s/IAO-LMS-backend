const { Application, Intake, Payment } = require("../../models");

class application_service {
  async create(payload) {
    const data = Application.create(payload);
    return data;
  }

  async find_by_id(id) {
    const data = await Application.findById(id).populate(
      "intake",
      "name start_date end_date",
    );
    return data;
  }

  async find_all(filters = {}, options = {}, sort = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;
    const data = await Application.find(filters)
      .populate(
        "user",
        "first_name last_name phone email previous_education address postal_code country city",
      )
      .populate({
        path: "intake",
        populate: {
          path: "program",
          select: "name program_type",
        },
      })
      .populate({
        path: "batch",
        populate: {
          path: "intake",
          populate: {
            path: "program",
            select: "name program_type",
          },
        },
      })
      .skip(skip)
      .limit(limit)
      .sort(sort);
    return data;
  }

  async find_by_user(user) {
    const app = await Application.findOne({ user })
      .populate(
        "user",
        "first_name last_name phone email previous_education address postal_code country city",
      )
      .populate({
        path: "intake",
        populate: {
          path: "program",
          select: "name program_type",
        },
      })
      .populate({
        path: "batch",
        populate: {
          path: "intake",
          populate: {
            path: "program",
            select: "name program_type",
          },
        },
      })
      .lean();

    if (!app) {
      return null;
    }
    const data = {
      _id: app._id,
      uid: app.uid,
      id_card: app.id_card,
      qualification_certificate: app.qualification_certificate,
      status: app.status,
      remarks: app.remarks,
      current_step: app.current_step,
      decision_date: app.decision_date,
      payment_amount: app.payment_amount,
      payment_status: app.payment_status,
      createdAt: app.createdAt,
      user: {
        first_name: app.user.first_name,
        last_name: app.user.last_name,
        phone: app.user.phone,
        email: app.user.email,
        previous_education: app.user.previous_education,
        address: app.user.address,
        postal_code: app.user.postal_code,
        country: app.user.country,
        city: app.user.city,
      },
      program_name: app.intake
        ? app?.intake?.program?.name
        : app?.batch?.intake?.program?.name,
      program_id: app.intake
        ? app?.intake?.program?._id
        : app?.batch?.intake?.program?._id,
    };
    return data;
  }

  async update(id, payload) {
    const data = await Application.findByIdAndUpdate(id, payload, {
      new: true,
    });
    return data;
  }

  async total_count(filters = {}) {
    const data = await Application.countDocuments(filters);
    return data;
  }

  async find_intake_by_id(id) {
    const data = await Intake.findById(id);
    return data;
  }

  async find_payment_by_application_id(id) {
    const data = await Payment.findOne({ application: id });
    return data;
  }
}

module.exports = new application_service();
