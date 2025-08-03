# Hisobotchi Tizimi - Frontend

## 📋 Loyiha haqida

Bu **Hisobotchi Tizimi**ning frontend qismi bo'lib, zamonaviy HTML, CSS, va JavaScript texnologiyalari yordamida yaratilgan. Dark mode, responsive design va to'liq API integratsiyaga ega.

## 🚀 Xususiyatlar

### 🎨 **Dizayn & UI/UX**
- ✨ **Zamonaviy dizayn** - Tailwind CSS style
- 🌙 **Dark/Light Mode** - avtomatik theme detection
- 📱 **Responsive Design** - barcha qurilmalarda ishlaydi
- 🎭 **Animatsiyalar** - smooth transitions va micro-interactions
- 💎 **Glass Morphism** - zamonaviy shaffof effektlar

### 🔐 **Authentication & Security**
- 🔑 **JWT Token Management** - avtomatik refresh
- 👤 **Role-based Access Control** - user, hr, admin, superadmin
- 🛡️ **Auto-logout** - security uchun
- 🔒 **Session Management** - localStorage bilan

### 📊 **Dashboard**
- 📈 **Real-time Statistics** - live ma'lumotlar
- ⏱️ **Time Tracking** - vaqt hisoblash moduli
- 🚀 **Quick Actions** - tez harakatlar
- 📋 **Recent Activity** - so'nggi faoliyat

### 👥 **Users Management**
- ➕ **CRUD Operations** - to'liq user boshqaruvi
- 🔍 **Advanced Filtering** - qidirish va filtrlash
- 📝 **Role Assignment** - rol tayinlash
- 👔 **Department Management** - bo'limlar boshqaruvi

### 📋 **Tasks Management**
- ✅ **Task CRUD** - vazifalar boshqaruvi
- 🎯 **Priority System** - muhimlik darajalari
- 👤 **Assignment** - javobgar tayinlash
- 📅 **Due Dates** - muddatlar boshqaruvi
- 📊 **Status Tracking** - holat kuzatuvi

## 🛠️ Texnologiyalar

### **Frontend Stack:**
- **HTML5** - semantik markup
- **CSS3** - modern styling, CSS Grid/Flexbox
- **Vanilla JavaScript** - ES6+ features
- **Font Awesome** - iconlar
- **CSS Custom Properties** - design tokens

### **Architecture:**
- **Modular Structure** - komponent asosida
- **API Integration** - RESTful endpoints
- **Error Handling** - to'liq xatolik boshqaruvi
- **Loading States** - user feedback
- **Responsive Grid** - adaptive layout

## 📁 Loyiha tuzilmasi

```
frontend/
├── index.html              # 🔐 Login sahifasi
├── dashboard.html          # 📊 Asosiy panel
├── users.html              # 👥 Xodimlar boshqaruvi
├── tasks.html              # 📋 Vazifalar
├── reports.html            # 📄 Hisobotlar  
├── chat.html               # 💬 Chat
├── css/
│   └── style.css           # 🎨 Asosiy stillar
├── js/
│   ├── config.js           # ⚙️ API konfiguratsiya
│   ├── auth.js             # 🔐 Autentifikatsiya
│   ├── users.js            # 👥 Xodimlar CRUD
│   └── tasks.js            # 📋 Vazifalar CRUD
├── .env.example            # 🔧 Environment o'zgaruvchilar
└── README.md               # 📖 Hujjatlar
```

## ⚙️ O'rnatish va ishga tushirish

### 1. **Repository klonlash**
```bash
git clone <repository-url>
cd frontend
```

### 2. **Environment sozlash**
```bash
# .env faylini yaratish
cp .env.example .env

# .env faylini tahrirlash
nano .env
```

### 3. **API Configuration**

`js/config.js` faylida API manzillarini sozlang:

```javascript
const API_CONFIG = {
    development: {
        BASE_URL: 'http://localhost:8000',
        API_VERSION: '/api/v1',
        WEBSOCKET_URL: 'ws://localhost:8000/ws'
    },
    production: {
        BASE_URL: 'https://your-domain.com',
        API_VERSION: '/api/v1',
        WEBSOCKET_URL: 'wss://your-domain.com/ws'
    }
};
```

### 4. **Web Server ishga tushirish**

#### **Python Simple Server:**
```bash
python -m http.server 8080
```

#### **Node.js http-server:**
```bash
npx http-server -p 8080
```

#### **Live Server (VS Code):**
VS Code'da Live Server extension orqali ishga tushiring.

### 5. **Browserda ochish**
```
http://localhost:8080
```

## 🔗 Backend bilan bog'lanish

### **API Endpoints**

Frontend quyidagi API endpoint'larni kutadi:

#### **Authentication:**
- `POST /api/v1/auth/login` - Kirish
- `GET /api/v1/auth/me` - Foydalanuvchi ma'lumotlari
- `POST /api/v1/auth/refresh` - Token yangilash
- `POST /api/v1/auth/logout` - Chiqish

#### **Users Management:**
- `GET /api/v1/users/` - Xodimlar ro'yxati
- `POST /api/v1/users/` - Yangi xodim qo'shish
- `GET /api/v1/users/{id}` - Xodim ma'lumotlari
- `PUT /api/v1/users/{id}` - Xodim tahrirlash
- `DELETE /api/v1/users/{id}` - Xodim o'chirish
- `GET /api/v1/users/count` - Xodimlar soni

#### **Tasks Management:**
- `GET /api/v1/tasks/` - Vazifalar ro'yxati
- `POST /api/v1/tasks/` - Yangi vazifa yaratish
- `GET /api/v1/tasks/{id}` - Vazifa ma'lumotlari
- `PUT /api/v1/tasks/{id}` - Vazifa tahrirlash
- `DELETE /api/v1/tasks/{id}` - Vazifa o'chirish
- `POST /api/v1/tasks/{id}/complete` - Vazifani bajarish
- `GET /api/v1/tasks/stats` - Vazifalar statistikasi

#### **Dashboard:**
- `GET /api/v1/dashboard/stats` - Dashboard statistikalari
- `GET /api/v1/dashboard/activity` - So'nggi faoliyat

#### **Time Tracking:**
- `POST /api/v1/time-tracking/` - Vaqt hisoblash saqlash

### **Data Format Examples**

#### **User Object:**
```json
{
    "id": 1,
    "username": "john_doe",
    "full_name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "department": "IT",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z"
}
```

#### **Task Object:**
```json
{
    "id": 1,
    "title": "Task Title",
    "description": "Task description",
    "status": "pending",
    "priority": "medium",
    "assignee_id": 1,
    "due_date": "2024-12-31T23:59:59Z",
    "created_at": "2024-01-01T00:00:00Z",
    "created_by": 1
}
```

## 🎨 Customization

### **Ranglar o'zgartirish:**

`css/style.css` faylida CSS custom properties orqali:

```css
:root {
    --primary-color: #4f46e5;
    --secondary-color: #10b981;
    --danger-color: #ef4444;
    /* ... */
}
```

### **Dark Mode Customization:**

```css
[data-theme="dark"] {
    --dark-bg-primary: #0f0f0f;
    --dark-text-primary: #ffffff;
    /* ... */
}
```

## 🐛 Debug va Testing

### **Console Logs:**
Browser Developer Tools'da console'ni tekshiring:

```javascript
// Config yuklanganda
console.log('🚀 API Configuration loaded for development environment');
console.log('📡 Base URL: http://localhost:8000/api/v1');
```

### **Network Tab:**
API so'rovlarni Developer Tools > Network tab'da kuzating.

### **LocalStorage:**
Application > Local Storage'da saqlangan ma'lumotlarni tekshiring:
- `auth_token` - JWT token
- `current_user` - Foydalanuvchi ma'lumotlari
- `theme` - Joriy tema

## 🚀 Production Deployment

### **1. Environment o'zgartirish:**
```javascript
// config.js da
const ENV = 'production';
```

### **2. API URLs yangilash:**
Production server manzillarini kiriting.

### **3. Web Server:**
- **Nginx**
- **Apache**
- **Caddy**
- **Static hosting** (Netlify, Vercel)

### **4. SSL Configuration:**
HTTPS enabled qiling production muhitida.

## 📞 Support

Agar savol yoki muammo bo'lsa:

1. **README** ni to'liq o'qing
2. **Console errors** ni tekshiring  
3. **Network requests** ni monitoring qiling
4. **API documentation** bilan solishtirib ko'ring

## 📝 Changelog

### v1.0.0 (2024-12-19)
- ✅ Initial release
- ✅ Complete authentication system
- ✅ Dark mode implementation  
- ✅ Users management
- ✅ Tasks management
- ✅ Dashboard with statistics
- ✅ Responsive design
- ✅ API integration ready

---

**Frontend tayyor va backend bilan to'liq integratsiya uchun sozlangan!** 🎉