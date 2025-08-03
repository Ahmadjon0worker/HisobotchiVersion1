// Tasks.js - Vazifalar boshqaruvi

let tasks = [];
let filteredTasks = [];
let currentUser = null;
let editingTaskId = null;
let users = []; // For assignee dropdown

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!requireAuth()) return;
    
    initializeTasksPage();
});

async function initializeTasksPage() {
    try {
        currentUser = getCurrentUser();
        updateUserInfo();
        await Promise.all([
            loadTasks(),
            loadUsers(),
            loadTaskStats()
        ]);
        setupEventListeners();
    } catch (error) {
        console.error('Failed to initialize tasks page:', error);
        showToast('Sahifani yuklashda xatolik yuz berdi', 'error');
    }
}

function updateUserInfo() {
    if (currentUser) {
        document.getElementById('userName').textContent = currentUser.full_name || currentUser.username;
        document.getElementById('userRole').textContent = currentUser.role;
        
        // Show/hide create button based on permissions
        const createTaskBtn = document.getElementById('createTaskBtn');
        if (createTaskBtn && !['admin', 'hr', 'superadmin'].includes(currentUser.role)) {
            createTaskBtn.style.display = 'none';
        }
    }
}

function setupEventListeners() {
    // Task form submission
    const taskForm = document.getElementById('taskForm');
    if (taskForm) {
        taskForm.addEventListener('submit', handleTaskSubmit);
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        const taskModal = document.getElementById('taskModal');
        const detailModal = document.getElementById('taskDetailModal');
        
        if (event.target === taskModal) {
            closeTaskModal();
        }
        if (event.target === detailModal) {
            closeTaskDetailModal();
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeTaskModal();
            closeTaskDetailModal();
        }
        if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();
            openTaskModal();
        }
    });
}

// Load tasks from API
async function loadTasks(params = {}) {
    showLoading(true);
    
    try {
        const queryParams = {
            page: params.page || PAGINATION.DEFAULT_PAGE,
            size: params.size || PAGINATION.DEFAULT_PAGE_SIZE,
            ...params
        };
        
        const response = await makeAuthenticatedRequest(API_ENDPOINTS.TASKS.LIST, {
            params: queryParams
        });
        
        if (response.ok) {
            const data = await response.json();
            
            // Handle different response formats
            if (Array.isArray(data)) {
                tasks = data;
            } else if (data.items) {
                tasks = data.items;
                // Store pagination info if available
                window.tasksPagination = {
                    total: data.total,
                    page: data.page,
                    size: data.size,
                    totalPages: data.total_pages
                };
            } else {
                tasks = [];
            }
            
            filteredTasks = [...tasks];
            renderTasks();
            showToast(`${tasks.length} ta vazifa yuklandi`, 'success');
        } else {
            const error = ApiUtils.handleApiError(new Error('Failed to load tasks'), response);
            throw new Error(error.message);
        }
    } catch (error) {
        console.error('Error loading tasks:', error);
        showToast(error.message || ERROR_MESSAGES.UNKNOWN_ERROR, 'error');
        showEmptyState();
    } finally {
        showLoading(false);
    }
}

// Load users for assignee dropdown
async function loadUsers() {
    try {
        const response = await makeAuthenticatedRequest(API_ENDPOINTS.USERS.LIST, {
            params: { size: 100 } // Get all users for dropdown
        });
        
        if (response.ok) {
            const data = await response.json();
            users = Array.isArray(data) ? data : (data.items || []);
            populateAssigneeDropdowns();
        }
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// Load task statistics
async function loadTaskStats() {
    try {
        const response = await makeAuthenticatedRequest(API_ENDPOINTS.TASKS.STATS);
        
        if (response.ok) {
            const stats = await response.json();
            updateTaskStatsDisplay(stats);
        }
    } catch (error) {
        console.error('Error loading task stats:', error);
    }
}

// Update task statistics display
function updateTaskStatsDisplay(stats) {
    document.getElementById('totalTasks').textContent = stats.total || 0;
    document.getElementById('pendingTasks').textContent = stats.pending || 0;
    document.getElementById('inProgressTasks').textContent = stats.in_progress || 0;
    document.getElementById('completedTasks').textContent = stats.completed || 0;
}

// Populate assignee dropdowns
function populateAssigneeDropdowns() {
    const assigneeDropdowns = ['taskAssignee', 'assigneeFilter'];
    
    assigneeDropdowns.forEach(dropdownId => {
        const dropdown = document.getElementById(dropdownId);
        if (dropdown) {
            // Clear existing options except first one
            while (dropdown.children.length > 1) {
                dropdown.removeChild(dropdown.lastChild);
            }
            
            // Add user options
            users.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = user.full_name || user.username;
                dropdown.appendChild(option);
            });
        }
    });
}

// Render tasks
function renderTasks() {
    const container = document.getElementById('tasksContainer');
    const emptyState = document.getElementById('emptyState');
    
    if (filteredTasks.length === 0) {
        container.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    container.innerHTML = filteredTasks.map(task => {
        const assignee = users.find(u => u.id === task.assignee_id);
        const dueDate = task.due_date ? new Date(task.due_date) : null;
        const isOverdue = dueDate && dueDate < new Date();
        const isDueSoon = dueDate && dueDate < new Date(Date.now() + 24 * 60 * 60 * 1000);
        
        return `
            <div class="task-card priority-${task.priority} animate-fade-in-up" onclick="viewTaskDetail(${task.id})">
                <div class="task-header">
                    <div>
                        <h3 class="task-title">${task.title}</h3>
                        ${task.description ? `<p class="task-description">${task.description}</p>` : ''}
                    </div>
                    <span class="task-priority ${task.priority}">${getPriorityDisplayName(task.priority)}</span>
                </div>
                
                <div class="task-meta">
                    ${assignee ? `
                        <div class="task-assignee">
                            <div class="task-assignee-avatar">${getInitials(assignee.full_name || assignee.username)}</div>
                            <span>${assignee.full_name || assignee.username}</span>
                        </div>
                    ` : '<div></div>'}
                    
                    ${dueDate ? `
                        <div class="task-due-date ${isOverdue ? 'overdue' : isDueSoon ? 'due-soon' : ''}">
                            <i class="fas fa-calendar"></i>
                            <span>${formatDate(dueDate)}</span>
                        </div>
                    ` : ''}
                </div>
                
                <div class="task-footer">
                    <span class="task-status ${task.status}">
                        <i class="fas fa-circle"></i>
                        ${getStatusDisplayName(task.status)}
                    </span>
                    
                    <div class="task-actions" onclick="event.stopPropagation()">
                        ${task.status !== 'completed' ? `
                            <button class="task-action-btn complete" onclick="completeTask(${task.id})" title="Bajarish">
                                <i class="fas fa-check"></i>
                            </button>
                        ` : ''}
                        ${canEditTask(task) ? `
                            <button class="task-action-btn edit" onclick="editTask(${task.id})" title="Tahrirlash">
                                <i class="fas fa-edit"></i>
                            </button>
                        ` : ''}
                        ${canDeleteTask(task) ? `
                            <button class="task-action-btn delete" onclick="deleteTask(${task.id})" title="O'chirish">
                                <i class="fas fa-trash"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Filter tasks
function filterTasks() {
    const statusFilter = document.getElementById('statusFilter').value;
    const priorityFilter = document.getElementById('priorityFilter').value;
    const assigneeFilter = document.getElementById('assigneeFilter').value;
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();
    
    filteredTasks = tasks.filter(task => {
        const matchesStatus = !statusFilter || task.status === statusFilter;
        const matchesPriority = !priorityFilter || task.priority === priorityFilter;
        const matchesAssignee = !assigneeFilter || task.assignee_id === parseInt(assigneeFilter);
        const matchesSearch = !searchQuery || 
            task.title.toLowerCase().includes(searchQuery) ||
            (task.description && task.description.toLowerCase().includes(searchQuery));
        
        return matchesStatus && matchesPriority && matchesAssignee && matchesSearch;
    });
    
    renderTasks();
}

// Open task modal for creating/editing
function openTaskModal(taskId = null) {
    const modal = document.getElementById('taskModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('taskForm');
    
    editingTaskId = taskId;
    
    if (taskId) {
        // Edit mode
        const task = tasks.find(t => t.id === taskId);
        if (!task) {
            showToast('Vazifa topilmadi', 'error');
            return;
        }
        
        modalTitle.textContent = 'Vazifani tahrirlash';
        
        // Fill form with task data
        form.taskTitle.value = task.title;
        form.taskPriority.value = task.priority;
        form.taskAssignee.value = task.assignee_id || '';
        form.taskDescription.value = task.description || '';
        
        if (task.due_date) {
            const dueDate = new Date(task.due_date);
            form.taskDueDate.value = dueDate.toISOString().slice(0, 16);
        }
    } else {
        // Create mode
        modalTitle.textContent = 'Yangi vazifa yaratish';
        form.reset();
        form.taskPriority.value = 'medium';
    }
    
    modal.style.display = 'block';
    modal.classList.add('animate-scale-in');
    form.taskTitle.focus();
}

// Close task modal
function closeTaskModal() {
    const modal = document.getElementById('taskModal');
    modal.style.display = 'none';
    modal.classList.remove('animate-scale-in');
    editingTaskId = null;
}

// Handle task form submission
async function handleTaskSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const taskData = Object.fromEntries(formData);
    
    // Convert assignee_id to integer if provided
    if (taskData.assignee_id) {
        taskData.assignee_id = parseInt(taskData.assignee_id);
    } else {
        delete taskData.assignee_id;
    }
    
    // Format due_date
    if (taskData.due_date) {
        taskData.due_date = ApiUtils.formatDateForApi(taskData.due_date);
    } else {
        delete taskData.due_date;
    }
    
    try {
        showLoading(true);
        
        let response;
        if (editingTaskId) {
            // Update task
            response = await makeAuthenticatedRequest(API_ENDPOINTS.TASKS.UPDATE(editingTaskId), {
                method: 'PUT',
                body: JSON.stringify(taskData)
            });
        } else {
            // Create task
            response = await makeAuthenticatedRequest(API_ENDPOINTS.TASKS.CREATE, {
                method: 'POST',
                body: JSON.stringify(taskData)
            });
        }
        
        if (response.ok) {
            const action = editingTaskId ? 'yangilandi' : 'yaratildi';
            showToast(`Vazifa muvaffaqiyatli ${action}`, 'success');
            closeTaskModal();
            await loadTasks();
            await loadTaskStats();
        } else {
            const errorData = await response.json().catch(() => ({}));
            const apiError = ApiUtils.handleApiError(new Error('Save failed'), response);
            showToast(errorData.detail || apiError.message, 'error');
        }
    } catch (error) {
        console.error('Error saving task:', error);
        const apiError = ApiUtils.handleApiError(error);
        showToast(apiError.message, 'error');
    } finally {
        showLoading(false);
    }
}

// View task detail
function viewTaskDetail(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
        showToast('Vazifa topilmadi', 'error');
        return;
    }
    
    const assignee = users.find(u => u.id === task.assignee_id);
    const modal = document.getElementById('taskDetailModal');
    const content = document.getElementById('taskDetailContent');
    
    content.innerHTML = `
        <div class="task-detail-grid">
            <div class="task-detail-item">
                <span class="task-detail-label">Nomi</span>
                <span class="task-detail-value">${task.title}</span>
            </div>
            
            <div class="task-detail-item">
                <span class="task-detail-label">Status</span>
                <span class="task-detail-value">
                    <span class="task-status ${task.status}">
                        <i class="fas fa-circle"></i>
                        ${getStatusDisplayName(task.status)}
                    </span>
                </span>
            </div>
            
            <div class="task-detail-item">
                <span class="task-detail-label">Muhimligi</span>
                <span class="task-detail-value">
                    <span class="task-priority ${task.priority}">${getPriorityDisplayName(task.priority)}</span>
                </span>
            </div>
            
            <div class="task-detail-item">
                <span class="task-detail-label">Javobgar</span>
                <span class="task-detail-value">${assignee ? (assignee.full_name || assignee.username) : 'Tayinlanmagan'}</span>
            </div>
            
            ${task.due_date ? `
                <div class="task-detail-item">
                    <span class="task-detail-label">Muddat</span>
                    <span class="task-detail-value">${formatDateTime(new Date(task.due_date))}</span>
                </div>
            ` : ''}
            
            <div class="task-detail-item">
                <span class="task-detail-label">Yaratilgan</span>
                <span class="task-detail-value">${formatDateTime(new Date(task.created_at))}</span>
            </div>
        </div>
        
        ${task.description ? `
            <div class="task-detail-item">
                <span class="task-detail-label">Tavsif</span>
                <div class="task-detail-value" style="white-space: pre-wrap; margin-top: 8px;">${task.description}</div>
            </div>
        ` : ''}
    `;
    
    // Store current task for editing
    window.currentDetailTask = task;
    
    // Show/hide edit button based on permissions
    const editBtn = document.getElementById('editTaskBtn');
    if (editBtn) {
        editBtn.style.display = canEditTask(task) ? 'block' : 'none';
    }
    
    modal.style.display = 'block';
}

// Close task detail modal
function closeTaskDetailModal() {
    const modal = document.getElementById('taskDetailModal');
    modal.style.display = 'none';
    window.currentDetailTask = null;
}

// Edit current task from detail modal
function editCurrentTask() {
    if (window.currentDetailTask) {
        closeTaskDetailModal();
        openTaskModal(window.currentDetailTask.id);
    }
}

// Complete task
async function completeTask(taskId) {
    try {
        showLoading(true);
        
        const response = await makeAuthenticatedRequest(API_ENDPOINTS.TASKS.COMPLETE(taskId), {
            method: 'POST'
        });
        
        if (response.ok) {
            showToast('Vazifa bajarilgan deb belgilandi', 'success');
            await loadTasks();
            await loadTaskStats();
        } else {
            const errorData = await response.json().catch(() => ({}));
            const apiError = ApiUtils.handleApiError(new Error('Complete failed'), response);
            showToast(errorData.detail || apiError.message, 'error');
        }
    } catch (error) {
        console.error('Error completing task:', error);
        const apiError = ApiUtils.handleApiError(error);
        showToast(apiError.message, 'error');
    } finally {
        showLoading(false);
    }
}

// Edit task
function editTask(taskId) {
    openTaskModal(taskId);
}

// Delete task
async function deleteTask(taskId) {
    if (!confirm('Haqiqatan ham bu vazifani o\'chirmoqchimisiz?')) {
        return;
    }
    
    try {
        showLoading(true);
        
        const response = await makeAuthenticatedRequest(API_ENDPOINTS.TASKS.DELETE(taskId), {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showToast('Vazifa muvaffaqiyatli o\'chirildi', 'success');
            await loadTasks();
            await loadTaskStats();
        } else {
            const errorData = await response.json().catch(() => ({}));
            const apiError = ApiUtils.handleApiError(new Error('Delete failed'), response);
            showToast(errorData.detail || apiError.message, 'error');
        }
    } catch (error) {
        console.error('Error deleting task:', error);
        const apiError = ApiUtils.handleApiError(error);
        showToast(apiError.message, 'error');
    } finally {
        showLoading(false);
    }
}

// Utility functions
function getInitials(name) {
    return name.split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('');
}

function getPriorityDisplayName(priority) {
    const priorities = {
        'low': 'Past',
        'medium': 'O\'rta',
        'high': 'Yuqori',
        'urgent': 'Shoshilinch'
    };
    return priorities[priority] || priority;
}

function getStatusDisplayName(status) {
    const statuses = {
        'pending': 'Kutilayotgan',
        'in_progress': 'Jarayonda',
        'completed': 'Bajarilgan',
        'cancelled': 'Bekor qilingan'
    };
    return statuses[status] || status;
}

function formatDate(date) {
    return date.toLocaleDateString('uz-UZ', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatDateTime(date) {
    return date.toLocaleString('uz-UZ', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function canEditTask(task) {
    if (!currentUser) return false;
    
    // Superadmin and admin can edit all tasks
    if (['superadmin', 'admin'].includes(currentUser.role)) {
        return true;
    }
    
    // HR can edit tasks they created or assigned to their department
    if (currentUser.role === 'hr') {
        return task.created_by === currentUser.id || task.assignee_id === currentUser.id;
    }
    
    // Users can edit only their own tasks
    return task.assignee_id === currentUser.id;
}

function canDeleteTask(task) {
    if (!currentUser) return false;
    
    // Superadmin and admin can delete all tasks
    if (['superadmin', 'admin'].includes(currentUser.role)) {
        return true;
    }
    
    // HR can delete tasks they created
    if (currentUser.role === 'hr') {
        return task.created_by === currentUser.id;
    }
    
    return false;
}

function showLoading(show) {
    const loading = document.getElementById('tasksLoading');
    if (loading) {
        loading.style.display = show ? 'flex' : 'none';
    }
}

function showEmptyState() {
    document.getElementById('tasksContainer').innerHTML = '';
    document.getElementById('emptyState').style.display = 'block';
}

function viewProfile() {
    alert('Profil bo\'limi hozirda ishlab chiqilmoqda');
}

// Export functions for global access
window.openTaskModal = openTaskModal;
window.closeTaskModal = closeTaskModal;
window.filterTasks = filterTasks;
window.viewTaskDetail = viewTaskDetail;
window.closeTaskDetailModal = closeTaskDetailModal;
window.editCurrentTask = editCurrentTask;
window.completeTask = completeTask;
window.editTask = editTask;
window.deleteTask = deleteTask;
window.viewProfile = viewProfile;