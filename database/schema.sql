-- UPI Piggy Dynamic Database Schema
-- PostgreSQL/MySQL compatible

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    razorpay_customer_id VARCHAR(255) UNIQUE,
    kyc_status VARCHAR(20) DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User preferences table
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    round_off_enabled BOOLEAN DEFAULT true,
    round_up_threshold DECIMAL(3,2) DEFAULT 0.50,
    max_round_off DECIMAL(10,2) DEFAULT 10.00,
    invest_round_off BOOLEAN DEFAULT true,
    portfolio_preset VARCHAR(20) DEFAULT 'balanced' CHECK (portfolio_preset IN ('safe', 'balanced', 'growth')),
    weekly_target DECIMAL(10,2) DEFAULT 200.00,
    auto_invest_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Autopay settings table
CREATE TABLE autopay_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    razorpay_token_id VARCHAR(255) UNIQUE,
    max_amount DECIMAL(10,2) NOT NULL,
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
    is_active BOOLEAN DEFAULT true,
    next_payment_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table (Razorpay payments)
DROP TABLE IF EXISTS transactions CASCADE;
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    razorpay_order_id VARCHAR(255) NOT NULL,
    razorpay_payment_id VARCHAR(255),
    original_amount DECIMAL(10,2) NOT NULL,
    rounded_amount DECIMAL(10,2) NOT NULL,
    round_off_amount DECIMAL(10,2) DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'paid', 'failed', 'cancelled')),
    description TEXT,
    portfolio_id UUID,
    payment_method VARCHAR(50),
    webhook_received_at TIMESTAMP,
    error_message TEXT,
    signature_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Portfolios table
CREATE TABLE portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
    minimum_investment DECIMAL(10,2) NOT NULL,
    expected_returns_min DECIMAL(5,2),
    expected_returns_max DECIMAL(5,2),
    expected_returns_historical DECIMAL(5,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Portfolio composition table
CREATE TABLE portfolio_compositions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    asset_name VARCHAR(255) NOT NULL,
    asset_symbol VARCHAR(50),
    percentage DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User investments table
CREATE TABLE investments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES transactions(id),
    portfolio_id UUID NOT NULL REFERENCES portfolios(id),
    amount DECIMAL(10,2) NOT NULL,
    units DECIMAL(15,4),
    nav_price DECIMAL(10,2),
    investment_type VARCHAR(20) DEFAULT 'regular' CHECK (investment_type IN ('regular', 'round_off', 'autopay')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Round-off investments table
CREATE TABLE round_off_investments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES transactions(id),
    amount DECIMAL(10,2) NOT NULL,
    portfolio_id UUID REFERENCES portfolios(id),
    status VARCHAR(20) DEFAULT 'invested' CHECK (status IN ('pending', 'invested', 'failed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User piggy balance ledger
CREATE TABLE piggy_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('roundup_credit', 'investment_debit', 'manual_credit', 'refund_credit')),
    reference_id UUID, -- Can reference transactions, investments, etc.
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Autopay execution log
CREATE TABLE autopay_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    autopay_setting_id UUID NOT NULL REFERENCES autopay_settings(id),
    attempted_amount DECIMAL(10,2) NOT NULL,
    actual_amount DECIMAL(10,2),
    status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'failed', 'insufficient_balance')),
    transaction_id UUID REFERENCES transactions(id),
    error_message TEXT,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_razorpay_customer_id ON users(razorpay_customer_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_razorpay_order_id ON transactions(razorpay_order_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_investments_user_id ON investments(user_id);
CREATE INDEX idx_piggy_ledger_user_id ON piggy_ledger(user_id);
CREATE INDEX idx_autopay_settings_user_id ON autopay_settings(user_id);
CREATE INDEX idx_autopay_executions_user_id ON autopay_executions(user_id);

-- Insert default portfolios
INSERT INTO portfolios (id, name, description, risk_level, minimum_investment, expected_returns_min, expected_returns_max, expected_returns_historical) VALUES
('11111111-1111-1111-1111-111111111111', 'Conservative Portfolio', 'Low-risk portfolio focused on capital preservation', 'low', 100.00, 6.00, 9.00, 7.50),
('22222222-2222-2222-2222-222222222222', 'Balanced Portfolio', 'Moderate-risk portfolio with balanced growth', 'medium', 500.00, 8.00, 14.00, 11.00),
('33333333-3333-3333-3333-333333333333', 'Growth Portfolio', 'High-risk portfolio focused on capital appreciation', 'high', 1000.00, 10.00, 18.00, 14.50);

-- Insert portfolio compositions
INSERT INTO portfolio_compositions (portfolio_id, asset_name, asset_symbol, percentage) VALUES
-- Conservative Portfolio
('11111111-1111-1111-1111-111111111111', 'Gold ETF', 'GOLDBEES', 70.00),
('11111111-1111-1111-1111-111111111111', 'Nifty 50 ETF', 'NIFTYBEES', 30.00),

-- Balanced Portfolio  
('22222222-2222-2222-2222-222222222222', 'Gold ETF', 'GOLDBEES', 50.00),
('22222222-2222-2222-2222-222222222222', 'Nifty 50 ETF', 'NIFTYBEES', 50.00),

-- Growth Portfolio
('33333333-3333-3333-3333-333333333333', 'Gold ETF', 'GOLDBEES', 30.00),
('33333333-3333-3333-3333-333333333333', 'Nifty 50 ETF', 'NIFTYBEES', 70.00);

-- Create triggers to update updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_autopay_settings_updated_at BEFORE UPDATE ON autopay_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_portfolios_updated_at BEFORE UPDATE ON portfolios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_investments_updated_at BEFORE UPDATE ON investments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- RAZORPAY INTEGRATION ENHANCEMENT
-- ========================================

-- Enhanced transactions table with better Razorpay support
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS webhook_received_at TIMESTAMP;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS error_message TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS signature_verified BOOLEAN DEFAULT false;

-- Razorpay webhooks log table
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

-- UPI transaction history table (for bank statement parsing)
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

-- Payment status tracking table
CREATE TABLE IF NOT EXISTS payment_status_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    old_status VARCHAR(20),
    new_status VARCHAR(20),
    reason TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User notification preferences
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

-- Additional indexes for Razorpay integration
CREATE INDEX IF NOT EXISTS idx_transactions_razorpay_payment_id ON transactions(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_razorpay_webhooks_event_type ON razorpay_webhooks(event_type);
CREATE INDEX IF NOT EXISTS idx_razorpay_webhooks_processed ON razorpay_webhooks(processed);
CREATE INDEX IF NOT EXISTS idx_upi_transactions_user_id ON upi_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_upi_transactions_timestamp ON upi_transactions(timestamp);
CREATE INDEX IF NOT EXISTS idx_payment_status_log_transaction_id ON payment_status_log(transaction_id);

-- Update piggy_ledger to support UPI transactions
ALTER TABLE piggy_ledger ADD COLUMN IF NOT EXISTS upi_transaction_id UUID REFERENCES upi_transactions(id);
ALTER TABLE piggy_ledger ADD COLUMN IF NOT EXISTS order_id VARCHAR(255);

-- Functions for better payment processing
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

-- Function to update transaction status with logging
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

-- Function to add round-off to piggy ledger
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

-- View for user dashboard with payment stats
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

-- Sample test data (uncomment to use)
/*
INSERT INTO users (email, name, phone, kyc_status) VALUES 
('demo@upipiggy.com', 'Demo User', '+91-9999999999', 'verified');

INSERT INTO user_preferences (user_id, round_off_enabled, invest_round_off, weekly_target) 
SELECT id, true, true, 1000.00 FROM users WHERE email = 'demo@upipiggy.com';

INSERT INTO notification_settings (user_id) 
SELECT id FROM users WHERE email = 'demo@upipiggy.com';
*/
