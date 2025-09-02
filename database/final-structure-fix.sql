-- Final Fix - Check and Fix All Column Names
-- Run these commands one by one to see what you actually have

-- Step 1: Check your actual transactions table structure
SELECT 'TRANSACTIONS TABLE STRUCTURE:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'transactions' 
ORDER BY ordinal_position;

-- Step 2: Check your actual users table structure  
SELECT 'USERS TABLE STRUCTURE:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Step 3: Add missing columns to transactions table
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS original_amount DECIMAL(10,2);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS rounded_amount DECIMAL(10,2);  
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS round_off_amount DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(255);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS webhook_received_at TIMESTAMP;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS error_message TEXT;

-- Step 4: Add missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);

-- Step 5: Create the piggy balance function
CREATE OR REPLACE FUNCTION get_user_piggy_balance(p_user_id UUID)
RETURNS DECIMAL(10,2) AS $$
BEGIN
    RETURN COALESCE(
        (SELECT SUM(
            CASE 
                WHEN type IN ('roundup_credit', 'manual_credit', 'refund_credit') THEN amount
                WHEN type = 'investment_debit' THEN -amount
                ELSE 0 
            END
        ) FROM piggy_ledger WHERE user_id = p_user_id),
        0
    );
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create a working view that handles missing columns gracefully
DROP VIEW IF EXISTS user_payment_dashboard;
CREATE VIEW user_payment_dashboard AS
SELECT 
    u.id as user_id,
    COALESCE(u.name, u.full_name, u.email, 'Unknown User') as name,
    COALESCE(u.email, 'no-email') as email,
    COALESCE(u.kyc_status, 'pending') as kyc_status,
    get_user_piggy_balance(u.id) as piggy_balance,
    COUNT(CASE WHEN t.status = 'paid' THEN 1 END) as successful_payments,
    COUNT(CASE WHEN t.status = 'failed' THEN 1 END) as failed_payments,
    COALESCE(SUM(CASE WHEN t.status = 'paid' THEN COALESCE(t.original_amount, t.amount, 0) END), 0) as total_invested,
    COALESCE(SUM(CASE WHEN t.status = 'paid' THEN COALESCE(t.round_off_amount, 0) END), 0) as total_roundoff,
    COALESCE(SUM(CASE WHEN roi.status = 'invested' THEN roi.amount END), 0) as roundoff_invested
FROM users u
LEFT JOIN transactions t ON u.id = t.user_id
LEFT JOIN round_off_investments roi ON u.id = roi.user_id
GROUP BY u.id, u.name, u.full_name, u.email, u.kyc_status;

-- Step 7: Test the view
SELECT 'Testing view...' as status;
SELECT COUNT(*) as user_count FROM user_payment_dashboard;

-- Step 8: Show final table structures
SELECT 'FINAL TRANSACTIONS COLUMNS:' as info;
SELECT column_name FROM information_schema.columns WHERE table_name = 'transactions' ORDER BY ordinal_position;

SELECT 'FINAL USERS COLUMNS:' as info;  
SELECT column_name FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position;

SELECT 'Database structure fixed and ready for payments!' as final_status;
