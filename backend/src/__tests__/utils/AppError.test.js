'use strict';

const AppError = require('../../utils/AppError');

describe('AppError', () => {
  it('message, statusCode, code 필드가 올바르게 설정된다', () => {
    const err = new AppError('테스트 에러', 400, 'VALIDATION_ERROR');

    expect(err.message).toBe('테스트 에러');
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('VALIDATION_ERROR');
  });

  it('instanceof Error를 만족한다', () => {
    const err = new AppError('에러 메시지', 404, 'NOT_FOUND');

    expect(err instanceof Error).toBe(true);
  });

  it('instanceof AppError를 만족한다', () => {
    const err = new AppError('에러 메시지', 500, 'INTERNAL_ERROR');

    expect(err instanceof AppError).toBe(true);
  });

  it('name 필드가 "AppError"이다', () => {
    const err = new AppError('에러 메시지', 401, 'UNAUTHORIZED');

    expect(err.name).toBe('AppError');
  });

  it('401 상태코드와 UNAUTHORIZED 코드로 생성된다', () => {
    const err = new AppError('인증 실패', 401, 'UNAUTHORIZED');

    expect(err.statusCode).toBe(401);
    expect(err.code).toBe('UNAUTHORIZED');
  });
});
