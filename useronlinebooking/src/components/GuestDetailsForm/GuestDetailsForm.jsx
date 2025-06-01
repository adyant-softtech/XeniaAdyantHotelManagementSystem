import React, { useState, useEffect } from 'react';
import styles from './GuestDetailsForm.module.css';

const GuestDetailsForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    title: 'Mr',
    firstName: '',
    lastName: '',
    email: '',
    countryCode: '+91',
    contact: '',
    gst: false,
  });

  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Booking Details:', formData);
    setBookingConfirmed(true);
  };

  useEffect(() => {
    if (bookingConfirmed) {
      const timer = setTimeout(() => {
        // Modal close callback (optional)
        if (onClose) onClose();
        setBookingConfirmed(false); // Reset if form opens again
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [bookingConfirmed, onClose]);

  return (
    <div className={styles.pageWrapper}>
      {!bookingConfirmed ? (
        <form className={styles.form} onSubmit={handleSubmit}>
          <h2>Guest Details</h2>

          <div className={styles.row}>
            <select name="title" value={formData.title} onChange={handleChange}>
              <option>Mr</option>
              <option>Mrs</option>
              <option>Miss</option>
              <option>mst</option>
            </select>
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.row}>
            <input
              type="email"
              name="email"
              placeholder="Email ID"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <select name="countryCode" value={formData.countryCode} onChange={handleChange}>
              <option>+91</option>
              <option>+1</option>
              <option>+44</option>
            </select>
            <input
              type="tel"
              name="contact"
              placeholder="Contact Number"
              value={formData.contact}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.buttonContainer}>
            <button type="submit" className={styles.submitButton}>Confirm Booking</button>
          </div>
        </form>
      ) : (
        <div className={styles.confirmation}>
          <h3 style={{ color: 'green' }}>? Booking Confirmed!</h3>
        </div>
      )}
    </div>
  );
};

export default GuestDetailsForm;
