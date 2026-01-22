const mongoose = require("mongoose");

const teacher_title_schema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

teacher_title_schema.index({ name: 1 });
teacher_title_schema.index({ status: 1 });

const TeacherTitle = mongoose.model("TeacherTitle", teacher_title_schema);

module.exports = TeacherTitle;
