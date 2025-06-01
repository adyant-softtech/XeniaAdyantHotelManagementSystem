import React, { useState } from 'react';
import styles from './SearchBar.module.css';

const SearchBar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);

  return (
    <div className={styles.searchBar}>
      <input type="text" placeholder="Chhattisgarh" className={styles.input} />
      <input type="text" placeholder="23-10-2024, 4:45 PM" className={styles.input} />

      <div className={styles.dropdownWrapper}>
        <input
          type="text"
          value={`${adults} adults · ${children} children · ${rooms} room`}
          className={styles.input}
          readOnly
          onClick={() => setShowDropdown(!showDropdown)}
        />
         (
          <div className={styles.dropdown}>
            <div>
              <label>Adults:</label>
              <select value={adults} onChange={(e) => setAdults(Number(e.target.value))}>
                {[1, 2, 3, 4, 5].map(num => <option key={num} value={num}>{num}</option>)}
              </select>
            </div>
            <div>
              <label>Children:</label>
              <select value={children} onChange={(e) => setChildren(Number(e.target.value))}>
                {[0, 1, 2, 3, 4].map(num => <option key={num} value={num}>{num}</option>)}
              </select>
            </div>
            <div>
              <label>Rooms:</label>
              <select value={rooms} onChange={(e) => setRooms(Number(e.target.value))}>
                {[1, 2, 3, 4, 5].map(num => <option key={num} value={num}>{num}</option>)}
              </select>
            </div>
          </div>
        )
      </div>

      <button className={styles.button}>Search</button>
    </div>
  );
};

export default SearchBar;
