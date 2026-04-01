const jwt = require('jsonwebtoken');

const signAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: '1d'
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
};

module.exports = { signAccessToken, verifyToken };