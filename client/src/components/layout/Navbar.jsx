import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Building2, User, LogOut, Crown, LayoutDashboard, DoorOpen, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to={isAdmin ? "/admin" : "/dashboard"} className="flex items-center gap-2">
            <Building2 className="w-8 h-8 text-indigo-600" />
            <span className="text-xl font-bold text-gray-800">MeetingRoom Pro</span>
            {isAdmin && (
              <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                Admin
              </span>
            )}
          </Link>

          {/* Navigation Links - Role Based */}
          <div className="hidden md:flex items-center gap-6">
            {isAdmin ? (
              // Admin Navigation Links
              <>
                <Link to="/admin" className="text-gray-600 hover:text-indigo-600 transition-colors flex items-center gap-1">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <Link to="/admin?tab=rooms" className="text-gray-600 hover:text-indigo-600 transition-colors flex items-center gap-1">
                  <DoorOpen className="w-4 h-4" />
                  <span>Rooms</span>
                </Link>
                <Link to="/admin?tab=bookings" className="text-gray-600 hover:text-indigo-600 transition-colors flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Bookings</span>
                </Link>
              </>
            ) : (
              // User Navigation Links
              <>
                <Link to="/dashboard" className="text-gray-600 hover:text-indigo-600 transition-colors flex items-center gap-1">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <Link to="/dashboard?tab=rooms" className="text-gray-600 hover:text-indigo-600 transition-colors flex items-center gap-1">
                  <DoorOpen className="w-4 h-4" />
                  <span>Rooms</span>
                </Link>
                <Link to="/dashboard?tab=bookings" className="text-gray-600 hover:text-indigo-600 transition-colors flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>My Bookings</span>
                </Link>
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-2 transition-colors"
            >
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white">
                <User className="w-4 h-4" />
              </div>
              <span className="text-gray-700 hidden md:inline">{user?.name}</span>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg py-2 z-50">
                <div className="px-4 py-2 border-b">
                  <p className="font-semibold text-gray-800">{user?.name}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                  {isAdmin && (
                    <span className="inline-flex items-center gap-1 mt-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                      <Crown className="w-3 h-3" />
                      Administrator
                    </span>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;