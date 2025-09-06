/*
  Warnings:

  - You are about to drop the column `priceCents` on the `CardRequest` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `CardRequest` table. All the data in the column will be lost.
  - Added the required column `cardType` to the `CardRequest` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CardRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "cardType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CardRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CardRequest" ("adminNote", "brand", "createdAt", "id", "status", "updatedAt", "userId") SELECT "adminNote", "brand", "createdAt", "id", "status", "updatedAt", "userId" FROM "CardRequest";
DROP TABLE "CardRequest";
ALTER TABLE "new_CardRequest" RENAME TO "CardRequest";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
