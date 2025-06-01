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
  const { search , setSearch } = useContext(GlobalContext);
  const [ searchContent, setSearchContent ] = useState();
  const [selectedCity, setSelectedCity] = useState('Chhattisgarh');
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [cityData, setCityData ] = useState({});
  const [guests, setGuests] = useState({
    adults: 1,
    children: 0,
    rooms: 1,
  });
  const navigate = useNavigate();

  const { tenant } = useContext(GlobalContext);
  const { roomData, setFilteredRooms, setRoomData  } = useContext(GlobalContext);

  
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

  handleSearchCity(); // Call the async function
}, [selectedCity]); // Add selectedCity to dependency array




  const handleCityClick = (city) => {
    setSelectedCity(city);
    setActiveDropdown('');
  };

  const handleIncrease = (type) => {
    setGuests((prev) => ({
      ...prev,
      [type]: prev[type] + 1,
    }));
  };

  const handleDecrease = (type) => {
    setGuests((prev) => {
      if (prev[type] > (type === 'rooms' ? 1 : 0)) {
        return { ...prev, [type]: prev[type] - 1 };
      }
      return prev;
    });
  };

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logo}>🏠 HOTEL MANAGEMENT</Link>

      <form className={styles.searchForm} onSubmit={handleSearch}>
        <div className={styles.dropdownContainer}>
          <div
            className={styles.dropdownBox}
            onClick={() => {
              setActiveDropdown(activeDropdown === 'city' ? '' : 'city');
              setShowDropdown(!showDropdown);
            }}
          >
            {selectedCity}
            <FaChevronDown className={styles.downArrow} />
          </div>
          {activeDropdown === 'city' && showDropdown && (
            <div className={styles.dropdownList}>
              {citiesInChhattisgarh.map((city) => (
                <div
                  key={city}
                  className={styles.dropdownItem}
                  onClick={() => handleCityClick(city)}
                >
                  {city}
                </div>
              ))}
            </div>
          )}
        </div>

        <input
          type="date"
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
          className={styles.input}
        />

        <div className={styles.guestsInput}>
          <div
            className={styles.inputBox}
            onClick={() => {
              setActiveDropdown(activeDropdown === 'guests' ? '' : 'guests');
              setShowDropdown(!showDropdown);
            }}
          >
            {guests.adults} adults · {guests.children} children · {guests.rooms} room
            <FaChevronDown className={styles.downArrow} />
          </div>
          {activeDropdown === 'guests' && showDropdown && (
            <div className={styles.dropdownList}>
              {['adults', 'children', 'rooms'].map((type) => (
                <div key={type} className={styles.dropdownItem}>
                  <p>{type.charAt(0).toUpperCase() + type.slice(1)}</p>
                  <button type="button" onClick={() => handleDecrease(type)}>-</button>
                  <span>{guests[type]}</span>
                  <button type="button" onClick={() => handleIncrease(type)}>+</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" className={styles.searchBtn}>
          <FaSearch />
        </button>
      </form>

      <nav className={styles.nav}>
        <Link to="/contact">Contact Us</Link>
        <Link to="/about">About Us</Link>
        <Link to="/signup" className={styles.signup}>Sign Up</Link>
        <Link to="/login" className={styles.login}>Login</Link>
      </nav>
    </header>
  );
};

export default Header;
