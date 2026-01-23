const mongoose = require("mongoose");

const component_schema = new mongoose.Schema(
  {
    uid: { type: String, trim: true },
    program: {
      type: mongoose.Types.ObjectId,
      ref: "Program",
    },
    type: {
      type: String,
      trim: true,
      enum: ["module", "app", "resource", "exam"],
    },
    name: { type: String, trim: true },
    year: { type: Number, default: 1 },
    files: [
      {
        url: { type: String, trim: true },
        name: { type: String, trim: true },
        type: { type: String, trim: true },
      },
    ],
    amount: { type: Number, default: 0 },
    currency: { type: String, trim: true },
    submission_deadline: { type: Date }, //* For APP
    instruction: { type: String, trim: true },
    submissions: {
      case_studies: { type: Boolean },
      essays: { type: Boolean },
      internships: { type: Boolean },
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

component_schema.index({ type: 1 });
component_schema.index({ program: 1 });

const Component = mongoose.model("Component", component_schema);

module.exports = Component;
