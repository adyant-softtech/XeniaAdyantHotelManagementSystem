/**
 * Created by - Ashish Dewangan on 29-08-2024
 * Reason - Added checkout details page
 */
import React, { useContext, useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import styles from "./CheckoutDetailsForm.module.css";
import { Modal, Button } from "antd";
import { baseURL } from "../../Api/config";

import { getParticularCheckoutdetailsApi, getRoomShiftingApi } from "../../Api/services";
import PaymentReceiptModal from "../PaymentReceipt/PaymentReceipt";
import { GlobalContext } from "../../context/Context";
import FormC from "../FormC/FormC";
import { FiArrowLeft } from "react-icons/fi";

const CheckoutDetailsForm = () => {
  const location = useLocation();
  const [billingDetails, setBillingDetails] = useState({});
  const [personalDetails, setPersonalDetails] = useState({});
  
  {/* Added by akanksha on 23-01-2025
  Reason : to show transaaction id and reciept */}
  const [onlineDetails, setOnlineDetails] = useState([]);
  {/* End by akanksha on 23-01-2025
  Reason : to show transaaction id and reciept */}
  const [checkinDetails, setCheckinDetails] = useState([]);
  const [guestDetails, setGuestDetails] = useState([]); // Add state for guest details

  const [roomCharges, setRoomCharges] = useState(0);
  const [newRoomCharges, setNewRoomCharges] = useState(0);
  const [additionalCharges, setAdditionalCharges] = useState(0);
  const [additional_reason, set_additional_reason] = useState("");
  const [extraPersonCharge, setExtraPersonCharge] = useState(0);
  const [subTotal, setSubTotal] = useState(0);
  const [discountIn, setDiscountIn] = useState("Discount in (₹)");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [taxableAmount, setTaxableAmount] = useState(0);
  const [gst, setGst] = useState(0);
  const [gstValue, setGstValue] = useState(0);
  const [total, setTotal] = useState(0);
  const [miscellaneousCharges, setMiscellaneousCharges] = useState(0);
  const [extraDiscount, setExtraDiscount] = useState(0);
  
  const [roomShiftedFlag, setRoomShiftedFlag] = useState(false);
  const [roomShiftHistory, setRoomShiftHistory] = useState();
  const [miscellaneousDetails, setMiscellaneousDetails] = useState('');
  const [extraDetails, setExtraDetails] = useState('');
  
  const [grandTotal, setGrandTotal] = useState(0);
  const [advancePayAmount, setAdvancePayAmount] = useState(0);
  const [arrivalDate, setArrivalDate] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [departureTime, setDepartureTime] = useState("");

  const [subTotalDays, setSubTotalDays] = useState(0);
  const [totalDays, setTotalDays] = useState(1);

  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentReceiptNumber, setPaymentReceiptNumber] = useState("");
  const [paymentReceiptData, setPaymentReceiptData] = useState([]);
  const [isPrModalVisible, setIsPrModalVisible] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); // State to hold the selected image
  const [particularPaymentReceipt, setParticularPaymentReceipt] = useState({});

  const [totalPaid,setTotalPaid]=useState(0)

  const [receiptImage, setReceiptImage] = useState("");
  const handleShowReceipt = (imageUrl) => {
    if (imageUrl) {  // Only open modal if there is an image
      setReceiptImage(imageUrl);
      setShowModalReceipt(true);
    }
  };
  const closeModal = () => {
    setShowModalReceipt(false);
    setReceiptImage(null);
  };
  const [showModalReceipt, setShowModalReceipt] = useState(false);


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
  // Added by - Ashlekh on 03-10-2024
  // Reason - To use context variable
  var { staffName, setStaffName, adminName, setAdminName, tenant } =
    useContext(GlobalContext);
  // End of code - Ashlekh on 03-10-2024
  // Reason - To have use context variable
  /**
   * Added by - Ashish Dewangan on 29-08-2024
   * Reason - If token is expired then logout the user
   */
  useEffect(() => {
    if (!localStorage.getItem("access")) {
      Navigate("/login");
    }
  }, [navigate]);

  /**
   * End of addition by - Ashish Dewangan on 29-08-2024
   * Reason - If token is expired then logout the user
   */

  /**
   * Added by - Ashish Dewangan on 29-08-2024
   * Reason - Calling API to get checkout details
   */
  useEffect(() => {
    const getParticularCheckoutdetails = async () => {
      try {
        const access = localStorage.getItem("access");
        const response = await getParticularCheckoutdetailsApi(
          access,
          location?.state?.id,
          tenant
        );

        setBillingDetails(response.billing_details);
        setPersonalDetails(response.billing_details.personal_details);
        {/* Added by akanksha on 23-01-2025
        Reason : to show transaaction id and reciept */}
        setOnlineDetails(response.checkin_details || []);
        {/* End by akanksha on 23-01-2025
        Reason : to show transaaction id and reciept */}
        setCheckinDetails(response.checkin_details);
        setGuestDetails(response.guest_details);

        setRoomCharges(Number(response.billing_details.room_charges));
        setNewRoomCharges(Number(response.billing_details.new_room_charges));
        setAdditionalCharges(Number(response.billing_details.additional_charges));
        set_additional_reason(response.billing_details.additional_reason);
        setExtraPersonCharge(
          Number(response.billing_details.extra_person_charges)
        );
        setSubTotal(Number(response.billing_details.sub_total));
        setDiscountIn(response.billing_details.discount_in);
        setDiscountAmount(Number(response.billing_details.discount_rupees));
        setDiscountPercentage(
          Number(response.billing_details.discount_percentage)
        );
        setTaxableAmount(Number(response.billing_details.taxable_amount));
        setGst(Number(response.billing_details.gst));
        setGstValue(Number(response.billing_details.gst_value));
        setTotal(Number(response.billing_details.total));
        setMiscellaneousCharges(response.billing_details.miscellaneous_charges);
        setExtraDiscount(response.billing_details.extra_discount);
        setMiscellaneousDetails(response.billing_details.details);
        setExtraDetails(response.billing_details.extraDetails);
        setGrandTotal(Number(response.billing_details.grand_total));
        setAdvancePayAmount(
          Number(response.billing_details.advanced_pay_amount)
        );

        setArrivalDate(response.billing_details.arrival_date);
        setArrivalTime(response.billing_details.arrival_time);
        setDepartureDate(response.billing_details.departure_date);
        setDepartureTime(response.billing_details.departure_time);
        setPaymentReceiptData(response.payment_receipts);
      } catch (error) {}
    };

    getParticularCheckoutdetails();
  }, [location]);

  useEffect(() => {
      const fetchRoomShift = async () => {
        
        const billingId = location?.state?.id;
        console.log("billing id", billingId);
        if (!billingId) return;
        try {
            const response = await getRoomShiftingApi(billingId, tenant);
            setRoomShiftedFlag(response.room_shifted);
            setRoomShiftHistory(response.room_shift_history);
            
          } 
        
          catch (err) {
            console.error("Error: ", err);
          } 
        };
  
      fetchRoomShift();
    }, [location?.state?.id]);

  /**
   * End of addition by - Ashish Dewangan on 29-08-2024
   * Reason - Calling API to get checkout details
   */

  /**
   * Added by - Ashish Dewangan on 24-10-2024
   * Reason - To calculate total amount paid
   */

  useEffect(()=>{
    var amount = 0
     paymentReceiptData.forEach((payment)=>{
      amount+= Number(payment.amount_paid)
    })
    setTotalPaid(amount)
  },[paymentReceiptData])
    /**
   * End of addition by - Ashish Dewangan on 24-10-2024
   * Reason - To calculate total amount paid
   */

  /**
   * Added by - Ashish Dewangan on 29-08-2024
   * Reason - To Calculate total days customer stayed
   */
  // useEffect(() => {
  //   if (checkinDetails.length > 0) {
  //     const arrivalDateTime = new Date(`${arrivalDate}T${arrivalTime}`);
  //     const departureDateTime = new Date(`${departureDate}T${departureTime}`);

  //     const timeDifference = departureDateTime - arrivalDateTime;
  //     const daysDifference = timeDifference / (1000 * 60 * 60 * 24);

  //     setTotalDays(Math.ceil(daysDifference) | 1);
  //   }
  // }, [arrivalDate, arrivalTime, departureDate, departureTime]);
  useEffect(() => {
    if (checkinDetails.length > 0) {
      const arrivalDateTime = new Date(`${arrivalDate}T${arrivalTime}`);

      // Use departureDate & departureTime if present, otherwise fallback to arrivalDateTime
      const latestDepartureDateTime = departureDate
        ? new Date(`${departureDate}T${departureTime || "00:00:00"}`)
        : arrivalDateTime;

      // Calculate the time difference in days
      const timeDifference = latestDepartureDateTime - arrivalDateTime;
      const daysDifference = timeDifference / (1000 * 60 * 60 * 24);

      // Ensure at least 1 day
      setTotalDays(Math.max(Math.ceil(daysDifference), 1));
    }
  }, [arrivalDate, arrivalTime, departureDate, departureTime, checkinDetails]);

  
  /**
   * End of addition by - Ashish Dewangan on 29-08-2024
   * Reason - To Calculate total days customer stayed
   */

  /**
   * Added by - Ashish Dewangan on 29-08-2024
   * Reason - To navigate to C form
   */
  const handleFormCClick = () => {
    const id = location?.state?.id;
    navigate("/formC", { state: { id: id } });
  };
  /**
   * End of addition by - Ashish Dewangan on 29-08-2024
   * Reason - To navigate to C form
   */
  /**
   * Added by - Ashish Dewangan on 29-08-2024
   * Reason - To show id card photo in modal
   */
  const showIdCardModal = (imageUrl) => {
    setSelectedImage(imageUrl); // Set the selected image URL
    setIsModalVisible(true); // Show the modal
  };
  /**
   * End of addition by - Ashish Dewangan on 29-08-2024
   * Reason - To show id card photo in modal
   */

  /**
   * Added by - Ashish Dewangan on 29-08-2024
   * Reason - To close id card modal
   */
  const closeIdCardModal = () => {
    setIsModalVisible(false); // Close the modal on Cancel click
  };
  /**
   * Added by - Ashish Dewangan on 29-08-2024
   * Reason - To close id card modal
   */

  /**
   * Added by - Ashish Dewangan on 29-08-2024
   * Reason - To print c form+
   */
  // const handleCFormPrint = () => {
  //   // const printWindow = window.open("", "_blank");
  //   const printWindow = window.open("data:text/html;charset=utf-8," + encodeURIComponent("<html><head><title>Print</title>"), "_blank");

  //   printWindow.document.write(`
  //     <html>
  //       <body onload="window.print(); window.close();">
  //         <img src="${baseURL}${selectedImage}" style="max-width: 100%;"/>
  //       </body>
  //     </html>
  //   `);
  //   printWindow.document.close();
  // };

  const handleCFormPrint = () => {
    // const printWindow = window.open("", "_blank");
    const printWindow = window.open("data:text/html;charset=utf-8," + encodeURIComponent("<html><head><title>Print</title>"), "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <style>
            /* General styles */
            body {
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
            }
  
            img {
              max-width: 100%; 
              max-height: 95vh; 
              height: auto;
              object-fit: contain; 
              page-break-inside: avoid; 
              display: block;
              margin: 0 auto;
            }
  
            @media print {
              body {
                margin: 0;
                padding: 0;
                text-align: center;
                height: auto;
              }
  
              img {
                max-width: 100%; 
                max-height: 95%; 
                margin: 0; 
                page-break-inside: avoid;
              }
            }
            @page {
                margin: 0; 
            }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <img src="${baseURL}${selectedImage}" alt="ID Card Image"/>
        </body>
      </html>
    `);
  
    printWindow.document.close();
  };

  

  // Added by akanksha on 25th Oct 2024, Reason to open popup of C Form
  const [isFormCVisible, setIsFormCVisible] = useState(false);

  const showFormCModal = () => {
    setIsFormCVisible(true);
  };

  const handleFormCClose = () => {
    setIsFormCVisible(false);
  };
  // End by akanksha on 25th Oct 2024, Reason to open popup of C Form

  /**
   * End of addition by - Ashish Dewangan on 29-08-2024
   * Reason - To print c form+
   */

  /**
   * Added by - Ashish Dewangan on 31-08-2024
   * Reason - To close payment receipt modal when this method is called
   */
  const handlePrCloseModal = () => {
    setIsPrModalVisible(false); // Close the modal on OK click
  };
  /**
   * End of addition by - Ashish Dewangan on 31-08-2024
   * Reason - To close payment receipt modal when this method is called
   */

  {/* Added by akanksha on 21st oct, Reason: Download Button using handleDownload */}
  const handleDownload = async () => {
    const toDataURL = (url) => {
      return fetch(url)
        .then((response) => response.blob())
        .then(
          (blob) =>
            new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result); // Convert blob to Base64 data URL
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            })
        );
    };
    {/* End by akanksha on 21st oct, Reason: Download Button using handleDownload */}
  
    // Convert image URL to data URL (Base64)
    const dataURL = await toDataURL(baseURL + selectedImage);
  
    // Create a temporary anchor (<a>) element to download the image
    const a = document.createElement("a");
    a.href = dataURL; // Use the Base64 data URL
    a.download = "ID_Card_Image.png"; // Set the downloaded file name
  
    // Append the anchor to the document, click it, and remove it afterward
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrintPaymentProof = () => {
      // Ensure the image URL is correctly formatted
      const imageUrl = receiptImage.startsWith("http") ? receiptImage : `${baseURL}${receiptImage}`;
    
      // Open a new print window
      const printWindow = window.open("data:text/html;charset=utf-8," + encodeURIComponent("<html><head><title>Print</title>"), "_blank");
    
      printWindow.document.write(`
        <html>
          <head>
            <style>
              /* General styles */
              body {
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
              }
    
              img {
                max-width: 100%; 
                max-height: 95vh; 
                height: auto;
                object-fit: contain; 
                page-break-inside: avoid; 
                display: block;
                margin: 0 auto;
              }
    
              @media print {
                body {
                  margin: 0;
                  padding: 0;
                  text-align: center;
                  height: auto;
                }
    
                img {
                  max-width: 100%; 
                  max-height: 95%; 
                  margin: 0; 
                  page-break-inside: avoid;
                }
              }
              @page {
                  margin: 0; 
              }
            </style>
          </head>
          <body onload="window.print(); window.close();">
            <img src="${imageUrl}" alt="payment_proof"/>
          </body>
        </html>
      `);
    
      printWindow.document.close();
  };
  const handleDownloadPaymentProof = async () => {
    const toDataURL = (url) => {
      return fetch(url)
        .then((response) => response.blob())
        .then(
          (blob) =>
            new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result); // Convert blob to Base64 data URL
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            })
        );
    };
  
    // Ensure the image URL is correctly formatted
    const imageUrl = receiptImage.startsWith("http") ? receiptImage : `${baseURL}${receiptImage}`;
  
    try {
      // Convert image URL to Base64
      const dataURL = await toDataURL(imageUrl);
  
      // Create a temporary anchor (<a>) element to download the image
      const a = document.createElement("a");
      a.href = dataURL;
      a.download = "payment_proof.png"; // Set the downloaded file name
  
      // Append the anchor to the document, click it, and remove it afterward
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to download the image:", error);
    }
  };

  const stayDuration = (() => {
    if (!checkinDetails || checkinDetails.length === 0) return "0 Days";
  
    const arrivalDateTimeString = `${checkinDetails[0].arrival_date}T${checkinDetails[0].arrival_time}`;
    const arrivalDate = new Date(arrivalDateTimeString);
  
    let endDate = new Date(); // Default to current time if departure_date is not available
  
    if (checkinDetails[0]?.departure_date) {
      const departureDate = checkinDetails[0].departure_date;
      const departureTime = checkinDetails[0].departure_time || "00:00:00"; // Default to start of the day if time is missing
      const departureDateTime = `${departureDate}T${departureTime}`;
      endDate = new Date(departureDateTime);
    }
  
    console.log("with out iusing math", (endDate - arrivalDate) / (1000 * 60 * 60 * 24));
    const differenceInDays = Math.ceil((endDate - arrivalDate) / (1000 * 60 * 60 * 24));
    console.log("number of days", differenceInDays);
  
    return `${differenceInDays > 0 ? differenceInDays : 0} ${differenceInDays === 1 ? "Day" : "Days"}`;
  })();

  const formatDateAndTime = (dateStr, timeStr) => {
    const combined = new Date(`${dateStr}T${timeStr}`);
  
    const day = String(combined.getDate()).padStart(2, '0');
    const month = String(combined.getMonth() + 1).padStart(2, '0');
    const year = combined.getFullYear();
  
    const time = combined.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  
    return `${day}/${month}/${year} ${time}`;
  };
    

  return (
    <div className={styles.parentContainer}>
      <div className={styles.header}> {/* Modification and addition by Om Shrivastava on 03-01-2025
            Reason : Add back icon  */}
              <FiArrowLeft className="backIcon" onClick={handleBackClick} />
              Check-out Details
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
      {/* Added by - Ashlekh on 03-10-2024
      Reason - To display manager name (If admin log in then admin name will display)*/}
      {staffName != "" ? (
        <div className={`${styles.staffName}`}>Staff Name : {staffName}</div>
      ) : (
        <div className={`${styles.staffName}`}>Admin : {adminName}</div>
      )}
      {/* End of code - Ashlekh on 03-10-2024
      Reason - To display manager name (if admin log in then admin name will display)*/}
      <div className={styles.formContainer}>
        <div className={styles.subContainer1}>
          <div className={styles.rightContainer}>
            <legend className={styles.legend}>Staying Details</legend>

            {/**
             * Added by - Ashish Dewangan on 13-10-2024
             * Reason - To show the user who have performed the checkin and checkout process
             */}
            <div className={styles.pair}>
              <label className={styles.label}>Check In Staff</label>
              <div className={styles.colon}>:</div>
              <div>{billingDetails?.user_email_at_checkin}</div>
            </div>

            <div className={styles.pair}>
              <label className={styles.label}>Check Out Staff</label>
              <div className={styles.colon}>:</div>
              <div>{billingDetails?.user_email_at_checkout}</div>
            </div>
            {/**
             * End of addition by - Ashish Dewangan on 13-10-2024
             * Reason - To show the user who have performed the checkin and checkout process
             */}

            <div className={styles.pair}>
              <label className={styles.label}>Check In Date</label>

              <div className={styles.colon}>:</div>
              <div>
                {arrivalDate?.split("-").reverse().join("-")}
                <span> | </span>

                {/* Modification and addition by Om Shrivastava on 04-10-2024
                    Reason : Set the time  */}
                {/*
                    {arrivalTime}
                     */}
                {new Date(`1970-01-01T${arrivalTime}`).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
                {/* End of odification and addition by Om Shrivastava on 04-10-2024
                    Reason : Set the time  */}
              </div>
            </div>
            <div className={styles.pair}>
              <label className={styles.label}>Check Out Date</label>
              <div className={styles.colon}>:</div>
              <div>
                {departureDate?.split("-").reverse().join("-")}
                <span> | </span>

                {/* Modification and addition by Om Shrivastava on 04-10-2024
                    Reason : Set the time  */}
                {/*{departureTime}
                 */}
                {new Date(`1970-01-01T${departureTime}`).toLocaleTimeString(
                  [],
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  }
                )}
                {/* End of odification and addition by Om Shrivastava on 04-10-2024
                    Reason : Set the time  */}
              </div>
            </div>
            <div className={styles.pair}>
              <div className={styles.label}>Number of Days</div>
              <div className={styles.colon}>:</div>
              <div className={styles.inputContainer}>
                <input
                  disabled
                  className={`${styles.inputDisabled}  ${styles.inputWidth}`}
                  
                  value={
                    stayDuration
                  }
                  /**
                   * End of modification by - Ashish Dewangan on 09-09-2024
                   * Reason - To show numbers of days with day or days label
                   */
                />
              </div>
            </div>
            <div className={styles.pair}>
              <div className={styles.label}>Number of Persons</div>
              <div className={styles.colon}>:</div>
              <div className={styles.inputContainer}>
                <input
                  disabled
                  className={`${styles.inputDisabled}  ${styles.inputWidth}`}
                  value={billingDetails.number_of_persons}
                />
              </div>
            </div>

            <div className={styles.pair}>
              <div className={styles.label}>Booking Type</div>
              <div className={styles.colon}>:</div>
              <div className={styles.inputContainer}>
                <input
                  disabled
                  className={`${styles.inputDisabled}  ${styles.inputWidth}`}
                  value={billingDetails.booking_type}
                />
              </div>
            </div>

            {/* Modified by - Ashish Dewangan on 18-09-2024
            Reason - Show refundable section only for advance bookings */}
            {/* <div className={styles.pair}>
              <div className={styles.label}>Refundable</div>
              <div className={styles.colon}>:</div>
              <div className={styles.value}>
                <input
                  disabled
                  className={styles.inputDisabled}
                  value={billingDetails.is_Refundable}
                />
              </div>
            </div>
            <div className={styles.pair}>
              <div className={styles.label}>Refundable Amount</div>
              <div className={styles.colon}>:</div>
              <div className={styles.value}>
                <input
                  disabled
                  className={styles.inputDisabled}
                  value={billingDetails.refund_amount}
                />
              </div>
            </div> */}

            {/* {billingDetails.booking_type == "Advance" &&
              billingDetails.is_Refundable != null &&
              billingDetails.is_Refundable?.trim()?.length > 0 && (
                <>
                  <div className={styles.pair}>
                    <div className={styles.label}>Refundable</div>
                    <div className={styles.colon}>:</div>
                    <div className={styles.inputContainer}>
                      <input
                        disabled
                        className={styles.inputDisabled}
                        value={billingDetails.is_Refundable}
                      />
                    </div>
                  </div>
                  <div className={styles.pair}>
                    <div className={styles.label}>Refundable Amount</div>
                    <div className={styles.colon}>:</div>
                    <div className={styles.inputContainer}>
                      <input
                        disabled
                        className={`${styles.inputDisabled}  ${styles.inputWidth}`}
                        value={billingDetails.refund_amount}
                      />
                    </div>
                  </div>
                </>
              )} */}
            {/* End of modification by - Ashish Dewangan on 18-09-2024
              Reason - Show refundable section only for advance bookings */}

            {/* Commented by - Ashish Dewangan on 21-10-2024
             * Reason - No need to show this field */}
            {/* <div className={styles.pair}>
              <div className={styles.label}>Payment Method</div>
              <div className={styles.colon}>:</div>
              <div className={styles.value}>
                <input
                  disabled
                  className={styles.inputDisabled}
                  value={billingDetails.payment_method}
                />
              </div>
            </div> */}
            {/* End of comment by - Ashish Dewangan on 21-10-2024
             * Reason - No need to show this field */}

            {/**
             * Added by - Ashish Dewangan on 21-10-2024
             * Reason - To show purpose of visit, arrived from and destination info
             */}
            <div className={styles.pair}>
              <div className={styles.label}>Purpose of Visit</div>
              <div className={styles.colon}>:</div>
              <div className={styles.inputContainer}>
                <textarea
                  disabled
                  className={`${styles.inputDisabled}  ${styles.inputWidth} ${styles.textAreaInput}`}
                  value={
                    billingDetails?.purpose_of_visit &&
                    billingDetails?.purpose_of_visit?.length > 0
                      ? billingDetails?.purpose_of_visit
                      : "No details entered"
                  }
                />
              </div>
            </div>
            <div className={styles.pair}>
              <div className={styles.label}>Arrived From</div>
              <div className={styles.colon}>:</div>
              <div className={styles.inputContainer}>
                <textarea
                  disabled
                  className={`${styles.inputDisabled}  ${styles.inputWidth} ${styles.textAreaInput}`}
                  value={
                    billingDetails?.arrived_from &&
                    billingDetails?.arrived_from?.length > 0
                      ? billingDetails?.arrived_from
                      : "No details entered"
                  }
                />
              </div>
            </div>
            <div className={styles.pair}>
              <div className={styles.label}>Destination</div>
              <div className={styles.colon}>:</div>
              <div className={styles.inputContainer}>
                <textarea
                  disabled
                  className={`${styles.inputDisabled}  ${styles.inputWidth} ${styles.textAreaInput}`}
                  value={
                    billingDetails?.destination &&
                    billingDetails?.destination?.length > 0
                      ? billingDetails?.destination
                      : "No details entered"
                  }
                />
              </div>
            </div>
            {/* Added by akanksha on 23-01-2025
            Reason : to show transaaction id and reciept */}
            {/* <div className={styles.pair}>
              <div className={styles.label}>Transaction id</div>
              <div className={styles.colon}>:</div>
              <div className={styles.transactionbox}>
                <input
                  disabled
                  className={`${styles.inputDisabled}  ${styles.inputWidth}`}
                  value={
                    onlineDetails.length > 0 && 
                    onlineDetails[0]?.transaction_id && 
                    onlineDetails[0].transaction_id.length > 0
                      ? onlineDetails[0].transaction_id
                      : "No details entered"
                  }
                  
                />
                <button
                  onClick={() => showIdCardModal(onlineDetails[0]?.payment_proof)}
                  className="submitButton"
                  style={{ textAlign: 'center', marginLeft: '10px', marginTop: '4px' }}
                  disabled={!onlineDetails[0]?.payment_proof} // Disable if no payment proof
                >
                  Payment Proof
                </button>
              </div>
              {isModalVisible && onlineDetails[0]?.payment_proof && (
                <div className={styles.modal} onClick={closeIdCardModal}>
                  <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                    <span className={styles.closeButton} onClick={closeIdCardModal}>
                      &times;
                    </span>
                    <img
                      src={`${baseURL}${onlineDetails[0]?.payment_proof || ''}`}
                      alt="Payment Proof"
                      style={{ maxWidth: '100%', height: 'auto' }}
                    />
                  </div>
                </div>
              )}
            </div> */}
            {/* End by akanksha on 23-01-2025
            Reason : to show transaaction id and reciept */}
            {/**
             * End of addition by - Ashish Dewangan on 21-10-2024
             * Reason - To show purpose of visit, arrived from and destination info
             */}
          </div>

          <div className={styles.rightContainer}>
            <legend
              className={styles.legend}
              style={{
                textAlign: "center",
                fontWeight: "500",
                fontSize: "16px",
              }}
            >
              Billing Details
            </legend>
            <div className={styles.pair}>
              <label className={styles.label}>Room Charges</label>
              <div className={styles.colon}>:</div>
              <div className={styles.value}>₹{roomCharges?.toFixed(2)}</div>
            </div>

            {newRoomCharges > 0 && (
              <div className={styles.pair}>
                <label className={styles.label}>New Room Charges</label>
                <div className={styles.colon}>:</div>
                <div className={styles.value}>₹{newRoomCharges?.toFixed(2)}</div>
              </div>
            )}


            {additionalCharges > 0 && roomShiftedFlag && (
              <div className={styles.pair}>
                <label className={styles.label}>New Room Additional Charges</label>
                <div className={styles.colon}>:</div>
                <div className={styles.value}>₹{additionalCharges?.toFixed(2)}{" "}({additional_reason})</div>
              </div>

            )}
            
            <div className={styles.pair}>
              {/* Modification and addition by Om Shrivastava on 15-10-2024 
                    Reason : Change the name  */}
              {/* <label>Extra Person Charges</label> */}
              <label className={styles.label}> Extra Bed Charges</label>
              {/* End of modification and addition by Om Shrivastava on 15-10-2024 
                    Reason : Change the name  */}

              <div className={styles.colon}>:</div>
              <div className={styles.value}>
                ₹{extraPersonCharge?.toFixed(2)}
              </div>
            </div>

            <div className={styles.pair}>
              <label className={styles.label}>
                Sub Total<span> for {totalDays} Day(s)</span>
              </label>
              <div className={styles.colon}>:</div>
              <div className={styles.value}>₹{subTotal?.toFixed(2)}</div>
            </div>

            {/* Added by - Ashish Dewangan on 01-09-2024
            Reason - To show discount applied in label  */}
            {discountAmount > 0 && (
              <div className={styles.pair}>
                <label className={styles.label}>Discount Applied In</label>
                <div className={styles.colon}>:</div>
                <div className={styles.value}>{discountIn}</div>
              </div>
            )}
            {/* End of addition by - Ashish Dewangan on 01-09-2024
            Reason - To show discount applied in label  */}

            <div className={styles.pair}>
              <label className={styles.label}>
                Discount {discountPercentage}%
              </label>
              <div className={styles.colon}>:</div>
              <div className={styles.value}>₹{discountAmount?.toFixed(2)}</div>
            </div>
            <div className={styles.pair}>
              <label className={styles.label}>Taxable Amount</label>
              <div className={styles.colon}>:</div>
              <div className={styles.value}>₹{taxableAmount?.toFixed(2)}</div>
            </div>
            <div className={styles.pair}>
              <label className={styles.label}>GST {gst}%</label>
              <div className={styles.colon}>:</div>
              <div className={styles.value}>₹{gstValue?.toFixed(2)}</div>
            </div>
            <div className={styles.pair}>
              <label className={styles.label}>Total Amount</label>
              <div className={styles.colon}>:</div>
              <div className={styles.value}>₹{total?.toFixed(2)}</div>
            </div>
            <div className={styles.pair}>
              <label className={styles.label}>Miscellaneous(₹)</label>
              <div className={styles.colon}>:</div>
              <input
                disabled
                /**
                 * Added by - Ashish Dewangan on 11-10-2024
                 * Reason - To set width according to checkin details page
                 */
                // style={{ borderRadius: "5px", padding: "5px" }}
                style={{ borderRadius: "5px", padding: "5px", width: "18%" }}
                /**
                 * End of addition by - Ashish Dewangan on 11-10-2024
                 * Reason - To set width according to checkin details page
                 */
                type="number"
                value={miscellaneousCharges}
              />
              {/* Modified by Akanksha on 03-02-2025
              Reason : to show input box only when data is there */}
              {miscellaneousDetails && (
                <input
                  disabled
                  style={{ marginLeft: '12px', borderRadius: "5px", padding: "5px", width: "18%" }}
                  type="text"
                  value={miscellaneousDetails}
                />
              )}
              {/* End by Akanksha on 03-02-2025
              Reason : to show input box only when data is there */}
            </div>
            <div className={styles.pair}>
              <label className={styles.label}>Extra Discount (₹)</label>
              <div className={styles.colon}>:</div>
              <input
                disabled
                type="number"
                /**
                 * Added by - Ashish Dewangan on 11-10-2024
                 * Reason - To set width according to checkin details page
                 */
                // style={{ borderRadius: "5px", padding: "5px" }}
                style={{ borderRadius: "5px", padding: "5px", width: "18%" }}
                /**
                 * End of addition by - Ashish Dewangan on 11-10-2024
                 * Reason - To set width according to checkin details page
                 */
                value={extraDiscount}
              />
              {/* Modified by Akanksha on 03-02-2025
              Reason : to show input box only when data is there */}
              {extraDetails && (
                <input
                  disabled
                  style={{ marginLeft: '12px', borderRadius: "5px", padding: "5px", width: "18%" }}
                  type="text"
                  value={extraDetails}
                />
              )}
              {/* End by Akanksha on 03-02-2025
              Reason : to show input box only when data is there */}
            </div>
            <div className={styles.pair}>
              <label className={styles.label}>Advance Paid</label>
              <div className={styles.colon}>:</div>
              <div className={styles.value}>
                ₹{advancePayAmount?.toFixed(2)}
              </div>
            </div>
            {/* Added by - Ashish Dewangan on 26-10-2024
            * Reason - To show total paid */}
            <div className={styles.pair}>
              <label className={styles.label}>Total Paid</label>
              <div className={styles.colon}>:</div>
              <div className={styles.value}>
                ₹{totalPaid?.toFixed(2)}
              </div>
            </div>
            {/* End of addition by - Ashish Dewangan on 26-10-2024
            * Reason - To show total paid */}
            {billingDetails.booking_type == "Advance" &&
              billingDetails.is_Refundable != null &&
              billingDetails.is_Refundable?.trim()?.length > 0 && (
                <>
                  <div className={styles.pair}>
                    <div className={styles.label}>Refundable Amount</div>
                    <div className={styles.colon}>:</div>
                    <div className={styles.inputContainer}>
                      <input
                        disabled
                        className={`${styles.inputDisabled}  ${styles.inputWidth}`}
                        value={billingDetails.refund_amount}
                      />
                    </div>
                  </div>
                </>
              )}
            <div className={styles.pair}>
              <label className={styles.label}>Total Refundable Amount</label>
              <div className={styles.colon}>:</div>
              <div className={styles.value}>
                ₹{Number(billingDetails.refund_amount) ? Number(billingDetails.refund_amount).toFixed(2) : "0.00"}
              </div>
            </div>
            
            {/* Commented by Om Shrivastava on 04-10-2024
            Reason : No need to show this label  */}
            {/* <div className={styles.pair}>
              <label className={styles.label}>
                Sub-Total<span> for {totalDays} Day(s)</span>
              </label>
              <div className={styles.colon}>:</div>
              <div className={styles.value}>₹{subTotalDays?.toFixed(2)}</div>
            </div> */}
            {/* End of commented by Om Shrivastava on 04-10-2024
            Reason : No need to show this label  */}

            {/* Added by - Ashish Dewangan on 16-10-2024
             * Reason - To show cancelled amount */}
            {/* {billingDetails.is_Refundable == "Yes" && ( */}
            <div className={styles.pair}>
              <label className={styles.label}>Cancelled Amount (₹)</label>
              <div className={styles.colon}>:</div>

              <span className={styles.value}>
                ₹
                {/* Modified by - Ashish Dewangan on 24-10-2024
                * Reason - Changed the calculation logic */}
                {billingDetails.is_cancelled
                  ? Math.ceil(grandTotal - (totalPaid - billingDetails.refund_amount)).toFixed(2)
                  : 0}
                {/* End of modification by - Ashish Dewangan on 24-10-2024
                * Reason - Changed the calculation logic */}
              </span>
            </div>

            {/* )} */}
            {/* End of addition by - Ashish Dewangan on 16-10-2024
             * Reason - To show cancelled amount */}

            <div className={styles.pair}>
              <label className={styles.label}>Grand Total (₹)</label>
              <div className={styles.colon}>:</div>

              <span className={styles.value}>
                {/* ₹{grandTotal.toFixed(2)} */}
                {/* Modified by - Ashish Dewangan on 16-10-2024
                 * To convert the decimal point to the smallest integer greater than or equal to it */}
                {/* {Math.round(grandTotal)} */}₹
                {Math.ceil(grandTotal).toFixed(2)}
                {/* End of modification by - Ashish Dewangan on 16-10-2024
                 * To convert the decimal point to the smallest integer greater than or equal to it */}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.roomDetails}>
          <legend className={styles.legend}>Room Details</legend>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Room Number</th>
                <th>Room Type</th>
                <th>Room variety</th>
                <th>Price</th>
                <th>Date & Time</th>
              </tr>
            </thead>
            {/* <tbody>
              {checkinDetails
                .filter((checkin) => checkin.room_number)
                .map((checkin, i) => {
                  const { number, room_type, price, variety } =
                    checkin.room_number;
                  return (
                    <tr key={i}>
                      <td>{number}</td>
                      <td>{room_type}</td>
                      <td>{variety}</td>
                      <td>{checkin.room_price}</td>
                    </tr>
                  );
                })}
            </tbody> */}
            <tbody>
              {(() => {
                let sortedCheckinDetails = [...checkinDetails];

                let latestShift = null;
                let previousRoomId = null;
                let newRoomId = null;

                // Check if room shifting has occurred
                if (roomShiftedFlag && roomShiftHistory.length > 0) {
                  latestShift = roomShiftHistory[roomShiftHistory.length - 1];
                  previousRoomId = latestShift.previous_room; // Get previous room ID
                  newRoomId = latestShift.new_room; // Get new room ID

                  // Move the new room to the top
                  sortedCheckinDetails.sort((a, b) => {
                    if (a.room_number.id === newRoomId) return -1;
                    if (b.room_number.id === newRoomId) return 1;
                    return 0;
                  });
                }

                return sortedCheckinDetails
                  .filter((checkin) => checkin.room_number)
                  .map((checkin, i) => {
                    const { number, room_type, price, variety, id } = checkin.room_number;

                    const isShiftedRoom = newRoomId === id; // New room at the top
                    const isPreviousRoom = previousRoomId === id; // Mark previous room

                    return (
                      <tr key={i} style={{ backgroundColor: isPreviousRoom ? "#f5f5f5" : "inherit", color: isPreviousRoom ? "rgba(77,77,77,0.7)" : "inherit" }}>
                        <td>
                          {isShiftedRoom ? `Shifted to ${number}` : number}
                        </td>
                        <td>{room_type}</td>
                        <td>{variety}</td>
                        <td>{checkin.room_price}</td>
                        <td>{formatDateAndTime(checkin.arrival_date, checkin.arrival_time)}</td>
                      </tr>
                    );
                  });
              })()}
            </tbody>

          </table>
        </div>

        {paymentReceiptData.length > 0 && (
          <div className={styles.paymentDetails} style={{ paddingTop: "2%" }}>
            {/* <legend style={{ fontWeight: "bold" }}>Room Details</legend> */}
            <legend className={styles.legend}>Payments Done</legend>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Date</th>
                  <th>Transaction ID</th>
                  <th>Transaction Proof</th>
                  <th>Receipt</th>
                  {/* <th>Departure Date</th>
                <th>Departure Time</th> */}
                </tr>
              </thead>
              <tbody>
                {paymentReceiptData
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .map((payment, i) => {
                  var date = new Date(payment.created_at);
                  return (
                    <tr key={i}>
                      <td>{payment.amount_paid}</td>
                      <td>{payment.payment_method}</td>
                      <td>
                        
                        {/* Modified by - Ashish Dewangan on 09-09-2024
                          Reason - To format date and time */}
                        {
                          // date.getDate() +
                          // "-" +
                          // date.getMonth() +
                          // "-" +
                          // date.getFullYear() +
                          // " | " +
                          // date.getHours() +
                          // " : " +
                          // date.getMinutes() +
                          // " : " +
                          // date.getSeconds()
                          (date.getDate() < 10 ? "0" : "") +
                            date.getDate() +
                            "-" +
                            (date.getMonth() < 9 ? "0" : "") +
                            (date.getMonth() + 1) +
                            "-" +
                            date.getFullYear() +
                            " | " +
                            (date.getHours() < 9 ? "0" : "") +
                            date.getHours() +
                            " : " +
                            (date.getMinutes() < 9 ? "0" : "") +
                            date.getMinutes() +
                            "  " +
                            (date.getHours() >= 12 ? "PM" : "AM")
                        }
                        {/* End of modification by - Ashish Dewangan on 09-09-2024
                          Reason - To format date and time */}
                      </td>
                      {/* {payment.payment_method !== "Cash" && (
                        <>
                          <td>{payment.transaction_id}</td>
                          <td>
                            <button
                              onClick={() => handleShowReceipt(`${baseURL}${payment.payment_proof}`)}
                              className="submitButton"
                              style={{ textAlign: "center", marginLeft: "27%", marginTop: "4px" }}
                              disabled={!payment.payment_proof || payment.payment_proof.trim() === ""} 
                            >
                              Payment Proof
                            </button>
                          </td>
                        </>
                      )} */}
                      {
                        payment.payment_method !== "Cash" ? (
                          <>
                            <td>{payment.payment_method === "Online" ? payment.transaction_id : "N/A"}</td>
                            <td>
                              {payment.payment_method === "Online" && payment.payment_proof ? (
                                <button
                                  onClick={() => handleShowReceipt(`${baseURL}${payment.payment_proof}`)}
                                  className="submitButton"
                                  style={{ textAlign: "center", marginLeft: "27%", marginTop: "4px" }}
                                  disabled={!payment.payment_proof || payment.payment_proof.trim() === ""}
                                >
                                  Payment Proof
                                </button>
                              ) : (
                                <button 
                                  className={styles.disabledButton}
                                  disabled
                                >
                                  No Proof
                                </button>
                              )}
                            </td>
                          </>
                        ) : (
                          <>
                            <td>-</td>
                            <td>
                              <button 
                                className={styles.disabledButton}
                                disabled
                              >
                                No Proof
                              </button>
                          </td>
                        </>
                        )
                      }

                      <td>
                        <button
                          onClick={(e) => {
                            setParticularPaymentReceipt(payment);
                            setIsPrModalVisible(true);
                          }}
                          className="submitButton"
                          style={{ marginLeft: "36%" }}
                        >
                          View
                        </button>
                      </td>
                      {/* <td>{checkin.departure_date}</td>
                      <td>{checkin.departure_time}</td> */}
                      <Modal
                        title="Payment Proof"
                        visible={showModalReceipt}
                        onCancel={closeModal}
                        footer={
                          receiptImage ? (
                            <>
                              <Button key="download" onClick={handleDownloadPaymentProof}>
                                Download
                              </Button>
                              <Button key="print" onClick={handlePrintPaymentProof}>
                                Print
                              </Button>
                              <Button key="close" onClick={closeModal}>
                                Close
                              </Button>
                            </>
                          ) : (
                            <Button key="close" onClick={closeModal}>
                              Close
                            </Button>
                          )
                        }
                      >
                        {receiptImage ? (
                          <div
                            style={{
                              textAlign: "center",
                              pageBreakInside: "avoid",
                            }}
                            className="print-container"
                          >
                            <img
                              src={receiptImage}
                              alt="Payment Proof"
                              style={{
                                width: "100%",
                                borderRadius: "8px",
                                marginBottom: "20px",
                              }}
                            />
                          </div>
                        ) : (
                          <h4 style={{ textAlign: "center" }}>No payment proof available</h4>
                        )}
                      </Modal>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className={styles.guestDetailsContainer}>
          <legend
            className={styles.legend}
            style={{
              textAlign: "center",
              fontWeight: "500",
              fontSize: "16px",
            }}
          >
            Customer Details
          </legend>
          <table className={styles.setWidth}>
            <thead>
              <tr>
                <th>Name</th>
                {/* <th>Last Name</th> */}
                <th>Phone</th>
                <th>Room Number</th>
                <th>ID Type</th>
                <th>ID Number</th>
                <th>Address</th>
                <th>Email</th>
                <th>ID Card Image</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  {/* Addition by akanksha on 11th Oct 
                          Reason to show salutation with name */}
                  {billingDetails.customer_salutation} {personalDetails.name}
                  {/* Addition by akanksha on 11th Oct 
                          Reason to show salutation with name */}
                  {/* Addition by Om Shrivastava on 17-10-2024
                          Reason : Set the last name  */}
                 {/* Addition by Om Shrivastava on 25-10-2024
                 Reason : Add space  */}
                  {" "}
                  {/* End of addition by Om Shrivastava on 25-10-2024
                 Reason : Add space  */}
                  {personalDetails.last_name}
                  {/* End of addition by Om Shrivastava on 17-10-2024
                          Reason : Set the last name  */}
                </td>
                {/* <td>{guestDetails.guest_last_name}</td> */}
                <td>{personalDetails.phone}</td>
                <td>
                  {checkinDetails?.length > 0
                    ? checkinDetails.map((item) => item.room_number?.number).join(", ")
                    : "N/A"
                  }
                </td>
                <td>{personalDetails.id_card_type}</td>
                <td>{personalDetails.id_card_no}</td>
                <td>{personalDetails.address}</td>
                <td>{personalDetails.email} </td>
                <td>
                  <button
                    // onClick={() => showModal(guestDetails.guest_id_card_photo)}
                    // onClick={() => showModal(personalDetails.id_card_photo)}
                    onClick={() =>
                      showIdCardModal(personalDetails.id_card_photo)
                    }
                    className="submitButton"
                    style={{ textAlign: "center", marginLeft: "30%" }}
                  >
                    Show ID
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        {guestDetails && guestDetails.length > 0 ? (
          <div className={styles.guestDetailsContainer}>
            <legend className={styles.legend}>Guest Details</legend>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  {/* Added by - Ashish Dewangan on 26-09-2024
                  Reason - To show adult / children info */}
                  <th>Adult / Child</th>
                  {/* End of addition by - Ashish Dewangan on 26-09-2024
                  Reason - To show adult / children info */}
                  {/* Added by Akanksha on 24-01-2025
                  Reason : To store room number for guest */}
                  <th>Room Number</th>
                  {/* End by Akanksha on 24-01-2025
                  Reason : To store room number for guest */}
                  <th>ID Type</th>
                  <th>ID Number</th>
                  <th>ID Card Image</th>
                </tr>
              </thead>
              {/* <tbody>
                {guestDetails.map((guestDetails, index) => (
                  <tr key={index}>
                    <td>
                      {guestDetails.guest_salutation} {guestDetails.guest_name}
                      &nbsp;
                      {guestDetails.guest_last_name}
                    </td>
                    <td style={{ textTransform: "capitalize" }}>
                      {guestDetails?.person_type}
                    </td>
                    <td>{guestDetails.selectedRoom}</td>
                    <td>{guestDetails.guest_id_card_type}</td>
                    
                    <td>{guestDetails.guest_id_card_no}</td>
                    <td style={{ display: "flex", justifyContent: "center" }}>
                      
                      <button
                        onClick={() => showIdCardModal(guestDetails.guest_id_card_photo)}
                        className={`submitButton ${!guestDetails.guest_id_card_photo ? 'disabled' : ''}`} 
                        style={{
                          textAlign: "center",
                          marginLeft: "30%",
                          cursor: !guestDetails.guest_id_card_photo ? "not-allowed" : "pointer", 
                          pointerEvents: !guestDetails.guest_id_card_photo ? "none" : "auto", 
                        }}
                        disabled={!guestDetails.guest_id_card_photo}
                      >
                        Show ID
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody> */}
              <tbody>
                {guestDetails
                  .sort((a, b) => (b.room_shifted ? 1 : 0) - (a.room_shifted ? 1 : 0)) // Sort shifted guests to the top
                  .map((guest, index) => (
                    <tr key={index}>
                      <td>
                        {guest.guest_salutation} {guest.guest_name}&nbsp;
                        {guest.guest_last_name}
                      </td>
                      <td style={{ textTransform: "capitalize" }}>
                        {guest?.person_type}
                      </td>
                      <td>
                        {guest.room_shifted ? `Shifted to ${guest.selectedRoom}` : guest.selectedRoom}
                      </td>
                      <td>{guest.guest_id_card_type}</td>
                      <td>{guest.guest_id_card_no}</td>
                      <td>
                        <button
                          onClick={() => showIdCardModal(guestDetails.guest_id_card_photo)}
                          className={`submitButton ${!guestDetails.guest_id_card_photo ? 'disabled' : ''}`} 
                          style={{
                            textAlign: "center",
                            marginLeft: "30%",
                            cursor: !guestDetails.guest_id_card_photo ? "not-allowed" : "pointer", 
                            pointerEvents: !guestDetails.guest_id_card_photo ? "none" : "auto", 
                          }}
                          disabled={!guestDetails.guest_id_card_photo}
                        >
                          Show ID
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : null}
        <div className={styles.subContainer2}>
          {/*
           * Added by - Ashish Dewangan on 31-08-2024
           * Reason - To show list of all payments done
           */}

          {/*
           * End of addition by - Ashish Dewangan on 31-08-2024
           * Reason - To show list of all payments done
           */}
        </div>
      </div>

      {/* <div className={styles.buttonContainer}>
        <button onClick={handleFormCClick} className={styles.formCButton}>
          C Form
        </button>
      </div> */}
      
      {/* Added by akanksha on 25th Oct 2024, Reason to open popup of C Form */}
      <div className={styles.buttonContainer}>
        <button onClick={showFormCModal} className={styles.formCButton}>
          View C Form
        </button>
        <Modal
          visible={isFormCVisible}
          onOk={handleFormCClose}
          onCancel={handleFormCClose}
          footer={null} // Remove if you want the default footer with OK and Cancel buttons
          width={896} // Set width to make it look like a form view
        >
          <FormC />
        </Modal>
      </div>
      {/* End by akanksha on 25th Oct 2024, Reason to open popup of C Form */}
      <Modal
        title="ID Card Image"
        visible={isModalVisible}
        onCancel={closeIdCardModal}
        // Modification and addition by Om Shrivastava on 11-10-2024
        // Reason : Add condition when image is not show then remove the button
        footer={[
          selectedImage !== "/media/null" &&
          selectedImage !== undefined &&
          selectedImage !== null &&
          selectedImage.trim().toLowerCase().length > 0 ? (
            // <Button key="print" onClick={handleCFormPrint}>
            //   Print
            // </Button>
            <>
              {/* Added by akanksha on 21st oct, Reason: Download Button using handleDownload */}
              <Button key="download" onClick={handleDownload}>
                Download
              </Button>
              {/* End by akanksha on 21st oct, Reason: Download Button using handleDownload */}

              {/* Print Button */}
              <Button key="print" onClick={handleCFormPrint}>
                Print
              </Button>
            </>
          ) : null,
          ,
          // End of modification and addition by Om Shrivastava on 11-10-2024
          // Reason : Add condition when image is not show then remove the button
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            Close
          </Button>,
        ]}
      >
        {/* Addition by Om Shrivastava on 14-09-2024
      Reason : When image is availbale then image is show  */}
        {/* {selectedImage != "/media/null" ?  */}
        {selectedImage != "/media/null" &&
        selectedImage != undefined &&
        selectedImage != null &&
        selectedImage?.trim().toLowerCase()?.length > 0 ? (
          <img
            src={`${baseURL}${selectedImage}`}
            alt="ID Card"
            style={{ width: "100%" }}
          />
        ) : (
          <h4 style={{ textAlign: "center" }}>
            {/* Code modification and addition by Om Shrivastava on 21-09-2024
              Reason : Need to change the message  */}
            {/* No Image is add */}
            No ID available
            {/* End of Code modification and addition by Om Shrivastava on 21-09-2024
              Reason : Need to change the message  */}
          </h4>
        )}
        {/* Addition by Om Shrivastava on 14-09-2024
      Reason : When image is availbale then image is show  */}
      </Modal>
      {/*
       * Added by - Ashish Dewangan on 31-08-2024
       * Reason - To show payment receipt
       */}
      <PaymentReceiptModal
        visible={isPrModalVisible}
        onClose={handlePrCloseModal}
        paymentReceiptData={particularPaymentReceipt}
      />
      {/*
       * End of addition by - Ashish Dewangan on 31-08-2024
       * Reason - To show payment receipt
       */}
    </div>
  );
};

export default CheckoutDetailsForm;
