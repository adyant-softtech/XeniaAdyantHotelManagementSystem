/** Creation by Tejasve Gupta on 05-07-2024 */

import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import ExtendStyle from "./extendCheckoutModal.module.css";
import {
  postExtendCheckoutApi,
  getParticularCheckindetailsApi,
} from "../../Api/services";

const ExtendCheckoutModal = ({ isOpen, onRequestClose, checkIn, onExtend }) => {
  const [newCheckoutDate, setNewCheckoutDate] = useState("");
  const [newCheckoutTime, setNewCheckoutTime] = useState("");
  const [personalDetails, setPersonalDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && checkIn) {
      getCheckinDetail();
    }
  }, [isOpen, checkIn]);

  // const getCheckinDetail = async () => {
  //   setIsLoading(true);
  //   try {
  //     const access = localStorage.getItem("access");
  //     const response = await getParticularCheckindetailsApi(access, checkIn.billing_id);
  //     console.log("API Response:", response);
  //     if (response) {
  //       const checkinWithPersonalDetails = response.filtered_checkins.find(
  //         (item) => item.billing_id === checkIn.billing_id
  //       );

  //       if (checkinWithPersonalDetails) {
  //         console.log("Found Check-in:", checkinWithPersonalDetails);
  //         setPersonalDetails(checkinWithPersonalDetails.personal_details);
  //       } else {
  //         console.error("No matching check-in found for the given billing ID");
  //       }
  //     } else {
  //       console.error("No data received from API");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching check-in details:", error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const getCheckinDetail = async () => {
    setIsLoading(true);
    try {
      const access = localStorage.getItem("access");
      const response = await getParticularCheckindetailsApi(
        access,
        checkIn.billing_id
      );
      console.log("API Response:", response);
      console.log("API Response billing_details:", response.billing_details);
      setPersonalDetails(response.billing_details.personal_details);
    } catch (error) {
      console.error("Error fetching check-in details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateString = (dateString) => {
    const [day, month, year] = dateString.split("-");
    return `${year}-${month}-${day}`;
  };

  const handleExtend = async (e) => {
    e.preventDefault();
    const accessToken = localStorage.getItem("access");

    const formattedArrivalDate = formatDateString(checkIn.arrival_date);

    const newCheckout = {
      selectedRooms: JSON.stringify(checkIn.room_number),
      billing_id: checkIn.billing_id,
      departure_date: newCheckoutDate,
      departure_time: newCheckoutTime,
      arrival_date: formattedArrivalDate,
      arrival_time: checkIn.arrival_time,
    };

    try {
      const response = await postExtendCheckoutApi(accessToken, newCheckout);
      onExtend(response);
      onRequestClose();
    } catch (error) {
      console.error("Failed To Add New Check-Out Time", error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Extend Checkout"
      className={ExtendStyle.modal}
      overlayClassName={ExtendStyle.overlay}
    >
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className={ExtendStyle.header}>Extend Check-out</div>
          <div className={ExtendStyle.section}>
            <div className={ExtendStyle.inputPair}>
              <label className={ExtendStyle.labelContainer}>Check-in</label>
              <span className={ExtendStyle.colon}>:</span>

              <div className={ExtendStyle.inputContainer}>
                {checkIn.arrival_date} {checkIn.arrival_time}
              </div>
            </div>
            <div className={ExtendStyle.inputPair}>
              <label className={ExtendStyle.labelContainer}>Check-out</label>
              <span className={ExtendStyle.colon}>:</span>

              <div className={ExtendStyle.dateTimeContainer}>
                <div className={ExtendStyle.inputContainer}>
                  {checkIn.departure_date} {checkIn.departure_time}
                </div>
              </div>
            </div>
            <div className={ExtendStyle.inputPair}>
              <label className={ExtendStyle.labelContainer}>Room No</label>
              <span className={ExtendStyle.colon}>:</span>

              <div className={ExtendStyle.inputContainer}>
                {checkIn.room_number}
              </div>
            </div>
            <div className={ExtendStyle.inputPair}>
              <label className={ExtendStyle.labelContainer}>Billing ID</label>
              <span className={ExtendStyle.colon}>:</span>
              <div className={ExtendStyle.inputContainer}>
                {checkIn.billing_id}
              </div>
            </div>
            <div className={ExtendStyle.inputPair}>
              <label className={ExtendStyle.labelContainer}>
                Extend Check-out
              </label>
              <span className={ExtendStyle.colon}>:</span>

              <div className={ExtendStyle.inputContainer}>
                <input
                  type="date"
                  value={newCheckoutDate}
                  onChange={(e) => setNewCheckoutDate(e.target.value)}
                />
                <input
                  type="time"
                  value={newCheckoutTime}
                  onChange={(e) => setNewCheckoutTime(e.target.value)}
                />
              </div>
            </div>
          </div>
          <h3 className={ExtendStyle.header}>Personal Details</h3>
          <div className={ExtendStyle.section}>
            {personalDetails ? (
              <>
                <div className={ExtendStyle.inputPair}>
                  <label className={ExtendStyle.labelContainer}>First Name</label>
                  <span className={ExtendStyle.colon}>:</span>
                  {personalDetails.name}
                </div>
                <div className={ExtendStyle.inputPair}>
                  <label className={ExtendStyle.labelContainer}>
                    Last Name
                  </label>
                  <span className={ExtendStyle.colon}>:</span>
                  {personalDetails.last_name}
                </div>

                <div className={ExtendStyle.inputPair}>
                  <label className={ExtendStyle.labelContainer}>
                    Phone Number
                  </label>
                  <span className={ExtendStyle.colon}>:</span>
                  {personalDetails.phone}
                </div>
                {/* <div className={ExtendStyle.inputPair}>
                  <label className={ExtendStyle.labelContainer}>Address</label>
                  <span className={ExtendStyle.colon}>:</span>
                  {personalDetails.address}
                </div> */}
              </>
            ) : (
              <p>No personal details available.</p>
            )}
          </div>
          <div className={ExtendStyle.buttonContainer}>
            <button className={ExtendStyle.button} onClick={handleExtend}>
              Save
            </button>
            {/* <button className={ExtendStyle.button} onClick={onRequestClose}>
              Cancel
            </button> */}
          </div>
        </>
      )}
    </Modal>
  );
};

export default ExtendCheckoutModal;
