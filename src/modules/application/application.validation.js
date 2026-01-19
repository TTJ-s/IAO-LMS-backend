const Joi = require("joi");

exports.create_application_validation = Joi.object({
  user: Joi.string().required(),
  intake: Joi.string().required(),
  id_card: Joi.object({
    url: Joi.string().required(),
  }),
  qualification_certificate: Joi.object({
    url: Joi.string(),
  }),
  remarks: Joi.string().required(),
  payment_amount: Joi.number().required(),
  is_paymentable: Joi.boolean().required(),
});

exports.update_application_validation = Joi.object({
  id_card: Joi.object({
    url: Joi.string(),
  }),
  qualification_certificate: Joi.object({
    url: Joi.string(),
  }),
});

exports.update_application_status_validation = Joi.object({
  status: Joi.string()
    .required()
    .valid("pending", "waitlisted", "approved", "rejected"),
  remarks: Joi.string(),
  id_card: Joi.object({
    flag: Joi.boolean(),
  }),
  qualification_certificate: Joi.object({
    flag: Joi.boolean(),
  }),
  decision_date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .messages({
      "string.pattern.base": "Start date must be in YYYY-MM-DD format.",
    }),
});
