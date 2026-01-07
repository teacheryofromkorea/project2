# Class Routine App - Project Overview

## 📋 Project Summary

**Class Routine App**은 초등학교 교실을 위한 종합 관리 시스템입니다. 교사가 학생들의 일과 루틴, 출결 관리, 자료 관리를 효율적으로 수행할 수 있도록 돕고, 게임화 요소를 통해 학생들의 참여를 유도합니다.

---

## 🎯 핵심 목적

1. **일과 관리**: 아침, 쉬는시간, 점심시간, 종례 등 시간대별 루틴 및 미션 관리
2. **출결 관리**: 학생 출결 상태 추적, 월별/일별 통계, 서류 미제출 관리
3. **좌석 배치**: 교실 좌석 배치 시각화 및 출결 상태 표시
4. **게임화**: 펫 수집, 상점, 가챠 등을 통한 학생 동기부여
5. **자료 관리**: 학급 자료, 퀘스트 관리

---

## 🛠 기술 스택

### Frontend
- **React 19.2.0** - UI 프레임워크
- **Vite** - 빌드 도구 및 개발 서버
- **React Router DOM 7.10.1** - 클라이언트 사이드 라우팅
- **Tailwind CSS 3.4** - 유틸리티 우선 CSS 프레임워크

### UI/UX Libraries
- **Framer Motion 12.23** - 애니메이션 라이브러리
- **Lucide React** - 아이콘 라이브러리
- **Radix UI** - 접근성 있는 UI 컴포넌트 (Dialog)
- **React Hot Toast** - 토스트 알림
- **Canvas Confetti** - 축하 효과

### Backend & Database
- **Supabase** - BaaS (Backend as a Service)
  - PostgreSQL 데이터베이스
  - 실시간 구독
  - 인증 및 권한 관리

### Development Tools
- **ESLint** - 코드 품질 도구
- **PostCSS & Autoprefixer** - CSS 후처리

---

## 📁 프로젝트 구조

```
class-routine-app/
├── src/
│   ├── components/
│   │   ├── Attendance/      # 출결 관리 컴포넌트
│   │   ├── Break/           # 쉬는시간 관리
│   │   ├── Class/           # 학급 관련 기능
│   │   ├── End/             # 종례 관리
│   │   ├── Lunch/           # 점심시간 관리
│   │   ├── Overview/        # 출결 통계 대시보드
│   │   ├── Settings/        # 설정 관리
│   │   ├── Stats/           # 통계 화면
│   │   ├── Tools/           # 유틸리티 도구
│   │   ├── common/          # 공통 컴포넌트
│   │   ├── shared/          # 공유 컴포넌트
│   │   └── ui/              # 기본 UI 컴포넌트
│   ├── constants/           # 상수 정의
│   ├── context/             # React Context
│   ├── hooks/               # 커스텀 훅
│   ├── lib/                 # 외부 라이브러리 설정
│   ├── styles/              # 글로벌 스타일
│   └── utils/               # 유틸리티 함수
├── public/                  # 정적 파일
└── [config files]           # 설정 파일들
```

---

## 🌟 주요 기능

### 1. 출결 관리 시스템
**위치**: `components/Attendance/`, `components/Overview/`

#### 출결 보드 ([AttendanceBoard.jsx](file:///Users/youngyopark/Desktop/class-routine-app/src/components/Attendance/AttendanceBoard.jsx))
- 좌석 배치 기반 출결 현황 시각화
- 실시간 출결 상태 업데이트
- 학생별 상태: 출석, 질병결석, 출석인정, 미인정결석, 미체크

#### 출결 통계 ([AttendanceStatsSection.jsx](file:///Users/youngyopark/Desktop/class-routine-app/src/components/Overview/AttendanceStatsSection.jsx))
- **오늘 출결**: 5가지 상태별 학생 수 카드
- **월별 통계 테이블**: 학생별 월간 출결 현황, 셀 클릭으로 직접 수정
- **서류 관리**: 질병/인정결석 서류 미제출 건수 추적

#### 주요 컴포넌트
- [AttendanceTodayStats.jsx](file:///Users/youngyopark/Desktop/class-routine-app/src/components/Overview/AttendanceTodayStats.jsx) - 일별 통계 카드
- [AttendanceMonthlyTable.jsx](file:///Users/youngyopark/Desktop/class-routine-app/src/components/Overview/AttendanceMonthlyTable.jsx) - 월별 테이블, 공휴일 표시
- [AttendanceDocumentList.jsx](file:///Users/youngyopark/Desktop/class-routine-app/src/components/Overview/AttendanceDocumentList.jsx) - 서류 미제출 관리
- [UncheckedStudentsModal.jsx](file:///Users/youngyopark/Desktop/class-routine-app/src/components/Attendance/UncheckedStudentsModal.jsx) - 출결 상태 일괄 수정

---

### 2. 시간대별 루틴 관리
**위치**: `components/Break/`, `components/Lunch/`, `components/End/`

각 시간대마다 고유한 루틴과 미션을 관리:
- **아침 루틴**: 등교 후 할 일 체크리스트
- **쉬는시간**: 휴식 활동 미션
- **점심시간**: 급식 관련 루틴
- **종례**: 하루 마무리 활동

#### 공통 패턴
- `*TimeBoard.jsx`: 시간대별 메인 보드
- 루틴 체크리스트 (완료/미완료 토글)
- 미션 시스템 (학생별 미션 부여 및 추적)

---

### 3. 좌석 배치 시스템
**위치**: `components/Attendance/`

- [SeatGrid.jsx](file:///Users/youngyopark/Desktop/class-routine-app/src/components/Attendance/SeatGrid.jsx) - 좌석 그리드 레이아웃
- [Seat.jsx](file:///Users/youngyopark/Desktop/class-routine-app/src/components/Attendance/Seat.jsx) - 개별 좌석 컴포넌트
- 드래그 앤 드롭으로 좌석 재배치
- 출결 상태별 색상 코딩

---

### 4. 게임화 시스템
**위치**: `components/Settings/` (추정)

학생 참여도를 높이기 위한 게임 요소:
- **펫 수집**: 학생이 획득한 펫 관리
- **상점**: 보상으로 아이템 구매
- **가챠**: 랜덤 보상 시스템
- **퀘스트**: 학급 미션 관리

---

### 5. 공통 UI 컴포넌트
**위치**: `components/common/`

- [CustomDatePicker.jsx](file:///Users/youngyopark/Desktop/class-routine-app/src/components/common/CustomDatePicker.jsx) - 한국 공휴일 지원 달력
- [BaseModal.jsx](file:///Users/youngyopark/Desktop/class-routine-app/src/components/common/BaseModal.jsx) - 표준화된 모달 컴포넌트
- [LockButton.jsx](file:///Users/youngyopark/Desktop/class-routine-app/src/components/LockButton.jsx) - 잠금/해제 토글

---

## 💾 데이터베이스 스키마

### 주요 테이블

#### `students`
학생 정보 저장
- `id`, `name`, `number` (번호), `seat_position` 등

#### `student_attendance_status`
출결 기록
- `student_id` - 학생 외래키
- `date` - 출결 날짜
- `status` - 출결 상태 (present, sick_*, authorized_*, unauthorized_*, unchecked)
- `document_submitted` - 서류 제출 여부

#### `routines`
시간대별 루틴 정의
- `period` - 시간대 (morning, break, lunch, end)
- `title`, `items` (JSON)

#### `missions`
시간대별 미션 정의
- `period`, `title`, `items`

#### 게임화 테이블 (추정)
- `pets` - 펫 정보
- `student_pets` - 학생별 펫 소유
- `items` - 상점 아이템
- `quests` - 퀘스트 정보

---

## 🎨 디자인 시스템

### 색상 코드 (출결 상태)
- **출석**: Emerald (녹색)
- **질병**: Blue (파란색)
- **출석인정**: Purple (보라색)
- **미인정**: Red (빨간색)
- **미체크**: Gray (회색)

### 공휴일 표시
- **토요일**: 파란색 텍스트
- **일요일/공휴일**: 빨간색 텍스트

### UI/UX 원칙
- **반응형 디자인**: Tailwind CSS 기반
- **애니메이션**: Framer Motion으로 부드러운 전환
- **접근성**: Radix UI 컴포넌트 활용
- **실시간 피드백**: React Hot Toast 알림

---

## 🔄 최근 개선사항

### 출결 시스템 최적화 (2026-01-07)
1. ✅ 월별 테이블 셀 클릭으로 직접 출결 상태 수정
2. ✅ '오늘 출결' UI 심플화 (카드 높이 축소, 파스텔 톤)
3. ✅ URL 날짜 지속성 제거 (새로고침 시 오늘 날짜로 리셋)
4. ✅ 서류 미제출 건수 즉시 반영 (상태 변경 시 자동 갱신)
5. ✅ 툴팁 Portal 적용 (AttendanceMonthlyTable)

---

## 🚀 실행 방법

### 개발 서버
```bash
npm run dev
```

### 프로덕션 빌드
```bash
npm run build
npm run preview
```

---

## 📝 향후 개선 계획

- [ ] TypeScript 마이그레이션
- [ ] 테스트 코드 작성
- [ ] 성능 최적화 (React.memo, useMemo)
- [ ] PWA 지원 (오프라인 모드)
- [ ] 다국어 지원 (i18n)

---

## 👨‍🏫 대상 사용자

**초등학교 교사**를 위한 일과 관리 도구로, 다음과 같은 상황에서 유용합니다:
- 학생 출결 관리 및 통계 확인
- 일일 루틴 진행 현황 추적
- 학생 동기부여를 위한 게임화 요소 활용
- 서류 미제출 건수 관리

---

## 📄 라이선스

Private project (비공개)

---

**마지막 업데이트**: 2026-01-07  
**프로젝트 버전**: 0.0.0
