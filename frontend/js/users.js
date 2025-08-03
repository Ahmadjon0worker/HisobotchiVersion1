// Users.js - Foydalanuvchilar boshqaruvi

let users = [];
let filteredUsers = [];
let currentUser = null;
let editingUserId = null;

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication and permissions
    if (!requireAuth()) return;
    if (!requireRole('hr')) return;
    
    initializeUsersPage();
});

async function initializeUsersPage() {
    try {
        currentUser = getCurrentUser();
        updateUserInfo();
        await loadUsers();
        setupEventListeners();
    } catch (error) {
        console.error('Failed to initialize users page:', error);
        showToast('Sahifani yuklashda xatolik yuz berdi', 'error');
    }
}

function updateUserInfo() {
    if (currentUser) {
        document.getElementById('userName').textContent = currentUser.full_name || currentUser.username;
        document.getElementById('userRole').textContent = currentUser.role;
    }
}

function setupEventListeners() {
    // User form submission
    document.getElementById('userForm').addEventListener('submit', handleUserSubmit);
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        const userModal = document.getElementById('userModal');
        const deleteModal = document.getElementById('deleteModal');
        
        if (event.target === userModal) {
            closeUserModal();
        }
        if (event.target === deleteModal) {
            closeDeleteModal();
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeUserModal();
            closeDeleteModal();
        }
        if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();
            openUserModal();
        }
    });
}

// Load users from API
async function loadUsers(params = {}) {
    showLoading(true);
    
    try {
        const queryParams = {
            page: params.page || PAGINATION.DEFAULT_PAGE,
            size: params.size || PAGINATION.DEFAULT_PAGE_SIZE,
            ...params
        };
        
        const response = await makeAuthenticatedRequest(API_ENDPOINTS.USERS.LIST, {
            params: queryParams
        });
        
        if (response.ok) {
            const data = await response.json();
            
            // Handle different response formats
            if (Array.isArray(data)) {
                users = data;
            } else if (data.items) {
                users = data.items;
                // Store pagination info if available
                window.usersPagination = {
                    total: data.total,
                    page: data.page,
                    size: data.size,
                    totalPages: data.total_pages
                };
            } else {
                users = [];
            }
            
            filteredUsers = [...users];
            renderUsers();
            updateUserStats();
            showToast(`${users.length} ta xodim yuklandi`, 'success');
        } else {
            const error = ApiUtils.handleApiError(new Error('Failed to load users'), response);
            throw new Error(error.message);
        }
    } catch (error) {
        console.error('Error loading users:', error);
        showToast(error.message || ERROR_MESSAGES.UNKNOWN_ERROR, 'error');
        showEmptyState();
    } finally {
        showLoading(false);
    }
}

// Update user statistics
function updateUserStats() {
    // Load user count if available
    loadUserCount();
}

// Load user count
async function loadUserCount() {
    try {
        const response = await makeAuthenticatedRequest(API_ENDPOINTS.USERS.COUNT);
        if (response.ok) {
            const data = await response.json();
            // Update any count displays if needed
            console.log('Total users:', data.count || data.total);
        }
    } catch (error) {
        console.error('Error loading user count:', error);
    }
}

// Render users table
function renderUsers() {
    const tbody = document.getElementById('usersTableBody');
    const emptyState = document.getElementById('emptyState');
    
    if (filteredUsers.length === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    tbody.innerHTML = filteredUsers.map(user => `
        <tr class="animate-fade-in-up transition-all hover:shadow-md">
            <td>
                <div class="user-avatar">
                    ${user.avatar_url ? 
                        `<img src="${user.avatar_url}" alt="${user.full_name}" class="avatar-img">` :
                        `<div class="avatar-placeholder">${getInitials(user.full_name || user.username)}</div>`
                    }
                </div>
            </td>
            <td>
                <div class="user-name">
                    <strong>${user.full_name || user.username}</strong>
                    <span class="username">@${user.username}</span>
                </div>
            </td>
            <td>${user.email || '-'}</td>
            <td>
                <span class="role-badge ${user.role}">
                    ${getRoleDisplayName(user.role)}
                </span>
            </td>
            <td>${user.department || '-'}</td>
            <td>${user.phone || '-'}</td>
            <td>
                <span class="status-badge ${user.is_active ? 'active' : 'inactive'}">
                    <i class="fas fa-circle"></i>
                    ${user.is_active ? 'Faol' : 'Nofaol'}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon btn-edit transition-all hover:scale-110" 
                            onclick="editUser(${user.id})" 
                            title="Tahrirlash">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${canDeleteUser(user) ? `
                        <button class="btn-icon btn-delete transition-all hover:scale-110" 
                                onclick="deleteUser(${user.id})" 
                                title="O'chirish">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : ''}
                    <button class="btn-icon btn-view transition-all hover:scale-110" 
                            onclick="viewUser(${user.id})" 
                            title="Ko'rish">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Filter users
function filterUsers() {
    const roleFilter = document.getElementById('roleFilter').value;
    const departmentFilter = document.getElementById('departmentFilter').value;
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();
    
    filteredUsers = users.filter(user => {
        const matchesRole = !roleFilter || user.role === roleFilter;
        const matchesDepartment = !departmentFilter || user.department === departmentFilter;
        const matchesSearch = !searchQuery || 
            (user.full_name && user.full_name.toLowerCase().includes(searchQuery)) ||
            user.username.toLowerCase().includes(searchQuery) ||
            (user.email && user.email.toLowerCase().includes(searchQuery));
        
        return matchesRole && matchesDepartment && matchesSearch;
    });
    
    renderUsers();
}

// Open user modal for creating/editing
function openUserModal(userId = null) {
    const modal = document.getElementById('userModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('userForm');
    const passwordGroup = document.getElementById('passwordGroup');
    
    editingUserId = userId;
    
    if (userId) {
        // Edit mode
        const user = users.find(u => u.id === userId);
        if (!user) {
            showToast('Foydalanuvchi topilmadi', 'error');
            return;
        }
        
        modalTitle.textContent = 'Xodim ma\'lumotlarini tahrirlash';
        passwordGroup.style.display = 'none';
        
        // Fill form with user data
        form.fullName.value = user.full_name || '';
        form.username.value = user.username;
        form.email.value = user.email || '';
        form.phone.value = user.phone || '';
        form.role.value = user.role;
        form.department.value = user.department || '';
        form.isActive.value = user.is_active.toString();
    } else {
        // Create mode
        modalTitle.textContent = 'Yangi xodim qo\'shish';
        passwordGroup.style.display = 'block';
        form.reset();
        form.isActive.value = 'true';
    }
    
    modal.style.display = 'block';
    modal.classList.add('animate-scale-in');
    form.fullName.focus();
}

// Close user modal
function closeUserModal() {
    const modal = document.getElementById('userModal');
    modal.style.display = 'none';
    modal.classList.remove('animate-scale-in');
    editingUserId = null;
}

// Handle user form submission
async function handleUserSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const userData = Object.fromEntries(formData);
    
    // Convert is_active to boolean
    userData.is_active = userData.isActive === 'true';
    delete userData.isActive;
    
    try {
        showLoading(true);
        
        let response;
        if (editingUserId) {
            // Update user
            delete userData.password; // Don't send password on update
            response = await makeAuthenticatedRequest(API_ENDPOINTS.USERS.UPDATE(editingUserId), {
                method: 'PUT',
                body: JSON.stringify(userData)
            });
        } else {
            // Create user
            if (!userData.password) {
                showToast(ERROR_MESSAGES.REQUIRED_FIELD, 'warning');
                return;
            }
            response = await makeAuthenticatedRequest(API_ENDPOINTS.USERS.CREATE, {
                method: 'POST',
                body: JSON.stringify(userData)
            });
        }
        
        if (response.ok) {
            const action = editingUserId ? 'yangilandi' : 'qo\'shildi';
            showToast(`Xodim muvaffaqiyatli ${action}`, 'success');
            closeUserModal();
            await loadUsers();
        } else {
            const errorData = await response.json().catch(() => ({}));
            const apiError = ApiUtils.handleApiError(new Error('Save failed'), response);
            showToast(errorData.detail || apiError.message, 'error');
        }
    } catch (error) {
        console.error('Error saving user:', error);
        const apiError = ApiUtils.handleApiError(error);
        showToast(apiError.message, 'error');
    } finally {
        showLoading(false);
    }
}

// Edit user
function editUser(userId) {
    openUserModal(userId);
}

// Delete user
function deleteUser(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) {
        showToast('Foydalanuvchi topilmadi', 'error');
        return;
    }
    
    if (!canDeleteUser(user)) {
        showToast('Bu foydalanuvchini o\'chirishga ruxsatingiz yo\'q', 'error');
        return;
    }
    
    document.getElementById('deleteUserName').textContent = user.full_name || user.username;
    document.getElementById('deleteModal').style.display = 'block';
    
    // Store user ID for deletion
    window.deleteUserId = userId;
}

// Close delete modal
function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
    window.deleteUserId = null;
}

// Confirm user deletion
async function confirmDelete() {
    const userId = window.deleteUserId;
    if (!userId) return;
    
    try {
        showLoading(true);
        
        const response = await makeAuthenticatedRequest(API_ENDPOINTS.USERS.DELETE(userId), {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showToast('Xodim muvaffaqiyatli o\'chirildi', 'success');
            closeDeleteModal();
            await loadUsers();
        } else {
            const errorData = await response.json().catch(() => ({}));
            const apiError = ApiUtils.handleApiError(new Error('Delete failed'), response);
            showToast(errorData.detail || apiError.message, 'error');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        const apiError = ApiUtils.handleApiError(error);
        showToast(apiError.message, 'error');
    } finally {
        showLoading(false);
    }
}

// View user details
function viewUser(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) {
        showToast('Foydalanuvchi topilmadi', 'error');
        return;
    }
    
    // Create user details modal or redirect to profile page
    alert(`Foydalanuvchi ma'lumotlari:\n\nIsm: ${user.full_name || user.username}\nEmail: ${user.email || 'Kiritilmagan'}\nLavozim: ${getRoleDisplayName(user.role)}\nBo'lim: ${user.department || 'Kiritilmagan'}\nStatus: ${user.is_active ? 'Faol' : 'Nofaol'}`);
}

// Utility functions
function getInitials(name) {
    return name.split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('');
}

function getRoleDisplayName(role) {
    const roleNames = {
        'user': 'User',
        'hr': 'HR',
        'admin': 'Admin',
        'superadmin': 'Super Admin'
    };
    return roleNames[role] || role;
}

function canDeleteUser(user) {
    if (!currentUser) return false;
    
    // Super admin can delete anyone except themselves
    if (currentUser.role === 'superadmin') {
        return user.id !== currentUser.id;
    }
    
    // Admin can delete users and HR
    if (currentUser.role === 'admin') {
        return ['user', 'hr'].includes(user.role) && user.id !== currentUser.id;
    }
    
    // HR can delete only users
    if (currentUser.role === 'hr') {
        return user.role === 'user';
    }
    
    return false;
}

function showLoading(show) {
    const loading = document.getElementById('usersLoading');
    if (loading) {
        loading.style.display = show ? 'flex' : 'none';
    }
}

function showEmptyState() {
    document.getElementById('usersTableBody').innerHTML = '';
    document.getElementById('emptyState').style.display = 'block';
}

function viewProfile() {
    alert('Profil bo\'limi hozirda ishlab chiqilmoqda');
}

// Export functions for global access
window.openUserModal = openUserModal;
window.closeUserModal = closeUserModal;
window.filterUsers = filterUsers;
window.editUser = editUser;
window.deleteUser = deleteUser;
window.closeDeleteModal = closeDeleteModal;
window.confirmDelete = confirmDelete;
window.viewUser = viewUser;
window.viewProfile = viewProfile;