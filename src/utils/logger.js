//* Application logger
//* GDPR-safe (no PII)

const is_prod = process.env.NODE_ENV === "production";

const logger = {
  info: (...args) => {
    console.log("[INFO]", ...args);
  },

  warn: (...args) => {
    console.warn("[WARN]", ...args);
  },

  error: (...args) => {
    console.error("[ERROR]", ...args);
  },

  debug: (...args) => {
    if (!is_prod) {
      console.log("[DEBUG]", ...args);
    }
  },
};

module.exports = logger;
