// Simple test to verify user search is working
// Run this in your browser console

async function testSimpleSearch() {
  console.log('Testing simple user search...');
  
  try {
    // Test 1: Search for the specific email
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, email, college, branch, year, avatar_url')
      .ilike('email', '%2023bcs121@axiscolleges.in%');
    
    console.log('Search for 2023bcs121@axiscolleges.in:');
    console.log('Data:', data);
    console.log('Error:', error);
    
    // Test 2: Search for any email containing "2023bcs"
    const { data: partialData, error: partialError } = await supabase
      .from('profiles')
      .select('id, name, email, college, branch, year, avatar_url')
      .ilike('email', '%2023bcs%');
    
    console.log('Search for emails containing "2023bcs":');
    console.log('Data:', partialData);
    console.log('Error:', partialError);
    
    // Test 3: Search for name "Vishesh"
    const { data: nameData, error: nameError } = await supabase
      .from('profiles')
      .select('id, name, email, college, branch, year, avatar_url')
      .ilike('name', '%Vishesh%');
    
    console.log('Search for name "Vishesh":');
    console.log('Data:', nameData);
    console.log('Error:', nameError);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testSimpleSearch();
