const mongoose = require("mongoose");

const city_schema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    country: {
      type: mongoose.Types.ObjectId,
      ref: "Country",
    },
    status: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

city_schema.index({ name: 1 });
city_schema.index({ status: 1 });

const City = mongoose.model("City", city_schema);

module.exports = City;
