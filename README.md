# CityConnect - Civic Issue Reporting Platform

CityConnect is a full-stack web application for reporting and tracking civic issues. Built with React, Node.js, Express, and MongoDB.

## 🎯 Project Overview

CityConnect connects citizens with their local government to report and track civic issues such as:
- 🛣️ Road problems
- 💧 Water supply issues
- ⚡ Power outages
- 🚿 Sanitation problems
- And more!

## 📦 Tech Stack

### Frontend
- **React** 18 - UI library
- **Vite** - Build tool and dev server
- **React Router** v6 - Client-side routing
- **Axios** - HTTP client with interceptors
- **CSS Modules** - Scoped styling
- **React Icons** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM (Object Data Modeling)
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing

## 📁 Project Structure

```
CityConnect/
├── frontend/                           # React Vite application
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js               # Axios configuration with interceptors
│   │   ├── components/
│   │   │   ├── common/                # Reusable components library
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── Loader.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Alert.jsx
│   │   │   │   └── index.js
│   │   │   ├── Navbar.jsx             # Navigation header
│   │   │   └── Footer.jsx             # Footer component
│   │   ├── pages/
│   │   │   ├── HomePage.jsx           # Landing page
│   │   │   ├── LoginPage.jsx          # Login with validation
│   │   │   └── RegisterPage.jsx       # Registration with validation
│   │   ├── styles/
│   │   │   ├── global.css             # Global styles
│   │   │   ├── Navbar.module.css
│   │   │   ├── Footer.module.css
│   │   │   ├── HomePage.module.css
│   │   │   ├── AuthPage.module.css
│   │   │   └── components/            # Component styles
│   │   ├── App.jsx                    # Main app with routes
│   │   └── main.jsx                   # Entry point
│   ├── public/
│   │   └── index.html                 # HTML template
│   ├── .env.example                   # Environment template
│   ├── package.json
│   ├── vite.config.js
│   ├── FRONTEND_README.md             # Frontend documentation
│   └── node_modules/                  # Dependencies
│
├── backend/                            # Express.js API
│   ├── config/
│   │   └── db.js                      # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js
│   │   └── issueController.js
│   ├── middlewares/
│   │   ├── authMiddleware.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.js
│   │   └── Issue.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── issueRoutes.js
│   ├── server.js                      # Entry point
│   ├── package.json
│   ├── .env.example
│   └── node_modules/                  # Dependencies
│
├── .gitignore                         # Git ignore rules
└── README.md                          # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js v14+
- npm or yarn
- MongoDB (local or Atlas)

### 1. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local

# Start development server
npm run dev
```

Frontend: `http://localhost:5173`

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Start server
npm run dev
```

Backend: `http://localhost:5000`

## ✨ Features Implemented

### ✅ Step 4: React Application
- React Router configured for client-side routing
- **Home Page**: Hero section with features showcase and CTA
- **Login Page**: Email/password authentication form with validation
- **Register Page**: User registration with password confirmation
- **Navbar**: Sticky navigation with responsive design
- **Footer**: Sticky footer with copyright
- **Responsive Layout**: Mobile-first design (640px, 768px breakpoints)
- **CSS Styling**: Module-based CSS with consistent color scheme

### ✅ Step 5: Reusable Components
- **Button**: 4 variants (primary, secondary, danger, success), 3 sizes
- **Input**: Labels, placeholders, error messages, validation
- **Card**: Flexible container with 3 padding sizes
- **Loader**: Spinner with messages and full-page option
- **Modal**: Dialog with header, content, footer, and backdrop
- **Alert**: Auto-dismissing notifications with 4 types

### ✅ Step 6: Axios Configuration
- **Base URL**: Configurable from environment variables
- **Interceptors**: 
  - Request: Auto-attach auth tokens
  - Response: Auto-transform data
  - Error: Handle 401 unauthorized responses
- **Error Handling**: Graceful error handling with Alert component

### ✅ Step 7: Git Configuration
- **Comprehensive .gitignore**:
  - Node modules and dependencies
  - Environment files (.env, .env.local)
  - Build output (dist/, build/)
  - IDE files (.vscode, .idea)
  - OS files (.DS_Store, Thumbs.db)
  - Logs and temporary files

## 🎨 Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Primary Blue | #0f4c81 | Buttons, headers, links |
| Light Blue | #1a6fa0 | Secondary elements |
| Success | #28a745 | Success messages |
| Error | #dc3545 | Error messages |
| Warning | #ffc107 | Warning messages |
| Info | #0c5460 | Info messages |
| Background | #f5f7fb | Page background |

## 📱 Responsive Breakpoints

- **Mobile**: < 640px (phones)
- **Tablet**: 640px - 768px (tablets)
- **Desktop**: > 768px (desktops)

All components and pages are fully responsive and tested on all breakpoints.

## 🔐 API Configuration

### Environment Variables

**Frontend (.env.local)**
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

**Backend (.env)**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cityconnect
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

### API Endpoints (To be implemented)

**Authentication**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

**Issues**
- `GET /api/issues` - Get all issues
- `GET /api/issues/:id` - Get single issue
- `POST /api/issues` - Create new issue
- `PUT /api/issues/:id` - Update issue
- `DELETE /api/issues/:id` - Delete issue

## 📝 Available Scripts

### Frontend
```bash
npm run dev      # Start dev server with hot reload
npm run build    # Build for production
npm run preview  # Preview production build locally
```

### Backend
```bash
npm run dev      # Start with nodemon auto-reload
npm start        # Start production server
npm test         # Run tests (if configured)
```

## 🧩 Component Usage Examples

### Button
```jsx
import { Button } from './components/common';

<Button variant="primary" size="medium">
  Click me
</Button>
```

### Input
```jsx
import { Input } from './components/common';

<Input
  label="Email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
  required
/>
```

### Card
```jsx
import { Card } from './components/common';

<Card title="Feature" padding="default">
  <p>Card content</p>
</Card>
```

### Loader
```jsx
import { Loader } from './components/common';

<Loader size="medium" message="Loading..." fullPage={true} />
```

### Modal
```jsx
import { Modal } from './components/common';

<Modal isOpen={isOpen} onClose={handleClose} title="Confirm">
  Are you sure?
</Modal>
```

### Alert
```jsx
import { Alert } from './components/common';

<Alert type="success" message="Success!" autoClose duration={5000} />
```

## 📚 Documentation

- [Frontend Documentation](./frontend/FRONTEND_README.md) - Detailed frontend setup
- API Documentation - (To be created)
- Component Library - (To be created)

## 🔄 Development Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/feature-name
   ```

2. **Development with Hot Reload**
   ```bash
   npm run dev
   ```

3. **Commit Changes**
   ```bash
   git add .
   git commit -m "Add: description"
   ```

4. **Push to Remote**
   ```bash
   git push origin feature/feature-name
   ```

## 🛠️ Troubleshooting

### Frontend
- **Port 5173 in use**: Change port in vite.config.js
- **CORS errors**: Ensure backend has CORS enabled
- **API not connecting**: Check VITE_API_BASE_URL in .env.local
- **Dependencies issues**: Run `npm install` and clear cache

### Backend
- **MongoDB connection fails**: Check MONGODB_URI in .env
- **Port 5000 in use**: Kill process or change port
- **JWT errors**: Ensure JWT_SECRET is set in .env

### General
- **Clear cache**: `rm -rf node_modules && npm install`
- **Kill ports**: 
  - Windows: `netstat -ano | findstr :5173` then `taskkill /PID [PID]`
  - Mac/Linux: `lsof -i :5173` then `kill -9 [PID]`

## 📋 Checklist

- [x] Step 4: React application with Router
- [x] Step 5: Reusable component library
- [x] Step 6: Axios configuration
- [x] Step 7: Git with .gitignore
- [ ] Step 8: Authentication implementation
- [ ] Step 9: Issue management pages
- [ ] Step 10: Image upload
- [ ] Step 11: Search and filters
- [ ] Step 12: User profiles
- [ ] Step 13: Real-time notifications
- [ ] Step 14: Admin dashboard
- [ ] Step 15: Production deployment

## 🤝 Contributing

1. Follow the project structure
2. Use reusable components
3. Write meaningful commits
4. Test responsive design
5. Handle errors gracefully

## 📄 License

This project is private and proprietary.

## 📧 Support

For questions or issues, please contact the development team.

---

**Last Updated**: June 2026
**Version**: 1.0.0
