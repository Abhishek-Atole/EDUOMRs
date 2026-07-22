-- Rename role 'admin' → 'institution_admin' across all existing user rows.
-- This is a data-only migration; the column type (VarChar(20)) is unchanged.
UPDATE users SET role = 'institution_admin' WHERE role = 'admin';
