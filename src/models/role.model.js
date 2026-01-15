const mongoose = require("mongoose");

const role_schema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    description: { type: String, trim: true },
    permissions: [{ type: String, trim: true }],
    status: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

role_schema.index({ name: 1 });
role_schema.index({ status: 1 });

const Role = mongoose.model("Role", role_schema);

module.exports = Role;
