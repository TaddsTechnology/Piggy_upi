-- Quick Fix for Users Table Column Issue
-- First, let's check what columns your users table actually has

-- Check current users table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Add missing name column if it doesn't exist (it should be full_name based on your original schema)
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);

-- Update the name column to match what the view expects
ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255);

-- If you have full_name but not name, copy the data
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'full_name'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'name'
    ) THEN
        UPDATE users SET name = full_name WHERE name IS NULL AND full_name IS NOT NULL;
    END IF;
END $$;

-- Now create the view with the correct column name
DROP VIEW IF EXISTS user_payment_dashboard;
CREATE VIEW user_payment_dashboard AS
SELECT 
    u.id as user_id,
    COALESCE(u.name, u.full_name, u.email) as name,
    u.email,
    COALESCE(u.kyc_status, 'pending') as kyc_status,
    get_user_piggy_balance(u.id) as piggy_balance,
    COUNT(CASE WHEN t.status = 'paid' THEN 1 END) as successful_payments,
    COUNT(CASE WHEN t.status = 'failed' THEN 1 END) as failed_payments,
    COALESCE(SUM(CASE WHEN t.status = 'paid' THEN t.original_amount END), 0) as total_invested,
    COALESCE(SUM(CASE WHEN t.status = 'paid' THEN t.round_off_amount END), 0) as total_roundoff,
    COALESCE(SUM(CASE WHEN roi.status = 'invested' THEN roi.amount END), 0) as roundoff_invested
FROM users u
LEFT JOIN transactions t ON u.id = t.user_id
LEFT JOIN round_off_investments roi ON u.id = roi.user_id
GROUP BY u.id, u.name, u.full_name, u.email, u.kyc_status;

SELECT 'Users table and view fixed successfully!' as status;
