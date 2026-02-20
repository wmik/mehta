-- AlterTable
ALTER TABLE "meetings" ADD COLUMN     "publicAccessToken" TEXT,
ADD COLUMN     "runId" TEXT,
ALTER COLUMN "transcript" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "settings" JSONB;
