import React, { useContext, useEffect, useState, useCallback } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
// Code Adition by Tejasve Gupta on 17-07-2024
// reason - Addition of c-form
// import { Modal, Button } from "antd";
// End of Code Adition by Tejasve Gupta on 17-07-2024
// reason - Addition of c-form
import styles from "./CheckInDetailsForm.module.css";
import { Modal, Button } from "antd";
import { baseURL } from "../../Api/config";

import {
  getParticularCheckindetailsApi,
  postCheckOutDetailsApi,
  getStatusByBillingId,
  postPaymentReceiptApi,
  patchCancelCheckinApi,
  patchRefundCheckinApi,
  postRoomShiftingApi,
  getRoomShiftingApi,
} from "../../Api/services";
import {
  Container,
  Grid,
  Typography,
  TextField,
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
  InputAdornment,
  IconButton,
} from "@mui/material";
import notificationObject from "../../components/Widgets/Notification/Notification";
import PaymentReceiptModal from "../PaymentReceipt/PaymentReceipt";

import { getCurrentDate } from "../../utils/Date";
import { GrCursor } from "react-icons/gr";
import { GlobalContext } from "../../context/Context";

// Created by akanksha on 23rd Oct 2024, 
// reason : to disable scroll-to-change functionality for all input[type=number] fields
import { disableScrollForNumberInputs, cleanupScrollDisable } from "../../utils/InputUtils";
// End by akanksha on 23rd Oct 2024, 
// reason : to disable scroll-to-change functionality for all input[type=number] fields 

import FormC from "../FormC/FormC";
import { FiArrowLeft } from "react-icons/fi";
import RoomMove from "../RoomMove/RoomMove";

const CheckInDetailsForm = () => {
  const location = useLocation();
  const [billingDetails, setBillingDetails] = useState({});
  const [personalDetails, setPersonalDetails] = useState({});
  const [checkinDetails, setCheckinDetails] = useState([]);
  const [guestDetails, setGuestDetails] = useState([]); // Add state for guest details
  const [isRoomShiftDataLoaded, setIsRoomShiftDataLoaded] = useState(false);
  // Added by akanksha on 1-03-2025
  // Reason : to check the first partial checkout status to set departure date only once
  const [noRecordsFound, setNoRecordsFound] = useState(false);
  const [shouldUIUpdate, setShouldUIUpdate] = useState(false);
  const [isFirstPartialCheckout, setIsFirstPartialCheckout] = useState(false);
  const [showModalReceipt, setShowModalReceipt] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [showModals, setShowModals] = useState(false);
  const [paymentProof, setPaymentProof] = useState(null);
  const [roomShiftTrigger, setRoomShiftTrigger] = useState(false);
  const [roomShiftedFlag, setRoomShiftedFlag] = useState(false);
  const [roomShiftHistory, setRoomShiftHistory] = useState();
  const [newRoomDetail, setNewRoomDetail] = useState({});
  const [newRoomCharge, setNewRoomCharge] = useState(0);
  const [newRoomPrice, setNewRoomPrice] = useState(0);
  const [newRoomDays, setNewRoomDays] = useState(0);
  const [shiftedDate, setShiftedDate] = useState();
  const [newCheckinDetails, setNewCheckinDetails] = useState({});
  const [previousRoomCharge, setPreviousRoomCharge] = useState(0);
  
  // End by akanksha on 1-03-2025
  // Reason : to check the first partial checkout status to set departure date only once
  const [extraPersonCharge, setExtraPersonCharge] = useState(0);
  const [defaultExtraPersonCharge, setDefaultExtraPersonCharge] = useState(0);

  const [discountIn, setDiscountIn] = useState("Discount in (₹)");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);

  const [roomCharges, setRoomCharges] = useState(0);
  const [defaultRoomCharges, setDefaultRoomCharges] = useState(0);
  const [oldRoomCharges, setOldRoomCharges] = useState(0);
  const [taxableAmount, setTaxableAmount] = useState(0);
  const [defaultTaxableAmount, setDefaultTaxableAmount] = useState(0);

  const [gst, setGst] = useState(0);
  const [defaultGst, setDefaultGst] = useState(0);

  const [gstValue, setGstValue] = useState(0);
  const [subTotal, setSubTotal] = useState(0);
  const [defaultSubTotal, setDefaultSubTotal] = useState(0);

  const [totalDays, setTotalDays] = useState(1);
  const [advancePayAmount, setAdvancePayAmount] = useState(0);
  const [defaultAdvancePayAmount, setDefaultAdvancePayAmount] = useState(0);

  const [total, setTotal] = useState(0);
  const [defaultTotal, setDefaultTotal] = useState(0);

  const [dueAmount, setDueAmount] = useState(0);

  const [miscellaneousCharges, setMiscellaneousCharges] = useState(0);
  const [extraDiscount, setExtraDiscount] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  // const [partialPaymentReason, setPartialPaymentReason] = useState('');
  const [partialPaymentReason, setPartialPaymentReason] = useState(() => {
    return localStorage.getItem(`partialPaymentReason_${billingDetails.id}`) || "";
  });
  const handleReasonChange = (e) => {
    const reason = e.target.value;
    setPartialPaymentReason(reason);
    localStorage.setItem(`partialPaymentReason_${billingDetails.id}`, reason);
  };
    
  
  const [isRefunded, setIsRefunded] = useState(false); 
  const billingId = billingDetails.id;

  const [latestCheckOutDate, setLatestCheckOutDate] = useState();
  const [latestCheckOutTime, setLatestCheckOutTime] = useState();

  const navigate = useNavigate();

  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Code Adition by Tejasve Gupta on 17-07-2024
  // reason - Addition of c-form
  // const [isModalVisible, setIsModalVisible] = useState(false);
  // End of Code Adition by Tejasve Gupta on 17-07-2024
  // reason - Addition of c-form
  const [errorMessage, setErrorMessage] = useState("");
  // Addition by Om Shrivastava on 13-10-2024
  // Reason : Create useState for refundable amount
  const [isRefundable, setIsRefundable] = useState("Yes");
  const [refundableAmount, setRefundableAmount] = useState(0.0);
  // End of addition by Om Shrivastava on 13-10-2024
  // Reason : Create useState for refundable amount
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentReceiptNumber, setPaymentReceiptNumber] = useState("");
  const [paymentReceiptData, setPaymentReceiptData] = useState([]);
  var [isPrModalVisible, setIsPrModalVisible] = useState(false);
  /**Code Addition by Tejasve Gupta on 30-08-2024
   * Reason - Cancelation popup
   */
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
  const [isRefundModalVisible, setIsRefundModalVisible] = useState(false);
  
  const [updatedRefundAmount, setUpdatedRefundAmount] = useState(0);

  /**End of Code Addition by Tejasve Gupta on 30-08-2024
   * Reason - Cancelation popup
   */

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); // State to hold the selected image
  const [totalPaid, setTotalPaid] = useState(0);

  const [remainingRefundable, setRemainingRefundable] = useState(grandTotal - totalPaid);


  const [particularPaymentReceipt, setParticularPaymentReceipt] = useState({});
  const [isRefundInProgress, setIsRefundInProgress] = useState(false);
  const [refundSuccess, setRefundSuccess] = useState(false);
  const [isCheckoutButtonDisabled, setIsCheckoutButtonDisabled] =
    useState(false);
  // Added by - Ashlekh on 03-10-2024
  // Reason - To use context variable
  var { staffName, setStaffName, adminName, setAdminName } =
    useContext(GlobalContext);
  
  const { tenant } = useContext(GlobalContext);
  // End of code - Ashlekh on 03-10-2024
  // Reason - To have use context variable

  /**
   * Added by - Ashish Dewangan on 30-09-2024
   * Reason - To store room numbers in payment receipt
   */
  const [roomNumbersList, setRoomNumbersList] = useState("");
  const [miscellaneousDetails, setMiscellaneousDetails] = useState('');
  const [extraDetails, setExtraDetails] = useState('');

  const [originalGrandTotal, setOriginalGrandTotal] = useState(grandTotal);
  const [isPartialPayment, setIsPartialPayment] = useState(false);
  const [partialPaymentConfirmed, setPartialPaymentConfirmed] = useState(false);
  const [errorMessages, setErrorMessages] = useState("");
  const [isPartial, setIsPartial] = useState("");
  
  const[partialTrue, setIsPartialTrue]= useState();

  const calculateRoomCharges = (checkinDetails) => {
    // if (partialTrue) return;
    const today = new Date(); // Get current date dynamically
    let totalCharge = 0;
  
    checkinDetails.forEach((checkin) => {
      if (checkin.room_shifted) return;
      const arrivalDateTime = new Date(`${checkin.arrival_date}T${checkin.arrival_time}`);
      let departureDateTime = checkin.departure_date
        ? new Date(`${checkin.departure_date}T${checkin.departure_time || "23:59:59"}`)
        : today; // If departure date is null, assume the user is still staying
  
      // Calculate base number of days
      let daysStayed = Math.floor((departureDateTime - arrivalDateTime) / (1000 * 60 * 60 * 24));
  
      // Check if departure time is after check-in time, if yes add an extra day
      if (departureDateTime.getHours() > arrivalDateTime.getHours() || 
          (departureDateTime.getHours() === arrivalDateTime.getHours() && 
           departureDateTime.getMinutes() > arrivalDateTime.getMinutes())) {
        daysStayed += 1;
      }
  
      // Minimum stay should be at least 1 day
      daysStayed = Math.max(daysStayed, 1);
  
      // Calculate charge for this room
      const roomCharge = parseFloat(checkin.room_price) * daysStayed;
      totalCharge += roomCharge;
      
    });
    return totalCharge;
  };
  // useEffect(() => {
  //   const totalCharge = calculateRoomCharges(checkinDetails);
  //   setPreviousRoomCharge(totalCharge);
  // }, [checkinDetails]);
  useEffect(() => {
    if (partialTrue) {
      setPreviousRoomCharge(billingDetails?.room_charges || 0);
    } else {
      const totalCharge = calculateRoomCharges(checkinDetails);
      setPreviousRoomCharge(totalCharge);
    }
  }, [checkinDetails, partialTrue, billingDetails]);
  

  // const calculateNewRoomCharges = (newCheckinDetails) => {
  //   if (
  //     !newCheckinDetails ||
  //     !newCheckinDetails.arrival_date ||
  //     !newCheckinDetails.arrival_time
  //   )
  //     return 0;
  
  //   const arrivalDateTime = new Date(`${newCheckinDetails.arrival_date}T${newCheckinDetails.arrival_time}`);
    
  //   const endDateTime = (newCheckinDetails.departure_date && newCheckinDetails.departure_time)
  //     ? new Date(`${newCheckinDetails.departure_date}T${newCheckinDetails.departure_time}`)
  //     : new Date();
  
  //   const timeDiffMs = endDateTime - arrivalDateTime;
  //   let totalDays = timeDiffMs / (24 * 60 * 60 * 1000);
  //   totalDays = Math.ceil(totalDays);
  
  //   const totalRoomCharge = totalDays * newCheckinDetails.room_price;
  
  //   return totalRoomCharge;
  // };
  const calculateNewRoomCharges = (newCheckinDetails) => {
    if (
      !newCheckinDetails ||
      !newCheckinDetails.arrival_date ||
      !newCheckinDetails.arrival_time
    ) return 0;
  
    const arrivalDateTime = new Date(`${newCheckinDetails.arrival_date}T${newCheckinDetails.arrival_time}`);
    const endDateTime = (newCheckinDetails.departure_date && newCheckinDetails.departure_time)
      ? new Date(`${newCheckinDetails.departure_date}T${newCheckinDetails.departure_time}`)
      : new Date();
  
    const msPerDay = 24 * 60 * 60 * 1000;
    const timeDiffMs = endDateTime - arrivalDateTime;
  
    let totalDays = Math.floor(timeDiffMs / msPerDay);
    const remainingMs = timeDiffMs % msPerDay;
  
    if (remainingMs > 0) {
      totalDays += 1; // charge for the partial day
    }
  
    const totalRoomCharge = totalDays * newCheckinDetails.room_price;
    return totalRoomCharge;
  };
  
  useEffect(() => {
    if (newCheckinDetails && !partialTrue) {
      const totalCharge = calculateNewRoomCharges(newCheckinDetails);
      console.log("Calculated total charge:", totalCharge);
      setNewRoomPrice(totalCharge);
    }
  }, [newCheckinDetails, partialTrue]); 
  
    
  
  

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
  
  
  

  const handleAmountChange = (e) => {
    let value = e.target.value.trim();
    
    if (value === "") {
      setPaymentAmount(""); // Allow empty input
      return;
    }
  
    value = Number(value);
  
    if (isNaN(value) || value < 0) {
      setErrorMessage("Please enter a valid amount.");
    } else {
      setErrorMessage(""); // Clear error if input is valid
    }
  
    setPaymentAmount(value);
  };
  
  const handleAmountBlur = (e) => {
    let value = Number(e.target.value);
    const dueAmount = grandTotal - totalPaid;
  
    if (isNaN(value) || value < 0) {
      setPaymentAmount(0);
      setErrorMessage("Invalid amount entered.");
      return;
    }
  
    // if (value > dueAmount) {
    //   setErrorMessage(`Entered amount exceeds due amount (₹${dueAmount}).`);
    // }
  
    setIsPartialPayment(value < dueAmount);
  };

  
  const [isModalOpen, setModalOpen] = useState(false);
  const [image, setImage]=useState(null);
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
  




  const handlePaymentChange = (e) => {
    const selectedMethod = e.target.value;
    setPaymentMethod(selectedMethod); // This line assumes setPaymentMethod is already declared in the parent or context
    if (selectedMethod === "Online") {
      setShowModals(true);
    } else {
      setShowModals(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setPaymentProof(file);  // Save the selected file to state
  };
  
  

  
  {
    /* Addition by Om Shrivastava on 03-01-2025
      Reason : Add back icon  */
  }
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [isPopupCheckoutVisible, setIsPopupCheckoutVisible] = useState(false);

  const handleBackClick = () => {
    setIsPopupVisible(true);
  };

  const handleOutsideClick = (e) => {
    if (e.target.className.includes("popupOverlay")) {
      setIsPopupVisible(false);
    }
  };

  const handleOutsideClickCheckout = (e) => {
    if (e.target.className.includes("popupOverlay")) {
      setIsPopupCheckoutVisible(false);
    }
  };

  const handleOkClick = () => {
    setIsPopupVisible(false);
    // Navigate back
    window.history.back();
    // navigate(-1)
  };

  const handleOkClicks = () => {
    setIsPopupVisible(false);
    navigate("/checkout-list");
    if (Number(totalPaid) < Number(grandTotal)) {
      notificationObject.success("Partially checkout is submitted successfully!");
    }else{
      notificationObject.success("Checkout is submitted successfully!");
    }
  };

  const handleCancelClick = () => {
    setIsPopupVisible(false);
  };
  const handleCancelCheckoutClick = () => {
    setIsPopupCheckoutVisible(false);
  };
  {
    /* End of code addition by Om Shrivastava on 03-01-2025
      Reason : Add back icon  */
  }

  useEffect(() => {
    if (billingDetails?.id) {
      const storedReason = localStorage.getItem(`partialPaymentReason_${billingDetails.id}`);
      setPartialPaymentReason(storedReason || ""); // Load from localStorage
    }
  }, [billingDetails?.id]);



  // Created by akanksha on 23rd Oct 2024, 
  // reason : to disable scroll-to-change functionality for all input[type=number] fields 
  useEffect(() => {
    // Call the method again when state that renders the inputs changes
    disableScrollForNumberInputs();
    
    return () => {
      cleanupScrollDisable();
    };
  }, [checkinDetails, guestDetails]);
  // End by akanksha on 23rd Oct 2024, 
  // reason : to disable scroll-to-change functionality for all input[type=number] fields 

  useEffect(() => {
    var numbers = "";
    checkinDetails.forEach((checkin) => {
      if (numbers.length > 0) {
        numbers = numbers + ", " + checkin?.room_number?.number;
      } else {
        numbers = numbers + checkin?.room_number?.number;
      }
    });
    setRoomNumbersList(numbers);
  }, [checkinDetails]);
  /**
   * End of addition by - Ashish Dewangan on 30-09-2024
   * Reason - To store room numbers in payment receipt
   */

  useEffect(() => {
    if (!localStorage.getItem("access")) {
      Navigate("/login");
    }
  }, [navigate]);

  /**
   * Added by - Ashish Dewangan on 01-09-2024
   * Reason - To set current date and time as default value for checkout date and time
   */
  useEffect(() => {
    var date = new Date();
    var day = date.getDate(),
      month = date.getMonth() + 1,
      year = date.getFullYear(),
      hour = date.getHours(),
      min = date.getMinutes();

    month = (month < 10 ? "0" : "") + month;
    day = (day < 10 ? "0" : "") + day;
    hour = (hour < 10 ? "0" : "") + hour;
    min = (min < 10 ? "0" : "") + min;

    var currentDate = year + "-" + month + "-" + day,
      currentTime = hour + ":" + min;
    setLatestCheckOutDate(currentDate);
    setLatestCheckOutTime(currentTime);
  }, []);
  /**
   * End of addition by - Ashish Dewangan on 01-09-2024
   * Reason - To set current date and time as default value for checkout date and time
   */

  useEffect(() => {
    const fetchBillingStatus = async () => {
      try {
        const access = localStorage.getItem("access");
        const billingId = location?.state?.id;
        const response = await getStatusByBillingId(access, billingId, tenant);
        setStatus(response.status);
      } catch (err) {
        setError("Error fetching billing status");
        console.error("Error: ", err);
      }
    };

    fetchBillingStatus();
  }, [location]);


  const fetchRoomShift = async () => {
    
    const billingId = location?.state?.id;
    if (!billingId) return;
    
    try {
      const response = await getRoomShiftingApi(billingId, tenant);
      if(response){
        if(response.room_shifted){
          setLoading(true);
          setNewRoomCharge(Number(response?.new_room_details?.price));
          setNewRoomPrice(Number(response?.new_room_details?.price));
          setRoomShiftedFlag(response.room_shifted);
          setRoomShiftHistory(response.room_shift_history);
          setNewRoomDetail(response.new_room_details);
          setShiftedDate(response.room_shift_history?.[0]?.shifted_at || null);
          setNewCheckinDetails(response.new_checkin_details);
          setIsRoomShiftDataLoaded(true);
          setLoading(false);
        }
        
      }
      
      
      // setStatus(response.status); 
    } 
  
    catch (err) {
      setError("Error fetching billing status");
      console.error("Error: ", err);
    } finally {
    // setLoading(false);
    }
    return true;
  };

  useEffect(() => {
    
    fetchRoomShift();
    
  }, [location?.state?.id]);

  
  useEffect(() => {
    
    fetchRoomShift();
  }, [shouldUIUpdate]);

  useEffect(() => {
    if (isRoomShiftDataLoaded) {
      calculate();
    }
  }, [isRoomShiftDataLoaded]);


  useEffect(() => {
    if (!roomShiftedFlag || !newCheckinDetails) return;
    const shiftedDate = `${newCheckinDetails.arrival_date}T${newCheckinDetails.arrival_time}`;
    const newArrivalDateTime = new Date(shiftedDate);
    if (!latestCheckOutDate || !latestCheckOutTime) return;

    const latestDepartureDateTime = new Date(`${latestCheckOutDate}T${latestCheckOutTime}`);
    const timeDifferenceMs = latestDepartureDateTime - newArrivalDateTime;
    const newRoomDays = Math.ceil(timeDifferenceMs / (1000 * 60 * 60 * 24));
    const adjustedNewRoomDays = Math.max(newRoomDays, 1);
    setNewRoomDays(adjustedNewRoomDays);
  }, [roomShiftedFlag, newCheckinDetails, latestCheckOutDate, latestCheckOutTime]);


  

  useEffect(() => {
    const sum_of_amount_paid = paymentReceiptData.reduce((acc, receipt) => {
      return acc + parseFloat(receipt.amount_paid);
    }, 0);
    setTotalPaid(parseFloat(sum_of_amount_paid));
  }, [paymentReceiptData]);


  useEffect(() => {
    if (!tenant) return;
    const getParticularCheckindetails = async () => {
      try {
        const access = localStorage.getItem("access");
        const response = await getParticularCheckindetailsApi(
          access,
          location?.state?.id,
          tenant
        );
        /**
         * Added by - Ashish Dewangan on 05-09-2024
         * Reason - To set default refund amount
         */
        setUpdatedRefundAmount(
          response.billing_details.refund_amount
            ? response.billing_details.refund_amount
            : 0
        );
        /**
         * End of addition by - Ashish Dewangan on 05-09-2024
         * Reason - To set default refund amount
         */
        // setRoomShiftedFlag(response.room_shifted);
        // setRoomShiftHistory(response.room_shift_history);
        // setNewRoomDetail(response.new_room_details);
        // setShiftedDate(response.room_shift_history?.[0]?.shifted_at || null);
        setBillingDetails(response.billing_details);
        setPersonalDetails(response.billing_details.personal_details);
        setCheckinDetails(response.checkin_details);
        setDefaultRoomCharges(Number(response.billing_details.room_charges));
        setOldRoomCharges(Number(response.billing_details.room_charges));
        setIsPartialTrue(response.billing_details.is_partial_payment_confirmed);
        setRoomCharges(Number(response.billing_details.room_charges));
        setExtraAmount(Number(response.billing_details.additional_charges));
        setDefaultExtraPersonCharge(
          Number(response.billing_details.extra_person_charges)
        ); 
        setExtraPersonCharge(
          Number(response.billing_details.extra_person_charges)
        );
        setSubTotal(Number(response.billing_details.sub_total));
        setTaxableAmount(Number(response.billing_details.taxable_amount));
        setTotal(Number(response.billing_details.total));
        setGrandTotal(Number(response.billing_details.grand_total));
        setGst(Number(response.billing_details.gst));
        setGstValue(Number(response.billing_details.gst_value));
        setDiscountIn(response.billing_details.discount_in);
        setDiscountAmount(Number(response.billing_details.discount_rupees));
        setDiscountPercentage(
          Number(response.billing_details.discount_percentage)
        );
        setAdvancePayAmount(
          Number(response.billing_details.advanced_pay_amount)
        );
        setGuestDetails(response.guest_details);
        setPaymentReceiptData(response.payment_receipts);

        /**
         * Added by - Ashish Dewangan on 16-11-2024
         * Reason - To get extra discount and miscellaneous charges applied from backend
         * and show it to the user
         */
        setExtraDiscount(response.billing_details.extra_discount !=null ? Number(response.billing_details.extra_discount) : 0)
        setMiscellaneousCharges(response.billing_details.miscellaneous_charges !=null ? Number(response.billing_details.miscellaneous_charges) :0)
        /**
         * End of addition by - Ashish Dewangan on 16-11-2024
         * Reason - To get extra discount and miscellaneous charges applied from backend
         * and show it to the user
         */
        setMiscellaneousDetails(response.billing_details.details != null 
          ? response.billing_details.details 
          : "");
      
        // For extraDetails
        setExtraDetails(response.billing_details.extraDetails != null 
            ? response.billing_details.extraDetails 
            : "");
      } catch (error) {}
    };

    getParticularCheckindetails();
  }, [location]);

  useEffect(() => {
    if (!tenant) return;
    const getParticularCheckindetail = async () => {
      try {
        const access = localStorage.getItem("access");
        const response = await getParticularCheckindetailsApi(
          access,
          location?.state?.id,
          tenant
        );
        setUpdatedRefundAmount(
          response.billing_details.refund_amount
            ? response.billing_details.refund_amount
            : 0
        );
        setDefaultExtraPersonCharge(
          Number(response.billing_details.extra_person_charges)
        );
        setOldRoomCharges(Number(response.billing_details.room_charges));
        // setDiscountAmount(Number(response.billing_details.discount_rupees));
        setBillingDetails(response.billing_details);
        setPersonalDetails(response.billing_details.personal_details);
        setCheckinDetails(response.checkin_details);
        setIsPartialTrue(response.billing_details.is_partial_payment_confirmed);
        setGuestDetails(response.guest_details);
        setPaymentReceiptData(response.payment_receipts);
      } catch (error) {}
    };

    getParticularCheckindetail();
  }, [shouldUIUpdate, roomShiftTrigger]);

  useEffect(() => {
    const refundedStatus = localStorage.getItem(`isRefunded_${billingId}`);
    if (refundedStatus === "true") {
        setIsRefunded(true);
    }
  }, [billingId]);

  const [extraAmount, setExtraAmount] = useState(0);
  const [difference, setDifference] = useState(0);

  const calculate = () => {
    if (partialTrue) {
      return;
    }

    var updatedRoomCharges = defaultRoomCharges*totalDays;
  
    updatedRoomCharges = Math.round(updatedRoomCharges * 1e2) / 1e2;
    var updateNewRoomCharges = newRoomCharge * newRoomDays;
    updateNewRoomCharges = Math.round(updateNewRoomCharges * 1e2) / 1e2;
    

    var updatedExtraPersonCharges = defaultExtraPersonCharge * totalDays;
    updatedExtraPersonCharges =
      Math.round(updatedExtraPersonCharges * 1e2) / 1e2;
    var updatedSubTotal = updatedExtraPersonCharges + calculateRoomCharges(checkinDetails) + calculateNewRoomCharges(newCheckinDetails) || 0;
    updatedSubTotal = Math.round(updatedSubTotal * 1e2) / 1e2;
    var updatedDiscountPercentage = discountPercentage;

    let updatedDiscountAmount = discountAmount;

    if (discountIn.trim() === "percentage") {
      updatedDiscountAmount = (updatedSubTotal * updatedDiscountPercentage) / 100;
    } else {
      updatedDiscountPercentage = (updatedDiscountAmount / updatedSubTotal) * 100;
      updatedDiscountPercentage = parseFloat(updatedDiscountPercentage.toFixed(2));
    }

    updatedDiscountAmount = Math.round(updatedDiscountAmount * 1e2) / 1e2;


    var updatedTaxableAmount = updatedSubTotal - updatedDiscountAmount;
    updatedTaxableAmount = Math.round(updatedTaxableAmount * 1e2) / 1e2;
    var updatedGstValue = (gst * updatedTaxableAmount) / 100;
    updatedGstValue = Math.round(updatedGstValue * 1e2) / 1e2;
    var updatedTotal = updatedTaxableAmount + updatedGstValue;
    updatedTotal = Math.round(updatedTotal * 1e2) / 1e2;
    var x = updatedTotal + miscellaneousCharges - extraDiscount;
    var updatedGrandTotal = Math.ceil(x);
    var updatedDueAmount = Math.ceil(
      parseFloat(updatedGrandTotal) - parseFloat(totalPaid)
    );
    setRoomCharges(updatedRoomCharges);
    // setNewRoomPrice(updateNewRoomCharges);
    setExtraPersonCharge(updatedExtraPersonCharges);
    setSubTotal(updatedSubTotal?.toFixed(2));
    setTaxableAmount(updatedTaxableAmount?.toFixed(2));
    setGstValue(updatedGstValue?.toFixed(2));
    setTotal(updatedTotal?.toFixed(2));
    setGrandTotal(updatedGrandTotal?.toFixed(2));
    setDueAmount(updatedDueAmount);
    setDiscountAmount(updatedDiscountAmount);
    setDiscountPercentage(updatedDiscountPercentage);

    // var oldRoomTotal = updatedRoomCharges;
    var oldRoomTotal = defaultRoomCharges;
    // var newRoomTotal = newRoomPrice;
    var newRoomTotal = newRoomCharge;
    var diff = newRoomTotal - oldRoomTotal;
    setDifference(diff);
    setExtraAmount(Math.abs(diff));
  };

  useEffect(() => {
    calculate();
  }, [ partialTrue, totalDays, miscellaneousCharges, extraDiscount, checkinDetails, newCheckinDetails]);

  
  
  

  
  useEffect(() => {
    if (checkinDetails.length > 0) {
      const arrivalDateTime = new Date(
        `${checkinDetails[0].arrival_date}T${checkinDetails[0].arrival_time}`
      );
      // const latestDepartureDateTime = new Date(
      //   `${latestCheckOutDate}T${latestCheckOutTime}`
      // );

      const latestDepartureDateTime = checkinDetails[0]?.departure_date
      ? new Date(`${checkinDetails[0].departure_date}T${checkinDetails[0].departure_time || "00:00:00"}`)
      : new Date(`${latestCheckOutDate}T${latestCheckOutTime}`);


      // Calculate the time difference in milliseconds
      const timeDifference = latestDepartureDateTime - arrivalDateTime;
      const daysDifference = timeDifference / (1000 * 60 * 60 * 24);
      setTotalDays((p) => {
        var x =
          Math.max(Math.ceil(daysDifference)) > 1
            ? Math.max(Math.ceil(daysDifference))
            : 1;
        return x;
      });
    }
  }, [checkinDetails, latestCheckOutDate, latestCheckOutTime]);

  const [totalStayDays, setTotalStayDays]= useState();

  useEffect(() => {
    if (checkinDetails.length > 0) {
      const arrivalDateTime = new Date(
        `${checkinDetails[0].arrival_date}T${checkinDetails[0].arrival_time}`
      );
      // const latestDepartureDateTime = new Date(
      //   `${latestCheckOutDate}T${latestCheckOutTime}`
      // );

      const latestCheckIn = checkinDetails.length > 0 ? checkinDetails[checkinDetails.length - 1] : null;
      const latestDepartureDateTime = latestCheckIn?.departure_date
        ? new Date(`${latestCheckIn.departure_date}T${latestCheckIn.departure_time || "00:00:00"}`)
        : new Date(`${latestCheckOutDate}T${latestCheckOutTime}`);


      // Calculate the time difference in milliseconds
      const timeDifference = latestDepartureDateTime - arrivalDateTime;
      const daysDifference = timeDifference / (1000 * 60 * 60 * 24);
      setTotalStayDays((p) => {
        var x =
          Math.max(Math.ceil(daysDifference)) > 1
            ? Math.max(Math.ceil(daysDifference))
            : 1;
        return x;
      });
    }
  }, [checkinDetails, latestCheckOutDate, latestCheckOutTime]);


  

  const handleDiscountInChange = (e) => {
    setDiscountIn(e.target.value);
    setDiscountAmount(0);
  };

  // const handleDiscountAmountChange = (e) => {
  //   let value = Number(e.target.value);

  //   if (discountIn === "Discount in (%)") {
  //     if (value < 1) value = 1;
  //     if (value > 99) value = 99;
  //   } else if (discountIn === "Discount in (₹)") {
  //     if (value < 0) value = 0;
  //     if (value > totalAmount) value = totalAmount;
  //   }

  //   setDiscountAmount(value);
  // };

  const [newRoomId, setNewRoomId] = useState(null);
  const handleNewRoomSelection = (roomId) => {
    setNewRoomId(roomId);
  };

  
  const handleRoomChange = async (e) => {
    const currentRoomId = checkinDetails?.[0]?.room_number?.id;
    const data = {
      billing_id: billingDetails.id,
      new_room_id: newRoomId,
      current_room_id: currentRoomId,
    }
    
    try{
      const response = await postRoomShiftingApi(data, tenant);
      if(response.success){
        setRoomShiftTrigger((prev) => !prev); 
        setShouldUIUpdate(true);
      }
    } catch (error) {

      console.error("Error submitting room shifting details: ", error);
    }
  };

  const handleCombinedClick = (e) => {
    handleSubmit(e, false);
    handleCancelCheckinClick();
  };


  const handleSubmit = async (e, showPopup = true) => {
    e.preventDefault();
    if (showPopup) {
      setIsPopupCheckoutVisible(true);
    }

    const isRefundableCheckout = billingDetails?.is_Refundable === "Yes";
  
    // Added by akanksha on 1-03-2025
    // Reason : to set the partial and comlete checkout valuue 
    const isPartialPayments = Number(totalPaid) < Number(grandTotal) && !isRefundableCheckout;
    const isCompleteCheckout = Number(totalPaid) === Number(grandTotal) || isRefundableCheckout   ;
    // End by akanksha on 1-03-2025
    // Reason : to set the partial and comlete checkout valuue 

    // Check if totalPaid is less than grandTotal
    if (Number(totalPaid) < Number(grandTotal)) {
      // notificationObject.success("Partially checkout is submitted successfully!");
      if (!isFirstPartialCheckout) {
        setIsFirstPartialCheckout(true);
      }
    }
    const access = localStorage.getItem("access");
    
    const data = {
      billing_detail_id: billingDetails.id,
      room_charges: previousRoomCharge,
      // room_charges: partialTrue ? billingDetails.room_charges : roomCharges,

      new_room_charges: partialTrue ? billingDetails.new_room_charges : newRoomPrice,
      
      additional_charges: extraAmount,
      additional_reason: message,
      discount_in: discountIn,
      // discount_amount: discountIn === "Discount in (₹)" ? discountAmount : 0,
      discount_rupees: discountAmount,
      
      // discount_percentage:
      //   discountIn === "Discount in (%)" ? discountAmount : 0,
      extra_person_charges: extraPersonCharge,
      taxable_amount: taxableAmount,
      // total_days: totalDays,
      gst_value: gstValue,
      gst: gst,
      total: total,
      sub_total: subTotal,
      miscellaneous_charges: miscellaneousCharges,
      details: miscellaneousDetails,
      extraDetails: extraDetails,
      extra_discount: extraDiscount,
      grand_total: grandTotal,
      // latest_check_out_date: latestCheckOutDate,
      payment_method: paymentMethod,
      //  Code Modification by Tejasve Gupta on 15-08-2024
      //  Reason - update checkout date in checkin details on checkout post
      // departure_date: latestCheckOutDate,
      // departure_time: latestCheckOutTime,
      
      //  End of Code Modification by Tejasve Gupta on 15-08-2024
      //  Reason - update checkout date in checkin details on checkout post
      isPartialPaymentConfirmed: Number(totalPaid) < Number(grandTotal)
    };
    console.log(data);
    console.log("newRoomPrice", newRoomPrice);
    console.log("newRoomCharge", newRoomCharge);
    // Added by akanksha on 01-03-2025
    // Reason : to show correct number of days after partial checkout
    if (isCompleteCheckout) {
      // Use existing departure details if available; otherwise, fallback to latest values
      data.departure_date = billingDetails.departure_date || latestCheckOutDate;
      data.departure_time = billingDetails.departure_time || latestCheckOutTime;
      data.latest_check_out_date = latestCheckOutDate; // if needed for tracking purposes
    } else if (isPartialPayments) {
      // For partial payments, use existing values if present, or the latest if not
      data.departure_date = billingDetails.departure_date || latestCheckOutDate;
      data.departure_time = billingDetails.departure_time || latestCheckOutTime;
    }

    // Added by akanksha on 01-03-2025
    // Reason : to show correct number of days after partial checkout
  


    try {
      const response = await postCheckOutDetailsApi(access, data, tenant);
      // if (response.success) 
      // if (response.success && !isPartialPayment)
      // {
        // notificationObject.success(response.success);
        // setMiscellaneousCharges(0);
        // setExtraDiscount('')    
        /**
         * Modified by - Ashish Dewangan on 09-09-2024
         * Reason - To navigate to checkout page
         */
        // navigate("/checkinList");
        // navigate("/checkout-list");
        /**
         * End of modification by - Ashish Dewangan on 09-09-2024
         * Reason - To navigate to checkout page
         */
      // }
    
      if (response.success) {
        setIsPopupCheckoutVisible(false);
        if (!isPartial && Number(totalPaid) >= Number(grandTotal)) {
          setPartialPaymentReason(""); 
          localStorage.removeItem(`partialPaymentReason_${billingDetails.id}`); 
        }
      
        if (!isPartialPayment && Number(totalPaid) >= Number(grandTotal)) {
          setPartialPaymentReason(""); 
          // notificationObject.success(response.success);
        }
        navigate("/checkout-list"); // Always navigate to checkout list
      }
    } catch (error) {
      console.error("Error submitting checkout data: ", error);
    }
    
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    if (paymentAmount <= 0) {
      setErrorMessage("Please enter an amount");
      return;
    }
    const total = Number(grandTotal)-Number(totalPaid);
    const payment = Number(paymentAmount);
    const isPartialPayment = payment < total;

    if (isPartialPayment && !partialPaymentConfirmed) {
        setErrorMessage("Please confirm partial payment by checking the box.");
        return;
    }
    setIsPartial(isPartialPayment);

    if (payment === total) {
        setPartialPaymentConfirmed(false);
    }


    const access = localStorage.getItem("access");
    // const data = {
    //   extra_discount: extraDiscount,
    //   miscellaneous_charges : miscellaneousCharges,
    //   details: miscellaneousDetails,
    //   extraDetails: extraDetails,
    //   billing_id: billingDetails.id,
    //   payment_method: paymentMethod,
    //   amount_paid: paymentAmount,
    //   total_amount: grandTotal,
    //   person_salutation: billingDetails.customer_salutation,
    //   transaction_id: transactionId,
    //   payment_proof: paymentProof,
    //   person_name: `${personalDetails.name || ""} ${
    //     personalDetails.last_name || ""
    //   }`.trim(),
      
    //   room_charges: roomCharges,
    //   room_numbers: roomNumbersList,
      
    // };

    const data = new FormData(); // Use FormData to send files
    if (paymentProof) {
      data.append("payment_proof", paymentProof);  // Append file from state
      for (let pair of data.entries()) {
      }
    } else {
    }
    data.append("extra_discount", extraDiscount);
    data.append("miscellaneous_charges", miscellaneousCharges);
    data.append("details", miscellaneousDetails);
    data.append("extraDetails", extraDetails);
    data.append("billing_id", billingDetails.id);
    data.append("payment_method", paymentMethod);
    data.append("amount_paid", paymentAmount);
    data.append("partial_reason", partialPaymentReason);
    data.append("total_amount", grandTotal);
    data.append("person_salutation", billingDetails.customer_salutation);
    data.append("transaction_id", transactionId);
    // data.append("payment_proof", paymentProof); // Ensure paymentProof is a File object
    data.append("person_name", `${personalDetails.name || ""} ${personalDetails.last_name || ""}`.trim());
    data.append("room_charges", roomCharges);
    data.append("room_numbers", roomNumbersList);
    data.append("is_partial", isPartial);
  
    /**
       * Added by - Ashish Dewangan on 16-11-2024
       * Reason - To submit extra_discount and miscellaneout charges when payment receipt is submitted
       */
    
      /**
       * End of addition by - Ashish Dewangan on 16-11-2024
       * Reason - To submit extra_discount and miscellaneout charges when payment receipt is submitted
       */
      /* Addition by akanksha on 11th Oct 
      Reason to send salutation details */
    
      /* End of Addition by akanksha on 11th Oct 
      Reason to send salutation details */
    /**
       * Added by - Ashish Dewangan on 30-09-2024
       * Reason - To store room numbers and room charges in payment receipt
       */
    /**
       * End of addition by - Ashish Dewangan on 30-09-2024
       * Reason - To store room numbers and room charges in payment receipt
       */

      /**
       * Added by - Om Shrivastava on 13-10-2024
       * Reason - To store refundable amount
       */
      // is_Refundable: isRefundable,
      // refund_amount: refundableAmount,
      /**
       * End of addition by - Om Shrivastava on 13-10-2024
       * Reason - To store refundable amount
       */

    try {
      const response = await postPaymentReceiptApi(access, data, tenant);

      setIsPrModalVisible(true);
      setPaymentReceiptData(response.data);
      /**
       * Added by - Ashish Dewangan on 31-08-2024
       * Reason - To set latest payment receipt data
       */
      setParticularPaymentReceipt(response.latest_payment_receipt);
      /**
       * End of addition by - Ashish Dewangan on 31-08-2024
       * Reason - To set latest payment receipt data
       */
      if (response.success) {
        /**
         * Modified by - Ashish Dewagnan on 09-09-2024
         * Reason - To show payment done message
         */
        // notificationObject.success(response.success);
        notificationObject.success(response.message);
        /**
         * End of modification by - Ashish Dewagnan on 09-09-2024
         * Reason - To show payment done message
         */
        setPaymentAmount(0);
        // Addition by Om Shrivastava on 13-10-2024
        // Reason : Create useState for refundable amount
        setRefundableAmount(0.0);
        // End of addition by Om Shrivastava on 13-10-2024
        // Reason : Create useState for refundable amount
        setErrorMessage("");
        // setMiscellaneousCharges(0);
        // setExtraDiscount(0);
        // setPartialPaymentConfirmed(false); 
        // if (!isPartial && Number(totalPaid) >= Number(grandTotal)) {
        //   setPartialPaymentReason(""); 
        //   localStorage.removeItem("partialPaymentReason"); // Clear storage when fully paid
        // }
        setPartialPaymentConfirmed(false);
        setIsPartial(false); 
        
        
      }
    } catch (error) {
      console.error("Error submitting payment receipt data: ", error);
    }

  };
  const handlePrCloseModal = () => {
    setIsPrModalVisible(false); // Close the modal on OK click
  };

  const handleFormCClick = () => {
    const id = location?.state?.id;
    navigate("/formC", { state: { id: id } });
  };

  // const handleRefund = async (e) => {
  //   e.preventDefault();
  //   const access = localStorage.getItem("access");
  //   const isRefundable = updatedRefundAmount > 0 ? "Yes" : "No";
  //   const data = {
  //     billing_id: billingDetails.id,
  //     is_cancelled: false,
  //     refund_amount: updatedRefundAmount,
  //     is_refundable: isRefundable,
  //   };
  //   try {
  //     const response = await patchCancelCheckinApi(access, data);
  //     if (response.success) {
  //       // notificationObject.success(response.success);
  //       notificationObject.success("Refund Initiated Successfully!");
  //       setIsRefundModalVisible(false);
  //     }
      
  //   } catch (error) {
  //     console.error("Error submitting payment receipt data: ", error);
  //   }
  // }

  // const handleRefund = async (e) => {
  //   e.preventDefault();
  //   const access = localStorage.getItem("access");
  
  //   const remainingAmount = grandTotal - totalPaid; // Overpaid amount (e.g., -800)
  //   const isRefundable = updatedRefundAmount > 0 ? "Yes" : "No";
  
  //   const data = {
  //     billing_id: billingDetails.id,
  //     is_cancelled: false,
  //     refund_amount: updatedRefundAmount,
  //     is_refundable: isRefundable,
  //   };
  
  //   try {
  //     const response = await patchRefundCheckinApi(access, data);
  //     if (response.success) {
  //       notificationObject.success("Refund Initiated Successfully!");
  //       setTotalPaid((prevTotalPaid) => prevTotalPaid - updatedRefundAmount);
  //       if (Math.abs(remainingAmount) === updatedRefundAmount) {
  //         setTotalPaid(grandTotal); 
  //       }
  //       setIsRefundModalVisible(false);
  //     }
  //   } catch (error) {
  //     console.error("Error submitting refund data: ", error);
  //     notificationObject.error("Refund Failed! Please try again.");
  //   }
  // };

  
// Added by akanksha on 07-02-2025
// Reason to store refund amount in the backend

  // const handleRefund = async (e) => {
  //   e.preventDefault();
  //   const access = localStorage.getItem("access");

  //   const remainingAmount = grandTotal - totalPaid; // Actual overpaid amount
  //   const refundableAmount = Math.max(0, Math.abs(remainingAmount)); 

  //   // Ensure refund does not exceed refundable amount
  //   const actualRefundAmount = Math.min(updatedRefundAmount, refundableAmount);

  //   if (actualRefundAmount <= 0) {
  //       notificationObject.warning("No valid refund amount to process!");
  //       return;
  //   }

  //   const data = {
  //       billing_id: billingDetails.id,
  //       is_cancelled: false,
  //       refund_amount: actualRefundAmount,
  //       is_refundable: actualRefundAmount > 0 ? "Yes" : "No",
  //   };

  //   try {
  //       const response = await patchRefundCheckinApi(access, data);
  //       if (response.success) {
  //           notificationObject.success("Refund Initiated Successfully!");

  //           // Instead of modifying totalPaid, update the separate state
  //           setRemainingRefundable((prev) => prev - actualRefundAmount);

  //           setIsRefundModalVisible(false);
  //       }
  //   } catch (error) {
  //       console.error("Error submitting refund data: ", error);
  //       notificationObject.error("Refund Failed! Please try again.");
  //   }
  // };

  // const handleRefund = async (e) => {
  //   e.preventDefault();
  //   const access = localStorage.getItem("access");

  //   const remainingAmount = grandTotal - totalPaid; // Actual overpaid amount
  //   const refundableAmount = Math.max(0, Math.abs(remainingAmount)); 

  //   // Ensure refund does not exceed refundable amount
  //   const actualRefundAmount = Math.min(updatedRefundAmount, refundableAmount);

  //   if (actualRefundAmount <= 0) {
  //       notificationObject.warning("No valid refund amount to process!");
  //       return;
  //   }

  //   const data = {
  //       billing_id: billingDetails.id,
  //       is_cancelled: false,
  //       refund_amount: actualRefundAmount,
  //       is_refundable: actualRefundAmount > 0 ? "Yes" : "No",
  //   };

  //   try {
  //       const response = await patchRefundCheckinApi(access, data);
  //       if (response.success) {
  //           notificationObject.success("Refund Initiated Successfully!");

  //           // Update state to reflect that refund has been processed
  //           setIsRefunded(true);
  //           setRemainingRefundable(0); // Reset remaining refundable amount

  //           setIsRefundModalVisible(false);
  //       }
  //   } catch (error) {
  //       console.error("Error submitting refund data: ", error);
  //       notificationObject.error("Refund Failed! Please try again.");
  //   }
  // };
  // const handleRefund = async (e) => {
  //   e.preventDefault();
  //   const access = localStorage.getItem("access");

  //   const remainingAmount = grandTotal - totalPaid; // Actual overpaid amount
  //   const refundableAmount = Math.max(0, Math.abs(remainingAmount)); 

  //   // Ensure refund does not exceed refundable amount
  //   const actualRefundAmount = Math.min(updatedRefundAmount, refundableAmount);

  //   if (actualRefundAmount <= 0) {
  //       notificationObject.warning("No valid refund amount to process!");
  //       return;
  //   }

  //   const data = {
  //       billing_id: billingDetails.id,
  //       is_cancelled: false,
  //       refund_amount: actualRefundAmount,
  //       is_refundable: actualRefundAmount > 0 ? "Yes" : "No",
  //   };

  //   try {
  //       const response = await patchRefundCheckinApi(access, data);
  //       if (response.success) {
  //           notificationObject.success("Refund Initiated Successfully!");

  //           // Update state to reflect that refund has been processed
  //           setIsRefunded(true);
  //           localStorage.setItem("isRefunded", "true"); // Persist refund status

  //           setIsRefundModalVisible(false);
  //       }
  //   } catch (error) {
  //       console.error("Error submitting refund data: ", error);
  //       notificationObject.error("Refund Failed! Please try again.");
  //   }
  // };
  // const handleRefund = async (e) => {
  //   e.preventDefault();
  //   const access = localStorage.getItem("access");

  //   const remainingAmount = grandTotal - totalPaid; // Actual overpaid amount
  //   const refundableAmount = Math.max(0, Math.abs(remainingAmount)); 

  //   // Ensure refund does not exceed refundable amount
  //   const actualRefundAmount = Math.min(updatedRefundAmount, refundableAmount);

  //   if (actualRefundAmount <= 0) {
  //       notificationObject.warning("No valid refund amount to process!");
  //       return;
  //   }

  //   const data = {
  //       billing_id: billingDetails.id,
  //       is_cancelled: false,
  //       refund_amount: actualRefundAmount,
  //       is_refundable: actualRefundAmount > 0 ? "Yes" : "No",
  //   };

  //   try {
  //       const response = await patchRefundCheckinApi(access, data);
  //       if (response.success) {
  //           notificationObject.success("Refund Initiated Successfully!");

  //           // Update state to reflect that refund has been processed
  //           setIsRefunded(true);
  //           localStorage.setItem(`isRefunded_${billingId}`, "true"); // Persist refund status with billing ID

  //           setIsRefundModalVisible(false);
  //       }
  //   } catch (error) {
  //       console.error("Error submitting refund data: ", error);
  //       notificationObject.error("Refund Failed! Please try again.");
  //   }
  // };
  const handleRefund = async (e) => {
    e.preventDefault();
    const access = localStorage.getItem("access");

    const remainingAmount = grandTotal - totalPaid; // Actual overpaid amount
    const refundableAmount = Math.max(0, Math.abs(remainingAmount)); 

    // Ensure refund does not exceed refundable amount
    const actualRefundAmount = Math.min(updatedRefundAmount, refundableAmount);

    // Check if the actual refund amount is equal to the total payable amount
    if (actualRefundAmount <= 0) {
        notificationObject.error("No valid refund amount to process!");
        return;
    }

    // Check if the refund amount is equal to the total payable amount
    if (actualRefundAmount !== refundableAmount) {
        notificationObject.error(`You can only refund the total payable amount of ₹${refundableAmount}.`);
        return;
    }

    const data = {
        billing_id: billingDetails.id,
        is_cancelled: false,
        refund_amount: actualRefundAmount,
        is_refundable: actualRefundAmount > 0 ? "Yes" : "No",
    };

    try {
        const response = await patchRefundCheckinApi(access, data, tenant);
        if (response.success) {
            notificationObject.success("Refund Initiated Successfully!");

            // Update state to reflect that refund has been processed
            setIsRefunded(true);
            localStorage.setItem(`isRefunded_${billingId}`, "true"); // Persist refund status with billing ID

            setIsRefundModalVisible(false);
        }
    } catch (error) {
        console.error("Error submitting refund data: ", error);
        notificationObject.error("Refund Failed! Please try again.");
    }
  };
// Added by akanksha on 07-02-2025
// Reason to store refund amount in the backend


  
  
  /**Code Addition by Tejasve Gupta on 30-08-2024
   * Reason - Checkin Cancelation
   */
  const handleCancelCheckinOk = async (e) => {
    e.preventDefault();
    const access = localStorage.getItem("access");
    // Addition by Om Shrivastava on 14-10-2024
    // Reason : Set the refundable field and amount
    const isRefundable = updatedRefundAmount > 0 ? "Yes" : "No";
    // End of addition by Om Shrivastava on 14-10-2024
    // Reason : Set the refundable field and amount
    const data = {
      billing_id: billingDetails.id,
      is_cancelled: true,
      refund_amount: updatedRefundAmount,
      // Addition by Om Shrivastava on 14-10-2024
      // Reason : Set the refundable field and amount
      is_refundable: isRefundable,
      // Addition by Om Shrivastava on 14-10-2024
      // Reason : Set the refundable field and amount
    };
    try {
      const response = await patchCancelCheckinApi(access, data, tenant);
      if (response.success) {
        handleSubmit(e);
        notificationObject.success(response.success);
        setIsCancelModalVisible(false);
      }
      /**
       * Added by - Ashish Dewangan on 01-09-2024
       * Reason - To redirect to checkin list on cancel
       */
      // navigate("/checkinList");
      navigate("/checkout-list");
      /**
       * End of addition by - Ashish Dewangan on 01-09-2024
       * Reason - To redirect to checkin list on cancel
       */
    } catch (error) {
      console.error("Error submitting payment receipt data: ", error);
    }
  };

  const handleCancelCheckinClick = () => {
    setIsCancelModalVisible(true);
  };
  
  const handleCancelCheckinCancel = () => {
    setIsCancelModalVisible(false); 
  };


  /**End of Code Addition by Tejasve Gupta on 30-08-2024
   * Reason - Checkin Cancelation
   */

  // Added by Akanksha on 04-02-2025
  // to show refund amount modal
  const handleRefundClick = () => {
    setIsRefundModalVisible(true);
  };
  const handleRefundCancel = () => {
    setIsRefundModalVisible(false);
  }
  // End by Akanksha on 04-02-2025
  // to show refund amount modal


  // Code Addition by Tejasve Gupta on 17-07-2024
  // Reason - Creation of FormC for police enquire

  const showModal = (imageUrl) => {
    setSelectedImage(imageUrl); // Set the selected image URL
    setIsModalVisible(true); // Show the modal
  };

  const handleCloseModal = () => {
    setIsModalVisible(false); // Close the modal on OK click
  };

  const handleCancel = () => {
    setIsModalVisible(false); // Close the modal on Cancel click
  };
  // const handlePrint = () => {
  //   const printWindow = window.open("", "_blank");
  //   printWindow.document.write(`
  //     <html>
  //       <body onload="window.print(); window.close();">
  //         <img src="${baseURL}${selectedImage}" style="max-width: 100%;"/>
  //       </body>
  //     </html>
  //   `);
  //   printWindow.document.close();
  // };

  const handlePrint = () => {
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
  
  // Added by akanksha on 25th Oct 2024, Reason to open popup of C Form
  const [isFormCVisible, setIsFormCVisible] = useState(false);

  const showFormCModal = () => {
    setIsFormCVisible(true);
  };

  const handleFormCClose = () => {
    setIsFormCVisible(false);
  };
  // End by akanksha on 25th Oct 2024, Reason to open popup of C Form
  
  const [isMoveRoomModalVisible, setIsMoveRoomModalVisible] = useState(false);
  const showMoveRoomModal = () => {
    setIsMoveRoomModalVisible(true);
  }

  const handlecloseMoveRoomModal = () => {
    setIsMoveRoomModalVisible(false);
  }

  const handleOkay = () => {
    setIsMoveRoomModalVisible(false);
    handleRoomChange();
  }


  const update_refund_amount = (e) => {
    setUpdatedRefundAmount(e.target.value);
  };

  const stayDuration = (() => {
    if (!checkinDetails || checkinDetails.length === 0) return "0 Days";
  
    const arrivalDateTimeString = `${checkinDetails[0].arrival_date}T${checkinDetails[0].arrival_time}`;
    const arrivalDate = new Date(arrivalDateTimeString);
  
    // let endDate = new Date(); // Default to current time if departure_date is not available
  
    // if (checkinDetails[0]?.departure_date) {
    //   const departureDate = checkinDetails[0].departure_date;
    //   const departureTime = checkinDetails[0].departure_time || "00:00:00"; // Default to start of the day if time is missing
    //   const departureDateTime = `${departureDate}T${departureTime}`;
    //   endDate = new Date(departureDateTime);
    // }

    // Get the last check-in record
    const lastCheckin = checkinDetails[checkinDetails.length - 1];

    // Use last check-in departure date/time if available, otherwise fallback to current time
    let endDate = new Date();
    if (lastCheckin?.departure_date) {
        const departureDate = lastCheckin.departure_date;
        const departureTime = lastCheckin.departure_time || "00:00:00"; 
        const departureDateTime = `${departureDate}T${departureTime}`;
        endDate = new Date(departureDateTime);
    }
  
    const differenceInDays = Math.ceil((endDate - arrivalDate) / (1000 * 60 * 60 * 24));
    
    return `${differenceInDays > 0 ? differenceInDays : 0} ${differenceInDays === 1 ? "Day" : "Days"}`;
  })();

  const calculateGrandTotal = () => {
    let total = grandTotal;

    if (roomShiftedFlag && newRoomDetail) {
        if (!checkinDetails || checkinDetails.length === 0) return total;
        const arrivalDateTime = new Date(`${checkinDetails[0].arrival_date}T${checkinDetails[0].arrival_time.split(".")[0]}`);
        const shiftDateTime = new Date(shiftedDate);
        let departureDateTime = new Date();
        if (checkinDetails[0].departure_date) {
            departureDateTime = new Date(`${checkinDetails[0].departure_date}T${checkinDetails[0].departure_time || "00:00:00"}`);
        }
        let previousRoomDays = totalDays;
        let remainingDays = Math.max(1, Math.ceil((departureDateTime - shiftDateTime) / (1000 * 60 * 60 * 24)));
        const previousRoomCost = roomCharges;
        const newRoomCost = remainingDays * newRoomCharge;
        total = previousRoomCost + newRoomCost;
    }

    return Math.round(total * 100) / 100; 
  };





  const [calculatedTotal, setCalculatedTotal] = useState(grandTotal);

  useEffect(() => {
    if (roomShiftedFlag) {
      setCalculatedTotal(calculateGrandTotal());
    } else {
      setCalculatedTotal(grandTotal);
    }
  }, [roomShiftedFlag, newRoomDetail, shiftedDate, grandTotal]); 

  let message = "";

  if (difference > 0) {
    message = `You need to pay an extra ₹${extraAmount}.`;
  } else if (difference < 0) {
    message = `You saved ₹${extraAmount} by switching to a cheaper room.`;
  } else {
    message = `You don't need to pay any amount.`;
  }


  
  
  
  return (
    <div className={styles.parentContainer}>
      <div className={styles.header}>{/* Modification and addition by Om Shrivastava on 03-01-2025
            Reason : Add back icon  */}
              <FiArrowLeft className="backIcon" onClick={handleBackClick} />
              Check-in Details
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
      {loading ? (
              <Grid container justifyContent="center" alignItems="center">
                <CircularProgress />
              </Grid>
            ) : (<>
      {roomCharges ? (
        <>
          <div className={styles.formContainer}>
            <div className={styles.subContainer1}>
              <div className={styles.rightContainer}>
                <legend className={styles.legend}>Staying Details</legend>
                <div className={styles.pair}>
                  <label className={styles.label}>Check In Staff</label>
                  <div className={styles.colon}>:</div>
                  <div>{billingDetails?.user_email_at_checkin}</div>
                </div>
                <div className={styles.pair}>
                  <label className={styles.label}>Check In Date</label>
                  <div className={styles.colon}>:</div>
                  <div>
                    {checkinDetails[0]?.arrival_date
                      ?.split("-")
                      .reverse()
                      .join("-")}
                    <span> | </span>
                    {new Date(
                      `1970-01-01T${checkinDetails[0]?.arrival_time}`
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </div>
                </div>
                <div className={styles.pair}>
                  <label className={styles.label}>Check Out Date</label>
                  <div className={styles.colon}>:</div>
                  <div
                    className={styles.inputContainer}
                    style={{ display: "flex", flexDirection: "column" }}
                  >
                    {/* <input
                      type="date"
                      className={`${styles.input} ${styles.inputWidth} ${styles.inputDisabled}`}
                     
                      value={latestCheckOutDate}
                      onChange={(e) => serrrtLatestCheckOutDate(e.target.value)}
                      disabled={true}
                    /> */}
                    <input
                      type="date"
                      className={`${styles.input} ${styles.inputWidth} ${styles.inputDisabled}`}
                      // value={
                      //   checkinDetails[0]?.departure_date
                      //     ? checkinDetails[0].departure_date
                      //     : latestCheckOutDate
                      // }
                      value={
                        checkinDetails.length > 0 &&
                        checkinDetails[checkinDetails.length - 1]?.departure_date
                          ? checkinDetails[checkinDetails.length - 1].departure_date
                          : latestCheckOutDate
                      }
                      disabled={true}
                    />
                    {/* <input
                      type="time"
                      className={`${styles.input} ${styles.inputWidth} ${styles.inputDisabled}`}
                      
                      value={latestCheckOutTime}
                      onChange={(e) => setLatestCheckOutTime(e.target.value)}
                      disabled={true}
                      style={{ marginTop: "1%" }}
                    /> */}
                    <input
                      type="time"
                      className={`${styles.input} ${styles.inputWidth} ${styles.inputDisabled}`}
                      // value={
                      //   checkinDetails[0]?.departure_time
                      //     ? checkinDetails[0].departure_time
                      //     : latestCheckOutTime
                      // }
                      value={
                        checkinDetails.length > 0 &&
                        checkinDetails[checkinDetails.length - 1]?.departure_time
                          ? checkinDetails[checkinDetails.length - 1].departure_time
                          : latestCheckOutTime
                      }
                      disabled={true}
                      style={{ marginTop: "1%" }}
                    />
                  </div>
                </div>
                <div className={styles.pair}>
                  <div className={styles.label}>Number of Days</div>
                  <div className={styles.colon}>:</div>
                  <div className={styles.inputContainer}>
                  <input
                    disabled
                    className={`${styles.inputDisabled} ${styles.inputWidth}`}
                    value={stayDuration}
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
                      value={billingDetails?.booking_type}
                    />
                  </div>
                </div>
                
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

                {/* <div className={styles.pair}>
                  <label className={styles.label}>Room Charges</label>
                  <div className={styles.colon}>:</div>
                  <div className={styles.value}>₹{roomCharges}</div>
                </div> */}
               
                <div className={styles.pair}>
                    <label className={styles.label}>
                      {roomShiftedFlag ? "Old Room Charges" : "Room Charges"}
                    </label>
                    <div className={styles.colon}>:</div>
                    {/* <div className={styles.value}>₹{calculateRoomCharges(checkinDetails)}</div> */}
                    <div className={styles.value}>
                      ₹
                      {partialTrue && billingDetails?.room_charges
                        ? billingDetails.room_charges
                        : calculateRoomCharges(checkinDetails)}
                    </div>
                  
                </div>

                {/* New Room Charges (Only visible when roomShiftedFlag is true) */}
                {roomShiftedFlag && (
                  <div className={styles.pair}>
                    <label className={styles.label}>New Room Charges</label>
                    <div className={styles.colon}>:</div>
                    {/* <div className={styles.value}>₹{calculateNewRoomCharges(newCheckinDetails)}</div> */}
                    <div className={styles.value}>
                      ₹
                      {partialTrue && billingDetails?.new_room_charges
                        ? billingDetails.new_room_charges
                        : calculateNewRoomCharges(newCheckinDetails)}
                    </div>


                  </div>
                )}
                
                


                <div className={styles.pair}>
                  {/* Modification and addition by Om Shrivastava on 15-10-2024 
                    Reason : Change the name  */}
                  {/* <label>Extra Person Charges</label> */}
                  <label className={styles.label}>Extra Bed Charges</label>
                  {/* End of modification and addition by Om Shrivastava on 15-10-2024 
                    Reason : Change the name  */}
                  {/* Code Commented and modification By Tejasve Gupta on 08-07-2024
                  Reason - Style changed for Showing Extra Charges */}
                  <div className={styles.colon}>:</div>
                  <div className={styles.value}>
                    ₹{extraPersonCharge?.toFixed(2)}
                  </div>
                </div>
                <div className={styles.pair}>
                  <label className={styles.label}>
                    Sub-Total<span> for {totalStayDays} Day(s)</span>
                  </label>
                  <div className={styles.colon}>:</div>
                  <div className={styles.value}>₹{subTotal}</div>
                </div>
                


                {
                  roomShiftedFlag && (
                    <div className={styles.pair}>
                      <label className={styles.label}>
                        {/* New Room Additional Charges<span> for {newRoomDays} Day(s)</span> */}
                        New Room Additional Charges
                      </label>
                      <div className={styles.colon}>:</div>
                      <div className={styles.value}>
                        {/* ₹{extraAmount} ({difference >= 0 
                        ? `You need to pay an extra ₹${extraAmount}.` 
                        : `You saved ₹${extraAmount} by switching to a cheaper room.`}) */}
                        ₹{extraAmount}{" "}
                        ({difference > 0
                          ? `You need to pay an extra ₹${extraAmount}.`
                          : difference < 0
                          ? `You saved ₹${extraAmount} by switching to a cheaper room.`
                          : `You don't need to pay any amount.`})
                      </div>
                    </div>
                  )
                }

                {/* Added by - Ashish Dewangan on 01-09-2024
                Reason - To show discount applied in label */}
                {discountAmount > 0 && (
                  <div className={styles.pair}>
                    <label className={styles.label}>Discount Applied In</label>
                    <div className={styles.colon}>:</div>
                    <div className={styles.value}>{discountIn}</div>
                  </div>
                )}

                {/* End of addition by - Ashish Dewangan on 01-09-2024
                Reason - To show discount applied in label */}

                <div className={styles.pair}>
                  <label className={styles.label}>
                    Discount {discountPercentage}%
                  </label>
                  <div className={styles.colon}>:</div>
                  <div className={styles.value}>
                    ₹{discountAmount?.toFixed(2)}
                    {/* <input
                  type="number"
                  value={discountAmount}
                  onChange={handleDiscountAmountChange}
                  className={styles.discountInput}
                  min="0"
                  readOnly
                />
                {discountIn === "Discount in (%)" && (
                  <span className={styles.percentage}>%</span>
                )} */}
                  </div>
                </div>
                <div className={styles.pair}>
                  <label className={styles.label}>Taxable Amount</label>
                  <div className={styles.colon}>:</div>
                  <div className={styles.value}>₹{taxableAmount}</div>
                </div>
                <div className={styles.pair}>
                  <label className={styles.label}>GST {gst}%</label>
                  <div className={styles.colon}>:</div>
                  <div className={styles.value}>₹{gstValue}</div>
                </div>
                <div className={styles.pair}>
                  <label className={styles.label}>Total Amount</label>
                  <div className={styles.colon}>:</div>
                  <div className={styles.value}>₹{total}</div>
                </div>
                <div className={styles.pair}>
                  {/* <label className={styles.label}>Miscellaneous(₹)</label> */}
                  <div className={styles.label}>Miscellaneous(₹)</div>
                  <div className={styles.colon}>:</div>
                  <div className={styles.inputContainer}>
                    <input
                      type="number"
                      className={`${styles.input} ${styles.inputWidth}`}
                      value={miscellaneousCharges}
                      onChange={(e) =>
                        setMiscellaneousCharges(Number(e.target.value))
                      }
                      disabled={partialTrue}
                    />

                    {/* <input
                      style={{ marginLeft: '12px' }}
                      type="text"
                      className={`${styles.input} ${styles.inputWidth} ${styles.placeHolderSize}`}
                      value={miscellaneousDetails}
                      onChange={(e) => setMiscellaneousDetails(e.target.value)}
                      title="Provide additional details or comments here"
                      placeholder="Provide additional details here"
                    /> */}
                    {miscellaneousCharges > 0 && (
                      <input
                        style={{ marginLeft: "12px" }}
                        type="text"
                        className={`${styles.input} ${styles.inputWidth} ${styles.placeHolderSize}`}
                        value={miscellaneousDetails}
                        onChange={(e) => setMiscellaneousDetails(e.target.value)}
                        title="Provide additional details or comments here"
                        placeholder="Provide additional details here"
                      />
                    )}
                  </div>
                </div>
                <div className={styles.pair}>
                  {/* <label className={styles.label}>Extra Discount (₹)</label> */}
                  <div className={styles.label}>Extra Discount (₹)</div>
                  <div className={styles.colon}>:</div>
                  <div className={styles.inputContainer}>
                    <input
                      type="number"
                      className={`${styles.input} ${styles.inputWidth}`}
                      value={extraDiscount}
                      onChange={(e) => setExtraDiscount(Number(e.target.value))}
                      disabled={partialTrue}
                    />
                    { extraDiscount > 0 && (
                      <input
                        style={{ marginLeft: '12px' }}
                        type="text"
                        className={`${styles.input} ${styles.inputWidth} ${styles.placeHolderSize}`}
                        value={extraDetails}
                        onChange={(e) => setExtraDetails(e.target.value)}
                        title="Add additional details here"
                        placeholder="Provide additional details here"
                      />
                    )}
                  </div>
                  {/* <input
                    type="number"
                    style={{
                      borderRadius: "5px",
                      padding: "5px",
                      width: "18%",
                    }}
                    value={extraDiscount}
                    onChange={(e) => setExtraDiscount(Number(e.target.value))}
                  /> */}
                </div>
                <div className={styles.pair}>
                  <label className={styles.label}>Grand Total (₹)</label>
                  <div className={styles.colon}>:</div>
                  <span className={styles.value}>
                  	{grandTotal}
                    {/* {calculatedTotal} */}
                    {/* ₹{roomShiftedFlag ? calculateGrandTotal() : grandTotal} */}
                    
                  </span>
                </div>

                <div className={styles.pair}>
                  <label className={styles.label}>Advance Paid</label>
                  <div className={styles.colon}>:</div>
                  <div className={styles.value}>₹{advancePayAmount}</div>
                </div>
                <div className={styles.pair}>
                  <label className={styles.label}>Total Paid</label>
                  <div className={styles.colon}>:</div>
                  <div className={styles.value}>₹{totalPaid}</div>
                </div>
                <div className={styles.pair}>
                  <label className={styles.label} style={{fontWeight: "bold"}}>Total payable amount (₹)</label>
                  <div className={styles.colon}>:</div>
                  <span className={styles.value}>
                      ₹{Math.max(0, grandTotal - totalPaid)}
                  </span>
                </div>
                <div className={styles.pair}>
                  <label className={styles.label}>Total refundable amount (₹)</label>
                  <div className={styles.colon}>:</div>
                  <span className={styles.value}>
                      {/* Show the total payable amount as negative if not refunded, otherwise show as positive */}
                      ₹{(grandTotal - totalPaid) < 0 ? (isRefunded ? Math.abs(grandTotal - totalPaid) : (grandTotal - totalPaid)) : 0}

                  </span>
                  {/* Show refund button only if not refunded and there is a refundable amount */}
                  {!isRefunded && Math.round(grandTotal - totalPaid) < 0 && (
                      <button className={styles.refundButton} onClick={handleRefundClick}>
                          Refund
                      </button>
                  )}
                </div>

                {/* Addition  by Om Shrivastava on 30-07-2024
                Reason : Align the checkout form page  */}

                {/*End of Code Addition by Om Shrivastava on 30-07-2024
                Reason-Updation in UI  */}

                {/* <form onSubmit={handlePaymentSubmit}> */}
                <form
                  onSubmit={handlePaymentSubmit}
                >
                  <div className={styles.pair}>
                    <div className={styles.label}>Payment Method</div>
                    <div className={styles.colon}>:</div>
                    <div className={styles.inputContainer}>
                      <select
                        /**
                         * Modified by - Ashish Dewangan on 09-09-2024
                         * Reason - To give inputWidth class for commin width for inputs
                         */
                        // className={styles.inputDisabled}
                        className={`${styles.input}  ${styles.inputWidth}`}
                        /**
                         * End of modification by - Ashish Dewangan on 09-09-2024
                         * Reason - To give inputWidth class for commin width for inputs
                         */
                        value={paymentMethod}
                        // onChange={(e) => setPaymentMethod(e.target.value)}
                        onChange={handlePaymentChange}
                      >
                        <option disabled value="Select">
                          Select Payment Method
                        </option>
                        <option value="Cash">Cash</option>
                        <option value="Online">Online</option>
                      </select>
                      
                    </div>
                    {showModals && (
                        <div className={styles.modal}>
                          <div className={styles.modalContent}>
                            
                          <div className={styles.modalHeader}>
                            <h3>Online Payment Details</h3>
                            <button className={styles.closedButton} onClick={() => setShowModals(false)}>
                              &times; {/* This represents the "X" character */}
                            </button>
                          </div>
                            <div className={styles.formGroups}>
                              <label className={styles.formLabels}>Transaction ID:</label>
                              <input
                                type="text"
                                className={styles.formInputsTransactionId}
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value)}
                              />
                            </div>

                            
                            <div className={styles.formGroups}>
                              <label className={styles.formLabels}>Upload Payment Proof:</label>
                              <input type="file" className={styles.formInputs} accept="image/*" onChange={handleFileChange} />
                            </div>

                            <div className={styles.modalbuttons}>
                              <button onClick={() => setShowModals(false)}>Save</button>
                            </div>
                          </div>
                        </div>
                      )}
                    {/* {showModals && (
                      <div className={styles.modals}>
                        <div className={styles.modalContents}>
                          <h3>Enter Payment Details</h3>
                          <label>Transaction ID:</label>
                          <input
                            type="text"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                            className={styles.input}
                          />

                          <label>Upload Payment Proof:</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className={styles.input}
                          />

                          <div className={styles.buttonGroups}>
                            <button onClick={() => setShowModals(false)} className={styles.closeButton}>
                              Close
                            </button>
                          </div>
                        </div>
                      </div>
                    )} */}
                  </div>
                  <div className={styles.pair}>
                    <div className={styles.label}>Amount to Pay</div>
                    <div className={styles.colon}>:</div>
                    <div className={styles.inputContainer}>
                      <input
                        type="number"
                        /**
                         * Modified by - Ashish Dewangan on 09-09-2024
                         * Reason - To give inputWidth class for commin width for inputs
                         */
                        // className={styles.inputDisabled}
                        className={`${styles.input} ${styles.inputWidth}`}
                        /**
                         * End of modification by - Ashish Dewangan on 09-09-2024
                         * Reason - To give inputWidth class for commin width for inputs
                         */
                        /**
                           * Modified by - Ashish Dewangan on 19-09-2024
                           * Reason - To handle decimal points in calculation
                           */
                          // const dueAmount = grandTotal - totalPaid;
                          /**
                           * End of modification by - Ashish Dewangan on 19-09-2024
                           * Reason - To handle decimal points in calculation
                           */
                        value={paymentAmount}
                        // onChange={(e) => {
                          
                        //   const dueAmount = Math.ceil(grandTotal - totalPaid);
                          
                        //   const value = Number(e.target.value);
                        //   setPaymentAmount(
                        //     value > dueAmount ? dueAmount : value
                        //   );
                        // }}
                        onChange={handleAmountChange}
                        onBlur={handleAmountBlur}
                      />
                      {errorMessage && (
                        <div
                          style={{ fontSize: "12px", color: "red" }}
                          className={styles.error}
                        >
                          {errorMessage}
                        </div>
                      )}
                    </div>
                  </div>
                  {partialPaymentConfirmed && (
                    <div className={styles.pair}>
                      <div className={styles.label}>Reason for Partial Payment</div>
                      <div className={styles.colon}>:</div>
                      <div className={styles.inputContainer}>
                        <input
                          type="text"
                          value={partialPaymentReason}
                          className={`${styles.input} ${styles.inputWidth}`}
                          // onChange={(e) => {
                          //   setPartialPaymentReason(e.target.value);
                          //   localStorage.setItem(`partialPaymentReason_${billingDetails.id}`, e.target.value);
                          // }}
                          onChange={handleReasonChange}
                          placeholder="Enter reason for partial payment"/>
                      </div>
                    </div>
                  )}

                  {/* {isPartialPayment && (
                    <div className={styles.partialPaymentContainer}>
                      <input
                        type="checkbox"
                        id="partialPaymentConfirmation"
                        checked={partialPaymentConfirmed}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          setPartialPaymentConfirmed(isChecked);

                          if (isChecked) {
                            // Store original grand total before modifying

                            setOriginalGrandTotal((prev) => prev || grandTotal); 
                            const remainingAmount = Math.max(0, Math.round(grandTotal - totalPaid));
                            setGrandTotal(remainingAmount);
                          } else {
                            // Restore original grand total when unchecked
                            setGrandTotal(originalGrandTotal);
                            setOriginalGrandTotal(null); // Reset original value
                          }
                        }}
                      />
                      <label htmlFor="partialPaymentConfirmation">
                        Are you sure you want to go with partial payment?
                      </label>
                    </div>
                  )} */}
                  {isPartialPayment && (
                    <div className={styles.partialPaymentContainer}>
                      <input
                        type="checkbox"
                        id="partialPaymentConfirmation"
                        checked={partialPaymentConfirmed}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          setPartialPaymentConfirmed(isChecked);
                          setIsPartial(isChecked);
                          // if (isChecked) {
                          //   // Store original grand total before modifying
                          //   setOriginalGrandTotal((prev) => prev || grandTotal); 
                          //   const remainingAmount = Math.max(0, Math.round(grandTotal - totalPaid));
                          //   setGrandTotal(remainingAmount);
                          // } else {
                          //   // Restore original grand total when unchecked
                          //   setGrandTotal(originalGrandTotal);
                          //   setOriginalGrandTotal(null); // Reset original value
                          // }
                        }}
                      />
                      <label htmlFor="partialPaymentConfirmation">
                        Are you sure you want to go with partial payment?
                      </label>
                    </div>
                  )}
                  {/* Conditionally render the reason input if partial payment is confirmed */}
                  




                  {/* Added by - Om Shrivastava on 13-10-2024
                  Reason - To store refundable amount  */}
                  {/* {billingDetails?.booking_type === "Advance" ? (
                    <>
                      <div className={styles.pair}>
                        <div className={styles.label}>Is Refundable</div>
                        <div className={styles.colon}>:</div>
                        <div className={styles.inputContainer}>
                          <select
                            className={`${styles.input}  ${styles.inputWidth}`}
                            value={isRefundable}
                            onChange={(e) => setIsRefundable(e.target.value)}
                          >
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </select>
                        </div>
                      </div>
                      <div className={styles.pair}>
                        <div className={styles.label}>Refundable Amount</div>
                        <div className={styles.colon}>:</div>
                        <div className={styles.inputContainer}>
                          <input
                            type="number"
                            className={`${styles.input} ${styles.inputWidth}`}
                            value={refundableAmount}
                            onChange={(e) =>
                              setRefundableAmount(e.target.value)
                            }
                          />
                        </div>
                      </div>
                    </>
                  ) : null} */}
                  {/* Added by - Om Shrivastava on 13-10-2024
                  Reason - To store refundable amount  */}

                  <div className={styles.buttonContainer}>
                    <button
                      style={{ marginTop: "5%" }}
                      className={`${styles.button} ${styles.buttonSubmit} submitButton`}
                      type="submit"
                      disabled={Number(totalPaid) === Number(grandTotal)}
                    >
                      Submit Payment Receipt
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className={styles.roomDetails}>
              <legend
                className={styles.legend}
                style={{
                  textAlign: "center",
                  fontWeight: "500",
                  fontSize: "16px",
                }}
              >
                Room details
              </legend>
              <table style={{ width: "100%" }} className={styles.table}>
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
                {/* <tbody>
                  {(() => {
                    let sortedCheckinDetails = [...checkinDetails];

                    // If room is shifted, bring the new room to the top
                    if (roomShiftedFlag && roomShiftHistory.length > 0) {
                      const latestShift = roomShiftHistory[roomShiftHistory.length - 1];
                      sortedCheckinDetails.sort((a, b) => {
                        if (a.room_number.id === latestShift.new_room) return -1;
                        if (b.room_number.id === latestShift.new_room) return 1;
                        return 0;
                      });
                    }

                    return sortedCheckinDetails
                      .filter((checkin) => checkin.room_number)
                      .map((checkin, i) => {
                        const { number, room_type, price, variety, id } =
                          checkin.room_number;
                        const isShiftedRoom =
                          roomShiftedFlag &&
                          roomShiftHistory.some((history) => history.new_room === id);

                        return (
                          <tr key={i} >
                            <td>
                              {isShiftedRoom ? `Shifted to ${number}` : number}
                            </td>
                            <td>{room_type}</td>
                            <td>{variety}</td>
                            <td>{checkin.room_price}</td>
                          </tr>
                        );
                      });
                  })()}
                </tbody> */}
                <tbody>
                  {(() => {
                    let sortedCheckinDetails = [...checkinDetails];

                    let latestShift = null;
                    let previousRoomId = null;
                    let newRoomId = null;

                    if (roomShiftedFlag && roomShiftHistory.length > 0) {
                      latestShift = roomShiftHistory[roomShiftHistory.length - 1];
                      previousRoomId = latestShift.previous_room; 
                      newRoomId = latestShift.new_room; 

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

                        const isShiftedRoom = newRoomId === id; 
                        const isPreviousRoom = previousRoomId === id; 

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
              <div className={styles.leftContainer} style={{ width: "100%" }}>
                <div className={styles.paymentDetails}>
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
                                  " " +
                                  (date.getHours() >= 12 ? "PM" : "AM")
                              }
                              {/* End of modification by - Ashish Dewangan on 09-09-2024
                          Reason - To format date and time */}
                            </td>

                            {/* <td>{payment.transaction_id}</td>
                          
                            <td>
                              <button
                                // onClick={() => showModalReceipt(`${baseURL}${payment.payment_proof}`)} // Pass the image URL here
                                onClick={() => handleShowReceipt(`${baseURL}${payment.payment_proof}`)}
                                className="submitButton"
                                style={{ textAlign: "center", marginLeft: "27%", marginTop: "4px" }}
                                disabled={!payment.payment_proof} // Disable if no payment proof
                              >
                                Payment Proof
                              </button>
                            </td> */}
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
                                style={{
                                  textAlign: "center",
                                  marginLeft: "30%",
                                }}
                              >
                                View
                              </button>
                            </td>

                          {/* Modal */}
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


                            
                            
                            {/* <td>{checkin.departure_date}</td>
                      <td>{checkin.departure_time}</td> */}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
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
                    {/* Modification by akanksha on 14th Oct 
                          Reason to show salutation with name */}
                    <td>
                      {billingDetails.customer_salutation}{" "}
                      {personalDetails.name} {personalDetails.last_name}
                    </td>
                    {/* End of modification by akanksha on 14th Oct 
                          Reason to show salutation with name */}
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
                        onClick={() => showModal(personalDetails.id_card_photo)}
                        className="submitButton"
                        style={{ textAlign: "center", marginLeft: "30%" }}
                        disabled={!personalDetails.id_card_photo}
                      >
                        Show ID
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Addition by Om Shrivastava on 05-09-2024
        Reason :Add the condition, when guest details is not there then null show*/}
            <div
              style={{
                display: "flex",
                width: "100%",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              {guestDetails && guestDetails.length > 0 ? (
                <div className={styles.guestDetailsContainer}>
                  <legend
                    className={styles.legend}
                    style={{
                      textAlign: "center",
                      fontWeight: "500",
                      fontSize: "16px",
                    }}
                  >
                    Guest Details
                  </legend>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Name</th>
                        {/* <th>Last Name</th> */}
                        {/* Added by - Ashish Dewangan on 26-09-2024
                        Reason - To show adult / children info */}
                        <th>Adult / Child</th>
                        {/* End of addition by - Ashish Dewangan on 26-09-2024
                        Reason - To show adult / children info */}
                        <th>Room Number</th>
                        <th>ID Type</th>
                        <th>ID Number</th>
                        <th>ID Card Image</th>
                      </tr>
                    </thead>
                    {/* <tbody>
                      {guestDetails.map((guestDetails, index) => (
                        <tr key={index}>
                          <td>
                            {guestDetails.guest_salutation}{" "}
                            {guestDetails.guest_name}&nbsp;
                            {guestDetails.guest_last_name}
                          </td>
                          <td style={{ textTransform: "capitalize" }}>
                            {guestDetails?.person_type}
                          </td>
                          <td>{guestDetails.selectedRoom}</td>
                          <td>{guestDetails.guest_id_card_type}</td>
                          <td>{guestDetails.guest_id_card_no}</td>
                          <td>
                           <button
                            onClick={() => showModal(guestDetails.guest_id_card_photo)}
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
                                onClick={() => showModal(guest.guest_id_card_photo)}
                                className={`submitButton ${!guest.guest_id_card_photo ? "disabled" : ""}`}
                                style={{
                                  textAlign: "center",
                                  marginLeft: "30%",
                                  cursor: !guest.guest_id_card_photo ? "not-allowed" : "pointer",
                                  pointerEvents: !guest.guest_id_card_photo ? "none" : "auto",
                                }}
                                disabled={!guest.guest_id_card_photo}
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
                {/* <div className={styles.form}> */}

                {/* Commented by Om Shrivastava on 30-07-2024
          Reason : Change the alignment of checkout form page  */}
                {/* <div className={styles.rightContainer}>
            <div className={styles.pair}>
              <label className={styles.label}>Miscellaneous(₹)</label>
              <div className={styles.colon}>:</div>
              <input
                type="number"
                value={miscellaneousCharges}
                onChange={(e) =>
                  setMiscellaneousCharges(Number(e.target.value))
                }
              />
            </div>
            <div className={styles.pair}>
              <label className={styles.label}>Extra Discount (₹)</label>
              <div className={styles.colon}>:</div>
              <input
                type="number"
                value={extraDiscount}
                onChange={(e) => setExtraDiscount(Number(e.target.value))}
              />
            </div>
            <div className={styles.pair}>
              <label className={styles.label}>Grand Total (₹)</label>
              <div className={styles.colon}>:</div>
             
              <span className={styles.value}>₹{grandTotal.toFixed(2)}</span>
            </div>
          </div> */}
                {/* Commented by Om Shrivastava on 30-07-2024
          Reason : Change the alignment of checkout form page  */}
                {/* </div> */}
              </div>
            </div>
            {/*
             * End of addition by - Ashish Dewangan on 31-08-2024
             * Reason - To show list of all payments done
             */}
          </div>

          <div className={styles.buttonContainer}>
            <button
              className={styles.submitButton}
              // onClick={handleSubmit}
              // onClick={setIsPopupCheckoutVisible(true)}
              onClick={() => setIsPopupCheckoutVisible(true)}
              disabled={isCheckoutButtonDisabled}
              
            >
              Check-Out
            </button>
            {isPopupCheckoutVisible && (
              <div className="popupOverlay" onClick={handleOutsideClickCheckout}>
                <div className="popup">
                  <p>Are you sure want to checkout?</p>
                  <div className="popupActions">
                    <button onClick={handleSubmit}>Yes</button>
                    <button onClick={handleCancelCheckoutClick}>No</button>
                  </div>
                </div>
              </div>
            )}

            {!partialTrue && (
              <button 
                onClick={showMoveRoomModal} 
                // className={styles.formCButton} 
                className={`${styles.formCButton} ${roomShiftedFlag ? styles.disabledButton : ""}`}
                disabled={!!roomShiftedFlag}
              >
                Room Move
              </button>
            )}

            <Modal 
              visible={isMoveRoomModalVisible}
              onCancel={handlecloseMoveRoomModal}
              onOk={handleOkay}
              width={840}
            >
              <RoomMove onRoomSelect={handleNewRoomSelection} />
            </Modal>

          
          {/* Added by akanksha on 25th Oct 2024, Reason to open popup of C Form */}
          
            <button onClick={showFormCModal} className={styles.formCButton}>
              View C Form
            </button>
            <Modal
              visible={isFormCVisible}
              onOk={handleFormCClose}
              onCancel={handleFormCClose}
              footer={null} // Remove if you want the default footer with OK and Cancel buttons
              width={840} // Set width to make it look like a form view
              height={560}
            >
              <FormC />
            </Modal>
          
          {/* End by akanksha on 25th Oct 2024, Reason to open popup of C Form */}

          

            {/* Modified by - Ashish Dewangan on 05-09-2024
      Reason - To show cancel button only for advance bookings  */}
            {/* <button
        onClick={handleCancelCheckinClick}
        className={styles.formCButton}
      >
        Cancle Check-in
      </button> */}
      
            {billingDetails?.booking_type?.toLowerCase() == "advance" && (
              <button
                onClick={handleCancelCheckinClick}
                className={styles.formCButton}
              >
                Cancle Check-in
              </button>
            )}
            {/* End of modification by - Ashish Dewangan on 05-09-2024
      Reason - To show cancel button only for advance bookings  */}

            {/* End of Code Adition by Tejasve Gupta on 17-07-2024
              reason - Addition of c-form */}
          </div>
          <Modal
            title="ID Card Image"
            visible={isModalVisible}
            onCancel={handleCancel}
            // Modification and addition by Om Shrivastava on 11-10-2024
            // Reason : Add condition when image is not show then remove the button
            footer={[
              selectedImage !== "/media/null" &&
              selectedImage !== undefined &&
              selectedImage !== null &&
              selectedImage.trim().toLowerCase().length > 0 ? (
                <>
                  {/* Added by akanksha on 21st oct, Reason: Download Button using handleDownload */}
                  <Button key="download" onClick={handleDownload}>
                    Download
                  </Button>
                  {/* End by akanksha on 21st oct, Reason: Download Button using handleDownload */}

                  {/* Print Button */}
                  <Button key="print" onClick={handlePrint}>
                    Print
                  </Button>
                </>
              ) : null,
              ,
              // Modification and addition by Om Shrivastava on 11-10-2024
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
              <div
              style={{
                textAlign: "center",
                pageBreakInside: "avoid", // Prevent splitting inside a page
              }}
              className="print-container">
                <img
                src={baseURL + selectedImage}
                alt="ID Card"
                style={{ width: "100%" }}
                // added by akanksha to set height and width of image on 22-11-2024
                // style={{
                //   width: "300px", 
                //   height: "300px", 
                //   objectFit: "contain", 
                //   margin: "0 auto",
                //   display: "block",
                // }}
                // added by akanksha to set height and width of image on 22-11-2024
              />
              </div>
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
          {/** 
      Modified by - Ashish Dewangan on 02-09-2024
      Reason - To payment receipt model was not opening because current pay amuont was zero
      */}
          {/* {paymentAmount > 0 && (
        <PaymentReceiptModal
          visible={isPrModalVisible}
          onClose={handlePrCloseModal}
          paymentReceiptData={particularPaymentReceipt}
        />
      )} */}
          <PaymentReceiptModal
            visible={isPrModalVisible}
            onClose={handlePrCloseModal}
            paymentReceiptData={particularPaymentReceipt}
          />
          {/** 
      Modified by - Ashish Dewangan on 02-09-2024
      Reason - To payment receipt model was not opening because current pay amuont was zero
      */}

          <Modal
            title="Confirm Cancellation"
            visible={isCancelModalVisible}
            onOk={handleCancelCheckinOk}
            onCancel={handleCancelCheckinCancel}
            okText="Confirm"
            cancelText="No"
          >
            {billingDetails?.booking_type === "Advance" && (
              <div>
                {/* Commemnted by Om Shrivastava on 14-10-2024
              Reason : No need to show this field  */}
                {/* <div className={styles.pair}>
                  <div className={styles.label}>Refundable</div>
                  <div className={styles.colon}>:</div>
                  <div className={styles.value}>
                    <input
                      disabled
                      className={styles.inputDisabled}
                      value={billingDetails?.is_Refundable}
                    />
                  </div>
                </div> */}
                {/* End of commemnted by Om Shrivastava on 14-10-2024
              Reason : No need to show this field  */}
                <div className={styles.pair}>
                  <div className={styles.label}>Refundable Amount</div>
                  <div className={styles.colon}>:</div>
                  <div className={styles.value}>
                    <input
                      /**
                   Modified  by - Ashish Dewangan on 09-09-2024
                  Reason - To make refund input box not look like disabled
                  */
                      //  className={styles.inputDisabled}
                      className={styles.refundInputBox}
                      /**
                   End of modification  by - Ashish Dewangan on 09-09-2024
                  Reason - To make refund input box not look like disabled
                  */
                      defaultValue={billingDetails?.refund_amount}
                      // Modification and addition by Om Shrivastava on 14-10-2024
                      // Reason : Set the refundable field and amount
                      // onChange={update_refund_amount}
                      onChange={(e) => {
                        const refundAmount = parseFloat(e.target.value) || 0;

                        // Update refund amount in billingDetails
                        update_refund_amount(e);

                        // Update is_Refundable based on refundAmount
                        const updatedIsRefundable =
                          refundAmount > 0 ? "Yes" : "No";
                        setBillingDetails((prevDetails) => ({
                          ...prevDetails,
                          refund_amount: refundAmount,
                          is_Refundable: updatedIsRefundable,
                        }));
                      }}
                      // End of modification and addition by Om Shrivastava on 14-10-2024
                      // Reason : Set the refundable field and amount
                    />
                  </div>
                </div>
              </div>
            )}
          </Modal>
          {/* Added by Akanksha on 04-02-2025
          Reason : to show refund amount modal*/}
          <Modal
            title="Refund"
            visible={isRefundModalVisible}
            onOk={handleRefund}
            onCancel={handleRefundCancel}
            okText="Confirm"
            cancelText="No"
          >
            <div>
              <div className={styles.pair}>
                <div className={styles.label}>Refundable Amount</div>
                <div className={styles.colon}>:</div>
                <div className={styles.value}>
                  <input
                    className={styles.refundInputBox}
                    defaultValue={billingDetails?.refund_amount}
                    onChange={(e) => {
                      const refundAmount = parseFloat(e.target.value) || 0;
                      update_refund_amount(e);
                      const updatedIsRefundable =
                        refundAmount > 0 ? "Yes" : "No";
                      setBillingDetails((prevDetails) => ({
                        ...prevDetails,
                        refund_amount: refundAmount,
                        is_Refundable: updatedIsRefundable,
                      }));
                    }}
                  />
                </div>
              </div>
            </div>
          </Modal>
          {/* End by Akanksha on 04-02-2025
          Reason : to show refund amount modal */}
        </>
      ) : null}
      </>)}
    </div>
  );
};

export default CheckInDetailsForm;
