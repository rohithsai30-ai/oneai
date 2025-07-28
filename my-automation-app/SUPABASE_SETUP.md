# Supabase Setup for R1 AI Automation App

Your app is now configured to use Supabase as the database! Follow these steps to complete the setup.

## 🚀 Step 1: Create Supabase Account & Project

1. **Go to**: https://supabase.com
2. **Sign up** for free (GitHub login recommended)
3. **Create a new project**:
   - Project name: `r1-ai-automation`
   - Database password: (choose a strong password - save it!)
   - Region: Choose closest to your location

## 🔑 Step 2: Get Your Credentials

After your project is created:
1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy these two values:
   - **Project URL** (starts with `https://`)
   - **Anon public key** (starts with `eyJ`)

## 📝 Step 3: Add Environment Variables

Create a file called `.env.local` in your project root and add:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**Replace** `your_project_url_here` and `your_anon_key_here` with the actual values from Step 2.

## 🗄️ Step 4: Create Database Tables

In your Supabase dashboard:
1. Go to **SQL Editor**
2. Click **New Query**
3. Copy and paste this SQL code:

```sql
-- Create submissions table
CREATE TABLE submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  request_type TEXT NOT NULL,
  request_details TEXT NOT NULL,
  service TEXT NOT NULL,
  response_data JSONB,
  status TEXT CHECK (status IN ('pending', 'success', 'error')) DEFAULT 'pending'
);

-- Create interactions table
CREATE TABLE interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  action TEXT NOT NULL,
  service TEXT NOT NULL,
  response_data JSONB,
  status TEXT CHECK (status IN ('pending', 'success', 'error')) DEFAULT 'pending'
);

-- Enable Row Level Security (recommended for production)
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (for development)
-- Note: In production, you should create more restrictive policies
CREATE POLICY "Allow all operations on submissions" ON submissions FOR ALL USING (true);
CREATE POLICY "Allow all operations on interactions" ON interactions FOR ALL USING (true);
```

4. Click **Run** to execute the SQL

## ✅ Step 5: Test Your Setup

1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. **Test the app**:
   - Go to http://localhost:3000
   - Click any Foundation Service button
   - Check your Supabase dashboard → **Table Editor** to see the data!

## 🎯 What You Get

- **Cloud Database**: Your data is stored in Supabase (PostgreSQL)
- **Real-time Dashboard**: View all data in Supabase dashboard
- **Automatic Backups**: Supabase handles backups for you
- **Scalable**: Can handle thousands of users
- **Free Tier**: 50,000 rows, 500MB storage

## 🔍 Viewing Your Data

- **In App**: Your R1 AI app shows all data automatically
- **Supabase Dashboard**: Go to **Table Editor** → `submissions` or `interactions`
- **Real-time**: Changes appear instantly in both places

## 🆘 Troubleshooting

**If you see errors:**
1. Check that `.env.local` has the correct Supabase URL and key
2. Verify the SQL tables were created successfully
3. Restart your development server after adding environment variables

**Need help?** The app will fallback to localStorage if Supabase is unavailable.

---

🎉 **You're all set!** Your R1 AI automation app now uses a professional cloud database.
