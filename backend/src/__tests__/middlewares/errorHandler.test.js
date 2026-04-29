'use strict';

const errorHandler = require('../../middlewares/errorHandler');
const AppError = require('../../utils/AppError');

/**
 * Express req/res/next 목 생성 헬퍼
 */
function createMocks() {
  const req = {};
  const res = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
  const next = jest.fn();
  return { req, res, next };
}

describe('errorHandler 미들웨어', () => {
  beforeEach(() => {
    // console.error 출력 억제
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('AppError 인스턴스 전달 시 해당 statusCode로 응답한다', () => {
    const { req, res, next } = createMocks();
    const err = new AppError('이미 사용 중인 이메일입니다.', 409, 'DUPLICATE_EMAIL');

    errorHandler(err, req, res, next);

    expect(res.statusCode).toBe(409);
  });

  it('AppError 인스턴스 전달 시 { error: { code, message } } 형식으로 응답한다', () => {
    const { req, res, next } = createMocks();
    const err = new AppError('이미 사용 중인 이메일입니다.', 409, 'DUPLICATE_EMAIL');

    errorHandler(err, req, res, next);

    expect(res.body).toEqual({
      error: {
        code: 'DUPLICATE_EMAIL',
        message: '이미 사용 중인 이메일입니다.',
      },
    });
  });

  it('401 AppError 전달 시 401 상태코드로 응답한다', () => {
    const { req, res, next } = createMocks();
    const err = new AppError('유효한 인증 토큰이 필요합니다.', 401, 'UNAUTHORIZED');

    errorHandler(err, req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('일반 Error 전달 시 500 상태코드로 응답한다', () => {
    const { req, res, next } = createMocks();
    const err = new Error('알 수 없는 에러');

    errorHandler(err, req, res, next);

    expect(res.statusCode).toBe(500);
  });

  it('일반 Error 전달 시 INTERNAL_ERROR 코드로 응답한다', () => {
    const { req, res, next } = createMocks();
    const err = new Error('데이터베이스 연결 실패');

    errorHandler(err, req, res, next);

    expect(res.body).toEqual({
      error: {
        code: 'INTERNAL_ERROR',
        message: '서버 오류가 발생했습니다.',
      },
    });
  });

  it('에러 응답은 항상 error 객체를 최상위 키로 가진다', () => {
    const { req, res, next } = createMocks();
    const err = new AppError('리소스 없음', 404, 'NOT_FOUND');

    errorHandler(err, req, res, next);

    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toHaveProperty('code');
    expect(res.body.error).toHaveProperty('message');
  });
});
