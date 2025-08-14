-- UPI Piggy Database Schema for Supabase
-- Run this in your Supabase SQL editor after creating your project

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- 1. Users table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    kyc_status TEXT CHECK (kyc_status IN ('pending', 'verified', 'rejected')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. User Settings table
CREATE TABLE user_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    round_to_nearest INTEGER DEFAULT 10 CHECK (round_to_nearest IN (10, 20, 50, 100)),
    min_roundup INTEGER DEFAULT 1,
    max_roundup INTEGER DEFAULT 50,
    portfolio_preset TEXT CHECK (portfolio_preset IN ('safe', 'balanced', 'growth')) DEFAULT 'balanced',
    auto_invest_enabled BOOLEAN DEFAULT TRUE,
    weekly_target INTEGER DEFAULT 200,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 3. Transactions table (UPI transactions from webhook)
CREATE TABLE transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    direction TEXT CHECK (direction IN ('debit', 'credit')) NOT NULL,
    merchant TEXT,
    category TEXT,
    upi_ref TEXT UNIQUE,
    status TEXT CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Piggy Ledger table (round-ups and investments)
CREATE TABLE piggy_ledger (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    type TEXT CHECK (type IN ('roundup_credit', 'manual_topup', 'investment_debit')) NOT NULL,
    reference TEXT, -- General reference field
    transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    order_id UUID, -- Will reference orders table
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Orders table (investment orders)
CREATE TABLE orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    side TEXT CHECK (side IN ('buy', 'sell')) NOT NULL,
    symbol TEXT NOT NULL, -- NIFTYBEES, GOLDBEES, etc.
    quantity DECIMAL(12,6) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    status TEXT CHECK (status IN ('pending', 'filled', 'failed', 'cancelled')) DEFAULT 'pending',
    broker_order_id TEXT, -- External broker order ID
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Holdings table (user portfolio)
CREATE TABLE holdings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    symbol TEXT NOT NULL,
    units DECIMAL(12,6) NOT NULL DEFAULT 0,
    avg_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
    current_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    current_value DECIMAL(12,2) GENERATED ALWAYS AS (units * current_price) STORED,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, symbol)
);

-- 7. Prices table (ETF/Stock prices - updated via cron)
CREATE TABLE prices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    symbol TEXT NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    change DECIMAL(12,2) DEFAULT 0,
    change_percent DECIMAL(5,2) DEFAULT 0,
    volume INTEGER,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(symbol, DATE(timestamp)) -- One price per symbol per day
);

-- Add foreign key reference for orders in piggy_ledger
ALTER TABLE piggy_ledger ADD CONSTRAINT fk_piggy_ledger_order 
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_timestamp ON transactions(timestamp);
CREATE INDEX idx_piggy_ledger_user_id ON piggy_ledger(user_id);
CREATE INDEX idx_piggy_ledger_type ON piggy_ledger(type);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_holdings_user_id ON holdings(user_id);
CREATE INDEX idx_prices_symbol ON prices(symbol);
CREATE INDEX idx_prices_timestamp ON prices(timestamp);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE piggy_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE prices ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can only see their own data
CREATE POLICY "Users can view own profile" ON users FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own settings" ON user_settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own transactions" ON transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own ledger" ON piggy_ledger FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own orders" ON orders FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own holdings" ON holdings FOR ALL USING (auth.uid() = user_id);

-- Prices are public (read-only)
CREATE POLICY "Anyone can view prices" ON prices FOR SELECT USING (true);

-- Functions and Triggers for automated tasks

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

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_holdings_updated_at BEFORE UPDATE ON holdings 
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

-- Function to auto-create round-up entries
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
        
        IF FOUND THEN
            -- Calculate round-up
            roundup_amount := calculate_roundup(
                NEW.amount,
                user_settings_rec.round_to_nearest,
                user_settings_rec.min_roundup,
                user_settings_rec.max_roundup
            );
            
            -- Create round-up entry if amount > 0
            IF roundup_amount > 0 THEN
                INSERT INTO piggy_ledger (
                    user_id,
                    amount,
                    type,
                    reference,
                    transaction_id
                ) VALUES (
                    NEW.user_id,
                    roundup_amount,
                    'roundup_credit',
                    'Auto round-up for ' || COALESCE(NEW.merchant, 'transaction'),
                    NEW.id
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

-- View for user dashboard summary
CREATE VIEW user_dashboard AS
SELECT 
    u.id as user_id,
    u.email,
    u.full_name,
    
    -- Settings
    us.portfolio_preset,
    us.round_to_nearest,
    us.weekly_target,
    us.auto_invest_enabled,
    
    -- Piggy balance (credits minus debits)
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
    
    -- This week's round-ups
    COALESCE(
        (SELECT SUM(amount) 
         FROM piggy_ledger 
         WHERE user_id = u.id 
           AND type = 'roundup_credit' 
           AND timestamp >= date_trunc('week', NOW())), 0
    ) as weekly_roundups
    
FROM users u
LEFT JOIN user_settings us ON u.id = us.user_id;

-- Grant permissions
GRANT SELECT ON user_dashboard TO authenticated;

-- Insert initial ETF price data
INSERT INTO prices (symbol, price, change, change_percent) VALUES 
('NIFTYBEES', 285.50, 2.50, 0.88),
('GOLDBEES', 65.25, -0.75, -1.14),
('LIQUIDBEES', 100.05, 0.05, 0.05)
ON CONFLICT (symbol, DATE(timestamp)) DO NOTHING;
