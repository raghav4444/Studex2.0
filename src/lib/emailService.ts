import emailjs from "emailjs-com";

declare global {
  interface Window {
    testEmailJS?: () => Promise<boolean>;
  }
}

// EmailJS configuration
const EMAILJS_SERVICE_ID = "service_syjr03j";
const EMAILJS_TEMPLATE_ID = "template_gea8x1a";
const EMAILJS_PUBLIC_KEY = "7PKPfDmWfHvggKCfp";

// Initialize EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

export const sendOTPEmail = async (
  email: string,
  otp: string
): Promise<boolean> => {
  try {
    console.log("Sending OTP email to:", email);

    if (!email || email.trim().length === 0) {
      console.error("Email is empty or invalid");
      return false;
    }

    // Template params - trying different approaches for 422 error
    // The 422 error suggests parameter name mismatch with your EmailJS template
    const templateParams = {
      // Common EmailJS parameter names - one of these should work
      passcode: otp,
      time: new Date(Date.now() + 15 * 60 * 1000).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      // Try different recipient field names
      to_email: email.trim(),
      email: email.trim(),
      user_email: email.trim(),
      recipient: email.trim(),
    };

    console.log("Sending with params:", templateParams);

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY // Add public key as 4th parameter
    );

    console.log("Email sent successfully");
    return response.status === 200;
  } catch (error) {
    console.error("Failed to send OTP email:", error);

    const emailError = error as { status?: number; text?: string };
    if (emailError.status === 422) {
      console.error("🚨 EmailJS 422 Error - Template Configuration Issue");
      console.error("📧 This usually means:");
      console.error(
        "1. Template parameter names don't match what EmailJS expects"
      );
      console.error("2. EmailJS service/template IDs are incorrect");
      console.error("3. EmailJS account has restrictions or is suspended");
      console.error("4. Template 'To' field configuration is wrong");
      console.error("💡 Check your EmailJS dashboard settings!");
    }

    return false;
  }
};

// Minimal test function to diagnose EmailJS issues
export const testMinimalEmail = async () => {
  try {
    console.log("🧪 Testing minimal EmailJS configuration...");

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        passcode: "123456",
        time: "10:00 PM",
      }
    );

    console.log("✅ Minimal test successful!", response);
    return response.status === 200;
  } catch (error) {
    console.error("❌ Minimal test failed:", error);

    const emailError = error as { status?: number; text?: string };
    if (emailError.status === 422) {
      console.error("🚨 Template configuration is definitely the issue!");
      console.error("📝 Your EmailJS template needs to be configured properly");
    }

    return false;
  }
};

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const isValidCollegeEmail = (email: string): boolean => {
  const collegeEmailPatterns = [
    /\.edu$/i,
    /\.ac\.in$/i,
    /@.*college.*\.in$/i,
    /@.*university.*\.in$/i,
    /@.*institute.*\.in$/i,
    /@axiscolleges\.in$/i,
  ];

  return collegeEmailPatterns.some((pattern) => pattern.test(email));
};

// Test function for debugging EmailJS issues
export const testEmailJS = async () => {
  try {
    console.log("🧪 Testing EmailJS configuration...");

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        passcode: "123456",
        time: "10:00 PM",
      }
    );

    console.log("✅ EmailJS test successful!", response);
    return response.status === 200;
  } catch (error) {
    console.error("❌ EmailJS test failed:", error);

    const emailError = error as { status?: number; text?: string };
    if (emailError.status === 422) {
      console.error("🚨 Template configuration is the issue!");
      console.error("📝 Check your EmailJS template settings");
    }

    return false;
  }
};

// Make testEmailJS available globally for console testing
if (typeof window !== "undefined") {
  (window as Window & typeof globalThis).testEmailJS = testEmailJS;
}
