-- CreateTable
CREATE TABLE "ProjectCompetence" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "evidence" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectCompetence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectCompetence_code_idx" ON "ProjectCompetence"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectCompetence_projectId_code_key" ON "ProjectCompetence"("projectId", "code");

-- AddForeignKey
ALTER TABLE "ProjectCompetence" ADD CONSTRAINT "ProjectCompetence_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
