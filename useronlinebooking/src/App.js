import React from 'react';
import { Routes, Route } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';

import Header from './components/header/Header';
import Footer from './components/footer/Footer';

import HomePage from './pages/Home/HomePage';
import AboutPage from './pages/About/About.Page';
import ContactPage from './pages/Contact/ContactPage';
import Login from './pages/Login/Login';
import SignUp from './pages/SignUp/SignUp';
import RoomCard from './pages/RoomCard/RoomCard';
import Dashboard from './pages/Dashboard/Dashboard';
import RoomDetails from './pages/RoomDetails/RoomDetails';
import BookingConfirmation from './pages/BookingConfirmation/BookingConfirmation';
import SearchBar from './pages/SearchBar/SearchBar';
import GuestDetailsForm from './components/GuestDetailsForm/GuestDetailsForm';
import HotelPage from './pages/HotelPage/HotelPage';
import HotelRoom from './pages/HotelRoom/HotelRoom';

function App() {
  return (
    <>
      <Header />
      <Routes>
        {/* Show HomePage first */}
        <Route path="/" element={<HomePage />} />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* After login user lands on Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Pages */}
        <Route path="/" element={<Dashboard />} /> 
        <Route path="/hotel" element={<HotelPage />} /> 
        <Route path="/hotelRoom/:tenant" element={<HotelRoom />} />        
        <Route path="/login" element={<Login />} />
        <Route path="/roomdetails/:roomId" element={<RoomDetails />} /> 
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/roomcard" element={<RoomCard />} />
        <Route path="/confirmation" element={<BookingConfirmation />} />
        <Route path="/search" element={<SearchBar />} />
        <Route path="/book" element={<GuestDetailsForm />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
