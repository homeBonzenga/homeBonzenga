-- CreateTable
CREATE TABLE "access_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "emailAttempted" TEXT,
    "roleAttempted" TEXT,
    "success" BOOLEAN NOT NULL,
    "method" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "access_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "access_logs_userId_idx" ON "access_logs"("userId");

-- CreateIndex
CREATE INDEX "access_logs_emailAttempted_idx" ON "access_logs"("emailAttempted");

-- CreateIndex
CREATE INDEX "access_logs_timestamp_idx" ON "access_logs"("timestamp");

-- CreateIndex
CREATE INDEX "access_logs_ipAddress_idx" ON "access_logs"("ipAddress");
