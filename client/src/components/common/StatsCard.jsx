import React from 'react';

const StatsCard = ({ icon, title, value, color = 'primary' }) => {
  const colors = {
    primary: 'bg-indigo-100 text-indigo-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow animate-fade-in-up">
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${colors[color]}`}>
          {icon}
        </div>
        <div>
          <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
          <p className="text-gray-500 text-sm mt-1">{title}</p>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;