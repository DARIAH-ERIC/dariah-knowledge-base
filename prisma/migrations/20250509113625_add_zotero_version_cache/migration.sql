-- CreateTable
CREATE TABLE "zotero_cache" (
    "id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "lastModifiedVersion" TEXT NOT NULL,

    CONSTRAINT "zotero_cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "zotero_cache_url_key" ON "zotero_cache"("url");
