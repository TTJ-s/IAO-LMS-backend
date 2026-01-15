const mongoose = require("mongoose");

const counter_schema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    admin_sequence_value: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Counter = mongoose.model("Counter", counter_schema);

module.exports = Counter;
