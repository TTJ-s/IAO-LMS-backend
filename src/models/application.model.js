const mongoose = require("mongoose");

const application_schema = new mongoose.Schema(
  {
    uid: { type: String, trim: true },
    user: { type: mongoose.Types.ObjectId, ref: "User" },
    intake: { type: mongoose.Types.ObjectId, ref: "Intake" }, //* remove intake ref after application is approved
    batch: { type: mongoose.Types.ObjectId, ref: "Batch" }, //* Add batch after application is approved
    id_card: {
      url: { type: String, trim: true },
      flag: { type: Boolean, default: false },
    },
    qualification_certificate: {
      url: { type: String, trim: true },
      flag: { type: Boolean, default: false },
    },
    remarks: { type: String, trim: true },
    payment_amount: { type: Number, default: 0 },
    payment_status: {
      type: String,
      trim: true,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    current_step: { type: Number, default: 0 },
    decision_date: { type: Date },
    status: {
      type: String,
      enum: [
        "pending",
        "drafted",
        "waitlisted",
        "resubmitted",
        "approved",
        "rejected",
      ],
      default: "pending",
    },
  },
  { timestamps: true }
);

application_schema.index({ user: 1 });
application_schema.index({ status: 1 });
application_schema.index({ batch: 1 });

const Application = mongoose.model("Application", application_schema);

module.exports = Application;
