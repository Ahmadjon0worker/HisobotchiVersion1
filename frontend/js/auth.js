// Auth.js - JWT token boshqaruvi va autentifikatsiya

// API base URL
const API_BASE_URL = window.location.origin;

// Auth utility functions
class AuthManager {
    constructor() {
        this.token = localStorage.getItem('token');
        this.user = null;
        this.refreshTokenTimeout = null;
    }

    // Token olish
    getToken() {
        return localStorage.getItem('token');
    }

    // Token saqlash
    setToken(token) {
        localStorage.setItem('token', token);
        this.token = token;
        this.scheduleTokenRefresh();
    }

    // Token o'chirish
    removeToken() {
        localStorage.removeItem('token');
        this.token = null;
        if (this.refreshTokenTimeout) {
            clearTimeout(this.refreshTokenTimeout);
        }
    }

    // Foydalanuvchi ma'lumotlarini saqlash
    setUser(user) {
        this.user = user;
        localStorage.setItem('user', JSON.stringify(user));
    }

    // Foydalanuvchi ma'lumotlarini olish
    getUser() {
        if (this.user) return this.user;
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    }

    // Token amal qilish muddatini tekshirish
    isTokenValid() {
        if (!this.token) return false;
        
        try {
            const payload = JSON.parse(atob(this.token.split('.')[1]));
            const now = Date.now() / 1000;
            return payload.exp > now;
        } catch (error) {
            console.error('Token validation error:', error);
            return false;
        }
    }

    // Token yangilashni rejalashtirish
    scheduleTokenRefresh() {
        if (!this.token) return;

        try {
            const payload = JSON.parse(atob(this.token.split('.')[1]));
            const exp = payload.exp * 1000;
            const now = Date.now();
            const refreshTime = exp - now - 5 * 60 * 1000; // 5 daqiqa oldin yangilash

            if (refreshTime > 0) {
                this.refreshTokenTimeout = setTimeout(() => {
                    this.refreshToken();
                }, refreshTime);
            }
        } catch (error) {
            console.error('Token refresh scheduling error:', error);
        }
    }

    // Token yangilash
    async refreshToken() {
        try {
            const response = await this.makeRequest('/auth/refresh', {
                method: 'POST'
            });

            if (response.ok) {
                const data = await response.json();
                this.setToken(data.access_token);
                return true;
            } else {
                this.logout();
                return false;
            }
        } catch (error) {
            console.error('Token refresh error:', error);
            this.logout();
            return false;
        }
    }

    // API so'rov yuborish
    async makeRequest(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const defaultHeaders = {
            'Content-Type': 'application/json',
        };

        if (this.token) {
            defaultHeaders['Authorization'] = `Bearer ${this.token}`;
        }

        const config = {
            headers: { ...defaultHeaders, ...options.headers },
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            // Token muddati tugagan bo'lsa
            if (response.status === 401 && this.token) {
                const refreshed = await this.refreshToken();
                if (refreshed) {
                    // So'rovni qayta yuborish
                    config.headers['Authorization'] = `Bearer ${this.token}`;
                    return await fetch(url, config);
                }
            }

            return response;
        } catch (error) {
            console.error('Request error:', error);
            throw error;
        }
    }

    // Kirish
    async login(username, password) {
        try {
            showLoading(true);
            
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    username: username,
                    password: password
                })
            });

            if (response.ok) {
                const data = await response.json();
                this.setToken(data.access_token);
                
                // Foydalanuvchi ma'lumotlarini olish
                const userResponse = await this.makeRequest('/auth/me');
                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    this.setUser(userData);
                }

                return { success: true };
            } else {
                const error = await response.json();
                return { 
                    success: false, 
                    message: error.detail || 'Kirish jarayonida xatolik yuz berdi' 
                };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { 
                success: false, 
                message: 'Tarmoq xatoligi. Qaytadan urinib ko\'ring.' 
            };
        } finally {
            showLoading(false);
        }
    }

    // Chiqish
    logout() {
        this.removeToken();
        localStorage.removeItem('user');
        this.user = null;
        window.location.href = 'index.html';
    }

    // Foydalanuvchi autentifikatsiya qilinganligini tekshirish
    async checkAuth() {
        if (!this.token || !this.isTokenValid()) {
            this.logout();
            return false;
        }

        try {
            const response = await this.makeRequest('/auth/me');
            if (response.ok) {
                const userData = await response.json();
                this.setUser(userData);
                return true;
            } else {
                this.logout();
                return false;
            }
        } catch (error) {
            console.error('Auth check error:', error);
            this.logout();
            return false;
        }
    }

    // Role-based ruxsat tekshirish
    hasPermission(requiredRole) {
        const user = this.getUser();
        if (!user) return false;

        const roles = ['user', 'hr', 'admin', 'superadmin'];
        const userRoleIndex = roles.indexOf(user.role);
        const requiredRoleIndex = roles.indexOf(requiredRole);

        return userRoleIndex >= requiredRoleIndex;
    }

    // Sahifa himoyasi
    requireAuth() {
        if (!this.token || !this.isTokenValid()) {
            window.location.href = 'index.html';
            return false;
        }
        return true;
    }

    // Role-based sahifa himoyasi
    requireRole(requiredRole) {
        if (!this.requireAuth()) return false;
        
        const user = this.getUser();
        if (!user || !this.hasPermission(requiredRole)) {
            showToast('Bu sahifaga kirishga ruxsatingiz yo\'q', 'error');
            window.location.href = 'dashboard.html';
            return false;
        }
        return true;
    }
}

// Global auth manager instance
const authManager = new AuthManager();

// Login form handler
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        // Agar foydalanuvchi allaqachon kiran bo'lsa
        if (authManager.token && authManager.isTokenValid()) {
            window.location.href = 'dashboard.html';
            return;
        }

        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            
            if (!username || !password) {
                showToast('Foydalanuvchi nomi va parolni kiriting', 'warning');
                return;
            }

            const result = await authManager.login(username, password);
            
            if (result.success) {
                showToast('Muvaffaqiyatli kirildi!', 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                showToast(result.message, 'error');
            }
        });
    }
});

// Utility functions
function showLoading(show) {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = show ? 'flex' : 'none';
    }
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    
    if (toast && toastMessage) {
        toastMessage.textContent = message;
        toast.className = `toast ${type}`;
        toast.style.display = 'block';
        
        setTimeout(() => {
            toast.style.display = 'none';
        }, 4000);
    } else {
        // Fallback
        alert(message);
    }
}

// Toast close handler
document.addEventListener('DOMContentLoaded', function() {
    const toastClose = document.getElementById('toast-close');
    if (toastClose) {
        toastClose.addEventListener('click', function() {
            document.getElementById('toast').style.display = 'none';
        });
    }
});

// Logout function (global)
function logout() {
    authManager.logout();
}

// Auth check function (global)
async function checkAuth() {
    return await authManager.checkAuth();
}

// Protected page check
function requireAuth() {
    return authManager.requireAuth();
}

// Role check
function requireRole(role) {
    return authManager.requireRole(role);
}

// Get current user
function getCurrentUser() {
    return authManager.getUser();
}

// Make authenticated request
async function makeAuthenticatedRequest(endpoint, options = {}) {
    return await authManager.makeRequest(endpoint, options);
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl + Enter to submit login form
    if (e.ctrlKey && e.key === 'Enter') {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.dispatchEvent(new Event('submit'));
        }
    }
    
    // Escape to close toast
    if (e.key === 'Escape') {
        const toast = document.getElementById('toast');
        if (toast && toast.style.display === 'block') {
            toast.style.display = 'none';
        }
    }
});

// Auto-logout on tab visibility change (security feature)
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // Tab yashirilgan
        localStorage.setItem('lastActiveTime', Date.now());
    } else {
        // Tab ko'rsatilgan
        const lastActive = localStorage.getItem('lastActiveTime');
        const maxInactiveTime = 30 * 60 * 1000; // 30 daqiqa
        
        if (lastActive && (Date.now() - parseInt(lastActive)) > maxInactiveTime) {
            showToast('Xavfsizlik sababli tizimdan chiqarildingiz', 'warning');
            setTimeout(() => {
                authManager.logout();
            }, 3000);
        }
    }
});

// Initialize auth manager
authManager.scheduleTokenRefresh();

// ===== DARK MODE FUNCTIONALITY =====
class ThemeManager {
    constructor() {
        this.theme = localStorage.getItem('theme') || 'light';
        this.applyTheme();
    }

    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        this.saveTheme();
        this.animateToggle();
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        this.updateThemeIcon();
    }

    saveTheme() {
        localStorage.setItem('theme', this.theme);
    }

    updateThemeIcon() {
        const toggles = document.querySelectorAll('.theme-toggle');
        toggles.forEach(toggle => {
            const sunIcon = toggle.querySelector('.sun-icon');
            const moonIcon = toggle.querySelector('.moon-icon');
            
            if (this.theme === 'dark') {
                sunIcon.style.opacity = '0.4';
                moonIcon.style.opacity = '1';
            } else {
                sunIcon.style.opacity = '1';
                moonIcon.style.opacity = '0.4';
            }
        });
    }

    animateToggle() {
        const toggles = document.querySelectorAll('.theme-toggle');
        toggles.forEach(toggle => {
            toggle.classList.add('toggling');
            setTimeout(() => {
                toggle.classList.remove('toggling');
            }, 300);
        });

        // Add a subtle page transition effect
        document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        setTimeout(() => {
            document.body.style.transition = '';
        }, 300);
    }

    isDark() {
        return this.theme === 'dark';
    }

    setTheme(theme) {
        if (['light', 'dark'].includes(theme)) {
            this.theme = theme;
            this.applyTheme();
            this.saveTheme();
        }
    }

    // Auto detect system preference
    detectSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }

    // Initialize with system preference if no saved theme
    initializeWithSystemPreference() {
        if (!localStorage.getItem('theme')) {
            this.theme = this.detectSystemTheme();
            this.applyTheme();
            this.saveTheme();
        }
    }

    // Listen for system theme changes
    watchSystemTheme() {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', (e) => {
                if (!localStorage.getItem('theme')) {
                    this.theme = e.matches ? 'dark' : 'light';
                    this.applyTheme();
                }
            });
        }
    }
}

// Global theme manager instance
const themeManager = new ThemeManager();

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize with system preference if no saved theme
    themeManager.initializeWithSystemPreference();
    
    // Watch for system theme changes
    themeManager.watchSystemTheme();
    
    // Add keyboard shortcut for theme toggle (Ctrl/Cmd + D)
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
            e.preventDefault();
            themeManager.toggleTheme();
            showToast(`${themeManager.isDark() ? 'Qora' : 'Yorqin'} rejim yoqildi`, 'info');
        }
    });
});

// Toggle theme function for global access
function toggleTheme() {
    themeManager.toggleTheme();
    
    // Show toast notification
    const themeText = themeManager.isDark() ? 'Qora rejim yoqildi 🌙' : 'Yorqin rejim yoqildi ☀️';
    showToast(themeText, 'info');
}

// Theme-aware toast colors
function getThemeAwareToastClass(type) {
    const isDark = themeManager.isDark();
    const themeClasses = {
        success: isDark ? 'success-dark' : 'success',
        error: isDark ? 'error-dark' : 'error',
        warning: isDark ? 'warning-dark' : 'warning',
        info: isDark ? 'info-dark' : 'info'
    };
    return themeClasses[type] || type;
}

// Enhanced showToast with theme support
function showToastEnhanced(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    
    if (toast && toastMessage) {
        toastMessage.textContent = message;
        toast.className = `toast ${getThemeAwareToastClass(type)} animate-slide-in-right`;
        toast.style.display = 'block';
        
        // Auto hide after 4 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                toast.style.display = 'none';
                toast.style.opacity = '1';
                toast.style.transform = 'translateX(0)';
            }, 300);
        }, 4000);
    } else {
        // Fallback
        alert(message);
    }
}

// Enhanced loading with theme support
function showLoadingEnhanced(show) {
    const loading = document.getElementById('loading');
    if (loading) {
        if (show) {
            loading.style.display = 'flex';
            loading.classList.add('animate-fade-in');
        } else {
            loading.classList.add('animate-fade-out');
            setTimeout(() => {
                loading.style.display = 'none';
                loading.classList.remove('animate-fade-in', 'animate-fade-out');
            }, 200);
        }
    }
}

// Add new fade out animation to CSS (this would be handled in CSS)
const style = document.createElement('style');
style.textContent = `
    .animate-fade-out {
        animation: fadeOut 0.2s ease-out forwards;
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    
    /* Theme-aware toast variants */
    .toast.success-dark { border-left-color: var(--emerald-400); background: var(--dark-bg-modal); }
    .toast.error-dark { border-left-color: var(--red-400); background: var(--dark-bg-modal); }
    .toast.warning-dark { border-left-color: var(--amber-400); background: var(--dark-bg-modal); }
    .toast.info-dark { border-left-color: var(--blue-400); background: var(--dark-bg-modal); }
`;
document.head.appendChild(style);

// Export for use in other files
window.authManager = authManager;
window.themeManager = themeManager;
window.toggleTheme = toggleTheme;
window.showToast = showToastEnhanced; // Use enhanced version
window.showLoading = showLoadingEnhanced; // Use enhanced version
window.logout = logout;
window.checkAuth = checkAuth;
window.requireAuth = requireAuth;
window.requireRole = requireRole;
window.getCurrentUser = getCurrentUser;
window.makeAuthenticatedRequest = makeAuthenticatedRequest;