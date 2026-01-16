const mongoose = require("mongoose");

const intake_schema = new mongoose.Schema(
  {
    uid: { type: String, trim: true },
    name: { type: String, trim: true },
    program: {
      type: mongoose.Types.ObjectId,
      ref: "Program",
    },
    admission_fee: { type: Number, default: 0 },
    start_date: { type: Date },
    end_date: { type: Date },
    registration_deadline: { type: Date },
    student_per_batch: { type: Number, default: 0 },
    max_student_enrollment: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["open", "closed", "deleted"],
      default: "open",
    },
  },
  { timestamps: true }
);

intake_schema.index({ name: 1 });
intake_schema.index({ program: 1 });
intake_schema.index({ status: 1 });

const Intake = mongoose.model("Intake", intake_schema);

module.exports = Intake;
