# 🔄 RESET R1 AI DEMO - COMPLETE FIX

## The Problem
Your debug dashboard shows:
- ❌ Still using `demo-user-id` (invalid UUID)
- ❌ Database connection failing
- ❌ User not found in database
- ❌ Business onboarding data missing

## The Solution (5 Minutes)

### STEP 1: Clear Browser Data
1. Open browser console (F12)
2. Run: `localStorage.clear()`
3. Refresh page

### STEP 2: Setup Database Tables
1. Go to **Supabase Dashboard** → **SQL Editor**
2. Copy ALL content from `COMPLETE_SUPABASE_SETUP.sql`
3. Paste and click **"Run"**
4. Should see: `SUCCESS: All R1 AI database tables created successfully!`

### STEP 3: Verify Environment
Check `.env.local` has your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### STEP 4: Fresh Registration Flow
1. Go to: http://localhost:3004/signup
2. **Sign up with NEW account** (e.g., test@example.com)
3. **Sign in** with that account
4. **Complete onboarding form**
5. **View business insights** ✅

### STEP 5: Verify Success
1. Go to: http://localhost:3004/debug
2. Run diagnostics
3. All should be green ✅

## Expected Working Flow
```
Sign Up → Sign In → Onboarding → Business Insights → Dashboard
   ✅        ✅         ✅            ✅              ✅
```

## If Still Having Issues
1. Check Supabase dashboard for created tables
2. Verify environment variables are correct
3. Clear browser cache completely
4. Restart dev server: `npm run dev`

Your R1 AI automation platform will be fully functional after these steps! 🚀
