const express = require("express");
const language_controller = require("./language.controller");
const router = express.Router();

router
  .route("/")
  .post(language_controller.create)
  .get(language_controller.get_languages);

router
  .route("/:id")
  .put(language_controller.update_language)
  .delete(language_controller.delete_language);

module.exports = router;
