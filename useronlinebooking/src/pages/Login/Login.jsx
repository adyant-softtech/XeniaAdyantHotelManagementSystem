import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import { login } from '../../Api/services';
import { GlobalContext } from '../../context/Context';

const Login = () => {
  const { tenant } = useContext(GlobalContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare data for backend (use 'email' instead of 'username')
    const dataToSend = {
      email: formData.username, // Map 'username' input to 'email' for the API
      password: formData.password,
    };

    try {
      const response = await login(dataToSend, tenant);

      if (response && response.success) {
        console.log('Login successful:', response);
        setSuccessMessage('Login successful! ✅');

        setTimeout(() => {
          setSuccessMessage('');
          navigate('/');
        }, 2000);
      } else {
        alert('Invalid login credentials');
      }

      if (response.refresh) {
        localStorage.setItem("refresh", response.refresh);
        localStorage.setItem("access", response.access);
        // setUser(response.user);
        navigate("/roomdetail");
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please try again.');
    }
    
  };


  return (
    <div className={styles.loginContainer}>
      <form onSubmit={handleSubmit} className={styles.loginForm}>
        <h2>Login</h2>

        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          className={styles.input}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className={styles.input}
          required
        />

        <div className={styles.forgotPassword}>
          <a href="/forgot-password">Forgot Password?</a>
        </div>

        <button type="submit" className={styles.loginButton}>Login</button>

        {/* ✅ Success Message */}
        {successMessage && (
          <p style={{ color: 'green', textAlign: 'center', marginTop: '10px' }}>
            {successMessage}
          </p>
        )}

        <div className={styles.registerLink}>
          <span>Don't have an account? </span>
          <Link to="/signup">Click here to Register</Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
