import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import roomService from '../../services/roomService';
import bookingService from '../../services/bookingService';
import { 
  Calendar, DoorOpen, Clock, CheckCircle, XCircle, 
  Plus, RefreshCw, Trash2, AlertCircle 
} from 'lucide-react';
import toast from 'react-hot-toast';

const UserDashboard = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [stats, setStats] = useState({ totalRooms: 0, totalBookings: 0, upcomingBookings: 0 });
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  
  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    roomId: '',
    date: '',
    startTime: '10:00',
    endTime: '12:00'
  });

  useEffect(() => {
    loadData();
    setDefaultDate();
  }, []);

  const setDefaultDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setBookingForm(prev => ({
      ...prev,
      date: tomorrow.toISOString().split('T')[0]
    }));
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [roomsRes, bookingsRes] = await Promise.all([
        roomService.getAllRooms(),
        bookingService.getUserBookings()
      ]);
      
      const roomsData = roomsRes.data || [];
      const bookingsData = bookingsRes.data || [];
      const now = new Date();
      const upcoming = bookingsData.filter(b => 
        b.status === 'ACTIVE' && new Date(b.startTime) > now
      ).length;
      
      setRooms(roomsData);
      setMyBookings(bookingsData);
      setStats({
        totalRooms: roomsData.length,
        totalBookings: bookingsData.length,
        upcomingBookings: upcoming
      });
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    
    if (!bookingForm.roomId || !bookingForm.date || !bookingForm.startTime || !bookingForm.endTime) {
      toast.error('Please fill all fields');
      return;
    }

    // Validate time
    if (bookingForm.startTime >= bookingForm.endTime) {
      toast.error('End time must be after start time');
      return;
    }

    setBookingLoading(true);
    
    try {
      const startDateTime = new Date(`${bookingForm.date}T${bookingForm.startTime}:00`).toISOString();
      const endDateTime = new Date(`${bookingForm.date}T${bookingForm.endTime}:00`).toISOString();
      
      // Check if booking is in the past
      if (new Date(startDateTime) < new Date()) {
        toast.error('Cannot book a room in the past');
        setBookingLoading(false);
        return;
      }
      
      const response = await bookingService.createBooking({
        roomId: bookingForm.roomId,
        startTime: startDateTime,
        endTime: endDateTime
      });
      
      if (response.success) {
        toast.success('Booking created successfully!');
        loadData();
        setBookingForm({ ...bookingForm, roomId: '' });
        setDefaultDate();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Booking failed';
      toast.error(errorMsg);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      const response = await bookingService.cancelBooking(bookingId);
      if (response.success) {
        toast.success('Booking cancelled successfully');
        loadData();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error('Failed to cancel booking');
    }
  };

  const handleInputChange = (e) => {
    setBookingForm({ ...bookingForm, [e.target.name]: e.target.value });
  };

  const getStatusBadge = (status, startTime) => {
    const isPast = new Date(startTime) < new Date();
    
    if (status === 'CANCELLED') {
      return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800"><XCircle className="w-3 h-3" /> Cancelled</span>;
    }
    if (isPast && status === 'ACTIVE') {
      return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600"><Clock className="w-3 h-3" /> Completed</span>;
    }
    return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800"><CheckCircle className="w-3 h-3" /> Active</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {user?.name}! 👋</h1>
            <p className="text-indigo-100 mt-1">Book meeting rooms and manage your schedule</p>
          </div>
          <div className="bg-white/20 rounded-full px-3 py-1 text-sm">
            Regular User
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Available Rooms</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalRooms}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <DoorOpen className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">My Bookings</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalBookings}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Upcoming Meetings</p>
              <p className="text-3xl font-bold text-gray-800">{stats.upcomingBookings}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Booking Form */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-800">Book a Meeting Room</h3>
        </div>
        
        <form onSubmit={handleBooking} className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Select Room *</label>
            <select
              name="roomId"
              value={bookingForm.roomId}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">Choose a room</option>
              {rooms.map(room => (
                <option key={room.id} value={room.id}>
                  {room.name} (Capacity: {room.capacity})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Date *</label>
            <input
              type="date"
              name="date"
              value={bookingForm.date}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Start Time *</label>
            <input
              type="time"
              name="startTime"
              value={bookingForm.startTime}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">End Time *</label>
            <input
              type="time"
              name="endTime"
              value={bookingForm.endTime}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={bookingLoading || rooms.length === 0}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {bookingLoading ? 'Booking...' : 'Book Now'}
            </button>
          </div>
        </form>
        
        {rooms.length === 0 && (
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg flex items-center gap-2 text-yellow-800">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">No rooms available. Please contact administrator.</span>
          </div>
        )}
      </div>

      {/* Available Rooms Section - READ ONLY for Users */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Available Meeting Rooms</h3>
            <p className="text-sm text-gray-500">Browse available meeting spaces (read-only)</p>
          </div>
          <button
            onClick={loadData}
            className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-indigo-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-xl">
              <DoorOpen className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p>No rooms available.</p>
            </div>
          ) : (
            rooms.map(room => (
              <div key={room.id} className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
                <h4 className="font-semibold text-gray-800 text-lg">{room.name}</h4>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Capacity:</span> {room.capacity} people
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Equipment:</span> {Array.isArray(room.equipment) && room.equipment.length > 0 
                      ? room.equipment.join(', ') 
                      : 'None'}
                  </p>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <span className="inline-flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle className="w-3 h-3" /> Available for booking
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* My Bookings Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">My Upcoming Bookings</h3>
        <div className="space-y-3">
          {myBookings.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center text-gray-500">
              <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p>No bookings found. Book a room to get started!</p>
            </div>
          ) : (
            myBookings.map(booking => {
              const isPast = new Date(booking.startTime) < new Date();
              const canCancel = booking.status === 'ACTIVE' && !isPast;
              
              return (
                <div key={booking.id} className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start flex-wrap gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-gray-800">{booking.room?.name}</h4>
                        {getStatusBadge(booking.status, booking.startTime)}
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        📅 {new Date(booking.startTime).toLocaleDateString()} | 
                        🕐 {new Date(booking.startTime).toLocaleTimeString()} - {new Date(booking.endTime).toLocaleTimeString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        ⏱️ Duration: {((new Date(booking.endTime) - new Date(booking.startTime)) / 3600000).toFixed(1)} hours
                      </p>
                      <p className="text-sm text-gray-500">
                        🏢 Room ID: {booking.roomId?.substring(0, 8)}...
                      </p>
                    </div>
                    {canCancel && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;