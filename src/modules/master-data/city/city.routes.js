const express = require("express");
const city_controller = require("./city.controller");
const router = express.Router();

router
  .route("/")
  .post(city_controller.create_city)
  .get(city_controller.get_cities);

router
  .route("/:id")
  .put(city_controller.update_city)
  .delete(city_controller.delete_city);

module.exports = router;
