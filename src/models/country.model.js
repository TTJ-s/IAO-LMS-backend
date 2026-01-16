const mongoose = require("mongoose");

const country_schema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    code: { type: String, trim: true },
    currency: { type: String, trim: true, uppercase: true },
    status: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

country_schema.index({ name: 1 });
country_schema.index({ status: 1 });

const Country = mongoose.model("Country", country_schema);

module.exports = Country;
