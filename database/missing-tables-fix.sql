-- Fix for Missing Tables Based on Your Current Database
-- Run this in your Supabase SQL Editor

-- 1. Create the missing portfolios table first (required by other tables)
CREATE TABLE IF NOT EXISTS portfolios (
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

-- 2. Create portfolio_compositions table
CREATE TABLE IF NOT EXISTS portfolio_compositions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    asset_name VARCHAR(255) NOT NULL,
    asset_symbol VARCHAR(50),
    percentage DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create investments table
CREATE TABLE IF NOT EXISTS investments (
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

-- 4. Create round_off_investments table (now portfolios exists)
CREATE TABLE IF NOT EXISTS round_off_investments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES transactions(id),
    amount DECIMAL(10,2) NOT NULL,
    portfolio_id UUID REFERENCES portfolios(id),
    status VARCHAR(20) DEFAULT 'invested' CHECK (status IN ('pending', 'invested', 'failed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create user_preferences table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_preferences (
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

-- 6. Create autopay_settings table
CREATE TABLE IF NOT EXISTS autopay_settings (
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

-- 7. Create autopay_executions table
CREATE TABLE IF NOT EXISTS autopay_executions (
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

-- 8. Create notification_settings table
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

-- 9. Insert default portfolios data
INSERT INTO portfolios (id, name, description, risk_level, minimum_investment, expected_returns_min, expected_returns_max, expected_returns_historical) VALUES
('11111111-1111-1111-1111-111111111111', 'Conservative Portfolio', 'Low-risk portfolio focused on capital preservation with Gold ETF focus', 'low', 100.00, 6.00, 9.00, 7.50),
('22222222-2222-2222-2222-222222222222', 'Balanced Portfolio', 'Moderate-risk portfolio with balanced growth between Gold and Equity', 'medium', 500.00, 8.00, 14.00, 11.00),
('33333333-3333-3333-3333-333333333333', 'Growth Portfolio', 'High-risk portfolio focused on capital appreciation via Equity ETFs', 'high', 1000.00, 10.00, 18.00, 14.50)
ON CONFLICT (id) DO NOTHING;

-- 10. Insert portfolio compositions
INSERT INTO portfolio_compositions (portfolio_id, asset_name, asset_symbol, percentage) VALUES
-- Conservative Portfolio
('11111111-1111-1111-1111-111111111111', 'Gold ETF', 'GOLDBEES', 70.00),
('11111111-1111-1111-1111-111111111111', 'Nifty 50 ETF', 'NIFTYBEES', 30.00),

-- Balanced Portfolio  
('22222222-2222-2222-2222-222222222222', 'Gold ETF', 'GOLDBEES', 50.00),
('22222222-2222-2222-2222-222222222222', 'Nifty 50 ETF', 'NIFTYBEES', 50.00),

-- Growth Portfolio
('33333333-3333-3333-3333-333333333333', 'Gold ETF', 'GOLDBEES', 30.00),
('33333333-3333-3333-3333-333333333333', 'Nifty 50 ETF', 'NIFTYBEES', 70.00)
ON CONFLICT DO NOTHING;

-- 11. Add missing columns to existing tables
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(255);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS webhook_received_at TIMESTAMP;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS error_message TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS signature_verified BOOLEAN DEFAULT false;

ALTER TABLE piggy_ledger ADD COLUMN IF NOT EXISTS upi_transaction_id UUID;
ALTER TABLE piggy_ledger ADD COLUMN IF NOT EXISTS order_id VARCHAR(255);

-- 12. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_portfolios_risk_level ON portfolios(risk_level);
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_portfolio_id ON investments(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_round_off_investments_user_id ON round_off_investments(user_id);
CREATE INDEX IF NOT EXISTS idx_round_off_investments_transaction_id ON round_off_investments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_razorpay_payment_id ON transactions(razorpay_payment_id);

-- 13. Create update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_portfolios_updated_at BEFORE UPDATE ON portfolios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_investments_updated_at BEFORE UPDATE ON investments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_autopay_settings_updated_at BEFORE UPDATE ON autopay_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_settings_updated_at BEFORE UPDATE ON notification_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 14. Create helpful functions
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

-- 15. Create the user dashboard view (now all tables exist)
DROP VIEW IF EXISTS user_payment_dashboard;
CREATE VIEW user_payment_dashboard AS
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

-- 16. Verification queries
SELECT 'Database setup completed successfully!' as status;

-- Show all tables created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('portfolios', 'portfolio_compositions', 'investments', 'round_off_investments', 'user_preferences')
ORDER BY table_name;

-- Show portfolio data
SELECT id, name, risk_level FROM portfolios;

-- Test the view
SELECT 'user_payment_dashboard view created successfully' as view_status;
