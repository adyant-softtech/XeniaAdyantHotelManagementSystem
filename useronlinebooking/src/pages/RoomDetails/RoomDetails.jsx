import React, { useState, useEffect, useContext } from "react";
import BookingModal from '../../components/BookingModal/BookingModal'; // ? Path correctly used
import GuestDetailsForm from '../../components/GuestDetailsForm/GuestDetailsForm'; // ? Replace if path is different
import styles from './RoomDetails.module.css';
import { useParams } from 'react-router-dom';
import { getRoomDetails } from '../../Api/services';
import { GlobalContext } from "../../context/Context";
import { baseURL } from "../../Api/config";

const RoomDetails = () => {
  const { roomId } = useParams();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { tenant } = useContext(GlobalContext);
  
  const [roomDetails, setRoomDetails] = useState(null);

  const handleBookClick = () => {
    setShowForm(true);
  };

  const handleCloseModal = () => {
    setShowForm(false);
  };

  
  useEffect(() => {
    const fetchDetails = async () => {
      try {
       
        const data = await getRoomDetails( roomId);
        setRoomDetails(data.room_detail);
      } catch (err) {
        setError("Failed to fetch room details");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [roomId]);


  return (
    <div className={styles.roomDetailsContainer}>
      {loading ? (
        <div>Loading room details...</div>
      ) : error ? (
        <div>{error}</div>
      ) : roomDetails ? (
        <div className={styles.detailsContent}>
          {roomDetails?.image ? (
            <img 
              src={`${roomDetails.image}`} 
              alt="Main Room" 
              className={styles.mainImage} 
            />
          ) : (
            <div className={styles.noImagePlaceholder}>No Image Available</div>
          )}

          <div className={styles.rightDetails}>
            <div className={styles.detailRow}>
              <span className={styles.label}>Room Type :</span>
              <span className={styles.value}>{roomDetails.room_type}</span>
            </div>

            <div className={styles.detailRow}>
              <span className={styles.label}>Room Variety :</span>
              <span className={styles.value}>{roomDetails.variety}</span>
            </div>

            <div className={styles.detailRow}>
              <span className={styles.label}>Room Price -</span>
              <span className={styles.value}>Rs {roomDetails.price}</span>
            </div>

            <p>Most popular facilities:</p>
            <ul className={styles.facilitiesList}>
              <li className={styles.facilityItem}>Outdoor swimming pool</li>
              <li className={styles.facilityItem}>Free WiFi</li>
              <li className={styles.facilityItem}>Family rooms</li>
              <li className={styles.facilityItem}>Fitness centre</li>
              <li className={styles.facilityItem}>Free parking</li>
              <li className={styles.facilityItem}>Tea/coffee maker in all rooms</li>
              <li className={styles.facilityItem}>Very good breakfast</li>
            </ul>

            <button className={styles.bookButton} onClick={handleBookClick}>
              BOOK THIS NOW
            </button>
          </div>
        </div>
      ) : (
        <div>No room details available.</div>
      )}


      <div className={styles.carouselImages}>
        {roomDetails?.images && roomDetails.images.length > 0 ? (
          roomDetails.images.map(({ id, image }) => (
            <img key={id} src={`${baseURL}${image}`} alt={`Room image ${id}`} />
          ))
        ) : (
          <p>No images available</p>
        )}
      </div>


     <div className={styles.descriptionSection}>
      <div className={styles.descriptionRow}>
        <span className={styles.label}>Description:</span>
        <span className={styles.descriptionValue}>{roomDetails?.room_description}</span>
      </div>
    </div>


      {showForm && (
        <BookingModal onClose={handleCloseModal}>
          <GuestDetailsForm />
        </BookingModal>
      )}
    </div>
  );
};

export default RoomDetails;
