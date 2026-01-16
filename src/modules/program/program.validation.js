const Joi = require("joi");

exports.create_program_validation = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  program_type: Joi.string().required(),
  year: Joi.string().required(),
  city: Joi.string().required(),
  language: Joi.string().required(),
});

exports.update_program_validation = Joi.object({
  name: Joi.string(),
  description: Joi.string(),
  program_type: Joi.string(),
  status: Joi.boolean(),
  year: Joi.string(),
  city: Joi.string(),
  language: Joi.string(),
});
