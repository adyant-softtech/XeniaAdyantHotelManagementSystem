import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import styles from './SelectedRoom.module.css';

const SelectedRoom = () => {
  const location = useLocation();
  const selectedRooms = location.state?.selectedRooms || [];

  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (selectedRooms.length > 0) {
      setShowPopup(true);  // Show popup on page load
    }
  }, [selectedRooms]);

  return (
    <div>
      {showPopup && (
        <div className="popupOverlay">
          <div className="popupContent">
            <h2>Selected Rooms</h2>
            <ul>
              {selectedRooms.map((room) => (
                <li key={room.id}>{room.room_number}</li>
              ))}
            </ul>
            <button onClick={() => setShowPopup(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectedRoom;
