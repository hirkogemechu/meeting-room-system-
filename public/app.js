// ========================================
// MEETINGROOM PRO - Enterprise Application
// ========================================

const API_URL = 'http://localhost:3000';
let token = null, userId = null, userRole = null;

// DOM Elements
let loginSection, registerSection, appSection, loginAlert, registerAlert, bookingAlert;
let loginEmail, loginPassword, regName, regEmail, regPassword;
let roomSelect, bookingDate, startTime, endTime;
let roomsList, bookingsList, adminRoomsList, allBookingsList;
let userInfoDropdown;

console.log('🚀 MeetingRoom Pro - Initializing...');

document.addEventListener('DOMContentLoaded', () => {
    initializeElements();
    setDefaultDate();
    addEventListeners();
    setupRoleBasedNavigation();
    setTimeout(() => document.getElementById('loadingOverlay')?.remove(), 500);
    console.log('✅ Application ready');
});

function initializeElements() {
    loginSection = document.getElementById('loginSection');
    registerSection = document.getElementById('registerSection');
    appSection = document.getElementById('appSection');
    loginAlert = document.getElementById('loginAlert');
    registerAlert = document.getElementById('registerAlert');
    bookingAlert = document.getElementById('bookingAlert');
    loginEmail = document.getElementById('loginEmail');
    loginPassword = document.getElementById('loginPassword');
    regName = document.getElementById('regName');
    regEmail = document.getElementById('regEmail');
    regPassword = document.getElementById('regPassword');
    roomSelect = document.getElementById('roomSelect');
    bookingDate = document.getElementById('bookingDate');
    startTime = document.getElementById('startTime');
    endTime = document.getElementById('endTime');
    roomsList = document.getElementById('roomsList');
    bookingsList = document.getElementById('bookingsList');
    adminRoomsList = document.getElementById('adminRoomsList');
    allBookingsList = document.getElementById('allBookingsList');
    userInfoDropdown = document.getElementById('userInfoDropdown');
    
    window.loginBtn = document.getElementById('loginBtn');
    window.registerBtn = document.getElementById('registerBtn');
    window.logoutBtn = document.getElementById('logoutBtn');
    window.bookBtn = document.getElementById('bookBtn');
    window.showRegisterLink = document.getElementById('showRegisterLink');
    window.showLoginLink = document.getElementById('showLoginLink');
    window.exportCsvBtn = document.getElementById('exportCsvBtn');
    window.exportJsonBtn = document.getElementById('exportJsonBtn');
    window.createRoomForm = document.getElementById('createRoomForm');
}

function setDefaultDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    bookingDate.value = tomorrow.toISOString().split('T')[0];
    startTime.value = '10:00';
    endTime.value = '12:00';
}

function addEventListeners() {
    window.loginBtn?.addEventListener('click', login);
    window.registerBtn?.addEventListener('click', register);
    window.logoutBtn?.addEventListener('click', logout);
    window.bookBtn?.addEventListener('click', createBooking);
    window.showRegisterLink?.addEventListener('click', (e) => { e.preventDefault(); showRegister(); });
    window.showLoginLink?.addEventListener('click', (e) => { e.preventDefault(); showLogin(); });
    window.exportCsvBtn?.addEventListener('click', () => exportBookings('csv'));
    window.exportJsonBtn?.addEventListener('click', () => exportBookings('json'));
    window.createRoomForm?.addEventListener('submit', (e) => { e.preventDefault(); createRoom(); });
}

function setupRoleBasedNavigation() {
    const navLinks = document.getElementById('navLinks');
    if (!navLinks) return;
    
    navLinks.innerHTML = `
        <a href="#" data-section="dashboard" class="nav-link active"><i class="fas fa-home"></i><span>Dashboard</span></a>
        <a href="#" data-section="rooms" class="nav-link"><i class="fas fa-door-open"></i><span>Rooms</span></a>
        <a href="#" data-section="bookings" class="nav-link"><i class="fas fa-calendar-alt"></i><span>My Bookings</span></a>
        <a href="#" data-section="admin" class="nav-link admin-only hidden"><i class="fas fa-crown"></i><span>Admin</span></a>
    `;
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('data-section');
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            navigateToSection(section);
        });
    });
}

function navigateToSection(section) {
    const adminDashboard = document.getElementById('adminDashboard');
    const userDashboard = document.getElementById('userDashboard');
    
    if (userRole === 'ADMIN') {
        adminDashboard.classList.remove('hidden');
        userDashboard.classList.add('hidden');
        if (section === 'rooms') document.getElementById('adminRoomsList')?.scrollIntoView({ behavior: 'smooth' });
        else if (section === 'bookings') document.getElementById('allBookingsList')?.scrollIntoView({ behavior: 'smooth' });
        else if (section === 'admin') window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        adminDashboard.classList.add('hidden');
        userDashboard.classList.remove('hidden');
        if (section === 'rooms') document.querySelector('.section-header')?.scrollIntoView({ behavior: 'smooth' });
        else if (section === 'bookings') document.querySelectorAll('.section-header')[1]?.scrollIntoView({ behavior: 'smooth' });
        else window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function showAlert(element, message, type) {
    if (!element) return;
    element.className = `alert alert-${type}`;
    element.innerHTML = message;
    setTimeout(() => { element.innerHTML = ''; element.className = ''; }, 5000);
}

function showLogin() { loginSection.classList.remove('hidden'); registerSection.classList.add('hidden'); }
function showRegister() { loginSection.classList.add('hidden'); registerSection.classList.remove('hidden'); }

async function register() {
    const name = regName?.value, email = regEmail?.value, password = regPassword?.value;
    if (!name || !email || !password) return showAlert(registerAlert, 'Please fill all fields', 'error');
    if (password.length < 8) return showAlert(registerAlert, 'Password must be at least 8 characters', 'error');
    if (!/[A-Z]/.test(password)) return showAlert(registerAlert, 'Password must contain an uppercase letter', 'error');
    if (!/[a-z]/.test(password)) return showAlert(registerAlert, 'Password must contain a lowercase letter', 'error');
    if (!/[0-9]/.test(password)) return showAlert(registerAlert, 'Password must contain a number', 'error');

    try {
        const res = await fetch(`${API_URL}/api/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password }) });
        const data = await res.json();
        if (data.success) {
            showAlert(registerAlert, '✅ Registration successful! Please login.', 'success');
            regName.value = regEmail.value = regPassword.value = '';
            setTimeout(() => showLogin(), 2000);
        } else showAlert(registerAlert, data.message, 'error');
    } catch (error) { showAlert(registerAlert, 'Registration failed: ' + error.message, 'error'); }
}

async function login() {
    const email = loginEmail?.value, password = loginPassword?.value;
    if (!email || !password) return showAlert(loginAlert, 'Please enter email and password', 'error');

    try {
        const res = await fetch(`${API_URL}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
        const data = await res.json();
        if (data.success) {
            token = data.data.accessToken;
            userId = data.data.user.id;
            userRole = data.data.user.role;
            
            loginSection.classList.add('hidden');
            appSection.classList.remove('hidden');
            
            const roleBadge = userRole === 'ADMIN' ? '<span class="role-badge role-admin">ADMIN</span>' : '<span class="role-badge role-user">USER</span>';
            if (userInfoDropdown) userInfoDropdown.innerHTML = `<div><strong>${escapeHtml(data.data.user.name)}</strong> ${roleBadge}</div><div style="font-size:12px;color:#6b7280;">${escapeHtml(data.data.user.email)}</div>`;
            
            document.querySelectorAll('.admin-only').forEach(el => el.classList.toggle('hidden', userRole !== 'ADMIN'));
            
            if (userRole === 'ADMIN') {
                document.getElementById('adminDashboard').classList.remove('hidden');
                document.getElementById('userDashboard').classList.add('hidden');
                await loadAdminStats();
                await loadAdminRooms();
                await loadAllBookings();
            } else {
                document.getElementById('adminDashboard').classList.add('hidden');
                document.getElementById('userDashboard').classList.remove('hidden');
                await loadUserStats();
                await loadRooms();
                await loadMyBookings();
            }
        } else showAlert(loginAlert, data.message, 'error');
    } catch (error) { showAlert(loginAlert, 'Login failed: ' + error.message, 'error'); }
}

async function loadRooms() {
    try {
        const res = await fetch(`${API_URL}/api/rooms`, { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        if (data.success && data.data) {
            roomSelect.innerHTML = '<option value="">Select a room</option>';
            roomsList.innerHTML = data.data.length ? data.data.map(room => `
                <div class="room-card"><h3>${escapeHtml(room.name)}</h3><p><i class="fas fa-users"></i> Capacity: ${room.capacity} people</p><p><i class="fas fa-tools"></i> Equipment: ${room.equipment?.join(', ') || 'None'}</p><div class="equipment"><i class="fas fa-check-circle"></i> Available</div></div>
            `).join('') : '<div class="empty-state">🏠 No rooms available</div>';
            data.data.forEach(room => { const opt = document.createElement('option'); opt.value = room.id; opt.textContent = `${room.name} (Capacity: ${room.capacity})`; roomSelect.appendChild(opt); });
        }
    } catch (error) { console.error('Error loading rooms:', error); }
}

async function loadMyBookings() {
    try {
        const res = await fetch(`${API_URL}/api/bookings/my-bookings`, { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        bookingsList.innerHTML = data.success && data.data?.length ? data.data.map(booking => `
            <div class="booking-card"><h3>${escapeHtml(booking.room?.name)}</h3><p><i class="fas fa-calendar"></i> ${new Date(booking.startTime).toLocaleString()}</p><p><i class="fas fa-clock"></i> Duration: ${((new Date(booking.endTime) - new Date(booking.startTime)) / 3600000).toFixed(1)} hrs</p><button class="cancel-btn" data-id="${booking.id}"><i class="fas fa-times"></i> Cancel</button></div>
        `).join('') : '<div class="empty-state">📭 No bookings found</div>';
        document.querySelectorAll('.cancel-btn').forEach(btn => btn.addEventListener('click', () => cancelBooking(btn.dataset.id)));
    } catch (error) { console.error('Error loading bookings:', error); }
}

async function createBooking() {
    const roomId = roomSelect?.value, date = bookingDate?.value, start = startTime?.value, end = endTime?.value;
    if (!roomId || !date || !start || !end) return showAlert(bookingAlert, 'Please fill all fields', 'error');
    try {
        const res = await fetch(`${API_URL}/api/bookings`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ roomId, startTime: new Date(`${date}T${start}:00`).toISOString(), endTime: new Date(`${date}T${end}:00`).toISOString() }) });
        const data = await res.json();
        if (data.success) { showAlert(bookingAlert, '✅ Booking created!', 'success'); loadMyBookings(); loadUserStats(); }
        else showAlert(bookingAlert, data.message, 'error');
    } catch (error) { showAlert(bookingAlert, 'Booking failed: ' + error.message, 'error'); }
}

async function cancelBooking(id) {
    if (!confirm('Cancel this booking?')) return;
    try {
        const res = await fetch(`${API_URL}/api/bookings/${id}/cancel`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        if (data.success) { showAlert(bookingAlert, '✅ Booking cancelled', 'success'); loadMyBookings(); loadUserStats(); if (userRole === 'ADMIN') loadAllBookings(); }
        else showAlert(bookingAlert, data.message, 'error');
    } catch (error) { showAlert(bookingAlert, 'Cancellation failed: ' + error.message, 'error'); }
}

async function createRoom() {
    const name = document.getElementById('roomName')?.value, capacity = parseInt(document.getElementById('roomCapacity')?.value), equipment = document.getElementById('roomEquipment')?.value?.split(',').map(e => e.trim()) || [];
    if (!name || !capacity) return showAlert(bookingAlert, 'Please fill room name and capacity', 'error');
    try {
        const res = await fetch(`${API_URL}/api/rooms`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ name, capacity, equipment }) });
        const data = await res.json();
        if (data.success) {
            showAlert(bookingAlert, '✅ Room created!', 'success');
            document.getElementById('roomName').value = document.getElementById('roomCapacity').value = document.getElementById('roomEquipment').value = '';
            loadRooms(); loadAdminRooms(); loadAdminStats(); loadUserStats();
        } else showAlert(bookingAlert, data.message, 'error');
    } catch (error) { showAlert(bookingAlert, 'Failed: ' + error.message, 'error'); }
}

async function loadAdminRooms() {
    try {
        const res = await fetch(`${API_URL}/api/rooms`, { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        adminRoomsList.innerHTML = data.success && data.data?.length ? data.data.map(room => `
            <div class="admin-room-card"><div><h4>${escapeHtml(room.name)}</h4><p>Capacity: ${room.capacity} | Equipment: ${room.equipment?.join(', ') || 'None'}</p></div><button onclick="deleteRoom('${room.id}')" class="delete-btn"><i class="fas fa-trash"></i> Delete</button></div>
        `).join('') : '<div class="empty-state">No rooms yet</div>';
    } catch (error) { console.error('Error:', error); }
}

window.deleteRoom = async (id) => {
    if (!confirm('Delete this room? All bookings will be lost.')) return;
    try {
        const res = await fetch(`${API_URL}/api/rooms/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        if (data.success) { showAlert(bookingAlert, '✅ Room deleted', 'success'); loadRooms(); loadAdminRooms(); loadAdminStats(); loadUserStats(); }
        else showAlert(bookingAlert, data.message, 'error');
    } catch (error) { showAlert(bookingAlert, 'Failed: ' + error.message, 'error'); }
};

async function loadAllBookings() {
    try {
        const res = await fetch(`${API_URL}/api/bookings`, { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        allBookingsList.innerHTML = data.success && data.data?.length ? data.data.map(booking => `
            <div class="booking-card"><h3>${escapeHtml(booking.room?.name)}</h3><p><i class="fas fa-user"></i> ${escapeHtml(booking.user?.name)} (${booking.user?.email})</p><p><i class="fas fa-calendar"></i> ${new Date(booking.startTime).toLocaleString()}</p><p><i class="fas fa-tag"></i> Status: <span class="badge badge-${booking.status === 'ACTIVE' ? 'success' : 'danger'}">${booking.status}</span></p></div>
        `).join('') : '<div class="empty-state">No bookings</div>';
    } catch (error) { console.error('Error:', error); }
}

async function loadAdminStats() {
    try {
        const rooms = await fetch(`${API_URL}/api/rooms`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json());
        const bookings = await fetch(`${API_URL}/api/bookings`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json());
        document.getElementById('adminTotalRooms').textContent = rooms.data?.length || 0;
        document.getElementById('adminTotalBookings').textContent = bookings.data?.length || 0;
        document.getElementById('adminTotalUsers').textContent = '1';
    } catch (error) { console.error('Error loading stats:', error); }
}

async function loadUserStats() {
    try {
        const rooms = await fetch(`${API_URL}/api/rooms`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json());
        const bookings = await fetch(`${API_URL}/api/bookings/my-bookings`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json());
        document.getElementById('userTotalRooms').textContent = rooms.data?.length || 0;
        document.getElementById('userTotalBookings').textContent = bookings.data?.length || 0;
        document.getElementById('userUpcomingBookings').textContent = bookings.data?.filter(b => new Date(b.startTime) > new Date()).length || 0;
    } catch (error) { console.error('Error loading stats:', error); }
}

async function exportBookings(format) {
    try {
        const res = await fetch(`${API_URL}/api/bookings/export?format=${format}`, { headers: { 'Authorization': `Bearer ${token}` } });
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bookings_${new Date().toISOString()}.${format}`;
        a.click();
        URL.revokeObjectURL(url);
        showAlert(bookingAlert, `✅ Exported as ${format.toUpperCase()}`, 'success');
    } catch (error) { showAlert(bookingAlert, 'Export failed: ' + error.message, 'error'); }
}

function logout() { token = null; userId = null; userRole = null; appSection.classList.add('hidden'); loginSection.classList.remove('hidden'); loginEmail.value = 'myuser@test.com'; loginPassword.value = 'MyPass123'; }

function escapeHtml(text) { if (!text) return ''; return text.replace(/[&<>]/g, function(m) { if (m === '&') return '&amp;'; if (m === '<') return '&lt;'; if (m === '>') return '&gt;'; return m; }); }