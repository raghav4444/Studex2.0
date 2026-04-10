// Quick database test - add this to your browser console
// Copy and paste this entire function in your browser dev tools console

window.testDatabase = async function () {
  console.log("🔍 Testing database connection...");

  // Import supabase (adjust path if needed)
  const { supabase } = await import("./src/lib/supabase.ts");

  try {
    console.log("1️⃣ Testing basic connection...");
    const { data, error } = await supabase.from("profiles").select("count");

    if (error) {
      console.error("❌ Database error:", error);
      if (error.code === "42P01") {
        console.error("🚨 PROFILES TABLE DOES NOT EXIST!");
        console.error("📋 You need to run your database migration in Supabase");
      } else if (error.message.includes("JWT")) {
        console.error("🚨 AUTHENTICATION ERROR!");
        console.error("📋 Check your SUPABASE_URL and SUPABASE_ANON_KEY");
      }
      return;
    }

    console.log("✅ Database connected successfully");

    console.log("2️⃣ Testing user authentication...");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("❌ Auth error:", authError);
      return;
    }

    if (!user) {
      console.log("ℹ️ No authenticated user");
      return;
    }

    console.log("✅ User authenticated:", user.email);

    console.log("3️⃣ Testing profile query...");
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (profileError) {
      console.error("❌ Profile query error:", profileError);
      if (profileError.code === "PGRST116") {
        console.log("ℹ️ No profile found - this is the issue!");
      }
    } else if (profile) {
      console.log("✅ Profile found:", profile);
    }
  } catch (err) {
    console.error("💥 Test failed:", err);
  }
};

console.log("🎯 Test function loaded. Run: testDatabase()");
