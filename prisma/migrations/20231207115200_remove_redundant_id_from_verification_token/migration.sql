/*
  Warnings:

  - The primary key for the `verificationTokens` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `verificationTokens` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_verificationTokens" (
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_verificationTokens" ("createdAt", "token", "userId") SELECT "createdAt", "token", "userId" FROM "verificationTokens";
DROP TABLE "verificationTokens";
ALTER TABLE "new_verificationTokens" RENAME TO "verificationTokens";
CREATE UNIQUE INDEX "verificationTokens_token_key" ON "verificationTokens"("token");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
