import React from 'react';
import { Calendar, Clock, Tag, XCircle } from 'lucide-react';
import { format } from 'date-fns';

const BookingCard = ({ booking, onCancel }) => {
  const startDate = new Date(booking.startTime);
  const endDate = new Date(booking.endTime);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-all animate-fade-in-up">
      <h3 className="text-xl font-semibold text-gray-900 mb-3">
        {booking.room?.name}
      </h3>
      <div className="space-y-2 mb-4">
        <p className="text-gray-600 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>{format(startDate, 'MMMM d, yyyy')}</span>
        </p>
        <p className="text-gray-600 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>
            {format(startDate, 'h:mm a')} - {format(endDate, 'h:mm a')}
          </span>
        </p>
        <p className="text-gray-600 flex items-center gap-2">
          <Tag className="w-4 h-4" />
          <span>Status: {booking.status}</span>
        </p>
      </div>
      <button
        onClick={() => onCancel(booking.id)}
        className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <XCircle className="w-4 h-4" />
        Cancel Booking
      </button>
    </div>
  );
};

export default BookingCard;