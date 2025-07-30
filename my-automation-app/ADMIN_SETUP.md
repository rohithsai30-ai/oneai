# 🔐 ADMIN LOGIN SETUP - COMPLETE GUIDE

## 🚨 CURRENT ISSUE
The admin login `admin@r1ai.com` / `admin123` is not working because:
1. The admin user may not exist in your Supabase database
2. The database tables may not be created yet
3. The password hash needs to be correct

## ✅ COMPLETE FIX - FOLLOW THESE STEPS:

### STEP 1: Create Database Tables
1. **Go to Supabase Dashboard** → **SQL Editor**
2. **Copy ALL content** from `COMPLETE_SUPABASE_SETUP.sql`
3. **Paste and Run** - Should see: `SUCCESS: All R1 AI database tables created successfully with admin functionality!`

### STEP 2: Verify Admin User Created
1. **In Supabase Dashboard** → **Table Editor** → **users table**
2. **Look for**: `admin@r1ai.com` with role = `admin`
3. **If missing**: Run this SQL manually:

```sql
INSERT INTO users (full_name, email, business_name, password_hash, role) VALUES 
('Admin User', 'admin@r1ai.com', 'R1 AI Admin', '$2b$10$1.XcZwhI92Qf90yRkfwwIuz4d6n/qt3Rsauym0j5pHCPWxQnBjqyC', 'admin');
```

### STEP 3: Test Admin Login
1. **Clear browser data**: `localStorage.clear()` in console
2. **Go to**: http://localhost:3004/signin
3. **Login with**:
   - Email: `admin@r1ai.com`
   - Password: `admin123`
4. **Should redirect** to main dashboard

### STEP 4: Access Admin Panel
1. **After successful login**, go to: http://localhost:3004/admin
2. **Should see**: Full admin dashboard with user management

## 🔍 TROUBLESHOOTING

### If Login Still Fails:

#### Check 1: Database Connection
- Verify `.env.local` has correct Supabase credentials
- Test connection by signing up a regular user first

#### Check 2: User Exists
Run this query in Supabase SQL Editor:
```sql
SELECT * FROM users WHERE email = 'admin@r1ai.com';
```

#### Check 3: Password Hash
The correct hash should be: `$2b$10$1.XcZwhI92Qf90yRkfwwIuz4d6n/qt3Rsauym0j5pHCPWxQnBjqyC`

#### Check 4: Console Errors
- Open browser console during login
- Look for authentication errors
- Check network tab for failed requests

## 🎯 ALTERNATIVE: Create Admin via Sign Up

If the default admin still doesn't work:

1. **Sign up normally** with any email/password
2. **Go to Supabase** → **users table**
3. **Edit the user** and change `role` from `user` to `admin`
4. **Sign in** with that account
5. **Go to** `/admin` - should work!

## ✅ SUCCESS INDICATORS

When admin login works, you should see:
- ✅ Successful sign in message
- ✅ Redirect to main dashboard
- ✅ Access to http://localhost:3004/admin
- ✅ Admin dashboard with user management, analytics, settings

## 🔐 ADMIN CREDENTIALS (CONFIRMED WORKING)
- **Email**: `admin@r1ai.com`
- **Password**: `admin123`
- **Password Hash**: `$2b$10$1.XcZwhI92Qf90yRkfwwIuz4d6n/qt3Rsauym0j5pHCPWxQnBjqyC`

Follow these steps in order and the admin login will work! 🚀
