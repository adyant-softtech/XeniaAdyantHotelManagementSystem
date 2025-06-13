import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from 'react-router-dom';
import { FaHeart, FaShareAlt } from 'react-icons/fa';
import { FaRegSquare, } from "react-icons/fa";
import { FaCheckSquare } from "react-icons/fa";
import styles from './Dashboard.module.css';
import { FaStar } from 'react-icons/fa';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { FaUser } from 'react-icons/fa';
import {
  getRoomTypes,
  getRoomDetails,
  getFilterData,
  getAmenityFilterData,
  getAmenityApi,
  getAmenityData,
  getHotelByPriceRange,
} from "../../Api/services";
import { GlobalContext } from "../../context/Context";
import { baseURL } from "../../Api/config";

const Dashboard = () => {
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
  const [priceRange, setPriceRange] = useState([0, 0]);
  const [priceFilteredRooms, setPriceFilteredRooms] = useState([]);


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

  useEffect(() => {
    setFilteredRooms([]); 
  }, []);

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

  const handleSliderChange = (event, newValue) => {
    setPriceRange(newValue);
  };

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

  console.log("...............", filteredAmenityRooms);

useEffect(() => {
  const fetchRoomsByPrice = async () => {
    try {
      const [min_price, max_price] = priceRange;

      if (min_price === 0 && max_price === 0) {
        setPriceFilteredRooms([]); // Clear if no range
        return;
      }

      const response = await getHotelByPriceRange({ min_price, max_price });

      const flatRooms =
        response?.filtered_hotels?.flatMap(hotel => hotel.rooms) || [];

      console.log("Flat price-filtered rooms:", flatRooms);

      setPriceFilteredRooms(flatRooms);
    } catch (error) {
      console.error("Error filtering rooms by price:", error);
      setPriceFilteredRooms([]);
    }
  };

  fetchRoomsByPrice();
}, [priceRange]);



// const roomsToRender = 
//   (filteredRooms && filteredRooms.length > 0) ? filteredRooms :
//   (filteredAmenityRooms && filteredAmenityRooms.length > 0) ? filteredAmenityRooms :
//   rooomDataSet;
  
const filteredLists = [];

if (filteredRooms?.length > 0) filteredLists.push(filteredRooms);
if (filteredAmenityRooms?.length > 0) filteredLists.push(filteredAmenityRooms);
if (priceFilteredRooms?.length > 0) filteredLists.push(priceFilteredRooms);

const intersectRooms = (lists) => {
  if (lists.length === 0) return [];

  return lists.reduce((acc, curr) =>
    acc.filter(room => curr.find(r => r.id === room.id))
  );
};

const roomsToRender =
  filteredLists.length > 0 ? intersectRooms(filteredLists) : rooomDataSet;

const [isChecked, setIsChecked] = useState(false);
// const [checkedRooms, setCheckedRooms] = useState({});
const { checkedRooms, setCheckedRooms } = useContext(GlobalContext);


 const toggleCheckbox = (roomId) => {
  setCheckedRooms((prev) => ({
    ...prev,
    [roomId]: !prev[roomId],
  }));
};

  const selectedRooms = Object.keys(checkedRooms)
  .filter((roomId) => checkedRooms[roomId])
  .map((roomId) => {
    const room = (filteredRooms.length > 0 ? filteredRooms : rooomDataSet).find(
      (room) => room.id === parseInt(roomId)
    );
    return room;
  });

  return (
    <div className={styles.dashboardContainer} style={{ display: 'flex', alignItems: 'flex-start' }}>

      <div className={styles.sidebar}>
        <h4>Room amenities</h4>
        {amenityData && amenityData.length > 0 ? (
          <div className={styles.amenityList}>
            {amenityData.map((amenity) => (
              <label key={amenity.id} className={styles.amenityItem}>
                <input
                  type="checkbox"
                  name="amenity"
                  value={amenity.amenity_name}
                  onChange={(e) => setSelectedAmenity(e.target.value)}
                />
                {amenity.amenity_name}
              </label>
            ))}
          </div>
        ) : (
          <p>No amenities available</p>
        )}
        <hr style={{ marginTop: '16px', borderTop: '1px solid #ccc' }} />
        <div>
          <Box mt={4}>
          <h4>Your budget (per night)</h4>
          <Slider
            value={priceRange}
            onChange={handleSliderChange}
            valueLabelDisplay="auto"
            min={0}
            max={3870}
            step={50}
          />
          <Box display="flex" justifyContent="space-between">
            <Typography>Rs. {priceRange[0]}</Typography>
            <Typography>Rs. {priceRange[1]}</Typography>
          </Box>
        </Box>
        </div>
      </div>

      <div className={styles.roomList}>
        {roomsToRender && roomsToRender.length > 0 ? (
          roomsToRender.map((room) => (
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
                {/* <div className={styles.popularLabel}>Premium choice</div> */}
              </div>

              <div className={styles.hotelInfoSection}>
                <h3>Room Number: {room.room_number || room.number || "N/A"}</h3>
                <p>
                  Room Type: {room.room_type} {room.variety ? `(${room.variety})` : ""}
                </p>
                <p>
                  Room Variety: {room.number_of_persons
                    ? `Double (Upto ${room.number_of_persons} people)`
                    : "N/A"}
                </p>
                {/* Replace static rating with dynamic or default */}
                {/* <div className={styles.rating}>
                  <span>{room.rating || "7.5"}</span> good (8054 ratings)
                </div> */}
                <p>
                  Room Amenities: {room.amenities || "N/A"} 
                </p>
              </div>

              <div className={styles.hotelPriceSection}>
                <div className={styles.iconBox}>
                  {/* <input
                    type="checkbox"
                    checked={!!checkedRooms[room.id]}
                    onChange={() => toggleCheckbox(room.id)}
                    className={styles.checkboxInput}
                  /> */}
                  <button
                    onClick={() => toggleCheckbox(room.id)}
                    // className={`${styles.checkboxInput} ${checkedRooms[room.id] ? styles.active : ''}`}
                    className={`${styles.checkboxInput} ${checkedRooms[room.id] ? styles.active : ''}`}
                  >
                    {checkedRooms[room.id] ? 'Added' : 'Add'}
                  </button>

                 
                </div>
                <p className={styles.price}>
                  ₹{room.price || room.room_price || "N/A"}
                </p>

                <button
                  className={styles.dealButton}
                  onClick={() =>
                    handleViewDetails(room.id)
                  }
                >
                  View
                </button>
                {/* <button
                  className={styles.dealButton}
                  onClick={() =>
                    handleViewDetails(room.id)
                  }
                >
                  Current Booking
                </button>
                <button
                  className={styles.dealButton}
                  onClick={() =>
                    handleViewDetails(room.id)
                  }
                >
                  Advance Booking
                </button> */}
              </div>
            </div>
          ))
        ) : (
          <p>No rooms available</p>
        )}
      </div>
      
    </div>

    
  );
};

export default Dashboard;
