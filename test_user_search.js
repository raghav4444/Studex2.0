// Test script to debug user search
// Run this in your browser console to test the search functionality

async function testUserSearch() {
  console.log('Testing user search...');
  
  try {
    // Test 1: Check if profiles table exists and has data
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, email')
      .limit(5);
    
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return;
    }
    
    console.log('Profiles found:', profiles);
    
    // Test 2: Try a simple search
    const { data: searchResults, error: searchError } = await supabase
      .from('profiles')
      .select('id, name, email, college, branch, year, avatar_url')
      .or('name.ilike.%test%,email.ilike.%test%')
      .limit(5);
    
    if (searchError) {
      console.error('Search error:', searchError);
      return;
    }
    
    console.log('Search results:', searchResults);
    
    // Test 3: Check if username field exists
    const { data: usernameTest, error: usernameError } = await supabase
      .from('profiles')
      .select('username')
      .limit(1);
    
    if (usernameError) {
      console.log('Username field does not exist:', usernameError.message);
    } else {
      console.log('Username field exists:', usernameTest);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testUserSearch();
