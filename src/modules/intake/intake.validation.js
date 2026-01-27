const Joi = require("joi");

exports.create_intake_validation = Joi.object({
  name: Joi.string(),
  program: Joi.array().required(),
  academic: Joi.string().required(),
  admission_fee: Joi.number().required(),
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
  registration_deadline: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Registration deadline must be in YYYY-MM-DD format.",
    }),
  student_per_batch: Joi.number().required(),
  max_student_enrollment: Joi.number().required(),
});

exports.update_intake_validation = Joi.object({
  name: Joi.string(),
  program: Joi.array(),
  academic: Joi.string(),
  admission_fee: Joi.number(),
  start_date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .messages({
      "string.pattern.base": "Start date must be in YYYY-MM-DD format.",
    }),
  end_date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .messages({
      "string.pattern.base": "End date must be in YYYY-MM-DD format.",
    }),
  registration_deadline: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .messages({
      "string.pattern.base":
        "Registration deadline must be in YYYY-MM-DD format.",
    }),
  student_per_batch: Joi.number(),
  max_student_enrollment: Joi.number(),
  status: Joi.string().valid("open", "closed", "deleted"),
});
