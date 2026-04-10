import emailjs from "emailjs-com";

// Test EmailJS configuration
const EMAILJS_SERVICE_ID = "service_syjr03j";
const EMAILJS_TEMPLATE_ID = "template_gea8x1a";
const EMAILJS_PUBLIC_KEY = "7PKPfDmWfHvggKCfp";

// Initialize EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

export const testEmailJS = async (testEmail: string): Promise<boolean> => {
  try {
    console.log("🧪 Testing EmailJS with email:", testEmail);

    const templateParams = {
      to_email: testEmail,
      to_name: "Test User",
      otp_code: "123456",
      from_name: "CampusLink Team",
      message: "This is a test email from CampusLink",
      subject: "Test Email",
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    );

    console.log("✅ Test email sent successfully:", response);
    return response.status === 200;
  } catch (error) {
    console.error("❌ Test email failed:", error);
    return false;
  }
};

// Call this function from browser console to test
// testEmailJS("your-email@example.com")
