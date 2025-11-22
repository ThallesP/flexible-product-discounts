/*
  Warnings:

  - You are about to drop the column `fieldOne` on the `FormSettings` table. All the data in the column will be lost.
  - You are about to drop the column `fieldTwo` on the `FormSettings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "FormSettings" DROP COLUMN "fieldOne",
DROP COLUMN "fieldTwo";
