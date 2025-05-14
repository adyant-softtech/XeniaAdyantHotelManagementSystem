// Created by Om shrivastava on 13-08-2024 for showing the dashboard data
import React, { useContext, useState } from "react";
import styles from "./dashboard.module.css";
import { GlobalContext } from "../../context/Context";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { allRoomBookingDetails } = useContext(GlobalContext);
  const [selectedRoomType, setSelectedRoomType] = useState("All");
  const navigate = useNavigate();

  // Filter rooms based on selected room type
  const filteredRooms =
    selectedRoomType === "All"
      ? allRoomBookingDetails
      : allRoomBookingDetails.filter(
          (room) => room.room_type === selectedRoomType
        );

  // Count the total number of rooms
  const totalRooms = allRoomBookingDetails.length;

  // Count the number of rooms based on status
  const availableRooms = allRoomBookingDetails.filter(
    (room) => room.status === "Free"
  ).length;
  const advancedRooms = allRoomBookingDetails.filter(
    (room) => room.status === "Advance"
  ).length;
  const reservedRooms = allRoomBookingDetails.filter(
    (room) => room.status === "Booked"
  ).length;

  {
    /* Addition by Om shrivastava on 12-09-2024
                        Reason : Change the time format  */
  }
  function formatTiming(timing) {
    const [date, time] = timing.split(" "); // Split the timing into date and time parts
    let [hours, minutes] = time.split(":"); // Split the time into hours and minutes

    // Convert hours from 24-hour format to 12-hour format
    const period = hours >= 12 ? "pm" : "am";
    hours = hours % 12 || 12; // Convert '00' to '12' and handle the 12-hour conversion

    // Return the formatted date with time in 12-hour format and am/pm
    return `${date} ${hours}:${minutes} ${period}`;
  }
  {
    /* Addition by Om shrivastava on 12-09-2024
                        Reason : Change the time format  */
  }

  return (
    <div className={styles.pageFrame}>
      <header className={styles.header}>
        <div className={styles.rooms}>
          <div className={styles.room}>
            <span
              className={`material-icons ${styles.icon}`}
              style={{ color: "#f78b00", fontSize: "22px" }}
            >
              hotel
            </span>
            <div className={styles.roomInfo}>
              <h3>All Rooms :</h3>
              <span>{totalRooms}</span>
            </div>
          </div>

          <div className={styles.room}>
            <span
              className={`material-icons ${styles.icon}`}
              // Color change by Om Shrivastava on 29-08-2024
              // style={{ color: "#34A853" }}
              style={{ color: "#14b22e", fontSize: "22px" }}
            >
              check_circle
            </span>
            <div className={styles.roomInfo}>
              {/* Change the name by Om Shrivastava on 29-08-2024 */}
              {/* <h3>Free</h3> */}
              <h3>Available :</h3>

              <span>{availableRooms}</span>
            </div>
          </div>

          <div className={styles.room}>
            {/* <span
              className={`material-icons ${styles.icon}`}
              
              style={{ color: "#ed6d47" }}
            >
              event
            </span> */}
            <img src="advanceImg.png" style={{ width: "1.8vw" }} />

            <div className={styles.roomInfo}>
              <h3>Booked :</h3>
              <span>{reservedRooms}</span>
            </div>
          </div>

          <div className={styles.room}>
            {/* <span
              className={`material-icons ${styles.icon}`}
              // Color change by Om Shrivastava on 29-08-2024

              // style={{ color: "#EA4335" }}
              style={{ color: "#78c6d9" ,fontSize:'22px'}}
            >
              cancel
            </span> */}
            <span
              className={`material-icons ${styles.icon}`}
              style={{ color: "#0000f6", fontSize: "22px" }}
            >
              event
            </span>
            <div className={styles.roomInfo}>
              <h3>Advance :</h3>
              <span>{advancedRooms}</span>
            </div>
          </div>
        </div>

        <div className={styles.roomCategories}>
          <button
            className={`${styles.roomButton} ${
              selectedRoomType === "All" ? styles.active : ""
            }`}
            onClick={() => setSelectedRoomType("All")}
          >
            All Rooms
          </button>
          <button
            // Modification and addition by Om Shrivastava on 29-08-2024
            // Reason : Change the room type data
            // className={`${styles.roomButton} ${
            //   selectedRoomType === "Standard" ? styles.active : ""
            // }`}
            // onClick={() => setSelectedRoomType("Standard")}
            className={`${styles.roomButton} ${
              selectedRoomType === "Standard(Non AC)" ? styles.active : ""
            }`}
            onClick={() => setSelectedRoomType("Standard(Non AC)")}
            // Modification and addition by Om Shrivastava on 29-08-2024
            // Reason : Change the room type data
          >
            Standard Room
          </button>
          <button
            // Modification and addition by Om Shrivastava on 29-08-2024
            // Reason : Change the room type data
            // className={`${styles.roomButton} ${
            //   selectedRoomType === "Superior" ? styles.active : ""
            // }`}
            // onClick={() => setSelectedRoomType("Superior")}
            className={`${styles.roomButton} ${
              selectedRoomType === "Superior(AC)" ? styles.active : ""
            }`}
            onClick={() => setSelectedRoomType("Superior(AC)")}
            // Modification and addition by Om Shrivastava on 29-08-2024
            // Reason : Change the room type data
          >
            Superior Room
          </button>
          <button
            // Modification and addition by Om Shrivastava on 29-08-2024
            // Reason : Change the room type data
            // className={`${styles.roomButton} ${
            //   selectedRoomType === "Executive" ? styles.active : ""
            // }`}
            // onClick={() => setSelectedRoomType("Executive")}
            className={`${styles.roomButton} ${
              selectedRoomType === "Executive(AC)" ? styles.active : ""
            }`}
            onClick={() => setSelectedRoomType("Executive(AC)")}
            // Modification and addition by Om Shrivastava on 29-08-2024
            // Reason : Change the room type data
          >
            Executive Room
          </button>
        </div>
      </header>
      <section className={styles.cardContainer}>
        {filteredRooms.map((data, index) => (
          <div
            key={index}
            className={styles.cards}
            onClick={() => {
              if (data.status !== "Booked") {
                navigate("/check-in", { state: data });
              }
            }}
            style={{
              backgroundColor:
                data.status === "Free"
                  ? // Color change by Om Shrivastava on 29-08-2024

                    // ? "#34A853"
                    "#f2ffe9"
                  : // Color change by Om Shrivastava on 29-08-2024

                  data.status === "Booked"
                  ? // ? "#FBBC05"
                    "#fff0ed"
                  : data.status === "Advance"
                  ? // Color change by Om Shrivastava on 29-08-2024

                    "#e3f9fe"
                  : "#AB47BC",
              width: "16vw",
              cursor: data.status !== "Booked" ? "pointer" : "not-allowed",
            }}
          >
            <div className={styles.projectHeader}>
              <div
                // className={`material-icons ${styles.projectIcon}`}
                className={styles.projectIcon}
                style={{
                  backgroundColor:
                    data.status === "Free"
                      ? // Color change by Om Shrivastava on 29-08-2024

                        // ? "#34A853"
                        "#88b25a"
                      : // Color change by Om Shrivastava on 29-08-2024

                      data.status === "Booked"
                      ? // ? "#FBBC05"
                        "#ed6d47"
                      : data.status === "Advance"
                      ? // Color change by Om Shrivastava on 29-08-2024

                        // ? "#EA4335"
                        "#78c6d9"
                      : "#AB47BC",
                  color: "white",
                }}
              >
                {/* {data.status === "available" && "check_circle"}
                {data.status === "reserved" && "event"}
                {data.status === "vacant" && "cancel"}
                {data.status !== "available" &&
                  data.status !== "reserved" &&
                  data.status !== "vacant" &&
                  "category"} */}
                {data.room_number}
                {/* <IoBedOutline /> */}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* <div
                  className={styles.roomContainer}
                  style={{ display: "flex" }}
                >
                  <div className={styles.firstLabel}>
                    <p>Room no.</p>
                  </div>
                  <div className={styles.secondLabel}>
                    <p>:</p>
                  </div>
                  <div className={styles.thirdLabel}>
                    <p>{data.room_number}</p>
                  </div>
                </div> */}
                <div
                  className={styles.roomContainer}
                  style={{ display: "flex" }}
                >
                  <div className={styles.firstLabel}>
                    <p>Room type</p>
                  </div>
                  <div className={styles.secondLabel}>
                    <p>:</p>
                  </div>
                  <div className={styles.thirdLabel}>
                    <p>{data.room_type}</p>
                  </div>
                </div>
                {/**Code Addition by Tejasve Gupta on 21-08-2024
                Reason - for displaying variety of room */}
                <div
                  className={styles.roomContainer}
                  style={{ display: "flex" }}
                >
                  <div className={styles.firstLabel}>
                    <p>Room Variety</p>
                  </div>
                  <div className={styles.secondLabel}>
                    <p>:</p>
                  </div>
                  <div className={styles.thirdLabel}>
                    <p>{data.variety}</p>
                  </div>
                </div>
                {/**End of Code Addition by Tejasve Gupta on 21-08-2024
                Reason - for displaying variety of room */}
                <div
                  className={styles.roomContainer}
                  style={{ display: "flex" }}
                >
                  <div className={styles.firstLabel}>
                    <p>Room Price</p>
                  </div>
                  <div className={styles.secondLabel}>
                    <p>:</p>
                  </div>
                  <div className={styles.thirdLabel}>
                    <p>{data.price}</p>
                  </div>
                </div>
              </div>
            </div>
            <div
              className={styles.roomStatusTiming}
              style={{ paddingTop: "1%" }}
            >
              <h5 style={{ textAlign: "center", fontWeight: "500" }}>
                {data.status == "Free" ? "Available" : data.status}
              </h5>
              {data.status != "Free" ? (
                <h5 style={{ textAlign: "center", fontWeight: "500" }}>
                  {/* Modification and addition by Om shrivastava on 12-09-2024
                        Reason : Change the time format  */}
                  {/* {data.timing} */}
                  {formatTiming(data.timing)}
                  {/* &nbsp;{new Date(`1970-01-01T${data.timing}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })} */}
                  {/* Modification and addition by Om shrivastava on 12-09-2024
                        Reason : Change the time format  */}
                </h5>
              ) : null}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Dashboard;
