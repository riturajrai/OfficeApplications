
import { useState, useEffect, useCallback, useMemo, memo, Component } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  UserIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  FunnelIcon,
  ChatBubbleLeftIcon,
} from '@heroicons/react/24/outline';
import { Dialog } from '@headlessui/react';
import { saveAs } from 'file-saver';
import { format, parseISO } from 'date-fns';
import ApiLoader from '../Loader/ApiLoader';
import noSubmissionFound from '../assets/vecteezy_no-results-found-or-missing-search-result-concept-flat_67565900.jpg';

// Error Boundary Component
class ErrorBoundary extends Component {
  state = { hasError: false, errorMessage: '' };

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Dashboard Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-full sm:max-w-4xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <ExclamationCircleIcon className="h-8 w-8 text-red-500 dark:text-red-400 mx-auto mb-3" />
            <h2 className="text-[12px] font-semibold text-gray-900 dark:text-white">Something Went Wrong</h2>
            <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-2">{this.state.errorMessage}</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Tooltip Component
const TooltipComponent = ({ children, text, position = 'bottom' }) => {
  const positionClasses = {
    bottom: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    top: 'top-full mt-2 left-1/2 -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 -translate-y-1/2',
  };

  return (
    <div className="relative group inline-block">
      {children}
      <span
        className={`absolute ${positionClasses[position]} hidden group-hover:block px-2 py-1 text-[12px] text-white bg-gray-800 dark:bg-gray-700 rounded-md shadow-lg transition-opacity duration-200 opacity-0 group-hover:opacity-100 z-50 whitespace-nowrap`}
      >
        {text}
      </span>
    </div>
  );
};

// Status Badge Component (Memoized)
const StatusBadge = memo(({ status }) => {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
    shortlisted: 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
    reviewed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
    approved: 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300',
    on_hold: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  };

  const colorClass = statusColors[status?.toLowerCase()] || statusColors.default;

  return (
    <span className={`px-2 py-0.5 text-[12px] font-medium rounded-full ${colorClass}`}>
      {status || 'Unknown'}
    </span>
  );
});

// Submission Item Component (Memoized)
const SubmissionItem = memo(({ submission }) => (
  <div className="px-4 py-3 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0 bg-pink-100 dark:bg-pink-900/20 p-1.5 rounded-full">
          <UserIcon className="h-4 w-4 text-pink-600 dark:text-pink-400" />
        </div>
        <div className="text-left">
          <h4 className="text-[12px] font-semibold text-gray-900 dark:text-white">
            {submission.name || 'Unknown Name'}
          </h4>
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mt-1 text-[12px] text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <EnvelopeIcon className="h-4 w-4 mr-1" />
              <span>{submission.email || 'No email'}</span>
            </div>
            <div className="flex items-center">
              <BuildingOfficeIcon className="h-4 w-4 mr-1" />
              <span>{submission.department_name || 'No department'}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="text-right">
        <p className="text-[12px] text-gray-500 dark:text-gray-400">
          {submission.created_at
            ? format(parseISO(submission.created_at), 'MMM d, yyyy')
            : 'Unknown date'}
        </p>
        <StatusBadge status={submission.status} />
      </div>
    </div>
  </div>
));

function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    counter: 0,
    todayCount: 0,
    submissions: [],
    stats: {
      pending: 0,
      shortlisted: 0,
      rejected: 0,
      reviewed: 0,
      approved: 0,
      on_hold: 0,
    },
    totalPages: 1,
    currentPage: 1,
    lastUpdate: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [isContactOpen, setIsContactOpen] = useState(false);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const POLLING_INTERVAL = 30000;

  // Handle logout state clearing
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token' && !e.newValue) {
        setDashboardData({
          counter: 0,
          todayCount: 0,
          submissions: [],
          stats: { pending: 0, shortlisted: 0, rejected: 0, reviewed: 0, approved: 0, on_hold: 0 },
          totalPages: 1,
          currentPage: 1,
          lastUpdate: null,
        });
        setError(null);
        setFilterStatus('');
        setFilterDepartment('');
        setDateRange({ startDate: '', endDate: '' });
        navigate('/login');
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [navigate]);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError(
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-center">
          <ExclamationCircleIcon className="h-8 w-8 text-red-500 dark:text-red-400 mx-auto mb-3" />
          <h3 className="text-[12px] font-semibold text-gray-900 dark:text-white">Authentication Required</h3>
          <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-2">
            Please sign in to access the dashboard.
          </p>
        </div>
      );
      setTimeout(() => navigate('/login'), 2000);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const headers = { Authorization: `Bearer ${token}` };
      const params = {
        ...(filterStatus && { status: filterStatus }),
        ...(filterDepartment && { department: filterDepartment }),
        ...(dateRange.startDate && dateRange.endDate && {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        }),
        page: dashboardData.currentPage,
        limit: 5,
        sortBy: 'created_at',
        order: 'DESC',
      };

      const [counterRes, todayRes, submissionsRes] = await Promise.all([
        axios.get(`${API_URL}/submission/counter`, { headers }).catch(() => ({ data: { total: 0, lastSubmissionDate: null } })),
        axios.get(`${API_URL}/submission/today`, { headers }).catch(() => ({ data: { todayTotal: 0 } })),
        axios.get(`${API_URL}/submission/list`, { headers, params }).catch(() => ({
          data: { submissions: [], total: 0, limit: 5, page: 1 },
        })),
      ]);

      const stats = {
        pending: 0,
        shortlisted: 0,
        rejected: 0,
        reviewed: 0,
        approved: 0,
        on_hold: 0,
      };

      (submissionsRes.data.submissions || []).forEach((sub) => {
        if (sub.status && stats.hasOwnProperty(sub.status.toLowerCase())) {
          stats[sub.status.toLowerCase()]++;
        }
      });

      const newData = {
        counter: counterRes.data?.total || 0,
        todayCount: counterRes.data?.todayTotal || todayRes.data?.todayTotal || 0,
        submissions: submissionsRes.data?.submissions || [],
        stats,
        totalPages: Math.ceil((submissionsRes.data?.total || 0) / (submissionsRes.data?.limit || 5)) || 1,
        currentPage: submissionsRes.data?.page || 1,
        lastUpdate: new Date().toISOString(),
      };

      setDashboardData(newData);
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      let errorMessage = (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-center">
          <ExclamationCircleIcon className="h-8 w-8 text-red-500 dark:text-red-400 mx-auto mb-3" />
          <h3 className="text-[12px] font-semibold text-gray-900 dark:text-white">Failed to Load Dashboard</h3>
          <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-2">
            {err.response?.status === 400
              ? `Invalid request parameters: ${err.response.data.errors?.map((e) => e.msg).join(', ') || 'Check your filters.'}`
              : err.response?.status === 401 || err.response?.status === 403
              ? 'Your session has expired. Redirecting to login...'
              : err.message || 'Unable to load dashboard data.'}
          </p>
        </div>
      );

      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('token');
        setTimeout(() => navigate('/login'), 2000);
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [API_URL, navigate, filterStatus, filterDepartment, dateRange.startDate, dateRange.endDate, dashboardData.currentPage]);

  // Polling for updates
  useEffect(() => {
    fetchDashboardData();
    const pollingInterval = setInterval(fetchDashboardData, POLLING_INTERVAL);
    return () => clearInterval(pollingInterval);
  }, [fetchDashboardData]);

  const exportToCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Date', 'Status', 'Designation', 'Department', 'Application Type'];
    const csvContent = [
      headers.join(','),
      ...dashboardData.submissions.map((sub) =>
        [
          sub.id || '',
          sub.name || 'Unknown',
          sub.email || 'No email',
          sub.created_at ? format(parseISO(sub.created_at), 'yyyy-MM-dd') : 'Unknown date',
          sub.status || 'Unknown',
          sub.designation || 'No designation',
          sub.department_name || 'No department',
          sub.application_type || 'No type',
        ]
          .map((field) => `"${String(field).replace(/"/g, '""')}"`)
          .join(',')
      ),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `submissions_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      email: formData.get('contact-email') || null,
      message: formData.get('contact-message'),
      type: 'support',
    };

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }
      await axios.post(`${API_URL}/contact`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsContactOpen(false);
    } catch (err) {
      setError(
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-center">
          <ExclamationCircleIcon className="h-8 w-8 text-red-500 dark:text-red-400 mx-auto mb-3" />
          <h3 className="text-[12px] font-semibold text-gray-900 dark:text-white">Failed to Send Message</h3>
          <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-2">
            {err.response?.data?.message || err.message}
          </p>
        </div>
      );
    }
  };

  // Calculate completion rate
  const completionRate = dashboardData.submissions.length > 0
    ? Math.round(
        ((dashboardData.stats.reviewed + dashboardData.stats.approved) / dashboardData.submissions.length) * 100
      )
    : 0;

  // Calculate average daily submissions
  const avgDailySubmissions = dashboardData.counter > 0 ? Math.round(dashboardData.counter / 30) : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <ApiLoader />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-6 sm:px-6 lg:px-8 font-roboto text-[12px] antialiased">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6 border border-gray-200 dark:border-gray-700">
          <div className="max-w-full sm:max-w-4xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center">
            <h1 className="text-[12px] font-bold text-gray-900 dark:text-white text-center sm:text-left">Submission Dashboard</h1>
            <div className="flex flex-wrap items-center justify-center sm:justify-end space-x-3 mt-3 sm:mt-0">
              <TooltipComponent text="Export submissions to CSV" position="bottom">
                <button
                  onClick={exportToCSV}
                  className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 text-[12px] font-medium transition-all duration-200 flex items-center"
                  aria-label="Export submissions to CSV"
                >
                  Export CSV
                </button>
              </TooltipComponent>
              <TooltipComponent text="Contact support" position="bottom">
                <button
                  onClick={() => setIsContactOpen(true)}
                  className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 text-[12px] font-medium transition-all duration-200 flex items-center"
                  aria-label="Open contact dialog"
                >
                  <ChatBubbleLeftIcon className="w-4 h-4 mr-1" />
                  Contact
                </button>
              </TooltipComponent>
            </div>
          </div>
        </header>

        {/* Contact Dialog */}
        <Dialog open={isContactOpen} onClose={() => setIsContactOpen(false)} className="relative z-50">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <Dialog.Title className="text-[12px] font-bold text-gray-900 dark:text-white mb-4 text-center">
                Contact Support
              </Dialog.Title>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-[12px] font-medium text-gray-700 dark:text-gray-300 text-left"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="contact-email"
                    name="contact-email"
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-[12px] text-gray-900 dark:text-white focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                    placeholder="your.email@example.com"
                    required
                    aria-label="Contact email"
                  />
                </div>
                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-[12px] font-medium text-gray-700 dark:text-gray-300 text-left"
                  >
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    name="contact-message"
                    rows={4}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-[12px] text-gray-900 dark:text-white focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                    placeholder="Describe your issue or feedback..."
                    required
                    aria-label="Contact message"
                  ></textarea>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsContactOpen(false)}
                    className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-[12px] font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
                    aria-label="Cancel"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-2 bg-pink-600 text-white rounded-md text-[12px] font-medium hover:bg-pink-700 transition-all duration-200"
                    aria-label="Send message"
                  >
                    Send
                  </button>
                </div>
              </form>
            </Dialog.Panel>
          </div>
        </Dialog>

        {/* Main Content */}
        <main className="max-w-full sm:max-w-4xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto">
          {error ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 animate-fade-in">
              {error}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700">
                  <div className="px-4 py-4 sm:p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-pink-600 rounded-md p-1.5">
                        <DocumentTextIcon className="h-5 w-5 text-white" />
                      </div>
                      <div className="ml-3 flex-1">
                        <dt className="text-[12px] font-medium text-gray-500 dark:text-gray-400 text-left">Total Submissions</dt>
                        <dd className="flex items-baseline">
                          <TooltipComponent text="All-time form submissions">
                            <div className="text-[12px] font-bold text-gray-900 dark:text-white">
                              {dashboardData.counter.toLocaleString('en-IN')}
                            </div>
                          </TooltipComponent>
                        </dd>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-2 sm:px-5">
                    <Link
                      to="/form-submission"
                      className="text-[12px] font-medium text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 flex items-center"
                      aria-label="View all form submissions"
                    >
                      View all
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700">
                  <div className="px-4 py-4 sm:p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-green-600 rounded-md p-1.5">
                        <DocumentTextIcon className="h-5 w-5 text-white" />
                      </div>
                      <div className="ml-3 flex-1">
                        <dt className="text-[12px] font-medium text-gray-500 dark:text-gray-400 text-left">Today's Submissions</dt>
                        <dd className="flex items-baseline">
                          <TooltipComponent text="Submissions received today">
                            <div className="text-[12px] font-bold text-gray-900 dark:text-white">
                              {dashboardData.todayCount.toLocaleString('en-IN')}
                            </div>
                          </TooltipComponent>
                        </dd>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-2 sm:px-5">
                    <div className="text-[12px] text-gray-500 dark:text-gray-400 text-left">
                      {format(new Date(), 'MMMM d, yyyy')}
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700">
                  <div className="px-4 py-4 sm:p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-pink-600 rounded-md p-1.5">
                        <ClockIcon className="h-5 w-5 text-white" />
                      </div>
                      <div className="ml-3 flex-1">
                        <dt className="text-[12px] font-medium text-gray-500 dark:text-gray-400 text-left">Avg Daily (30d)</dt>
                        <dd className="flex items-baseline">
                          <TooltipComponent text="Average submissions per day">
                            <div className="text-[12px] font-bold text-gray-900 dark:text-white">
                              {avgDailySubmissions.toLocaleString('en-IN')}
                            </div>
                          </TooltipComponent>
                        </dd>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-2 sm:px-5">
                    <div className="text-[12px] text-gray-500 dark:text-gray-400 text-left">Last 30 days average</div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700">
                  <div className="px-4 py-4 sm:p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-pink-600 rounded-md p-1.5">
                        <CheckCircleIcon className="h-5 w-5 text-white" />
                      </div>
                      <div className="ml-3 flex-1">
                        <dt className="text-[12px] font-medium text-gray-500 dark:text-gray-400 text-left">Completion Rate</dt>
                        <dd className="flex items-baseline">
                          <TooltipComponent text="Percentage of reviewed/approved submissions">
                            <div className="text-[12px] font-bold text-gray-900 dark:text-white">
                              {completionRate}%
                            </div>
                          </TooltipComponent>
                        </dd>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-2 sm:px-5">
                    <div className="text-[12px] text-gray-500 dark:text-gray-400 text-left">
                      {dashboardData.stats.reviewed + dashboardData.stats.approved} of {dashboardData.submissions.length} completed
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Distribution */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4 sm:p-5">
                <h3 className="text-[12px] font-bold text-gray-900 dark:text-white mb-3 text-left">Status Distribution</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md border border-yellow-200 dark:border-yellow-700/20">
                    <div className="flex items-center">
                      <div className="bg-yellow-100 dark:bg-yellow-900/30 p-1 rounded-full mr-2">
                        <ClockIcon className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-[12px] text-gray-500 dark:text-gray-400 text-left">Pending</p>
                        <p className="text-[12px] font-semibold text-gray-900 dark:text-white">
                          {dashboardData.stats.pending}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-pink-50 dark:bg-pink-900/20 p-3 rounded-md border border-pink-200 dark:border-pink-700/20">
                    <div className="flex items-center">
                      <div className="bg-pink-100 dark:bg-pink-900/30 p-1 rounded-full mr-2">
                        <BuildingOfficeIcon className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                      </div>
                      <div>
                        <p className="text-[12px] text-gray-500 dark:text-gray-400 text-left">Shortlisted</p>
                        <p className="text-[12px] font-semibold text-gray-900 dark:text-white">
                          {dashboardData.stats.shortlisted}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-200 dark:border-red-700/20">
                    <div className="flex items-center">
                      <div className="bg-red-100 dark:bg-red-900/30 p-1 rounded-full mr-2">
                        <ExclamationCircleIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <p className="text-[12px] text-gray-500 dark:text-gray-400 text-left">Rejected</p>
                        <p className="text-[12px] font-semibold text-gray-900 dark:text-white">
                          {dashboardData.stats.rejected}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md border border-green-200 dark:border-green-700/20">
                    <div className="flex items-center">
                      <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full mr-2">
                        <CheckCircleIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-[12px] text-gray-500 dark:text-gray-400 text-left">Reviewed</p>
                        <p className="text-[12px] font-semibold text-gray-900 dark:text-white">
                          {dashboardData.stats.reviewed}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-pink-50 dark:bg-pink-900/20 p-3 rounded-md border border-pink-200 dark:border-pink-700/20">
                    <div className="flex items-center">
                      <div className="bg-pink-100 dark:bg-pink-900/30 p-1 rounded-full mr-2">
                        <CheckCircleIcon className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                      </div>
                      <div>
                        <p className="text-[12px] text-gray-500 dark:text-gray-400 text-left">Approved</p>
                        <p className="text-[12px] font-semibold text-gray-900 dark:text-white">
                          {dashboardData.stats.approved}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-md border border-orange-200 dark:border-orange-700/20">
                    <div className="flex items-center">
                      <div className="bg-orange-100 dark:bg-orange-900/30 p-1 rounded-full mr-2">
                        <ClockIcon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <p className="text-[12px] text-gray-500 dark:text-gray-400 text-left">On Hold</p>
                        <p className="text-[12px] font-semibold text-gray-900 dark:text-white">
                          {dashboardData.stats.on_hold}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Submissions with Filters and Pagination */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-4 py-3 sm:px-5 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 sm:space-x-3">
                    <h3 className="text-[12px] font-bold text-gray-900 dark:text-white text-left">Recent Submissions</h3>
                    <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                      <div className="flex items-center space-x-2 w-full sm:w-auto">
                        <FunnelIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" aria-hidden="true" />
                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md px-2 py-1.5 text-[12px] focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-200 w-full"
                          aria-label="Filter by status"
                        >
                          <option value="">All Statuses</option>
                          <option value="pending">Pending</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="rejected">Rejected</option>
                          <option value="reviewed">Reviewed</option>
                          <option value="approved">Approved</option>
                          <option value="on_hold">On Hold</option>
                        </select>
                      </div>
                      <div className="flex items-center space-x-2 w-full sm:w-auto">
                        <input
                          type="text"
                          value={filterDepartment}
                          onChange={(e) => setFilterDepartment(e.target.value)}
                          placeholder="Filter by department"
                          className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md px-2 py-1.5 text-[12px] focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-200 w-full"
                          aria-label="Filter by department"
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                        <input
                          type="date"
                          value={dateRange.startDate}
                          onChange={(e) => setDateRange((prev) => ({ ...prev, startDate: e.target.value }))}
                          className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md px-2 py-1.5 text-[12px] focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-200 w-full"
                          aria-label="Start date"
                        />
                        <input
                          type="date"
                          value={dateRange.endDate}
                          onChange={(e) => setDateRange((prev) => ({ ...prev, endDate: e.target.value }))}
                          className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md px-2 py-1.5 text-[12px] focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-200 w-full"
                          aria-label="End date"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {dashboardData.submissions.length > 0 ? (
                    dashboardData.submissions.map((submission) => (
                      <SubmissionItem key={submission.id} submission={submission} />
                    ))
                  ) : (
                    <div className="px-4 py-8 sm:px-5 text-center">
                      <img
                        src={noSubmissionFound}
                        alt="No submissions found"
                        className="w-20 sm:w-24 mx-auto mb-3 opacity-80"
                      />
                      <p className="text-[12px] text-gray-500 dark:text-gray-400">
                        No recent submissions found. Start by creating a new submission.
                      </p>
                    </div>
                  )}
                </div>
                {dashboardData.submissions.length > 0 && (
                  <div className="flex flex-col sm:flex-row justify-between items-center px-4 py-3 sm:px-5 space-y-2 sm:space-y-0">
                    <button
                      onClick={() =>
                        setDashboardData((prev) => ({
                          ...prev,
                          currentPage: Math.max(prev.currentPage - 1, 1),
                        }))
                      }
                      disabled={dashboardData.currentPage === 1}
                      className="px-3 py-2 bg-pink-600 text-white rounded-md disabled:bg-gray-300 dark:disabled:bg-gray-600 hover:bg-pink-700 text-[12px] font-medium transition-all duration-200 w-full sm:w-auto"
                      aria-label="Previous page"
                    >
                      Previous
                    </button>
                    <span className="text-[12px] text-gray-500 dark:text-gray-400">
                      Page {dashboardData.currentPage} of {dashboardData.totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setDashboardData((prev) => ({
                          ...prev,
                          currentPage: Math.min(prev.currentPage + 1, prev.totalPages),
                        }))
                      }
                      disabled={dashboardData.currentPage === dashboardData.totalPages}
                      className="px-3 py-2 bg-pink-600 text-white rounded-md disabled:bg-gray-300 dark:disabled:bg-gray-600 hover:bg-pink-700 text-[12px] font-medium transition-all duration-200 w-full sm:w-auto"
                      aria-label="Next page"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default Dashboard;
