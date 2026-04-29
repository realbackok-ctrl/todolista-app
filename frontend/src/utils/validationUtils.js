/**
 * 유효성 검사 유틸 함수 모음
 */

/**
 * 이메일 형식을 검증한다. (RFC 5322 기본 형식)
 * @param {string} email
 * @returns {boolean}
 */
export function validateEmail(email) {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 비밀번호가 최소 8자 이상인지 검증한다.
 * @param {string} password
 * @returns {boolean}
 */
export function validatePassword(password) {
  if (!password) return false;
  return password.length >= 8;
}
