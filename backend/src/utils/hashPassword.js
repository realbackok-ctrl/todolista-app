'use strict';

const bcrypt = require('bcrypt');

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12;

const hashPassword = {
  async hash(plainPassword) {
    return bcrypt.hash(plainPassword, SALT_ROUNDS);
  },
  async compare(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  },
};

module.exports = hashPassword;
