-- Add archived column to campaigns with default false
ALTER TABLE `campaigns`
  ADD COLUMN `archived` BOOLEAN NOT NULL DEFAULT FALSE;
