-- AlterTable
ALTER TABLE "Stream" ADD COLUMN     "offlineThumbnailUrl" TEXT;

-- CreateTable
CREATE TABLE "KingOfRoom" (
    "id" TEXT NOT NULL,
    "streamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalTokens" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KingOfRoom_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "KingOfRoom_streamId_key" ON "KingOfRoom"("streamId");

-- CreateIndex
CREATE INDEX "KingOfRoom_streamId_idx" ON "KingOfRoom"("streamId");

-- CreateIndex
CREATE INDEX "KingOfRoom_userId_idx" ON "KingOfRoom"("userId");

-- AddForeignKey
ALTER TABLE "KingOfRoom" ADD CONSTRAINT "KingOfRoom_streamId_fkey" FOREIGN KEY ("streamId") REFERENCES "Stream"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KingOfRoom" ADD CONSTRAINT "KingOfRoom_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
