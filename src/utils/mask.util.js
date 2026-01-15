//* GDPR-safe masking utilities
//* Use for logs, admin responses, analytics, audit trails

const mask_email = (email = "") => {
  if (!email || !email.includes("@")) return "";

  const [local, domain] = email.split("@");
  const visible_local = local.slice(0, 2);
  const masked_local = `${visible_local}${"*".repeat(
    Math.max(local.length - 2, 3)
  )}`;

  const domain_parts = domain.split(".");
  const visible_domain = domain_parts[0].slice(0, 1);
  const masked_domain = `${visible_domain}${"*".repeat(
    Math.max(domain_parts[0].length - 1, 3)
  )}`;

  return `${masked_local}@${masked_domain}.${domain_parts.slice(1).join(".")}`;
};

const mask_phone = (phone = "") => {
  if (!phone) return "";

  const cleaned = phone.replace(/\s+/g, "");
  if (cleaned.length < 6) return "***";

  const start = cleaned.slice(0, 3);
  const end = cleaned.slice(-2);

  return `${start}${"*".repeat(cleaned.length - 5)}${end}`;
};

const mask_user_contact = (user = {}, expose_PII = false) => {
  if (expose_PII) {
    return {
      email: user.email || null,
      phone: user.phone || null,
    };
  }

  return {
    email: mask_email(user.email),
    phone: mask_phone(user.phone),
  };
};

module.exports = {
  mask_email,
  mask_phone,
  mask_user_contact,
};
