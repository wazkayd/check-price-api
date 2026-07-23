'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "PriceChangeType" AS ENUM ('CREATED', 'UPDATED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS "ProductPrice" (
        "id" TEXT NOT NULL,
        "productId" TEXT NOT NULL,
        "storeId" TEXT NOT NULL,
        "price" DECIMAL(12, 2) NOT NULL,
        "currency" TEXT NOT NULL DEFAULT 'NGN',
        "submittedById" TEXT,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT "ProductPrice_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "ProductPrice_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE,
        CONSTRAINT "ProductPrice_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE,
        CONSTRAINT "ProductPrice_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE SET NULL
      );
    `);

    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "ProductPrice_productId_storeId_key"
      ON "ProductPrice"("productId", "storeId");
    `);

    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS "ProductPrice_productId_idx" ON "ProductPrice"("productId");
    `);

    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS "ProductPrice_storeId_idx" ON "ProductPrice"("storeId");
    `);

    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS "PriceHistory" (
        "id" TEXT NOT NULL,
        "productPriceId" TEXT NOT NULL,
        "productId" TEXT NOT NULL,
        "storeId" TEXT NOT NULL,
        "price" DECIMAL(12, 2) NOT NULL,
        "currency" TEXT NOT NULL,
        "changedById" TEXT,
        "changeType" "PriceChangeType" NOT NULL,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT "PriceHistory_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "PriceHistory_productPriceId_fkey" FOREIGN KEY ("productPriceId") REFERENCES "ProductPrice"("id") ON DELETE CASCADE,
        CONSTRAINT "PriceHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE SET NULL
      );
    `);

    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS "PriceHistory_productPriceId_idx" ON "PriceHistory"("productPriceId");
    `);

    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS "PriceHistory_productId_storeId_idx" ON "PriceHistory"("productId", "storeId");
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS "PriceHistory";');
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS "ProductPrice";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "PriceChangeType";');
  },
};
