const { Batch } = require("../../models");
const moment = require("moment-timezone");

class batch_service {
  async create_batch(payload) {
    const data = Batch.create(payload);
    return data;
  }

  async find_batch_by_intake(intake) {
    const data = await Batch.find({ intake }).populate(
      "intake",
      "max_student_enrollment student_per_batch"
    );
    return data;
  }

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
}

module.exports = new batch_service();
