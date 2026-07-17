import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button, Alert } from '../components/common';
import styles from '../styles/AuthPage.module.css';
import axiosInstance from '../api/axios';

const roleRedirects = {
  citizen: '/dashboard',
  field_worker: '/field-worker',
  admin: '/admin/dashboard',
};

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    if (email && !email.includes('@')) newErrors.email = 'Please enter a valid email';
    return newErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const payload = { email: String(email || '').trim().toLowerCase(), password };
      const response = await axiosInstance.post('/auth/login', payload);
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('cityconnect-user', JSON.stringify(response.user));
      setAlert({ type: 'success', message: 'Login successful!' });
      const redirectPath = roleRedirects[response?.user?.role] || '/dashboard';
      setTimeout(() => navigate(redirectPath), 1000);
    } catch (error) {
      const message = (error && (error.message || error.msg || error.error)) || 'Login failed';
      setAlert({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.authPage}>
      <div className={styles.formCard}>
        <h2>Login to CityConnect</h2>
        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
            autoClose={true}
            duration={3000}
          />
        )}
        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors({ ...errors, email: '' });
            }}
            error={errors.email}
            required
          />
          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors({ ...errors, password: '' });
            }}
            error={errors.password}
            required
          />
          <Button type="submit" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>
        <p className={styles.switchAuth}>
          Don't have an account? <a href="/register">Register here</a>
        </p>
        <p className={styles.switchAuth}>
          <a href="/forgot-password">Forgot password?</a>
        </p>
      </div>
    </section>
  );
}

export default LoginPage;
