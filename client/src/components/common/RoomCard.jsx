import React from 'react';
import { Users, Wrench, CheckCircle } from 'lucide-react';

const RoomCard = ({ room }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-all hover:-translate-y-1 animate-fade-in-up">
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{room.name}</h3>
      <div className="space-y-2 mb-4">
        <p className="text-gray-600 flex items-center gap-2">
          <Users className="w-4 h-4" />
          <span>Capacity: {room.capacity} people</span>
        </p>
        <p className="text-gray-600 flex items-center gap-2">
          <Wrench className="w-4 h-4" />
          <span>Equipment: {room.equipment?.join(', ') || 'None'}</span>
        </p>
      </div>
      <div className="bg-gray-50 rounded-lg p-3">
        <p className="text-green-600 text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>Available for booking</span>
        </p>
      </div>
    </div>
  );
};

export default RoomCard;