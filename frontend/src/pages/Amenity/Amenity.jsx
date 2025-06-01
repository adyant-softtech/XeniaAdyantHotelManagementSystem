import React,  { useState, useEffect, useContext }  from 'react'
import style from "./Amenity.module.css";
import {
  Container,
  Grid,
  Typography,
  TextField,
  Button,
  RadioGroup,
  FormControlLabel,
  Checkbox,
  Radio,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Pagination,
} from "@mui/material";
import { FiArrowLeft } from "react-icons/fi";
import { GlobalContext } from "../../context/Context";
import { getAmenityApi, 
        getAmenityData,
        getAmenity,
        postAmenityApi, 
        userDetails, 
        editAmenityDetailsApi, 
        deleteAmenityDetailsApi,
        getAmenityRoomApi,
        postAmenityRoomApi,
        editAmenityRoomDetailsApi,
        deleteAmenityRoomDetailsApi,
        getRoomTypes,
        } from "../../Api/services";
import notificationObject from "../../components/Widgets/Notification/Notification";
import { useNavigate } from "react-router-dom";
import { MdDelete } from "react-icons/md";
import { FaEdit } from "react-icons/fa";

function Amenity() {
    const { tenant } = useContext(GlobalContext);
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [amenity, setAmenity] = useState("");
    const [amenitiesList, setAmenitiesList] = useState([]);
    const [amenityName, setAmenityName] = useState([]);
    const [amenityRoom, setAmenityRoom] = useState([]);
    const [details, setDetails] = useState([]);
    const [noRecordsFound, setNoRecordsFound] = useState(false);
    const [user, setUser] = useState({});
    const [userEmail, setUserEmail] = useState({});
    const [selectedAmenityId, setSelectedAmenityId] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedAmenity, setSelectedAmenity] = useState('');
    const [selectedAmenities, setSelectedAmenities] = useState({});
    const [selectedRoom, setSelectedRoom] = useState('');
    const [roomNumber, setRoomNumber] = useState([]);
    const [amenityData, setAmenityData] = useState('');
    const handleChange = (e) => {
        setAmenity(e.target.value);
    };
    useEffect(() => {
        const fetchRoomTypes = async () => {
            const access = localStorage.getItem("access");

            // Wait until tenant is set
            if (!tenant) return;

            try {
                const data = await getRoomTypes(access, tenant);
                console.log("Room data:", data);
                setRoomNumber(data.room_list);
            } catch (error) {
                console.error("Error fetching room types:", error);
            }
        };

        fetchRoomTypes();
    }, [tenant]); // Run this effect only when 'tenant' is available


    useEffect(() =>{
        // getAmenityApiDetails();
        const access = localStorage.getItem("access");
        if (access && tenant) {
            getAmenityApiDetails(access, tenant);
        } else {
            console.error('No access token found');
        }
    },[]);
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
        const getAmenities = async () => {
            const access = localStorage.getItem("access");

            // Wait until tenant is available
            if (!tenant) return;

            try {
                const response = await getAmenity(access, tenant);
                setAmenitiesList(response);
            } catch (error) {
                console.error("Error fetching amenities:", error);
            }
        };

        getAmenities();
    }, [tenant]); // Re-run when tenant is available

    useEffect(() => {
        const access = localStorage.getItem("access");
        if (access && tenant) {
            getUserDetails(access, tenant);
        } else {
            console.error('No access token found');
        }
    }, []);
    useEffect(() => {
        const access = localStorage.getItem("access");
        if (access && tenant) {
            getAmenityRoomDetails(access, tenant);
        } else {
            console.error('No access token found');
        }
    }, []);
    const getAmenityApiDetails = async () => {
        setIsLoading(true);
        const access = localStorage.getItem("access");
        try {
            const response = await getAmenityApi(access, tenant);
            // Ensure response is an array
            if (Array.isArray(response)) {
                setDetails(response);
            } else {
                setDetails([]);
                setNoRecordsFound(true);
            }
        } catch (error) {
            console.error("Error fetching amenities:", error);
            setDetails([]);  // Set an empty array if an error occurs
        } finally {
            setIsLoading(false);
        }
    };
    const getUserDetails = async (access) => {
        try {
            const response = await userDetails(access, tenant);
            if (response.user) {
            setUser(response.user);
            setUserEmail(response.email);
            }
        } catch (err) {
            console.error("Error fetching user details:", err);
        }
    };

    const getAmenityRoomDetails = async (access) => {
        try {
            const response = await getAmenityRoomApi(access, tenant);
            setAmenityRoom(response);

            
        } catch (err) {
            console.error("Error fetching user details:", err);
        }
    };

            console.log(".............", amenityRoom);
    

    const handleSubmit = async (roomId) => {
        const selectedAmenitySet = selectedAmenities[roomId];
        if (!selectedAmenitySet || selectedAmenitySet.size === 0) {
        notificationObject.error("Please select at least one amenity to submit.");
        return;
        }

        const payload = {
        room_id: roomId,
        amenities: Array.from(selectedAmenitySet), // convert Set to Array
        };

        try {
        const access = localStorage.getItem("access");
        await postAmenityRoomApi(access, payload, tenant);
        notificationObject.success("Amenities saved successfully for room " + roomId + "!");
        } catch (error) {
        console.error("Error while adding amenities:", error);
        notificationObject.error("Failed to save amenities for room " + roomId);
        }
    };


    
  
    const handleBackClick = () => {
        setIsPopupVisible(true);
    };

    const handleOutsideClick = (e) => {
        if (e.target.className.includes("popupOverlay")) {
        setIsPopupVisible(false);
        }
    };

    const handleOkClick = () => {
        setIsPopupVisible(false);
        window.history.back();
    };

    const handleCancelClick = () => {
        setIsPopupVisible(false);
    };
    const onlyAllowNumberInput = (e) => {
        e.target.value = e.target.value
        .replace(/[^0-9]/g, "")
        .replace(/(\..*?)\..*/g, "$1");
    };

    const handleEdit = async (amenityRoom) => {
        // Scroll to top of form
        window.scrollTo(0, 0);
        setSelectedAmenityId(amenityRoom.id);
        setAmenity(amenityRoom.id);
        setSelectedRoom(amenityRoom.room_number); // or amenityRoom.room_number or amenityRoom.room_id, check your key
        setSelectedAmenity(amenityRoom.amenity_name);
    };
        
        
    
    const handleDelete = async (id) => {
        const accessToken = localStorage.getItem("access");
        
        try {
            await deleteAmenityDetailsApi(accessToken, id, tenant);
            notificationObject.success("Amenity deleted successfully!");
            setAmenityRoom((prevData) => Array.isArray(prevData) ? prevData.filter(item => item.id !== id) : []);


            getAmenityApiDetails();
        } catch (error) {
            notificationObject.error("Error deleting amenity!");
        }
    };

    const handleOpenMenu = (event) => {
        event.preventDefault();
        setIsOpen(true);
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    const handleAddAmenity = async (e) => {
        e.preventDefault();

        const payload = {
            amenity : selectedAmenity,
            room : selectedRoom
        }
        try {
            const access = localStorage.getItem("access");
            await postAmenityRoomApi(access, payload, tenant);
        } catch (error) {
            
        }
        setIsOpen(false);
        getAmenityRoomDetails();
    };
    const handleAmenityChange = (roomId, amenityId) => {
        setSelectedAmenities((prev) => {
        const amenitiesForRoom = new Set(prev[roomId] || []);
        if (amenitiesForRoom.has(amenityId)) {
            amenitiesForRoom.delete(amenityId);
        } else {
            amenitiesForRoom.add(amenityId);
        }
        return {
            ...prev,
            [roomId]: amenitiesForRoom,
        };
        });
    };

  return (
    <div className={style.pageFrame}>
        <div className={style.header}>
            <FiArrowLeft className="backIcon" onClick={handleBackClick} />
            Amenity
        </div>
        {isPopupVisible && (
            <div className="popupOverlay" onClick={handleOutsideClick}>
            <div className="popup">
                <p>You will lose all the entered data</p>
                <div className="popupActions">
                <button onClick={handleOkClick}>Ok</button>
                <button onClick={handleCancelClick}>Cancel</button>
                </div>
            </div>
            </div>
        )}
        <div className={style.pageContainer}>
            
            
            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHead style={{ backgroundColor: "#edf7f6", fontSize: "11px" }}>
                    <TableRow>
                        <TableCell align="center" style={{ padding: "0px" }}>
                        S.NO.
                        </TableCell>
                        <TableCell align="center" style={{ padding: "0px" }}>
                        Room Number
                        </TableCell>
                        <TableCell align="center" style={{ padding: "0px" }}>
                        Set Amenities
                        </TableCell>
                        <TableCell align="center" style={{ padding: "0px" }}>
                        Added Amenities
                        </TableCell>
                    </TableRow>
                    </TableHead>

                    <TableBody>
                    {roomNumber.map((room, index) => (
                        <TableRow key={room.id || index}>
                        {/* Serial No */}
                        <TableCell align="center" style={{ padding: "4px" }}>
                            {index + 1}
                        </TableCell>

                        {/* Room Number */}
                        <TableCell
                            align="center"
                            style={{
                            padding: "4px",
                            maxWidth: "50px",
                            wordWrap: "break-word",
                            overflowWrap: "break-word",
                            whiteSpace: "normal",
                            }}
                        >
                            {room.number}
                        </TableCell>

                        {/* Show Amenity Checkboxes */}
                        <TableCell
                            align="center"
                            style={{
                            padding: "4px",
                            maxWidth: "250px",
                            wordWrap: "break-word",
                            overflowWrap: "break-word",
                            whiteSpace: "normal",
                            }}
                        >
                            {amenityData.map((amenity) => (
                            <label
                                key={amenity.id}
                                style={{
                                marginRight: "10px",
                                display: "inline-flex",
                                alignItems: "center",
                                cursor: "pointer",
                                }}
                            >
                                <Checkbox
                                checked={selectedAmenities[room.id]?.has(amenity.id) || false}
                                onChange={() => handleAmenityChange(room.id, amenity.id)}
                                size="small"
                                color="primary"
                                />
                                {amenity.amenity_name}
                            </label>
                            ))}
                        </TableCell>

                        {/* Submit button per row */}
                        <TableCell align="center" style={{ padding: "4px" }}>
                            <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={() => handleSubmit(room.id)}
                            >
                            Submit
                            </Button>
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </TableContainer>
        </div>
    </div>
  );
};

export default Amenity;
