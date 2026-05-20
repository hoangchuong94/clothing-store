-- CreateTable
CREATE TABLE "user_server_carts" (
    "userId" TEXT NOT NULL,
    "items" JSONB NOT NULL DEFAULT '[]',
    "lastUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_server_carts_pkey" PRIMARY KEY ("userId")
);

-- AddForeignKey
ALTER TABLE "user_server_carts" ADD CONSTRAINT "user_server_carts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
