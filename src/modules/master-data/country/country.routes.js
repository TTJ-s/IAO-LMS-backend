const express = require("express");
const country_controller = require("./country.controller");
const router = express.Router();

router
  .route("/")
  .post(country_controller.create_country)
  .get(country_controller.get_countries);

router
  .route("/:id")
  .put(country_controller.update_country)
  .delete(country_controller.delete_country);

module.exports = router;
