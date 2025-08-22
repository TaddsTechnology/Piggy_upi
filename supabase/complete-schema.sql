-- UPI Piggy Complete Production Database Schema
-- Run this in your Supabase SQL editor after creating your project

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enable Row Level Security globally
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- ============================================================================
-- CORE USER TABLES (ENHANCED)
-- ============================================================================

-- 1. Enhanced Users table
CREATE TABLE users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    date_of_birth DATE,
    pan_number TEXT, -- Encrypted
    aadhaar_hash TEXT, -- Hashed for privacy
    risk_profile TEXT CHECK (risk_profile IN ('conservative', 'moderate', 'aggressive')) DEFAULT 'moderate',
    kyc_status TEXT CHECK (kyc_status IN ('pending', 'in_progress', 'verified', 'rejected')) DEFAULT 'pending',
    onboarding_completed BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. KYC Documents table
CREATE TABLE kyc_documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    document_type TEXT CHECK (document_type IN ('pan', 'aadhaar', 'bank_statement', 'selfie')) NOT NULL,
    document_url TEXT, -- Secure S3/Supabase Storage URL
    document_number TEXT, -- Encrypted
    verification_status TEXT CHECK (verification_status IN ('pending', 'verified', 'rejected')) DEFAULT 'pending',
    rejection_reason TEXT,
    verified_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Bank Accounts table
CREATE TABLE bank_accounts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    account_number TEXT NOT NULL, -- Encrypted
    ifsc_code TEXT NOT NULL,
    bank_name TEXT NOT NULL,
    account_holder_name TEXT NOT NULL,
    account_type TEXT CHECK (account_type IN ('savings', 'current')) DEFAULT 'savings',
    is_primary BOOLEAN DEFAULT FALSE,
    verification_status TEXT CHECK (verification_status IN ('pending', 'verified', 'failed')) DEFAULT 'pending',
    penny_drop_status TEXT CHECK (penny_drop_status IN ('pending', 'success', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, account_number) -- One entry per account per user
);

-- 4. UPI Mandates table
CREATE TABLE upi_mandates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    bank_account_id UUID REFERENCES bank_accounts(id) ON DELETE SET NULL,
    mandate_id TEXT UNIQUE NOT NULL, -- From payment gateway
    upi_id TEXT NOT NULL,
    max_amount DECIMAL(12,2) DEFAULT 1000.00,
    frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'monthly', 'as_required')) DEFAULT 'as_required',
    status TEXT CHECK (status IN ('pending', 'active', 'paused', 'cancelled', 'expired')) DEFAULT 'pending',
    gateway_response JSONB, -- Store full gateway response
    start_date DATE,
    end_date DATE,
    last_debit_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Enhanced User Settings table
CREATE TABLE user_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    mandate_id UUID REFERENCES upi_mandates(id) ON DELETE SET NULL,
    primary_bank_account_id UUID REFERENCES bank_accounts(id) ON DELETE SET NULL,
    round_to_nearest INTEGER DEFAULT 10 CHECK (round_to_nearest IN (10, 20, 50, 100)),
    min_roundup INTEGER DEFAULT 1,
    max_roundup INTEGER DEFAULT 50,
    portfolio_preset TEXT CHECK (portfolio_preset IN ('safe', 'balanced', 'growth')) DEFAULT 'balanced',
    auto_invest_enabled BOOLEAN DEFAULT TRUE,
    weekly_target DECIMAL(12,2) DEFAULT 200,
    sweep_day TEXT CHECK (sweep_day IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')) DEFAULT 'sunday',
    notification_preferences JSONB DEFAULT '{"push": true, "email": true, "sms": false, "investment_updates": true, "roundup_summary": true}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ============================================================================
-- TRANSACTION & SMS PROCESSING TABLES
-- ============================================================================

-- 6. SMS Events table (Raw SMS data)
CREATE TABLE sms_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    sender_id TEXT NOT NULL, -- Bank identifier (e.g., 'HDFCBK')
    raw_message TEXT NOT NULL,
    received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed BOOLEAN DEFAULT FALSE,
    parsing_confidence DECIMAL(3,2), -- 0.00 to 1.00
    parsed_data JSONB, -- Extracted transaction details
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Enhanced Transactions table
CREATE TABLE transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    sms_event_id UUID REFERENCES sms_events(id) ON DELETE SET NULL,
    amount DECIMAL(12,2) NOT NULL,
    direction TEXT CHECK (direction IN ('debit', 'credit')) NOT NULL,
    merchant TEXT,
    category TEXT,
    upi_ref TEXT,
    bank_ref TEXT,
    status TEXT CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'completed',
    balance_after DECIMAL(12,2), -- Account balance after transaction
    sms_raw_text TEXT, -- Copy of SMS for debugging
    parsed_data JSONB, -- Structured data from SMS
    confidence_score DECIMAL(3,2), -- Parsing confidence
    manual_verification BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Roundup Queue table (Pending round-ups)
CREATE TABLE roundup_queue (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE NOT NULL,
    roundup_amount DECIMAL(12,2) NOT NULL,
    status TEXT CHECK (status IN ('pending', 'processed', 'failed', 'cancelled')) DEFAULT 'pending',
    processed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(transaction_id) -- One roundup per transaction
);

-- ============================================================================
-- INVESTMENT & PORTFOLIO TABLES (ENHANCED)
-- ============================================================================

-- 9. Enhanced Orders table
CREATE TABLE orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    side TEXT CHECK (side IN ('buy', 'sell')) NOT NULL,
    symbol TEXT NOT NULL,
    quantity DECIMAL(12,6) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    fees DECIMAL(12,2) DEFAULT 0,
    tax DECIMAL(12,2) DEFAULT 0,
    status TEXT CHECK (status IN ('pending', 'filled', 'partially_filled', 'failed', 'cancelled')) DEFAULT 'pending',
    broker_order_id TEXT,
    settlement_date DATE,
    order_type TEXT CHECK (order_type IN ('roundup', 'manual', 'sip', 'goal')) DEFAULT 'roundup',
    goal_id UUID, -- Will reference goals table
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    filled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Enhanced Holdings table
CREATE TABLE holdings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    symbol TEXT NOT NULL,
    units DECIMAL(12,6) NOT NULL DEFAULT 0,
    avg_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
    current_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    current_value DECIMAL(12,2) GENERATED ALWAYS AS (units * current_price) STORED,
    unrealized_pnl DECIMAL(12,2) GENERATED ALWAYS AS ((current_price - avg_cost) * units) STORED,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, symbol)
);

-- 11. Enhanced Piggy Ledger table
CREATE TABLE piggy_ledger (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    type TEXT CHECK (type IN ('roundup_credit', 'manual_topup', 'investment_debit', 'refund_credit', 'fee_debit')) NOT NULL,
    reference TEXT,
    transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    goal_id UUID, -- Will reference goals table
    balance_after DECIMAL(12,2), -- Running balance
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Goals table
CREATE TABLE goals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    target_amount DECIMAL(12,2) NOT NULL,
    current_amount DECIMAL(12,2) DEFAULT 0,
    target_date DATE,
    category TEXT CHECK (category IN ('emergency', 'vacation', 'house', 'car', 'education', 'retirement', 'other')) DEFAULT 'other',
    priority INTEGER DEFAULT 1 CHECK (priority BETWEEN 1 AND 5),
    auto_invest_percentage DECIMAL(5,2) DEFAULT 0 CHECK (auto_invest_percentage BETWEEN 0 AND 100),
    is_active BOOLEAN DEFAULT TRUE,
    achieved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key reference for goals in orders and piggy_ledger
ALTER TABLE orders ADD CONSTRAINT fk_orders_goal 
    FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE SET NULL;
ALTER TABLE piggy_ledger ADD CONSTRAINT fk_piggy_ledger_goal 
    FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE SET NULL;

-- ============================================================================
-- NOTIFICATION & COMMUNICATION TABLES
-- ============================================================================

-- 13. Notifications table
CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT CHECK (type IN ('info', 'success', 'warning', 'error', 'achievement', 'investment', 'roundup', 'goal')) NOT NULL,
    category TEXT CHECK (category IN ('system', 'investment', 'roundup', 'goal', 'achievement', 'security')) NOT NULL,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    data JSONB, -- Additional data payload
    read_at TIMESTAMP WITH TIME ZONE,
    action_url TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. Referrals table
CREATE TABLE referrals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    referrer_user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    referee_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    referral_code TEXT UNIQUE NOT NULL,
    referee_email TEXT,
    referee_phone TEXT,
    status TEXT CHECK (status IN ('pending', 'signed_up', 'kyc_completed', 'first_investment', 'rewarded')) DEFAULT 'pending',
    reward_amount DECIMAL(12,2) DEFAULT 0,
    rewarded_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- SECURITY & AUDIT TABLES
-- ============================================================================

-- 15. Sessions table (Device/session tracking)
CREATE TABLE sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    device_id TEXT NOT NULL,
    device_name TEXT,
    device_type TEXT CHECK (device_type IN ('mobile', 'desktop', 'tablet')) DEFAULT 'mobile',
    ip_address INET,
    user_agent TEXT,
    location_data JSONB, -- City, country, etc.
    is_active BOOLEAN DEFAULT TRUE,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, device_id)
);

-- 16. Audit Logs table
CREATE TABLE audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT, -- 'user', 'transaction', 'order', etc.
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    risk_score INTEGER, -- 0-100
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- User and auth related
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_kyc_status ON users(kyc_status);

-- KYC and verification
CREATE INDEX idx_kyc_documents_user_id ON kyc_documents(user_id);
CREATE INDEX idx_kyc_documents_status ON kyc_documents(verification_status);

-- Banking and mandates
CREATE INDEX idx_bank_accounts_user_id ON bank_accounts(user_id);
CREATE INDEX idx_upi_mandates_user_id ON upi_mandates(user_id);
CREATE INDEX idx_upi_mandates_status ON upi_mandates(status);

-- SMS and transactions
CREATE INDEX idx_sms_events_user_id ON sms_events(user_id);
CREATE INDEX idx_sms_events_processed ON sms_events(processed, received_at);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_timestamp ON transactions(timestamp DESC);
CREATE INDEX idx_transactions_amount ON transactions(amount);
CREATE INDEX idx_roundup_queue_user_id ON roundup_queue(user_id);
CREATE INDEX idx_roundup_queue_status ON roundup_queue(status, created_at);

-- Investment and portfolio
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_timestamp ON orders(timestamp DESC);
CREATE INDEX idx_holdings_user_id ON holdings(user_id);
CREATE INDEX idx_piggy_ledger_user_id ON piggy_ledger(user_id);
CREATE INDEX idx_piggy_ledger_type ON piggy_ledger(type);
CREATE INDEX idx_piggy_ledger_timestamp ON piggy_ledger(timestamp DESC);

-- Goals and notifications
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_active ON goals(is_active, target_date);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, read_at) WHERE read_at IS NULL;

-- Security and audit
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_active ON sessions(is_active, last_activity_at);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_referrals_referrer ON referrals(referrer_user_id);
CREATE INDEX idx_referrals_code ON referrals(referral_code);

-- Prices (from existing schema)
CREATE INDEX idx_prices_symbol ON prices(symbol);
CREATE INDEX idx_prices_timestamp ON prices(timestamp DESC);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE upi_mandates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE roundup_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE piggy_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE prices ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can only see their own data
CREATE POLICY "Users can manage own profile" ON users FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can manage own KYC" ON kyc_documents FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own bank accounts" ON bank_accounts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own mandates" ON upi_mandates FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own settings" ON user_settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own SMS events" ON sms_events FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own transactions" ON transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own roundup queue" ON roundup_queue FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own orders" ON orders FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own holdings" ON holdings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own piggy ledger" ON piggy_ledger FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own goals" ON goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own referrals" ON referrals FOR ALL USING (auth.uid() = referrer_user_id OR auth.uid() = referee_user_id);
CREATE POLICY "Users can view own sessions" ON sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own audit logs" ON audit_logs FOR SELECT USING (auth.uid() = user_id);

-- Prices are public (read-only)
CREATE POLICY "Anyone can view prices" ON prices FOR SELECT USING (true);

-- ============================================================================
-- TRIGGERS AND FUNCTIONS
-- ============================================================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_kyc_documents_updated_at BEFORE UPDATE ON kyc_documents 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bank_accounts_updated_at BEFORE UPDATE ON bank_accounts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_upi_mandates_updated_at BEFORE UPDATE ON upi_mandates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_holdings_updated_at BEFORE UPDATE ON holdings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_referrals_updated_at BEFORE UPDATE ON referrals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate round-up amount
CREATE OR REPLACE FUNCTION calculate_roundup(
    transaction_amount DECIMAL,
    round_to_nearest INTEGER,
    min_roundup INTEGER,
    max_roundup INTEGER
) RETURNS DECIMAL AS $$
DECLARE
    roundup_amount DECIMAL;
BEGIN
    roundup_amount := round_to_nearest - (transaction_amount % round_to_nearest);
    IF roundup_amount = round_to_nearest THEN
        roundup_amount := 0;
    END IF;
    
    IF roundup_amount < min_roundup OR roundup_amount > max_roundup THEN
        roundup_amount := 0;
    END IF;
    
    RETURN roundup_amount;
END;
$$ LANGUAGE plpgsql;

-- Function to create round-up queue entry
CREATE OR REPLACE FUNCTION create_roundup_entry()
RETURNS TRIGGER AS $$
DECLARE
    user_settings_rec RECORD;
    roundup_amount DECIMAL;
BEGIN
    -- Only process debit transactions
    IF NEW.direction = 'debit' AND NEW.status = 'completed' THEN
        -- Get user settings
        SELECT * INTO user_settings_rec 
        FROM user_settings 
        WHERE user_id = NEW.user_id;
        
        IF FOUND AND user_settings_rec.auto_invest_enabled THEN
            -- Calculate round-up
            roundup_amount := calculate_roundup(
                NEW.amount,
                user_settings_rec.round_to_nearest,
                user_settings_rec.min_roundup,
                user_settings_rec.max_roundup
            );
            
            -- Create round-up queue entry if amount > 0
            IF roundup_amount > 0 THEN
                INSERT INTO roundup_queue (
                    user_id,
                    transaction_id,
                    roundup_amount
                ) VALUES (
                    NEW.user_id,
                    NEW.id,
                    roundup_amount
                );
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create round-ups
CREATE TRIGGER auto_create_roundup 
    AFTER INSERT OR UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION create_roundup_entry();

-- Function to update piggy ledger balance
CREATE OR REPLACE FUNCTION update_piggy_balance()
RETURNS TRIGGER AS $$
DECLARE
    current_balance DECIMAL;
BEGIN
    -- Calculate new balance
    SELECT COALESCE(SUM(
        CASE 
            WHEN type IN ('roundup_credit', 'manual_topup', 'refund_credit') THEN amount
            ELSE -amount 
        END
    ), 0) INTO current_balance
    FROM piggy_ledger 
    WHERE user_id = NEW.user_id 
    AND timestamp <= NEW.timestamp;
    
    NEW.balance_after := current_balance;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to maintain running balance
CREATE TRIGGER update_piggy_balance_trigger 
    BEFORE INSERT ON piggy_ledger
    FOR EACH ROW EXECUTE FUNCTION update_piggy_balance();

-- Function to log important actions
CREATE OR REPLACE FUNCTION log_audit_action()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (
        user_id,
        action,
        resource_type,
        resource_id,
        old_values,
        new_values
    ) VALUES (
        COALESCE(NEW.user_id, OLD.user_id),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Audit triggers for critical tables
CREATE TRIGGER audit_orders AFTER INSERT OR UPDATE OR DELETE ON orders
    FOR EACH ROW EXECUTE FUNCTION log_audit_action();
CREATE TRIGGER audit_holdings AFTER INSERT OR UPDATE OR DELETE ON holdings
    FOR EACH ROW EXECUTE FUNCTION log_audit_action();
CREATE TRIGGER audit_mandates AFTER INSERT OR UPDATE OR DELETE ON upi_mandates
    FOR EACH ROW EXECUTE FUNCTION log_audit_action();

-- ============================================================================
-- VIEWS FOR DASHBOARD AND REPORTING
-- ============================================================================

-- Enhanced user dashboard view
CREATE VIEW user_dashboard AS
SELECT 
    u.id as user_id,
    u.email,
    u.full_name,
    u.kyc_status,
    u.onboarding_completed,
    
    -- Settings
    us.portfolio_preset,
    us.round_to_nearest,
    us.weekly_target,
    us.auto_invest_enabled,
    
    -- Piggy balance
    COALESCE(
        (SELECT balance_after FROM piggy_ledger 
         WHERE user_id = u.id 
         ORDER BY timestamp DESC LIMIT 1), 0
    ) as piggy_balance,
    
    -- Portfolio value and performance
    COALESCE(
        (SELECT SUM(current_value) FROM holdings WHERE user_id = u.id), 0
    ) as portfolio_value,
    
    COALESCE(
        (SELECT SUM(units * avg_cost) FROM holdings WHERE user_id = u.id), 0
    ) as total_invested,
    
    COALESCE(
        (SELECT SUM(unrealized_pnl) FROM holdings WHERE user_id = u.id), 0
    ) as unrealized_pnl,
    
    -- Weekly stats
    COALESCE(
        (SELECT SUM(roundup_amount) 
         FROM roundup_queue 
         WHERE user_id = u.id 
           AND status = 'processed'
           AND created_at >= date_trunc('week', NOW())), 0
    ) as weekly_roundups,
    
    -- Goal progress
    COALESCE(
        (SELECT COUNT(*) FROM goals WHERE user_id = u.id AND is_active = true), 0
    ) as active_goals,
    
    -- Unread notifications
    COALESCE(
        (SELECT COUNT(*) FROM notifications WHERE user_id = u.id AND read_at IS NULL), 0
    ) as unread_notifications
    
FROM users u
LEFT JOIN user_settings us ON u.id = us.user_id;

-- Grant permissions
GRANT SELECT ON user_dashboard TO authenticated;

-- ============================================================================
-- SAMPLE DATA INSERTS
-- ============================================================================

-- Insert sample ETF data
INSERT INTO prices (symbol, price, change, change_percent) VALUES 
('NIFTYBEES', 285.50, 2.50, 0.88),
('GOLDBEES', 65.25, -0.75, -1.14),
('LIQUIDBEES', 100.05, 0.05, 0.05),
('BANKBEES', 1250.75, 15.25, 1.23),
('ITBEES', 45.80, -0.45, -0.97)
ON CONFLICT DO NOTHING;

-- Function to generate referral code
CREATE OR REPLACE FUNCTION generate_referral_code(user_email TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN UPPER(SUBSTRING(user_email, 1, 3) || SUBSTRING(MD5(user_email || NOW()::TEXT), 1, 5));
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION calculate_roundup(DECIMAL, INTEGER, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_referral_code(TEXT) TO authenticated;

-- ============================================================================
-- SECURITY ENHANCEMENTS
-- ============================================================================

-- Create function to encrypt sensitive data
CREATE OR REPLACE FUNCTION encrypt_sensitive_field(data TEXT, key_id TEXT DEFAULT 'default')
RETURNS TEXT AS $$
BEGIN
    RETURN encode(encrypt(data::bytea, gen_random_bytes(32), 'aes'), 'base64');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to hash PII data
CREATE OR REPLACE FUNCTION hash_pii(data TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN encode(digest(data, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant limited permissions
GRANT EXECUTE ON FUNCTION encrypt_sensitive_field(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION hash_pii(TEXT) TO authenticated;

-- ============================================================================
-- CLEANUP AND MAINTENANCE FUNCTIONS
-- ============================================================================

-- Function to clean old audit logs (keep 1 year)
CREATE OR REPLACE FUNCTION cleanup_audit_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM audit_logs 
    WHERE timestamp < NOW() - INTERVAL '1 year';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean old notifications (keep 3 months)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM notifications 
    WHERE created_at < NOW() - INTERVAL '3 months'
    AND read_at IS NOT NULL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

-- Insert completion log
DO $$ 
BEGIN 
    RAISE NOTICE 'UPI Piggy Complete Database Schema has been successfully created!';
    RAISE NOTICE 'Tables created: %, Views: %, Functions: %, Triggers: %', 
        (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'),
        (SELECT COUNT(*) FROM information_schema.views WHERE table_schema = 'public'),
        (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public'),
        (SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_schema = 'public');
END $$;
