-- UPI Piggy Database Schema for Supabase
-- Run this in your Supabase SQL Editor to set up the database

-- Create users table (extends auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    kyc_status TEXT DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_settings table
CREATE TABLE public.user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    round_to_nearest INTEGER DEFAULT 10,
    min_roundup DECIMAL DEFAULT 1,
    max_roundup DECIMAL DEFAULT 50,
    portfolio_preset TEXT DEFAULT 'balanced' CHECK (portfolio_preset IN ('safe', 'balanced', 'growth')),
    auto_invest_enabled BOOLEAN DEFAULT true,
    weekly_target DECIMAL DEFAULT 200,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create transactions table
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    amount DECIMAL NOT NULL,
    direction TEXT NOT NULL CHECK (direction IN ('debit', 'credit')),
    merchant TEXT,
    category TEXT,
    upi_ref TEXT,
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create piggy_ledger table (for tracking round-ups and investments)
CREATE TABLE public.piggy_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    amount DECIMAL NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('roundup_credit', 'manual_topup', 'investment_debit')),
    reference TEXT,
    transaction_id UUID REFERENCES public.transactions(id),
    order_id UUID,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create orders table
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    side TEXT NOT NULL CHECK (side IN ('buy', 'sell')),
    symbol TEXT NOT NULL,
    quantity DECIMAL NOT NULL,
    amount DECIMAL NOT NULL,
    price DECIMAL NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'filled', 'failed', 'cancelled')),
    broker_order_id TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create holdings table
CREATE TABLE public.holdings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    units DECIMAL NOT NULL,
    avg_cost DECIMAL NOT NULL,
    current_price DECIMAL NOT NULL,
    current_value DECIMAL NOT NULL,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, symbol)
);

-- Create prices table (for current market prices)
CREATE TABLE public.prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol TEXT NOT NULL,
    price DECIMAL NOT NULL,
    change DECIMAL DEFAULT 0,
    change_percent DECIMAL DEFAULT 0,
    volume BIGINT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_timestamp ON public.transactions(timestamp DESC);
CREATE INDEX idx_piggy_ledger_user_id ON public.piggy_ledger(user_id);
CREATE INDEX idx_piggy_ledger_timestamp ON public.piggy_ledger(timestamp DESC);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_holdings_user_id ON public.holdings(user_id);
CREATE INDEX idx_prices_symbol ON public.prices(symbol);
CREATE INDEX idx_prices_created_at ON public.prices(created_at);

-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.piggy_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prices ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own data
CREATE POLICY "Users can view own data" ON public.users
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can view own settings" ON public.user_settings
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own piggy ledger" ON public.piggy_ledger
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own orders" ON public.orders
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own holdings" ON public.holdings
    FOR ALL USING (auth.uid() = user_id);

-- Prices are public (everyone can read, but only system can write)
CREATE POLICY "Anyone can view prices" ON public.prices
    FOR SELECT USING (true);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_holdings_updated_at BEFORE UPDATE ON public.holdings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample ETF prices
INSERT INTO public.prices (symbol, price, change, change_percent) VALUES
('NIFTYBEES', 285.50, 2.15, 0.76),
('GOLDBEES', 65.25, -1.25, -1.88),
('LIQUIDBEES', 100.05, 0.02, 0.02);

-- Create a function to get user dashboard summary (optional)
CREATE OR REPLACE FUNCTION get_user_dashboard(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'piggy_balance', COALESCE(SUM(CASE WHEN type IN ('roundup_credit', 'manual_topup') THEN amount ELSE -amount END), 0),
        'total_invested', COALESCE((SELECT SUM(current_value) FROM public.holdings WHERE user_id = user_uuid), 0),
        'total_transactions', COALESCE((SELECT COUNT(*) FROM public.transactions WHERE user_id = user_uuid), 0)
    ) INTO result
    FROM public.piggy_ledger 
    WHERE user_id = user_uuid;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the dashboard function
GRANT EXECUTE ON FUNCTION get_user_dashboard(UUID) TO authenticated;
