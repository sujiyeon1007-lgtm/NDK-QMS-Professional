-- Project TITAN — MES Oracle PoC: Inbound data (DBA template)
-- Copy to .env as MES_ORACLE_SQL_INBOUND (single line). SELECT only · max 20 rows.

SELECT
  SADDAT,
  SADQTY,
  SADQKG,
  SADVLO,
  SADLOT,
  VNDKNM,
  MASVNO,
  MASVNM
FROM YOUR_INBOUND_VIEW
WHERE ROWNUM <= 20;
