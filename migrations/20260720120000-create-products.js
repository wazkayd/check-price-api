'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS "ProductCategory" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "slug" TEXT NOT NULL,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("id")
      );
    `);

    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "ProductCategory_name_key" ON "ProductCategory"("name");
    `);

    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "ProductCategory_slug_key" ON "ProductCategory"("slug");
    `);

    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS "Product" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "sku" TEXT,
        "brand" TEXT,
        "categoryId" TEXT NOT NULL,
        "isAvailable" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT "Product_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ProductCategory"("id") ON DELETE RESTRICT
      );
    `);

    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "Product_sku_key" ON "Product"("sku") WHERE "sku" IS NOT NULL;
    `);

    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS "Product_categoryId_idx" ON "Product"("categoryId");
    `);

    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS "ProductImage" (
        "id" TEXT NOT NULL,
        "productId" TEXT NOT NULL,
        "url" TEXT NOT NULL,
        "altText" TEXT,
        "isPrimary" BOOLEAN NOT NULL DEFAULT false,
        "sortOrder" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE
      );
    `);

    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS "ProductImage_productId_idx" ON "ProductImage"("productId");
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS "ProductImage";');
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS "Product";');
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS "ProductCategory";');
  },
};
