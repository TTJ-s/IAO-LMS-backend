const mongoose = require("mongoose");

const batch_schema = new mongoose.Schema(
  {
    uid: { type: String, trim: true },
    name: { type: String, trim: true },
    student_count: { type: Number, default: 0 },
    intake: { type: mongoose.Types.ObjectId, ref: "Intake" },
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
  },
  { timestamps: true }
);

batch_schema.index({ name: 1 });
batch_schema.index({ status: 1 });

const Batch = mongoose.model("Batch", batch_schema);

module.exports = Batch;
