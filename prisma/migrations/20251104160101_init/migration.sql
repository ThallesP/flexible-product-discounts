-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" TIMESTAMP(3),
    "accessToken" TEXT NOT NULL,
    "userId" BIGINT,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "accountOwner" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT,
    "collaborator" BOOLEAN DEFAULT false,
    "emailVerified" BOOLEAN DEFAULT false,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormSettings" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "fieldOne" TEXT,
    "fieldTwo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SelectedProduct" (
    "id" TEXT NOT NULL,
    "formSettingsId" TEXT NOT NULL,
    "shopifyProductId" TEXT NOT NULL,
    "productTitle" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SelectedProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SelectedCollection" (
    "id" TEXT NOT NULL,
    "formSettingsId" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "collectionTitle" TEXT NOT NULL,
    "productCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SelectedCollection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SelectedType" (
    "id" TEXT NOT NULL,
    "formSettingsId" TEXT NOT NULL,
    "typeName" TEXT NOT NULL,
    "productCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SelectedType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SelectedTag" (
    "id" TEXT NOT NULL,
    "formSettingsId" TEXT NOT NULL,
    "tagName" TEXT NOT NULL,
    "productCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SelectedTag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FormSettings_shop_key" ON "FormSettings"("shop");

-- CreateIndex
CREATE UNIQUE INDEX "SelectedProduct_formSettingsId_shopifyProductId_key" ON "SelectedProduct"("formSettingsId", "shopifyProductId");

-- CreateIndex
CREATE UNIQUE INDEX "SelectedCollection_formSettingsId_collectionId_key" ON "SelectedCollection"("formSettingsId", "collectionId");

-- CreateIndex
CREATE UNIQUE INDEX "SelectedType_formSettingsId_typeName_key" ON "SelectedType"("formSettingsId", "typeName");

-- CreateIndex
CREATE UNIQUE INDEX "SelectedTag_formSettingsId_tagName_key" ON "SelectedTag"("formSettingsId", "tagName");

-- AddForeignKey
ALTER TABLE "SelectedProduct" ADD CONSTRAINT "SelectedProduct_formSettingsId_fkey" FOREIGN KEY ("formSettingsId") REFERENCES "FormSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SelectedCollection" ADD CONSTRAINT "SelectedCollection_formSettingsId_fkey" FOREIGN KEY ("formSettingsId") REFERENCES "FormSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SelectedType" ADD CONSTRAINT "SelectedType_formSettingsId_fkey" FOREIGN KEY ("formSettingsId") REFERENCES "FormSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SelectedTag" ADD CONSTRAINT "SelectedTag_formSettingsId_fkey" FOREIGN KEY ("formSettingsId") REFERENCES "FormSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
