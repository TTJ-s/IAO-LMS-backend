const Joi = require("joi");

const session_schema = Joi.object({
  session_date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .messages({
      "string.pattern.base": "Session date must be in YYYY-MM-DD format.",
    }),
  start_time: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .required()
    .messages({
      "string.pattern.base": "Start time must be in HH:mm (24-hour) format",
    }),
  end_time: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .required()
    .messages({
      "string.pattern.base": "End time must be in HH:mm (24-hour) format",
    }),
  teachers: Joi.array().items(
    Joi.object({
      teacher: Joi.string().messages({
        "string.length": "Teacher ID must be a valid ObjectId",
      }),
      status: Joi.string()
        .valid("pending", "accepted", "rejected")
        .default("pending"),
    }),
  ),
});

exports.create_planning_validation = Joi.object({
  batch: Joi.string().required(),
  component: Joi.string().required(),
  description: Joi.string().required(),
  sessions: Joi.array().items(session_schema).required(),
  venue: Joi.string().required(),
  status: Joi.string(),
});

exports.update_planning_validation = Joi.object({
  batch: Joi.string(),
  component: Joi.string(),
  description: Joi.string(),
  sessions: Joi.array().items(session_schema),
  venue: Joi.string(),
  status: Joi.string(),
});
