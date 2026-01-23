const Academic = require("./academic.model");
const Application = require("./application.model");
const Batch = require("./batch.model");
const City = require("./city.model");
const Component = require("./components.model");
const Counter = require("./counter.model");
const Country = require("./country.model");
const Intake = require("./intake.model");
const Language = require("./language.model");
const Payment = require("./payment.model");
const Program = require("./program.model");
const Role = require("./role.model");
const TeacherRole = require("./teacher_roles.model");
const TeacherTitle = require("./teacher_title.model");
const User = require("./user.model");

module.exports = {
  User,
  Role,
  Counter,
  Country,
  City,
  Language,
  Program,
  Intake,
  Application,
  Batch,
  Payment,
  Academic,
  TeacherTitle,
  TeacherRole,
  Component,
};
