const { registerUser, loginUser, getCurrentUser } = require('../services/auth.service');

const signup = async (req, res) => {
  try {
    const user = await registerUser(req.body);
    res.status(201).json({ message: 'Signup successful', user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { token, user } = await loginUser(req.body);
    res.json({ message: 'Login successful', token, user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const logout = async (req, res) => {
  res.json({ message: 'Logged out' });
};

const me = async (req, res) => {
  try {
    const user = await getCurrentUser(req.user.id);
    res.json({ user });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

module.exports = { signup, login, logout, me };
