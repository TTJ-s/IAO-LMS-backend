const mongoose = require("mongoose");

const user_schema = new mongoose.Schema(
  {
    uid: { type: String, trim: true },
    first_name: { type: String, trim: true },
    last_name: { type: String, trim: true },
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
    previous_education: { type: String, trim: true },
    address: { type: String, trim: true },
    postal_code: { type: String, trim: true },
    city: { type: String, trim: true },
    country: { type: String, trim: true },
    otp: { type: String, trim: true },
    otp_tracking: {
      created_at: { type: Date },
      failed_attempts: { type: Number, default: 0 },
      locked_until: { type: Date },
      send_attempts: { type: Number, default: 0 },
      send_locked_until: { type: Date },
    },
    role: {
      type: String,
      enum: ["student", "admin", "teacher"],
      default: "student",
    },
    role_access: {
      type: mongoose.Types.ObjectId,
      ref: "Role",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "deleted"],
      default: "active",
    },
    //* GDPR-compliant JWT token management
    //* token_version is used for token revocation (logout, password change)
    //* Incrementing this invalidates all previously issued tokens
    token_version: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

user_schema.index({ email: 1 });
user_schema.index({ phone: 1 });
user_schema.index({ role_access: 1 });
user_schema.index({ email: 1, phone: 1 });
user_schema.index({ role: 1, status: 1 });

user_schema.index({
  first_name: "text",
  last_name: "text",
});

const User = mongoose.model("User", user_schema);

module.exports = User;
