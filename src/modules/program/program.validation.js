const Joi = require("joi");

exports.create_program_validation = Joi.object({
  name: Joi.string().required(),
  description: Joi.string(),
  program_type: Joi.string().required(),
  year: Joi.number().required(),
  city: Joi.string().required(),
  language: Joi.string().required(),
});

exports.update_program_validation = Joi.object({
  name: Joi.string(),
  description: Joi.string(),
  program_type: Joi.string(),
  status: Joi.boolean(),
  year: Joi.number(),
  city: Joi.string(),
  language: Joi.string(),
});
