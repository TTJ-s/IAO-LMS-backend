const Joi = require("joi");

exports.create_language_validation = Joi.object({
  name: Joi.string().required(),
});

exports.update_language_validation = Joi.object({
  name: Joi.string(),
  status: Joi.boolean(),
});
