-- CreateTable
CREATE TABLE "problem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "tags" JSONB NOT NULL,
    "problemStatement" TEXT NOT NULL,
    "detailedDescription" TEXT NOT NULL,
    "inputFormat" TEXT NOT NULL,
    "outputFormat" TEXT NOT NULL,
    "constraints" JSONB NOT NULL,
    "examples" JSONB NOT NULL,
    "starterCode" TEXT NOT NULL,
    "hiddenTestCases" JSONB NOT NULL,
    "visibleTestCases" JSONB NOT NULL,
    "hints" JSONB NOT NULL,
    "expectedTimeComplexity" TEXT NOT NULL,
    "expectedSpaceComplexity" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "problem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "problem_slug_key" ON "problem"("slug");
