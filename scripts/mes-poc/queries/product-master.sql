-- Project TITAN — MES Oracle PoC: Product Master (DBA template)
-- Copy to .env as MES_ORACLE_SQL_PRODUCT (single line). SELECT only · max 20 rows.

SELECT
  MASVNO,
  MASVNM,
  MASSIZ,
  MASCOLM,
  MASSPCM
FROM YOUR_PRODUCT_VIEW
WHERE ROWNUM <= 20;
