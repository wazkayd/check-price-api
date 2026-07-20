'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "StoreStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED', 'INACTIVE');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS "Store" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "address" TEXT NOT NULL,
        "city" TEXT,
        "state" TEXT,
        "country" TEXT,
        "postalCode" TEXT,
        "latitude" DECIMAL(10, 8),
        "longitude" DECIMAL(11, 8),
        "phoneNumber" TEXT,
        "email" TEXT,
        "status" "StoreStatus" NOT NULL DEFAULT 'PENDING',
        "isVerified" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
      );
    `);

    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS "StoreAgent" (
        "id" TEXT NOT NULL,
        "storeId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "assignedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "assignedById" TEXT,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT "StoreAgent_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "StoreAgent_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE,
        CONSTRAINT "StoreAgent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
        CONSTRAINT "StoreAgent_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User"("id") ON DELETE SET NULL
      );
    `);

    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "StoreAgent_storeId_userId_key" ON "StoreAgent"("storeId", "userId");
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS "StoreAgent";');
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS "Store";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "StoreStatus";');
  },
};
