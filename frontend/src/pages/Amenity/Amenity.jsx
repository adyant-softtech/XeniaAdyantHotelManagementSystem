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
    const [amenityName, setAmenityName] = useState([]);
    const [amenityRoom, setAmenityRoom] = useState("");
    const [details, setDetails] = useState([]);
    const [noRecordsFound, setNoRecordsFound] = useState(false);
    const [user, setUser] = useState({});
    const [userEmail, setUserEmail] = useState({});
    const [selectedAmenityId, setSelectedAmenityId] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedAmenity, setSelectedAmenity] = useState('');
    const [selectedRoom, setSelectedRoom] = useState('');
    const [roomNumber, setRoomNumber] = useState('');
    const handleChange = (e) => {
        setAmenity(e.target.value);
    };
    useEffect(() => {
        const fetchRoomTypes = async () => {
        const access = localStorage.getItem("access");
        try {
            const data = await getRoomTypes(access, tenant);
            const roomNumbers = data.room_list.map((room) => room.room_number);
            setRoomNumber(roomNumbers);
        } catch (error) {
            console.error("Error fetching room types:", error);
        }
        };
    
        fetchRoomTypes();
    }, []);

    useEffect(() =>{
        getAmenityApiDetails();
    },[]);
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

    

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const payload = {
            name : amenity
        }
        try {
            const access = localStorage.getItem("access");
            if (selectedAmenityId) {
                const data = await editAmenityDetailsApi(access, selectedAmenityId, payload, tenant);
                console.log("data of edit ", data);
                notificationObject.success("Amenity updated successfully!");
            } else {
                await postAmenityApi(access, payload, tenant);
                notificationObject.success("Amenity created successfully!");
            }
        } catch (error) {
            console.error("Error while adding amenity:", error);
        }
        setAmenity(""); 
        getAmenityApiDetails();
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

    const handleEdit = async (details) => {
        // Scroll to top of form
        window.scrollTo(0, 0);
        setSelectedAmenityId(details.id);
        setAmenity(details.name);
    };
        
        
    
    const handleDelete = async (id) => {
        const accessToken = localStorage.getItem("access");
        
        try {
            await deleteAmenityDetailsApi(accessToken, id, tenant);
            notificationObject.success("Amenity deleted successfully!");
            setDetails((prevData) => Array.isArray(prevData) ? prevData.filter(item => item.id !== id) : []);


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
            <fieldset className={style.amenityForm}>
                <legend className={style.formTitle}>Amenity</legend>
                <form className={style.formContainer} onSubmit={handleSubmit}>
                    <div className={style.divContainer}>
                        <div className={style.childContainer1}>
                            <div className={style.formGroup}>
                                <div className={style.labelColon}>
                                <div className={style.labelContainer}>
                                    <div className={style.mandatoryField}>*</div>
                                    <label htmlFor="name">
                                        Amenity Name :
                                    </label>
                                </div>
                                </div>
            
                                <div className={style.inputContainer}>
                                    <input
                                        className={style.inputSection}
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={amenity}
                                        onChange={handleChange}
                                    />
                                    <button
                                        type="submit"
                                        className={`${style.submitButton} submitButton`}
                                        >
                                        {/* {editingHandoverId ? "Update Handover" : "Add Handover"} */}
                                        Add Amenity
                                    </button>
                                </div>
                            </div>
                        </div>
                    
                    </div>
                    
                
                </form>
                
                
            </fieldset>
            <form onSubmit={handleOpenMenu} style={{display: "flex", alignItems: "center", marginTop: "8px", marginBottom: "10px"}}>
                <div style={{display: "flex", alignItems: "center"}}>
                    <button
                        type="submit"
                        className={`${style.submitButton} submitButton`}
                        >
                        Map Amenity to Room
                    </button>
                </div>
            </form>
            {isOpen && (
                    <div className={style.modalOverlay}>
                        <div className={style.modalContent}>
                            <h3>Select Amenity and Room</h3>

                            <label>Room Number:</label>
                            <select
                                value={selectedRoom}
                                onChange={(e) => setSelectedRoom(e.target.value)}
                            >
                                <option value="">Select Room</option>
                                {roomNumber.map((room, index) => (
                                    <option key={index} value={room}>
                                        Room {room}
                                    </option>
                                ))}
                            </select>

                            <label>Amenity:</label>
                            <select
                                value={selectedAmenity}
                                onChange={(e) => setSelectedAmenity(e.target.value)}
                            >
                                <option value="">Select Amenity</option>
                                {details.map((item, index) => (
                                    <option key={index} value={item.name}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>

                            <div style={{ marginTop: '10px', display: "flex", alignItems: "center" }}>
                                <button className={`${style.submitButton} submitButton`} onClick={handleAddAmenity}>Add</button>
                                <button className={`${style.submitButton} submitButton`} onClick={handleClose} style={{ marginLeft: '5px' }}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            {isLoading ? (
                <Grid container justifyContent="center" alignItems="center">
                    <CircularProgress />
                </Grid>
                )  
                    
                : details.length > 0 ? (
                    <TableContainer component={Paper} elevation={3}>
                        <Table>
                            <TableHead
                                style={{
                                backgroundColor: "#edf7f6",
                                fontSize: "11px",
                                }}
                            >
                                <TableRow>
                                    <TableCell align="center" style={{ padding: "0px" }}>
                                        <Button style={{ fontSize: "var(--page-content-font-size)" }}>
                                        {" "}
                                        S.NO.
                                        </Button>
                                    </TableCell>
                                    <TableCell align="center" style={{ padding: "0px" }}>
                                        <Button style={{ fontSize: "var(--page-content-font-size)" }}>
                                        {" "}
                                        Amenity Name
                                        </Button>
                                    </TableCell>
                                    <TableCell align="center" style={{ padding: "0px" }}>
                                        <Button style={{ fontSize: "var(--page-content-font-size)" }}>
                                        {" "}
                                        Action
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {details.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell align="center" style={{ padding: "4px" }}>
                                            {index + 1}
                                        </TableCell>
                                        <TableCell 
                                            align="center" 
                                            style={{ 
                                                padding: "0px",
                                                maxWidth: '50px', 
                                                wordWrap: "break-word", 
                                                overflowWrap: "break-word", 
                                                whiteSpace: "normal"
                                            }}
                                        >
                                            {item.name}
                                        </TableCell>
                                        {user.is_superuser && (
                                            <TableCell align="center" style={{ padding: "4px" }}>
                                                <FaEdit
                                                    style={{ cursor: "pointer", color: "#f79330" }}
                                                    onClick={(e) => handleEdit(item)}
                                                />
                                                &nbsp; &nbsp; &nbsp;
                                                <MdDelete
                                                    style={{ cursor: "pointer", color: "#EB0B0B" }}
                                                    onClick={() => handleDelete(item.id)}
                                                />
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>

                        </Table>
                    </TableContainer>

                ) : (
                    <Typography variant="h6" align="center">
                        No data available.
                    </Typography>
                )
            }
        </div>
    </div>
  );
};

export default Amenity;
