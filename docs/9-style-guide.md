# 스타일 가이드 (Style Guide)
# TodoList 애플리케이션

**버전:** 1.0
**작성일:** 2026-04-29
**참조 이미지:** Google Calendar UI (clipboard-1777436645376.png)

---

## 1. 디자인 원칙

본 애플리케이션은 **Clean, Minimalist, Functional**을 핵심 가치로 한다. Google의 Material Design 철학을 현대적으로 해석하여, 사용자에게 친숙하면서도 업무 집중도를 높일 수 있는 인터페이스를 제공한다.

- **공백의 활용:** 충분한 여백(Negative Space)을 통해 정보의 밀도를 조절하고 시각적 피로도를 낮춘다.
- **명확한 계층 구조:** 타이포그래피의 크기와 무게, 대비를 활용하여 중요 정보를 즉시 식별하게 한다.
- **일관된 인터랙션:** 모든 버튼과 입력 필드는 일관된 피드백(Hover, Focus 상태)을 제공한다.

---

## 2. 컬러 팔레트 (Color Palette)

### 2.1 Primary & Neutral
| 용도 | 컬러 코드 | 예시 |
|------|----------|------|
| **Primary Blue** | `#1A73E8` | 주요 버튼, 활성 상태 아이콘, 오늘 날짜 강조 |
| **Surface (White)** | `#FFFFFF` | 메인 배경, 카드 배경 |
| **Sidebar Background**| `#F8F9FA` | 왼쪽 사이드바 배경 |
| **Border / Divider** | `#DADCE0` | 그리드 라인, 구분선 |
| **Hover State** | `#F1F3F4` | 목록이나 아이콘 위에 마우스를 올렸을 때 |

### 2.2 Text Colors
| 용도 | 컬러 코드 | 설명 |
|------|----------|------|
| **High Emphasis** | `#3C4043` | 제목, 본문 텍스트 |
| **Medium Emphasis** | `#5F6368` | 보조 설명, 라벨, 비활성 아이콘 |
| **Low Emphasis** | `#70757A` | 날짜 숫자, 메타 정보 |

### 2.3 Status Colors
| 용도 | 컬러 코드 | 적용 대상 |
|------|----------|------|
| **Overdue (Danger)** | `#D93025` | 기한이 지난 할일 (텍스트 또는 아이콘) |
| **Completed (Success)**| `#1E8E3E` | 완료된 할일, 긍정적 알림 |
| **Warning** | `#FBBC04` | 주의가 필요한 상태 |

---

## 3. 타이포그래피 (Typography)

- **Font Family:** `Pretendard`, `Noto Sans KR`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`, `sans-serif`
- **Base Size:** `14px`

| 스타일 명 | 크기 / 무게 | 용도 |
|----------|------------|------|
| **Display 1** | 22px / Regular | 메인 상단 날짜/제목 (예: 2026년 4월) |
| **Headline 1** | 18px / Medium | 섹션 제목, 할일 제목 |
| **Body 1** | 14px / Regular | 일반 텍스트, 입력 필드 |
| **Caption** | 12px / Medium | 날짜 요일 라벨, 카테고리 태그 |
| **Button Text** | 14px / Medium | 버튼 내부 텍스트 |

---

## 4. 레이아웃 (Layout)

### 4.1 전체 구조
- **Header (64px):** 로고, 내비게이션 컨트롤, 검색 및 설정 아이콘 배치.
- **Sidebar (256px):** "만들기" 버튼, 미니 달력, 카테고리 필터링 영역.
- **Main Content:** 가변 폭. 할일 목록 또는 그리드 뷰가 표시되는 영역.

### 4.2 간격 (Spacing)
- **Grid Unit:** `8px` 배수 사용. (8, 16, 24, 32...)
- **Container Padding:** `16px` 또는 `24px` 권장.

---

## 5. 주요 컴포넌트 스타일 (Components)

### 5.1 버튼 (Buttons)
- **Primary FAB (Floating Action Button):** 
  - 스타일: 흰색 배경 + 그림자(Shadow) + 둥근 모서리(Pill shape).
  - 아이콘: Google 'Plus' 멀티 컬러 아이콘.
  - 텍스트: "만들기" (Medium weight).
- **Icon Button:** 
  - 배경 없음, Hover 시 원형 배경(`#F1F3F4`) 노출.
  - 크기: 40x40px (아이콘은 20~24px).

### 5.2 사이드바 아이템 (Sidebar Items)
- **Default:** 투명 배경, 좌측 정렬.
- **Active:** 연한 파란색 배경(`#E8F0FE`) + 텍스트 컬러 Primary Blue(`#1967D2`).
- **Rounded:** 한쪽 면이 둥근 형태 또는 전체 Rounded(Pill) 적용.

### 5.3 카드 및 목록 (Cards & List)
- **Border:** `1px solid #DADCE0`.
- **Radius:** `8px`.
- **Shadow:** 인터랙티브 요소에만 약하게 적용 (`rgba(60, 64, 67, 0.3) 0px 1px 2px 0px`).

---

## 6. 아이콘 스타일 (Icons)

- **Library:** `Google Material Symbols` (Outlined 스타일 권장).
- **Size:** 기본 `20px` 또는 `24px`.
- **Color:** `#5F6368` (Default), `#1A73E8` (Active).

---

## 7. 가이드 적용 예시 (Todo 항목)

```html
<!-- 할일 목록 아이템 구조 예시 -->
<div class="todo-item" style="border-bottom: 1px solid #DADCE0; padding: 12px 16px;">
  <input type="checkbox" style="accent-color: #1A73E8;">
  <span class="todo-title" style="color: #3C4043; font-weight: 400; margin-left: 12px;">
    할일 제목 샘플
  </span>
  <span class="due-date" style="color: #70757A; font-size: 12px; float: right;">
    4월 29일
  </span>
</div>
```

---

*본 가이드는 Phase 1 개발의 시각적 일관성을 위해 작성되었으며, UI/UX 고도화 단계에서 업데이트될 수 있습니다.*
