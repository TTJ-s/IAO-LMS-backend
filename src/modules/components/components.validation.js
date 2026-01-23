const Joi = require("joi");

const common_fields = {
  program: Joi.string().required(),
  type: Joi.string().required(),
  name: Joi.string().required(),
  year: Joi.number().required(),
  files: Joi.array()
    .items(
      Joi.object({
        url: Joi.string().required(),
        name: Joi.string().required(),
      }),
    )
    .required(),
  status: Joi.boolean(),
};

const submissions_schema = Joi.object({
  case_studies: Joi.boolean(),
  essays: Joi.boolean(),
  internships: Joi.boolean(),
}).unknown(false);

exports.create_module_component_validation = Joi.object({
  ...common_fields,
  amount: Joi.number().required(),
});

exports.create_app_component_validation = Joi.object({
  ...common_fields,
  amount: Joi.number().required(),
  submission_deadline: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Submission deadline must be in YYYY-MM-DD format.",
    }),
  instruction: Joi.string().required(),
  submissions: submissions_schema,
});

exports.create_resource_component_validation = Joi.object({
  ...common_fields,
});

exports.update_module_component_validation = Joi.object({
  amount: Joi.number(),
  files: Joi.array().items(
    Joi.object({
      url: Joi.string(),
      name: Joi.string(),
    }),
  ),
  year: Joi.number(),
  status: Joi.boolean(),
  submission_deadline: Joi.string(),
  instruction: Joi.string(),
  submissions: Joi.array().items(
    Joi.object({ case_studies: Joi.boolean() }),
    Joi.object({ essays: Joi.boolean() }),
    Joi.object({ internships: Joi.boolean() }),
  ),
});
