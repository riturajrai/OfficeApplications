
import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from './AuthContext';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import {
  UserCircleIcon,
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import ApiLoader from '../Loader/ApiLoader';

function Setting() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  // State management
  const [state, setState] = useState({
    userData: null,
    loading: true,
    formLoading: false,
    error: null,
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showCurrentPassword: false,
    showNewPassword: false,
    showConfirmPassword: false,
    activeTab: 'profile',
    passwordStrength: 0,
  });

  const updateState = (updates) => setState((prev) => ({ ...prev, ...updates }));

  const fetchUserProfile = async () => {
    try {
      updateState({ loading: true, error: null });
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication required');

      const response = await axios.get(`${API_URL}/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const currentUser = response.data.data.find((u) => u.email === user.email);
      if (!currentUser) throw new Error('User not found');

      updateState({
        userData: currentUser,
        name: currentUser.name,
        email: currentUser.email,
        loading: false,
      });
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to load profile data.';
      updateState({ error: errorMsg, loading: false });
      toast.error(errorMsg, { icon: <XCircleIcon className="h-5 w-5 text-red-500" /> });
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate('/login');
      }
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchUserProfile();
  }, [user, navigate]);

  useEffect(() => {
    // Password strength calculation
    if (!state.newPassword) {
      updateState({ passwordStrength: 0 });
      return;
    }

    let strength = 0;
    if (state.newPassword.length >= 8) strength++;
    if (/\d/.test(state.newPassword)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(state.newPassword)) strength++;
    if (/[A-Z]/.test(state.newPassword)) strength++;

    updateState({ passwordStrength: strength });
  }, [state.newPassword]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    updateState({ formLoading: true });
    try {
      const token = localStorage.getItem('token');
      const updatedData = { name: state.name, email: state.email };
      await axios.put(`${API_URL}/user/${state.userData.id}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      updateState({ userData: { ...state.userData, name: state.name, email: state.email } });
      toast.success('Profile updated successfully!', {
        icon: <CheckCircleIcon className="h-5 w-5 text-green-500" />,
      });
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to update profile.';
      toast.error(errorMsg, { icon: <XCircleIcon className="h-5 w-5 text-red-500" /> });
    } finally {
      updateState({ formLoading: false });
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (state.newPassword !== state.confirmPassword) {
      toast.error('Passwords do not match.', {
        icon: <XCircleIcon className="h-5 w-5 text-red-500" />,
      });
      return;
    }

    if (state.passwordStrength < 3) {
      toast.error('Please choose a stronger password.', {
        icon: <XCircleIcon className="h-5 w-5 text-red-500" />,
      });
      return;
    }

    updateState({ formLoading: true });
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/auth/change-password`,
        {
          currentPassword: state.currentPassword,
          newPassword: state.newPassword,
          confirmPassword: state.confirmPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Password changed successfully!', {
        icon: <CheckCircleIcon className="h-5 w-5 text-green-500" />,
      });
      updateState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to change password.';
      toast.error(errorMsg, { icon: <XCircleIcon className="h-5 w-5 text-red-500" /> });
    } finally {
      updateState({ formLoading: false });
    }
  };

  const passwordStrengthMeter = () => {
    if (!state.newPassword) return null;

    const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-400', 'bg-green-500'];
    const strengthText = ['Very Weak', 'Weak', 'Moderate', 'Strong', 'Very Strong'];

    return (
      <div className="mt-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[12px] font-medium text-gray-500 dark:text-gray-400">
            Password Strength:{' '}
            <span className={`font-bold ${state.passwordStrength > 2 ? 'text-green-500' : 'text-red-500'}`}>
              {strengthText[state.passwordStrength]}
            </span>
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full ${strengthColors[state.passwordStrength]} transition-all duration-300`}
            style={{ width: `${(state.passwordStrength / 4) * 100}%` }}
          ></div>
        </div>
        {state.passwordStrength < 3 && (
          <p className="mt-1 text-[12px] text-gray-500 dark:text-gray-400 flex items-center">
            <InformationCircleIcon className="inline h-4 w-4 mr-1" />
            Tip: Use at least 8 characters with numbers and special characters
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-6 sm:px-6 lg:px-8 font-roboto text-[12px] antialiased">
      <Toaster
        position="top-right"
        toastOptions={{
          style: { fontSize: '12px' },
          success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
        }}
      />

      <div className="max-w-full sm:max-w-4xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 gap-4">
          <div>
            <h1 className="text-[12px] font-bold text-gray-900 dark:text-white">Account Settings</h1>
            <p className="mt-1 text-[12px] text-gray-600 dark:text-gray-300">
              Manage your profile and security preferences
            </p>
          </div>
        </div>

        {state.loading ? (
          <div className="flex justify-center items-center py-6">
            <ApiLoader />
          </div>
        ) : state.error ? (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-center">
            <p className="text-[12px] text-gray-500 dark:text-gray-300">{state.error}</p>
          </div>
        ) : state.userData ? (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-64 flex-shrink-0">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 sticky top-6">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white">
                      <UserCircleIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-[12px] font-medium text-gray-900 dark:text-white truncate">
                        {state.userData.name}
                      </h3>
                      <p className="text-[12px] text-gray-500 dark:text-gray-400 truncate">
                        {state.userData.email}
                      </p>
                    </div>
                  </div>
                </div>
                <nav className="p-4 space-y-1">
                  <button
                    onClick={() => updateState({ activeTab: 'profile' })}
                    className={`w-full flex items-center px-4 py-2 text-[12px] font-medium rounded-md transition-colors duration-200 ${
                      state.activeTab === 'profile'
                        ? 'bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-400'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    aria-current={state.activeTab === 'profile' ? 'page' : undefined}
                  >
                    <UserCircleIcon className="h-4 w-4 mr-2" />
                    Profile
                  </button>
                  <button
                    onClick={() => updateState({ activeTab: 'security' })}
                    className={`w-full flex items-center px-4 py-2 text-[12px] font-medium rounded-md transition-colors duration-200 ${
                      state.activeTab === 'security'
                        ? 'bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-400'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    aria-current={state.activeTab === 'security' ? 'page' : undefined}
                  >
                    <ShieldCheckIcon className="h-4 w-4 mr-2" />
                    Security
                  </button>
                </nav>
              </div>
            </div>

            <div className="flex-1">
              {state.activeTab === 'profile' && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                  <div className="mb-4">
                    <h2 className="text-[12px] font-bold text-gray-900 dark:text-white flex items-center">
                      <UserCircleIcon className="h-5 w-5 text-pink-500 mr-2" />
                      Profile Information
                    </h2>
                    <p className="mt-1 text-[12px] text-gray-500 dark:text-gray-400">
                      Update your basic profile details
                    </p>
                  </div>
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-[12px] font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Full Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={state.name}
                        onChange={(e) => updateState({ name: e.target.value })}
                        className="w-full px-3 py-2 text-[12px] border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-300"
                        required
                        disabled={state.formLoading}
                        aria-label="Full Name"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-[12px] font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <EnvelopeIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        </div>
                        <input
                          id="email"
                          type="email"
                          value={state.email}
                          onChange={(e) => updateState({ email: e.target.value })}
                          className="w-full pl-10 pr-3 py-2 text-[12px] border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-300"
                          required
                          disabled={state.formLoading}
                          aria-label="Email Address"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={state.formLoading}
                        className={`inline-flex items-center px-4 py-2 text-[12px] font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-200 ${
                          state.formLoading ? 'bg-pink-400 cursor-not-allowed' : 'bg-pink-600 hover:bg-pink-700'
                        }`}
                        aria-label="Update Profile"
                      >
                        {state.formLoading ? (
                          <div className="flex items-center">
                            <ApiLoader size="small" />
                            <span className="ml-2">Saving...</span>
                          </div>
                        ) : (
                          'Save Changes'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {state.activeTab === 'security' && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                  <div className="mb-4">
                    <h2 className="text-[12px] font-bold text-gray-900 dark:text-white flex items-center">
                      <ShieldCheckIcon className="h-5 w-5 text-pink-500 mr-2" />
                      Security Settings
                    </h2>
                    <p className="mt-1 text-[12px] text-gray-500 dark:text-gray-400">
                      Manage your password and account security
                    </p>
                  </div>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <label
                        htmlFor="current-password"
                        className="block text-[12px] font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          id="current-password"
                          type={state.showCurrentPassword ? 'text' : 'password'}
                          value={state.currentPassword}
                          onChange={(e) => updateState({ currentPassword: e.target.value })}
                          className="w-full px-3 py-2 text-[12px] border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-300"
                          required
                          disabled={state.formLoading}
                          aria-label="Current Password"
                        />
                        <button
                          type="button"
                          onClick={() => updateState({ showCurrentPassword: !state.showCurrentPassword })}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          aria-label={state.showCurrentPassword ? 'Hide current password' : 'Show current password'}
                        >
                          {state.showCurrentPassword ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="new-password"
                        className="block text-[12px] font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          id="new-password"
                          type={state.showNewPassword ? 'text' : 'password'}
                          value={state.newPassword}
                          onChange={(e) => updateState({ newPassword: e.target.value })}
                          className="w-full px-3 py-2 text-[12px] border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-300"
                          required
                          disabled={state.formLoading}
                          aria-label="New Password"
                        />
                        <button
                          type="button"
                          onClick={() => updateState({ showNewPassword: !state.showNewPassword })}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          aria-label={state.showNewPassword ? 'Hide new password' : 'Show new password'}
                        >
                          {state.showNewPassword ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                        </button>
                      </div>
                      {passwordStrengthMeter()}
                    </div>
                    <div>
                      <label
                        htmlFor="confirm-password"
                        className="block text-[12px] font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          id="confirm-password"
                          type={state.showConfirmPassword ? 'text' : 'password'}
                          value={state.confirmPassword}
                          onChange={(e) => updateState({ confirmPassword: e.target.value })}
                          className="w-full px-3 py-2 text-[12px] border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-300"
                          required
                          disabled={state.formLoading}
                          aria-label="Confirm New Password"
                        />
                        <button
                          type="button"
                          onClick={() => updateState({ showConfirmPassword: !state.showConfirmPassword })}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          aria-label={state.showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                        >
                          {state.showConfirmPassword ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={state.formLoading}
                        className={`inline-flex items-center px-4 py-2 text-[12px] font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-200 ${
                          state.formLoading ? 'bg-pink-400 cursor-not-allowed' : 'bg-pink-600 hover:bg-pink-700'
                        }`}
                        aria-label="Change Password"
                      >
                        {state.formLoading ? (
                          <div className="flex items-center">
                            <ApiLoader size="small" />
                            <span className="ml-2">Updating...</span>
                          </div>
                        ) : (
                          'Update Password'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-center">
            <p className="text-[12px] text-gray-500 dark:text-gray-300">
              No profile data available. We couldn't retrieve your profile information.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Setting;
