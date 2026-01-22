const mongoose = require("mongoose");

const language_schema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

language_schema.index({ name: 1 });
language_schema.index({ status: 1 });

const Language = mongoose.model("Language", language_schema);

module.exports = Language;
