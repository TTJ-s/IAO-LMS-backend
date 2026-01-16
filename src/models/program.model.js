const mongoose = require("mongoose");

const program_schema = new mongoose.Schema(
  {
    uid: { type: String, trim: true },
    name: { type: String, trim: true },
    description: { type: String, trim: true },
    program_type: { type: String, trim: true },
    year: { type: String, trim: true },
    city: {
      type: mongoose.Types.ObjectId,
      ref: "City",
    },
    language: {
      type: mongoose.Types.ObjectId,
      ref: "Language",
    },
    status: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

program_schema.index({ city: 1 });
program_schema.index({ language: 1 });
program_schema.index({ status: 1 });
program_schema.index({ program_type: 1 });

program_schema.index({
  name: "text",
  description: "text",
});

const Program = mongoose.model("Program", program_schema);

module.exports = Program;
