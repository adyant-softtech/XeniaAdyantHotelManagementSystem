import React, { useState, useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";
import {
  getParticularCheckindetailsApi,
  getSettingsApi,
} from "../../Api/services";
import styles from "./roomMove.module.css";
import { GlobalContext } from "../../context/Context";

const RoomMove = ({ onRoomSelect }) => {
  const {
    roomData,
    availableRoomList,
    reservedRoomList,
    vacantRoomList,
    allRoomBookingDetails,
    setAllRoomBookingDetails,
    tenant,
  } = useContext(GlobalContext);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]); 
  const [selectedRoom, setSelectedRoom] = useState("");
  const [newRoomDetails, setNewRoomDetails] = useState(null);
  const [selectedRooms, setSelectedRooms] = useState([]);

  const [checkinDetails, setCheckinDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const [error, setError] = useState(null);
  const selectedDashboardData = location.state;

  useEffect(() => {
    const getParticularCheckindetails = async () => {
      try {
        const access = localStorage.getItem("access");
        const response = await getParticularCheckindetailsApi(
          access,
          location?.state?.id,
          tenant
        );

        if (response) {
          setAvailableRooms(response.room_list || []); 
          setLoading(false);
          setCheckinDetails(response.checkin_details);
        }
      } catch (error) {
        console.error("Error fetching Particular Checkin Details:", error);
        setError("Failed to fetch check-in details.");
        setLoading(false);
      }
    };

    getParticularCheckindetails();
  }, [location]);

  useEffect(() => {
    const getSettingDetails = async () => {
      try {
        const access = localStorage.getItem("access");
        const response = await getSettingsApi(access, tenant);
        console.log("Settings:", response);
      } catch (error) {
        console.error("Error fetching Setting Details:", error);
      }
    };

    getSettingDetails();
  }, []);

    useEffect(() => {
      var roomCapacityCount = 0;
      selectedRooms.forEach((room) => {
        if (room.variety == "Single") roomCapacityCount = roomCapacityCount + 1;
        if (room.variety == "Double") roomCapacityCount = roomCapacityCount + 2;
        if (room.variety == "Triple") roomCapacityCount = roomCapacityCount + 3;
      });
  
    }, [selectedRooms]);

    useEffect(() => {
    if (selectedDashboardData) {
        setSelectedRooms([selectedDashboardData]);
    }
    }, [selectedDashboardData]);
    useEffect(() => {
    if (selectedDashboardData) {
        setSelectedRooms([selectedDashboardData]);
    }
    }, [selectedDashboardData]);

    const handleRoomChange = (event) => {
      const selectedRoomId = parseInt(event.target.value, 10); // Ensure it's a number
      setSelectedRoom(selectedRoomId);
  
      console.log("Selected Room ID:", selectedRoomId);
      console.log("Room Data:", roomData);
  
      const selectedRoomDetails = allRoomBookingDetails.find(
        (room) => room.id === selectedRoomId
      );
  
      console.log("Selected Room Details:", selectedRoomDetails);
  
      if (selectedRoomDetails) {
          setNewRoomDetails(selectedRoomDetails);
      } else {
          console.error("Room not found in roomData!");
      }
    onRoomSelect(selectedRoomId);
  };


  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB"); // 'en-GB' formats to dd/mm/yyyy
  }

  function formatTime(timeString) {
    const date = new Date(`1970-01-01T${timeString}`);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  }

  return (
    <div>
      <h2 className={styles.heading}>Room Move</h2>
      <div className={styles.roomMoveContainer}>
        

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : (
          <div className={styles.roomDetailsContainer}>
            {/* Current Room Details */}
            <div className={styles.roomBox}>
                <h3 className={styles.label}>Current Room</h3>
              {/* {checkinDetails.map((checkin, index) => (
                <div key={index} className={styles.roomDetail}>
                <div>
                  <strong>Room No.:</strong> {checkin.room_number.number}
                </div>
                <div>
                  <strong>Room Type:</strong> {checkin.room_number.room_type}
                </div>
                <div>
                  <strong>Room Variety:</strong> {checkin.room_number.variety}
                </div>
                <div>
                  <strong>Price:</strong> {checkin.room_number.price}
                </div>

                  
                
                  {index < checkinDetails.length - 1 && (
                    <hr className={styles.divider} />
                  )}
                </div>
              ))} */}
              {checkinDetails.length > 0 && (
                <div className={styles.roomDetail}>
                  <div>
                    <strong>Room No. :</strong> {checkinDetails[0].room_number.number}
                  </div>
                  <div>
                    <strong>Room Type :</strong> {checkinDetails[0].room_number.room_type}
                  </div>
                  <div>
                    <strong>Room Variety :</strong> {checkinDetails[0].room_number.variety}
                  </div>
                  <div>
                    <strong>Price :</strong> {checkinDetails[0].room_number.price}
                  </div>
                </div>
              )}
            </div>

            {/* Available Room Dropdown */}
                <div className={styles.dropdownContainer}>
                  <label className={styles.label}>Select Available Room:</label>
              <select style={{ width : "150px"}}
                  onChange={handleRoomChange}
                  value={selectedRoom}
                  
                  >
                  <option value="" disabled style={{ color: "grey" }}>
                      Select Room
                  </option>
                    {roomData.length > 0 ? (
                      roomData.map((room) => (
                        <option
                          key={room.id}
                          value={room.id}
                          disabled={
                          selectedRooms.some(
                              (selectedRoom) => selectedRoom.room_number === room.room_number
                          ) ||
                            allRoomBookingDetails.some(
                              (roomObject) =>
                              room.room_number === roomObject.room_number &&
                              roomObject.status === "Booked"
                            )
                          }
                        >
                          {room.room_number} ({room.room_type}) ({room.variety})
                        </option>
                      ))
                    ) : (
                      <option disabled>No Available Rooms</option>
                    )}
                  </select>

            </div>

            {/* New Room Details */}
            {newRoomDetails && (
              <div className={styles.roomBox}>
                <h3 className={styles.label}>New Room Details</h3>
                <div>
                  <strong>Room Number :</strong> {newRoomDetails.room_number}
                </div>
                <div>
                  <strong>Room Type :</strong> {newRoomDetails.room_type}
                </div>
                <div>
                  <strong>Room Variety :</strong> {newRoomDetails.variety}
                </div>
                <div>
                  <strong>Price :</strong> {newRoomDetails.price}
                </div>
                
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomMove;
