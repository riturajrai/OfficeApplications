import { useContext, useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "./AuthContext";
import toast, { Toaster } from "react-hot-toast";
import {
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  HomeIcon,
  SunIcon,
  MoonIcon,
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
} from "@heroicons/react/24/outline";
import { NotificationMessageContext } from "../Contex/NotificationMessage";
import { CartContext } from "../Contex/NotificationConterContex";
import InfiniteScroll from "react-infinite-scroll-component";
import { format } from "date-fns";
function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { NotificationCount, fetchNotificationCounter } = useContext(CartContext);
  const {
    notifications,
    fetchNotifications,
    updateNotificationStatus,
    markAllAsRead,
    loadMoreNotifications,
    hasMore,
  } = useContext(NotificationMessageContext);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [featuresMenuOpen, setFeaturesMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Dark mode state with localStorage persistence
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode !== null ? JSON.parse(savedMode) : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply dark mode class to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // User role checks
  const isAdmin = user?.role === "admin" || user?.role === "SuperAdmin";
  const isMember = user?.role === "member";

  // Navigation items configuration
  const navConfig = {
    public: [
      { name: "Home", path: "/", icon: HomeIcon },
      { name: "How It Works", path: "/usage", icon: InformationCircleIcon },
      { name: "About", path: "/about", icon: BuildingOffice2Icon },
      { name: "Get Started", path: "/get-started", icon: QrCodeIcon },
      { name: "Login", path: "/login", icon: ArrowLeftOnRectangleIcon },
      { name: "Signup", path: "/signup", icon: ArrowRightOnRectangleIcon },
    ],
    admin: [
      { name: "Dashboard", path: "/dashboard", icon: HomeIcon },
      { name: "Create QR", path: "/qrgenerator", icon: QrCodeIcon },
      { name: "Applications", path: "/form-submission", icon: DocumentTextIcon },
    ],
    member: [
      { name: "Dashboard", path: "/dashboard", icon: HomeIcon },
      { name: "Applications", path: "/form-submission", icon: DocumentTextIcon },
    ],
    features: [
      { name: "Designation", path: "/designation", icon: BriefcaseIcon },
      { name: "Department", path: "/department", icon: BuildingOffice2Icon },
      { name: "Locations", path: "/location-list", icon: BuildingOffice2Icon },
      { name: "App Types", path: "/application-list", icon: DocumentTextIcon },
      { name: "Members", path: "/members", icon: UserCircleIcon },
    ],
  };

  // Current nav items based on user role
  const navItems = user ? (isAdmin ? navConfig.admin : navConfig.member) : navConfig.public;

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
      toast.success("Logged out successfully", {
        icon: <CheckCircleIcon className="h-4 w-4 text-green-500" />,
      });
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Failed to log out", {
        icon: <XCircleIcon className="h-4 w-4 text-red-500" />,
      });
    }
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  // Menu toggle handlers with mutual exclusion
  const toggleMenu = useCallback((menu) => {
    setFeaturesMenuOpen(menu === 'features');
    setUserMenuOpen(menu === 'user');
    setNotificationsOpen(menu === 'notifications');
    if (menu === 'notifications' && notifications.length === 0) {
      fetchNotifications(1);
    }
  }, [notifications.length, fetchNotifications]);

  // Fetch notifications counter when user changes
  useEffect(() => {
    if (user) fetchNotificationCounter();
  }, [user, fetchNotificationCounter]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest("[data-dropdown]")) {
        setFeaturesMenuOpen(false);
        setUserMenuOpen(false);
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mobile navigation handler
  const handleMobileNav = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-md sticky top-0 z-50 transition-colors duration-200 font-roboto text-[12px] antialiased">
      <Toaster
        position="top-right"
        toastOptions={{
          style: { fontSize: '12px' },
          success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
        }}
      />
      <div className="max-w-full sm:max-w-4xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => navigate(user ? "/dashboard" : "/")}
              className="flex-shrink-0 text-[12px] font-bold text-pink-600 dark:text-pink-400 hover:opacity-90 transition-opacity duration-200"
              aria-label="Go to home"
            >
              QRVibe
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="flex items-center px-3 py-2 rounded-md text-[12px] font-medium text-gray-900 dark:text-gray-100 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                aria-label={item.name}
              >
                <item.icon className="w-4 h-4 mr-1.5" />
                {item.name}
              </Link>
            ))}
            
            {user && (
              <>
                {/* Features Dropdown (Admin Only) */}
                {isAdmin && (
                  <div className="relative" data-dropdown>
                    <button
                      onClick={() => toggleMenu('features')}
                      className="flex items-center px-3 py-2 rounded-md text-[12px] font-medium text-gray-900 dark:text-gray-100 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                      aria-label="Features menu"
                    >
                      <BriefcaseIcon className="w-4 h-4 mr-1.5" />
                      Features
                      <ChevronDownIcon className={`ml-1 w-4 h-4 transition-transform ${featuresMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {featuresMenuOpen && (
                      <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                        {navConfig.features.map((item) => (
                          <Link
                            key={item.name}
                            to={item.path}
                            className="flex items-center px-3 py-2 text-[12px] text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                            onClick={() => setFeaturesMenuOpen(false)}
                            aria-label={item.name}
                          >
                            <item.icon className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Notifications */}
                <div className="relative" data-dropdown>
                  <button
                    onClick={() => toggleMenu('notifications')}
                    className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 relative transition-all duration-200"
                    aria-label="Notifications"
                  >
                    <BellIcon className="w-4 h-4 text-gray-900 dark:text-gray-100" />
                    {NotificationCount > 0 && (
                      <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-pink-500 text-white text-[10px] flex items-center justify-center">
                        {Math.min(NotificationCount, 9)}{NotificationCount > 9 ? '+' : ''}
                      </span>
                    )}
                  </button>
                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-[70vh] flex flex-col">
                      <div className="border-b border-gray-200 dark:border-gray-700 p-2 flex justify-between items-center">
                        <h3 className="text-[12px] font-semibold text-gray-900 dark:text-white">Notifications</h3>
                        <button
                          onClick={() => {
                            markAllAsRead();
                            fetchNotificationCounter();
                          }}
                          className="text-[12px] text-pink-600 dark:text-pink-400 hover:underline"
                          aria-label="Mark all notifications as read"
                        >
                          Mark All as Read
                        </button>
                      </div>
                      <div className="overflow-y-auto">
                        <InfiniteScroll
                          dataLength={notifications.length}
                          next={loadMoreNotifications}
                          hasMore={hasMore}
                          loader={
                            <div className="py-2 text-center text-[12px] text-gray-500 dark:text-gray-400 animate-pulse">
                              Loading...
                            </div>
                          }
                          scrollableTarget="notifications-scroll"
                        >
                          <div id="notifications-scroll">
                            {notifications.length > 0 ? (
                              notifications.map((msg) => (
                                <div
                                  key={msg.id}
                                  onClick={() => {
                                    updateNotificationStatus(msg.id);
                                    fetchNotificationCounter();
                                  }}
                                  className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-all duration-200"
                                  role="button"
                                  aria-label={`Notification: ${msg.type}`}
                                >
                                  <p className="text-[12px] text-gray-900 dark:text-white">
                                    <span className="font-medium">{msg.type}: </span>
                                    {msg.message}
                                  </p>
                                  <p className="text-[10px] mt-1 text-gray-500 dark:text-gray-400">
                                    {msg.status} • {format(new Date(msg.created_at), "MMM d, HH:mm")}
                                  </p>
                                </div>
                              ))
                            ) : (
                              <p className="p-3 text-[12px] text-gray-500 dark:text-gray-400 text-center">
                                No notifications
                              </p>
                            )}
                          </div>
                        </InfiniteScroll>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Menu */}
                <div className="relative" data-dropdown>
                  <button
                    onClick={() => toggleMenu('user')}
                    className="flex items-center space-x-1 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                    aria-label="User menu"
                  >
                    <div className="w-6 h-6 rounded-full bg-pink-100 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
                      {user.avatar ? (
                        <img src={user.avatar} alt="User avatar" className="w-full h-full object-cover" />
                      ) : (
                        <UserCircleIcon className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                      )}
                    </div>
                    <ChevronDownIcon className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                      <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-[12px] font-medium text-gray-900 dark:text-white truncate">{user.name || "User"}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        className="flex items-center px-3 py-2 text-[12px] text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                        onClick={() => setUserMenuOpen(false)}
                        aria-label="Profile"
                      >
                        <UserCircleIcon className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                        Profile
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center px-3 py-2 text-[12px] text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                        onClick={() => setUserMenuOpen(false)}
                        aria-label="Settings"
                      >
                        <Cog6ToothIcon className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                        Settings
                      </Link>
                      <button
                        onClick={toggleDarkMode}
                        className="flex items-center w-full text-left px-3 py-2 text-[12px] text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 border-t border-gray-200 dark:border-gray-700 transition-all duration-200"
                        aria-label={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                      >
                        {darkMode ? (
                          <SunIcon className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                        ) : (
                          <MoonIcon className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                        )}
                        {darkMode ? "Light Mode" : "Dark Mode"}
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full text-left px-3 py-2 text-[12px] text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 border-t border-gray-200 dark:border-gray-700 transition-all duration-200"
                        aria-label="Logout"
                      >
                        <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {user && (
              <button
                onClick={() => toggleMenu('notifications')}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 relative transition-all duration-200"
                aria-label="Notifications"
              >
                <BellIcon className="w-4 h-4 text-gray-900 dark:text-gray-100" />
                {NotificationCount > 0 && (
                  <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-pink-500 text-white text-[10px] flex items-center justify-center">
                    {Math.min(NotificationCount, 9)}{NotificationCount > 9 ? '+' : ''}
                  </span>
                )}
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="w-4 h-4" />
              ) : (
                <Bars3Icon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 shadow-lg border-t border-gray-200 dark:border-gray-700">
          <div className="pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleMobileNav(item.path)}
                className="flex items-center w-full px-4 py-2 text-[12px] text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                aria-label={item.name}
              >
                <item.icon className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                {item.name}
              </button>
            ))}
            
            {user && (
              <>
                {/* Features Menu (Admin Only) */}
                {isAdmin && (
                  <div className="border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => setFeaturesMenuOpen(!featuresMenuOpen)}
                      className="flex items-center w-full px-4 py-2 text-[12px] text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                      aria-label="Features menu"
                    >
                      <BriefcaseIcon className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                      Features
                      <ChevronDownIcon className={`ml-auto w-4 h-4 transition-transform ${featuresMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {featuresMenuOpen && (
                      <div className="pl-8 bg-gray-50 dark:bg-gray-800/50">
                        {navConfig.features.map((item) => (
                          <button
                            key={item.name}
                            onClick={() => handleMobileNav(item.path)}
                            className="flex items-center w-full px-4 py-2 text-[12px] text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                            aria-label={item.name}
                          >
                            <item.icon className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                            {item.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* User Menu */}
                <div className="border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleMobileNav("/profile")}
                    className="flex items-center w-full px-4 py-2 text-[12px] text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                    aria-label="Profile"
                  >
                    <UserCircleIcon className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                    Profile
                  </button>
                  <button
                    onClick={() => handleMobileNav("/settings")}
                    className="flex items-center w-full px-4 py-2 text-[12px] text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                    aria-label="Settings"
                  >
                    <Cog6ToothIcon className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                    Settings
                  </button>
                  <button
                    onClick={toggleDarkMode}
                    className="flex items-center w-full px-4 py-2 text-[12px] text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                    aria-label={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                  >
                    {darkMode ? (
                      <SunIcon className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                    ) : (
                      <MoonIcon className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                    )}
                    {darkMode ? "Light Mode" : "Dark Mode"}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-[12px] text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 border-t border-gray-200 dark:border-gray-700 transition-all duration-200"
                    aria-label="Logout"
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {/* Mobile Notifications Panel */}
      {notificationsOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setNotificationsOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute top-14 right-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-[80vh] flex flex-col">
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-[12px] font-semibold text-gray-900 dark:text-white">Notifications</h3>
              <button
                onClick={() => {
                  markAllAsRead();
                  fetchNotificationCounter();
                }}
                className="text-[12px] text-pink-600 dark:text-pink-400 hover:underline"
                aria-label="Mark all notifications as read"
              >
                Mark All as Read
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              {notifications.length > 0 ? (
                notifications.map((msg) => (
                  <div
                    key={msg.id}
                    onClick={() => {
                      updateNotificationStatus(msg.id);
                      fetchNotificationCounter();
                    }}
                    className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-all duration-200"
                    role="button"
                    aria-label={`Notification: ${msg.type}`}
                  >
                    <p className="text-[12px] text-gray-900 dark:text-white">
                      <span className="font-medium">{msg.type}: </span>
                      {msg.message}
                    </p>
                    <p className="text-[10px] mt-1 text-gray-500 dark:text-gray-400">
                      {msg.status} • {format(new Date(msg.created_at), "MMM d, HH:mm")}
                    </p>
                  </div>
                ))
              ) : (
                <p className="p-3 text-[12px] text-gray-500 dark:text-gray-400 text-center">
                  No notifications
                </p>
              )}
            </div>
            <div className="p-2 border-t border-gray-200 dark:border-gray-700 text-center">
              <button
                onClick={() => setNotificationsOpen(false)}
                className="text-[12px] text-pink-600 dark:text-pink-400 font-medium hover:underline"
                aria-label="Close notifications">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
export default Navbar;
