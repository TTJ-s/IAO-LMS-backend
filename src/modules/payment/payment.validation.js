const Joi = require("joi");

exports.create_payment_validation = Joi.object({
  amount: Joi.number().required(),
  currency: Joi.string().required(),
  purpose: Joi.string().required().valid("admission-fee", "module-purchase"),
  application: Joi.string(),
  module: Joi.string(),
});
