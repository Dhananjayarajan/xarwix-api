-- CreateTable
CREATE TABLE "webhook_bins" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "webhook_bins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_requests" (
    "id" SERIAL NOT NULL,
    "binId" TEXT NOT NULL,
    "method" VARCHAR(10) NOT NULL,
    "headers" JSONB NOT NULL,
    "query" JSONB NOT NULL,
    "body" JSONB,
    "rawBody" TEXT,
    "ip" VARCHAR(100),
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "webhook_bins_slug_key" ON "webhook_bins"("slug");

-- CreateIndex
CREATE INDEX "webhook_bins_slug_idx" ON "webhook_bins"("slug");

-- CreateIndex
CREATE INDEX "webhook_bins_expiresAt_idx" ON "webhook_bins"("expiresAt");

-- CreateIndex
CREATE INDEX "webhook_requests_binId_receivedAt_idx" ON "webhook_requests"("binId", "receivedAt");

-- AddForeignKey
ALTER TABLE "webhook_requests" ADD CONSTRAINT "webhook_requests_binId_fkey" FOREIGN KEY ("binId") REFERENCES "webhook_bins"("id") ON DELETE CASCADE ON UPDATE CASCADE;
