// Creation by Tejasve Gupta on 24-07-2024
// Reason - to Add and Check Rooms Detail

import React, { useState, useEffect, useContext } from "react";
import {
  postRooms,
  getRoomTypes,
  updateRoomDetail,
  deleteRoomDetail,
  postRoomTypeApi,
  getRoomTypesApi,
  postRoomVarietyApi,
  getRoomVarietyApi,
} from "../../Api/services";
import { FaPlus } from "react-icons/fa";
import { Pagination } from "@mui/material";

import roomStyle from "./AddNewRoomForm.module.css";
import { GlobalContext } from "../../context/Context";
// import { Pagination } from "antd";
import { checkIsEmpty } from "../../utils/validations";
import { MdOutlineDelete } from "react-icons/md";
import { FaRegEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import { MdCancel, MdCheckCircle } from "react-icons/md";
// Created by akanksha on 23rd Oct 2024,
// reason : to disable scroll-to-change functionality for all input[type=number] fields
import {
  disableScrollForNumberInputs,
  cleanupScrollDisable,
} from "../../utils/InputUtils";
import { FiArrowLeft } from "react-icons/fi";
import notificationObject from "../../components/Widgets/Notification/Notification";
// End by akanksha on 23rd Oct 2024,
// reason : to disable scroll-to-change functionality for all input[type=number] fields

const AddNewRoomForm = () => {
  
  const { tenant } = useContext(GlobalContext);
  const [formData, setFormData] = useState({
    room_type: "", // Initially empty
    variety: "",
    price: "",
    number: "",
    id: null, // Add id to track the room being edited
    /**
     * Added by by - Ashish Dewangan on 04-09-2024
     * Reason - implemented active/inactive feature
     */
    is_active: true,
    /**
     * End of addition by - Ashish Dewangan on 04-09-2024
     * Reason - implemented active/inactive feature
     */
  });

  const [errors, setErrors] = useState({});
  // const { tenant } = useContext(GlobalContext);
  const [isModalOpen, setModalOpen] = useState(false);
  const [newType, setNewType] = useState("");

  const [varietyModalOpen, setVarietyModalOpen] = useState(false);
  const [newVariety, setNewVariety] = useState("");

  // const { roomData, setRoomData } = useContext(GlobalContext);
  // const [currentPage, setCurrentPage] = useState(1);
  const [roomTypes, setRoomTypes] = useState([]);
  const [roomVariety, setRoomVariety] = useState([]);
  const [roomData, setRoomData] = useState([]);
  // const pageSize = 10;

  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
  // **Pagination State** added by akanksha on 19th oct
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10); // Define a constant page size
  // **Pagination State** end by akanksha on 19th oct
  const [amenities, setAmenities] = useState([]);
  const [selectedAmenity, setSelectedAmenity] = useState("");

  {
    /* Addition by Om Shrivastava on 03-01-2025
        Reason : Add back icon  */
  }
  const [isPopupVisible, setIsPopupVisible] = useState(false);

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
    // Navigate back
    window.history.back();
    // navigate(-1)
  };

  const handleCancelClick = () => {
    setIsPopupVisible(false);
  };
  {
    /* End of code addition by Om Shrivastava on 03-01-2025
        Reason : Add back icon  */
  }

  // Created by akanksha on 23rd Oct 2024,
  // reason : to disable scroll-to-change functionality for all input[type=number] fields
  useEffect(() => {
    disableScrollForNumberInputs();
    return () => {
      cleanupScrollDisable();
    };
  }, []);
  // End by akanksha on 23rd Oct 2024,
  // reason : to disable scroll-to-change functionality for all input[type=number] fields


  

  // Fetch room types and variety from backend
  useEffect(() => {
    const fetchRoomTypes = async () => {
      const access = localStorage.getItem("access");
      try {
        const data = await getRoomTypes(access, tenant);
        setRoomTypes(data.room_types || []);
        setRoomVariety(data.variety || []);
        setAmenities(data.amenities || []);
        /**
         * Added by by - Ashish Dewangan on 04-09-2024
         * Reason - To show room list with active/inactive data
         */
        setRoomData(data.room_list);
        /**
         * End of addition by by - Ashish Dewangan on 04-09-2024
         * Reason - To show room list with active/inactive data
         */

        if (data.room_types?.length > 0) {
          setFormData((prevFormData) => ({
            ...prevFormData,
            room_type: data.room_types[0].label || "",
            variety: data.variety[0].label || "",
          }));
        }
      } catch (error) {
        console.error("Error fetching room types:", error);
      }
    };

    fetchRoomTypes();
  }, []);

  const handlePostRoomType = async (e) => {
    e.preventDefault();

    const payload = {
      room_type : newType
    }
    try{
      const accessToken = localStorage.getItem("access");
      await postRoomTypeApi(accessToken, payload, tenant);
      setRoomTypes((prev) => [...prev, { value: newType, label: newType }]);
      console.log("New Type Added:", newType);
    }catch(error){
      console.error("Error posting new room type:", error);
    }
    console.log("New Variety:", newType);
    setNewType("");
    setModalOpen(false);
  }

  const handlePostRoomVariety = async (e) => {
    e.preventDefault();

    const payload = {
      room_variety : newVariety
    }
    try{
      const accessToken = localStorage.getItem("access");
      await postRoomVarietyApi(accessToken, payload, tenant);
      setRoomVariety((prev) => [...prev, { value: newVariety, label: newVariety }]);
      console.log("New Variety Added:", newVariety);
    }catch(error){
      console.error("Error posting new room type:", error);
    }
    console.log("New Variety:", newVariety);
    setNewVariety("");
    setVarietyModalOpen(false);
  }

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "room_type" || name === "variety") {
      const dataArray = name === "room_type" ? roomTypes : roomVariety;
      const selectedType = dataArray.find(type => type.value === parseInt(value));
      setFormData({
        ...formData,
        [name]: selectedType ? selectedType.label : value,
      });
    } else if (name === "is_active") {
      setFormData({ ...formData, [name]: e.target.checked });
    } else {
      if (name === "number" && value.includes(".")) {
        return;
      }
      setFormData({
        ...formData,
        [name]: typeof value === "string" ? value.trim() : value,
      });
    }

    if (errors[name]) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    }
  };



  const validateFields = () => {
    const validationErrors = {};
    if (checkIsEmpty(formData.price)) {
      validationErrors.price = "Price cannot be empty.";
    }
    if (checkIsEmpty(formData.number)) {
      validationErrors.number = "Room number cannot be empty.";
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateFields(name, value);
  };

  console.log("room types", roomTypes);
  console.log("form data room type", formData);
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateFields()) {
      return;
    }
    /**
     * Added by - Ashish Dewangn on 09-09-2024
     * Reason - To stop continuous pop from occuring
     */
    setIsSubmitDisabled(true);
    /**
     * End of addition by - Ashish Dewangn on 09-09-2024
     * Reason - To stop continuous pop from occuring
     */
    const access = localStorage.getItem("access");

    const data = {
      ...formData,
      price: parseFloat(formData.price),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      if (formData.id) {
        // If `id` is present, update the room detail
        const updatedRoom = await updateRoomDetail(access, formData.id, data, tenant);
        setRoomData(updatedRoom);
        /**
         * Added by - Ashish Dewangan on 07-09-2024
         * Reason - To reset form after submit
         */
        setFormData({
          room_type: roomTypes[0]?.label || "",
          variety: roomVariety[0]?.label || "",
          price: "",
          number: "",
          id: null,
          is_active: true,
        });
        /**
         * End of addition by - Ashish Dewangan on 07-09-2024
         * Reason - To reset form after submit
         */
      } else {
        // Otherwise, create a new room detail
        const postResponse = await postRooms(access, data, tenant);
        if (postResponse != "error") {
          notificationObject.success("New Room is Created Successfully!");
          setRoomData(postResponse);
          /**
           * Added by - Ashish Dewangan on 07-09-2024
           * Reason - To reset form after submit
           */
          setFormData({
            room_type: roomTypes[0]?.label || "",
            variety: roomVariety[0]?.label || "",
            price: "",
            number: "",
            id: null, // Reset ID for new entries
            is_active: true,
          });
          /**
           * End of addition by - Ashish Dewangan on 07-09-2024
           * Reason - To reset form after submit
           */
        }
      }
      // Fetch updated room list and reset form
      /**
       * Commented by - Ashish Dewangan on 07-09-2024
       * Reason - No need to call get API because we are getting updated list from response of post and put
       */
      // const updatedRoomData = await getRoomTypes(access);
      // setRoomData(updatedRoomData);
      // setFormData({
      //   room_type: roomTypes[0]?.value || "",
      //   variety: roomVariety[0]?.value || "",
      //   price: "",
      //   number: "",
      //   id: null, // Reset ID for new entries
      //   /**
      //    * Added by - Ashish Dewangan on 04-09-2024
      //    * Reason - Implemented active/inactive feature
      //    */
      //   is_active: true,
      //   /**
      //    * End of addition by - Ashish Dewangan on 04-09-2024
      //    * Reason - Implemented active/inactive feature
      //    */
      // });
      /**
       * End of comment by - Ashish Dewangan on 07-09-2024
       * Reason - No need to call get API because we are getting updated list from response of post and put
       */
    } catch (error) {
      console.error("Failed to save room data:", error);
    }
    /**
     * Added by - Ashish Dewangn on 09-09-2024
     * Reason - To stop continuous pop from occuring
     */
    setTimeout(() => {
      setIsSubmitDisabled(false);
    }, 2000);
    /**
     * End of addition by - Ashish Dewangn on 09-09-2024
     * Reason - To stop continuous pop from occuring
     */
  };

  const handleEdit = (room) => {
    setFormData({
      room_type: room.room_type,
      variety: room.variety,
      price: room.room_price,
      number: room.room_number,
      id: room.id, // Set the room ID for editing
      /**
       * Added by - Ashish Dewangan on 04-09-2024
       * Reason - Implemented active/inactive feature
       */
      is_active: room.is_active,
      /**
       * End of addition by - Ashish Dewangan on 04-09-2024
       * Reason - Implemented active/inactive feature
       */
    });
  };

  const handleDelete = async (roomId) => {
    const access = localStorage.getItem("access");
    try {
      const updatedRoomData = await deleteRoomDetail(access, roomId, tenant);
      // console.log("-------updatedRoomData",updatedRoomData.roomData)
      // console.log("Room deleted successfully");
      // Fetch updated room list
      // const updatedRoomData = await getRoomTypes(access);
      // console.log("updatedRoomData",updatedRoomData)
      setRoomData(updatedRoomData.roomData);
    } catch (error) {
      console.error("Failed to delete room:", error);
    }
  };

  // const handlePageChange = (page) => {
  //   setCurrentPage(page);
  // };

  // const paginatedData = roomData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // **Pagination State** added by akanksha on 19th oct
  const paginatedData = roomData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (_, page) => {
    setCurrentPage(page);
  };
  // **Pagination State** end by akanksha on 19th oct

  return (
    <div className={roomStyle.parentContainer}>
      <div className={roomStyle.header}>
        {/* Modification and addition by Om Shrivastava on 03-01-2025
            Reason : Add back icon  */}
        <FiArrowLeft className="backIcon" onClick={handleBackClick} />
        Room Details
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
      {/* End of code modification and addition by Om Shrivastava on 03-01-2025
            Reason : Add back icon  */}
      <div className={roomStyle.bodyContainer}>
        <form className={roomStyle.formContainer} onSubmit={handleSubmit}>
          <div className={roomStyle.form}>
            <div className={roomStyle.inputPair}>
              <label
                className={roomStyle.labelContainer}
                style={{ width: "100px" }}
              >
                <span className={roomStyle.mandatoryField}>* </span>Room Type
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <select
                  className={roomStyle.selectRoomTypeContainer}
                  name="room_type"
                  value={formData.room_type}
                  onChange={handleChange}
                >
                  {roomTypes.map((type, index) => (
                    <option key={index} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <FaPlus
                  style={{ cursor: "pointer", color: "#007bff" }}
                  onClick={() => setModalOpen(true)}
                />
              </div>
            </div>
            {isModalOpen && (
              <div className={roomStyle.modalOverlay}>
                <div className={roomStyle.modalContent}>
                  <h3>Add Room Type</h3>
                  <label>Type Name:</label>
                  <input
                    type="text"
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className={roomStyle.inputBox}
                  />
                  <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
                    <button onClick={handlePostRoomType} className={roomStyle.submitBtn}>
                      Submit
                    </button>
                    <button onClick={() => setModalOpen(false)} className={roomStyle.closeBtn}>
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
            <div className={roomStyle.inputPair}>
              {/* Code changed by - Ashlekh on 04-10-2024
              Reason - To apply multiple class name for styling */}
              {/* <label className={roomStyle.labelContainer}> */}
              <label
                className={`${roomStyle.labelContainer} ${roomStyle.roomVarietyLabel}`}
              >
                {/* End of code - Ashlekh on 04-10-2024
                Reason - To apply multiple class name for styling */}
                <span className={roomStyle.mandatoryField}>* </span>Room Variety
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <select
                  className={roomStyle.selectRoomTypeContainer}
                  name="variety"
                  value={formData.variety}
                  onChange={handleChange}
                  style={{
                    width: "150px",
                  }}
                >
                  {roomVariety.map((type, index) => (
                    <option key={index} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <FaPlus
                  style={{ cursor: "pointer", color: "#007bff" }}
                  onClick={() => setVarietyModalOpen(true)}
                />
              </div>
            </div>
            {varietyModalOpen && (
              <div className={roomStyle.modalOverlay}>
                <div className={roomStyle.modalContent}>
                  <h3>Add Room Variety</h3>
                  <label>Variety Name:</label>
                  <input
                    type="text"
                    value={newVariety}
                    onChange={(e) => setNewVariety(e.target.value)}
                    className={roomStyle.inputBox}
                  />
                  <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
                    <button onClick={handlePostRoomVariety} className={roomStyle.submitBtn}>
                      Submit
                    </button>
                    <button onClick={() => setVarietyModalOpen(false)} className={roomStyle.closeBtn}>
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
            <div className={roomStyle.inputPair}>
              <label className={roomStyle.labelContainer}>
                <span className={roomStyle.mandatoryField}>* </span>Price
              </label>
              <div className={roomStyle.inputError}>
                <input
                  className={roomStyle.inputContainer}
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  step="0.01"
                />
                {errors.price && (
                  <span className={roomStyle.error}>{errors.price}</span>
                )}
              </div>
            </div>
            <div className={roomStyle.inputPair}>
              <label className={roomStyle.labelContainer}>
                <span className={roomStyle.mandatoryField}>* </span>Room Number
              </label>
              <div className={roomStyle.inputError}>
                <input
                  className={roomStyle.inputContainer}
                  type="text"
                  // type="number"
                  name="number"
                  value={formData.number}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  // Added by - Ashlekh on 04-10-2024
                  // Reason - To add max length in room number
                  maxLength={6}
                  // End of code - Ashlekh on 04-10-2024
                  // Reason - To add max length in room number
                />
                {errors.number && (
                  <span className={roomStyle.error}>{errors.number}</span>
                )}
              </div>
            </div>
            {/**
             * Added by - Ashish Dewangan on 04-09-2024
             * Reason - Implemented active/inactive feature
             */}

            <div className={roomStyle.inputPair}>
              <label className={roomStyle.labelContainer}>Is Active</label>
              <div className={roomStyle.inputError}>
                <input
                  className={roomStyle.inputContainer}
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                />
              </div>
            </div>
            {/**
             * End of addition by - Ashish Dewangan on 04-09-2024
             * Reason - Implemented active/inactive feature
             */}
          </div>
          
          <div className={roomStyle.buttonContainer}>
            <button
              // className={roomStyle.createButton}
              className={`${roomStyle.createButton} submitButton`}
              /**
               * Added by - Ashish Dewangn on 09-09-2024
               * Reason - To stop continuous pop from occuring
               */
              disabled={isSubmitDisabled}
              /**
               * End of addition by - Ashish Dewangn on 09-09-2024
               * Reason - To stop continuous pop from occuring
               */
              type="submit"
            >
              {formData.id ? "Update Room" : "Save Room"}
            </button>
          </div>
        </form>

        

        <div className={roomStyle.container}>
          <div className={roomStyle.listHeader}>
            {/* <div className={roomStyle.idColumn}>ID</div> */}
            {/* added by akanksha on 19th oct, Reason to add serial no column */}
            <div className={roomStyle.serialColumn}>S.NO.</div>
            {/* end by akanksha on 19th oct, Reason to add serial no column */}
            <div className={roomStyle.numberColumn}>Room Number</div>
            <div className={roomStyle.typeColumn}>Room Type</div>
            <div className={roomStyle.typeColumn}>Room Variety</div>
            <div className={roomStyle.priceColumn}>Price (₹)</div>
            {/**
             * Added by - Ashish Dewangan on 04-09-2024
             * Reason - Implemented active/inactive feature
             */}
            <div className={roomStyle.priceColumn}>Is Active</div>
            {/**
             * End of addition by - Ashish Dewangan on 04-09-2024
             * Reason - Implemented active/inactive feature
             */}
            <div className={roomStyle.actionColumn}>Actions</div>
          </div>
          {/* {paginatedData.map((room) => ( */}
          {/* // **Pagination State and serial no** added by akanksha on 19th oct */}
          {Array.isArray(roomData) && roomData.length > 0 ? (
            paginatedData.map((room, index) => (
              <div key={room.id} className={roomStyle.row}>
                {/* <div className={roomStyle.idColumn}>{room.id}</div> */}
                <div className={roomStyle.serialColumn}>
                  {" "}
                  {(currentPage - 1) * pageSize + index + 1}
                </div>
                {/* // **Pagination State and serial no** end by akanksha on 19th oct */}
                <div className={roomStyle.numberColumn}>{room.room_number}</div>
                <div className={roomStyle.typeColumn}>{room.room_type}</div>
                <div className={roomStyle.typeColumn}>{room.variety}</div>
                <div className={roomStyle.priceColumn}>₹ {room.room_price}</div>
                {/**
                 * Added by - Ashish Dewangan on 04-09-2024
                 * Reason - Implemented active/inactive feature
                 */}
                <div className={roomStyle.priceColumn}>
                  {room.is_active ? (
                    <MdCheckCircle
                      style={{ cursor: "pointer", color: "#16c60c" }}
                    />
                  ) : (
                    <MdCancel style={{ cursor: "pointer", color: "#eb0b0b" }} />
                  )}
                </div>
                {/**
                 * End of addition by - Ashish Dewangan on 04-09-2024
                 * Reason - Implemented active/inactive feature
                 */}
                <div className={roomStyle.actionColumn}>
                  {/* <div className={roomStyle.columnButtons}> */}
                  {/* Modification and addition by Om Shrivastava on 03-09-2024
                  Reason : Change the design of edit and delete icon */}
                  {/* <div className={roomStyle.editButton} onClick={() => handleEdit(room)}><FaRegEdit /></div>
                  <div className={roomStyle.deleteButton} onClick={() => handleDelete(room.id)}><MdOutlineDelete /></div> */}
                  <FaEdit
                    style={{ cursor: "pointer", color: "#f79330" }}
                    onClick={() => handleEdit(room)}
                  />
                  {/**
                   * Commented by - Ashish Dewangan on 04-09-2024
                   * Reason - To hide delete button
                   */}
                  {/* &nbsp; &nbsp; &nbsp; */}
                  {/* <MdDelete
                    style={{ cursor: "pointer", color: " #EB0B0B" }}
                    onClick={() => handleDelete(room.id)}
                  /> */}
                  {/**
                   * End of comment by - Ashish Dewangan on 04-09-2024
                   * Reason - To hide delete button
                   */}
                  {/* Modification and addition by Om Shrivastava on 03-09-2024
                  Reason : Change the design of edit and delete icon */}
                  {/* </div> */}
                </div>
              </div>
            ))
          ) : (
            <div>No rooms available.</div>
          )}

          {/* ))} */}
          {/* <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={roomData.length}
            onChange={handlePageChange}
          /> */}
          {/* // **Pagination State** added by akanksha on 19th oct */}
          <div className={roomStyle.pagination}>
            <Pagination
              count={Math.ceil(roomData.length / pageSize)}
              current={currentPage}
              pageSize={pageSize}
              total={roomData.length}
              onChange={handlePageChange}
            />
          </div>
          {/* // **Pagination State** end by akanksha on 19th oct */}
        </div>
        {/* </div> */}
      </div>
    </div>
  );
};

export default AddNewRoomForm;
