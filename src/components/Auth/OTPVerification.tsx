import React, { useState, useEffect } from 'react';
import { Mail, RefreshCw, CheckCircle } from 'lucide-react';

interface OTPVerificationProps {
  email: string;
  onVerificationSuccess: () => void;
  onResendOTP: () => Promise<boolean>;
  onBack: () => void;
}

const OTPVerification: React.FC<OTPVerificationProps> = ({
  email,
  onVerificationSuccess,
  onResendOTP,
  onBack,
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Get stored OTP from localStorage (in real app, this would be server-side)
      const storedOTP = localStorage.getItem('signup_otp');
      const otpTimestamp = localStorage.getItem('otp_timestamp');
      
      if (!storedOTP || !otpTimestamp) {
        setError('OTP expired. Please request a new one.');
        return;
      }

      const now = Date.now();
      const otpAge = now - parseInt(otpTimestamp);
      
      if (otpAge > 300000) { // 5 minutes
        setError('OTP expired. Please request a new one.');
        localStorage.removeItem('signup_otp');
        localStorage.removeItem('otp_timestamp');
        return;
      }

      if (otpCode === storedOTP) {
        localStorage.removeItem('signup_otp');
        localStorage.removeItem('otp_timestamp');
        onVerificationSuccess();
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    const success = await onResendOTP();
    if (success) {
      setTimeLeft(300);
      setOtp(['', '', '', '', '', '']);
      setError('');
    } else {
      setError('Failed to resend OTP. Please try again.');
    }
    setResendLoading(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-[#161b22] rounded-lg p-8 border border-gray-800">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Verify Your Email</h2>
          <p className="text-gray-400">
            We've sent a 6-digit verification code to
          </p>
          <p className="text-blue-400 font-medium">{email}</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          <div className="flex justify-center space-x-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-xl font-bold bg-[#0d1117] border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                maxLength={1}
              />
            ))}
          </div>

          <button
            onClick={handleVerify}
            disabled={loading || otp.some(digit => !digit)}
            className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white font-medium rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Verifying...</span>
              </div>
            ) : (
              'Verify Email'
            )}
          </button>

          <div className="text-center">
            <p className="text-gray-400 text-sm mb-2">
              Time remaining: <span className="text-blue-400 font-medium">{formatTime(timeLeft)}</span>
            </p>
            
            {timeLeft > 0 ? (
              <button
                onClick={handleResend}
                disabled={resendLoading}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors disabled:opacity-50"
              >
                {resendLoading ? 'Sending...' : 'Resend OTP'}
              </button>
            ) : (
              <button
                onClick={handleResend}
                disabled={resendLoading}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
              >
                {resendLoading ? 'Sending...' : 'Send New OTP'}
              </button>
            )}
          </div>

          <div className="text-center">
            <button
              onClick={onBack}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Back to Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;