const Joi = require("joi");

exports.create_city_validation = Joi.object({
  name: Joi.string().required(),
  country: Joi.string().required(),
});

exports.update_city_validation = Joi.object({
  name: Joi.string(),
  country: Joi.string(),
  status: Joi.boolean(),
});
