const User = require('../models/user.model');
const { hashPassword, comparePassword } = require('../utils/hash');
const { signAccessToken } = require('../utils/jwt');

const registerUser = async ({ name, email, password }) => {
  const existing = await User.findOne({ email });

  if (existing) {
    throw new Error('Email already exists');
  }

  const hashed = await hashPassword(password);

  const user = await User.create({ name, email, password: hashed });

  return user;
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const match = await comparePassword(password, user.password);

  if (!match) {
    throw new Error('Invalid credentials');
  }

  const token = signAccessToken({ id: user._id, role: user.role });

  return { token, user };
};

module.exports = { registerUser, loginUser };