-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AE" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "managerId" TEXT,
    CONSTRAINT "AE_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "segment" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "arr" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "renewalDate" DATETIME NOT NULL,
    "aiMaturity" TEXT NOT NULL,
    "paymentStatus" TEXT NOT NULL,
    "healthScore" INTEGER NOT NULL DEFAULT 0,
    "ownerAEId" TEXT NOT NULL,
    CONSTRAINT "Account_ownerAEId_fkey" FOREIGN KEY ("ownerAEId") REFERENCES "AE" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Stakeholder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "seniority" TEXT NOT NULL,
    CONSTRAINT "Stakeholder_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UsageMetric" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "apiCalls" INTEGER NOT NULL,
    "seatsActive" INTEGER NOT NULL,
    CONSTRAINT "UsageMetric_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SupportTicket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "severity" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    CONSTRAINT "SupportTicket_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Opportunity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "ownerAEId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stage" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "type" TEXT NOT NULL,
    "closeDate" DATETIME NOT NULL,
    "probability" REAL NOT NULL,
    "discountRequested" REAL NOT NULL,
    "nextStep" TEXT NOT NULL,
    CONSTRAINT "Opportunity_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Opportunity_ownerAEId_fkey" FOREIGN KEY ("ownerAEId") REFERENCES "AE" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "aeId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    CONSTRAINT "Activity_aeId_fkey" FOREIGN KEY ("aeId") REFERENCES "AE" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Activity_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QBR" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "quarter" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "nextSteps" TEXT NOT NULL,
    CONSTRAINT "QBR_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ForecastSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quarter" TEXT NOT NULL,
    "commit" REAL NOT NULL,
    "bestCase" REAL NOT NULL,
    "upside" REAL NOT NULL,
    "actual" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AccountPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "businessGoals" TEXT NOT NULL,
    "successMetrics" TEXT NOT NULL,
    "stakeholderMap" TEXT NOT NULL,
    "riskLog" TEXT NOT NULL,
    "expansionHypothesis" TEXT NOT NULL,
    "execAlignmentDate" DATETIME,
    "nextQbrDate" DATETIME,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AccountPlan_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuarterTarget" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quarter" TEXT NOT NULL,
    "teamTargetArr" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ownerId" TEXT,
    CONSTRAINT "QuarterTarget_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DiscountApproval" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "opportunityId" TEXT NOT NULL,
    "requestedDiscount" REAL NOT NULL,
    "approvalStatus" TEXT NOT NULL,
    "approverRole" TEXT NOT NULL,
    "recommendedCounter" TEXT NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "justification" TEXT NOT NULL,
    CONSTRAINT "DiscountApproval_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "AE_region_idx" ON "AE"("region");

-- CreateIndex
CREATE INDEX "Account_segment_region_idx" ON "Account"("segment", "region");

-- CreateIndex
CREATE INDEX "Account_renewalDate_idx" ON "Account"("renewalDate");

-- CreateIndex
CREATE INDEX "Account_healthScore_idx" ON "Account"("healthScore");

-- CreateIndex
CREATE INDEX "Stakeholder_accountId_idx" ON "Stakeholder"("accountId");

-- CreateIndex
CREATE INDEX "UsageMetric_accountId_date_idx" ON "UsageMetric"("accountId", "date");

-- CreateIndex
CREATE INDEX "SupportTicket_accountId_date_idx" ON "SupportTicket"("accountId", "date");

-- CreateIndex
CREATE INDEX "Opportunity_closeDate_stage_idx" ON "Opportunity"("closeDate", "stage");

-- CreateIndex
CREATE INDEX "Opportunity_ownerAEId_idx" ON "Opportunity"("ownerAEId");

-- CreateIndex
CREATE INDEX "Opportunity_probability_idx" ON "Opportunity"("probability");

-- CreateIndex
CREATE INDEX "Activity_aeId_date_idx" ON "Activity"("aeId", "date");

-- CreateIndex
CREATE INDEX "Activity_accountId_date_idx" ON "Activity"("accountId", "date");

-- CreateIndex
CREATE INDEX "QBR_accountId_quarter_idx" ON "QBR"("accountId", "quarter");

-- CreateIndex
CREATE INDEX "ForecastSnapshot_quarter_createdAt_idx" ON "ForecastSnapshot"("quarter", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AccountPlan_accountId_key" ON "AccountPlan"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "QuarterTarget_quarter_key" ON "QuarterTarget"("quarter");

-- CreateIndex
CREATE UNIQUE INDEX "DiscountApproval_opportunityId_key" ON "DiscountApproval"("opportunityId");


