const mongoose = require("mongoose");

const payment_schema = new mongoose.Schema(
  {
    uid: { type: String, trim: true },
    user: { type: mongoose.Types.ObjectId, ref: "User" },
    transaction_id: { type: String, trim: true },
    amount: { type: Number, default: 0 },
    currency: { type: String, trim: true },
    invoice: { type: String, trim: true },
    purpose: {
      type: String,
      trim: true,
      enum: ["admission-fee", "module-purchase"],
    },
    application: {
      type: mongoose.Types.ObjectId,
      ref: "Application",
    },
    // module: {
    //   type: mongoose.Types.ObjectId,
    //   ref: "Module",
    // }, //TODO: uncomment after module is added
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "canceled"],
      default: "pending",
    },
  },
  { timestamps: true },
);

payment_schema.index({ user: 1 });
payment_schema.index({ status: 1 });
payment_schema.index({ purpose: 1 });
payment_schema.index({ transaction_id: 1 });

const Payment = mongoose.model("Payment", payment_schema);

module.exports = Payment;
