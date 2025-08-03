// API Configuration - Backend bilan bog'lanish uchun

// ===== API BASE CONFIGURATION =====
const API_CONFIG = {
    // Development environment
    development: {
        BASE_URL: 'http://localhost:8000',
        API_VERSION: '/api/v1',
        TIMEOUT: 30000,
        WEBSOCKET_URL: 'ws://localhost:8000/ws'
    },
    
    // Production environment
    production: {
        BASE_URL: 'https://your-domain.com',
        API_VERSION: '/api/v1', 
        TIMEOUT: 30000,
        WEBSOCKET_URL: 'wss://your-domain.com/ws'
    },
    
    // Staging environment
    staging: {
        BASE_URL: 'https://staging-api.your-domain.com',
        API_VERSION: '/api/v1',
        TIMEOUT: 30000,
        WEBSOCKET_URL: 'wss://staging-api.your-domain.com/ws'
    }
};

// Auto-detect environment
const ENV = process?.env?.NODE_ENV || 
    (window.location.hostname === 'localhost' ? 'development' : 'production');

// Current configuration
const CONFIG = API_CONFIG[ENV];

// ===== API ENDPOINTS =====
const API_ENDPOINTS = {
    // Authentication
    AUTH: {
        LOGIN: '/auth/login',
        LOGOUT: '/auth/logout',
        REFRESH: '/auth/refresh',
        ME: '/auth/me',
        REGISTER: '/auth/register',
        FORGOT_PASSWORD: '/auth/forgot-password',
        RESET_PASSWORD: '/auth/reset-password'
    },
    
    // Users Management
    USERS: {
        LIST: '/users/',
        CREATE: '/users/',
        GET: (id) => `/users/${id}`,
        UPDATE: (id) => `/users/${id}`,
        DELETE: (id) => `/users/${id}`,
        COUNT: '/users/count',
        DEPARTMENTS: '/users/departments',
        ROLES: '/users/roles',
        SEARCH: '/users/search',
        BULK_IMPORT: '/users/bulk-import',
        EXPORT: '/users/export'
    },
    
    // Tasks Management
    TASKS: {
        LIST: '/tasks/',
        CREATE: '/tasks/',
        GET: (id) => `/tasks/${id}`,
        UPDATE: (id) => `/tasks/${id}`,
        DELETE: (id) => `/tasks/${id}`,
        COUNT: '/tasks/count',
        STATS: '/tasks/stats',
        BY_STATUS: (status) => `/tasks/status/${status}`,
        BY_ASSIGNEE: (userId) => `/tasks/assignee/${userId}`,
        BY_PRIORITY: (priority) => `/tasks/priority/${priority}`,
        COMPLETE: (id) => `/tasks/${id}/complete`,
        ASSIGN: (id) => `/tasks/${id}/assign`,
        COMMENTS: (id) => `/tasks/${id}/comments`,
        ATTACHMENTS: (id) => `/tasks/${id}/attachments`
    },
    
    // Reports Management
    REPORTS: {
        LIST: '/reports/',
        CREATE: '/reports/',
        GET: (id) => `/reports/${id}`,
        UPDATE: (id) => `/reports/${id}`,
        DELETE: (id) => `/reports/${id}`,
        COUNT: '/reports/count',
        STATS: '/reports/stats',
        BY_USER: (userId) => `/reports/user/${userId}`,
        BY_DATE_RANGE: '/reports/date-range',
        DOWNLOAD: (id) => `/reports/${id}/download`,
        APPROVE: (id) => `/reports/${id}/approve`,
        REJECT: (id) => `/reports/${id}/reject`,
        EXPORT: '/reports/export'
    },
    
    // Chat/Messages
    CHAT: {
        CONVERSATIONS: '/chat/conversations',
        MESSAGES: (conversationId) => `/chat/conversations/${conversationId}/messages`,
        SEND: '/chat/send',
        MARK_READ: (messageId) => `/chat/messages/${messageId}/read`,
        SEARCH: '/chat/search',
        ATTACHMENTS: '/chat/attachments',
        USERS_ONLINE: '/chat/users/online'
    },
    
    // Time Tracking
    TIME_TRACKING: {
        LIST: '/time-tracking/',
        CREATE: '/time-tracking/',
        GET: (id) => `/time-tracking/${id}`,
        UPDATE: (id) => `/time-tracking/${id}`,
        DELETE: (id) => `/time-tracking/${id}`,
        STATS: '/time-tracking/stats',
        BY_USER: (userId) => `/time-tracking/user/${userId}`,
        BY_DATE: '/time-tracking/date',
        EXPORT: '/time-tracking/export'
    },
    
    // File Management
    FILES: {
        UPLOAD: '/files/upload',
        DOWNLOAD: (id) => `/files/${id}/download`,
        DELETE: (id) => `/files/${id}`,
        LIST: '/files/',
        AVATAR_UPLOAD: '/files/avatar',
        REPORT_ATTACHMENT: '/files/report-attachment'
    },
    
    // Dashboard & Analytics
    DASHBOARD: {
        STATS: '/dashboard/stats',
        RECENT_ACTIVITY: '/dashboard/activity',
        NOTIFICATIONS: '/dashboard/notifications',
        CHARTS: '/dashboard/charts',
        SUMMARY: '/dashboard/summary'
    },
    
    // System & Admin
    ADMIN: {
        SYSTEM_INFO: '/admin/system-info',
        LOGS: '/admin/logs',
        SETTINGS: '/admin/settings',
        BACKUP: '/admin/backup',
        USERS_ACTIVITY: '/admin/users-activity'
    }
};

// ===== REQUEST CONFIGURATION =====
const REQUEST_CONFIG = {
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    },
    timeout: CONFIG.TIMEOUT,
    retry: {
        attempts: 3,
        delay: 1000,
        backoff: 2
    }
};

// ===== HTTP STATUS CODES =====
const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504
};

// ===== ERROR MESSAGES =====
const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Tarmoq xatoligi. Internet ulanishingizni tekshiring.',
    TIMEOUT_ERROR: 'So\'rov vaqti tugadi. Qaytadan urinib ko\'ring.',
    SERVER_ERROR: 'Server xatoligi. Keyinroq urinib ko\'ring.',
    UNAUTHORIZED: 'Ruxsat berilmagan. Qaytadan kiring.',
    FORBIDDEN: 'Bu amalni bajarishga ruxsatingiz yo\'q.',
    NOT_FOUND: 'Ma\'lumot topilmadi.',
    VALIDATION_ERROR: 'Ma\'lumotlarni to\'g\'ri kiriting.',
    UNKNOWN_ERROR: 'Noma\'lum xatolik yuz berdi.',
    
    // Uzbek translations for common errors
    REQUIRED_FIELD: 'Bu maydon to\'ldirilishi shart',
    INVALID_EMAIL: 'Email manzil noto\'g\'ri',
    INVALID_PHONE: 'Telefon raqam noto\'g\'ri',
    PASSWORD_TOO_SHORT: 'Parol kamida 8 ta belgidan iborat bo\'lishi kerak',
    PASSWORDS_NOT_MATCH: 'Parollar mos emas',
    FILE_TOO_LARGE: 'Fayl hajmi juda katta',
    INVALID_FILE_TYPE: 'Fayl turi qo\'llab-quvvatlanmaydi'
};

// ===== VALIDATION RULES =====
const VALIDATION_RULES = {
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE_REGEX: /^(\+998|998)?[0-9]{9}$/,
    PASSWORD_MIN_LENGTH: 8,
    USERNAME_MIN_LENGTH: 3,
    USERNAME_MAX_LENGTH: 50,
    
    FILE_SIZE_LIMITS: {
        IMAGE: 5 * 1024 * 1024, // 5MB
        DOCUMENT: 10 * 1024 * 1024, // 10MB
        VIDEO: 50 * 1024 * 1024 // 50MB
    },
    
    ALLOWED_FILE_TYPES: {
        IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        SPREADSHEETS: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
    }
};

// ===== PAGINATION DEFAULTS =====
const PAGINATION = {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
    DEFAULT_PAGE: 1
};

// ===== WEBSOCKET EVENTS =====
const WEBSOCKET_EVENTS = {
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    NEW_MESSAGE: 'new_message',
    USER_ONLINE: 'user_online',
    USER_OFFLINE: 'user_offline',
    TASK_UPDATED: 'task_updated',
    REPORT_SUBMITTED: 'report_submitted',
    NOTIFICATION: 'notification'
};

// ===== LOCAL STORAGE KEYS =====
const STORAGE_KEYS = {
    TOKEN: 'auth_token',
    REFRESH_TOKEN: 'refresh_token',
    USER: 'current_user',
    THEME: 'theme',
    LANGUAGE: 'language',
    LAST_ACTIVITY: 'last_activity',
    DASHBOARD_LAYOUT: 'dashboard_layout',
    FILTER_PREFERENCES: 'filter_preferences'
};

// ===== UTILITY FUNCTIONS =====
const ApiUtils = {
    // Build full URL
    buildUrl(endpoint, params = {}) {
        let url = `${CONFIG.BASE_URL}${CONFIG.API_VERSION}${endpoint}`;
        
        // Add query parameters
        const queryParams = new URLSearchParams();
        Object.keys(params).forEach(key => {
            if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
                queryParams.append(key, params[key]);
            }
        });
        
        const queryString = queryParams.toString();
        if (queryString) {
            url += `?${queryString}`;
        }
        
        return url;
    },
    
    // Get auth headers
    getAuthHeaders(token = null) {
        const authToken = token || localStorage.getItem(STORAGE_KEYS.TOKEN);
        return authToken ? { Authorization: `Bearer ${authToken}` } : {};
    },
    
    // Handle API errors
    handleApiError(error, response = null) {
        let message = ERROR_MESSAGES.UNKNOWN_ERROR;
        
        if (!navigator.onLine) {
            message = ERROR_MESSAGES.NETWORK_ERROR;
        } else if (error.name === 'TimeoutError') {
            message = ERROR_MESSAGES.TIMEOUT_ERROR;
        } else if (response) {
            switch (response.status) {
                case HTTP_STATUS.UNAUTHORIZED:
                    message = ERROR_MESSAGES.UNAUTHORIZED;
                    break;
                case HTTP_STATUS.FORBIDDEN:
                    message = ERROR_MESSAGES.FORBIDDEN;
                    break;
                case HTTP_STATUS.NOT_FOUND:
                    message = ERROR_MESSAGES.NOT_FOUND;
                    break;
                case HTTP_STATUS.UNPROCESSABLE_ENTITY:
                    message = ERROR_MESSAGES.VALIDATION_ERROR;
                    break;
                case HTTP_STATUS.INTERNAL_SERVER_ERROR:
                    message = ERROR_MESSAGES.SERVER_ERROR;
                    break;
                default:
                    message = error.message || ERROR_MESSAGES.UNKNOWN_ERROR;
            }
        }
        
        return { message, status: response?.status, error };
    },
    
    // Format date for API
    formatDateForApi(date) {
        if (!date) return null;
        return new Date(date).toISOString();
    },
    
    // Parse API date
    parseApiDate(dateString) {
        if (!dateString) return null;
        return new Date(dateString);
    },
    
    // Validate file
    validateFile(file, type = 'IMAGE') {
        const maxSize = VALIDATION_RULES.FILE_SIZE_LIMITS[type];
        const allowedTypes = VALIDATION_RULES.ALLOWED_FILE_TYPES[type === 'IMAGE' ? 'IMAGES' : 'DOCUMENTS'];
        
        if (file.size > maxSize) {
            throw new Error(ERROR_MESSAGES.FILE_TOO_LARGE);
        }
        
        if (!allowedTypes.includes(file.type)) {
            throw new Error(ERROR_MESSAGES.INVALID_FILE_TYPE);
        }
        
        return true;
    },
    
    // Debounce function for search
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// Export configurations
window.API_CONFIG = CONFIG;
window.API_ENDPOINTS = API_ENDPOINTS;
window.REQUEST_CONFIG = REQUEST_CONFIG;
window.HTTP_STATUS = HTTP_STATUS;
window.ERROR_MESSAGES = ERROR_MESSAGES;
window.VALIDATION_RULES = VALIDATION_RULES;
window.PAGINATION = PAGINATION;
window.WEBSOCKET_EVENTS = WEBSOCKET_EVENTS;
window.STORAGE_KEYS = STORAGE_KEYS;
window.ApiUtils = ApiUtils;

// Log configuration on load
console.log(`🚀 API Configuration loaded for ${ENV} environment`);
console.log(`📡 Base URL: ${CONFIG.BASE_URL}${CONFIG.API_VERSION}`);
console.log(`⚡ WebSocket URL: ${CONFIG.WEBSOCKET_URL}`);