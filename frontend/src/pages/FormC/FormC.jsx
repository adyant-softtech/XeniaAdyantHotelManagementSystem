// Creation by Tejasve Gupta on 17-07-2024

import React, { useEffect, useState, useRef, useContext } from "react";
import { useLocation } from "react-router-dom";
import {
  getParticularCheckindetailsApi,
  getSettingsApi,
} from "../../Api/services";
import { Button, Modal } from "antd";
import styles from "./FormC.module.css";
import { usePDF } from "react-to-pdf";
import { GlobalContext } from "../../context/Context";

const FormC = () => {
  const location = useLocation();
  const { tenant } = useContext(GlobalContext);
  const [billingDetails, setBillingDetails] = useState({});
  const [personalDetails, setPersonalDetails] = useState({});
  const [checkinDetails, setCheckinDetails] = useState([]);
  const [settings, setSettings] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { toPDF, targetRef } = usePDF({ filename: "FormC.pdf" });

  useEffect(() => {
    const getParticularCheckindetails = async () => {
      try {
        const access = localStorage.getItem("access");
        const response = await getParticularCheckindetailsApi(
          access,
          location?.state?.id,
          tenant
        );
        setBillingDetails(response.billing_details);
        setPersonalDetails(response.billing_details.personal_details);
        setCheckinDetails(response.checkin_details);
      } catch (error) {
        console.error("Error fetching Particular Checkin Details:", error);
      }
    };

    getParticularCheckindetails();
  }, [location]);

  useEffect(() => {
    const getSettingDetails = async () => {
      try {
        const access = localStorage.getItem("access");
        const response = await getSettingsApi(access, tenant);
        setSettings(response);
      } catch (error) {
        console.error("Error fetching Setting Details:", error);
      }
    };

    getSettingDetails();
  }, []);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const printPageFrame = () => {
    const content = document.querySelector(`.${styles.pageFrame}`).innerHTML;
    const printWindow = window.open("", "", "height=500,width=800");

    printWindow.document.write("<html><head><title>C Form</title>");
    printWindow.document.write("<style>");
    printWindow.document.write(`
      @media print {
        .${styles.pageFrame} { padding: 20px; width: 896px; display: flex; justify-content: space-between; }
        .${styles.header} { font-size: 24px; font-weight: bold; }
        .${styles.pageContainer} { margin-top: 20px; width: 100%; }
        .${styles.formContainer} { border: 1px solid #ccc; padding: 20px; flex: 1; margin: 0 10px; }
        .${styles.detailSection} { margin-bottom: 20px; }
        .${styles.label} { font-weight: bold; margin-right: 5px; }
        .${styles.buttonContainer} { display: none }
      }
    `);
    printWindow.document.write("</style></head><body>");
    printWindow.document.write(content);
    printWindow.document.write("</body></html>");

    printWindow.document.close();
    printWindow.print();
  };

  // const formatTime = (time) => {
  //   return new Date(`1970-01-01T${time}Z`).toLocaleTimeString([], {
  //     hour: "2-digit",
  //     minute: "2-digit",
  //     second: "2-digit",
  //     hour12: true,
  //   });
  // };

  const modalContentRef = useRef(null);
  const printModalContent = () => {
    const modalContent = modalContentRef.current.innerHTML;
    // const printWindow = window.open("", "", "height=500,width=800");
    const printWindow = window.open("data:text/html;charset=utf-8," + encodeURIComponent("<html><head><title>Print</title>"), "_blank");


    // printWindow.document.write("<html><head><title>Print</title>");
    printWindow.document.write("<style>");
    printWindow.document.write(` 
    @media print {
      body {
        font-family: Arial, sans-serif;
      }
      .${styles.modalContent} {
        padding: 20px;  
      }
      .${styles.column} {
        flex: 1;
        margin: 0 10px;
        padding: 10px;
        border: 1px solid #ccc;
        flex-direction: column;
        margin-top: 20px;  
      }
      .${styles.header} {
        background-color: white;
        color: black;
        font-weight: 700;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-right: 10px;
        font-family: var(--page-title-font-family);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        padding: 10px;
        font-size: 18px;
        width: 100%;
      }
      .${styles.detailSection} {
        margin-bottom: 20px;
        border: 1px solid #ddd;
        padding: 10px;
        border-radius: 4px;
      }
      .${styles.label} {
        display: inline-block; 
        white-space: nowrap;
        font-weight: 500;
      }
      h3 {
        margin-bottom: 10px;
      }
      .${styles.personalDetails} {
        display: flex;
        flex-direction: column;
        margin-top: 3px;
      }
      .${styles.buttonContainer} {
        display : none !important;
      }
    }
    @page {
      margin: 0; 
    }
  `);
    printWindow.document.write("</style></head><body>");
    printWindow.document.write(modalContent);
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.print();
  };

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); // 'en-GB' formats to dd/mm/yyyy
  }
  
  function formatTime(timeString) {
    const date = new Date(`1970-01-01T${timeString}`); 
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
  }

  return (
    // <div className={styles.pageFrame}>
    //   <div className={styles.header}>C Form Details</div>
    //   <div className={styles.pageContainer}>
    //     <div className={styles.rowContainer}>

    //       {/* Personal Details */}
    //       <div className={`${styles.column} ${styles.detailSection}`}>
    //         <h3 style={{textAlign:"center", backgroundColor:"#00897b12"}}>Personal Details</h3>
    //         <div className={styles.personalDetails}>
    //           <div>
    //             <label className={styles.label}>Name</label>{" "}{":"}{" "}
    //             {personalDetails.name}
    //           </div>
    //           <div>
    //             <label className={styles.label}>Phone</label>{" "}{":"}{" "}
    //             {personalDetails.phone}
    //           </div>
    //           <div>
    //             <label className={styles.label}>Address</label>{" "}{":"}{" "}
    //             {personalDetails.address}
    //           </div>
    //           <div>
    //             <label className={styles.label}>Email</label>{" "}{":"}{" "}
    //             {personalDetails.email}
    //           </div>
    //           <div>
    //             <label className={styles.label}>ID Type</label>{" "}{":"}{" "}
    //             {personalDetails.id_card_type}
    //           </div>
    //           <div>
    //             <label className={styles.label}>ID Number</label>{" "}{":"}{" "}
    //             {personalDetails.id_card_no}
    //           </div>
    //           <div>
    //             <label className={styles.label}>No. of Persons</label>{" "}{":"}{" "}
    //             {billingDetails.number_of_persons}
    //           </div>
    //           <div>
    //             <label className={styles.label}>Arrived From</label>{" "}{":"}{" "}
    //             {billingDetails.arrived_from}
    //           </div>
    //           <div>
    //             <label className={styles.label}>Purpose</label>{" "}{":"}{" "}
    //             {billingDetails.purpose_of_visit}
    //           </div>
    //           <div>
    //             <label className={styles.label}>Destination</label>{" "}{":"}{" "}
    //             {billingDetails.destination}
    //           </div>
    //         </div>
    //       </div>

    //       {/* Hotel Details */}
    //       <div className={`${styles.column} ${styles.detailSection}`}>
    //         <h3 style={{textAlign:"center", backgroundColor:"#00897b12"}}>Hotel Details</h3>

    //           <div>
    //             <label className={styles.labelHotelDetail}>Hotel Name</label>{" "}{":"}{" "}
    //             {settings.hotel_name}
    //           </div>
    //           <div>
    //             <label className={styles.labelHotelDetail}>Phone No.</label>{" "}{":"}{" "}
    //             {settings.contact_number}
    //           </div>
    //           <div>
    //             <label className={styles.labelHotelDetail}>Email id</label>{" "}{":"}{" "}
    //             {settings.email}
    //           </div>
    //           <div>
    //             <label className={styles.labelHotelDetail}>Hotel Address</label>{" "}{":"}{" "}
    //             {settings.hotel_address}
    //           </div>
    //           <div>
    //             <label className={styles.labelHotelDetail}>Standard Check-in Time</label>{" "}{":"}{" "}
    //             {settings.standard_checkin_time}
    //           </div>
    //           <div>
    //             <label className={styles.labelHotelDetail}>Standard Check-out Time</label>{" "}{":"}{" "}
    //             {settings.standard_checkout_time}
    //           </div>

    //       </div>

    //       {/* Room Details */}
    //       <div className={`${styles.column} ${styles.detailSection}`}>
    //         <h3 style={{textAlign:"center", backgroundColor:"#00897b12"}}>Room Details</h3>
    //         {checkinDetails.map((checkin, index) => (
    //           <div key={index} className={styles.roomDetail}>
    //             <div>
    //               <label className={styles.label}>Room No.</label>{" "}{":"}{" "} {checkin.room_number.number}
    //             </div>
    //             <div>
    //               <label className={styles.label}>Room Type</label>{" "}{":"}{" "} {checkin.room_number.room_type}
    //             </div>
    //             <div>
    //               <label className={styles.label}>Check-in Date</label>{" "}{":"}{" "} {checkin.arrival_date}
    //             </div>
    //             <div>
    //               <label className={styles.label}>Check-in Time</label>{" "}{":"}{" "} {checkin.arrival_time}
    //             </div>
    //             <div>
    //               <label className={styles.label}>Check-out Date</label>{" "}{":"}{" "} {checkin.departure_date}
    //             </div>
    //             <div>
    //               <label className={styles.label}>Check-out Time</label>{" "}{":"}{" "} {checkin.departure_time}
    //             </div>
    //           </div>
    //         ))}
    //       </div>

    //       {/* <fieldset className={`${styles.column} ${styles.detailSection}`}>
    //         <legend>Room Details</legend>
    //         {checkinDetails.map((checkin, index) => (
    //           <div key={index}>
    //             <div>
    //               <span>Room: {checkin.room_number.number}</span> |
    //               <span> Type: {checkin.room_number.room_type}</span>
    //               <span> Price: ₹{checkin.room_number.price}</span>
    //             </div>
    //             <div>
    //               <span>Check-in Date: {checkin.arrival_date}</span> |
    //               <span> Check-in Time: {checkin.arrival_time}</span>
    //             </div>
    //             <div>
    //               <span>Check-out Date: {checkin.departure_date}</span> |
    //               <span> Check-out Time: {checkin.departure_time}</span>
    //             </div>
    //           </div>
    //         ))}
    //       </fieldset> */}
    //     </div>

    //     <div className={styles.buttonContainer}>
    //       <Button type="primary" onClick={printPageFrame}>
    //         Print
    //       </Button>
    //       <Button type="default" onClick={showModal}>
    //         View C Form
    //       </Button>
    //     </div>

    //     <Modal
    //       visible={isModalVisible}
    //       onOk={handleOk}
    //       onCancel={handleCancel}
    //       width="896px" // Sets modal width to 21cm for A5 paper size
    //     >
    //       <div className={styles.header}>C Form Details</div>
    //       <div ref={modalContentRef} className={`${styles.modalContent} ${styles.a5Layout}`} >
    //           {/* Personal Details Section */}
    //           <div className={`${styles.column} ${styles.detailSection}`}>
    //               <h3>Personal Details</h3>
    //               <div><strong>Name:</strong> {personalDetails.name}</div>
    //               <div><strong>Phone:</strong> {personalDetails.phone}</div>
    //               <div><strong>Address:</strong> {personalDetails.address}</div>
    //               <div><strong>Email:</strong> {personalDetails.email}</div>
    //               <div><strong>ID Type:</strong> {personalDetails.id_card_type}</div>
    //               <div><strong>ID Number:</strong> {personalDetails.id_card_no}</div>
    //               <div><strong>Number of Persons:</strong> {billingDetails.number_of_persons}</div>
    //               <div><strong>Arrived From:</strong> {billingDetails.arrived_from}</div>
    //               <div><strong>Purpose:</strong> {billingDetails.purpose_of_visit}</div>
    //               <div><strong>Destination:</strong> {billingDetails.destination}</div>
    //           </div>

    //           {/* Hotel Details Section */}
    //           <div className={`${styles.column} ${styles.detailSection}`}>
    //               <h3>Hotel Details</h3>
    //               <div><strong>Hotel Name:</strong> {settings.hotel_name}</div>
    //               <div><strong>Hotel Address:</strong> {settings.hotel_address}</div>
    //               <div><strong>Phone No.:</strong> {settings.contact_number}</div>
    //               <div><strong>Email id:</strong> {settings.email}</div>
    //               <div><strong>Standard Check-in Time:</strong> {settings.standard_checkin_time}</div>
    //               <div><strong>Standard Check-out Time:</strong> {settings.standard_checkout_time}</div>
    //           </div>

    //           {/* Room Details Section */}
    //           <div className={`${styles.column} ${styles.detailSection}`}>
    //               <h3>Room Details</h3>
    //               {checkinDetails.map((checkin, index) => (
    //                   <div key={index} className={styles.roomDetail}>
    //                       <div><strong>Room No.</strong>: {checkin.room_number.number}</div>
    //                       <div><strong>Room Type</strong>: {checkin.room_number.room_type}</div>
    //                       <div><strong>Check-in Date</strong>: {checkin.arrival_date}</div>
    //                       <div><strong>Check-in Time</strong>: {checkin.arrival_time}</div>
    //                       <div><strong>Check-out Date</strong>: {checkin.departure_date}</div>
    //                       <div><strong>Check-out Time</strong>: {checkin.departure_time}</div>
    //                   </div>
    //               ))}
    //           </div>
    //       </div>

    //   </Modal>
    //   </div>
    // </div>
  <div ref={modalContentRef} className={styles.modalWrapper}>

    <div ref={targetRef}>
      {/* Header Section */}
      <div className={styles.header}>C Form Details</div>
      
      {/* Modal Content */}
      <div className={`${styles.modalContent} ${styles.a5Layout}`}>
        {/* Personal Details Section */}
        <div className={`${styles.column} ${styles.detailSection}`}>
          <h3>Personal Details</h3>
          <div>
            <strong>Name:</strong> {personalDetails.salutation}{" "}{personalDetails.name}{" "}{personalDetails.last_name}
          </div>
          <div>
            <strong>Phone:</strong> {personalDetails.phone}
          </div>
          <div>
            <strong>Address:</strong> {personalDetails.address}
          </div>
          <div>
            <strong>Email:</strong> {personalDetails.email}
          </div>
          <div>
            <strong>ID Type:</strong> {personalDetails.id_card_type}
          </div>
          <div>
            <strong>ID Number:</strong> {personalDetails.id_card_no}
          </div>
          <div>
            <strong>Number of Persons:</strong> {billingDetails.number_of_persons}
          </div>
          <div>
            <strong>Purpose:</strong> {billingDetails.purpose_of_visit}
          </div>
          <div>
            <strong>Arrived From:</strong> {billingDetails.arrived_from}
          </div>
          <div>
            <strong>Destination:</strong> {billingDetails.destination}
          </div>
        </div>

        {/* Hotel Details Section */}
        <div className={`${styles.column} ${styles.detailSection}`}>
          <h3>Hotel Details</h3>
          <div>
            <strong>Hotel Name:</strong> {settings.hotel_name}
          </div>
          <div>
            <strong>Hotel Address:</strong> {settings.hotel_address}
          </div>
          <div>
            <strong>Phone No.:</strong> {settings.contact_number}
          </div>
          <div>
            <strong>Email id:</strong> {settings.email}
          </div>
          <div>
            <strong>Standard Check-in Time:</strong> {formatTime(settings.standard_checkin_time)}
          </div>
          <div>
            <strong>Standard Check-out Time:</strong> {formatTime(settings.standard_checkout_time)}
          </div>
        </div>

        {/* Room Details Section */}
        <div style={{marginRight: "40px"}} className={`${styles.column} ${styles.detailSection}`} >
          <h3>Room Details</h3>
          {checkinDetails.map((checkin, index) => (
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
                <strong>Check-in Date and Time:</strong> {formatDate(checkin.arrival_date)} {"&"} {formatTime(checkin.arrival_time)}
              </div>
              {/* <div>
                <strong>Check-in Time:</strong> {formatTime(checkin.arrival_time)}
              </div> */}
              <div>
                <strong>Check-out Date and Time:</strong>{" "}
                {checkin.departure_date && checkin.departure_date !== "0000-00-00"
                  ? `${formatDate(checkin.departure_date)} ${"&"} ${
                      checkin.departure_time && checkin.departure_time !== "00:00:00"
                        ? formatTime(checkin.departure_time)
                        : ""
                    }`
                  : ""}
              </div>
              {/* <div>
                <strong>Check-out Date and Time:</strong> {checkin.departure_date && checkin.departure_date !== "0000-00-00" ? formatDate(checkin.departure_date) : ""}
              </div>
              <div>
                <strong>Check-out Time:</strong> {checkin.departure_time && checkin.departure_time !== "00:00:00" ? formatTime(checkin.departure_time) : ""}
              </div> */}
              {index < checkinDetails.length - 1 && <hr className={styles.divider} />}
            </div>
          ))}
        </div>
      </div>  
    </div>
    <div className={styles.buttonContainer}>
      <Button type="primary" onClick={printModalContent}>
        Print
      </Button>
      <Button type="primary" onClick={() => toPDF()}>
        Download
      </Button>
    </div>
  </div>

  );
};

export default FormC;
