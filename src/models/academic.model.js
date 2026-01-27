const mongoose = require("mongoose");

const academic_schema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    registartion_start_date: { type: Date },
    registartion_end_date: { type: Date },
    start_date: { type: Date },
    end_date: { type: Date },
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

academic_schema.index({ name: 1 });
academic_schema.index({ status: 1 });
academic_schema.index({ registartion_start_date: 1 });
academic_schema.index({ registartion_end_date: 1 });

const Academic = mongoose.model("Academic", academic_schema);

module.exports = Academic;
