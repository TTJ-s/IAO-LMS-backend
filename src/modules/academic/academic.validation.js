const Joi = require("joi");

exports.create_academic_validation = Joi.object({
  name: Joi.string().required(),
  registartion_start_date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Registration Start date must be in YYYY-MM-DD format.",
    }),
  start_date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({
      "string.pattern.base": "Start date must be in YYYY-MM-DD format.",
    }),
  end_date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({
      "string.pattern.base": "End date must be in YYYY-MM-DD format.",
    }),
  registartion_end_date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Registration End date must be in YYYY-MM-DD format.",
    }),
  status: Joi.boolean().required(),
});

exports.update_academic_validation = Joi.object({
  name: Joi.string(),
  registartion_start_date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .messages({
      "string.pattern.base":
        "Registration Start date must be in YYYY-MM-DD format.",
    }),
  registartion_end_date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .messages({
      "string.pattern.base":
        "Registration End date must be in YYYY-MM-DD format.",
    }),
  status: Joi.boolean(),
});
