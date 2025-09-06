const bcrypt = require('bcrypt');

exports.hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

exports.comparePassword = async (candidatePassword, hashedPassword) => {
  if (!hashedPassword) return false;
  return bcrypt.compare(candidatePassword, hashedPassword);
};
