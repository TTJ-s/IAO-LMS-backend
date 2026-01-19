const { Batch } = require("../../models");
const { Intake } = require("../../models");
const mongoose = require("mongoose");
const moment = require("moment-timezone");
const logger = require("../../utils/logger");
const { generate_counter } = require("../../utils/generate_counter");

class batch_service {
  create_batch_name(intake_name, start_date, end_date, count) {
    //* Extract year from date using moment
    const extract_year = (date) => {
      return moment(date).year();
    };

    //* Convert count to letter (1=A, 2=B, 3=C, etc.)
    const count_to_letter = (count) => {
      return String.fromCharCode(64 + count); //* A=65, B=66, etc.
    };

    const start_year = extract_year(start_date);
    const end_year = extract_year(end_date);
    const letter = count_to_letter(count);

    return `${start_year}-${end_year} ${intake_name}-${letter}`;
  }

  async assign_or_create_batch(intake_id, application_id) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      if (!intake_id) {
        logger.error({
          context: "batch_service.assign_or_create_batch",
          message: "Intake ID not found",
          application_id,
        });
        throw new Error("Application intake information is missing");
      }

      const intake = await Intake.findById(intake_id).session(session);
      if (!intake) {
        logger.error({
          context: "batch_service.assign_or_create_batch",
          message: "Intake not found",
          intake_id,
        });
        throw new Error("Intake not found");
      }

      const student_per_batch = intake.student_per_batch;
      if (!student_per_batch || student_per_batch <= 0) {
        logger.error({
          context: "batch_service.assign_or_create_batch",
          message: "Invalid student_per_batch value in intake",
          intake_id,
          student_per_batch,
        });
        throw new Error("Invalid batch configuration for this intake");
      }

      //* Find with write lock to prevent race conditions
      let assigned_batch = await Batch.findOne({
        intake: intake_id,
        status: "open",
        is_full_filled: false,
      })
        .session(session)
        .populate("intake", "max_student_enrollment student_per_batch");

      let is_newly_created = false;

      if (!assigned_batch) {
        //* Create new batch if no open batch exists
        is_newly_created = true;
        const batch_count = await Batch.countDocuments(
          { intake: intake_id },
          { session },
        );
        const new_batch_number = batch_count + 1;
        const batch_name = this.create_batch_name(
          intake.name,
          intake.start_date,
          intake.end_date,
          new_batch_number,
        );

        const counter = await generate_counter("batch");
        const padded_counter = String(counter).padStart(2, "0");
        const batch_uid = `B-${padded_counter}`;

        const new_batch_payload = {
          uid: batch_uid,
          name: batch_name,
          intake: intake_id,
          student_count: 1,
          is_full_filled: student_per_batch === 1 ? true : false,
          status: "open",
        };

        const created_batch = await Batch.create([new_batch_payload], {
          session,
        });
        assigned_batch = created_batch[0];

        logger.info({
          context: "batch_service.assign_or_create_batch",
          message: "New batch created successfully",
          batch_id: assigned_batch._id,
          batch_name,
          application_id,
        });
      } else {
        //* Update existing batch - increment student count
        const updated_student_count = assigned_batch.student_count + 1;
        const is_full = updated_student_count >= student_per_batch;

        const updated_batch = await Batch.findByIdAndUpdate(
          assigned_batch._id,
          {
            student_count: updated_student_count,
            is_full_filled: is_full,
          },
          { new: true, session },
        );

        assigned_batch = updated_batch;

        logger.info({
          context: "batch_service.assign_or_create_batch",
          message: "Batch updated with new student",
          batch_id: assigned_batch._id,
          student_count: updated_student_count,
          is_full_filled: is_full,
          application_id,
        });
      }

      await session.commitTransaction();

      return {
        batch_id: assigned_batch._id,
        is_newly_created,
      };
    } catch (error) {
      await session.abortTransaction();
      logger.error({
        context: "batch_service.assign_or_create_batch",
        message: "Error during batch assignment - transaction rolled back",
        error: error.message,
        error_stack: error.stack,
        intake_id,
        application_id,
      });
      throw error;
    } finally {
      await session.endSession();
    }
  }
}

module.exports = new batch_service();
