import React from 'react';
import styles from './BookingModal.module.css';

const BookingModal = ({ onClose, children }) => {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button onClick={onClose} className={styles.closeButton}>X</button>
        {children}
      </div>
    </div>
  );
};

export default BookingModal;
