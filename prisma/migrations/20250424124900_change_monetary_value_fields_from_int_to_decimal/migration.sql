-- AlterTable
ALTER TABLE "projects_funding_leverage" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "total_amount" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "reports" ALTER COLUMN "operationalCost" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "operationalCostThreshold" SET DATA TYPE DECIMAL(12,2);
