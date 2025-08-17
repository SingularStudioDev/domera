// Test NextAuth authentication flow
require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

// Use same environment variables as NextAuth
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testNextAuthFlow() {
  try {
    console.log('🔐 Testing NextAuth authentication flow...');

    const testCredentials = {
      email: 'prueba@test.com',
      password: 'Password.123'
    };

    console.log(`📧 Testing login for: ${testCredentials.email}`);

    // Step 1: Get user from database (same query as NextAuth)
    console.log('🔍 Step 1: Querying user from database...');
    
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        password,
        first_name,
        last_name,
        avatar_url,
        is_active,
        user_roles!inner(
          role,
          organization_id,
          is_active,
          organization:organizations(name, slug)
        )
      `)
      .eq('email', testCredentials.email)
      .eq('is_active', true)
      .eq('user_roles.is_active', true)
      .single();

    if (error) {
      console.error('❌ Database query error:', error);
      return;
    }

    if (!user) {
      console.error('❌ User not found');
      return;
    }

    console.log('✅ User found in database');
    console.log('📊 User data structure:');
    console.log(JSON.stringify(user, null, 2));

    // Step 2: Verify password
    console.log('🔍 Step 2: Verifying password...');
    
    const isValidPassword = await bcrypt.compare(testCredentials.password, user.password);
    
    if (!isValidPassword) {
      console.error('❌ Invalid password');
      return;
    }

    console.log('✅ Password verification successful');

    // Step 3: Create user object for NextAuth
    console.log('🔍 Step 3: Creating NextAuth user object...');
    
    const nextAuthUser = {
      id: user.id,
      email: user.email,
      name: `${user.first_name} ${user.last_name}`,
      image: user.avatar_url,
      firstName: user.first_name,
      lastName: user.last_name,
      roles: user.user_roles || [],
      isActive: user.is_active
    };

    console.log('✅ NextAuth user object created:');
    console.log(JSON.stringify(nextAuthUser, null, 2));

    console.log('\n🎉 Authentication flow completed successfully!');

  } catch (error) {
    console.error('❌ Authentication flow failed:', error);
  }
}

testNextAuthFlow();