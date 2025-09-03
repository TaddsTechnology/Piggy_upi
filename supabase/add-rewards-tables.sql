-- Add rewards and gamification tables to existing schema

-- Table for user levels and progress
CREATE TABLE IF NOT EXISTS user_levels (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    current_level INTEGER DEFAULT 1,
    level_title TEXT DEFAULT 'Investment Rookie',
    total_invested DECIMAL(12,2) DEFAULT 0,
    months_active INTEGER DEFAULT 0,
    consecutive_weeks INTEGER DEFAULT 0,
    max_weekly_investment DECIMAL(12,2) DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    weekly_sip_amount DECIMAL(12,2) DEFAULT 0,
    last_investment_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Table for user achievements
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    achievement_id TEXT NOT NULL,
    achievement_title TEXT NOT NULL,
    achievement_description TEXT NOT NULL,
    achieved BOOLEAN DEFAULT FALSE,
    achieved_date TIMESTAMP WITH TIME ZONE,
    reward_text TEXT,
    progress DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- Enable RLS
ALTER TABLE user_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own levels" ON user_levels FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own achievements" ON user_achievements FOR ALL USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_user_levels_user_id ON user_levels(user_id);
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achieved ON user_achievements(user_id, achieved);

-- Triggers for updated_at
CREATE TRIGGER update_user_levels_updated_at BEFORE UPDATE ON user_levels 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_achievements_updated_at BEFORE UPDATE ON user_achievements 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate user level based on investment
CREATE OR REPLACE FUNCTION calculate_user_level(total_invested DECIMAL)
RETURNS TABLE(
    level_number INTEGER,
    level_title TEXT,
    next_target DECIMAL,
    progress_percent INTEGER
) AS $$
DECLARE
    current_level INTEGER;
    current_title TEXT;
    next_target DECIMAL;
    progress INTEGER;
BEGIN
    -- Define level thresholds
    IF total_invested < 1000 THEN
        current_level := 1;
        current_title := 'Investment Rookie';
        next_target := 1000;
    ELSIF total_invested < 5000 THEN
        current_level := 2;
        current_title := 'Smart Saver';
        next_target := 5000;
    ELSIF total_invested < 15000 THEN
        current_level := 3;
        current_title := 'Wealth Builder';
        next_target := 15000;
    ELSIF total_invested < 50000 THEN
        current_level := 4;
        current_title := 'Portfolio Pro';
        next_target := 50000;
    ELSIF total_invested < 100000 THEN
        current_level := 5;
        current_title := 'Investment Expert';
        next_target := 100000;
    ELSE
        current_level := 6;
        current_title := 'Wealth Master';
        next_target := 250000;
    END IF;
    
    -- Calculate progress percentage
    IF current_level = 1 THEN
        progress := LEAST(100, ROUND((total_invested / 1000) * 100));
    ELSIF current_level = 2 THEN
        progress := LEAST(100, ROUND(((total_invested - 1000) / 4000) * 100));
    ELSIF current_level = 3 THEN
        progress := LEAST(100, ROUND(((total_invested - 5000) / 10000) * 100));
    ELSIF current_level = 4 THEN
        progress := LEAST(100, ROUND(((total_invested - 15000) / 35000) * 100));
    ELSIF current_level = 5 THEN
        progress := LEAST(100, ROUND(((total_invested - 50000) / 50000) * 100));
    ELSE
        progress := LEAST(100, ROUND(((total_invested - 100000) / 150000) * 100));
    END IF;
    
    level_number := current_level;
    level_title := current_title;
    next_target := next_target;
    progress_percent := progress;
    
    RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Function to update user level automatically
CREATE OR REPLACE FUNCTION update_user_level()
RETURNS TRIGGER AS $$
DECLARE
    user_total_invested DECIMAL;
    level_info RECORD;
    months_count INTEGER;
    consecutive_weeks_count INTEGER;
BEGIN
    -- Calculate total invested from holdings
    SELECT COALESCE(SUM(units * avg_cost), 0) INTO user_total_invested
    FROM holdings 
    WHERE user_id = NEW.user_id;
    
    -- Calculate months active (months with at least one order)
    SELECT COUNT(DISTINCT date_trunc('month', created_at)) INTO months_count
    FROM orders
    WHERE user_id = NEW.user_id AND status = 'filled';
    
    -- Calculate consecutive weeks (simplified - assume weekly SIPs)
    SELECT COUNT(*) INTO consecutive_weeks_count
    FROM orders
    WHERE user_id = NEW.user_id 
    AND status = 'filled'
    AND created_at >= CURRENT_DATE - INTERVAL '12 weeks'
    AND order_type = 'sip';
    
    -- Get level information
    SELECT * INTO level_info FROM calculate_user_level(user_total_invested);
    
    -- Insert or update user level
    INSERT INTO user_levels (
        user_id,
        current_level,
        level_title,
        total_invested,
        months_active,
        consecutive_weeks
    ) VALUES (
        NEW.user_id,
        level_info.level_number,
        level_info.level_title,
        user_total_invested,
        months_count,
        consecutive_weeks_count
    )
    ON CONFLICT (user_id) DO UPDATE SET
        current_level = level_info.level_number,
        level_title = level_info.level_title,
        total_invested = user_total_invested,
        months_active = months_count,
        consecutive_weeks = consecutive_weeks_count,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update user level on new orders/holdings
CREATE TRIGGER update_user_level_on_order 
    AFTER INSERT OR UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_user_level();

CREATE TRIGGER update_user_level_on_holding 
    AFTER INSERT OR UPDATE ON holdings
    FOR EACH ROW EXECUTE FUNCTION update_user_level();

-- Function to initialize achievements for a user
CREATE OR REPLACE FUNCTION initialize_user_achievements(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_achievements (user_id, achievement_id, achievement_title, achievement_description, reward_text)
    VALUES 
        (p_user_id, 'first_sip', 'First Step', 'Complete your first automatic investment', '🎉 Welcome bonus!'),
        (p_user_id, 'consistent_month', 'Consistency Champion', 'Invest for 4 consecutive weeks', '⭐ Consistency badge'),
        (p_user_id, 'ten_k_milestone', 'Ten Thousand Club', 'Reach ₹10,000 in investments', '💎 Diamond investor status'),
        (p_user_id, 'year_long', 'Annual Investor', 'Invest consistently for 12 months', '🏆 Annual achievement trophy')
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Function to update achievement progress
CREATE OR REPLACE FUNCTION update_user_achievements()
RETURNS TRIGGER AS $$
DECLARE
    user_total_invested DECIMAL;
    months_active INTEGER;
    consecutive_weeks INTEGER;
BEGIN
    -- Get current user stats
    SELECT total_invested, months_active, consecutive_weeks 
    INTO user_total_invested, months_active, consecutive_weeks
    FROM user_levels
    WHERE user_id = NEW.user_id;
    
    -- Update First Step achievement
    UPDATE user_achievements 
    SET achieved = TRUE, achieved_date = CASE WHEN NOT achieved THEN NOW() ELSE achieved_date END
    WHERE user_id = NEW.user_id AND achievement_id = 'first_sip' AND user_total_invested > 0;
    
    -- Update Consistency Champion achievement
    UPDATE user_achievements 
    SET achieved = TRUE, achieved_date = CASE WHEN NOT achieved THEN NOW() ELSE achieved_date END
    WHERE user_id = NEW.user_id AND achievement_id = 'consistent_month' AND consecutive_weeks >= 4;
    
    -- Update Ten Thousand Club achievement
    UPDATE user_achievements 
    SET achieved = TRUE, achieved_date = CASE WHEN NOT achieved THEN NOW() ELSE achieved_date END
    WHERE user_id = NEW.user_id AND achievement_id = 'ten_k_milestone' AND user_total_invested >= 10000;
    
    -- Update Annual Investor achievement
    UPDATE user_achievements 
    SET achieved = TRUE, achieved_date = CASE WHEN NOT achieved THEN NOW() ELSE achieved_date END
    WHERE user_id = NEW.user_id AND achievement_id = 'year_long' AND months_active >= 12;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update achievements when user level changes
CREATE TRIGGER update_achievements_on_level_change
    AFTER INSERT OR UPDATE ON user_levels
    FOR EACH ROW EXECUTE FUNCTION update_user_achievements();

-- Enhanced user dashboard view to include gamification data
DROP VIEW IF EXISTS user_dashboard CASCADE;
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
    ) as unread_notifications,
    
    -- Gamification data
    ul.current_level,
    ul.level_title,
    ul.months_active,
    ul.consecutive_weeks,
    ul.current_streak,
    ul.longest_streak,
    ul.weekly_sip_amount,
    
    -- Achievement count
    COALESCE(
        (SELECT COUNT(*) FROM user_achievements WHERE user_id = u.id AND achieved = true), 0
    ) as achievements_unlocked,
    
    COALESCE(
        (SELECT COUNT(*) FROM user_achievements WHERE user_id = u.id), 0
    ) as total_achievements
    
FROM users u
LEFT JOIN user_settings us ON u.id = us.user_id
LEFT JOIN user_levels ul ON u.id = ul.user_id;

-- Grant permissions
GRANT SELECT ON user_dashboard TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_user_level(DECIMAL) TO authenticated;
GRANT EXECUTE ON FUNCTION initialize_user_achievements(UUID) TO authenticated;
