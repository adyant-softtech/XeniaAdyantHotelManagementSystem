// Header.jsx
import React, { useContext, useState, useEffect } from 'react';
import styles from './Header.module.css';
import { FaSearch, FaChevronDown } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { getRoomTypes, getRoomDetails, getHotel } from '../../Api/services';
import Context from '../../context/Context';
import { GlobalContext } from '../../context/Context';
import { useNavigate } from "react-router-dom";


const citiesInChhattisgarh = [
  'Raipur', 'Bilaspur', 'Durg', 'Bhilai', 'Korba', 'Rajnandgaon',
  'Jagdalpur', 'Raigarh', 'Ambikapur', 'Chirmiri', 'Dhamtari', 'Mahasamund',
  'Kanker', 'Kawardha', 'Janjgir', 'Balod', 'Sakti', 'Bemetara', 'Surajpur', 'Dantewada'
];

const Header = () => {
  const { search , setSearch, user } = useContext(GlobalContext);
  const [ searchContent, setSearchContent ] = useState();
  const [selectedCity, setSelectedCity] = useState('Chhattisgarh');
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState('');
  const today = new Date().toISOString().split("T")[0];
  const [checkIn, setCheckIn] = useState(today);
  const [cityData, setCityData ] = useState({});
  // const [guests, setGuests] = useState({
  //   adults: 1,
  //   children: 0,
  //   rooms: 1,
  // });
  const navigate = useNavigate();

  const { tenant } = useContext(GlobalContext);
  const { roomData, setFilteredRooms, setRoomData , guests, handleIncrease, handleDecrease } = useContext(GlobalContext);

  const handleHistoryClick = () => {
    navigate("/history");
  };

    const handleSearch = async (e) => {
      e.preventDefault();
      const params = {
        city: selectedCity,
        adults: guests.adults,
        children: guests.children,
        rooms: guests.rooms,
      };

      try {
        const data = await getHotel(params);
        setFilteredRooms(data.hotels);
        console.log("header . jsx");
        navigate("/hotel");
      } catch (error) {
        console.error("Error fetching room types on search:", error);
      }
    };


  useEffect(() => {
  const handleSearchCity = async () => {
    const params = {
      city: selectedCity,
    };

    try {
      const response = await getRoomDetails(params);
      setCityData(response.rooms);
    } catch (error) {
      console.error("Error fetching room details by city:", error);
    }
  };

  handleSearchCity(); 
}, [selectedCity]); 




  const handleCityClick = (city) => {
    setSelectedCity(city);
    setActiveDropdown('');
  };

  // const handleIncrease = (type) => {
  //   setGuests((prev) => ({
  //     ...prev,
  //     [type]: prev[type] + 1,
  //   }));
  // };

  // const handleDecrease = (type) => {
  //   setGuests((prev) => {
  //     if (prev[type] > (type === 'rooms' ? 1 : 0)) {
  //       return { ...prev, [type]: prev[type] - 1 };
  //     }
  //     return prev;
  //   });
  // };

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logo}>🏠 HOTEL MANAGEMENT</Link>

      <form className={styles.searchForm} onSubmit={handleSearch}>

        {/* City Dropdown */}
        <div className={styles.dropdownContainer}>
          <div
            className={styles.dropdownBox}
            onClick={() => {
              setActiveDropdown((prev) => (prev === 'city' ? '' : 'city'));
            }}
          >
            {selectedCity}
            <FaChevronDown className={styles.downArrow} />
          </div>

          {activeDropdown === 'city' && (
            <div className={styles.dropdownList}>
              {citiesInChhattisgarh.map((city) => (
                <div
                  key={city}
                  className={styles.dropdownItem}
                  onClick={() => {
                    handleCityClick(city);
                    setActiveDropdown('');
                  }}
                >
                  {city}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Date Picker */}
        <input
          type="date"
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
          className={styles.input}
        />

        {/* Guests Dropdown */}
        <div className={styles.guestsInput}>
          <div
            className={styles.inputBox}
            onClick={() => {
              setActiveDropdown((prev) => (prev === 'guests' ? '' : 'guests'));
            }}
          >
            {guests.adults} adults · {guests.children} children · {guests.rooms} room
            <FaChevronDown className={styles.downArrow} />
          </div>

          {activeDropdown === "guests" && (
            <div className={styles.dropdownList}>
              {["adults", "children", "rooms"].map((type) => {
                const minValue = type === "rooms" ? 1 : 0;
                const label = type.charAt(0).toUpperCase() + type.slice(1);
                return (
                  <div key={type} className={styles.dropdownItem}>
                    <p>{label}</p>
                    <div className={styles.counterControls}>
                      <button
                        type="button"
                        onClick={() => handleDecrease(type)}
                        disabled={guests[type] <= minValue}
                        className={styles.counterButton}
                      >
                        –
                      </button>
                      <span className={styles.counterValue}>{guests[type]}</span>
                      <button
                        type="button"
                        onClick={() => handleIncrease(type)}
                        className={styles.counterButton}
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Search Button */}
        <button type="submit" className={styles.searchBtn}>
          <FaSearch />
        </button>
      </form>

      {/* Navigation */}
      <nav className={styles.nav}>
        <Link to="/contact">Contact Us</Link>
        <Link to="/about">About Us</Link>
        <Link to="/signup" className={styles.signup}>Sign Up</Link>
        <Link to="/login" className={styles.login}>Login</Link>
        {user && user.username && (
          <button onClick={handleHistoryClick} className={styles.login}>
            History
          </button>
        )}
      </nav>
    </header>

  );
};

export default Header;
