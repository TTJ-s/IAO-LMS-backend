const Joi = require("joi");

exports.create_country_validation = Joi.object({
  name: Joi.string().required(),
  code: Joi.string().required(),
  currency: Joi.string().required(),
});

exports.update_country_validation = Joi.object({
  name: Joi.string(),
  code: Joi.string(),
  currency: Joi.string(),
  status: Joi.boolean(),
});
