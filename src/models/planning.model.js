const mongoose = require("mongoose");

const planning_schema = new mongoose.Schema(
  {
    batch: { type: mongoose.Types.ObjectId, ref: "Batch" },
    component: { type: mongoose.Types.ObjectId, ref: "Component" },
    description: { type: String, trim: true },
    venue: { type: String, trim: true },
    status: {
      type: String,
      enum: ["inactive", "active", "deleted"],
      default: "active",
    },
  },
  { timestamps: true },
);

planning_schema.index({ status: 1 });

const Planning = mongoose.model("Planning", planning_schema);

module.exports = Planning;
