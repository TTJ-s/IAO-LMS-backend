exports.generate_OTP = (length) => {
  const characters = "0123456789";
  const characters_length = characters.length;
  let otp = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters_length);
    otp += characters.charAt(randomIndex);
  }

  return otp;
};
