const validation = require("./payment.validation");
const payment_service = require("./payment.service");
const logger = require("../../utils/logger");
const { error_response, success_response } = require("../../utils/response");
const { generate_counter } = require("../../utils/generate_counter");

class payment_controller {
  async create_payment(req, res) {
    try {
      const { error, value } = validation.create_payment_validation.validate(
        req.body,
      );
      if (error) {
        logger.warn({
          context: "payment.controller.create_payment",
          message: error.details[0].message,
          errors: error.details,
        });

        return error_response(res, {
          status: 400,
          message: error.details[0].message,
          errors: error.details,
        });
      }
      value.user = req.user._id;
      const counter = await generate_counter("payment");
      const padded_counter = String(counter).padStart(2, "0");
      const uid = `IAO-PY-${padded_counter}`;
      value.uid = uid;
      const payment = await payment_service.create_mollie_payment(
        value.amount,
        value.currency,
        value.user,
        value.purpose,
        value.uid,
      );
      value.transaction_id = payment.id;
      await payment_service.create(value);
      const checkout_url = payment.getCheckoutUrl();
      return success_response(res, {
        status: 201,
        message: "Payment created successfully",
        data: checkout_url,
      });
    } catch (error) {
      logger.error({
        context: "payment.controller.create_payment",
        message: error.message,
        errors: error.stack,
      });
      return error_response(res, {
        status: 500,
        message: error.message,
        errors: error.stack,
      });
    }
  }

  async get_payments(req, res) {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const filters = {};
      const options = {
        page,
        limit,
      };
      const sort = {};
      if (status) {
        filters.status = status;
      }
      const data = await payment_service.find_all(filters, options, sort);
      return success_response(res, {
        status: 200,
        message: "Payments fetched successfully",
        data,
      });
    } catch (error) {
      logger.error({
        context: "payment.controller.get_payments",
        message: error.message,
        errors: error.stack,
      });
      return error_response(res, {
        status: 500,
        message: error.message,
        errors: error.stack,
      });
    }
  }

  async get_payment_by_uid(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return error_response(res, {
          status: 400,
          message: "Payment ID is required",
        });
      }
      const data = await payment_service.find_by_uid(id);
      if (!data) {
        return error_response(res, {
          status: 404,
          message: "Payment not found",
        });
      }
      return success_response(res, {
        status: 200,
        message: "Payment found successfully",
        data,
      });
    } catch (error) {
      logger.error({
        context: "payment.controller.get_payment",
        message: error.message,
        errors: error.stack,
      });
      return error_response(res, {
        status: 500,
        message: error.message,
        errors: error.stack,
      });
    }
  }

  async webhook(req, res) {
    try {
      const { id } = req.body;

      //* Validate payment ID format (Mollie IDs start with 'tr_')
      if (!id || typeof id !== "string" || !id.startsWith("tr_")) {
        logger.warn({
          context: "payment.controller.webhook",
          message: "Invalid payment ID format",
          received_id: id,
          ip: req.ip,
        });
        return error_response(res, {
          status: 400,
          message: "Invalid payment ID",
        });
      }

      //* Fetch payment from Mollie API (this is the source of truth)
      let mollie_payment;
      try {
        mollie_payment = await payment_service.get_mollie_payment(id);
      } catch (mollie_error) {
        //* If Mollie returns 404, payment doesn't exist on their end
        logger.warn({
          context: "payment.controller.webhook",
          message: "Failed to fetch payment from Mollie",
          payment_id: id,
          error: mollie_error.message,
        });
        return error_response(res, {
          status: 404,
          message: "Payment not found in payment provider",
        });
      }

      //* Verify the payment exists in our database
      const payment = await payment_service.find_by_transaction_id(id);
      if (!payment) {
        logger.warn({
          context: "payment.controller.webhook",
          message: "Payment not found in database",
          payment_id: id,
        });
        //* Return 200 to prevent Mollie from retrying (payment may have been deleted)
        return success_response(res, {
          status: 200,
          message: "Payment acknowledged",
        });
      }

      //* Verify the payment belongs to our application (metadata check)
      if (mollie_payment.metadata?.user_id !== payment.user?.toString()) {
        logger.warn({
          context: "payment.controller.webhook",
          message: "Payment metadata mismatch - possible tampering",
          payment_id: id,
          expected_user: payment.user?.toString(),
          received_user: mollie_payment.metadata?.user_id,
        });
        return error_response(res, {
          status: 403,
          message: "Payment verification failed",
        });
      }
      if (mollie_payment.status === "paid") {
        payment.status = "paid";
        //TODO: create invoice
      } else if (mollie_payment.status === "failed") {
        payment.status = "failed";
      } else if (mollie_payment.status === "canceled") {
        payment.status = "canceled";
      }
      if (payment.application) {
        await payment_service.update_application_status(
          payment.application,
          payment.status,
        );
      }
      await payment.save();
      return success_response(res, {
        status: 200,
        message: "Payment updated successfully",
        data: payment,
      });
    } catch (error) {
      logger.error({
        context: "payment.controller.webhook",
        message: error.message,
        errors: error.stack,
      });
      return error_response(res, {
        status: 500,
        message: error.message,
        errors: error.stack,
      });
    }
  }
}

module.exports = new payment_controller();
