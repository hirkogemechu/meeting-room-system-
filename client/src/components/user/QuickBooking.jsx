import React, { useState, useEffect } from 'react';
import { Calendar, Clock, DoorOpen } from 'lucide-react';
import roomService from '../../services/roomService';
import bookingService from '../../services/bookingService';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const QuickBooking = ({ onBookingComplete }) => {
  const [rooms, setRooms] = useState([]);
  const [formData, setFormData] = useState({
    roomId: '',
    date: '',
    startTime: '10:00',
    endTime: '12:00',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRooms();
    setDefaultDate();
  }, []);

  const loadRooms = async () => {
    try {
      const response = await roomService.getAllRooms();
      setRooms(response.data || []);
    } catch (error) {
      console.error('Error loading rooms:', error);
    }
  };

  const setDefaultDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setFormData(prev => ({
      ...prev,
      date: format(tomorrow, 'yyyy-MM-dd'),
    }));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.roomId || !formData.date || !formData.startTime || !formData.endTime) {
      toast.error('Please fill all fields');
      return;
    }

    setLoading(true);
    
    try {
      const startDateTime = new Date(`${formData.date}T${formData.startTime}:00`).toISOString();
      const endDateTime = new Date(`${formData.date}T${formData.endTime}:00`).toISOString();
      
      const response = await bookingService.createBooking({
        roomId: formData.roomId,
        startTime: startDateTime,
        endTime: endDateTime,
      });
      
      if (response.success) {
        toast.success('Booking created successfully!');
        onBookingComplete();
        setFormData({
          ...formData,
          roomId: '',
          startTime: '10:00',
          endTime: '12:00',
        });
        setDefaultDate();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Quick Booking</h2>
        <p className="text-gray-500 text-sm">Book a meeting room in seconds</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">Select Room</label>
          <div className="relative">
            <DoorOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              name="roomId"
              value={formData.roomId}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
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
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">Start Time</label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">End Time</label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Booking...' : 'Book Now'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuickBooking;