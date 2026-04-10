// Test the user search functionality
// Run this in your browser console

async function testUserSearch() {
  console.log('Testing user search for: 2023bcs121@axiscolleges.in');
  
  try {
    // Test 1: Check if the email exists in profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, name, email, college, branch, year, avatar_url')
      .eq('email', '2023bcs121@axiscolleges.in');
    
    console.log('Direct email search result:', profiles);
    console.log('Error:', profilesError);
    
    // Test 2: Check if the email exists with ilike
    const { data: ilikeProfiles, error: ilikeError } = await supabase
      .from('profiles')
      .select('user_id, name, email, college, branch, year, avatar_url')
      .ilike('email', '%2023bcs121@axiscolleges.in%');
    
    console.log('ILike search result:', ilikeProfiles);
    console.log('ILike error:', ilikeError);
    
    // Test 3: Check all profiles to see what's in the database
    const { data: allProfiles, error: allError } = await supabase
      .from('profiles')
      .select('user_id, name, email, college, branch, year')
      .limit(10);
    
    console.log('All profiles (first 10):', allProfiles);
    console.log('All profiles error:', allError);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testUserSearch();
