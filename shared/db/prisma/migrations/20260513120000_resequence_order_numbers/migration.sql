-- Resequence all order numbers to 1000, 1001, ... (oldest order = 1000).
-- Two steps so "orders_number_key" unique constraint is never violated mid-update.

UPDATE "orders"
SET "number" = '__tmp__' || "id";

UPDATE "orders" AS o
SET "number" = s.new_number::text
FROM (
  SELECT
    "id",
    ROW_NUMBER() OVER (ORDER BY "createdAt" ASC, "id" ASC) + 999 AS new_number
  FROM "orders"
) AS s
WHERE o."id" = s."id";
