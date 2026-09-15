-- Jump was replaced by Ably realtime events; MailTemplate and Player.isOnline were never used.

-- DropForeignKey
ALTER TABLE "Jump" DROP CONSTRAINT "Jump_playerId_fkey";

-- AlterTable
ALTER TABLE "Player" DROP COLUMN "isOnline";

-- DropTable
DROP TABLE "Jump";

-- DropTable
DROP TABLE "MailTemplate";
