import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from 'react-router-dom';
import { FaHeart, FaShareAlt } from 'react-icons/fa';
import styles from './HotelPage.module.css';
import { FaStar } from 'react-icons/fa';
import {
  getRoomTypes,
  getRoomDetails,
  getFilterData,
  getAmenityFilterData,
  getAmenityApi,
  getAmenityData,
  getHotel,
} from "../../Api/services";
import { GlobalContext } from "../../context/Context";
import { baseURL } from "../../Api/config";

const HotelPage = () => {
  const {  filteredRooms, setRoomData, setFilteredRooms} = useContext(GlobalContext);
 
// const [roomsToRender, setRoomsToRender] = useState([]);
  
  // const roomsToRender = filteredRooms.length > 0 ? filteredRooms : roomData;
  console.log("jdsgfjadshfjd", filteredRooms)

  // console.log("roomData from context", roomData);
  console.log("filteredRooms from context", filteredRooms);

  
  
  const navigate = useNavigate();
  const { tenant } = useContext(GlobalContext);
  const [roomTypes, setRoomTypes] = useState([]);
  const [roomVariety, setRoomVariety] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [rooomDataSet, setRoomDataSet] = useState([]);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [roomDetails, setRoomDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [details, setDetails] = useState([]);
  
  const [filteredAmenityRooms, setFilteredAmenityRooms] = useState([]);
  const [selectedAmenity, setSelectedAmenity] = useState("");
  const [selectedAmenityName, setSelectedAmenityName] = useState("");
  const [amenityData, setAmenityData] = useState('');
  const [hotelData, setHotelData] = useState('');

  useEffect(() => {
    const fetchRoomTypes = async () => {
      const access = localStorage.getItem("access");
      try {
        if (!tenant || tenant === "null") {
          console.error("Tenant value is missing or null");
          return;
        }
        const data = await getRoomTypes(access, tenant);
        console.log("dashboard .jsx");
        setRoomTypes(data.room_types || []);
        setRoomVariety(data.variety || []);
        setAmenities(data.amenities || []);
        setRoomDataSet(data.room_list);
      } catch (error) {
        console.error("Error fetching room types:", error);
      }
    };

    if (tenant && tenant !== "null") {
      fetchRoomTypes();
    }
  }, [tenant]);

  // useEffect(() => {
  //   setFilteredRooms([]); 
  // }, []);

  useEffect(() =>{
        getAmenityDetails();
    },[]);
  const getAmenityDetails = async () => {
      
      try {
          const response = await getAmenityData();
          setAmenityData(response);
      } catch (error) {
          console.error("Error fetching amenities:", error);
          
      } 
  };

    useEffect(() =>{
        getHotelDetails();
    },[]);
  const getHotelDetails = async () => {
      
      try {
          const response = await getHotel();
          setHotelData(response);
      } catch (error) {
          console.error("Error fetching amenities:", error);
          
      } 
  };

  useEffect(() => {
    const getFilter = async () => {
      try {
        const response = await getFilterData(selectedAmenity);
        // const roomDetailsArray = response.amenities.map(item => item.rooms); // Fix: access `amenities` key
        const roomDetailsArray = response.amenities.flatMap(item => item.rooms);

        console.log("Extracted Room Details:", roomDetailsArray);
        setFilteredAmenityRooms(roomDetailsArray);
      } catch (error) {
        console.error("Error fetching amenities:", error);
      }
    };

    if (selectedAmenity) {
      getFilter(); // Call only if a radio button has been selected
    }
  }, [selectedAmenity]); // 👈 now it listens for changes

  

  const getAmenityApiDetails = async () => {
    const access = localStorage.getItem("access");
    if (!access || !tenant) {
      console.error("No access token or tenant found");
      return;
    }
    try {
        const response = await getAmenityApi(access, tenant);
        // Ensure response is an array
        if (Array.isArray(response)) {
            setDetails(response);
        } else {
            setDetails([]);
        }
    } catch (error) {
        console.error("Error fetching amenities:", error);
        setDetails([]);  // Set an empty array if an error occurs
    } 
  };

  useEffect(() => {
    if (tenant && tenant !== "null") {
      getAmenityApiDetails();
    }
  }, [tenant]);

 const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };
  const handleViewDetails = (roomId) => {
    navigate(`/roomdetails/${roomId}`);
  };


// const roomsToRender = filteredRooms;
const roomsToRender = filteredRooms.length > 0 ? filteredRooms : rooomDataSet;

const handleViewRooms = (tenant) => {
    navigate(`/hotelRoom/${tenant}`);
  };

  return (
    <div className={styles.dashboardContainer}>
      {/* <div className={styles.amenityFilter}>
        <label>Room Amenity:</label>
        <div style={{ display: 'flex', gap: '15px', marginTop: '8px' }}>
          {amenityData && amenityData.length > 0 ? (
            amenityData.map((amenity) => (
              <label key={amenity.id} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="amenity"
                  value={amenity.amenity_name}
                  onChange={(e) => setSelectedAmenity(e.target.value)}
                  style={{ marginRight: '5px' }}
                />
                {amenity.amenity_name}
              </label>
            ))
          ) : (
            <p>No amenities available</p>
          )}
        </div>
      </div> */}

      {roomsToRender && roomsToRender.length > 0 ? (
        roomsToRender.map((hotel, index) => {
          const room = hotel.rooms && hotel.rooms.length > 0 ? hotel.rooms[0] : null;
          if (!room) return null;

          return (
            <div key={index} className={styles.hotelCard}>
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
                <h3>Hotel Name: {hotel.hotel_name}</h3>
                <p>
                  Room Type: {room.room_type} {room.variety ? `(${room.variety})` : ""}
                </p>
                <p>
                  Room Variety: {room.number_of_persons
                    ? `Double (Upto ${room.number_of_persons} people)`
                    : "N/A"}
                </p>
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
                <button onClick={() => handleViewRooms(hotel.tenant)}>View Rooms</button>
              </div>
            </div>
          );
        })
      ) : (
        <p>No hotels available</p>
      )}
    </div>

  );
};

export default HotelPage;
