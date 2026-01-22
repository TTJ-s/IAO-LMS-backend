const Joi = require("joi");

exports.create_teacher_title_validation = Joi.object({
  name: Joi.string().required(),
});

exports.update_teacher_title_validation = Joi.object({
  name: Joi.string(),
  status: Joi.boolean(),
});
