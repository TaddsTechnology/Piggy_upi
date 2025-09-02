-- Quick Fix for Existing Database Tables
-- Run this if you already have tables created and just need to fix column names

-- Fix transactions table to match the application code
DO $$
BEGIN
    -- Check if table exists and add missing columns
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'transactions') THEN
        -- Add missing columns if they don't exist
        ALTER TABLE transactions ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(255);
        ALTER TABLE transactions ADD COLUMN IF NOT EXISTS webhook_received_at TIMESTAMP;
        ALTER TABLE transactions ADD COLUMN IF NOT EXISTS error_message TEXT;
        ALTER TABLE transactions ADD COLUMN IF NOT EXISTS signature_verified BOOLEAN DEFAULT false;
        
        -- Add index for razorpay_payment_id
        CREATE INDEX IF NOT EXISTS idx_transactions_razorpay_payment_id ON transactions(razorpay_payment_id);
        
        RAISE NOTICE 'Fixed transactions table structure';
    ELSE
        RAISE NOTICE 'transactions table does not exist yet - run the main schema.sql first';
    END IF;
END
$$;

-- Add enhanced piggy_ledger columns
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'piggy_ledger') THEN
        ALTER TABLE piggy_ledger ADD COLUMN IF NOT EXISTS upi_transaction_id UUID;
        ALTER TABLE piggy_ledger ADD COLUMN IF NOT EXISTS order_id VARCHAR(255);
        
        RAISE NOTICE 'Fixed piggy_ledger table structure';
    END IF;
END
$$;

-- Create missing tables if they don't exist
CREATE TABLE IF NOT EXISTS razorpay_webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,
    razorpay_order_id VARCHAR(255),
    razorpay_payment_id VARCHAR(255),
    payload JSONB NOT NULL,
    signature VARCHAR(500),
    processed BOOLEAN DEFAULT false,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payment_status_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID,
    old_status VARCHAR(20),
    new_status VARCHAR(20),
    reason TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS upi_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    amount DECIMAL(10,2) NOT NULL,
    direction VARCHAR(10) CHECK (direction IN ('debit', 'credit')),
    merchant VARCHAR(255),
    category VARCHAR(100),
    upi_ref VARCHAR(100) UNIQUE,
    transaction_type VARCHAR(50),
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add helpful functions
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

-- Test the fix
SELECT 'Database structure fixed successfully!' as status;
