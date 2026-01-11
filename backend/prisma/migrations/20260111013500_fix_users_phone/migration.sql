-- Fix missing phone column on users table.
-- Earlier migration 20260110200141_user_management_auth redefined the table
-- and dropped the column when applied before 20260110190817_add_user_phone.
-- This migration restores the column so all environments match schema.prisma.
ALTER TABLE "users" ADD COLUMN "phone" TEXT;
