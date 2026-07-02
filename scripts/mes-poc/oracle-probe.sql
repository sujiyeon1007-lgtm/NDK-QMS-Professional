-- Project TITAN — MES Oracle PoC (현장 DBA 실행용)
-- 목적: Oracle 접속 및 기본 조회 가능 여부 확인 (읽기 전용 계정 권장)
-- 보안: 계정·비밀번호는 이 파일에 기록하지 마세요.

-- 1) 접속 테스트
SELECT 1 AS CONNECT_OK FROM DUAL;

-- 2) MES 관리번호 조회 (테이블/View명은 DBA 확인)
-- SELECT management_no FROM <INBOUND_VIEW> WHERE ROWNUM <= 10;
-- 예: DL260702-016

-- 3) 거래처
-- SELECT VNDCOD, VNDKNM FROM <VENDOR_VIEW> WHERE ROWNUM <= 10;

-- 4) 입고
-- SELECT SADDAT, SADQTY, SADLOT, VNDKNM FROM <INBOUND_VIEW> WHERE ROWNUM <= 10;

-- PoC 결과: TITAN 환경설정 → MES PoC (/environment/mes-poc) 에 기록
