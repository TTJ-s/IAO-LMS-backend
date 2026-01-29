const mongoose = require("mongoose");
const { Planning, Session } = require("../../models");

class planning_service {
  async create(payload) {
    const { sessions, ...planning_data } = payload;

    //* Create the planning first
    const planning = await Planning.create(planning_data);

    //* Create sessions with planning reference
    if (sessions && Array.isArray(sessions) && sessions.length > 0) {
      const session_docs = sessions.map((session) => ({
        ...session,
        planning: planning._id,
      }));
      await Session.insertMany(session_docs);
    }

    //* Return planning with sessions
    return this.find_by_id(planning._id);
  }

  async find_by_id(id) {
    const planning = await Planning.findById(id)
      .populate("batch")
      .populate("component")
      .lean();

    if (!planning) return null;

    //* Fetch sessions for this planning
    const sessions = await Session.find({
      planning: id,
      status: { $ne: "deleted" },
    })
      .populate("teachers.teacher", "first_name last_name email")
      .lean();

    return { ...planning, sessions };
  }

  async find_all(filters = {}, options = {}, sort = { createdAt: -1 }) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const plannings = await Planning.find(filters)
      .populate("batch")
      .populate("component")
      .populate({
        path: "component",
        populate: {
          path: "program",
          select: "name",
        },
      })
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .lean();

    //* Fetch sessions for all plannings
    const planning_ids = plannings.map((p) => p._id);
    const all_sessions = await Session.find({
      planning: { $in: planning_ids },
      status: { $ne: "deleted" },
    })
      .populate("teachers.teacher", "first_name last_name email")
      .lean();

    //* Map sessions to their respective plannings
    const sessions_map = {};
    all_sessions.forEach((session) => {
      const planning_id = session.planning.toString();
      if (!sessions_map[planning_id]) {
        sessions_map[planning_id] = [];
      }
      sessions_map[planning_id].push(session);
    });

    //* Attach sessions to plannings
    const data = plannings.map((planning) => ({
      ...planning,
      sessions: sessions_map[planning._id.toString()] || [],
    }));

    return data;
  }

  async update(id, payload) {
    const { sessions, ...planning_data } = payload;

    //* Update planning
    await Planning.findByIdAndUpdate(id, planning_data, { new: true });

    //* Handle sessions update
    if (sessions && Array.isArray(sessions)) {
      //* Delete existing sessions for this planning
      await Session.updateMany({ planning: id }, { status: "deleted" });

      //* Create new sessions
      if (sessions.length > 0) {
        const session_docs = sessions.map((session) => ({
          ...session,
          planning: id,
        }));
        await Session.insertMany(session_docs);
      }
    }

    return this.find_by_id(id);
  }

  async delete(id) {
    //* Soft delete planning
    const data = await Planning.findByIdAndUpdate(
      id,
      { status: "deleted" },
      { new: true },
    );

    //* Soft delete associated sessions
    await Session.updateMany({ planning: id }, { status: "deleted" });

    return data;
  }

  async hard_delete(id) {
    //* Delete planning
    const data = await Planning.findByIdAndDelete(id);

    //* Delete associated sessions
    await Session.deleteMany({ planning: id });

    return data;
  }

  async total_count(filters = {}) {
    const data = await Planning.countDocuments(filters);
    return data;
  }

  async update_teacher_status(session_id, teacher_id, status) {
    //* Find the session where the teacher is assigned
    const session = await Session.findOne({
      _id: session_id,
      "teachers.teacher": teacher_id,
      status: { $ne: "deleted" },
    });

    if (!session) return null;

    //* Update teacher status in this session
    const teacher_entry = session.teachers.find(
      (t) => t.teacher.toString() === teacher_id,
    );
    if (teacher_entry) {
      teacher_entry.status = status;
      await session.save();
    }

    //* Return updated session with populated data
    return Session.findById(session_id)
      .populate("planning")
      .populate("teachers.teacher", "first_name last_name email");
  }

  async find_sessions_by_teacher(
    teacher_id,
    options = {},
    sort = { start_date: -1, start_time: -1 },
  ) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const pipeline = [
      //* Match sessions where teacher is assigned
      {
        $match: {
          "teachers.teacher": new mongoose.Types.ObjectId(teacher_id),
          status: { $ne: "deleted" },
        },
      },
      //* Extract teacher's status from the session
      {
        $addFields: {
          teacher_status: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$teachers",
                  as: "t",
                  cond: {
                    $eq: [
                      "$$t.teacher",
                      new mongoose.Types.ObjectId(teacher_id),
                    ],
                  },
                },
              },
              0,
            ],
          },
        },
      },
      //* Lookup planning details
      {
        $lookup: {
          from: "plannings",
          localField: "planning",
          foreignField: "_id",
          as: "planning_details",
        },
      },
      {
        $unwind: {
          path: "$planning_details",
          preserveNullAndEmptyArrays: true,
        },
      },
      //* Filter out deleted plannings
      {
        $match: {
          "planning_details.status": { $ne: "deleted" },
        },
      },
      //* Lookup component details
      {
        $lookup: {
          from: "components",
          localField: "planning_details.component",
          foreignField: "_id",
          as: "component_details",
        },
      },
      {
        $unwind: {
          path: "$component_details",
          preserveNullAndEmptyArrays: true,
        },
      },
      //* Lookup program details
      {
        $lookup: {
          from: "programs",
          localField: "component_details.program",
          foreignField: "_id",
          as: "program_details",
        },
      },
      {
        $unwind: { path: "$program_details", preserveNullAndEmptyArrays: true },
      },
      //* Lookup language details from program
      {
        $lookup: {
          from: "languages",
          localField: "program_details.language",
          foreignField: "_id",
          as: "language_details",
        },
      },
      {
        $unwind: {
          path: "$language_details",
          preserveNullAndEmptyArrays: true,
        },
      },
      //* Lookup city/location details from program
      {
        $lookup: {
          from: "cities",
          localField: "program_details.city",
          foreignField: "_id",
          as: "city_details",
        },
      },
      {
        $unwind: { path: "$city_details", preserveNullAndEmptyArrays: true },
      },
      //* Project session-wise data
      {
        $project: {
          _id: 1,
          planning_id: "$planning_details._id",
          program_uid: "$program_details.uid",
          program_name: "$program_details.name",
          module_name: "$component_details.name",
          language: "$language_details.name",
          location: "$city_details.name",
          venue: "$planning_details.venue",
          name: 1,
          session_date: 1,
          start_time: 1,
          end_time: 1,
          teacher_status: "$teacher_status.status",
          createdAt: 1,
          updatedAt: 1,
        },
      },
      //* Sort by session_date
      { $sort: sort },
      //* Pagination
      { $skip: skip },
      { $limit: limit },
    ];

    const data = await Session.aggregate(pipeline);
    return data;
  }

  async count_sessions_by_teacher(teacher_id) {
    //* Count sessions where teacher is assigned
    const result = await Session.aggregate([
      {
        $match: {
          "teachers.teacher": new mongoose.Types.ObjectId(teacher_id),
          status: { $ne: "deleted" },
        },
      },
      {
        $lookup: {
          from: "plannings",
          localField: "planning",
          foreignField: "_id",
          as: "planning_details",
        },
      },
      {
        $unwind: "$planning_details",
      },
      {
        $match: {
          "planning_details.status": { $ne: "deleted" },
        },
      },
      {
        $count: "total",
      },
    ]);

    return result.length > 0 ? result[0].total : 0;
  }
}

module.exports = new planning_service();
