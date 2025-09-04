import { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthContext from './AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import {
  EyeIcon,
  EyeSlashIcon,
  XMarkIcon,
  EnvelopeIcon,
  LockClosedIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import ApiLoader from '../Loader/ApiLoader';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState('');
  const { login, user, ip } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const emailInputRef = useRef(null);
  const forgotEmailInputRef = useRef(null);

  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPassword = (password) => password.length >= 8;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Clear any existing toasts
    toast.dismiss();

    if (!isValidEmail(email)) {
      const errorMsg = 'Please enter a valid email address.';
      setError(errorMsg);
      toast.error(errorMsg, {
        icon: <XCircleIcon className="h-4 w-4 text-red-500" />,
        style: { background: '#ffffff', color: '#1e293b', padding: '12px', borderRadius: '8px' },
      });
      return;
    }

    if (!isValidPassword(password)) {
      const errorMsg = 'Password must be at least 8 characters long.';
      setError(errorMsg);
      toast.error(errorMsg, {
        icon: <XCircleIcon className="h-4 w-4 text-red-500" />,
        style: { background: '#ffffff', color: '#1e293b', padding: '12px', borderRadius: '8px' },
      });
      return;
    }

    setLoading(true);
    try {
      await login(email, password, ip);
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
      toast.success('Logged in successfully!', {
        icon: <CheckCircleIcon className="h-4 w-4 text-indigo-600" />,
        style: { background: '#ffffff', color: '#1e293b', padding: '12px', borderRadius: '8px' },
      });
    } catch (err) {
      const errorMsg =
        err.response?.status === 429
          ? 'Too many login attempts. Please try again later.'
          : err.response?.data?.message || 'Email or password is incorrect';
      setError(errorMsg);
      toast.error(errorMsg, {
        icon: <XCircleIcon className="h-4 w-4 text-red-500" />,
        style: { background: '#ffffff', color: '#1e293b', padding: '12px', borderRadius: '8px' },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotError('');

    // Clear any existing toasts
    toast.dismiss();

    if (!isValidEmail(forgotEmail)) {
      const errorMsg = 'Please enter a valid email address.';
      setForgotError(errorMsg);
      toast.error(errorMsg, {
        icon: <XCircleIcon className="h-4 w-4 text-red-500" />,
        style: { background: '#ffffff', color: '#1e293b', padding: '12px', borderRadius: '8px' },
      });
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/forgot-password`, { email: forgotEmail.toLowerCase() });
      toast.success('Verification code sent to your email!', {
        icon: <CheckCircleIcon className="h-4 w-4 text-indigo-600" />,
        style: { background: '#ffffff', color: '#1e293b', padding: '12px', borderRadius: '8px' },
      });
      setTimeout(() => {
        navigate(`/reset-password?email=${encodeURIComponent(forgotEmail)}`);
        setIsForgotPasswordOpen(false);
        setForgotEmail('');
      }, 1500);
    } catch (err) {
      const errorMsg =
        err.response?.status === 429
          ? 'Too many requests. Please try again later.'
          : err.response?.data?.message || 'Failed to send verification code.';
      setForgotError(errorMsg);
      toast.error(errorMsg, {
        icon: <XCircleIcon className="h-4 w-4 text-red-500" />,
        style: { background: '#ffffff', color: '#1e293b', padding: '12px', borderRadius: '8px' },
      });
    } finally {
      setLoading(false);
    }
  };

  const openForgotPasswordModal = () => {
    setIsForgotPasswordOpen(true);
    setTimeout(() => forgotEmailInputRef.current?.focus(), 100);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 sm:p-6 font-[Inter] text-[12px] antialiased">
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            fontSize: '12px',
            background: '#ffffff',
            color: '#1e293b',
            padding: '12px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          },
          success: { iconTheme: { primary: '#4f46e5', secondary: '#fff' } },
          error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
        }}
      />
      <div className="w-full max-w-5xl bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col lg:flex-row">
        <div className="lg:flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 p-6 sm:p-8 flex items-center justify-center">
          <div className="text-center w-full">
            <div className="w-full max-w-xs mx-auto sm:max-w-sm">
              <div className="bg-slate-200 dark:bg-slate-700 h-48 sm:h-64 rounded-md flex items-center justify-center">
                <span className="text-slate-500 dark:text-slate-400 text-[12px]">
                  Login Illustration Placeholder
                </span>
              </div>
            </div>
            <h2 className="text-[14px] font-bold text-white mt-4">Welcome Back!</h2>
            <p className="text-[12px] text-indigo-100 dark:text-indigo-200 mt-2">
              Sign in to access your personalized dashboard and features.
            </p>
          </div>
        </div>
        <div className="flex-1 p-6 sm:p-8">
          <div className="text-center mb-6">
            <h1 className="text-[16px] font-bold text-slate-900 dark:text-slate-100">Sign In</h1>
            <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-2">
              Enter your credentials to access your account
            </p>
          </div>
          {error && (
            <div
              className="mb-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-400 p-3 rounded-r-md"
              role="alert"
              aria-describedby="login-error"
            >
              <div className="flex items-start">
                <XCircleIcon className="h-4 w-4 text-red-500 dark:text-red-400 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-[12px] text-red-700 dark:text-red-300" id="login-error">
                  {error}
                </span>
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="email"
                className="block text-[12px] font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-[12px] rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  placeholder="Enter your email"
                  required
                  autoComplete="email"
                  disabled={loading}
                  ref={emailInputRef}
                  aria-describedby={error ? 'email-error' : undefined}
                  aria-label="Email address"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="password"
                  className="block text-[12px] font-medium text-slate-700 dark:text-slate-300"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={openForgotPasswordModal}
                  className="text-[12px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 hover:underline"
                  aria-label="Forgot password"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-9 py-2 text-[12px] rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  disabled={loading}
                  aria-describedby={error ? 'password-error' : undefined}
                  aria-label="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 rounded"
                aria-label="Remember me"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-[12px] text-slate-700 dark:text-slate-300"
              >
                Remember me
              </label>
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 rounded-md text-[12px] font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 flex items-center justify-center ${
                loading
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 hover:bg-gradient-to-r hover:from-indigo-700 hover:to-purple-700 dark:hover:from-indigo-600 dark:hover:to-purple-600 shadow-sm'
              }`}
              aria-label="Sign in"
            >
              {loading ? (
                <>
                  <ApiLoader size="small" className="mr-2" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
          <div className="mt-4 text-center">
            <p className="text-[12px] text-slate-500 dark:text-slate-400">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/signup')}
                className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 hover:underline transition-colors duration-200"
                aria-label="Go to signup"
              >
                Create an account
              </button>
            </p>
          </div>
        </div>
      </div>
      {isForgotPasswordOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md w-full max-w-md p-6 animate-in fade-in-50 zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[14px] font-semibold text-slate-900 dark:text-slate-100">
                Reset Password
              </h3>
              <button
                onClick={() => setIsForgotPasswordOpen(false)}
                className="p-1 rounded-full text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200"
                aria-label="Close reset password modal"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
            {forgotError && (
              <div
                className="mb-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-400 p-3 rounded-r-md"
                role="alert"
                aria-describedby="forgot-email-error"
              >
                <div className="flex items-start">
                  <XCircleIcon className="h-4 w-4 text-red-500 dark:text-red-400 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-[12px] text-red-700 dark:text-red-300" id="forgot-email-error">
                    {forgotError}
                  </span>
                </div>
              </div>
            )}
            <p className="text-[12px] text-slate-500 dark:text-slate-400 mb-4">
              Enter your email address to receive a verification code.
            </p>
            <form onSubmit={handleForgotPassword} className="space-y-4" noValidate>
              <div>
                <label
                  htmlFor="forgot-email"
                  className="block text-[12px] font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  Email Address
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-3 py-2 text-[12px] rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                  ref={forgotEmailInputRef}
                  aria-describedby={forgotError ? 'forgot-email-error' : undefined}
                  aria-label="Email address for password reset"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsForgotPasswordOpen(false)}
                  className="flex-1 py-2 px-4 border border-slate-300 dark:border-slate-600 rounded-md text-[12px] font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                  aria-label="Cancel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 py-2 px-4 rounded-md text-[12px] font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 ${
                    loading
                      ? 'bg-indigo-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 hover:bg-gradient-to-r hover:from-indigo-700 hover:to-purple-700 dark:hover:from-indigo-600 dark:hover:to-purple-600 shadow-sm'
                  }`}
                  aria-label="Send verification code"
                >
                  {loading ? (
                    <>
                      <ApiLoader size="small" className="mr-2 inline" />
                      Sending...
                    </>
                  ) : (
                    'Send Code'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;