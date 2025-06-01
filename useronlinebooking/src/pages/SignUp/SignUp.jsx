import React, { useContext, useState } from 'react';
import styles from './SignUp.module.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { signup } from '../../Api/services';
import { GlobalContext } from '../../context/Context';


const SignUp = () => {
  const { tenant } = useContext(GlobalContext);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    contact: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState(''); // ? Success message

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

 const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    // Prepare data in snake_case as expected by Django backend
    const dataToSend = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email.toLowerCase(),
      password: formData.password,
      confirm_password: formData.confirmPassword,
      contact_number: formData.contact,
    };

    try {
      const response = await signup(dataToSend, tenant); // Send corrected data

      if (response && !response.error) {
        setSuccessMessage('Sign up successful! ✅');

        // Clear form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          confirmPassword: '',
          contact: '',
        });

        // Clear success message after a delay
        setTimeout(() => setSuccessMessage(''), 3000);
      }
      // Any errors are handled inside the signup function
    } catch (error) {
      console.error('Signup failed:', error);
      alert('Sign up failed. Please try again.');
    }
  };


  return (
    <div className={styles.signUpContainer}>
      <form onSubmit={handleSubmit} className={styles.signUpForm}>
         <h2>SignUp</h2>
        {[
          { label: 'First Name', name: 'firstName', type: 'text', placeholder: 'Enter your first name' },
  { label: 'Last Name', name: 'lastName', type: 'text', placeholder: 'Enter your last name' },
  { label: 'Email ID', name: 'email', type: 'email', placeholder: 'Enter your email address' },
  { label: 'Contact Number', name: 'contact', type: 'tel', placeholder: 'Enter your phone number' }
        ].map((field, index) => (
          <div className={styles.inputGroup} key={index}>
            <div className={styles.labelColumn}>
              <label htmlFor={field.name}>
      {field.label} <span style={{ color: 'red' }}>*</span>
    </label>
            </div>
            <input
              type={field.type}
              name={field.name}
              placeholder={field.placeholder} 
              id={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>
        ))}

        {/* Password Field */}
        <div className={styles.inputGroup}>
          <div className={styles.labelColumn}>
            <span className={styles.asterisk}>*</span>
            <label htmlFor="password">Create Password</label>
          </div>
          <div className={styles.passwordWrapper}>
            
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              required
              className={styles.input}
            />
            <span
              className={styles.eyeIcon}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEye/> : <FaEyeSlash />}
            </span>
          </div>
        </div>

        {/* Confirm Password Field */}
        <div className={styles.inputGroup}>
          <div className={styles.labelColumn}>
            <span className={styles.asterisk}>*</span>
            <label htmlFor="confirmPassword">Re-enter Password</label>
          </div>
          <div className={styles.passwordWrapper}>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className={styles.input}
            />
            <span
              className={styles.eyeIcon}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
           {showPassword ? <FaEye /> : <FaEyeSlash />}       
            </span>
          </div>
        </div>

        <button type="submit" className={styles.signUpButton}>
          Sign Up
        </button>

        {/* ? Success message */}
        {successMessage && (
          <p style={{ color: 'green', textAlign: 'center', marginTop: '10px' }}>
            {successMessage}
          </p>
        )}
      </form>
    </div>
  );
};

export default SignUp;
