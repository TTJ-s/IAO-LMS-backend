//* Application logger
//* GDPR-safe (no PII)

const is_prod = process.env.NODE_ENV === "production";

const logger = {
  info: (...args) => {
    if (!is_prod) {
      console.log("ℹ️", ...args);
    }
  },

  warn: (...args) => {
    console.warn("⚠️", ...args);
  },

  error: (...args) => {
    console.error("❌", ...args);
  },
};

module.exports = logger;
