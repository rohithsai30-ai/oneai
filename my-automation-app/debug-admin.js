// Debug script to test admin login and Supabase connection
const bcrypt = require('bcryptjs');

console.log('🔍 R1 AI Admin Debug Script');
console.log('==========================');

// Test password hash
const testPassword = 'admin123';
const correctHash = '$2b$10$1.XcZwhI92Qf90yRkfwwIuz4d6n/qt3Rsauym0j5pHCPWxQnBjqyC';

console.log('\n1. Testing Password Hash:');
console.log('Password:', testPassword);
console.log('Expected Hash:', correctHash);

const isValidPassword = bcrypt.compareSync(testPassword, correctHash);
console.log('Hash Validation:', isValidPassword ? '✅ CORRECT' : '❌ INCORRECT');

if (isValidPassword) {
  console.log('✅ Password hash is correct - login should work');
} else {
  console.log('❌ Password hash is incorrect - this is the problem');
}

console.log('\n2. Next Steps:');
console.log('- Run the complete SQL setup in Supabase');
console.log('- Verify admin user exists in users table');
console.log('- Try logging in with admin@r1ai.com / admin123');
console.log('- Check browser console for errors');

console.log('\n3. Admin Credentials:');
console.log('Email: admin@r1ai.com');
console.log('Password: admin123');
console.log('Access: http://localhost:3004/admin');
