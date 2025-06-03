import React from 'react';
import RoomCard from '../RoomCard/RoomCard';
import Dashboard from '../Dashboard/Dashboard';

export default function HomePage() {
  return (
    <div>
      <h3 style={{ textAlign: 'center',  }}>Welcome to our hotel</h3>
      <Dashboard />
      <RoomCard />
    </div>
  );
};

