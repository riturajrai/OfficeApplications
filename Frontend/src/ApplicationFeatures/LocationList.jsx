import { useState, useEffect, useCallback, useRef, useReducer } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  XMarkIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import ApiLoader from '../Loader/ApiLoader';

// Fix Leaflet marker icons
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const initialState = {
  loading: true,
  error: '',
  locations: [],
};

function reducer(state, action) {
  switch (action.type) {
    case 'FETCHING':
      return { ...state, loading: false, error: '', locations: action.payload };
    case 'ERROR':
      return { ...state, loading: false, error: 'Something went wrong', locations: [] };
    case 'ADD':
      return { ...state, locations: [...state.locations, action.payload] };
    case 'UPDATE':
      return {
        ...state,
        locations: state.locations.map((item) =>
          item.id === action.payload.id ? action.payload : item
        ),
      };
    case 'DELETE':
      return { ...state, locations: state.locations.filter((item) => item.id !== action.payload) };
    default:
      return state;
  }
}

function LocationList() {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [newLocation, setNewLocation] = useState({
    place_name: "",
    latitude: "",
    longitude: "",
    distance_in_meters: "200",
  });
  const [editLocation, setEditLocation] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState(null);
  const [showGeoPrompt, setShowGeoPrompt] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [isGeoEnabled, setIsGeoEnabled] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const mapRef = useRef(null);

  const token = localStorage.getItem("token");
  const authAxios = axios.create({
    headers: { Authorization: `Bearer ${token}` },
  });

  const getLocations = useCallback(async () => {
    setIsFetching(true);
    try {
      if (!token) throw new Error("No token found");
      const response = await authAxios.get(`${API_URL}/locations`);
      const transformed = response.data.result.map((item) => ({
        ...item,
        nameuppercase: item.place_name.toUpperCase(),
      }));
      dispatch({ type: 'FETCHING', payload: transformed });
    } catch (err) {
      console.error('Error fetching locations:', err);
      dispatch({ type: 'ERROR' });
      const message =
        err.response?.status === 401 || err.response?.status === 403
          ? 'Your session has expired. Please log in again.'
          : 'Failed to fetch locations';
      toast.error(message, { 
        duration: 3000,
        style: { background: '#ffffff', color: '#1e293b', padding: '12px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }
      });
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate("/login");
      }
    } finally {
      setIsFetching(false);
    }
  }, [navigate, token]);

  const getQrCode = useCallback(async () => {
    try {
      const response = await authAxios.get(`${API_URL}/qrcodes/user`);
      setQrCode(response.data.code);
    } catch (error) {
      console.error("QR code fetch error:", error.response?.data || error.message);
    }
  }, []);

  const validateCoordinates = (lat, lng) => {
    if (isNaN(lat) || lat === "") return false;
    if (isNaN(lng) || lng === "") return false;
    if (lat < -90 || lat > 90) return false;
    if (lng < -180 || lng > 180) return false;
    return true;
  };

  const validateDistance = (distance) => {
    if (isNaN(distance) || distance < 0) return false;
    return true;
  };

  const validateLocationData = (location) => {
    if (!location.place_name.trim()) return "Place name is required";
    if (!validateCoordinates(Number(location.latitude), Number(location.longitude))) return "Invalid coordinates";
    if (!validateDistance(Number(location.distance_in_meters))) return "Distance must be a non-negative number";
    return null;
  };

  const handleUseCurrentLocation = () => {
    setShowGeoPrompt(false);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setNewLocation({
            ...newLocation,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          });
          toast.success("Current location fetched successfully", {
            style: { background: '#ffffff', color: '#1e293b', padding: '12px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }
          });
        },
        (err) => {
          toast.error("Failed to get current location. Please enable location services.", {
            style: { background: '#ffffff', color: '#1e293b', padding: '12px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }
          });
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser.", {
        style: { background: '#ffffff', color: '#1e293b', padding: '12px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }
      });
    }
  };

  const validateUserLocation = async () => {
    if (state.locations.length === 0) {
      return true;
    }

    if (!isGeoEnabled || !navigator.geolocation) {
      toast.error("Geolocation is disabled or not supported. Cannot validate location.", {
        style: { background: '#ffffff', color: '#1e293b', padding: '12px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }
      });
      return false;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const response = await authAxios.post(`${API_URL}/validate-location`, {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
            if (response.data.withinRange) {
              resolve(true);
            } else {
              toast.error("You are not within the allowed range to apply.", {
                style: { background: '#ffffff', color: '#1e293b', padding: '12px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }
              });
              resolve(false);
            }
          } catch (error) {
            toast.error(error.response?.data?.message || "Failed to validate location", {
              style: { background: '#ffffff', color: '#1e293b', padding: '12px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }
            });
            resolve(false);
          }
        },
        (err) => {
          toast.error("Failed to get current location. Please enable location services.", {
            style: { background: '#ffffff', color: '#1e293b', padding: '12px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }
          });
          resolve(false);
        }
      );
    });
  };

  const handleApplyClick = async () => {
    if (!qrCode) {
      toast.error("No QR code available", {
        style: { background: '#ffffff', color: '#1e293b', padding: '12px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }
      });
      return;
    }

    const isWithinRange = await validateUserLocation();
    if (isWithinRange) {
      navigate(`/formsubmission/${qrCode}`);
    }
  };

  const AddLocation = async () => {
    const error = validateLocationData(newLocation);
    if (error) {
      toast.error(error, { 
        duration: 3000,
        style: { background: '#ffffff', color: '#1e293b', padding: '12px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }
      });
      return;
    }
    if (state.locations.length > 0) {
      toast.error("Only one location allowed per user", {
        style: { background: '#ffffff', color: '#1e293b', padding: '12px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const { place_name, latitude, longitude, distance_in_meters } = newLocation;
      const response = await authAxios.post(`${API_URL}/locations`, {
        place_name,
        latitude: Number(latitude),
        longitude: Number(longitude),
        distance_in_meters: Number(distance_in_meters),
      });
      dispatch({ type: 'ADD', payload: { id: response.data.result, ...newLocation, nameuppercase: place_name.toUpperCase() } });
      setNewLocation({ place_name: "", latitude: "", longitude: "", distance_in_meters: "200" });
      setIsAddModalOpen(false);
      toast.success('Location added successfully', { 
        duration: 3000,
        style: { background: '#ffffff', color: '#1e293b', padding: '12px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }
      });
      await getLocations();
    } catch (error) {
      console.error('Error adding location:', error);
      const message =
        error.response?.status === 401 || error.response?.status === 403
          ? 'Your session has expired. Please log in again.'
          : error.response?.data?.message || 'Failed to add location';
      toast.error(message, { 
        duration: 3000,
        style: { background: '#ffffff', color: '#1e293b', padding: '12px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }
      });
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate("/login");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const UpdateLocation = async () => {
    const error = validateLocationData(editLocation);
    if (error) {
      toast.error(error, { 
        duration: 3000,
        style: { background: '#ffffff', color: '#1e293b', padding: '12px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const { id, place_name, latitude, longitude, distance_in_meters } = editLocation;
      await authAxios.put(`${API_URL}/locations/${id}`, {
        place_name,
        latitude: Number(latitude),
        longitude: Number(longitude),
        distance_in_meters: Number(distance_in_meters),
      });
      dispatch({ type: 'UPDATE', payload: { id, place_name, latitude, longitude, distance_in_meters, nameuppercase: place_name.toUpperCase() } });
      setEditLocation(null);
      setIsEditModalOpen(false);
      toast.success('Location updated successfully', { 
        duration: 3000,
        style: { background: '#ffffff', color: '#1e293b', padding: '12px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }
      });
      await getLocations();
    } catch (error) {
      console.error('Error updating location:', error);
      const message =
        error.response?.status === 401 || error.response?.status === 403
          ? 'Your session has expired. Please log in again.'
          : error.response?.data?.message || 'Failed to update location';
      toast.error(message, { 
        duration: 3000,
        style: { background: '#ffffff', color: '#1e293b', padding: '12px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }
      });
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate("/login");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const DeleteLocation = async (id) => {
    setIsSubmitting(true);
    try {
      await authAxios.delete(`${API_URL}/locations/${id}`);
      dispatch({ type: 'DELETE', payload: id });
      toast.success('Location deleted successfully', { 
        duration: 3000,
        style: { background: '#ffffff', color: '#1e293b', padding: '12px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }
      });
      setIsDeleteConfirmOpen(false);
      setLocationToDelete(null);
      await getLocations();
    } catch (err) {
      console.error('Error deleting location:', err);
      const message =
        err.response?.status === 401 || err.response?.status === 403
          ? 'Your session has expired. Please log in again.'
          : err.response?.data?.message || 'Failed to delete location';
      toast.error(message, { 
        duration: 3000,
        style: { background: '#ffffff', color: '#1e293b', padding: '12px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }
      });
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate("/login");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAddModal = () => {
    setNewLocation({ place_name: "", latitude: "", longitude: "", distance_in_meters: "200" });
    setIsAddModalOpen(true);
  };

  const openEditModal = (loc) => {
    setEditLocation({
      id: loc.id,
      place_name: loc.place_name,
      latitude: loc.latitude.toString(),
      longitude: loc.longitude.toString(),
      distance_in_meters: loc.distance_in_meters.toString(),
    });
    setIsEditModalOpen(true);
  };

  const ConfirmDelete = (id) => {
    setLocationToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const CancelDelete = () => {
    setIsDeleteConfirmOpen(false);
    setLocationToDelete(null);
  };

  useEffect(() => {
    getLocations();
    getQrCode();
  }, [getLocations, getQrCode]);

  useEffect(() => {
    if (state.locations.length > 0 && mapRef.current) {
      const { latitude, longitude } = state.locations[0];
      mapRef.current.flyTo([Number(latitude), Number(longitude)], 13);
    }
  }, [state.locations]);

  if (state.loading && !isFetching) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50 dark:bg-slate-900 font-[Inter] text-[12px] antialiased">
        <ApiLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 px-4 py-6 sm:px-6 lg:px-8 font-[Inter] text-[12px] antialiased">
      <Toaster 
        position="bottom-right" 
        toastOptions={{ 
          style: { 
            fontSize: '12px', 
            padding: '12px', 
            borderRadius: '8px',
            background: '#ffffff',
            color: '#1e293b',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          },
          success: { iconTheme: { primary: '#4f46e5', secondary: '#fff' } },
          error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
        }} 
      />
      <div className="max-w-full sm:max-w-4xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 gap-4">
          <div>
            <h1 className="text-[12px] font-bold text-slate-900 dark:text-slate-100 text-center sm:text-left">
              Manage Location
            </h1>
            <p className="text-[12px] text-slate-600 dark:text-slate-400 mt-1 text-center sm:text-left">
              Add, edit, or remove your organization's location
            </p>
          </div>
          <div className="flex items-center gap-2">
            {state.locations.length === 0 && (
              <button
                onClick={openAddModal}
                className="flex items-center px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 text-white rounded-md hover:bg-gradient-to-r hover:from-indigo-700 hover:to-purple-700 dark:hover:from-indigo-600 dark:hover:to-purple-600 transition-colors duration-200 disabled:opacity-50"
                aria-label="Add new location"
                disabled={isSubmitting || isFetching}
              >
                <PlusIcon className="w-4 h-4 mr-1" />
                Add New
              </button>
            )}
          </div>
        </div>

        {isFetching ? (
          <div className="flex justify-center items-center py-6">
            <ApiLoader />
          </div>
        ) : state.locations.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 text-center">
            <p className="text-[12px] text-slate-500 dark:text-slate-400">
              No location found. Add one to get started!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {state.locations.map((loc) => (
              <div key={loc.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
                <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-4">
                  <div>
                    <dt className="text-[12px] font-medium text-slate-500 dark:text-slate-400">Place Name</dt>
                    <dd className="text-[12px] text-slate-900 dark:text-slate-100">{loc.place_name}</dd>
                  </div>
                  <div>
                    <dt className="text-[12px] font-medium text-slate-500 dark:text-slate-400">Latitude</dt>
                    <dd className="text-[12px] text-slate-900 dark:text-slate-100">{loc.latitude}</dd>
                  </div>
                  <div>
                    <dt className="text-[12px] font-medium text-slate-500 dark:text-slate-400">Longitude</dt>
                    <dd className="text-[12px] text-slate-900 dark:text-slate-100">{loc.longitude}</dd>
                  </div>
                  <div>
                    <dt className="text-[12px] font-medium text-slate-500 dark:text-slate-400">Distance (meters)</dt>
                    <dd className="text-[12px] text-slate-900 dark:text-slate-100">{loc.distance_in_meters}</dd>
                  </div>
                </dl>
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    onClick={() => openEditModal(loc)}
                    className="text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 mr-4 disabled:opacity-50"
                    aria-label={`Edit ${loc.place_name}`}
                    disabled={isSubmitting || isFetching}
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => ConfirmDelete(loc.id)}
                    className="text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50"
                    aria-label={`Delete ${loc.place_name}`}
                    disabled={isSubmitting || isFetching}
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
                {qrCode && (
                  <button
                    onClick={handleApplyClick}
                    className="mt-4 w-full px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 text-white rounded-md hover:bg-gradient-to-r hover:from-indigo-700 hover:to-purple-700 dark:hover:from-indigo-600 dark:hover:to-purple-600 transition-colors duration-200 disabled:opacity-50"
                    disabled={isSubmitting || isFetching}
                  >
                    Apply
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {state.locations.length > 0 && (
          <div className="mt-6 relative z-0">
            <div className="h-64 sm:h-80 md:h-96 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
              <MapContainer
                ref={mapRef}
                center={[Number(state.locations[0].latitude), Number(state.locations[0].longitude)]}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={[Number(state.locations[0].latitude), Number(state.locations[0].longitude)]}>
                  <Popup>
                    <div className="text-center text-[12px]">
                      <MapPinIcon className="w-4 h-4 mx-auto text-indigo-600 dark:text-indigo-400 mb-1" />
                      <p className="font-semibold">{state.locations[0].place_name}</p>
                      <p>
                        {state.locations[0].latitude}, {state.locations[0].longitude}
                      </p>
                      <p>
                        Distance: {state.locations[0].distance_in_meters} meters
                      </p>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        )}

        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 max-w-md w-full">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-[12px] font-semibold text-slate-900 dark:text-slate-100">
                  Add New Location
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  aria-label="Close"
                  disabled={isSubmitting}
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="flex items-center space-x-2 text-[12px] text-slate-700 dark:text-slate-300">
                    <input type="checkbox" checked={isGeoEnabled} onChange={(e) => setIsGeoEnabled(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500" disabled={isSubmitting} />
                    <span>Enable Geolocation Features</span>
                  </label>
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Place Name
                  </label>
                  <input
                    type="text"
                    value={newLocation.place_name}
                    onChange={(e) => setNewLocation({ ...newLocation, place_name: e.target.value })}
                    className="w-full px-3 py-2 text-[12px] text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
                    placeholder="Enter place name"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={newLocation.latitude}
                      onChange={(e) => setNewLocation({ ...newLocation, latitude: e.target.value })}
                      className="w-full px-3 py-2 text-[12px] text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
                      placeholder="Enter latitude"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={newLocation.longitude}
                      onChange={(e) => setNewLocation({ ...newLocation, longitude: e.target.value })}
                      className="w-full px-3 py-2 text-[12px] text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
                      placeholder="Enter longitude"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Distance in Meters
                  </label>
                  <input
                    type="number"
                    value={newLocation.distance_in_meters}
                    onChange={(e) => setNewLocation({ ...newLocation, distance_in_meters: e.target.value })}
                    className="w-full px-3 py-2 text-[12px] text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
                    placeholder="Enter distance"
                    disabled={isSubmitting}
                  />
                </div>
                {isGeoEnabled && (
                  <button
                    onClick={() => setShowGeoPrompt(true)}
                    className="w-full px-3 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-colors duration-200"
                    disabled={isSubmitting}
                  >
                    Use Current Location
                  </button>
                )}
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-3 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-colors duration-200 disabled:opacity-50"
                    aria-label="Cancel"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={AddLocation}
                    className="px-3 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200 disabled:opacity-50 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 hover:bg-gradient-to-r hover:from-indigo-700 hover:to-purple-700 dark:hover:from-indigo-600 dark:hover:to-purple-600"
                    aria-label="Add"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <ApiLoader size="small" />
                    ) : (
                      <span className="flex items-center">
                        <PlusIcon className="w-4 h-4 mr-1" />
                        Add
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 max-w-md w-full">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-[12px] font-semibold text-slate-900 dark:text-slate-100">
                  Edit Location
                </h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  aria-label="Close"
                  disabled={isSubmitting}
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-[12px] font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Place Name
                  </label>
                  <input
                    type="text"
                    value={editLocation.place_name}
                    onChange={(e) => setEditLocation({ ...editLocation, place_name: e.target.value })}
                    className="w-full px-3 py-2 text-[12px] text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
                    placeholder="Enter place name"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={editLocation.latitude}
                      onChange={(e) => setEditLocation({ ...editLocation, latitude: e.target.value })}
                      className="w-full px-3 py-2 text-[12px] text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
                      placeholder="Enter latitude"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={editLocation.longitude}
                      onChange={(e) => setEditLocation({ ...editLocation, longitude: e.target.value })}
                      className="w-full px-3 py-2 text-[12px] text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
                      placeholder="Enter longitude"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Distance in Meters
                  </label>
                  <input
                    type="number"
                    value={editLocation.distance_in_meters}
                    onChange={(e) => setEditLocation({ ...editLocation, distance_in_meters: e.target.value })}
                    className="w-full px-3 py-2 text-[12px] text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
                    placeholder="Enter distance"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-3 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-colors duration-200 disabled:opacity-50"
                    aria-label="Cancel"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={UpdateLocation}
                    className="px-3 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200 disabled:opacity-50 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 hover:bg-gradient-to-r hover:from-indigo-700 hover:to-purple-700 dark:hover:from-indigo-600 dark:hover:to-purple-600"
                    aria-label="Update"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <ApiLoader size="small" />
                    ) : (
                      <span className="flex items-center">
                        <PencilIcon className="w-4 h-4 mr-1" />
                        Update
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showGeoPrompt && isGeoEnabled && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 max-w-sm w-full">
              <h3 className="text-[12px] font-semibold text-slate-900 dark:text-slate-100 mb-3">
                Use Current Location
              </h3>
              <p className="text-[12px] text-slate-700 dark:text-slate-300 mb-4">
                Would you like to use your current location for latitude and longitude?
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowGeoPrompt(false)}
                  className="px-3 py-2 text-[12px] bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all duration-300"
                  aria-label="Cancel"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUseCurrentLocation}
                  className="px-3 py-2 text-[12px] bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 text-white rounded-md hover:bg-gradient-to-r hover:from-indigo-700 hover:to-purple-700 dark:hover:from-indigo-600 dark:hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Use Current Location"
                  disabled={isSubmitting}
                >
                  Use Current Location
                </button>
              </div>
            </div>
          </div>
        )}

        {isDeleteConfirmOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 max-w-xs w-full">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-[12px] font-semibold text-slate-900 dark:text-slate-100">
                  Confirm Deletion
                </h3>
                <button
                  onClick={CancelDelete}
                  className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  aria-label="Close"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <p className="text-[12px] text-slate-700 dark:text-slate-300 mb-4">
                Are you sure you want to delete this location? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={CancelDelete}
                  className="px-3 py-2 text-[12px] bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all duration-300"
                  aria-label="Cancel deletion"
                  disabled={isSubmitting || isFetching}
                >
                  Cancel
                </button>
                <button
                  onClick={() => DeleteLocation(locationToDelete)}
                  disabled={isSubmitting || isFetching}
                  className="px-3 py-2 text-[12px] bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Confirm deletion"
                >
                  {isSubmitting ? <ApiLoader /> : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LocationList;