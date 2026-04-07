-- CreateTable follows
CREATE TABLE IF NOT EXISTS "follows" (
    "id" TEXT NOT NULL,
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "follows_pkey" PRIMARY KEY ("id")
);

-- CreateTable messages
CREATE TABLE IF NOT EXISTS "messages" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "follows_followerId_followingId_key" ON "follows"("followerId", "followingId");

CREATE INDEX IF NOT EXISTS "follows_followerId_idx" ON "follows"("followerId");

CREATE INDEX IF NOT EXISTS "follows_followingId_idx" ON "follows"("followingId");

CREATE INDEX IF NOT EXISTS "messages_senderId_receiverId_idx" ON "messages"("senderId", "receiverId");

CREATE INDEX IF NOT EXISTS "messages_receiverId_senderId_idx" ON "messages"("receiverId", "senderId");

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_followerId_fkey"
    FOREIGN KEY ("followerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "follows" ADD CONSTRAINT "follows_followingId_fkey"
    FOREIGN KEY ("followingId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "messages" ADD CONSTRAINT "messages_senderId_fkey"
    FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "messages" ADD CONSTRAINT "messages_receiverId_fkey"
    FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
