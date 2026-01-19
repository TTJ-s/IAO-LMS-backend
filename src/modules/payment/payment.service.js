const mollie = require("../../config/mollie");
const { Payment } = require("../../models");

class payment_service {
  async create_mollie_payment(amount, currency, user, purpose) {
    const payment = await mollie.payments.create({
      amount: {
        currency: currency,
        value: amount.toFixed(2),
      },
      description: `IAO Payment for ${purpose}`,
      redirectUrl: process.env.MOLLIE_REDIRECT_URL,
      webhookUrl: process.env.MOLLIE_WEBHOOK_URL,
      metadata: {
        user_id: user,
      },
    });

    return payment;
  }

  async get_mollie_payment(id) {
    const payment = await mollie.payments.get(id);
    return payment;
  }

  async create(payload) {
    const data = await Payment.create(payload);
    return data;
  }

  async find_by_id(id) {
    const data = await Payment.findById(id);
    return data;
  }

  async find_by_transaction_id(id) {
    const data = await Payment.findOne({ transaction_id: id });
    return data;
  }

  async find_all(filters = {}, options = {}, sort = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;
    const data = await Payment.find(filters).skip(skip).limit(limit).sort(sort);
    return data;
  }

  async update(id, payload) {
    const data = await Payment.findByIdAndUpdate(id, payload, { new: true });
    return data;
  }

  async total_count(filters = {}) {
    const data = await Payment.countDocuments(filters);
    return data;
  }
}

module.exports = new payment_service();
