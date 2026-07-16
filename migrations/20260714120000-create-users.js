'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "UserRole" AS ENUM ('USER', 'STORE_AGENT', 'ADMIN');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL,
        "fullName" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "password" TEXT,
        "provider" TEXT NOT NULL DEFAULT 'local',
        "providerId" TEXT,
        "role" "UserRole" NOT NULL DEFAULT 'USER',
        "isVerified" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "avatar" TEXT,
        "phoneNumber" TEXT,
        CONSTRAINT "User_pkey" PRIMARY KEY ("id")
      );
    `);

    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS "User";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "UserRole";');
  },
};
