const User = require('../models/user.model');
const localUserStore = require('./localUserStore.service');
const { hashPassword, comparePassword } = require('../utils/hash');
const { signAccessToken } = require('../utils/jwt');
const { getDatabaseMode } = require('../config/runtime');

const sanitizeUser = (user) => {
  const plainUser =
    typeof user.toObject === 'function' ? user.toObject() : { ...user };
  delete plainUser.password;
  return plainUser;
};

const userStore = () => (getDatabaseMode() === 'file' ? localUserStore : User);

const registerUser = async ({ name, email, password }) => {
  const existing = await userStore().findOne({ email });

  if (existing) {
    throw new Error('Email already exists');
  }

  const hashed = await hashPassword(password);

  const user = await userStore().create({ name, email, password: hashed });

  return sanitizeUser(user);
};

const loginUser = async ({ email, password }) => {
  const user = await userStore().findOne({ email });

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const match = await comparePassword(password, user.password);

  if (!match) {
    throw new Error('Invalid credentials');
  }

  const token = signAccessToken({ id: user._id, role: user.role });

  return { token, user: sanitizeUser(user) };
};

const getCurrentUser = async (id) => {
  const user =
    getDatabaseMode() === 'file'
      ? await localUserStore.findById(id)
      : await User.findById(id);

  if (!user) {
    throw new Error('User not found');
  }

  return sanitizeUser(user);
};

module.exports = { registerUser, loginUser, getCurrentUser };
