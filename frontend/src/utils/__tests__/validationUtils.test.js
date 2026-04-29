import { describe, it, expect } from 'vitest';
import { validateEmail, validatePassword } from '../validationUtils';

describe('validateEmail', () => {
  it('유효한 이메일 형식 반환 true', () => {
    expect(validateEmail('user@example.com')).toBe(true);
  });

  it('@ 없는 문자열 반환 false', () => {
    expect(validateEmail('userexample.com')).toBe(false);
  });

  it('도메인 없는 이메일 반환 false', () => {
    expect(validateEmail('user@')).toBe(false);
  });

  it('빈 문자열 반환 false', () => {
    expect(validateEmail('')).toBe(false);
  });

  it('null 반환 false', () => {
    expect(validateEmail(null)).toBe(false);
  });

  it('서브도메인 포함 이메일 반환 true', () => {
    expect(validateEmail('user@mail.example.co.kr')).toBe(true);
  });
});

describe('validatePassword', () => {
  it('8자 이상 반환 true', () => {
    expect(validatePassword('password1')).toBe(true);
  });

  it('7자 이하 반환 false', () => {
    expect(validatePassword('pass123')).toBe(false);
  });

  it('정확히 8자 반환 true', () => {
    expect(validatePassword('12345678')).toBe(true);
  });

  it('빈 문자열 반환 false', () => {
    expect(validatePassword('')).toBe(false);
  });

  it('null 반환 false', () => {
    expect(validatePassword(null)).toBe(false);
  });
});
