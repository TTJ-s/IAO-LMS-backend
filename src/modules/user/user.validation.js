const Joi = require("joi");

exports.create_admin_validation = Joi.object({
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  email: Joi.string().required(),
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
  email: Joi.string().required(),
  phone: Joi.string().required(),
  location: Joi.array().items(Joi.string()).required(),
  language: Joi.array().items(Joi.string()).required(),
  qualification: Joi.string().required(),
  status: Joi.boolean(),
});
