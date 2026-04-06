import React, { useState, useEffect } from 'react';
import BookingCard from '../common/BookingCard';
import bookingService from '../../services/bookingService';
import toast from 'react-hot-toast';

const MyBookings = ({ onBookingChange }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const response = await bookingService.getUserBookings();
      setBookings(response.data || []);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const response = await bookingService.cancelBooking(bookingId);
      if (response.success) {
        toast.success('Booking cancelled successfully');
        loadBookings();
        onBookingChange();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error('Failed to cancel booking');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-8 text-center">
        <div className="spinner mx-auto"></div>
        <p className="mt-4 text-gray-500">Loading bookings...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">My Upcoming Bookings</h2>
        <p className="text-gray-500 text-sm">View and manage your upcoming meetings</p>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <p className="text-gray-500">No bookings found. Book a room to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map(booking => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onCancel={handleCancel}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;