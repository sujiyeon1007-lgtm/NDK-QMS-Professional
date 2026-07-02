-- Project TITAN — MES Oracle PoC: Customer Master (DBA template)
-- Copy to .env as MES_ORACLE_SQL_CUSTOMER (single line). SELECT only · max 20 rows.

SELECT
  VNDCOD,
  VNDKNM
FROM YOUR_VENDOR_VIEW
WHERE ROWNUM <= 20;
