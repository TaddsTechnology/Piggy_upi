-- UPI Piggy Database Migration - Add Missing Tables
-- Run this to add missing tables to your existing database

-- Enable extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- ADD MISSING COLUMNS TO EXISTING TABLES
-- ============================================================================

-- Enhance existing users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS pan_number TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS aadhaar_hash TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS risk_profile TEXT CHECK (risk_profile IN ('conservative', 'moderate', 'aggressive')) DEFAULT 'moderate';
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;

-- Update KYC status to include more states
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_kyc_status_check;
ALTER TABLE users ADD CONSTRAINT users_kyc_status_check 
    CHECK (kyc_status IN ('pending', 'in_progress', 'verified', 'rejected'));

-- Enhance existing transactions table
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS sms_event_id UUID;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS bank_ref TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS balance_after DECIMAL(12,2);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS sms_raw_text TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS parsed_data JSONB;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(3,2);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS manual_verification BOOLEAN DEFAULT FALSE;

-- Enhance existing orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS fees DECIMAL(12,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax DECIMAL(12,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS settlement_date DATE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_type TEXT CHECK (order_type IN ('roundup', 'manual', 'sip', 'goal')) DEFAULT 'roundup';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS goal_id UUID;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS filled_at TIMESTAMP WITH TIME ZONE;

-- Update orders status to include more states
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
    CHECK (status IN ('pending', 'filled', 'partially_filled', 'failed', 'cancelled'));

-- Enhance existing holdings table
ALTER TABLE holdings DROP COLUMN IF EXISTS current_value CASCADE;
ALTER TABLE holdings DROP COLUMN IF EXISTS unrealized_pnl CASCADE;
ALTER TABLE holdings ADD COLUMN current_value DECIMAL(12,2) GENERATED ALWAYS AS (units * current_price) STORED;
ALTER TABLE holdings ADD COLUMN unrealized_pnl DECIMAL(12,2) GENERATED ALWAYS AS ((current_price - avg_cost) * units) STORED;

-- Enhance existing piggy_ledger table
ALTER TABLE piggy_ledger ADD COLUMN IF NOT EXISTS goal_id UUID;
ALTER TABLE piggy_ledger ADD COLUMN IF NOT EXISTS balance_after DECIMAL(12,2);

-- Update piggy_ledger type to include more types
ALTER TABLE piggy_ledger DROP CONSTRAINT IF EXISTS piggy_ledger_type_check;
ALTER TABLE piggy_ledger ADD CONSTRAINT piggy_ledger_type_check 
    CHECK (type IN ('roundup_credit', 'manual_topup', 'investment_debit', 'refund_credit', 'fee_debit'));

-- Enhance existing user_settings table
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS mandate_id UUID;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS primary_bank_account_id UUID;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS sweep_day TEXT CHECK (sweep_day IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')) DEFAULT 'sunday';
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"push": true, "email": true, "sms": false, "investment_updates": true, "roundup_summary": true}';

-- ============================================================================
-- CREATE MISSING TABLES
-- ============================================================================

-- 1. KYC Documents table
CREATE TABLE IF NOT EXISTS kyc_documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    document_type TEXT CHECK (document_type IN ('pan', 'aadhaar', 'bank_statement', 'selfie')) NOT NULL,
    document_url TEXT,
    document_number TEXT,
    verification_status TEXT CHECK (verification_status IN ('pending', 'verified', 'rejected')) DEFAULT 'pending',
    rejection_reason TEXT,
    verified_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Bank Accounts table
CREATE TABLE IF NOT EXISTS bank_accounts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    account_number TEXT NOT NULL,
    ifsc_code TEXT NOT NULL,
    bank_name TEXT NOT NULL,
    account_holder_name TEXT NOT NULL,
    account_type TEXT CHECK (account_type IN ('savings', 'current')) DEFAULT 'savings',
    is_primary BOOLEAN DEFAULT FALSE,
    verification_status TEXT CHECK (verification_status IN ('pending', 'verified', 'failed')) DEFAULT 'pending',
    penny_drop_status TEXT CHECK (penny_drop_status IN ('pending', 'success', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, account_number)
);

-- 3. UPI Mandates table
CREATE TABLE IF NOT EXISTS upi_mandates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    bank_account_id UUID REFERENCES bank_accounts(id) ON DELETE SET NULL,
    mandate_id TEXT UNIQUE NOT NULL,
    upi_id TEXT NOT NULL,
    max_amount DECIMAL(12,2) DEFAULT 1000.00,
    frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'monthly', 'as_required')) DEFAULT 'as_required',
    status TEXT CHECK (status IN ('pending', 'active', 'paused', 'cancelled', 'expired')) DEFAULT 'pending',
    gateway_response JSONB,
    start_date DATE,
    end_date DATE,
    last_debit_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. SMS Events table
CREATE TABLE IF NOT EXISTS sms_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    sender_id TEXT NOT NULL,
    raw_message TEXT NOT NULL,
    received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed BOOLEAN DEFAULT FALSE,
    parsing_confidence DECIMAL(3,2),
    parsed_data JSONB,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Roundup Queue table
CREATE TABLE IF NOT EXISTS roundup_queue (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE NOT NULL,
    roundup_amount DECIMAL(12,2) NOT NULL,
    status TEXT CHECK (status IN ('pending', 'processed', 'failed', 'cancelled')) DEFAULT 'pending',
    processed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(transaction_id)
);

-- 6. Goals table
CREATE TABLE IF NOT EXISTS goals (
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

-- 7. Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT CHECK (type IN ('info', 'success', 'warning', 'error', 'achievement', 'investment', 'roundup', 'goal')) NOT NULL,
    category TEXT CHECK (category IN ('system', 'investment', 'roundup', 'goal', 'achievement', 'security')) NOT NULL,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    data JSONB,
    read_at TIMESTAMP WITH TIME ZONE,
    action_url TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Referrals table
CREATE TABLE IF NOT EXISTS referrals (
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

-- 9. Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    device_id TEXT NOT NULL,
    device_name TEXT,
    device_type TEXT CHECK (device_type IN ('mobile', 'desktop', 'tablet')) DEFAULT 'mobile',
    ip_address INET,
    user_agent TEXT,
    location_data JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, device_id)
);

-- 10. Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    risk_score INTEGER,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ADD FOREIGN KEY CONSTRAINTS
-- ============================================================================

-- Add foreign key for SMS events in transactions
DO $$ BEGIN
    ALTER TABLE transactions ADD CONSTRAINT fk_transactions_sms_event 
        FOREIGN KEY (sms_event_id) REFERENCES sms_events(id) ON DELETE SET NULL;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Add foreign key for goals in orders and piggy_ledger
DO $$ BEGIN
    ALTER TABLE orders ADD CONSTRAINT fk_orders_goal 
        FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE SET NULL;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE piggy_ledger ADD CONSTRAINT fk_piggy_ledger_goal 
        FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE SET NULL;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Add foreign key for mandates and bank accounts in user_settings
DO $$ BEGIN
    ALTER TABLE user_settings ADD CONSTRAINT fk_user_settings_mandate 
        FOREIGN KEY (mandate_id) REFERENCES upi_mandates(id) ON DELETE SET NULL;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE user_settings ADD CONSTRAINT fk_user_settings_bank_account 
        FOREIGN KEY (primary_bank_account_id) REFERENCES bank_accounts(id) ON DELETE SET NULL;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- CREATE MISSING INDEXES
-- ============================================================================

-- User and auth related
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_kyc_status ON users(kyc_status);

-- KYC and verification
CREATE INDEX IF NOT EXISTS idx_kyc_documents_user_id ON kyc_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_status ON kyc_documents(verification_status);

-- Banking and mandates
CREATE INDEX IF NOT EXISTS idx_bank_accounts_user_id ON bank_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_upi_mandates_user_id ON upi_mandates(user_id);
CREATE INDEX IF NOT EXISTS idx_upi_mandates_status ON upi_mandates(status);

-- SMS and transactions
CREATE INDEX IF NOT EXISTS idx_sms_events_user_id ON sms_events(user_id);
CREATE INDEX IF NOT EXISTS idx_sms_events_processed ON sms_events(processed, received_at);
CREATE INDEX IF NOT EXISTS idx_transactions_sms_event_id ON transactions(sms_event_id);
CREATE INDEX IF NOT EXISTS idx_roundup_queue_user_id ON roundup_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_roundup_queue_status ON roundup_queue(status, created_at);

-- Goals and notifications
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_active ON goals(is_active, target_date);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, read_at) WHERE read_at IS NULL;

-- Security and audit
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON sessions(is_active, last_activity_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY ON NEW TABLES
-- ============================================================================

ALTER TABLE kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE upi_mandates ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE roundup_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CREATE RLS POLICIES FOR NEW TABLES
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can manage own KYC" ON kyc_documents;
DROP POLICY IF EXISTS "Users can manage own bank accounts" ON bank_accounts;
DROP POLICY IF EXISTS "Users can manage own mandates" ON upi_mandates;
DROP POLICY IF EXISTS "Users can view own SMS events" ON sms_events;
DROP POLICY IF EXISTS "Users can view own roundup queue" ON roundup_queue;
DROP POLICY IF EXISTS "Users can manage own goals" ON goals;
DROP POLICY IF EXISTS "Users can manage own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can view own referrals" ON referrals;
DROP POLICY IF EXISTS "Users can view own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can view own audit logs" ON audit_logs;

-- Create new policies
CREATE POLICY "Users can manage own KYC" ON kyc_documents FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own bank accounts" ON bank_accounts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own mandates" ON upi_mandates FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own SMS events" ON sms_events FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own roundup queue" ON roundup_queue FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own goals" ON goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own referrals" ON referrals FOR ALL USING (auth.uid() = referrer_user_id OR auth.uid() = referee_user_id);
CREATE POLICY "Users can view own sessions" ON sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own audit logs" ON audit_logs FOR SELECT USING (auth.uid() = user_id);

-- ============================================================================
-- CREATE/UPDATE FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update timestamps (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for new tables
DROP TRIGGER IF EXISTS update_kyc_documents_updated_at ON kyc_documents;
CREATE TRIGGER update_kyc_documents_updated_at BEFORE UPDATE ON kyc_documents 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bank_accounts_updated_at ON bank_accounts;
CREATE TRIGGER update_bank_accounts_updated_at BEFORE UPDATE ON bank_accounts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_upi_mandates_updated_at ON upi_mandates;
CREATE TRIGGER update_upi_mandates_updated_at BEFORE UPDATE ON upi_mandates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_goals_updated_at ON goals;
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_referrals_updated_at ON referrals;
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
                ) ON CONFLICT (transaction_id) DO NOTHING;
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for auto round-up creation
DROP TRIGGER IF EXISTS auto_create_roundup ON transactions;
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

-- Add trigger for piggy balance update
DROP TRIGGER IF EXISTS update_piggy_balance_trigger ON piggy_ledger;
CREATE TRIGGER update_piggy_balance_trigger 
    BEFORE INSERT ON piggy_ledger
    FOR EACH ROW EXECUTE FUNCTION update_piggy_balance();

-- ============================================================================
-- CREATE ENHANCED DASHBOARD VIEW
-- ============================================================================

-- Drop and recreate enhanced dashboard view
DROP VIEW IF EXISTS user_dashboard;
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
-- UTILITY FUNCTIONS
-- ============================================================================

-- Function to generate referral code
CREATE OR REPLACE FUNCTION generate_referral_code(user_email TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN UPPER(SUBSTRING(user_email, 1, 3) || SUBSTRING(MD5(user_email || NOW()::TEXT), 1, 5));
END;
$$ LANGUAGE plpgsql;

-- Function to encrypt sensitive data
CREATE OR REPLACE FUNCTION encrypt_sensitive_field(data TEXT, key_id TEXT DEFAULT 'default')
RETURNS TEXT AS $$
BEGIN
    RETURN encode(encrypt(data::bytea, gen_random_bytes(32), 'aes'), 'base64');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to hash PII data
CREATE OR REPLACE FUNCTION hash_pii(data TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN encode(digest(data, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION calculate_roundup(DECIMAL, INTEGER, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_referral_code(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION encrypt_sensitive_field(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION hash_pii(TEXT) TO authenticated;

-- ============================================================================
-- SAMPLE DATA
-- ============================================================================

-- Insert additional ETF data
INSERT INTO prices (symbol, price, change, change_percent) VALUES 
('BANKBEES', 1250.75, 15.25, 1.23),
('ITBEES', 45.80, -0.45, -0.97),
('JUNIORBEES', 725.50, 8.75, 1.22)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$ 
BEGIN 
    RAISE NOTICE 'UPI Piggy Database Migration Completed Successfully!';
    RAISE NOTICE 'Added missing tables and enhanced existing ones.';
    RAISE NOTICE 'Total tables: %', 
        (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public');
END $$;
