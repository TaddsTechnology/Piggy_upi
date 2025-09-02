-- ============================================================================
-- PIGGY UPI APP - ESSENTIAL SQL QUERIES
-- ============================================================================
-- Use these queries in your React app via Supabase client or backend services

-- ============================================================================
-- USER MANAGEMENT QUERIES
-- ============================================================================

-- 1. Create new user after Supabase auth signup
INSERT INTO users (id, email, full_name, phone) 
VALUES ($1, $2, $3, $4)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  updated_at = NOW();

-- 2. Get user profile with settings
SELECT 
  u.*,
  us.round_to_nearest,
  us.min_roundup,
  us.max_roundup,
  us.portfolio_preset,
  us.auto_invest_enabled,
  us.weekly_target
FROM users u
LEFT JOIN user_settings us ON u.id = us.user_id
WHERE u.id = $1;

-- 3. Create default user settings
INSERT INTO user_settings (user_id, round_to_nearest, min_roundup, max_roundup, portfolio_preset, auto_invest_enabled, weekly_target)
VALUES ($1, 10, 1, 50, 'balanced', true, 200)
ON CONFLICT (user_id) DO NOTHING;

-- 4. Update user settings
UPDATE user_settings 
SET 
  round_to_nearest = $2,
  min_roundup = $3,
  max_roundup = $4,
  portfolio_preset = $5,
  auto_invest_enabled = $6,
  weekly_target = $7,
  updated_at = NOW()
WHERE user_id = $1;

-- ============================================================================
-- TRANSACTION QUERIES
-- ============================================================================

-- 5. Insert new transaction (from UPI webhook or SMS parsing)
INSERT INTO transactions (user_id, amount, direction, merchant, category, upi_ref, status, timestamp)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING id, amount, direction, merchant, timestamp;

-- 6. Get user transactions (paginated)
SELECT 
  id,
  amount,
  direction,
  merchant,
  category,
  upi_ref,
  status,
  timestamp
FROM transactions 
WHERE user_id = $1 
ORDER BY timestamp DESC 
LIMIT $2 OFFSET $3;

-- 7. Get transactions for a specific period
SELECT * FROM transactions 
WHERE user_id = $1 
  AND timestamp >= $2 
  AND timestamp <= $3 
ORDER BY timestamp DESC;

-- ============================================================================
-- ROUNDUP & PIGGY LEDGER QUERIES
-- ============================================================================

-- 8. Get user's current piggy balance
SELECT COALESCE(
  (SELECT balance_after FROM piggy_ledger 
   WHERE user_id = $1 
   ORDER BY timestamp DESC LIMIT 1), 
  0
) as current_balance;

-- 9. Add roundup to piggy ledger (triggered by transaction)
INSERT INTO piggy_ledger (user_id, amount, type, reference, transaction_id, timestamp)
VALUES ($1, $2, 'roundup_credit', $3, $4, NOW())
RETURNING id, amount, balance_after;

-- 10. Get piggy ledger history
SELECT 
  id,
  amount,
  type,
  reference,
  transaction_id,
  balance_after,
  timestamp
FROM piggy_ledger 
WHERE user_id = $1 
ORDER BY timestamp DESC 
LIMIT $2 OFFSET $3;

-- 11. Get weekly roundup summary
SELECT 
  COUNT(*) as roundup_count,
  SUM(amount) as total_roundup
FROM piggy_ledger 
WHERE user_id = $1 
  AND type = 'roundup_credit'
  AND timestamp >= date_trunc('week', NOW());

-- ============================================================================
-- INVESTMENT & PORTFOLIO QUERIES
-- ============================================================================

-- 12. Create investment order
INSERT INTO orders (user_id, side, symbol, quantity, amount, price, status, order_type, timestamp)
VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7, NOW())
RETURNING id, symbol, quantity, amount;

-- 13. Update order status (when filled)
UPDATE orders 
SET 
  status = $2,
  filled_at = NOW(),
  updated_at = NOW()
WHERE id = $1 AND user_id = $3
RETURNING id, status, filled_at;

-- 14. Get user's current holdings
SELECT 
  id,
  symbol,
  units,
  avg_cost,
  current_price,
  current_value,
  unrealized_pnl,
  last_updated
FROM holdings 
WHERE user_id = $1 
ORDER BY current_value DESC;

-- 15. Update or insert holding (after order execution)
INSERT INTO holdings (user_id, symbol, units, avg_cost, current_price, last_updated)
VALUES ($1, $2, $3, $4, $5, NOW())
ON CONFLICT (user_id, symbol) 
DO UPDATE SET
  units = holdings.units + EXCLUDED.units,
  avg_cost = (holdings.avg_cost * holdings.units + EXCLUDED.avg_cost * EXCLUDED.units) / (holdings.units + EXCLUDED.units),
  current_price = EXCLUDED.current_price,
  last_updated = NOW(),
  updated_at = NOW();

-- 16. Get portfolio performance summary
SELECT 
  SUM(current_value) as total_value,
  SUM(units * avg_cost) as total_invested,
  SUM(unrealized_pnl) as total_pnl,
  CASE 
    WHEN SUM(units * avg_cost) > 0 
    THEN (SUM(unrealized_pnl) / SUM(units * avg_cost)) * 100 
    ELSE 0 
  END as pnl_percentage
FROM holdings 
WHERE user_id = $1;

-- ============================================================================
-- MARKET DATA QUERIES
-- ============================================================================

-- 17. Get current prices for symbols
SELECT symbol, price, change, change_percent, timestamp
FROM prices 
WHERE symbol = ANY($1::text[])
ORDER BY timestamp DESC;

-- 18. Update market prices (from external API)
INSERT INTO prices (symbol, price, change, change_percent, timestamp)
VALUES ($1, $2, $3, $4, NOW())
ON CONFLICT (symbol, DATE(timestamp)) 
DO UPDATE SET
  price = EXCLUDED.price,
  change = EXCLUDED.change,
  change_percent = EXCLUDED.change_percent,
  timestamp = EXCLUDED.timestamp;

-- ============================================================================
-- UPI MANDATE & AUTOPAY QUERIES
-- ============================================================================

-- 19. Create UPI mandate
INSERT INTO upi_mandates (user_id, mandate_id, upi_id, max_amount, frequency, status, start_date, end_date)
VALUES ($1, $2, $3, $4, $5, 'pending', $6, $7)
RETURNING id, mandate_id, status;

-- 20. Update mandate status
UPDATE upi_mandates 
SET 
  status = $2,
  gateway_response = $3,
  last_debit_at = CASE WHEN $2 = 'active' THEN NOW() ELSE last_debit_at END,
  updated_at = NOW()
WHERE mandate_id = $1
RETURNING id, status, updated_at;

-- 21. Get active mandates for user
SELECT * FROM upi_mandates 
WHERE user_id = $1 
  AND status = 'active'
ORDER BY created_at DESC;

-- ============================================================================
-- DASHBOARD QUERIES
-- ============================================================================

-- 22. Get comprehensive user dashboard data
SELECT * FROM user_dashboard 
WHERE user_id = $1;

-- 23. Get recent activity summary
SELECT 
  'transaction' as type,
  amount,
  merchant as description,
  timestamp,
  status
FROM transactions 
WHERE user_id = $1 
  AND timestamp >= NOW() - INTERVAL '7 days'

UNION ALL

SELECT 
  'investment' as type,
  amount,
  'Investment in ' || symbol as description,
  timestamp,
  status
FROM orders 
WHERE user_id = $1 
  AND timestamp >= NOW() - INTERVAL '7 days'

ORDER BY timestamp DESC 
LIMIT 10;

-- ============================================================================
-- GOALS & SAVINGS QUERIES
-- ============================================================================

-- 24. Create savings goal
INSERT INTO goals (user_id, name, description, target_amount, target_date, category, priority)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING id, name, target_amount;

-- 25. Update goal progress
UPDATE goals 
SET 
  current_amount = $2,
  achieved_at = CASE WHEN $2 >= target_amount THEN NOW() ELSE NULL END,
  updated_at = NOW()
WHERE id = $1 AND user_id = $3;

-- 26. Get user's active goals
SELECT 
  id,
  name,
  description,
  target_amount,
  current_amount,
  target_date,
  category,
  priority,
  CASE 
    WHEN target_amount > 0 
    THEN (current_amount / target_amount) * 100 
    ELSE 0 
  END as progress_percentage
FROM goals 
WHERE user_id = $1 
  AND is_active = true
ORDER BY priority ASC, created_at DESC;

-- ============================================================================
-- NOTIFICATIONS QUERIES
-- ============================================================================

-- 27. Create notification
INSERT INTO notifications (user_id, title, message, type, category, priority, data)
VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
RETURNING id, title, type, created_at;

-- 28. Get unread notifications
SELECT 
  id,
  title,
  message,
  type,
  category,
  priority,
  data,
  action_url,
  created_at
FROM notifications 
WHERE user_id = $1 
  AND read_at IS NULL
ORDER BY 
  CASE priority 
    WHEN 'urgent' THEN 1 
    WHEN 'high' THEN 2 
    WHEN 'medium' THEN 3 
    ELSE 4 
  END,
  created_at DESC;

-- 29. Mark notification as read
UPDATE notifications 
SET read_at = NOW() 
WHERE id = $1 AND user_id = $2;

-- ============================================================================
-- ANALYTICS & REPORTING QUERIES
-- ============================================================================

-- 30. Get monthly investment summary
SELECT 
  DATE_TRUNC('month', timestamp) as month,
  COUNT(*) as transaction_count,
  SUM(amount) as total_invested,
  AVG(amount) as avg_investment
FROM orders 
WHERE user_id = $1 
  AND status = 'filled'
  AND timestamp >= NOW() - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', timestamp)
ORDER BY month DESC;

-- 31. Get roundup efficiency stats
SELECT 
  COUNT(t.id) as total_transactions,
  COUNT(pl.id) as roundup_transactions,
  SUM(pl.amount) as total_roundups,
  AVG(pl.amount) as avg_roundup,
  (COUNT(pl.id)::float / COUNT(t.id) * 100) as roundup_percentage
FROM transactions t
LEFT JOIN piggy_ledger pl ON t.id = pl.transaction_id AND pl.type = 'roundup_credit'
WHERE t.user_id = $1 
  AND t.direction = 'debit'
  AND t.timestamp >= $2;

-- 32. Get portfolio allocation breakdown
SELECT 
  h.symbol,
  h.current_value,
  (h.current_value / portfolio_total.total * 100) as allocation_percentage
FROM holdings h
CROSS JOIN (
  SELECT SUM(current_value) as total 
  FROM holdings 
  WHERE user_id = $1
) portfolio_total
WHERE h.user_id = $1
  AND h.units > 0
ORDER BY h.current_value DESC;

-- ============================================================================
-- SECURITY & AUDIT QUERIES
-- ============================================================================

-- 33. Log security event
INSERT INTO audit_logs (user_id, action, resource_type, resource_id, ip_address, user_agent)
VALUES ($1, $2, $3, $4, $5::inet, $6);

-- 34. Get user session info
SELECT 
  device_name,
  device_type,
  ip_address,
  last_activity_at,
  is_active
FROM sessions 
WHERE user_id = $1 
ORDER BY last_activity_at DESC;

-- ============================================================================
-- HELPER FUNCTIONS (Use with Supabase RPC)
-- ============================================================================

-- 35. Calculate roundup for amount (PostgreSQL function)
SELECT calculate_roundup($1::decimal, $2::integer, $3::integer, $4::integer) as roundup_amount;

-- 36. Get user dashboard summary (Custom function)
SELECT * FROM get_user_dashboard($1::uuid);

-- ============================================================================
-- PERFORMANCE TIPS
-- ============================================================================

-- Use these indexes for better performance (already created in schema):
-- - idx_transactions_user_id_timestamp
-- - idx_piggy_ledger_user_id_timestamp
-- - idx_holdings_user_id
-- - idx_prices_symbol
-- - idx_orders_user_id_status

-- Use LIMIT and OFFSET for pagination
-- Use date ranges for time-based queries
-- Use proper RLS policies for security
-- Cache dashboard queries in Redis/memory when possible
