import React from 'react';

import styles from './footer.module.css';
import { FaUser } from 'react-icons/fa'; 
import { useNavigate, useLocation } from 'react-router-dom'
import { useContext, useState, useRef } from 'react';
import { GlobalContext } from '../../context/Context';

const Footer = () => {
  const location = useLocation();
  const hideButtonOnPaths = ['/history'];
  const navigate = useNavigate();
  const { checkedRooms, filteredRooms, roomData, setCheckedRooms, user } = useContext(GlobalContext);

  const roomsToUse = filteredRooms.length > 0 ? filteredRooms : roomData;

  const selectedRooms = Object.keys(checkedRooms)
  .filter(id => checkedRooms[id])
  .map(id => roomsToUse.find(room => Number(room.id) === Number(id)))
  .filter(room => room !== undefined);


  // const handleProceed = () => {
  //   navigate('/selectedRooms', { state: { selectedRooms } });
  // };
  const [showPopup, setShowPopup] = useState(false);
  // const closePopup = () => {
  //   setShowPopup(false);
  //   navigate('/guestDetails', { state: { selectedRooms } });
  // };
  const closePopup = () => {
    if (!user || !user.username) {
      navigate("/login"); 
      setShowPopup(false);
      return;
    }
    setShowPopup(false);
    navigate('/guestDetails', { state: { selectedRooms } });
  };
  const closedPopup = () => {
    setShowPopup(false);
  };
  const handleProceed = () => {
    setShowPopup(true);
  };
  const handleDelete = (id) => {
    const updatedRooms = selectedRooms.filter((room) => room.id !== id);
    setCheckedRooms(updatedRooms);
  };

  return (
    <footer className={styles.footer}>
      <div className={`${styles.whatsAppIcon}`}>
       
       {/* <button
          className={styles.button}
          onClick={handleProceed}
        >
          Selected Rooms
        </button>
         */}

        {!hideButtonOnPaths.includes(location.pathname) && (
          <button
            className={styles.button}
            onClick={handleProceed}
          >
            Selected Rooms
          </button>
        )}
      </div>
      {showPopup && (
        <div className={styles.popupOverlay}
         onClick={() => setShowPopup(false)}>
          <div className={styles.popupContent}
          onClick={(e) => e.stopPropagation()}>
            <div className={styles.selectedRoomsTable}>
              <h4>Selected Rooms</h4>
              {/* <span className={styles.closeIcon} onClick={closedPopup}>✖️</span> */}
              <table>
                <thead>
                  <tr>
                    <th>Room Number</th>
                    <th>Room Type</th>
                    <th>Price (₹)</th>
                    <th>Variety</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedRooms.map((room) => (
                    room ? (
                      <tr key={room.id}>
                        <td>{room.room_number}</td>
                        <td>{room.room_type}</td>
                        <td>{room.room_price}</td>
                        <td>{room.variety}</td>
                        <td>
                          <button
                            onClick={() => handleDelete(room.id)}
                            className={styles.deleteButton}
                            title="Remove Room"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ) : null
                  ))}

                </tbody>
              </table>
            </div>

            <button onClick={closePopup} style={{ marginTop: "20px" }}>
              Proceed
            </button>
          </div>
        </div>
      )}

      <p>
        Copyright © 2025 HOTEL SATKAR | Design and Maintained by{" "}
        <a href="https://adyant.co.in/" className={styles.footerLink}>Adyant SoftTech</a>

      </p>
    </footer>
  );
};

export default Footer;