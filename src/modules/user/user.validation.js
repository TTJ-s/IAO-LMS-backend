const Joi = require("joi");

exports.create_admin_validation = Joi.object({
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  email: Joi.string().required(),
  phone: Joi.string().required(),
  role_access: Joi.string().required(),
});
