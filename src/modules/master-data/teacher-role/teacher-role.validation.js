const Joi = require("joi");

exports.create_teacher_role_validation = Joi.object({
  name: Joi.string().required(),
});

exports.update_teacher_role_validation = Joi.object({
  name: Joi.string(),
  status: Joi.boolean(),
});
