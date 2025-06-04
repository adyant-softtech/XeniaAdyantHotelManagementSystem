// HotelRooms.js
import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { GlobalContext } from "../../context/Context";
import styles from './HotelRoom.module.css';
import { baseURL } from "../../Api/config";
import { FaHeart, FaShareAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const HotelRoom = () => {
  const { tenant } = useParams();
  const { filteredRooms } = useContext(GlobalContext);
  const navigate = useNavigate();

  const hotel = filteredRooms.find((h) => h.tenant === tenant);

  if (!hotel) {
    return <p>Hotel not found.</p>;
  }
  const handleViewDetails = (roomId) => {
    navigate(`/roomdetails/${roomId}`);
  };

  return (
    
    <div className={styles.dashboardContainer}>

        {hotel.rooms.map((room) => (
            <div key={room.id} className={styles.hotelCard}>
                <div className={styles.hotelImageSection}>
                    {room.image ? (
                    
                    <img
                        src={room.image.startsWith("http") ? room.image : `${baseURL}${room.image}`}
                        alt={`Room ${room.room_number || room.number || "N/A"}`}
                        className={styles.roomImage}
                    />


                    ) : (
                    <div className={styles.noImagePlaceholder}>No Image Available</div>
                    )}
                    <div className={styles.popularLabel}>Premium choice</div>
                </div>

                <div className={styles.hotelInfoSection}>
                    <h3>Room Number: {room.number}</h3>
                    <p>
                    Room Type: {room.room_type} {room.variety ? `(${room.variety})` : ""}
                    </p>
                    <p>
                    Room Variety: {room.number_of_persons
                        ? `Double (Upto ${room.number_of_persons} people)`
                        : "N/A"}
                    </p>
                    {/* Replace static rating with dynamic or default */}
                    <div className={styles.rating}>
                    <span>{room.rating || "7.5"}</span> good (8054 ratings)
                    </div>
                </div>

                <div className={styles.hotelPriceSection}>
                    <div className={styles.iconBox}>
                    <FaHeart className={styles.icon} />
                    <FaShareAlt className={styles.icon} />
                    </div>
                    <p className={styles.price}>₹{room.price}</p>
                    <button
                        className={styles.dealButton}
                        onClick={() =>
                        handleViewDetails(room.id)
                        }
                    >
                        Book
                    </button>
                    {/* <button
                        className={styles.dealButton}
                        onClick={() =>
                        
                        handleViewDetails(room.id)
                        }
                    >
                        Advance Booking
                    </button> */}
                </div>
            </div>
        ))}
    </div>
  );
};

export default HotelRoom;
