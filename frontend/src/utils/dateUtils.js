/**
 * 날짜 관련 유틸 함수 모음
 */

/**
 * 할일의 마감일 초과 여부를 판단한다.
 * dueDate가 현재 시각보다 과거이고 status가 'PENDING'인 경우에만 true를 반환한다.
 * @param {string|null|undefined} dueDate - ISO 날짜 문자열
 * @param {string} status - 할일 상태 ('PENDING' | 'COMPLETED')
 * @returns {boolean}
 */
export function isOverdue(dueDate, status) {
  if (!dueDate || status !== 'PENDING') return false;
  return new Date(dueDate) < new Date();
}

/**
 * ISO 날짜 문자열을 'yyyy-MM-dd HH:mm' 형식으로 변환한다.
 * @param {string|null|undefined} dateString - ISO 날짜 문자열
 * @returns {string} 포맷된 날짜 문자열, 입력이 없으면 빈 문자열
 */
export function formatDate(dateString) {
  if (!dateString) return '';

  const date = new Date(dateString);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}
