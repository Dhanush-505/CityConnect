import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axios';
import styles from '../styles/AdminLoginPage.module.css';

function AdminLoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axiosInstance.post('/auth/login', {
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      if (response?.user?.role !== 'admin') {
        throw new Error('Access denied for this account.');
      }

      localStorage.setItem('authToken', response.token);
      localStorage.setItem('cityconnect-user', JSON.stringify(response.user));
      localStorage.setItem('cityconnect-admin-auth', 'true');
      navigate('/admin/dashboard');
    } catch (loginError) {
      setError(loginError.message || 'Invalid admin credentials. Please use the predefined admin account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>Municipal Admin Access</p>
          <h1>CityConnect Admin</h1>
          <p>Use the predefined administrator credentials to access the control center.</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span>Email</span>
            <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="admin@cityconnect.com" required />
          </label>
          <label className={styles.field}>
            <span>Password</span>
            <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Admin@123" required />
          </label>
          {error ? <p className={styles.error}>{error}</p> : null}
          <button type="submit" className={styles.button} disabled={loading}>{loading ? 'Signing In...' : 'Sign In'}</button>
        </form>

        <div className={styles.helperBox}>
          <p><strong>Default credentials</strong></p>
          <p>Email: admin@cityconnect.com</p>
          <p>Password: Admin@123</p>
        </div>
      </div>
    </div>
  );
}

export default AdminLoginPage;
