// src/components/RoomCard/RoomCard.jsx
import React from 'react';
import styles from './RoomCard.module.css';
import { useNavigate } from 'react-router-dom';

const RoomCard = ({ title, description, price, buttonLabel }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    // Navigate to room details page with data (can be enhanced with state or ID)
    navigate('/book', { state: { title, description, price } });
  };

  return (
    <div>
      
    </div>
  );
};

export default RoomCard;
