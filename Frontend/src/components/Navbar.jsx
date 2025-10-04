import { useContext, useEffect, useState, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from './AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import {
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  HomeIcon,
  ChevronDownIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  BellIcon,
  QrCodeIcon,
  BriefcaseIcon,
  BuildingOffice2Icon,
  InformationCircleIcon,
  ArrowLeftOnRectangleIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  TrashIcon,
  PhoneIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { NotificationMessageContext } from '../Contex/NotificationMessage';
import { CartContext } from '../Contex/NotificationConterContex';
import InfiniteScroll from 'react-infinite-scroll-component';
import { format, isValid } from 'date-fns';

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { NotificationCount, fetchNotificationCounter } = useContext(CartContext);
  const {
    notifications,
    fetchNotifications,
    updateNotificationStatus,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    loadMoreNotifications,
    hasMore,
    loading,
  } = useContext(NotificationMessageContext);

  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [managementMenuOpen, setManagementMenuOpen] = useState(false);
  const [mobileManagementOpen, setMobileManagementOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const userMenuRef = useRef(null);
  const managementMenuRef = useRef(null);
  const notificationsMenuRef = useRef(null);

  // Role checks
  const isAdmin = user?.role === 'admin' || user?.role === 'SuperAdmin';
  const isMember = user?.role === 'member';

  // Navigation config
  const navConfig = {
    public: [
      { name: 'Home', path: '/', icon: HomeIcon },
      { name: 'How It Works', path: '/usage', icon: InformationCircleIcon },
      { name: 'About Us', path: '/about', icon: BuildingOffice2Icon },
      { name: 'Get Started', path: '/get-started', icon: QrCodeIcon },
      { name: 'Sign In', path: '/login', icon: ArrowLeftOnRectangleIcon },
      { name: 'Register', path: '/signup', icon: ArrowRightOnRectangleIcon },
    ],
    admin: [
      { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
      { name: 'Generate QR', path: '/qrgenerator', icon: QrCodeIcon },
      { name: 'Visitor Records', path: '/form-submission', icon: DocumentTextIcon },
    ],
    member: [
      { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
      { name: 'Visitor Records', path: '/form-submission', icon: DocumentTextIcon },
    ],
    management: [
      { name: 'Designation', path: '/designation', icon: BriefcaseIcon },
      { name: 'Departments', path: '/department', icon: BuildingOffice2Icon },
      { name: 'Geo Office Locations', path: '/location-list', icon: BuildingOffice2Icon },
      { name: 'Visitor Application Types', path: '/application-list', icon: DocumentTextIcon },
      { name: 'Create Member', path: '/members', icon: UserCircleIcon },
      { name: 'Status', path: '/status', icon: UserCircleIcon },
    ],
    userMenu: [
      { name: 'Profile', path: '/profile', icon: UserCircleIcon },
      { name: 'Settings', path: '/settings', icon: Cog6ToothIcon },
      { name: 'Sign Out', action: 'logout', icon: ArrowRightOnRectangleIcon },
    ],
  };

  const navItems = user ? (isAdmin ? navConfig.admin : navConfig.member) : navConfig.public;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      toast.success('Signed out successfully', {
        icon: <CheckCircleIcon className="h-5 w-5 text-green-600" />,
        style: { background: '#ffffff', color: '#1e293b', padding: '12px', borderRadius: '8px' },
        duration: 3000,
      });
    } catch (err) {
      console.error('Logout error:', err);
      toast.error('Failed to sign out', {
        icon: <XCircleIcon className="h-5 w-5 text-red-600" />,
        style: { background: '#ffffff', color: '#1e293b', padding: '12px', borderRadius: '8px' },
        duration: 3000,
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      await fetchNotificationCounter();
      toast.success('All notifications marked as read', {
        icon: <CheckCircleIcon className="h-5 w-5 text-green-600" />,
        style: { background: '#ffffff', color: '#1e293b', padding: '12px', borderRadius: '8px' },
        duration: 3000,
      });
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      toast.error('Failed to mark all as read', {
        icon: <XCircleIcon className="h-5 w-5 text-red-600" />,
        style: { background: '#ffffff', color: '#1e293b', padding: '12px', borderRadius: '8px' },
        duration: 3000,
      });
    }
  };

  const handleDeleteAllNotifications = async () => {
    if (notifications.length === 0) return;
    if (!confirm('Are you sure you want to delete all notifications? This action cannot be undone.')) return;
    try {
      await deleteAllNotifications();
      await fetchNotificationCounter();
      toast.success('All notifications deleted', {
        icon: <CheckCircleIcon className="h-5 w-5 text-green-600" />,
        style: { background: '#ffffff', color: '#1e293b', padding: '12px', borderRadius: '8px' },
        duration: 3000,
      });
    } catch (err) {
      console.error('Error deleting all notifications:', err);
      toast.error('Failed to delete all notifications', {
        icon: <XCircleIcon className="h-5 w-5 text-red-600" />,
        style: { background: '#ffffff', color: '#1e293b', padding: '12px', borderRadius: '8px' },
        duration: 3000,
      });
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    if (!confirm('Are you sure you want to delete this notification? This action cannot be undone.')) return;
    try {
      await deleteNotification(notificationId);
      await fetchNotificationCounter();
      toast.success('Notification deleted', {
        icon: <CheckCircleIcon className="h-5 w-5 text-green-600" />,
        style: { background: '#ffffff', color: '#1e293b', padding: '12px', borderRadius: '8px' },
        duration: 2000,
      });
    } catch (err) {
      console.error('Error deleting notification:', err);
      toast.error('Failed to delete notification', {
        icon: <XCircleIcon className="h-5 w-5 text-red-600" />,
        style: { background: '#ffffff', color: '#1e293b', padding: '12px', borderRadius: '8px' },
        duration: 3000,
      });
    }
  };

  const toggleMenu = useCallback(
    (menu) => {
      if (menu === 'management') setManagementMenuOpen((prev) => !prev);
      else setManagementMenuOpen(false);
      if (menu === 'user') setUserMenuOpen((prev) => !prev);
      else setUserMenuOpen(false);
      if (menu === 'notifications') {
        setNotificationsOpen((prev) => !prev);
        if (!notifications.length && !loading) {
          fetchNotifications(1).catch((err) => {
            console.error('Error fetching notifications:', err);
            toast.error('Failed to load notifications', {
              icon: <XCircleIcon className="h-5 w-5 text-red-600" />,
              style: { background: '#ffffff', color: '#1e293b', padding: '12px', borderRadius: '8px' },
              duration: 3000,
            });
          });
        }
      } else {
        setNotificationsOpen(false);
      }
    },
    [notifications.length, loading, fetchNotifications]
  );

  useEffect(() => {
    if (user) {
      fetchNotificationCounter().catch((err) => {
        console.error('Error fetching notification counter:', err);
        toast.error('Failed to fetch notification count', {
          icon: <XCircleIcon className="h-5 w-5 text-red-600" />,
          style: { background: '#ffffff', color: '#1e293b', padding: '12px', borderRadius: '8px' },
          duration: 3000,
        });
      });
    }
  }, [user, fetchNotificationCounter]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        userMenuRef.current && !userMenuRef.current.contains(event.target) &&
        managementMenuRef.current && !managementMenuRef.current.contains(event.target) &&
        notificationsMenuRef.current && !notificationsMenuRef.current.contains(event.target)
      ) {
        setManagementMenuOpen(false);
        setUserMenuOpen(false);
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) {
      setMobileManagementOpen(false);
    }
  }, [mobileMenuOpen]);

  const handleNotificationClick = async (notification) => {
    if (notification.status !== 'read') {
      try {
        await updateNotificationStatus(notification.id);
        await fetchNotificationCounter();
      } catch (err) {
        console.error('Error updating notification status:', err);
        toast.error('Failed to update notification', {
          icon: <XCircleIcon className="h-5 w-5 text-red-600" />,
          style: { background: '#ffffff', color: '#1e293b', padding: '12px', borderRadius: '8px' },
          duration: 3000,
        });
      }
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      setNotificationsOpen(false);
    } else {
      // If no action, just close or mark as read
      setNotificationsOpen(false);
    }
  };

  const NotificationItem = ({ notification }) => (
    <div className="relative group">
      <button
        onClick={() => handleNotificationClick(notification)}
        className={`w-full text-left p-4 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200 rounded-lg ${
          notification.status === 'read' ? 'opacity-60' : 'bg-blue-50 dark:bg-blue-900/20'
        }`}
        aria-label={`Notification: ${notification.message}`}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 mt-2.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
              {notification.message}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {formatDate(notification.created_at)}
            </p>
          </div>
          {notification.type && (
            <span className="flex-shrink-0 px-2 py-1 text-xs font-semibold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {notification.type}
            </span>
          )}
        </div>
      </button>
      <button
        onClick={() => handleDeleteNotification(notification.id)}
        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition-all duration-200 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500"
        aria-label="Delete notification"
      >
        <TrashIcon className="w-4 h-4" />
      </button>
    </div>
  );

  const formatDate = (date) => {
    const parsedDate = new Date(date);
    return isValid(parsedDate) ? format(parsedDate, 'MMM dd, yyyy • h:mm a') : 'Unknown date';
  };

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    const names = user.name.split(' ').filter(Boolean);
    return names.length > 1
      ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
      : names[0][0].toUpperCase();
  };

  const NotificationSkeleton = () => (
    <div className="p-4 border-b border-slate-100 dark:border-slate-700 animate-pulse">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 w-2 h-2 bg-slate-200 dark:bg-slate-600 rounded-full mt-2.5" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded w-3/4" />
          <div className="h-3 bg-slate-200 dark:bg-slate-600 rounded w-1/2" />
        </div>
      </div>
    </div>
  );

  return (
    <nav className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-300 shadow-sm sticky top-0 z-50 transition-all duration-300 font-[Inter]">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            fontSize: '14px',
            background: '#ffffff',
            color: '#1e293b',
            padding: '12px 16px',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e5e7eb',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link
              to={user ? '/dashboard' : '/'}
              className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors duration-200 tracking-tight"
              aria-label="QRVibe Home"
            >
              QRVibe
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="group flex items-center px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200"
                aria-label={item.name}
              >
                <item.icon className="w-4 h-4 mr-2 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                {item.name}
              </Link>
            ))}
            <button
              onClick={() => navigate('/demo')}
              className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 hover:from-indigo-700 hover:via-indigo-700 hover:to-purple-700 rounded-md transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              aria-label="Get a Demo"
            >
              <PhoneIcon className="w-4 h-4 mr-2" />
              Get a Demo
            </button>
            {user && isAdmin && (
              <div className="relative" ref={managementMenuRef}>
                <button
                  onClick={() => toggleMenu('management')}
                  className="flex items-center px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  aria-expanded={managementMenuOpen}
                  aria-controls="management-menu"
                  aria-label="Management menu"
                >
                  <BriefcaseIcon className="w-4 h-4 mr-2" />
                  Management
                  <ChevronDownIcon
                    className={`ml-1 w-3 h-3 transition-transform duration-200 ${managementMenuOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {managementMenuOpen && (
                  <div
                    id="management-menu"
                    className="absolute left-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200/80 dark:border-slate-700/80 z-50 overflow-hidden"
                  >
                    {navConfig.management.map((item) => (
                      <Link
                        key={item.name}
                        to={item.path}
                        className="flex items-center px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200"
                        onClick={() => setManagementMenuOpen(false)}
                        aria-label={item.name}
                      >
                        <item.icon className="w-4 h-4 mr-3 text-slate-400" />
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
            {user && (
              <>
                <div className="relative" ref={notificationsMenuRef}>
                  <button
                    onClick={() => toggleMenu('notifications')}
                    className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    aria-expanded={notificationsOpen}
                    aria-controls="notifications-menu"
                    aria-label="Notifications"
                  >
                    <BellIcon className="w-5 h-5" />
                    {NotificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                        {NotificationCount > 99 ? '99+' : NotificationCount}
                      </span>
                    )}
                  </button>
                  {notificationsOpen && (
                    <div
                      id="notifications-menu"
                      className="absolute right-0 mt-2 w-96 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200/80 dark:border-slate-700/80 max-h-96 overflow-hidden z-50"
                    >
                      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Notifications</h3>
                        <div className="flex items-center space-x-2">
                          {notifications.length > 0 && (
                            <>
                              <button
                                onClick={handleMarkAllAsRead}
                                className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors"
                                aria-label="Mark all as read"
                              >
                                Mark All Read
                              </button>
                              <button
                                onClick={handleDeleteAllNotifications}
                                className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium transition-colors"
                                aria-label="Delete all notifications"
                              >
                                Delete All
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        <InfiniteScroll
                          dataLength={notifications.length}
                          next={loadMoreNotifications}
                          hasMore={hasMore}
                          loader={<NotificationSkeleton />}
                          height={320}
                          className="divide-y divide-slate-100 dark:divide-slate-700"
                        >
                          {notifications.length === 0 ? (
                            <div className="p-6 text-center">
                              <BellIcon className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                              <p className="text-sm text-slate-500 dark:text-slate-400">No notifications yet</p>
                            </div>
                          ) : (
                            notifications.map((notification) => (
                              <NotificationItem key={notification.id} notification={notification} />
                            ))
                          )}
                        </InfiniteScroll>
                      </div>
                    </div>
                  )}
                </div>
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => toggleMenu('user')}
                    className="flex items-center px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    aria-expanded={userMenuOpen}
                    aria-controls="user-menu"
                    aria-label="User menu"
                  >
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt="User avatar"
                        className="w-7 h-7 rounded-full mr-2 object-cover border-2 border-slate-200 dark:border-slate-600"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center mr-2 text-xs font-semibold">
                        {getUserInitials()}
                      </div>
                    )}
                    <span className="hidden sm:inline truncate max-w-[120px]">{user?.name || 'User'}</span>
                    <ChevronDownIcon
                      className={`ml-1 w-3 h-3 transition-transform duration-200 hidden sm:block ${userMenuOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {userMenuOpen && (
                    <div
                      id="user-menu"
                      className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200/80 dark:border-slate-700/80 z-50 overflow-hidden"
                    >
                      {navConfig.userMenu.slice(0, -1).map((item) => (
                        <button
                          key={item.name}
                          onClick={() => {
                            navigate(item.path);
                            setUserMenuOpen(false);
                          }}
                          className="flex items-center w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200"
                          aria-label={item.name}
                        >
                          <item.icon className="w-4 h-4 mr-3 text-slate-400" />
                          {item.name}
                        </button>
                      ))}
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 border-t border-slate-200 dark:border-slate-700"
                        aria-label="Sign Out"
                      >
                        <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3 text-slate-400" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => navigate('/demo')}
              className="flex items-center px-3 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 hover:from-indigo-700 hover:via-indigo-700 hover:to-purple-700 rounded-md transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              aria-label="Get a Demo"
            >
              <PhoneIcon className="w-4 h-4 mr-1" />
              Demo
            </button>
            {user && (
              <div className="relative" ref={notificationsMenuRef}>
                <button
                  onClick={() => toggleMenu('notifications')}
                  className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  aria-label="Notifications"
                >
                  <BellIcon className="w-5 h-5" />
                  {NotificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                      {NotificationCount > 99 ? '99+' : NotificationCount}
                    </span>
                  )}
                </button>
                {notificationsOpen && (
                  <div className="fixed inset-0 z-50 bg-black/50 dark:bg-black/60 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200/80 dark:border-slate-700/80 w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
                      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Notifications</h3>
                        <div className="flex items-center space-x-2">
                          {notifications.length > 0 && (
                            <>
                              <button
                                onClick={handleMarkAllAsRead}
                                className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors"
                                aria-label="Mark all as read"
                              >
                                Mark All
                              </button>
                              <button
                                onClick={handleDeleteAllNotifications}
                                className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium transition-colors"
                                aria-label="Delete all"
                              >
                                Delete All
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setNotificationsOpen(false)}
                            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors rounded"
                            aria-label="Close"
                          >
                            <XMarkIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto">
                        <InfiniteScroll
                          dataLength={notifications.length}
                          next={loadMoreNotifications}
                          hasMore={hasMore}
                          loader={<NotificationSkeleton />}
                          height={400}
                          className="divide-y divide-slate-100 dark:divide-slate-700"
                        >
                          {notifications.length === 0 ? (
                            <div className="p-6 text-center">
                              <BellIcon className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                              <p className="text-sm text-slate-500 dark:text-slate-400">No notifications yet</p>
                            </div>
                          ) : (
                            notifications.map((notification) => (
                              <NotificationItem key={notification.id} notification={notification} />
                            ))
                          )}
                        </InfiniteScroll>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-y-0 right-0 z-50 w-80 bg-white dark:bg-slate-900 shadow-2xl transform transition-transform duration-300 ease-in-out translate-x-0">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <Link
                to={user ? '/dashboard' : '/'}
                className="text-xl font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                QRVibe
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="flex items-center px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md transition-all duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              ))}
              {user && isAdmin && (
                <>
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-2">
                    <button
                      onClick={() => setMobileManagementOpen(!mobileManagementOpen)}
                      className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md transition-all duration-200"
                    >
                      <div className="flex items-center">
                        <BriefcaseIcon className="w-5 h-5 mr-3" />
                        Management
                      </div>
                      <ChevronDownIcon
                        className={`w-4 h-4 transition-transform duration-200 ${mobileManagementOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {mobileManagementOpen && (
                      <div className="pl-8 mt-2 space-y-1">
                        {navConfig.management.map((item) => (
                          <Link
                            key={item.name}
                            to={item.path}
                            className="block px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
              {user && (
                <div className="border-t border-slate-200 dark:border-slate-700 pt-2">
                  {navConfig.userMenu.slice(0, -1).map((item) => (
                    <button
                      key={item.name}
                      onClick={() => {
                        navigate(item.path);
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md transition-all duration-200"
                    >
                      <item.icon className="w-5 h-5 mr-3" />
                      {item.name}
                    </button>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all duration-200 mt-2"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes ring {
          0%, 100% { transform: rotate(0deg); }
          10%, 30%, 50%, 70%, 90% { transform: rotate(15deg); }
          20%, 40%, 60%, 80% { transform: rotate(-15deg); }
        }
      `}</style>
    </nav>
  );
}

export default Navbar;