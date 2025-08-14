# UPI Piggy Backend Setup Guide

## Overview
This guide will help you set up the complete backend for UPI Piggy using **Supabase** (completely FREE for your needs as a student/startup).

## Prerequisites
- Node.js installed
- A Google/GitHub account for Supabase

## Step 1: Create Supabase Project (5 minutes)

1. **Go to [supabase.com](https://supabase.com)** and sign up for free
2. **Click "New Project"**
3. **Fill in project details:**
   - Name: `upi-piggy`
   - Organization: Create new or use existing
   - Database Password: Choose a strong password
   - Region: Choose closest to India (Singapore/Mumbai)
4. **Wait for project creation (2-3 minutes)**

## Step 2: Set Up Database Schema

1. **Go to your Supabase dashboard**
2. **Click "SQL Editor" in the left sidebar**
3. **Copy and paste the entire content from `supabase/schema.sql`**
4. **Click "RUN" to execute the schema**
5. **Verify tables were created** - Go to "Table Editor" and you should see all tables

## Step 3: Get API Keys

1. **Go to "Settings" > "API" in your Supabase dashboard**
2. **Copy these values:**
   - **Project URL**: `https://your-project-ref.supabase.co`
   - **Anon/Public Key**: `eyJhbGciOi...` (long string)

## Step 4: Set Up Environment Variables

1. **Create `.env` file in your project root:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file with your Supabase credentials:**
   ```bash
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...your-anon-key
   ```

## Step 5: Install Dependencies

```bash
npm install @supabase/supabase-js
```

## Step 6: Test Your Setup

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open your browser** and go to `http://localhost:5173`

3. **Test the app:**
   - Try signing up with a test email
   - Simulate some transactions
   - Check if data persists

## Step 7: Verify Backend Integration

Go to your **Supabase Dashboard > Table Editor** and check:
- `users` table should have your test user
- `transactions` table should have simulated transactions
- `piggy_ledger` should have round-up entries
- `holdings` table should show your portfolio

## Production Deployment (When Ready)

### Frontend (FREE)
1. **Deploy to Vercel:**
   ```bash
   npm install -g vercel
   vercel
   ```
   - Link to your GitHub repo
   - Add environment variables in Vercel dashboard
   - Deploy automatically on every git push

### Backend Scaling
Your Supabase FREE tier includes:
- 500MB database
- 50,000 monthly active users
- 1GB bandwidth
- Unlimited API requests

**When you outgrow FREE tier:**
- Supabase Pro: $25/month (2GB database, 100K users)
- Add Stripe/Razorpay for payments
- Add Zerodha/Upstox for real trading

## Security Considerations

✅ **Already Implemented:**
- Row Level Security (RLS) enabled
- Users can only access their own data
- JWT-based authentication
- Encrypted database connections

✅ **For Production:**
- Enable email verification
- Add phone number verification for KYC
- Set up proper backup schedules
- Configure rate limiting

## Cost Breakdown

### Free Tier (Good for 6 months+)
- **Supabase:** FREE
- **Vercel Hosting:** FREE
- **Domain:** $10/year (optional)
- **Total:** $0-10/year

### When You Get Traction
- **Supabase Pro:** $25/month
- **Razorpay:** 2% transaction fee
- **Zerodha Connect:** ₹2,000/month
- **Total:** ~$50-100/month

## Next Steps

1. **Complete the setup above**
2. **Test with demo data**
3. **Add real UPI integration (Razorpay)**
4. **Add broker integration (Zerodha)**
5. **Deploy to production**
6. **Start user testing**

## Troubleshooting

### Common Issues:

**"Module not found: @supabase/supabase-js"**
```bash
npm install @supabase/supabase-js
```

**"Invalid API key"**
- Check your `.env` file
- Ensure VITE_ prefix is used
- Restart your dev server

**"Table doesn't exist"**
- Re-run the SQL schema in Supabase SQL Editor
- Check if all tables are created in Table Editor

**"Authentication error"**
- Check your Supabase project URL
- Verify API keys are correct
- Ensure RLS policies are set up

## Support

Need help? Check:
1. [Supabase Documentation](https://supabase.com/docs)
2. [Our GitHub Issues](link-to-your-repo)
3. [Supabase Discord Community](https://discord.supabase.com)

---

🎉 **You're all set!** Your UPI Piggy app now has a production-ready backend that can scale from 0 to millions of users.
