-- AlterTable
ALTER TABLE "working_groups" ADD COLUMN     "mailing_list" TEXT,
ADD COLUMN     "member_tracking" TEXT,
ADD COLUMN     "wGEventDetailId" UUID;

-- CreateTable
CREATE TABLE "wgreports" (
    "id" UUID NOT NULL,
    "comments" JSONB,
    "numberMebmers" INTEGER,
    "status" "ReportStatus" NOT NULL DEFAULT 'draft',
    "year" INTEGER NOT NULL,
    "narrativeReport" TEXT NOT NULL,
    "facultativeQuestions" TEXT NOT NULL,
    "working_group_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "eventReportId" UUID,

    CONSTRAINT "wgreports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WGEventDetail" (
    "id" UUID NOT NULL,
    "eventTitle" TEXT NOT NULL,
    "eventLink" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3),
    "eventRole" TEXT NOT NULL,

    CONSTRAINT "WGEventDetail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "wgreports_year_idx" ON "wgreports"("year");

-- CreateIndex
CREATE UNIQUE INDEX "wgreports_working_group_id_year_key" ON "wgreports"("working_group_id", "year");

-- AddForeignKey
ALTER TABLE "working_groups" ADD CONSTRAINT "working_groups_wGEventDetailId_fkey" FOREIGN KEY ("wGEventDetailId") REFERENCES "WGEventDetail"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wgreports" ADD CONSTRAINT "wgreports_working_group_id_fkey" FOREIGN KEY ("working_group_id") REFERENCES "working_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wgreports" ADD CONSTRAINT "wgreports_eventReportId_fkey" FOREIGN KEY ("eventReportId") REFERENCES "event_reports"("id") ON DELETE SET NULL ON UPDATE CASCADE;
