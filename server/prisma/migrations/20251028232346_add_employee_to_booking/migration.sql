-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_bookings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "employeeId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "scheduledDate" DATETIME NOT NULL,
    "scheduledTime" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "subtotal" REAL NOT NULL,
    "discount" REAL NOT NULL DEFAULT 0,
    "tax" REAL NOT NULL DEFAULT 0,
    "total" REAL NOT NULL,
    "addressId" TEXT NOT NULL,
    "notes" TEXT,
    "cancellationReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "bookings_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "bookings_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "bookings_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "bookings_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "addresses" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_bookings" ("addressId", "cancellationReason", "createdAt", "customerId", "discount", "duration", "id", "notes", "scheduledDate", "scheduledTime", "status", "subtotal", "tax", "total", "updatedAt", "vendorId") SELECT "addressId", "cancellationReason", "createdAt", "customerId", "discount", "duration", "id", "notes", "scheduledDate", "scheduledTime", "status", "subtotal", "tax", "total", "updatedAt", "vendorId" FROM "bookings";
DROP TABLE "bookings";
ALTER TABLE "new_bookings" RENAME TO "bookings";
CREATE INDEX "bookings_customerId_idx" ON "bookings"("customerId");
CREATE INDEX "bookings_vendorId_idx" ON "bookings"("vendorId");
CREATE INDEX "bookings_employeeId_idx" ON "bookings"("employeeId");
CREATE INDEX "bookings_scheduledDate_idx" ON "bookings"("scheduledDate");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
