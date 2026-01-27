const Joi = require("joi");

exports.create_admin_validation = Joi.object({
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
  }),
  phone: Joi.string().required(),
  role_access: Joi.string().required(),
});

exports.update_profile_validation = Joi.object({
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  phone: Joi.string().required(),
  previous_education: Joi.string().required(),
  address: Joi.string(),
  postal_code: Joi.string(),
  country: Joi.string(),
  city: Joi.string(),
});

exports.create_teacher_validation = Joi.object({
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
  }),
  phone: Joi.string().required(),
  location: Joi.array().items(Joi.string()).required(),
  language: Joi.array().items(Joi.string()).required(),
  academic_degree: Joi.string().required(),
  teacher_role: Joi.string().required(),
  iao_employment_start_date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({
      "string.pattern.base":
        "IAO employment start date must be in YYYY-MM-DD format.",
    }),
});

exports.update_teacher_validation = Joi.object({
  first_name: Joi.string(),
  last_name: Joi.string(),
  email: Joi.string().email().messages({
    "string.email": "Please provide a valid email address",
  }),
  phone: Joi.string(),
  location: Joi.array().items(Joi.string()),
  language: Joi.array().items(Joi.string()),
  academic_degree: Joi.string(),
  teacher_role: Joi.string(),
  iao_employment_start_date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .messages({
      "string.pattern.base":
        "IAO employment start date must be in YYYY-MM-DD format.",
    }),
  status: Joi.boolean(),
});
