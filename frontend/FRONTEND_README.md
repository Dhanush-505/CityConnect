# CityConnect Frontend

A modern React application for reporting and tracking civic issues. Built with Vite, React Router, and Axios.

## Features

- ✅ React 18 with Hooks
- ✅ React Router v6 for navigation
- ✅ Vite for fast development
- ✅ Reusable component library (Button, Input, Card, Loader, Modal, Alert)
- ✅ Axios with interceptors for API communication
- ✅ Fully responsive design
- ✅ CSS Modules for scoped styling
- ✅ Error handling and validation

## Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   └── axios.js           # Axios configuration with interceptors
│   ├── components/
│   │   ├── common/            # Reusable components
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Loader.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Alert.jsx
│   │   │   └── index.js       # Barrel export
│   │   ├── Navbar.jsx         # Main navigation
│   │   └── Footer.jsx         # Footer component
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx
│   │   └── RegisterPage.jsx
│   ├── styles/
│   │   ├── global.css         # Global styles
│   │   ├── Navbar.module.css
│   │   ├── Footer.module.css
│   │   ├── HomePage.module.css
│   │   ├── AuthPage.module.css
│   │   └── components/        # Component styles
│   ├── App.jsx                # Main app component with routes
│   └── main.jsx               # Entry point
├── public/
│   └── index.html
├── .env.example               # Environment variables template
├── package.json
├── vite.config.js
└── README.md

```

## Installation & Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env.local` and update the API URL if needed:

```bash
cp .env.example .env.local
```

```env
# .env.local
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Available Scripts

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

## Component Library

### Button

```jsx
import { Button } from './components/common';

<Button variant="primary" size="medium" disabled={false}>
  Click me
</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'danger' | 'success' (default: 'primary')
- `size`: 'small' | 'medium' | 'large' (default: 'medium')
- `disabled`: boolean
- `onClick`: function
- `type`: 'button' | 'submit' | 'reset'

### Input

```jsx
import { Input } from './components/common';

<Input
  label="Email"
  type="email"
  name="email"
  placeholder="Enter email"
  value={value}
  onChange={handleChange}
  error={errorMessage}
  required
/>
```

**Props:**
- `type`: string (default: 'text')
- `label`: string (optional)
- `placeholder`: string
- `value`: string
- `onChange`: function
- `error`: string (displays error message if present)
- `disabled`: boolean
- `required`: boolean

### Card

```jsx
import { Card } from './components/common';

<Card title="Card Title" padding="default">
  <p>Card content goes here</p>
</Card>
```

**Props:**
- `title`: string (optional)
- `padding`: 'small' | 'default' | 'large'
- `onClick`: function (makes card clickable)
- `className`: string

### Loader

```jsx
import { Loader } from './components/common';

<Loader size="medium" message="Loading..." fullPage={false} />
```

**Props:**
- `size`: 'small' | 'medium' | 'large'
- `message`: string
- `fullPage`: boolean (covers entire viewport if true)

### Modal

```jsx
import { Modal } from './components/common';

<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Modal Title"
  size="medium"
  footer={<Button onClick={handleClose}>Close</Button>}
>
  <p>Modal content here</p>
</Modal>
```

**Props:**
- `isOpen`: boolean
- `onClose`: function
- `title`: string
- `size`: 'small' | 'medium' | 'large'
- `footer`: React element (optional)

### Alert

```jsx
import { Alert } from './components/common';

<Alert
  type="success"
  message="Operation successful!"
  onClose={handleClose}
  autoClose={true}
  duration={5000}
/>
```

**Props:**
- `type`: 'success' | 'error' | 'warning' | 'info'
- `message`: string
- `onClose`: function
- `autoClose`: boolean (auto-dismiss if true)
- `duration`: number (milliseconds)

## API Configuration

The application uses Axios with a configured instance in `src/api/axios.js` that:
- Sets base URL from environment variable
- Adds authentication token to requests
- Handles 401 responses (unauthorized)
- Automatically transforms response data

### Usage

```jsx
import axiosInstance from '../api/axios';

// GET request
const data = await axiosInstance.get('/issues');

// POST request
const response = await axiosInstance.post('/auth/login', {
  email: 'user@example.com',
  password: 'password'
});

// Store auth token
localStorage.setItem('authToken', response.token);
```

## Responsive Design

The application is fully responsive with breakpoints:
- **Mobile**: < 640px
- **Tablet**: 640px - 768px
- **Desktop**: > 768px

All components and pages adapt to different screen sizes.

## Styling

- Uses **CSS Modules** for component scoping
- Global styles in `styles/global.css`
- Consistent color scheme and spacing
- Mobile-first approach

### Color Palette

- Primary: `#0f4c81` (Dark Blue)
- Secondary: `#1a6fa0` (Light Blue)
- Success: `#28a745` (Green)
- Error: `#dc3545` (Red)
- Warning: `#ffc107` (Yellow)
- Background: `#f5f7fb` (Light Gray)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### Port already in use

If port 5173 is already in use, you can change it in `vite.config.js`:

```js
server: {
  port: 3000, // Change to your preferred port
}
```

### CORS issues

Make sure the backend is running on `http://localhost:5000` and has CORS enabled.

### Environment variables not loading

Ensure `.env.local` file exists and variables are prefixed with `VITE_`

## Development Best Practices

1. Use reusable components from `components/common`
2. Use CSS Modules for component styles
3. Keep components small and focused
4. Use proper error handling with try-catch
5. Validate form inputs before submission
6. Add loading states for async operations
7. Handle errors gracefully with Alert components

## License

This project is part of CityConnect and is private.
