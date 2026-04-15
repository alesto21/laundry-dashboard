-- AlterTable
ALTER TABLE "Member" ADD COLUMN "hostname" TEXT;

-- CreateTable
CREATE TABLE "NotificationDelivery" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "logId" INTEGER NOT NULL,
    "memberId" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "acknowledgedAt" DATETIME,
    CONSTRAINT "NotificationDelivery_logId_fkey" FOREIGN KEY ("logId") REFERENCES "NotificationLog" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "NotificationDelivery_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ShoppingItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "text" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME
);

-- CreateTable
CREATE TABLE "TrashPickup" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "kind" TEXT NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_NotificationLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "kind" TEXT NOT NULL DEFAULT 'laundry',
    "recipients" TEXT NOT NULL
);
INSERT INTO "new_NotificationLog" ("createdAt", "id", "recipients") SELECT "createdAt", "id", "recipients" FROM "NotificationLog";
DROP TABLE "NotificationLog";
ALTER TABLE "new_NotificationLog" RENAME TO "NotificationLog";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "NotificationDelivery_token_key" ON "NotificationDelivery"("token");
