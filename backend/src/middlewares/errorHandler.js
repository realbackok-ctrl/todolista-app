'use strict';

const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
      },
    });
  }

  logger.error('Unhandled error', { message: err.message, stack: err.stack });
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: '서버 오류가 발생했습니다.',
    },
  });
}

module.exports = errorHandler;
