import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button, Alert } from '../components/common';
import styles from '../styles/AuthPage.module.css';
import axiosInstance from '../api/axios';

function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'citizen',
    department: '',
    employeeId: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.name) newErrors.name = 'Name is required';
    if (!form.email) newErrors.email = 'Email is required';
    if (!form.password) newErrors.password = 'Password is required';
    if (!form.confirmPassword) newErrors.confirmPassword = 'Please confirm password';
    if (form.email && !form.email.includes('@')) newErrors.email = 'Please enter a valid email';
    if (form.password && form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (form.password && form.confirmPassword && form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (form.role === 'field_worker' && !form.employeeId) newErrors.employeeId = 'Employee ID is required';
    if (form.role === 'field_worker' && !form.department) newErrors.department = 'Department is required';
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
      const payload = {
        name: form.name,
        email: form.email.trim().toLowerCase(),
        phone: form.phone,
        password: form.password,
        confirmPassword: form.confirmPassword,
        role: form.role,
        department: form.department,
        employeeId: form.employeeId,
        address: form.address,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
      };
      const response = await axiosInstance.post('/auth/register', payload);
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('cityconnect-user', JSON.stringify(response.user));
      setAlert({ type: 'success', message: 'Registration successful! Redirecting to your dashboard...' });
      const redirectPath = response?.user?.role === 'field_worker' ? '/field-worker' : '/dashboard';
      setTimeout(() => navigate(redirectPath), 1200);
    } catch (error) {
      setAlert({ type: 'error', message: error.message || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.authPage}>
      <div className={styles.formCard}>
        <h2>Join CityConnect</h2>
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
            label="Full Name"
            type="text"
            name="name"
            placeholder="Enter your full name"
            value={form.name}
            onChange={handleChange}
            error={errors.name}
            required
          />
          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
            required
          />
          <Input
            label="Phone Number"
            type="text"
            name="phone"
            placeholder="Enter phone number"
            value={form.phone}
            onChange={handleChange}
          />
          <label className={styles.selectLabel}>
            <span>Register As</span>
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="citizen">Citizen</option>
              <option value="field_worker">Field Worker</option>
            </select>
          </label>
          {form.role === 'field_worker' ? (
            <>
              <Input
                label="Employee ID"
                type="text"
                name="employeeId"
                placeholder="Enter employee ID"
                value={form.employeeId}
                onChange={handleChange}
                error={errors.employeeId}
                required
              />
              <label className={styles.selectLabel}>
                <span>Department</span>
                <select name="department" value={form.department} onChange={handleChange}>
                  <option value="">Select department</option>
                  <option value="Electricity">Electricity</option>
                  <option value="Water Supply">Water Supply</option>
                  <option value="Drainage & Waste Management">Drainage & Waste Management</option>
                </select>
                {errors.department ? <span className={styles.errorMessage}>{errors.department}</span> : null}
              </label>
            </>
          ) : null}
          {form.role === 'citizen' ? (
            <>
              <Input
                label="Address"
                type="text"
                name="address"
                placeholder="Enter address"
                value={form.address}
                onChange={handleChange}
              />
              <Input
                label="City"
                type="text"
                name="city"
                placeholder="Enter city"
                value={form.city}
                onChange={handleChange}
              />
              <Input
                label="State"
                type="text"
                name="state"
                placeholder="Enter state"
                value={form.state}
                onChange={handleChange}
              />
              <Input
                label="Pincode"
                type="text"
                name="pincode"
                placeholder="Enter pincode"
                value={form.pincode}
                onChange={handleChange}
              />
            </>
          ) : null}
          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="Enter your password (min 6 characters)"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            required
          />
          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            placeholder="Confirm your password"
            value={form.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            required
          />
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>
        <p className={styles.switchAuth}>
          Already have an account? <a href="/login">Login here</a>
        </p>
      </div>
    </section>
  );
}

export default RegisterPage;
