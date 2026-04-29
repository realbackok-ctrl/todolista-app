import { describe, it, expect } from 'vitest';
import { isOverdue, formatDate } from '../dateUtils';

describe('isOverdue', () => {
  it('dueDate가 과거이고 PENDING이면 true', () => {
    const pastDate = new Date(Date.now() - 1000 * 60 * 60).toISOString(); // 1시간 전
    expect(isOverdue(pastDate, 'PENDING')).toBe(true);
  });

  it('dueDate가 과거이고 COMPLETED이면 false', () => {
    const pastDate = new Date(Date.now() - 1000 * 60 * 60).toISOString(); // 1시간 전
    expect(isOverdue(pastDate, 'COMPLETED')).toBe(false);
  });

  it('dueDate가 미래이고 PENDING이면 false', () => {
    const futureDate = new Date(Date.now() + 1000 * 60 * 60).toISOString(); // 1시간 후
    expect(isOverdue(futureDate, 'PENDING')).toBe(false);
  });

  it('dueDate가 null이면 false', () => {
    expect(isOverdue(null, 'PENDING')).toBe(false);
  });

  it('dueDate가 undefined이면 false', () => {
    expect(isOverdue(undefined, 'PENDING')).toBe(false);
  });
});

describe('formatDate', () => {
  it('ISO 문자열을 yyyy-MM-dd HH:mm 형식으로 변환', () => {
    // UTC 기준 2026-04-30T09:00:00.000Z는 로컬 시간에 따라 다르므로
    // 로컬 기준으로 생성
    const date = new Date(2026, 3, 30, 18, 0, 0); // 2026-04-30 18:00 (로컬)
    const result = formatDate(date.toISOString());
    expect(result).toBe('2026-04-30 18:00');
  });

  it('null이면 빈 문자열 반환', () => {
    expect(formatDate(null)).toBe('');
  });

  it('undefined이면 빈 문자열 반환', () => {
    expect(formatDate(undefined)).toBe('');
  });

  it('빈 문자열이면 빈 문자열 반환', () => {
    expect(formatDate('')).toBe('');
  });
});
