const mongoose = require("mongoose");

const teacher_role_schema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

teacher_role_schema.index({ name: 1 });
teacher_role_schema.index({ status: 1 });

const TeacherRole = mongoose.model("TeacherRole", teacher_role_schema);

module.exports = TeacherRole;
