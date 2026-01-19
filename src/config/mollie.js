const { createMollieClient } = require("@mollie/api-client");

module.exports = createMollieClient({
  apiKey: process.env.MOLLIE_API_KEY,
});
