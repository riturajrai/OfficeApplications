
import React, { useEffect, useState, useContext, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../Contex/NotificationConterContex";
import toast, { Toaster } from "react-hot-toast";
import ApiLoader from "../Loader/ApiLoader";
import {
  ClockIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
  HandThumbUpIcon,
  XCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CheckCircleIcon,
  PauseCircleIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
} from "@heroicons/react/24/solid";
import debounce from "lodash/debounce";
import noSubmissionFound from "../assets/vecteezy_no-results-found-or-missing-search-result-concept-flat_67565900.jpg";

// Status constants
const STATUSES = [
  "pending",
  "reviewed",
  "shortlisted",
  "rejected",
  "approved",
  "on_hold",
];

const statusIcons = {
  pending: <ClockIcon className="h-4 w-4 text-yellow-500" />,
  reviewed: <DocumentTextIcon className="h-4 w-4 text-blue-500" />,
  shortlisted: <HandThumbUpIcon className="h-4 w-4 text-purple-500" />,
  rejected: <XCircleIcon className="h-4 w-4 text-red-500" />,
  approved: <CheckCircleIcon className="h-4 w-4 text-green-500" />,
  on_hold: <PauseCircleIcon className="h-4 w-4 text-gray-500" />,
};

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
  reviewed: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
  shortlisted: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
  approved: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
  on_hold: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
};

// Helper functions
const generateRef = (id) => id.toString().padStart(10, "0");

const formatDate = (dateString) => {
  try {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return date.toLocaleDateString(undefined, options);
  } catch (error) {
    console.error("Date formatting error:", error);
    return "Invalid date";
  }
};

// Components
const StatusBadge = ({ status }) => {
  const displayStatus = status
    ? status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")
    : "Unknown";

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-medium ${
        statusColors[status] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
      }`}
    >
      {statusIcons[status] || <ClockIcon className="h-4 w-4 text-gray-500" />}
      <span className="ml-1">{displayStatus}</span>
    </span>
  );
};

const SubmissionMenu = ({ submission, onViewResume }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 text-gray-500 hover:text-pink-600 rounded-full hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all duration-200"
        aria-label="Submission menu"
      >
        <EllipsisVerticalIcon className="h-4 w-4" />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => {
              onViewResume();
              setIsOpen(false);
            }}
            className="block px-3 py-1.5 text-[12px] text-gray-700 dark:text-gray-200 hover:bg-pink-50 dark:hover:bg-pink-900/20 w-full text-left transition-all duration-200"
            aria-label="View resume"
          >
            View File
          </button>
        </div>
      )}
    </div>
  );
};

const SubmissionCard = ({
  submission,
  expandedCard,
  actionLoading,
  onToggleExpand,
  onStatusChange,
  onReviewChange,
  onViewResume,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-md hover:shadow-lg transition-all duration-200">
      <div className="p-4 sm:p-5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-[12px] font-semibold text-gray-900 dark:text-white">
              {submission.name || "Unknown"}
            </h3>
            <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-1">
              {submission.email || "N/A"}
            </p>
          </div>
          <StatusBadge status={submission.status} />
        </div>

        <div className="flex justify-between items-center text-[12px] text-gray-500 dark:text-gray-400 mb-3">
          <span className="font-medium text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/20 px-2 py-1 rounded-md">
            Ref: #{generateRef(submission.id)}
          </span>
          <span>{formatDate(submission.created_at)}</span>
        </div>

        <div
          className={`overflow-hidden transition-max-height duration-300 ease-in-out ${
            expandedCard === submission.id ? "max-h-96" : "max-h-0"
          }`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px] mb-3">
            <div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">Type</p>
              <p className="text-gray-900 dark:text-white">
                {submission.application_type_name ||
                  submission.application_type ||
                  "N/A"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">Department</p>
              <p className="text-gray-900 dark:text-white">
                {submission.department_name || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">Designation</p>
              <p className="text-gray-900 dark:text-white">
                {submission.designation || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">Reviewed</p>
              <p className="text-gray-900 dark:text-white">
                {submission.reviewed === 1 ? "Yes" : "No"}
              </p>
            </div>
          </div>
          {submission.reason && (
            <div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">Reason</p>
              <p className="text-gray-900 dark:text-white">{submission.reason}</p>
            </div>
          )}
        </div>
      </div>
      <div className="bg-gray-50 dark:bg-gray-800/50 px-4 sm:px-5 py-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-3">
          <button
            onClick={() => onToggleExpand(submission.id)}
            className="text-[12px] font-medium text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 flex items-center transition-all duration-200"
            aria-label={
              expandedCard === submission.id
                ? "Show less details"
                : "Show more details"
            }
          >
            {expandedCard === submission.id ? (
              <>
                <ChevronUpIcon className="h-4 w-4 mr-1" />
                Less details
              </>
            ) : (
              <>
                <ChevronDownIcon className="h-4 w-4 mr-1" />
                More details
              </>
            )}
          </button>
          <div className="flex space-x-2">
            {submission.resume && (
              <SubmissionMenu
                submission={submission}
                onViewResume={() => onViewResume(submission.id)}
              />
            )}
          </div>
        </div>
        <div className="space-y-2">
          <div className="relative">
            <select
              value={submission.status || "pending"}
              onChange={(e) => onStatusChange(submission.id, e)}
              className="block w-full pl-3 pr-8 py-2 text-[12px] border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50 transition-all duration-200"
              disabled={actionLoading === submission.id}
              aria-label="Change submission status"
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() +
                    status.slice(1).replace("_", " ")}
                </option>
              ))}
            </select>
            {actionLoading === submission.id && (
              <div className="absolute right-2 top-2">
                <ApiLoader size="small" />
              </div>
            )}
          </div>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={submission.reviewed === 1}
              onChange={(e) => onReviewChange(submission.id, e)}
              className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 dark:border-gray-600 rounded transition-all duration-200"
              disabled={actionLoading === submission.id}
              aria-label="Mark submission as reviewed"
            />
            <span className="text-[12px] text-gray-700 dark:text-gray-300">Mark as reviewed</span>
            {actionLoading === submission.id && <ApiLoader size="small" />}
          </label>
        </div>
      </div>
    </div>
  );
};

const SearchAndFilter = ({
  searchQuery,
  statusFilter,
  onSearchChange,
  onFilterChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
      <div className="relative flex-grow">
        <input
          type="text"
          placeholder="Search by name, email, ref, etc..."
          value={searchQuery}
          onChange={onSearchChange}
          className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-700 text-[12px] text-gray-900 dark:text-gray-100 transition-all duration-200"
          aria-label="Search submissions"
        />
        <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
      </div>
      <div className="relative">
        <select
          value={statusFilter}
          onChange={onFilterChange}
          className="appearance-none w-full pl-3 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-700 text-[12px] text-gray-900 dark:text-gray-100 transition-all duration-200"
          aria-label="Filter by status"
        >
          <option value="all">All Statuses</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="absolute right-2 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
      </div>
    </div>
  );
};

const ErrorMessage = ({ error }) => {
  return (
    <div className="mb-6 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md">
      <div className="flex items-center">
        <ExclamationCircleIcon className="h-4 w-4 text-red-500 dark:text-red-400 mr-2" />
        <p className="text-[12px] text-gray-900 dark:text-white">{error}</p>
      </div>
    </div>
  );
};

const SuccessMessage = ({ message }) => {
  return (
    <div className="mb-6 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md">
      <div className="flex items-center">
        <CheckCircleIcon className="h-4 w-4 text-green-500 dark:text-green-400 mr-2" />
        <p className="text-[12px] text-gray-900 dark:text-white">{message}</p>
      </div>
    </div>
  );
};

const NoResults = ({ statusFilter }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sm:p-8 text-center border border-gray-200 dark:border-gray-700">
      <img
        src={noSubmissionFound}
        alt="No submissions found"
        className="w-20 sm:w-24 mx-auto mb-3 opacity-80"
      />
      <h3 className="text-[12px] font-bold text-gray-900 dark:text-white">
        No submissions found
      </h3>
      <p className="mt-1 text-[12px] text-gray-500 dark:text-gray-400">
        {statusFilter !== "all"
          ? `No submissions with status "${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1).replace("_", " ")}"`
          : "No submissions available at the moment."}
      </p>
    </div>
  );
};

// Main component
function FormSubmissionDash() {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const navigate = useNavigate();
  const { fetchNotificationCounter } = useContext(CartContext) || {};
  const [apiData, setApiData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedCard, setExpandedCard] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Log token payload for debugging
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        console.log("Token payload:", payload);
      } catch (error) {
        console.error("Token decoding error:", error);
      }
    }
  }, []);

  // Validate token and redirect if invalid
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to view submissions.", {
        icon: <XCircleIcon className="h-4 w-4 text-red-500" />,
      });
      navigate("/login");
    } else {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (!["admin", "member"].includes(payload.role)) {
          toast.error("Invalid user role.", {
            icon: <XCircleIcon className="h-4 w-4 text-red-500" />,
          });
          localStorage.removeItem("token");
          navigate("/login");
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        toast.error("Invalid token. Please log in again.", {
          icon: <XCircleIcon className="h-4 w-4 text-red-500" />,
        });
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  }, [navigate]);

  const getAllSubmissions = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      const errorMsg = "Please log in to view submissions.";
      setError(errorMsg);
      toast.error(errorMsg, {
        icon: <XCircleIcon className="h-4 w-4 text-red-500" />,
      });
      navigate("/login");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/formDetails`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      });
      const submissions = response.data.data || [];
      const sortedSubmissions = submissions.sort((a, b) =>
        new Date(b.created_at) - new Date(a.created_at)
      );
      setApiData(sortedSubmissions);
      setFilteredData(sortedSubmissions);
      if (fetchNotificationCounter) {
        fetchNotificationCounter().catch(() => {});
      }
    } catch (error) {
      console.error("Fetch submissions error:", error.response || error);
      const errorMsg =
        error.response?.status === 401
          ? "Session expired. Please log in again."
          : error.response?.status === 403
          ? "No associated admin found for this member."
          : error.response?.data?.message ||
            (error.code === "ECONNABORTED"
              ? "Request timed out. Please check your network."
              : error.message === "Network Error"
              ? "Unable to connect to the server."
              : "Error fetching submissions.");
      setError(errorMsg);
      toast.error(errorMsg, {
        icon: <XCircleIcon className="h-4 w-4 text-red-500" />,
      });
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [API_URL, navigate, fetchNotificationCounter]);

  const viewResume = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to view resumes.", {
        icon: <XCircleIcon className="h-4 w-4 text-red-500" />,
      });
      navigate("/login");
      return;
    }

    setActionLoading(id);
    try {
      const response = await axios.get(`${API_URL}/form/resume/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000,
      });

      const { signedUrl, fileName } = response.data;
      if (!signedUrl) {
        throw new Error("No resume URL provided");
      }
      const link = document.createElement("a");
      link.href = signedUrl;
      if (fileName.toLowerCase().endsWith(".pdf")) {
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      } else {
        link.download = fileName;
      }
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Resume opened successfully", {
        icon: <CheckCircleIcon className="h-4 w-4 text-green-500" />,
      });
    } catch (error) {
      console.error("View resume error:", error.response || error);
      const errorMsg =
        error.response?.status === 403
          ? "No associated admin found for this member."
          : error.response?.data?.message ||
            (error.code === "ECONNABORTED"
              ? "Request timed out"
              : "Failed to fetch resume");
      toast.error(errorMsg, {
        icon: <XCircleIcon className="h-4 w-4 text-red-500" />,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const updateStatus = async (id, newStatus) => {
    const token = localStorage.getItem("token");
    if (!token) {
      const errorMsg = "Please log in to update submission status.";
      setError(errorMsg);
      toast.error(errorMsg, {
        icon: <XCircleIcon className="h-4 w-4 text-red-500" />,
      });
      navigate("/login");
      return;
    }

    const previousData = [...apiData];
    setApiData((prevData) =>
      prevData.map((item) =>
        item.id === id ? { ...item, status: newStatus } : item
      )
    );
    setFilteredData((prevData) =>
      prevData.map((item) =>
        item.id === id ? { ...item, status: newStatus } : item
      )
    );

    setActionLoading(id);
    setError(null);
    try {
      const response = await axios.patch(
        `${API_URL}/formDetails/${id}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );
      setSuccessMessage(
        `Submission #${generateRef(id)} status updated to ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1).replace("_", " ")}`
      );
      toast.success(`Status updated to ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1).replace("_", " ")}`, {
        icon: <CheckCircleIcon className="h-4 w-4 text-green-500" />,
      });
      if (fetchNotificationCounter) {
        fetchNotificationCounter().catch(() => {});
      }
    } catch (error) {
      console.error("Update status error:", error.response || error);
      setApiData(previousData);
      setFilteredData(previousData);
      const errorMsg =
        error.response?.status === 401
          ? "Session expired. Please log in again."
          : error.response?.status === 404
          ? "Submission not found or not authorized."
          : error.response?.status === 403
          ? "Not authorized to update this submission."
          : error.response?.data?.message ||
            (error.code === "ECONNABORTED"
              ? "Request timed out."
              : error.message === "Network Error"
              ? "Unable to connect to the server."
              : "Error updating status.");
      setError(errorMsg);
      toast.error(errorMsg, {
        icon: <XCircleIcon className="h-4 w-4 text-red-500" />,
      });
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setActionLoading(null);
    }
  };

  const updateReview = async (id, reviewed) => {
    const token = localStorage.getItem("token");
    if (!token) {
      const errorMsg = "Please log in to update review status.";
      setError(errorMsg);
      toast.error(errorMsg, {
        icon: <XCircleIcon className="h-4 w-4 text-red-500" />,
      });
      navigate("/login");
      return;
    }

    const reviewedValue = reviewed ? 1 : 0;
    const previousData = [...apiData];
    setApiData((prevData) =>
      prevData.map((item) =>
        item.id === id ? { ...item, reviewed: reviewedValue } : item
      )
    );
    setFilteredData((prevData) =>
      prevData.map((item) =>
        item.id === id ? { ...item, reviewed: reviewedValue } : item
      )
    );
    setActionLoading(id);
    setError(null);
    try {
      const response = await axios.patch(
        `${API_URL}/formDetails/${id}/review`,
        { reviewed: reviewedValue },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );
      setSuccessMessage(
        `Submission #${generateRef(id)} ${reviewedValue === 1 ? "marked as reviewed" : "marked as unreviewed"}`
      );
      toast.success(
        `Submission ${reviewedValue === 1 ? "marked as reviewed" : "marked as unreviewed"}`,
        {
          icon: <CheckCircleIcon className="h-4 w-4 text-green-500" />,
        }
      );
      if (fetchNotificationCounter) {
        fetchNotificationCounter().catch(() => {});
      }
    } catch (error) {
      console.error("Update review error:", error.response || error);
      setApiData(previousData);
      setFilteredData(previousData);
      const errorMsg =
        error.response?.status === 401
          ? "Session expired. Please log in again."
          : error.response?.status === 404
          ? "Submission not found or not authorized."
          : error.response?.status === 403
          ? "Not authorized to update this submission."
          : error.response?.data?.message ||
            (error.code === "ECONNABORTED"
              ? "Request timed out."
              : error.message === "Network Error"
              ? "Unable to connect to the server."
              : "Error updating review status.");
      setError(errorMsg);
      toast.error(errorMsg, {
        icon: <XCircleIcon className="h-4 w-4 text-red-500" />,
      });
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleFilterChange = (e) => {
    const filter = e.target.value;
    setStatusFilter(filter);
    applyFilters(filter, searchQuery);
  };

  const debouncedSearch = useCallback(
    debounce((query, status) => {
      applyFilters(status, query);
    }, 300),
    [apiData]
  );

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query, statusFilter);
  };

  const applyFilters = useCallback(
    (statusFilter, searchQuery) => {
      let filtered = [...apiData];
      if (statusFilter !== "all") {
        filtered = filtered.filter((item) => item.status === statusFilter);
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase().trim();
        filtered = filtered.filter(
          (item) =>
            (item.name || "").toLowerCase().includes(query) ||
            (item.email || "").toLowerCase().includes(query) ||
            (item.application_type_name || "").toLowerCase().includes(query) ||
            (item.department_name || "").toLowerCase().includes(query) ||
            (item.designation || "").toLowerCase().includes(query) ||
            generateRef(item.id).includes(query)
        );
      }
      setFilteredData(filtered);
    },
    [apiData]
  );

  const handleStatusChange = (id, e) => {
    const newStatus = e.target.value;
    if (newStatus && STATUSES.includes(newStatus)) {
      updateStatus(id, newStatus);
    } else {
      setError("Invalid status selected.");
      toast.error("Invalid status selected.", {
        icon: <XCircleIcon className="h-4 w-4 text-red-500" />,
      });
    }
  };

  const handleReviewChange = (id, e) => {
    const reviewed = e.target.checked;
    updateReview(id, reviewed);
  };

  const toggleExpandCard = (id) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  useEffect(() => {
    getAllSubmissions();
  }, [getAllSubmissions]);

  // Refresh data after successful update
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        getAllSubmissions();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, getAllSubmissions]);

  // Main render
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-[12px] font-bold text-gray-900 dark:text-white">Candidate Submissions</h1>
          <SearchAndFilter
            searchQuery={searchQuery}
            statusFilter={statusFilter}
            onSearchChange={handleSearchChange}
            onFilterChange={handleFilterChange}
          />
        </div>

        {successMessage && <SuccessMessage message={successMessage} />}
        {error && <ErrorMessage error={error} />}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <ApiLoader />
            <p className="mt-3 text-[12px] text-gray-500 dark:text-gray-400">Loading submissions...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <NoResults statusFilter={statusFilter} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {filteredData.map((submission) => (
              <SubmissionCard
                key={submission.id}
                submission={submission}
                expandedCard={expandedCard}
                actionLoading={actionLoading}
                onToggleExpand={toggleExpandCard}
                onStatusChange={handleStatusChange}
                onReviewChange={handleReviewChange}
                onViewResume={viewResume}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FormSubmissionDash;
