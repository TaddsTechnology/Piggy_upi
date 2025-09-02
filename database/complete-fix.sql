-- Complete Database Fix Script
-- Run this to create all missing tables and fix the structure

-- First, drop the problematic view if it exists
DROP VIEW IF EXISTS user_payment_dashboard;

-- Create round_off_investments table if it doesn't exist
CREATE TABLE IF NOT EXISTS round_off_investments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES transactions(id),
    amount DECIMAL(10,2) NOT NULL,
    portfolio_id UUID REFERENCES portfolios(id),
    status VARCHAR(20) DEFAULT 'invested' CHECK (status IN ('pending', 'invested', 'failed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fix transactions table structure
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(255);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS webhook_received_at TIMESTAMP;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS error_message TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS signature_verified BOOLEAN DEFAULT false;

-- Create all other missing tables
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

CREATE TABLE IF NOT EXISTS upi_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
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

CREATE TABLE IF NOT EXISTS payment_status_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    old_status VARCHAR(20),
    new_status VARCHAR(20),
    reason TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notification_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    email_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    push_notifications BOOLEAN DEFAULT true,
    payment_alerts BOOLEAN DEFAULT true,
    investment_alerts BOOLEAN DEFAULT true,
    roundoff_alerts BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add missing columns to piggy_ledger
ALTER TABLE piggy_ledger ADD COLUMN IF NOT EXISTS upi_transaction_id UUID REFERENCES upi_transactions(id);
ALTER TABLE piggy_ledger ADD COLUMN IF NOT EXISTS order_id VARCHAR(255);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_transactions_razorpay_payment_id ON transactions(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_round_off_investments_user_id ON round_off_investments(user_id);
CREATE INDEX IF NOT EXISTS idx_round_off_investments_transaction_id ON round_off_investments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_razorpay_webhooks_event_type ON razorpay_webhooks(event_type);
CREATE INDEX IF NOT EXISTS idx_razorpay_webhooks_processed ON razorpay_webhooks(processed);
CREATE INDEX IF NOT EXISTS idx_upi_transactions_user_id ON upi_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_upi_transactions_timestamp ON upi_transactions(timestamp);
CREATE INDEX IF NOT EXISTS idx_payment_status_log_transaction_id ON payment_status_log(transaction_id);

-- Create helpful functions
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

CREATE OR REPLACE FUNCTION update_transaction_status(
    p_transaction_id UUID,
    p_new_status VARCHAR(20),
    p_payment_id VARCHAR(255) DEFAULT NULL,
    p_payment_method VARCHAR(50) DEFAULT NULL,
    p_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    old_status VARCHAR(20);
    affected_rows INTEGER;
BEGIN
    -- Get current status
    SELECT status INTO old_status FROM transactions WHERE id = p_transaction_id;
    
    IF old_status IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Update transaction
    UPDATE transactions SET 
        status = p_new_status,
        razorpay_payment_id = COALESCE(p_payment_id, razorpay_payment_id),
        payment_method = COALESCE(p_payment_method, payment_method),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_transaction_id;
    
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    
    -- Log status change
    IF affected_rows > 0 THEN
        INSERT INTO payment_status_log (transaction_id, old_status, new_status, reason)
        VALUES (p_transaction_id, old_status, p_new_status, p_reason);
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION add_roundoff_to_piggy(
    p_user_id UUID,
    p_transaction_id UUID,
    p_amount DECIMAL(10,2),
    p_payment_id VARCHAR(255)
)
RETURNS UUID AS $$
DECLARE
    ledger_id UUID;
BEGIN
    INSERT INTO piggy_ledger (
        user_id, 
        amount, 
        type, 
        reference_id, 
        description
    ) VALUES (
        p_user_id,
        p_amount,
        'roundup_credit',
        p_transaction_id,
        CONCAT('Round-off from payment ', p_payment_id)
    ) RETURNING id INTO ledger_id;
    
    RETURN ledger_id;
END;
$$ LANGUAGE plpgsql;

-- Now recreate the view with all tables existing
CREATE OR REPLACE VIEW user_payment_dashboard AS
SELECT 
    u.id as user_id,
    u.name,
    u.email,
    u.kyc_status,
    get_user_piggy_balance(u.id) as piggy_balance,
    COUNT(CASE WHEN t.status = 'paid' THEN 1 END) as successful_payments,
    COUNT(CASE WHEN t.status = 'failed' THEN 1 END) as failed_payments,
    COALESCE(SUM(CASE WHEN t.status = 'paid' THEN t.original_amount END), 0) as total_invested,
    COALESCE(SUM(CASE WHEN t.status = 'paid' THEN t.round_off_amount END), 0) as total_roundoff,
    COALESCE(SUM(CASE WHEN roi.status = 'invested' THEN roi.amount END), 0) as roundoff_invested
FROM users u
LEFT JOIN transactions t ON u.id = t.user_id
LEFT JOIN round_off_investments roi ON u.id = roi.user_id
GROUP BY u.id, u.name, u.email, u.kyc_status;

-- Test to ensure everything is working
SELECT 'All tables and functions created successfully!' as status;

-- Show table structure verification
SELECT 
    table_name,
    COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name IN ('transactions', 'round_off_investments', 'razorpay_webhooks', 'upi_transactions', 'payment_status_log')
GROUP BY table_name
ORDER BY table_name;
