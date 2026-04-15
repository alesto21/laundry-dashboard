-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Member" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "fullName" TEXT,
    "email" TEXT NOT NULL,
    "hostname" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "color" TEXT NOT NULL DEFAULT 'slate'
);
INSERT INTO "new_Member" ("email", "hostname", "id", "name") SELECT "email", "hostname", "id", "name" FROM "Member";
DROP TABLE "Member";
ALTER TABLE "new_Member" RENAME TO "Member";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
