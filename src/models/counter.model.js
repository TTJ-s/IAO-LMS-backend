const mongoose = require("mongoose");

const counter_schema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    admin_sequence_value: { type: Number, default: 0 },
    program_sequence_value: { type: Number, default: 0 },
    intake_sequence_value: { type: Number, default: 0 },
    application_sequence_value: { type: Number, default: 0 },
    batch_sequence_value: { type: Number, default: 0 },
    payment_sequence_value: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Counter = mongoose.model("Counter", counter_schema);

module.exports = Counter;
