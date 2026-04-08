import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import roomService from '../../services/roomService';
import bookingService from '../../services/bookingService';
import authService from '../../services/authService';
import { 
  Plus, DoorOpen, Download, Calendar, Users, 
  Trash2, Edit, RefreshCw, FileText, 
  TrendingUp, CheckCircle, XCircle, Save, X,
  UserCog
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [stats, setStats] = useState({ 
    totalRooms: 0, 
    totalBookings: 0, 
    activeBookings: 0,
    totalUsers: 0,
    adminCount: 0,
    userCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('rooms');
  
  // Room form states
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomForm, setRoomForm] = useState({ name: '', capacity: '', equipment: '' });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);
const loadAllData = async () => {
  setLoading(true);
  try {
    console.log('🔄 Loading all data...');
    
    console.log('📡 Fetching rooms...');
    const roomsRes = await roomService.getAllRooms();
    console.log('Rooms response:', roomsRes);
    
    console.log('📡 Fetching bookings...');
    const bookingsRes = await bookingService.getAllBookings();
    console.log('Bookings response:', bookingsRes);
    
    console.log('📡 Fetching users...');
    const usersRes = await authService.getAllUsers();
    console.log('Users response:', usersRes);
    
    const roomsData = roomsRes.data || [];
    const bookingsData = bookingsRes.data || [];
    // IMPORTANT: Check the structure of usersRes
    const usersData = usersRes.data || (usersRes.success && Array.isArray(usersRes) ? usersRes : []);
    
    console.log('Processed users data:', usersData);
    console.log('Number of users:', usersData.length);
    
    setRooms(roomsData);
    setAllBookings(bookingsData);
    setAllUsers(usersData);
    setStats({
      totalRooms: roomsData.length,
      totalBookings: bookingsData.length,
      activeBookings: bookingsData.filter(b => b.status === 'ACTIVE').length,
      totalUsers: usersData.length,
      adminCount: usersData.filter(u => u.role === 'ADMIN').length,
      userCount: usersData.filter(u => u.role === 'USER').length
    });
  } catch (error) {
    console.error('❌ Error loading data:', error);
    toast.error('Failed to load dashboard data');
  } finally {
    setLoading(false);
  }
};

  // Reset form
  const resetForm = () => {
    setRoomForm({ name: '', capacity: '', equipment: '' });
    setEditingRoom(null);
  };

  // Handle form input change
  const handleInputChange = (e) => {
    setRoomForm({ ...roomForm, [e.target.name]: e.target.value });
  };

  // Create Room
  const handleCreateRoom = async (e) => {
    e.preventDefault();
    
    if (!roomForm.name || !roomForm.capacity) {
      toast.error('Please fill room name and capacity');
      return;
    }

    setFormLoading(true);
    try {
      const equipment = roomForm.equipment ? roomForm.equipment.split(',').map(e => e.trim()) : [];
      const response = await roomService.createRoom({
        name: roomForm.name,
        capacity: parseInt(roomForm.capacity),
        equipment,
      });
      
      if (response.success) {
        toast.success('Room created successfully!');
        resetForm();
        loadAllData();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create room');
    } finally {
      setFormLoading(false);
    }
  };

  // Update Room
  const handleUpdateRoom = async (e) => {
    e.preventDefault();
    
    if (!roomForm.name || !roomForm.capacity) {
      toast.error('Please fill room name and capacity');
      return;
    }

    setFormLoading(true);
    try {
      const equipment = roomForm.equipment ? roomForm.equipment.split(',').map(e => e.trim()) : [];
      const response = await roomService.updateRoom(editingRoom.id, {
        name: roomForm.name,
        capacity: parseInt(roomForm.capacity),
        equipment,
      });
      
      if (response.success) {
        toast.success('Room updated successfully!');
        resetForm();
        loadAllData();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update room');
    } finally {
      setFormLoading(false);
    }
  };

  // Delete Room
  const handleDeleteRoom = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete room "${name}"?\n\nThis will also delete all associated bookings.`)) return;
    
    try {
      const response = await roomService.deleteRoom(id);
      if (response.success) {
        toast.success('Room deleted successfully');
        loadAllData();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete room');
    }
  };

  // Edit Room - load data into form
  const handleEditRoom = (room) => {
    setEditingRoom(room);
    setRoomForm({
      name: room.name,
      capacity: room.capacity.toString(),
      equipment: Array.isArray(room.equipment) ? room.equipment.join(', ') : room.equipment || ''
    });
    setActiveTab('rooms');
    document.getElementById('roomForm')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Cancel edit
  const handleCancelEdit = () => {
    resetForm();
  };

  // Update User Role (Make Admin/User)
  const handleUpdateUserRole = async (userId, currentRole) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    const action = newRole === 'ADMIN' ? 'make admin' : 'remove admin';
    
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;
    
    try {
      const response = await authService.updateUserRole(userId, newRole);
      if (response.success) {
        toast.success(`User role updated to ${newRole}`);
        loadAllData();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

const handleExport = async (format) => {
  try {
    toast.loading(`Exporting ${format.toUpperCase()}...`, { id: 'export' });
    
    const response = await bookingService.exportBookings(format);
    
    // Create blob and download
    const blob = new Blob([response.data], { 
      type: format === 'csv' ? 'text/csv' : 'application/json' 
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bookings_${new Date().toISOString().split('T')[0]}.${format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    toast.success(`Exported as ${format.toUpperCase()} successfully!`, { id: 'export' });
  } catch (error) {
    console.error('Export error:', error);
    toast.error('Export failed: ' + (error.response?.data?.message || error.message), { id: 'export' });
  }
};
  const getStatusBadge = (status) => {
    if (status === 'ACTIVE') {
      return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800"><CheckCircle className="w-3 h-3" /> Active</span>;
    }
    return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800"><XCircle className="w-3 h-3" /> Cancelled</span>;
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
            <h1 className="text-2xl font-bold">Admin Control Center</h1>
            <p className="text-indigo-100 mt-1">Welcome back, {user?.name}! Manage rooms, users, and view all bookings.</p>
          </div>
          <div className="bg-yellow-500 rounded-full px-3 py-1 text-sm font-semibold">
            Administrator
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Rooms</p>
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
              <p className="text-gray-500 text-sm">Total Bookings</p>
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
              <p className="text-gray-500 text-sm">Active Bookings</p>
              <p className="text-3xl font-bold text-gray-800">{stats.activeBookings}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Users</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalUsers}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('rooms')}
          className={`px-4 py-2 font-medium transition-colors ${activeTab === 'rooms' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <DoorOpen className="w-4 h-4 inline mr-2" />
          Rooms Management
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 font-medium transition-colors ${activeTab === 'users' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Users className="w-4 h-4 inline mr-2" />
          User Management
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2 font-medium transition-colors ${activeTab === 'bookings' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Calendar className="w-4 h-4 inline mr-2" />
          All Bookings
        </button>
        <button
          onClick={() => setActiveTab('export')}
          className={`px-4 py-2 font-medium transition-colors ${activeTab === 'export' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Download className="w-4 h-4 inline mr-2" />
          Export Data
        </button>
      </div>

      {/* Rooms Tab Content */}
      {activeTab === 'rooms' && (
        <>
          {/* Create Room Form */}
          <div id="roomForm" className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {editingRoom ? '✏️ Edit Room' : '➕ Create New Room'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {editingRoom ? 'Update room details below' : 'Fill in the details to add a new meeting room'}
                </p>
              </div>
              {editingRoom && (
                <button onClick={handleCancelEdit} className="flex items-center gap-1 px-3 py-1 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                  <X className="w-4 h-4" />
                  Cancel Edit
                </button>
              )}
            </div>
            
            <form onSubmit={editingRoom ? handleUpdateRoom : handleCreateRoom} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Room Name *</label>
                  <input type="text" name="name" value={roomForm.name} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="e.g., Executive Board Room" required />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Capacity *</label>
                  <input type="number" name="capacity" value={roomForm.capacity} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="Number of people" required />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Equipment (comma separated)</label>
                <input type="text" name="equipment" value={roomForm.equipment} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="projector, TV, whiteboard, video conferencing" />
                <p className="text-xs text-gray-500 mt-1">Separate multiple items with commas</p>
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={formLoading} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                  {formLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save className="w-4 h-4" />}
                  {editingRoom ? 'Update Room' : 'Create Room'}
                </button>
                {!editingRoom && (
                  <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                    Clear Form
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Rooms Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-800">Manage Rooms</h3>
              <p className="text-sm text-gray-500">View, edit, and delete meeting rooms</p>
            </div>
            
            {rooms.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <DoorOpen className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p>No rooms created yet. Use the form above to create your first room.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr><th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Room Name</th><th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Capacity</th><th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Equipment</th><th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Created</th><th className="text-center px-6 py-3 text-sm font-semibold text-gray-600">Actions</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {rooms.map(room => (
                      <tr key={room.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4"><span className="font-medium text-gray-800">{room.name}</span></td>
                        <td className="px-6 py-4 text-gray-600">{room.capacity} people</td>
                        <td className="px-6 py-4"><div className="flex flex-wrap gap-1">{Array.isArray(room.equipment) && room.equipment.length > 0 ? room.equipment.map((item, idx) => (<span key={idx} className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">{item}</span>)) : <span className="text-gray-400 text-sm">No equipment</span>}</div></td>
                        <td className="px-6 py-4 text-sm text-gray-500">{new Date(room.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4"><div className="flex items-center justify-center gap-2"><button onClick={() => handleEditRoom(room)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg" title="Edit Room"><Edit className="w-4 h-4" /></button><button onClick={() => handleDeleteRoom(room.id, room.name)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" title="Delete Room"><Trash2 className="w-4 h-4" /></button></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Users Tab Content */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800">User Management</h3>
            <p className="text-sm text-gray-500">Manage user roles and permissions</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr><th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Name</th><th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Email</th><th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Role</th><th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Joined</th><th className="text-center px-6 py-3 text-sm font-semibold text-gray-600">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {allUsers.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4"><span className="font-medium text-gray-800">{u.name}</span></td>
                    <td className="px-6 py-4 text-gray-600">{u.email}</td>
                    <td className="px-6 py-4"><span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${u.role === 'ADMIN' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{u.role}</span></td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4"><div className="flex items-center justify-center"><button onClick={() => handleUpdateUserRole(u.id, u.role)} className={`flex items-center gap-1 px-3 py-1 text-sm rounded-lg transition-colors ${u.role === 'ADMIN' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}><UserCog className="w-3 h-3" />{u.role === 'ADMIN' ? 'Remove Admin' : 'Make Admin'}</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bookings Tab Content */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800">All System Bookings</h3>
            <p className="text-sm text-gray-500">Total: {allBookings.length} bookings</p>
          </div>
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {allBookings.length === 0 ? (<div className="p-12 text-center text-gray-500"><Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" /><p>No bookings found.</p></div>) : (allBookings.map(booking => (<div key={booking.id} className="p-4 hover:bg-gray-50"><div className="flex justify-between items-start flex-wrap gap-4"><div><h4 className="font-semibold text-gray-800">{booking.room?.name || 'Unknown Room'}</h4><p className="text-sm text-gray-600"><Users className="w-3 h-3 inline mr-1" /> User: {booking.user?.name} ({booking.user?.email})</p><p className="text-sm text-gray-500 mt-1"><Calendar className="w-3 h-3 inline mr-1" /> {new Date(booking.startTime).toLocaleString()} - {new Date(booking.endTime).toLocaleString()}</p></div>{getStatusBadge(booking.status)}</div></div>)))}
          </div>
        </div>
      )}

      {/* Export Tab Content */}
      {activeTab === 'export' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Export Data</h3>
          <div className="flex gap-4 flex-wrap">
            <button onClick={() => handleExport('csv')} className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"><FileText className="w-5 h-5" /> Export as CSV</button>
            <button onClick={() => handleExport('json')} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"><Download className="w-5 h-5" /> Export as JSON</button>
            <button onClick={loadAllData} className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"><RefreshCw className="w-5 h-5" /> Refresh All Data</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;