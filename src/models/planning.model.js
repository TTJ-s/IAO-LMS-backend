const mongoose = require("mongoose");

const session_schema = new mongoose.Schema({
  session_date: { type: Date },
  start_time: { type: Date },
  end_time: { type: Date },
  teachers: [
    {
      teacher: { type: mongoose.Types.ObjectId, ref: "User" },
      status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "active",
      },
    },
  ],
});

const planning_schema = new mongoose.Schema(
  {
    batch: { type: mongoose.Types.ObjectId, ref: "Batch" },
    component: { type: mongoose.Types.ObjectId, ref: "Component" },
    sessions: [session_schema],
    venue: { type: String, trim: true },
    status: {
      type: String,
      enum: ["inactive", "active"],
      default: "active",
    },
  },
  { timestamps: true },
);

planning_schema.index({ status: 1 });

const Planning = mongoose.model("Planning", planning_schema);

module.exports = Planning;
