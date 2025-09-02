-- ============================================================================
-- PIGGY UPI DATABASE - VERIFICATION AND INCREMENTAL UPDATES
-- ============================================================================
-- Use this script to check existing tables and add missing ones safely

-- ============================================================================
-- STEP 1: VERIFY EXISTING TABLES
-- ============================================================================

-- Check what tables already exist
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Check existing columns in users table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'users'
ORDER BY ordinal_position;

-- ============================================================================
-- STEP 2: ADD MISSING COLUMNS TO EXISTING TABLES (SAFE)
-- ============================================================================

-- Add missing columns to users table if they don't exist
DO $$ 
BEGIN
    -- Check and add date_of_birth
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'date_of_birth'
    ) THEN
        ALTER TABLE users ADD COLUMN date_of_birth DATE;
        RAISE NOTICE 'Added date_of_birth column to users table';
    END IF;

    -- Check and add pan_number
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'pan_number'
    ) THEN
        ALTER TABLE users ADD COLUMN pan_number TEXT;
        RAISE NOTICE 'Added pan_number column to users table';
    END IF;

    -- Check and add aadhaar_hash
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'aadhaar_hash'
    ) THEN
        ALTER TABLE users ADD COLUMN aadhaar_hash TEXT;
        RAISE NOTICE 'Added aadhaar_hash column to users table';
    END IF;

    -- Check and add onboarding_completed
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'onboarding_completed'
    ) THEN
        ALTER TABLE users ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added onboarding_completed column to users table';
    END IF;

    -- Check and add is_active
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
        RAISE NOTICE 'Added is_active column to users table';
    END IF;

    -- Check and add last_login_at
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'last_login_at'
    ) THEN
        ALTER TABLE users ADD COLUMN last_login_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added last_login_at column to users table';
    END IF;
END $$;

-- ============================================================================
-- STEP 3: CREATE MISSING TABLES (SAFE)
-- ============================================================================

-- Create goals table if it doesn't exist
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

-- Create notifications table if it doesn't exist
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

-- Create upi_mandates table if it doesn't exist
CREATE TABLE IF NOT EXISTS upi_mandates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
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

-- Create bank_accounts table if it doesn't exist
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, account_number)
);

-- ============================================================================
-- STEP 4: ENABLE ROW LEVEL SECURITY ON NEW TABLES
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE upi_mandates ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for new tables
DO $$
BEGIN
    -- Goals policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'goals' AND policyname = 'Users can manage own goals'
    ) THEN
        CREATE POLICY "Users can manage own goals" ON goals 
            FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- Notifications policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'notifications' AND policyname = 'Users can manage own notifications'
    ) THEN
        CREATE POLICY "Users can manage own notifications" ON notifications 
            FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- UPI mandates policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'upi_mandates' AND policyname = 'Users can manage own mandates'
    ) THEN
        CREATE POLICY "Users can manage own mandates" ON upi_mandates 
            FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- Bank accounts policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'bank_accounts' AND policyname = 'Users can manage own bank accounts'
    ) THEN
        CREATE POLICY "Users can manage own bank accounts" ON bank_accounts 
            FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- ============================================================================
-- STEP 5: CREATE MISSING INDEXES
-- ============================================================================

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_active ON goals(is_active, target_date);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, read_at) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_upi_mandates_user_id ON upi_mandates(user_id);
CREATE INDEX IF NOT EXISTS idx_upi_mandates_status ON upi_mandates(status);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_user_id ON bank_accounts(user_id);

-- ============================================================================
-- STEP 6: CREATE UTILITY FUNCTIONS IF THEY DON'T EXIST
-- ============================================================================

-- Create calculate_roundup function if it doesn't exist
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

-- Create or update the dashboard view
DROP VIEW IF EXISTS user_dashboard;
CREATE VIEW user_dashboard AS
SELECT 
    u.id as user_id,
    u.email,
    u.full_name,
    u.kyc_status,
    COALESCE(u.onboarding_completed, FALSE) as onboarding_completed,
    
    -- Settings
    COALESCE(us.portfolio_preset, 'balanced') as portfolio_preset,
    COALESCE(us.round_to_nearest, 10) as round_to_nearest,
    COALESCE(us.weekly_target, 200) as weekly_target,
    COALESCE(us.auto_invest_enabled, TRUE) as auto_invest_enabled,
    
    -- Piggy balance
    COALESCE(
        (SELECT SUM(CASE WHEN type IN ('roundup_credit', 'manual_topup') THEN amount ELSE -amount END)
         FROM piggy_ledger WHERE user_id = u.id), 0
    ) as piggy_balance,
    
    -- Portfolio value
    COALESCE(
        (SELECT SUM(current_value) FROM holdings WHERE user_id = u.id), 0
    ) as portfolio_value,
    
    -- Total invested
    COALESCE(
        (SELECT SUM(units * avg_cost) FROM holdings WHERE user_id = u.id), 0
    ) as total_invested,
    
    -- Unrealized PnL
    COALESCE(
        (SELECT SUM((current_price - avg_cost) * units) FROM holdings WHERE user_id = u.id), 0
    ) as unrealized_pnl,
    
    -- Weekly roundups
    COALESCE(
        (SELECT SUM(amount) 
         FROM piggy_ledger 
         WHERE user_id = u.id 
           AND type = 'roundup_credit' 
           AND timestamp >= date_trunc('week', NOW())), 0
    ) as weekly_roundups,
    
    -- Active goals
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
GRANT EXECUTE ON FUNCTION calculate_roundup(DECIMAL, INTEGER, INTEGER, INTEGER) TO authenticated;

-- ============================================================================
-- STEP 7: INSERT SAMPLE DATA IF NOT EXISTS
-- ============================================================================

-- Insert ETF prices if they don't exist
INSERT INTO prices (symbol, price, change, change_percent) VALUES 
('NIFTYBEES', 285.50, 2.50, 0.88),
('GOLDBEES', 65.25, -0.75, -1.14),
('LIQUIDBEES', 100.05, 0.05, 0.05),
('BANKBEES', 1250.75, 15.25, 1.23),
('ITBEES', 45.80, -0.45, -0.97)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- COMPLETION REPORT
-- ============================================================================

DO $$ 
BEGIN 
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'DATABASE VERIFICATION AND UPDATE COMPLETED';
    RAISE NOTICE '============================================================================';
    
    RAISE NOTICE 'Total tables in database: %', 
        (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE');
    
    RAISE NOTICE 'Total views in database: %', 
        (SELECT COUNT(*) FROM information_schema.views WHERE table_schema = 'public');
    
    RAISE NOTICE 'Total functions in database: %', 
        (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public' AND routine_type = 'FUNCTION');

    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Your database is now ready for the Piggy UPI app!';
    RAISE NOTICE 'You can now use the TypeScript functions and React hooks provided.';
    RAISE NOTICE '============================================================================';
END $$;
