'use strict';

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

const jwtUtils = {
  sign(payload) {
    return jwt.sign(payload, JWT_SECRET, { algorithm: 'HS512', expiresIn: JWT_EXPIRES_IN });
  },
  verify(token) {
    return jwt.verify(token, JWT_SECRET, { algorithms: ['HS512'] });
  },
};

module.exports = jwtUtils;
