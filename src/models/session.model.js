const mongoose = require("mongoose");

const session_schema = new mongoose.Schema(
  {
    planning: {
      type: mongoose.Types.ObjectId,
      ref: "Planning",
      required: true,
    },
    name: { type: String, trim: true },
    session_date: { type: Date },
    start_time: { type: Date },
    end_time: { type: Date },
    teachers: [
      {
        teacher: { type: mongoose.Types.ObjectId, ref: "User" },
        status: {
          type: String,
          enum: ["pending", "accepted", "rejected"],
          default: "pending",
        },
      },
    ],
    status: {
      type: String,
      enum: ["inactive", "active", "deleted"],
      default: "active",
    },
  },
  { timestamps: true },
);

session_schema.index({ planning: 1 });
session_schema.index({ "teachers.teacher": 1 });
session_schema.index({ status: 1 });

const Session = mongoose.model("Session", session_schema);

module.exports = Session;
