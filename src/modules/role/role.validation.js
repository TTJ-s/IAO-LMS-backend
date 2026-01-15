const Joi = require("joi");

exports.create_role_validation = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  permissions: Joi.array().required(),
});

exports.update_role_validation = Joi.object({
  name: Joi.string(),
  description: Joi.string(),
  permissions: Joi.array(),
  status: Joi.boolean(),
});
