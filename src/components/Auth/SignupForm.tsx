import React, { useState } from "react";
import { Mail, Lock, User, GraduationCap, Calendar, Book, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../AuthProvider";
import OTPVerification from "./OTPVerification";
import {
  sendOTPEmail,
  generateOTP,
  isValidCollegeEmail,
} from "../../lib/emailService";

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSwitchToLogin }) => {
  const [showOTP, setShowOTP] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  interface UserData {
    name: string;
    email: string;
    password: string;
    college: string;
    branch: string;
    year: number;
  }

  const [pendingUserData, setPendingUserData] = useState<UserData | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    college: "",
    branch: "",
    year: 1,
  });
  const [error, setError] = useState("");
  const { signUp, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Add debugging
    console.log("🔍 Form submission data:", formData);
    console.log("📧 Email being sent:", {
      email: formData.email,
      emailTrimmed: formData.email?.trim(),
      emailLength: formData.email?.length,
      name: formData.name,
    });

    // Validate required fields
    if (!formData.email || formData.email.trim().length === 0) {
      setError("Email is required");
      return;
    }

    if (!formData.name || formData.name.trim().length === 0) {
      setError("Name is required");
      return;
    }

    // Validate college email with expanded patterns
    if (!isValidCollegeEmail(formData.email.trim())) {
      setError("Please use your college email (.edu or .ac.in domain)");
      return;
    }

    try {
      // Generate and send OTP
      const otp = generateOTP();
      console.log("🔐 Generated OTP:", otp);

      const emailSent = await sendOTPEmail(formData.email.trim(), otp);

      if (!emailSent) {
        setError("Failed to send verification email. Please try again.");
        return;
      }

      // Store OTP and user data temporarily
      localStorage.setItem("signup_otp", otp);
      localStorage.setItem("otp_timestamp", Date.now().toString());
      setPendingUserData(formData);
      setShowOTP(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create account. Please try again."
      );
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleOTPVerificationSuccess = async () => {
    if (!pendingUserData) return;

    try {
      await signUp(pendingUserData);
      // Success - user will be redirected by the auth system
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create account. Please try again."
      );
      setShowOTP(false);
    }
  };

  const handleResendOTP = async (): Promise<boolean> => {
    if (!pendingUserData) return false;

    const otp = generateOTP();
    const emailSent = await sendOTPEmail(pendingUserData.email, otp);
    if (emailSent) {
      localStorage.setItem("signup_otp", otp);
      localStorage.setItem("otp_timestamp", Date.now().toString());
    }

    return emailSent;
  };

  if (showOTP) {
    return (
      <OTPVerification
        email={formData.email}
        onVerificationSuccess={handleOTPVerificationSuccess}
        onResendOTP={handleResendOTP}
        onBack={() => setShowOTP(false)}
      />
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-[#161b22] rounded-lg p-8 border border-gray-800">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Join Studex</h2>
          <p className="text-gray-400">
            Connect with students from your college
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 bg-[#0d1117] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                placeholder="Enter your full name"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              College Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 bg-[#0d1117] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                placeholder="your.email@college.edu"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Use your college email for verification
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              College/University
            </label>
            <div className="relative">
              <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="college"
                value={formData.college}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 bg-[#0d1117] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                placeholder="Your College Name"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Branch
              </label>
              <div className="relative">
                <Book className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="branch"
                  value={formData.branch}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-[#0d1117] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                  placeholder="CSE"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Year
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-[#0d1117] border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all appearance-none"
                  required
                >
                  <option value={1}>1st Year</option>
                  <option value={2}>2nd Year</option>
                  <option value={3}>3rd Year</option>
                  <option value={4}>4th Year</option>
                </select>
              </div>
            </div>
          </div>

            <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full pl-10 pr-12 py-3 bg-[#0d1117] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
              placeholder="Create a strong password"
              required
              pattern="^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$"
              title="Password must be at least 8 characters, include letters and numbers."
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Must be at least 8 characters, include letters and numbers.
            </p>
            </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white font-medium rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Already have an account?{" "}
            <button
              onClick={onSwitchToLogin}
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
