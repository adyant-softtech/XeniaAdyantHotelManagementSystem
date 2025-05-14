// Creation by Tejasve Gupta 28-05-2024

/**Code Modification by Tejasve Gupta on 07-08-2024
 * reason - Image populated from backend
 */
import React, {
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
/**End of Code Modification by Tejasve Gupta on 07-08-2024
 * reason - Image populated from backend
 */
import checkinStyle from "./CheckIn.module.css";
import { Button, Modal, Tooltip } from "antd";
/** Code Addition by Tejasve Gupta on 18-06-2024
Reason - Current Date imported from Utils*/
import { getCurrentDate, getCurrentDateforArrivalDate } from "../../utils/Date";
/**End of Code Addition by Tejasve Gupta on 18-06-2024
Reason - Current Date imported from Utils*/
/**Code Addition by Tejasve Gupta on 30-05-2024
 * Reason - Validation on Input Fields
 */
/**Code Addition by Tejasve Gupta on 20-06-2024
  Reason - Addition of delete icon instead of Delete Button*/
import { MdDelete } from "react-icons/md";
/**End of Code Addition by Tejasve Gupta on 20-06-2024
  Reason - Addition of delete icon instead of Delete Button*/
import { GoSearch } from "react-icons/go";

// Created by akanksha on 23rd Oct 2024,
// reason : to disable scroll-to-change functionality for all input[type=number] fields
import {
  disableScrollForNumberInputs,
  cleanupScrollDisable,
} from "../../utils/InputUtils";
// End by akanksha on 23rd Oct 2024,
// reason : to disable scroll-to-change functionality for all input[type=number] fields


import {
  // checkIfMinimumThanMinValue,
  // checkIsEmailInvalid,
  checkIsEmpty,
  // Code Addition by Tejasve Gupta on 14-06-2024
  // Reason - Contact number validation for 10 digits
  checkIfSmallerThanMinLength,
  checkIfGreaterThanMaxLength,
  // End of Code Addition by Tejasve Gupta on 14-06-2024
  // Reason - Contact number validation for 10 digits
  // Code Addede By Tejasve Gupta on 24-05-2024
  checkIsNotADigit,
  // checkPasswordDontmatch,
  // End of Code Addition by Tejasve Gupta on 24-05-2024
} from "../../utils/validations";
import {
  postCheckinDetailsApi,
  getSettingsApi,
  getPersonalDetailsApi,
} from "../../Api/services";
/**Code modification by Tejasve Gupta on 13-06-2024
Reason - Addition of popup notification
*/
import notificationObject from "../../components/Widgets/Notification/Notification";
import { GlobalContext } from "../../context/Context";
/**End of Code modification by Tejasve Gupta on 13-06-2024
Reason - Addition of popup notification
*/
/**Code Addition and Modification by Tejasve Gupta on 15-07-2024
Reason - To add Country, State, City Dropdown*/

/**
 * Commented by - Ashish Dewangan on 15-09-2024
 * Reason - No longer being used
 */
// import {
//   CitySelect,
//   CountrySelect,
//   StateSelect,
//   LanguageSelect,
// } from "react-country-state-city";
// import "react-country-state-city/dist/react-country-state-city.css";
/**
 * End of comment by - Ashish Dewangan on 15-09-2024
 * Reason - No longer being used
 */

// import "../App.css"
/**End of Code Addition and Modification by Tejasve Gupta on 15-07-2024
Reason - To add Country, State, City Dropdown*/
// Code Addition by Tejasve Gupta on 22-07-2024
// Reason - Addition of arrow and payment icon
// import { TbArrowsExchange2 } from "react-icons/tb";
import { ImCheckboxChecked } from "react-icons/im";
import { useLocation, useNavigate } from "react-router-dom";
// End of Code Addition by Tejasve Gupta on 22-07-2024
// Reason - Addition of arrow and payment icon
/**End of Code Addition by Tejasve Gupta on 30-05-2024
 * Reason - Validation on Input Fields
 */
/**Code Modification by Tejasve Gupta on 09-08-2024
 * reason - Add Payment receipt modal with print Functionality
 */
import { IconButton, InputAdornment, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import PaymentReceiptModal from "../PaymentReceipt/PaymentReceipt";
/**End of Code Modification by Tejasve Gupta on 09-08-2024
 * reason - Add Payment receipt modal with print Functionality
 */
// import { Select, Input } from "antd"; // Importing the necessary components from Ant Design
import { Select as AntdSelect, Input } from "antd"; // Importing the necessary components from Ant Design

import Select from "react-select";
import { Country, State, City } from "country-state-city";

import { FaPlus } from "react-icons/fa6";
import CheckInTooltips from "../ToolTip/ToolTip";
import { baseURL } from "../../Api/config";
import { AiFillDelete } from "react-icons/ai";
import { FiArrowLeft } from "react-icons/fi";

// const { Option } = Select; // Extracting the Option component from Select
const { Option } = AntdSelect; // Extracting the Option component from Select
/**Code Modified by Tejasve Gupta on 31-05-2024
 * Reason -  Resetting Form Data
 */

// const roomData = {
//   101: { type: "Non-Ac", price: 50 },
//   102: { type: "Acrr", price: 100 },
//   103: { type: "Delux", price: 150 },
//   104: { type: "Super Delux", price: 200 },
//   105: { type: "Premium", price: 250 },

// };
/**End of Code Modification by Tejasve Gupta on 31-05-2024
 * Reason -  Resetting Form Data
 */

// Code Addition by Tejasve Gupta on 28-06-2024
// Reason - Adding a function to get the room details from context
const CheckIn = () => {
  const {
    roomData,
    availableRoomList,
    reservedRoomList,
    vacantRoomList,
    allRoomBookingDetails,
    setAllRoomBookingDetails,
    tenant
  } = useContext(GlobalContext);

  // End of Code Addition by Tejasve Gupta on 28-06-2024
  // Reason - Adding a function to get the room details from context

  const [formData, setFormData] = useState({
    // Added by - Akanksha 0n 11/10/2024
    // Reason - To add name title salutation and by default set to Mr.
    salutation: "Mr",
    payment_method: "",
    transaction_id: "",
    payment_proof: null,
    // End by - Akanksha 0n 11/10/2024
    // Reason - To add name title salutation and by default set to Mr.
    name: "",
    last_name: "",
    address: "",
    dob: "",
    // Code Addition by Tejasve Gupta on 15-07-2024
    // Reason - addition of Country state and city Dropdown
    /**
     * Modified by - Ashish Dewangan on 12-09-2024
     * Reason - To show default country, state and city
     */
    // country: "",
    // state: "",
    // city: "",
    country: "India",
    state: "Chhattisgarh",
    city: "Raipur",
    country_id: "IN",
    state_id: "CT",
    city_id: "Raipur",
    /**
     * End of addition by - Ashish Dewangan on 12-09-2024
     * Reason - To show default country, state and city
     */
    zip: "",
    // End of Code Addition by Tejasve Gupta on 15-07-2024
    // Reason - addition of Country state and city Dropdown

    phone: "",
    email: "",
    // Code Addition by Tejasve Gupta on 14-06-2024
    // Reason - id type variable should be as same as backend
    id_card_type: "",
    // End of Code Addition by Tejasve Gupta on 14-06-2024
    // Reason - id type variable should be as same as backend
    id_card_no: "",
    id_card_photo: null,
    room_number: "",
    room_type: "",
    /**Code Changed by Tejasve Gupta
     * Reason -  Chnaged Price to TotalCharges
     */
    price: "",
    /**End of Code Changed by Tejasve Gupta
     * Reason -  Chnaged Price to TotalCharges
     */
    arrival_date: "",
    arrival_time: "",
    /**Code Commented By Tejasve Gupta on 02-08-2024
     * Reason - Removal of check-out date functionality from check-in form
     */
    // departure_date: "",
    // departure_time: "",
    /**End of Code Commented By Tejasve Gupta on 02-08-2024
     * Reason - Removal of check-out date functionality from check-in form
     */
    payment_method: "Cash",
    number_of_persons: 1,
    /**Code Modification by Tejasve Gupta on 05-06-2024
     * Reason - By default Zero for Calculation purpose
     */
    number_of_children: 0,
    number_of_adults: 0,
    /**End of Code Modification by Tejasve Gupta on 05-06-2024
     * Reason - By default Zero for Calculation purpose
     */
    roomCharges: 0,
    subTotal: 0,
    taxable_amount: 0,
    total: 0,
    grandTotal: 0,
    gstValue: 0,
    dueAmount: 0,

    /**
     * Added by - Ashish Dewangan on 21-10-2024
     * Reason - To store form data for field purpose_of_visit, arrived from, destination
     */
    purpose_of_visit: "",
    arrived_from: "",
    destination: "",
    /**
     * End of addition by - Ashish Dewangan on 21-10-2024
     * Reason - To store form data for field purpose_of_visit, arrived from, destination
     */
  });

  const [total_amount, setTotalCharges] = useState(0);

  const [showDropdown, setShowDropdown] = useState(false);

  /**Code Addition by Tejasve Gupta on 30-05-2024
   * Reason - Validation on Input Fields
   */
  const [contactNumberError, setContactNumberError] = useState("");
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [arrivalDateError, setArrivalDateError] = useState("");
  /**Code Commented By Tejasve Gupta on 02-08-2024
   * Reason - Removal of check-out date functionality from check-in form
   */
  // const [departureDateError, setDepartureDateError] = useState("");
  // const [departureTimeError, setDepartureTimeError] = useState("");
  /**End of Code Commented By Tejasve Gupta on 02-08-2024
   * Reason - Removal of check-out date functionality from check-in form
   */
  const [arrivalTimeError, setArrivalTimeError] = useState("");
  const [roomError, setRoomError] = useState("");
  const [idTypeError, setIdTypeError] = useState("");
  const [idNumberError, setIdNumberError] = useState("");
  // const [selectedRoomPrice, setSelectedRoomPrice] = useState("");
  /**Code addition and modification by Tejasve Gupta on 02-08-2024
   * Reason - Mandatory for gender
   */
  const [genderError, setGenderError] = useState("");
  /**End of Code addition and modification by Tejasve Gupta on 02-08-2024
   * Reason - Mandatory for gender
   */

  const [primaryIdImageError, setPrimaryIdImageError] = useState("");

  const [extraPersonCharges, setExtraPersonCharges] = useState(0);
  const [discountIn, setDiscountIn] = useState("");

  const [discount_rupees, set_discount_rupees] = useState(0);
  const [discount_percentage, set_discount_percentage] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [gst, setGst] = useState(0);
  const [advancePayment, setAdvancePayment] = useState(0);

  const [roomCharges, setRoomCharges] = useState(0);
  // Addition by Om Shrivastava on 25-10-2024
  // Reason : Set the error scroll up functioanlity
  const errorRef = useRef(null);
  // End of addition by Om Shrivastava on 25-10-2024
  // Reason : Set the error scroll up functioanlity

  /**Code Addition by Tejasve Gupta on 05-06-2024
   * Reason - Calculation of no. of staying days
   */
  const [numberOfDays, setNumberOfDays] = useState(0);
  /**End of Code Addition by Tejasve Gupta on 05-06-2024
   * Reason - Calculation of no. of staying days
   */
  /**Code Modification by Tejasve Gupta on 09-08-2024
   * reason - Add Payment receipt modal with print Functionality
   */
  const [isModalVisible, setIsModalVisible] = useState(false);
  /**Code Addition by Tejasve Gupta on 22-08-2024
   * Reason - Addition of Cancle checkin button
   */
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
  /**End of Code Addition by Tejasve Gupta on 22-08-2024
   * Reason - Addition of Cancle checkin button
   */

  // Addition by Om Shrivastava on 26-09-2024
  // Reason : Create useState for set the Error for guest details
  const [errors, setErrors] = useState([]);
  // End of addition by Om Shrivastava on 26-09-2024
  // Reason : Create useState for set the Error for guest details

  const [isModalOpen, setIsModalOpen] = useState(false);
  /**End of Code Modification by Tejasve Gupta on 09-08-2024
   * reason - Add Payment receipt modal with print Functionality
   */
  /**Code Addition and Modification by Tejasve Gupta on 15-07-2024
Reason - To add Country, State, City Dropdown*/

  const [countryid, setCountryid] = useState(0);
  const [stateid, setstateid] = useState(0);
  /**End of Code Addition and Modification by Tejasve Gupta on 15-07-2024
Reason - To add Country, State, City Dropdown*/
  /**Code Addition by Tejasve Gupta on 02-08-2024
   * Reason - Manually input of idType if Other option is selected
   */
  const [showManualInput, setShowManualInput] = useState(false);
  /**End of Code Addition by Tejasve Gupta on 02-08-2024
   * Reason - Manually input of idType if Other option is selected
   */

  const [showPopup, setShowPopup] = useState(false); // Addiition by Om Shrivastava on 01-10-2024, for set the popup message

  const [showGuestInputTypePopup, setShowGuestInputTypePopup] = useState(false); // Addiition by Om Shrivastava on 14-10-2024, for set the popup message
  // Modification and addition by Om Shrivastava on 19-10-2024
  // Reason : Set the other type issue
  // const [showManualGuestInput, setShowManualGuestInput] = useState(false); // Addiition by Om Shrivastava on 14-10-2024, for set the guest input message
  const [showManualGuestInput, setShowManualGuestInput] = useState([]); // Addiition by Om Shrivastava on 14-10-2024, for set the guest input message
  // Modification and addition by Om Shrivastava on 19-10-2024
  // Reason : Set the other type issue
  const [searchTerm, setSearchTerm] = useState("");
  const [customerList, setCustomerList] = useState([]);
  const [selectedName, setSelectedName] = useState("");
  const [personalDetails, setPersonalDetails] = useState([]);
  /**Code Modification by Tejasve Gupta on 09-08-2024
   * reason - Add Payment receipt modal with print Functionality
   */
  const [paymentReceiptData, setPaymentReceiptData] = useState([]);
  /**End of Code Modification by Tejasve Gupta on 09-08-2024
   * reason - Add Payment receipt modal with print Functionality
   */

  const [guestDetails, setGuestDetails] = useState([]);
  /**Code Modification by Tejasve Gupta on 07-08-2024
   * reason - Image populated from backend
   */
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  /**End of Code Modification by Tejasve Gupta on 07-08-2024
   * reason - Image populated from backend
   */

  // Addition by Om Shrivastava on 14-08-2024
  // Reason : Set the dashboard Data in selectedRoomDashboard variable
  const location = useLocation();
  const selectedDashboardData = location.state;

  // End of addition by Om Shrivastava on 14-08-2024
  // Reason : Set the dashboard Data in selectedRoomDashboard variable
  /**Code Addition by Tejasve Gupta on 16-08-2024
   * Reason - Advance Booking options
   */
  const [bookingType, setBookingType] = useState("Current");
  const [isRefundable, setIsRefundable] = useState("");
  const [refundableAmount, setRefundableAmount] = useState("");
  /**End of Code Addition by Tejasve Gupta on 16-08-2024
   * Reason - Advance Booking options
   */

  /**
   * Added by - Ashish Dewangan on 23-10-2024
   * Reason - Added variable to decide wheter to disable submit button or not
   */
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
  /**
   * End of addition by - Ashish Dewangan on 23-10-2024
   * Reason - Added variable to decide wheter to disable submit button or not
   */

  /**
   * Added by - Ashish Dewangan on 23-10-2024
   * Reason - To disable submit until we get a response from backend
   */

  const [personalDetailId, setPersonalDetailId] = useState("");

  // const [taxable_amount, set_taxable_amount] = useState("");

  /**
   * Added by - Ashish Dewangan on 12-09-2024
   * Reason - Declared variables to store details about country state and city
   */
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [selectedCountry, setSelectedCountry] = useState({
    value: "IN",
    label: "India",
  });
  const [selectedState, setSelectedState] = useState({
    value: "CT",
    label: "Chhattisgarh",
  });
  const [selectedCity, setSelectedCity] = useState({
    value: "Raipur",
    label: "Raipur",
  });
  /**
   * End of addition by - Ashish Dewangan on 12-09-2024
   * Reason - Declared variables to store details about country state and city
   */

  /**
   * Added by - Ashish Dewangan on 23-09-2024
   * Reason - Added a flag that will decided inputbox for city name will be shown or not
   */
  const [isOtherCitySelected, setIsOtherCitySelected] = useState(false);
  /**
   * End of addition by - Ashish Dewangan on 23-09-2024
   * Reason - Added a flag that will decided inputbox for city name will be shown or not
   */
  const [selectedRooms, setSelectedRooms] = useState([]);

  /**
   * Added by - Ashish Dewangan on 07-10-2024
   * Reason - To add default guest rows on the selection of room
   */

  /*Added by akanksha on 21st oct, Reason to limit user to enter only 10digit num*/

  const [phone, setPhone] = useState("");
  const handlePhoneChange = (e) => {
    const { value } = e.target;
    // Allow only digits and limit to 10 characters
    const phoneNumber = value.replace(/\D/g, "").slice(0, 10);
    setPhone(phoneNumber);
  };

  /*End by akanksha on 21st oct, Reason to limit user to enter only 10digit num*/

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

  const [minimumGuestRows, setMinimumGuestRows] = useState(0);
  useEffect(() => {
    var roomCapacityCount = 0;
    selectedRooms.forEach((room) => {
      if (room.variety == "Single") roomCapacityCount = roomCapacityCount + 1;
      if (room.variety == "Double") roomCapacityCount = roomCapacityCount + 2;
      if (room.variety == "Triple") roomCapacityCount = roomCapacityCount + 3;
    });

    setMinimumGuestRows(roomCapacityCount);
  }, [selectedRooms]);

  useEffect(() => {
    var guestRowsToAdd = 0;
    if (minimumGuestRows - 1 > guestDetails.length) {
      for (var i = 0; i < minimumGuestRows - 1 - guestDetails.length; i++) {
        guestRowsToAdd++;
      }

      for (var j = 0; j < guestRowsToAdd; j++) {
        setGuestDetails((prevGuests) => [
          ...prevGuests,
          {
            guest_name: "",
            guest_last_name: "",
            guest_id_card_type: "",
            guest_id_card_no: "",
            person_type: "adult",
            guest_id_card_photo: null,
            selectedRoom: "",
          },
        ]);
      }
    }
  }, [minimumGuestRows]);

  /**
   * End of addition by - Ashish Dewangan on 07-10-2024
   * Reason - To add default guest rows on the selection of room
   */

  /**
   * Added by - Ashish Dewangan on 01-09-2024
   * Reason - To set current date and time as default value for checkin date and time
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

    setFormData((prevFormData) => ({
      ...prevFormData,
      arrival_date: currentDate,
      arrival_time: currentTime,
    }));
  }, []);
  /**
   * End of addition by - Ashish Dewangan on 01-09-2024
   * Reason - To set current date and time as default value for checkin date and time
   */

  /**Code Addition by Tejasve Gupta on 30-07-2024
   * Reason - get GST details from backend
   */

  const gstPercentage = async () => {
    try {
      const access = localStorage.getItem("access");
      if (!access) {
        throw new Error("Access token is missing");
      }

      const data = await getSettingsApi(access, tenant);
      if (data && data.gst) {
        setGst(data.gst);
        // console.log("GST:", data.gst);
      } else {
        console.error("GST value is missing in the response");
      }
    } catch (error) {
      console.error("Error fetching GST:", error);
    }
  };
  useEffect(() => {
    gstPercentage();
  }, []);

  /**End of Code Addition by Tejasve Gupta on 30-07-2024
   * Reason - get GST details from backend
   */

  /** Code Addition by Tejasve Gupta on 02-08-2024
   * Reason - for name search dropdown
   */

  const fetchPersonalDetails = async (searchTerm) => {
    try {
      const access = localStorage.getItem("access");
      if (!access) {
        throw new Error("Access token is missing");
      }

      const data = await getPersonalDetailsApi(access, searchTerm, tenant);
      setCustomerList(data); // Directly set the fetched data to customerList
    } catch (error) {
      console.error("Error fetching personal details:", error);
    }
  };

  // Update the customer list based on the search term
  useEffect(() => {
    /**
     * Modified by - Ashish Dewangan on 11-09-2024
     * Reason - To search on after 3rd character is typed
     */
    // if (searchTerm.length > 3) {
    if (searchTerm.length >= 3) {
      /**
       * End of modification by - Ashish Dewangan on 11-09-2024
       * Reason - To search on after 3rd character is typed
       */
      fetchPersonalDetails(searchTerm);
    } else {
      setCustomerList([]); // Clear customer list if search term is too short
    }
  }, [searchTerm]);

  // // Handle changes in the search input field
  // const handleSearchChange = (e) => {
  //   setSearchTerm(e.target.value);
  // };

  // Handle changes in the search input field
  const handleSearchChange = (e) => {
    let input = e.target.value;

    // Extract only the digits from the input
    const digits = input.replace(/\D/g, ""); // Remove non-digit characters

    // If there are more than 10 digits, slice to only keep the first 10
    if (digits.length > 10) {
      input = input.replace(/\d/g, "").concat(digits.slice(0, 10));
    }

    // Set the search term (with the text and up to 10 digits)
    setSearchTerm(input);
  };

  // Handle selection from the search results
  const handleSelectChange = (e) => {
    const selectedName = e.target.value;
    setSelectedName(e.target.value);

    const selectedDetail = customerList.find(
      (detail) => detail.name === selectedName || detail.phone === selectedName
    );
    setPersonalDetailId(selectedDetail.id);

    if (selectedDetail) {
      /**
       * Modified by - Ashish Dewangan on 06-09-2024
       * Reason - When we select customer name from dropdown then update form data partially
       */
      // setFormData({
      //   personal_detail_object: selectedDetail.id || "",
      //   name: selectedDetail.name || "",
      //   last_name: selectedDetail.last_name || "",
      //   dob: selectedDetail.dob || "",
      //   gender: selectedDetail.gender || "",
      //   phone: selectedDetail.phone || "",
      //   email: selectedDetail.email || "",
      //   address: selectedDetail.address || "",
      //   country: selectedDetail.country || "",
      //   state: selectedDetail.state || "",
      //   city: selectedDetail.city || "",
      //   zip: selectedDetail.zip || "",
      //   id_card_no: selectedDetail.id_card_no || "",
      //   id_card_type: selectedDetail.id_card_type || "",
      //   id_card_photo: "",
      //   id_card_photo_src: selectedDetail.id_card_photo || "",
      // });

      setFormData((prevFormData) => ({
        ...prevFormData,
        // Added by - Akanksha 0n 11/10/2024
        // Reason - To Set name title salutation
        salutation: selectedDetail.salutation || "",
        // Added by - Akanksha 0n 11/10/2024
        // Reason - To Set name title salutation
        personal_detail_object: selectedDetail.id || "",
        name: selectedDetail.name || "",
        last_name: selectedDetail.last_name || "",
        dob: selectedDetail.dob || "",
        gender: selectedDetail.gender || "",
        phone: selectedDetail.phone || "",
        email: selectedDetail.email || "",
        address: selectedDetail.address || "",
        country: selectedDetail.country || "",
        state: selectedDetail.state || "",
        city: selectedDetail.city || "",
        /**
         * Modified by - Ashish Dewangan on 15-09-2024
         * Reason - If existing user does not have zip code then dont show 0 as default zip value
         */
        // zip: selectedDetail.zip || "",
        zip:
          selectedDetail.zip && selectedDetail.zip != 0
            ? selectedDetail.zip
            : "",
        /**
         * End of modification by - Ashish Dewangan on 15-09-2024
         * Reason - If existing user does not have zip code then dont show 0 as default zip value
         */
        id_card_no: selectedDetail.id_card_no || "",
        id_card_type: selectedDetail.id_card_type || "",
        id_card_photo: "",
        id_card_photo_src: selectedDetail.id_card_photo || "",
        /**
         * Added by - Ashish Dewangan on 12-09-2024
         * Reason - To set country and state id of existing customer
         */
        country_id: selectedDetail.country_id,
        state_id: selectedDetail.state_id,
        /**
         * End of addition by - Ashish Dewangan on 12-09-2024
         * Reason - To set country and state id of existing customer
         */
      }));
      /**
       * End of modification by - Ashish Dewangan on 06-09-2024
       * Reason - When we select customer name from dropdown then update form data partially
       */

      /**
       * Added by - Ashish Dewangan on 12-09-2024
       * Reason - To set country and state id of existing customer
       */
      setSelectedCountry({
        value: selectedDetail.country_id,
        label: selectedDetail.country,
      });
      setSelectedState({
        value: selectedDetail.state_id,
        label: selectedDetail.state,
      });
      setSelectedCity({
        value: selectedDetail.city,
        label: selectedDetail.city,
      });
      /**
       * End of addition by - Ashish Dewangan on 12-09-2024
       * Reason - To set country and state id of existing customer
       */

      // Clear search term and customer list after selection
      setSearchTerm("");
      setCustomerList([]);

      /**
       * Added by - Ashish Dewangan on 15-09-2024
       * Reason - To reset validation message when a user is selected from the searchbox
       */
      setFirstNameError("");
      setLastNameError("");
      setGenderError("");
      setContactNumberError("");
      setIdTypeError("");
      setIdNumberError("");
      /**
       * End of addition by - Ashish Dewangan on 15-09-2024
       * Reason - To reset validation message when a user is selected from the searchbox
       */
    }
  };

  /**End of Code Addition by Tejasve Gupta on 02-08-2024
   * Reason - for name search dropdown
   */
  /**Code Modification by Tejasve Gupta on 07-08-2024
   * reason - Add more persons as guest
   */
  const handleGuestChange = useCallback((index, field, value, e) => {
    // Modification and addition by Om Shrivastava on 19-10-2024
    // Reason : Set the other type issue
    // if (e && e.target) {
    //   // Addiition by Om Shrivastava on 14-10-2024, for handle the guest id type value
    //   const { name } = e.target; // Destructure name from e.target

    //   if (name === "guest_id_card_type") {
    //     if (value === "Other") {
    //       setShowManualGuestInput(true);
    //     } else {
    //       setShowManualGuestInput(false);
    //     }
    //   }
    //   // End of addiition by Om Shrivastava on 14-10-2024, for handle the guest id type value
    // }
    // setGuestDetails((prevGuests) =>
    //   prevGuests.map((guest, i) =>
    //     i === index ? { ...guest, [field]: value } : guest
    //   )
    // );
    if (e && e.target) {
      const { name } = e.target;

      if (name === "guest_id_card_type") {
        if (value === "Other") {
          setShowManualGuestInput((prev) => {
            const updated = [...prev];
            updated[index] = true;
            return updated;
          });
        } else {
          setShowManualGuestInput((prev) => {
            const updated = [...prev];
            updated[index] = false;
            return updated;
          });
        }
      }
    }
    setGuestDetails((prevGuests) =>
      prevGuests.map((guest, i) =>
        i === index ? { ...guest, [field]: value } : guest
      )
    );
    // Modification and addition by Om Shrivastava on 19-10-2024
    // Reason : Set the other type issue
  }, []);

  const addGuest = useCallback(() => {
    setGuestDetails((prevGuests) => [
      ...prevGuests,
      {
        // Added by - Akanksha 0n 12/10/2024
        // Reason - To add guest name title salutation
        salutation: "",
        // Added by - Akanksha 0n 12/10/2024
        // Reason - To add guest name title salutation
        guest_name: "",
        guest_last_name: "",
        guest_id_card_type: "",
        guest_id_card_no: "",
        /**
         *  Added by - Ashish Dewangan on 26-09-2024
         * Reason - To store adult/children in data(by default - adult)
         */
        person_type: "adult",
        /**
         *  End of addition by - Ashish Dewangan on 26-09-2024
         * Reason - To store adult/children in data(by default - adult)
         */
        guest_id_card_photo: null,
        selectedRoom: "",
      },
    ]);
    // Addition by Om Shrivastava on 26-09-2024
    // Reason : Set the Error for first name and lastname
    setErrors((prevErrors) => [...prevErrors, { name: "", lastName: "" }]);
    // Addition by Om Shrivastava on 26-09-2024
    // Reason : Set the Error for first name and lastname
  }, []);
  /**Code Modification by Tejasve Gupta on 07-08-2024
   * reason - Image populated from backend
   */
  const deleteGuest = useCallback((index) => {
    setGuestDetails((prevGuests) => prevGuests.filter((_, i) => i !== index));
    // Addition by Om Shrivastava on 26-09-2024
    // Reason : Remove corresponding error messages for guest details
    setErrors((prevErrors) => prevErrors.filter((_, i) => i !== index));
    // End of addition by Om Shrivastava on 26-09-2024
    // Reason : Remove corresponding error messages for guest details
  }, []);

  /**End of Code Modification by Tejasve Gupta on 07-08-2024
   * reason - Add more persons as guest
   */

  /**End of Code Modification by Tejasve Gupta on 07-08-2024
   * reason - Image populated from backend
   */
  const nav = useNavigate();

  // Code Addition by Tejasve Gupta on 19-07-2024
  // Reason - To select Today's Date and time Instantly

  const setTodayDate = () => {
    const today = new Date().toISOString().split("T")[0];
    setFormData((prevFormData) => ({
      ...prevFormData,
      arrival_date: today,
    }));
  };

  // Added by akanksha on 23rd oct,
  // Reason : to handle opening of dropdown
  const handleDropdownClick = (event) => {
    const dropdown = event.target;
    const rect = dropdown.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;

    // If there's not enough space below, open upwards
    if (spaceBelow < 150) {
      // Adjust the threshold as needed
      dropdown.style.position = "absolute";
      dropdown.style.top = `${-rect.height}px`; // Open upwards
    } else {
      dropdown.style.position = "absolute";
      dropdown.style.top = `${rect.height}px`; // Open downwards
    }
  };
  // End by akanksha on 23rd oct,
  // Reason : to handle opening of dropdown

  /**
   * Added by - Ashish Dewangan on 15-09-2024
   * Reason - To allow only number to be entered
   */
  const onlyAllowNumberInput = (e) => {
    // e.target.value= e.target.value.replace(/[^0-9]/g, '').replace(/(\..*?)\..*/g, '$1').replace(/^0[^.]/, '0');
    e.target.value = e.target.value
      .replace(/[^0-9]/g, "")
      .replace(/(\..*?)\..*/g, "$1");
  };
  /**
   * End of addition by - Ashish Dewangan on 15-09-2024
   * Reason - To allow only number to be entered
   */

  /**
   * Added by - Ashish Dewangan on 15-09-2024
   * Reason - To allow only alphabets to be entered
   */
  const onlyAllowAlphabets = (e) => {
    // e.target.value= e.target.value.replace( /[^A-Za-z\s]+$/g, '')
    e.target.value = e.target.value.replace(/[^A-Za-z]+$/g, "");
  };
  /**
   * End of addition by - Ashish Dewangan on 15-09-2024
   * Reason - To allow only alphabets to be entered
   */

  const setCurrenttime = () => {
    const now = new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
    setFormData((prevFormData) => ({
      ...prevFormData,
      arrival_time: now,
    }));
  };
  // End of Code Addition by Tejasve Gupta on 19-07-2024
  // Reason - To select Today's Date and time Instantly

  const isValidOnBlur = (input, value) => {
    if (input == "name") {
      if (checkIsEmpty(value)) {
        setFirstNameError("Please enter first name");
        return false;
      } else {
        setFirstNameError("");
      }
    }
    if (input == "last_name") {
      if (checkIsEmpty(value)) {
        setLastNameError("Please enter last name");
        return false;
      } else {
        setLastNameError("");
      }
    }
    if (input === "phone") {
      if (checkIsEmpty(value)) {
        setContactNumberError("Please enter phone number");
        return false;
      } else if (checkIsNotADigit(value)) {
        setContactNumberError("Please type phone number properly");
        return false;
        // Code Addition by Tejasve Gupta on 14-06-2024
        // Reason - id type variable should be as same as backend
        //Code Addition by Tejasve Gupta on 14-06-2024
        // Reason - Contact number validation for 10 digits
      } else if (checkIfSmallerThanMinLength(value, 10)) {
        setContactNumberError("Please enter 10 digits");
        return false;
      } else if (checkIfGreaterThanMaxLength(value, 10)) {
        setContactNumberError("Please enter 10 digits Only");
        return false;
        // End of Code Addition by Tejasve Gupta on 14-06-2024
        // Reason - Contact number validation for 10 digits
      } else {
        setContactNumberError("");
      }
    }
    if (input === "arrival_date") {
      if (checkIsEmpty(value)) {
        setArrivalDateError("Please enter date");
        return false;
      } else {
        setArrivalDateError("");
      }
    }
    /**Code Commented By Tejasve Gupta on 02-08-2024
     * Reason - Removal of check-out date functionality from check-in form
     */
    // if (input === "departure_date") {
    //   if (checkIsEmpty(value)) {
    //     setDepartureDateError("Please enter check-out Date");
    //     return false;
    //   } else {
    //     setDepartureDateError("");
    //   }
    // }
    /**End of Code Commented By Tejasve Gupta on 02-08-2024
     * Reason - Removal of check-out date functionality from check-in form
     */
    if (input === "arrival_time") {
      if (checkIsEmpty(value)) {
        setArrivalTimeError("Please enter time");
        return false;
      } else {
        setArrivalTimeError("");
      }
    }
    /**Code Commented By Tejasve Gupta on 02-08-2024
     * Reason - Removal of check-out date functionality from check-in form
     */
    // if (input === "departure_time") {
    //   if (checkIsEmpty(value)) {
    //     setDepartureTimeError("Please enter check-out Time");
    //     return false;
    //   } else {
    //     setDepartureTimeError("");
    //   }
    // }
    /**End of Code Commented By Tejasve Gupta on 02-08-2024
     * Reason - Removal of check-out date functionality from check-in form
     */
    //Code Addition by Tejasve Gupta on 14-06-2024
    // Reason - Variable should be same as backend
    if (input === "id_card_type") {
      //Code Addition by Tejasve Gupta on 14-06-2024
      // Reason - Variable should be same as backend
      if (checkIsEmpty(value)) {
        setIdTypeError("Please enter I'd type");
        return false;
      } else {
        setIdTypeError("");
      }
    }
    if (input === "id_card_no") {
      if (checkIsEmpty(value)) {
        // console.log(value)
        setIdNumberError("Please enter I'd number");
        return false;
      } else {
        setIdNumberError("");
      }
    }

    /**Code addition and modification by Tejasve Gupta on 02-08-2024
     * Reason - Mandatory for gender
     */
    if (input === "gender") {
      if (checkIsEmpty(value)) {
        setGenderError("Please enter gender");
        return false;
      } else {
        setGenderError("");
      }
    }
    if (input === "room_number") {
      if (checkIsEmpty(value)) {
        setRoomError("Please select a room");
        return false;
      } else {
        setRoomError("");
      }
    }
    /**End of Code addition and modification by Tejasve Gupta on 02-08-2024
     * Reason - Mandatory for gender
     */
    // if(input ==="id_card_photo"){
    //   if((formData.id_card_photo_src &&
    //     typeof formData.id_card_photo_src === "string" &&
    //     formData.id_card_photo_src.lastIndexOf(".") !==
    //       -1)){

    //       }else{
    //         if (checkIsEmpty(formData.id_card_photo)) {
    //           setPrimaryIdImageError("Please upload ID card image.");
    //           return false;
    //         }else{
    //           setPrimaryIdImageError("")
    //         }
    //       }
    //   }
  };

  const isValidOnSubmit = (data) => {
    let isValid = true;
    if (checkIsEmpty(data.name)) {
      setFirstNameError("Please enter first name");
      isValid = false;
    }
    if (checkIsEmpty(data.last_name)) {
      setLastNameError("Please enter last name");
      isValid = false;
    }
    if (checkIsEmpty(data.phone)) {
      setContactNumberError("Please enter phone number");
      isValid = false;
    } else if (checkIsNotADigit(data.phone)) {
      setContactNumberError("Please type phone number properly");
      isValid = false;

      /**Code Addition by Tejasve Gupta on 20-06-2024
    Reason - Addition of Phone number Validation*/
    } else if (checkIfSmallerThanMinLength(data.phone, 10)) {
      setContactNumberError("Enter 10 digit phone number");
      isValid = false;
    } else if (checkIfGreaterThanMaxLength(data.phone, 15)) {
      setContactNumberError("Enter 10 digit phone number");
      isValid = false;
    }
    /**End of Code Addition by Tejasve Gupta on 20-06-2024
    Reason - Addition of Phone number Validation*/
    if (checkIsEmpty(data.arrival_date)) {
      setArrivalDateError("Please enter date");
      isValid = false;
    }
    /**Code Commented By Tejasve Gupta on 02-08-2024
     * Reason - Removal of check-out date functionality from check-in form
     */
    // if (checkIsEmpty(data.departure_date)) {
    //   setDepartureDateError("Please enter check-out date");
    //   isValid = false;
    // }
    /**End of Code Commented By Tejasve Gupta on 02-08-2024
     * Reason - Removal of check-out date functionality from check-in form
     */
    if (checkIsEmpty(data.arrival_time)) {
      setArrivalTimeError("Please enter time");
      isValid = false;
    }
    /**Code Commented By Tejasve Gupta on 02-08-2024
     * Reason - Removal of check-out date functionality from check-in form
     */
    // if (checkIsEmpty(data.departure_time)) {
    //   setDepartureTimeError("Please enter check-out Time");
    //   isValid = false;
    // }
    /**End of Code Commented By Tejasve Gupta on 02-08-2024
     * Reason - Removal of check-out date functionality from check-in form
     */
    //Code Addition by Tejasve Gupta on 14-06-2024
    // Reason - Variable should be same as backend
    if (checkIsEmpty(data.id_card_type)) {
      //End of Code Addition by Tejasve Gupta on 14-06-2024
      // Reason - Variable should be same as backend
      setIdTypeError("Please enter I'd type");
      isValid = false;
    }
    if (checkIsEmpty(data.id_card_no)) {
      setIdNumberError("Please enter I'd number");
      isValid = false;
    } else {
      setIdNumberError("");
    }

    // if (selectedRooms.length === 0) {
    //   setRoomError("Please select at least one room");
    //   isValid = false;
    // } else {
    //   setRoomError("");
    // }
    // return isValid;
    if (selectedRooms.length === 0) {
      setRoomError("Please select at least one room");
      isValid = false;
    }

    /**Code addition and modification by Tejasve Gupta on 02-08-2024
     * Reason - Mandatory for gender
     */
    if (checkIsEmpty(data.gender)) {
      setGenderError("Please enter gender");
      isValid = false;
    }

    /**End of Code addition and modification by Tejasve Gupta on 02-08-2024
     * Reason - Mandatory for gender
     */

    /* Added by - Ashish Dewangna on 22-09-2024
     * Reason - To validate id image only if customer is not selected by search option
     */
    if (
      formData.id_card_photo_src &&
      typeof formData.id_card_photo_src === "string" &&
      formData.id_card_photo_src.lastIndexOf(".") !== -1
    ) {
    } else {
      if (checkIsEmpty(data.id_card_photo)) {
        setPrimaryIdImageError("Please upload ID card image.");
        isValid = false;
      } else {
        setPrimaryIdImageError("");
      }
    }
    /* End of addition by - Ashish Dewangna on 22-09-2024
     * Reason - To validate id image only if customer is not selected by search option
     */

    return isValid;
  };
  /**End of Code Addition by Tejasve Gupta on 30-05-2024
   * Reason - Validation on Input Fields
   */
  /**Code Addition by Tejasve Gupta on 05-06-2024
   * Reason - Calculation of no. of staying days
   */
  const calculateNumberOfDays = (
    arrivalDate,
    arrivalTime,
    departureDate,
    departureTime
  ) => {
    const arrival = new Date(`${arrivalDate}T${arrivalTime}`);
    const departure = new Date(`${departureDate}T${departureTime}`);
    const timeDiff = Math.abs(departure - arrival);
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  };

  useEffect(() => {
    if (
      formData.arrival_date &&
      formData.arrival_time &&
      formData.departure_date &&
      formData.departure_time
    ) {
      const days = calculateNumberOfDays(
        formData.arrival_date,
        formData.arrival_time,
        formData.departure_date,
        formData.departure_time
      );
      setNumberOfDays(days);
    }
  }, [
    formData.arrival_date,
    formData.arrival_time,
    formData.departure_date,
    formData.departure_time,
  ]);
  /**End of Code Addition by Tejasve Gupta on 05-06-2024
   * Reason - Calculation of no. of staying days
   */
  // Addition by Om Shrivastava on 31-05-2024
  // Reason : Create a useState for set the selectedRooms, roomData, availableroom, vacant room and reserved room

  // Addition by Om Shrivastava on 14-08-2024
  // Reason : Set the dashboard Data in selectedRoom
  useEffect(() => {
    if (selectedDashboardData) {
      setSelectedRooms([selectedDashboardData]);
    }
  }, [selectedDashboardData]);
  // End of addition by Om Shrivastava on 14-08-2024
  // Reason : Set the dashboard Data in selectedRoom

  // const [roomData, setRoomData] = useState([]);
  // const [avaliableRoomList, setAvailableRoomList] = useState([]);
  // const [reservedRoomList, setReservedRoomList] = useState([]);
  // const [vacantRoomList, setVacantRoomList] = useState([]);

  /**Code Commented by Tejasve Gupta on 03-06-2024
   */
  // const [availabilityList, setAvailabilityList] = useState([]);
  /**End of Code Commented by Tejasve Gupta on 03-06-2024
   */
  // End of addition by Om Shrivastava on 31-05-2024
  // Reason : Create a useState for set the selectedRooms, roomData, availableroom, vacant room and reserved room

  /**Code Addition by Tejasve Gupta on 01-06-2024
   * Reason - Current Date should be shown on top
   */
  /** Code Commented and Addition by Tejasve Gupta on 18-06-2024
Reason - Current Date imported from Utils*/
  // function getCurrentDate() {
  //   const today = new Date();
  //   const year = today.getFullYear();
  //   const month = String(today.getMonth() + 1).padStart(2, "0");
  //   const day = String(today.getDate()).padStart(2, "0");
  //   const currentDate = `${year}-${month}-${day}`;
  //   // console.log("currentDate", currentDate);
  //   return currentDate;
  //   // console.log(getCurrentDate)
  // }

  function currentDate() {
    const currentDate = getCurrentDate();
    return currentDate;
  }
  /**End of  Code Commented and Addition by Tejasve Gupta on 18-06-2024
Reason - Current Date imported from Utils*/
  /**End of Code Addition by Tejasve Gupta on 01-06-2024
   * Reason - Current Date should be shown on top
   */
  // Code Addition by Tejsve Gupta on 18-07-2024
  // Reason - To add  Country, state, city dropdown

  /**
   * Commented by - Ashish Dewangan on 12-09-2024
   * Reason - changed library of Country state and city selector
   */
  // useEffect(() => {
  //   const india = { id: 101, name: "India" };
  //   setCountryid(india.id);
  //   setFormData((prevFormData) => ({
  //     ...prevFormData,
  //     country: india.name,
  //   }));
  // }, []);
  /**
   * End of comment by - Ashish Dewangan on 12-09-2024
   * Reason - changed library of Country state and city selector
   */

  /**
   * Added by - Ashish Dewangan on 12-09-2024
   * Reason - To get the set the list for country and filter out state,city accourding to country
   */
  useEffect(() => {
    const updatedCountries = Country.getAllCountries().map((country) => ({
      label: country.name,
      value: country.isoCode,
      ...country,
    }));
    setCountries(updatedCountries);
  }, []);

  useEffect(() => {
    const updatedStates = State.getStatesOfCountry(selectedCountry.value).map(
      (state) => ({
        label: state.name,
        value: state.isoCode,
        ...state,
      })
    );
    setStates(updatedStates);
  }, [selectedCountry]);

  useEffect(() => {
    var updatedCities = City.getCitiesOfState(
      selectedCountry.value,
      selectedState.value
    ).map((city) => ({
      label: city.name,
      value: city.name,
      ...city,
    }));
    /**
     * Added by - Ashish Dewangan on - 23-09-2024
     * Reason - To add other option to cities dropdown
     */
    updatedCities = [
      ...updatedCities,
      { label: "Other", value: "Other", name: "Other" },
    ];
    /**
     * End of code addition by - Ashish Dewangan on - 23-09-2024
     * Reason - To add other option to cities dropdown
     */
    setCities(updatedCities);
  }, [selectedState]);
  /**
   * End of addition by - Ashish Dewangan on 12-09-2024
   * Reason - To get the set the list for country and filter out state,city accourding to country
   */

  /**
   * Modified by - Ashish Dewangan on 12-09-2024
   * Reason - changed library of Country state and city selector hence altering the code
   */
  //  const handleCountryChange = (e) => {
  //   setCountryid(e.id);
  //   // console.log("country ID----------->>>>", e.id)
  //   // console.log("country name----------->>>>", e.name)
  //   setFormData({
  //     ...formData,
  //     country: e.name,
  //     state: "",
  //     city: "",
  //   });
  // };

  // const handleStateChange = (e) => {
  //   setstateid(e.id);
  //   setFormData({
  //     ...formData,
  //     state: e.name,
  //     city: "", // Reset city when state changes
  //   });
  // };

  // const handleCityChange = (e) => {
  //   setFormData({
  //     ...formData,
  //     city: e.name,
  //   });
  // };

  const handleCountryChange = (e) => {
    setSelectedCountry({ label: e.name, value: e.value });
    setSelectedState({});
    setSelectedCity({});

    setFormData({
      ...formData,
      country: e.name,
      country_id: e.value,
      state: "",
      state_id: "",
      city: "",
      city_id: "",
    });
  };

  const handleStateChange = (e) => {
    setSelectedState({ label: e.name, value: e.value });
    setSelectedCity({});

    setFormData({
      ...formData,
      state: e.name,
      state_id: e.value,
      city: "", // Reset city when state changes
      city_id: "",
    });
  };

  const handleCityChange = (e) => {
    /**
     * Added by - Ashish Dewangan on - 23-09-2024
     * Reason - To show input box to type city name if other option is selected from dropdown
     */
    if (e.value == "Other") {
      setIsOtherCitySelected(true);
    } else {
      setIsOtherCitySelected(false);
    }
    /**
     * End of addition by - Ashish Dewangan on - 23-09-2024
     * Reason - To show input box to type city name if other option is selected from dropdown
     */
    setSelectedCity({ label: e.name, value: e.value });
    setFormData({
      ...formData,
      city: e.name,
      city_id: e.value,
    });
  };

  /**
   * Added by - Ashish Dewangan on - 23-09-2024
   * Reason - To set other city in form data that will be sent to the server
   */
  const handleOtherCityChange = (e) => {
    setFormData({
      ...formData,
      city: e.target.value,
      city_id: "Other",
    });
  };
  /**
   * End of addition by - Ashish Dewangan on - 23-09-2024
   * Reason - To set other city in form data that will be sent to the server
   */

  /**
   * End of modification by - Ashish Dewangan on 12-09-2024
   * Reason - changed library of Country state and city selector hence altering the code
   */

  // End of Code Addition by Tejsve Gupta on 18-07-2024
  // Reason - To add  Country, state, city dropdown

  /**Code Addition by Tejasve Gupta on 22-08-2024
   * Reason - Addition of Cancle checkin button
   */
  const showCancelModal = () => {
    setIsCancelModalVisible(true);
  };

  const handleCancelOk = () => {
    setIsCancelModalVisible(false);
    clearForm();
  };

  const handleCancelCheckin = () => {
    setIsCancelModalVisible(false);
  };
  /**End of Code Addition by Tejasve Gupta on 22-08-2024
   * Reason - Addition of Cancle checkin button
   */

  // Addition by Om Shrivastava on 01-10-2024
  // Reason : Handle the popup message
  const handlePopupChoice = (choice) => {
    console.log("ddddddd");
    if (choice === "yes") {
      // Logic for switching back to the dropdown
      setShowManualInput(false);
    }
    // Regardless of the choice, hide the popup
    setShowPopup(false);
  };
  // End of addition by Om Shrivastava on 01-10-2024
  // Reason : Handle the popup message

  const handleManualInputChange = (e) => {
    // Modification and addition by Om Shrivastava on 30-09-2024
    // Reason : Handle the input field when user change the id type value from dropdown
    // setFormData({ ...formData, id_card_type: e.target.value });
    const { value } = e.target;
    // setFormData({ ...formData, id_card_type: value });

    // If the manual input is cleared, show the select dropdown again
    if (value === "") {
      // setShowManualInput(false);
      setShowPopup(true);
    }
    setFormData({
      ...formData,
      id_card_type: value,
    });
    // End of modification and addition by Om Shrivastava on 30-09-2024
    // Reason : Handle the input field when user change the id type value from dropdown
  };

  // Addition by Om Shrivastava on 01-10-2024
  // Reason : Handle the popup message
  const handlePopupGuestChoice = (choice, index) => {
    // Modification and addition by Om Shrivastava on 19-10-2024
    // Reason : Set the other type issue
    // if (choice === "yes") {
    //   // If user chooses "Yes," show the select dropdown again
    //   setShowManualGuestInput(false);
    //   setFormData({ ...formData, guest_id_card_type: "" });
    // }

    // setShowGuestInputTypePopup(false); // Addiition by Om Shrivastava on 01-10-2024, for handle the popup message
    if (choice === "yes") {
      setShowManualGuestInput((prev) => {
        const updated = [...prev];
        updated[index] = false;
        return updated;
      });
      setFormData({ ...formData, guest_id_card_type: "" });
    }

    setShowGuestInputTypePopup(false);
    // Modification and addition by Om Shrivastava on 19-10-2024
    // Reason : Set the other type issue
  };
  // End of addition by Om Shrivastava on 01-10-2024
  // Reason : Handle the popup message

  const handleManualGuestInputChange = (index, e) => {
    console.log("ffffffff", e);
    const { value } = e.target;

    // Trigger the popup if the input value is empty.
    if (value === "") {
      setShowGuestInputTypePopup(true);
    }

    // Use handleGuestChange to update the form data for the guest.
    handleGuestChange(index, "guest_id_card_type", value, e);
  };

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

  // Set the get method in useEffect
  // useEffect(() => {
  //   getCheckinDetail();
  // }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "00-00-0000";
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
  };

  // Set the API for getting the roomdetails by Om Shrivastava on 01-06-2024
  // Reason : Get the room details data
  // const getCheckinDetail = async () => {
  //   try {
  //     const access = localStorage.getItem("access"); // Get access token from localStorage
  //     const value = {}; // Define the value you need to pass as query parameters
  //     const response = await getCheckinDetails(access, value);
  //     if (response?.room_list != null) {
  //       setRoomData(response?.room_list);
  //     }
  //     if (response?.available_rooms != null) {
  //       setAvailableRoomList(response?.available_rooms);
  //     }
  //     if (response?.reserved_rooms != null) {
  //       setReservedRoomList(response?.reserved_rooms);
  //     }
  //     if (response?.vacant_rooms != null) {
  //       setVacantRoomList(response?.vacant_rooms);
  //     }
  //     /**COde Commented by Tejasve Gupta on 03-06-2024
  //      */
  //     // if (response?.availability_list != null){
  //     //   setAvailabilityList(response?.availability_list);
  //     // }
  //     /**End of Code Commented by Tejasve Gupta on 03-06-2024
  //      */
  //   } catch (error) {
  //     console.error("Error fetching check-in details:", error);
  //   }
  // };

  // console.log(roomData, "room list");
  // console.log(avaliableRoomList, "available room list");
  // console.log(reservedRoomList, "resereved room list");
  // console.log(vacantRoomList, "vacant room list");

  /**Code Commented by Tejasve Gupta on 03-06-2024
   */
  // console.log("AVAILABILITY LIST",availabilityList)
  /**End of Code Commented by Tejasve Gupta on 03-06-2024
   */
  // Set the API for getting the roomdetails by Om Shrivastava on 01-06-2024
  // Reason : Get the room details data

  // Addiition by Om Shrivastava on 18-10-2024
  // Reason : Add condition when booking type is current and advance
  useEffect(() => {
    if (bookingType === "Advance") {
      setFormData((prevData) => ({
        ...prevData,
        arrival_date: "",
        arrival_time: "",
      }));
    } else if (bookingType === "Current") {
      const currentDate = new Date();

      // Format the date as dd-mm-yyyy
      const formattedDate = [
        String(currentDate.getDate()).padStart(2, "0"),
        String(currentDate.getMonth() + 1).padStart(2, "0"),
        currentDate.getFullYear(),
      ].join("-");

      // Format the time as hh:mm in 24-hour format
      const formattedTime = currentDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      setFormData((prevData) => ({
        ...prevData,
        arrival_date: getCurrentDateforArrivalDate(),
        arrival_time: formattedTime,
      }));
    }
  }, [bookingType]);
  // End of addiition by Om Shrivastava on 18-10-2024
  // Reason : Add condition when booking type is current and advance
  const [showModal, setShowModal] = useState(false);
  
  const handleRoomChange = (e) => {
    const { name, value } = e.target;
    /**Code Addition by Tejasve Gupta on 02-08-2024
     * Reason - Manually input of idType if Other option is selected
     */
    if (name === "id_card_type") {
      if (value === "Other") {
        setShowManualInput(true);
      } else {
        setShowManualInput(false);
      }
    }
    /**End of Code Addition by Tejasve Gupta on 02-08-2024
     * Reason - Manually input of idType if Other option is selected
     */
    // Code Modificatio by Tejasve Gupta on 28-06-2024
    // Reason - As imported data using context
    setFormData((prevData) => {
      if (name === "roomNumber") {
        const room = roomData.find((room) => room.id === parseInt(value));
        if (room) {
          if (
            !selectedRooms.find(
              (selectedRoom) => selectedRoom.roomNumber === room.room_number
            )
          ) {
            const newRoom = {
              room_number: room.room_number,
              room_type: room.room_type,
              price: room.room_price,
              variety: room.variety,
            };
            // console.log("naya Room", newRoom);

            setSelectedRooms((prevRooms) => {
              const updatedRooms = [...prevRooms, newRoom];
              // console.log("Updated Roomsssssssssssssss", updatedRooms);
              return updatedRooms;
            });
            const total = [...selectedRooms, newRoom].reduce(
              (acc, room) => acc + room.price,
              0
            );
            // console.log("total=================", total);
            // setTotalCharges(String(total));
            /**
             * Added by - Ashish Dewangan on 15-09-2024
             * Reason - To reset room validation message when new room is added
             */
            setRoomError("");
            /**
             * End of addition by - Ashish Dewangan on 15-09-2024
             * Reason - To reset room validation message when new room is added
             */
            return {
              ...prevData,
              room_number: "",
              room_type: "",
              price: "",
              variety: "",
              roomCharges: total,
            };
          } else {
            // End of Code Modificatio by Tejasve Gupta on 28-06-2024
            // Reason - As imported data using context
            return prevData;
          }
        }
      }

      
      if (e.target.value === "Online") {
        setShowModal(true);
      } else {
        setShowModal(false);
      }
      /** End of Addition by Akanksha on 24-01-2025
       * Reason - Handle new fields for online payment
       */

      return {
        ...prevData,
        [name]: value,
      };
    });

    //call calculateAmount()
  };
  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleTransactionChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    console.log(file); // Log the file to confirm
    setFormData({
      ...formData,
      payment_proof: file ? file : null, // Set to null if no file selected
    });
  };
  
  // End of modification and addition by Om Shrivastava on 01-06-2024
  // Reason : Set the room number details

  /**Code Modification by Tejasve Gupta on 07-08-2024
   * reason - Image populated from backend
   */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prevData) => ({
        ...prevData,
        id_card_photo: file, // Save the file in formData
        /**
         * Added by - Ashish Dewangan on 15-09-2024
         * Reason - To hide old photo when new one is selected
         */
        id_card_photo_src: "",
        /**
         * End of addition by - Ashish Dewangan on 15-09-2024
         * Reason - To hide old photo when new one is selected
         */
      }));

      const url = URL.createObjectURL(file);
      setImagePreviewUrl(url); // Create preview URL
    }
  };

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const handleGuestFileChange = (index, e) => {
    /**
     * Modified by - Ashish Dewangan on 14-09-2024
     * Reason - To convert image file to base64 string so that it can be sent to server
     */
    //   setGuestDetails((prevGuests) =>
    //   prevGuests.map((guest, i) =>
    //     i === index ? { ...guest, id_card_photo:e.target.files[0] } : guest
    //   )
    // );

    let reader = new FileReader();
    var base64String = "";
    reader.onload = function () {
      base64String = reader.result.replace("data:", "").replace(/^.+,/, "");
      setGuestDetails((prevGuests) =>
        prevGuests.map((guest, i) =>
          i === index ? { ...guest, id_card_photo: base64String } : guest
        )
      );
    };
    reader.readAsDataURL(e.target.files[0]);
    /**
     * End of modification by - Ashish Dewangan on 14-09-2024
     * Reason - To convert image file to base64 string so that it can be sent to server
     */
  };
  /**End of Code Modification by Tejasve Gupta on 07-08-2024
   * reason - Image populated from backend
   */

  /**Code Addition by Tejasve Gupta on 16-08-2024
   * Reason - Advance Booking options
   */
  const handleBookingTypeChange = (value) => {
    setBookingType(value);
    if (value === "Current") {
      setIsRefundable("");
      setRefundableAmount("");
    }
  };
  const handleRefundableChange = (value) => {
    setIsRefundable(value);
    if (value === "No") {
      setRefundableAmount("");
    }
  };
  /**End of Code Addition by Tejasve Gupta on 16-08-2024
   * Reason - Advance Booking options
   */
  // console.log(selectedRooms);
  // Modification and addition by Om Shrivastava on 01-06-2024
  // Reason : post the checkin form details
  // Addition by Om Shrivastava on 01-06-2024
  // Reason : Post the checkin form details
  // const postCheckinForm = async (e) => {
  //   if (isValidOnSubmit(formData)) {
  //     console.log(formData, "cehckkkk");
  //     const response = await postCheckinDetailsApi(
  //       formData,
  //       selectedRooms,
  //       total_amount
  //     );
  //     console.log("Form Data Submitted: ", {
  //       ...formData,
  //       selectedRooms,
  //       total_amount,
  //     });
  //   } else {
  //     console.log("Form submission halted due to validation errors");
  //   }
  // };
  const postCheckinForm = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior if used in a form
    /**Code Addition and Modification by Tejasve Gupta on 08-06-2024
     * Reason - For posting data in formal manner
     */
    const d = new FormData();

    d.append("selectedRooms", JSON.stringify(selectedRooms));
    // Added by - Akanksha 0n 11/10/2024
    // Reason - To appedn name title salutation
    d.append("salutation", formData.salutation);

    d.append("transaction_id", formData.transaction_id);
    d.append("payment_proof", formData.payment_proof);
    // Added by - Akanksha 0n 11/10/2024
    // Reason - To appedn name title salutation
    d.append("name", formData.name);
    if (formData.personal_detail_object) {
      d.append("personal_detail_object", formData.personal_detail_object);
    }
    // d.append("personal_detail_object", formData.personal_detail_object);
    d.append("last_name", formData.last_name);
    d.append("email", formData.email);
    d.append("address", formData.address);
    // Code Addition by Tejasve Gupta on 15-07-2024
    // Reason - addition of Country state and city Dropdown
    d.append("country", formData.country);
    d.append("state", formData.state);
    d.append("city", formData.city);
    /**
     * Added by - Ashish Dewangan on 12-09-2024
     * Reason - to send country and state and city id to backend
     */
    d.append("country_id", formData.country_id);
    d.append("state_id", formData.state_id);
    d.append("city_id", formData.city_id);
    /**
     * End of addition by - Ashish Dewangan on 12-09-2024
     * Reason - to send country and state and city id to backend
     */
    d.append("zip", formData?.zip?.length > 0 ? formData.zip : 0);

    d.append(
      "dob",
      formData?.dob && formData.dob.length > 0 ? formData.dob : "2024-01-01"
    );
    d.append("gender", formData.gender);
    // End of Code Addition by Tejasve Gupta on 15-07-2024
    // Reason - addition of Country state and city Dropdown
    d.append("phone", formData.phone);
    //Code Addition by Tejasve Gupta on 14-06-2024
    // Reason - Variable should be same as backend
    d.append("id_card_type", formData.id_card_type);
    //End of Code Addition by Tejasve Gupta on 14-06-2024
    // Reason - Variable should be same as backend
    d.append("id_card_no", formData.id_card_no);
    d.append("id_card_photo", formData.id_card_photo);
    // d.append("room_number", formData.room_number);
    // d.append("rooom_price", formData.room_number);
    // d.append("room_type", formData.room_type);
    // d.append("totalCharges", formData.totalCharges);
    d.append("arrival_date", formData.arrival_date);
    d.append("arrival_time", formData.arrival_time);
    /**Code Commented By Tejasve Gupta on 02-08-2024
     * Reason - Removal of check-out date functionality from check-in form
     */
    // d.append("departure_date", formData.departure_date);
    // d.append("departure_time", formData.departure_time);
    /**End of Code Commented By Tejasve Gupta on 02-08-2024
     * Reason - Removal of check-out date functionality from check-in form
     */
    d.append("payment_method", formData.payment_method);
    d.append("number_of_persons", formData.number_of_persons);
    d.append("number_of_children", formData.number_of_children);
    d.append("number_of_adults", formData.number_of_adults);
    // Code Modificatio by Tejasve Gupta on 28-06-2024
    // Reason - Addition of new fields
    d.append("extraPersonCharges", extraPersonCharges);
    d.append("discount_in", discountIn);
    d.append("discount_rupees", discount_rupees);
    d.append("discount_percentage", discount_percentage);
    d.append("gst", gst);
    d.append("advancePayment", advancePayment);
    d.append("guest_details", JSON.stringify(guestDetails));
    /**
     * Added by - Ashish Dewangan on 07-09-2024
     * Reason - To handle guest details submission
     */
    // d.append("guest_details",guestDetails);
    // var x=[]
    // for(var g of guestDetails){
    //   var f=new FormData()
    //   f.append( "guest_name", g.guest_name)
    //   f.append( "guest_last_name", g.guest_last_name)
    //   f.append("guest_id_card_type",g.guest_id_card_type)
    //   f.append("guest_id_card_no",g.guest_id_card_no)
    //   f.append("guest_id_card_photo",g.guest_id_card_photo)
    //   f.append("id_card_photo",g.id_card_photo)
    //   x.push(f)
    // }
    // d.append("guest_details", x);
    /**
     * End of addition by - Ashish Dewangan on 07-09-2024
     * Reason - To handle guest details submission
     */

    d.append("room_charges", formData.roomCharges);
    d.append("sub_total", formData.subTotal);
    d.append("taxable_amount", formData.taxable_amount);
    d.append("total", formData.total);
    d.append("grand_total", formData.grandTotal);
    d.append("gst_value", formData.gstValue);
    d.append("due", formData.dueAmount);

    /**Code Addition by Tejasve Gupta on 16-08-2024
     * Reason - Advance Booking options
     */
    d.append("bookingType", bookingType);
    // Commented by Om Shrivastava on 12-10-2024
    // Reason : No need to save the refundable amount
    // if (bookingType === "Advance") {
    //   d.append("isRefundable", isRefundable);
    //   if (isRefundable === "Yes") {
    //     d.append("refund_amount", refundableAmount);
    //   }
    // }
    // Commented by Om Shrivastava on 12-10-2024
    // Reason : No need to save the refundable amount

    /**End of Code Addition by Tejasve Gupta on 16-08-2024
     * Reason - Advance Booking options
     */
    // console.log("+++++++new form data+++++++++++", d);
    // console.log("+++++++form data+++++++++++", formData);
    // End of Code Modificatio by Tejasve Gupta on 28-06-2024
    // Reason - Addition of new fields
    /**End of Code Addition and Modification by Tejasve Gupta on 08-06-2024
     * Reason - For posting data in formal manner
     */

    /**
     * Added by - Ashish Dewangan on 21-10-2024
     * Reason - To send purpose of visit, arrived from, destination to backend
     */
    d.append("purpose_of_visit", formData.purpose_of_visit);
    d.append("arrived_from", formData.arrived_from);
    d.append("destination", formData.destination);
    /**
     * End of addition by - Ashish Dewangan on 21-10-2024
     * Reason - To send purpose of visit, arrived from, destination to backend
     */

    if (isValidOnSubmit(formData)) {
      const completeFormData = {
        ...formData,
        selectedRooms: selectedRooms,
        // total_amount: total_amount,
      };

      // console.log("============&&&&&&&&&&&&&&&&&&&=========", completeFormData);
      // Code Commented by Tejasve Gupta on 28-06-2024
      // Reason - As shifted to context
      try {
        /**
         * Added by - Ashish Dewangan on 23-10-2024
         * Reason - To disable the submit button until response is received
         */
        setIsSubmitDisabled(true);
        /**
         * End of addition by - Ashish Dewangan on 23-10-2024
         * Reason - To disable the submit button until response is received
         */

        /**Code Addition and Modification by Tejasve Gupta on 08-06-2024
         * Reason - For posting data in formal manner
         */
        const access = localStorage.getItem("access"); // Get access token from localStorage
        const response = await postCheckinDetailsApi(access, d, tenant);
        /**Code Modification by Tejasve Gupta on 09-08-2024
         * reason - Add Payment receipt modal with print Functionality
         */

        setPaymentReceiptData(response.payment_receipt_data);
        setAllRoomBookingDetails(response.all_room_booking_details);

        /**Code modification by Tejasve Gupta on 13-06-2024
            Reason - Addition of popup notification
            */

        notificationObject.success(response.success);

        // notificationObject.success(response.billing_detail);
        /**End of Code Modification by Tejasve Gupta on 09-08-2024
         * reason - Add Payment receipt modal with print Functionality
         */
        /**End of Code modification by Tejasve Gupta on 13-06-2024
            Reason - Addition of popup notification
            */
        // End of Code Commented by Tejasve Gupta on 28-06-2024
        // Reason - As shifted to context
        /**Code Addition by Tejasve Gupta on 12-06-2024
         Reason - Code addition for Clearing form after submition*/

        /**Code Addition by Tejasve Gupta on 12-06-2024
         Reason - Code addition for Clearing form after submition*/
        /**End of Code Addition and Modification by Tejasve Gupta on 08-06-2024
         * Reason - For posting data in formal manner
         */
        setIsModalVisible(true);
        if (advancePayment === 0) {
          clearForm();
        }

        // clearForm();
        // Addition by Om Shrivastava on 27-07-2024
        // Reason : Navigate the invoice page
        /**Code Commented by Tejasve Gupta on 02-08-2024 
                            Reason - Removal of invoice from checkin form submission*/
        // nav("/invoice", { state: response });
        /**End of Code Commented by Tejasve Gupta on 02-08-2024 
                            Reason - Removal of invoice from checkin form submission*/
        // End of addition by Om Shrivastava on 27-07-2024
        // Reason : Navigate the invoice page
      } catch (error) {
        console.error("Error submitting form data: ", error);
      }
      /**
       * Added by - Ashish Dewangan on 23-10-2024
       * Reason - To enable the submit button after response is received or error is returned
       */
      finally{
        setIsSubmitDisabled(false)
      }
      /**
       * End of addition by - Ashish Dewangan on 23-10-2024
       * Reason - To enable the submit button after response is received or error is returned
       */
    } else {
      console.log("Form submission halted due to validation errors");
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    // console.log('Form Data:', formData);
    // Code Addition by Tejasve Gupta on 28-06-2024
    // Reason - creation of form data
    // const formData = new FormData(e.target);
    // const newFormData = {};
    // formData.forEach((value, key) => {
    //   newFormData[key] = value;
    // });
    // setFormData(newFormData);
    //End of Code Addition by Tejasve Gupta on 28-06-2024
    // Reason - creation of form data
    // Addition by Om Shrivastava on 26-09-2024
    // Reason : Add the validation for first and last name of guest user
    let hasErrors = false;
    const newErrors = guestDetails.map((guest) => ({
      name: guest.guest_name ? "" : "First name is required",
      lastName: guest.guest_last_name ? "" : "Last name is required",
    }));

    newErrors.forEach((error) => {
      if (error.name || error.lastName) {
        hasErrors = true;
      }
    });

    setErrors(newErrors);

    if (hasErrors) {
      return;
    }

    // Addition by Om Shrivastava on 25-10-2024
    // Reason : Set the error scroll up functioanlity
    if (errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    // End of addition by Om Shrivastava on 25-10-2024
    // Reason : Set the error scroll up functioanlity
    // End of addition by Om Shrivastava on 26-09-2024
    // Reason : Add the validation for first and last name of guest user

    postCheckinForm(e);
    // setIsModalVisible(false);
    setIsModalOpen(true);
    // setIsModalVisible(true);

    // if (isValidOnSubmit(formData)) {
    //   console.log(formData,'cehckkkk')
    //   console.log("Form Data Submitted: ", {...formData,selectedRooms,totalCharges,});
    // } else {
    //   console.log("Form submission halted due to validation errors");
    // }
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    clearForm();
  };

  // const handleOk = () => {
  //   setIsModalVisible(false);
  // };

  // const handleCancel = () => {
  //   setIsModalVisible(false);
  // };

  // End of code addition by Om Shrivastava on 01-06-2024
  // Reason : Post the checkin form details

  const handleDeleteRoom = (room_number) => {
    setSelectedRooms((prevRooms) => {
      const updatedRooms = prevRooms.filter(
        (room) => room.room_number !== room_number
      );
      const total = updatedRooms.reduce((acc, room) => acc + room.price, 0);
      // setTotalCharges(String(total));
      setFormData((prevData) => ({
        ...prevData,
        roomCharges: total,
      }));
      return updatedRooms;
    });
    //call calculateAmount()
  };

  useEffect(() => {
    const total = selectedRooms.reduce((acc, room) => acc + room.price, 0);
    //call calculateAmount()
    // setTotalCharges(String(total));
    setFormData((prevData) => ({
      ...prevData,
      roomCharges: total,
    }));
  }, [selectedRooms]);

  const handleBlur = (e) => {
    const { name, value } = e.target;
    isValidOnBlur(name, value);
  };

  /**Code Addition by Tejasve Gupta on 02-06-2024
   * Reason - CReating Room card for Availibility Check
   */
  // const RoomList = () => {
  //   // Calculate booked rooms
  //   const bookedRooms = roomData.filter(room => !roomData.includes(parseInt(room.room_number)));
  // }

  /**End of Code Addition by Tejasve Gupta on 02-06-2024
   * Reason - CReating Room card for Availibility Check
   */
  /** Code Addition by Tejasve Gupta on 16-06-2024
    Reason - Live Date and Time added*/

  const [nowTime, setNowTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNowTime(new Date());
    }, 1000); // Update every 1 second

    // Cleanup function to clear interval on component unmount
    return () => clearInterval(interval);
  }, []);
  /**End of Code Addition by Tejasve Gupta on 16-06-2024
    Reason - Live Date and Time added*/

  /**Code Addition by Tejasve Gupta on 04-06-2024
   * reason - Creation of Card for Room Status
   */
  const getStatusColor = (status) => {
    switch (status) {
      case "Free":
        //Code Addition by Tejasve Gupta on 14-06-2024
        // Reason - status Color Changed as suggested by Tester
        // return "#b2d8d8";
        return "rgb(242, 255, 233)";
      //End of Code Addition by Tejasve Gupta on 14-06-2024
      // Reason - status Color Changed as suggested by Tester
      case "Advance":
        // return "#f1dfac";
        return "rgb(227, 249, 254)";
      case "Booked":
        // return "#ddb2aa";
        return "rgb(255, 240, 237)";
      default:
        return "Yellow";
    }
  };
  /**Code Addition and Modification by Tejasve Gupta on 15-07-2024
Reason - UI Enhancements and Addition of new fields*/

  /**Code Addition by Om Shrivastava on 11-10-2024
   * reason - Apply the border color for different room cards
   */
  const getborderColor = (status) => {
    switch (status) {
      case "Free":
        return "1px solid #88b25a";
      case "Advance":
        return "1px solid #78c6d9";
      case "Booked":
        return "1px solid #ed6d47";
      default:
        return "Yellow";
    }
  };
  /**Code Addition by Om Shrivastava on 11-10-2024
Reason - Apply the border color for different room cards*/

  const RoomCard = ({ room }) => {
    const statusColor = getStatusColor(room.status);
    const borderColor = getborderColor(room.status);

    return (
      <div
        className={checkinStyle.roomButton}
        style={{
          backgroundColor: statusColor,
          // Addition by Om shrivastava on 11-10-2024
          // Reason : Set the border color
          border: borderColor,
          // End of addition by Om shrivastava on 11-10-2024
          // Reason : Set the border color
          // border: "1px solid black",
          borderRadius: "5px",
          // boxShadow: "5px 5px 15px #aaaaaa, -5px -5px 15px #ffffff",
          padding: "25px",
          textAlign: "center",
          transition: "all 0.2s ease",
          cursor: "pointer",
          marginTop: "5px",
          // backgroundImage: `linear-gradient(145deg, ${statusColor}, #d5f5d5)`,
          // backgroundImage: statusColor,
          fontSize: "2px",
          marginBottom: "2px",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-10px)";
          // e.currentTarget.style.boxShadow =
          //   "5px 5px 20px #aaaaaa, -5px -5px 20px #ffffff";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          // e.currentTarget.style.boxShadow =
          //   "5px 5px 15px #aaaaaa, -5px -5px 15px #ffffff";
        }}
      >
        <div className={checkinStyle.buttonText}>
          <div className={checkinStyle.roomNumber}>{room.room_number}</div>
          <div className={checkinStyle.roomType}>{room.room_type}</div>
          {/**End of Code Addition and Modification by Tejasve Gupta on 15-07-2024
Reason - UI Enhancements and Addition of new fields*/}
        </div>
      </div>
    );
  };

  const RoomList = ({ rooms }) => {
    return (
      <div
        /**Code Modification By Tejasve Gupta on 20-07-2024
        Reason - Style Updated for responsive  */
        className={checkinStyle.roomCard}
        style={{
          display: "grid",
          justifyItems: "center",
          marginTop: "2px",
          width: "100%",
          gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", // Flexible columns
          gap: "0.5%", // Add some space between the items
          alignItems: "center",
          marginBottom: "2px",
        }}
        /**End of Code Modification By Tejasve Gupta on 20-07-2024
Reason - Style Updated for responsive  */
      >
        {rooms.map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}
      </div>
    );
  };
  /**End of Code Addition by Tejasve Gupta on 04-06-2024
   * reason - Creation of Card for Room Status
   */
// Added by akanksha on 23-01-2025
// Reason : to add selected room dropdown so that everu guest allot the particular room
const [guests, setGuests] = useState([]);

const handleAddGuestRow = () => {
  setGuests([...guests, { assignedRoom: "" }]);
};

const handleGuestRoomAssignment = (index, roomNumber) => {
  const updatedGuests = [...guests];
  updatedGuests[index].assignedRoom = roomNumber;
  setGuests(updatedGuests);
};

const validateRoomAssignments = () => {
  if (guests.some((guest) => !guest.assignedRoom)) {
    alert("Please assign all rooms to guests before proceeding.");
    return false;
  }
  return true;
};

// const handleRoomSelection = (roomNumber) => {
//   setFormData((prevData) => ({
//     ...prevData,
//     selectedRoom: roomNumber,
//   }));
// };
const handleRoomSelection = useCallback((guestIndex, selectedRoom) => {
  setGuestDetails((prevGuests) =>
    prevGuests.map((guest, index) =>
      index === guestIndex
        ? { ...guest, selectedRoom: selectedRoom || "-" } // Update only the selected guest
        : guest
    )
  );
}, []);




// end by akanksha on 23-01-2025
// Reason : to add selected room dropdown so that everu guest allot the particular room
  useEffect(() => {
    const number_of_persons =
      parseInt(formData.number_of_adults) +
      parseInt(formData.number_of_children);
    setFormData((prevData) => ({
      ...prevData,
      number_of_persons,
    }));
  }, [formData.number_of_adults, formData.number_of_children]);

  /**
   *  Added by - Ashish Dewangan on 26-09-2024
   * Reason - To count number of children and number of adult
   */
  useEffect(() => {
    var adults = 0;
    var children = 0;
    guestDetails.forEach((guest) => {
      if (guest.person_type == "adult") {
        adults++;
      } else {
        children++;
      }
    });
    setFormData((prevData) => ({
      ...prevData,
      number_of_adults: adults + 1,
      number_of_children: children,
    }));
  }, [guestDetails]);
  /**
   *  End of addition by - Ashish Dewangan on 26-09-2024
   * Reason - To count number of children and number of adult
   */

  /**Code Addition by Tejasve Gupta on 12-06-2024
         Reason - Code addition for Clearing form after submition*/

  const clearForm = () => {
    setFormData((prevData) => ({
      ...prevData,
      // Added by - Akanksha 0n 11/10/2024
      // Reason - To clear name title salutation
      salutation: "",
      // Added by - Akanksha 0n 11/10/2024
      // Reason - To clear name title salutation
      name: "",
      last_name: "",
      email: "",
      address: "",
      // Code Addition by Tejasve Gupta on 15-07-2024
      // Reason - addition of Country state and city Dropdown
      country: "",
      state: "",
      city: "",
      zip: "",
      dob: "",
      gender: "",
      // End of Code Addition by Tejasve Gupta on 15-07-2024
      // Reason - addition of Country state and city Dropdown
      phone: "",
      //Code modification by Tejasve Gupta on 14-06-2024
      // Reason - variable name changed as similar to backend
      id_card_type: "",
      //End of Code modification by Tejasve Gupta on 14-06-2024
      // Reason - variable name changed as similar to backend
      id_card_no: "",
      id_card_photo: null,
      id_card_photo_src: null,
      room_number: "",
      room_type: "",
      // arrival_date: "",
      // arrival_time: "",
      /**Code Commented By Tejasve Gupta on 02-08-2024
       * Reason - Removal of check-out date functionality from check-in form
       */
      // departure_date: "",
      // departure_time: "",
      /** End of Code Commented By Tejasve Gupta on 02-08-2024
       * Reason - Removal of check-out date functionality from check-in form
       */
      payment_method: "Cash",
      number_of_persons: 0,
      number_of_children: 0,
      number_of_adults: 0,
      advancePayment: 0,

      set_guest_name: "",
      guest_last_name: "",
      guest_id_card_type: "",
      guest_id_card_photo: null,
      guest_id_card_no: "",

      roomCharges: 0,
      subTotal: 0,
      taxable_amount: 0,
      total: 0,
      grandTotal: 0,
      gstValue: 0,
      dueAmount: 0,
      /**
       * Added by - Ashish Dewangan on 12-09-2024
       * Reason - To reset data to default
       */
      country_id: "IN",
      state_id: "CT",
      city_id: "Raipur",
      personal_detail_object: "",
      /**
       * End of addition by - Ashish Dewangan on 12-09-2024
       * Reason - To reset data to default
       */

      /**
       * Added by - Ashish Dewangan on 21-10-2024
       * Reason - To reset fields - purpose_of_visit, arrived from, destination
       */
      purpose_of_visit: "",
      arrived_from: "",
      destination: "",
      /**
       * End of addition by - Ashish Dewangan on 21-10-2024
       * Reason - To reset fields - purpose_of_visit, arrived from, destination
       */
    }));
    setSelectedRooms([]);
    setTotalCharges(0);
    setNumberOfDays(0);
    setContactNumberError("");
    setFirstNameError("");
    setLastNameError("");
    setArrivalDateError("");
    setGuestDetails([]);
    /**Code Commented By Tejasve Gupta on 02-08-2024
     * Reason - Removal of check-out date functionality from check-in form
     */
    // setDepartureDateError("");
    setArrivalTimeError("");
    // setDepartureTimeError("");
    /**End of Code Commented By Tejasve Gupta on 02-08-2024
     * Reason - Removal of check-out date functionality from check-in form
     */
    set_discount_percentage(0);
    set_discount_rupees(0);
    setDiscountIn("");
    setExtraPersonCharges("");

    setRoomError("");
    setIdTypeError("");
    setIdNumberError("");
    // Addition by Om Shrivastava on 30-09-2024
    // Reason : When user submit a form then need to clear the manual input field
    setShowManualInput(false);
    // End of addition by Om Shrivastava on 30-09-2024
    // Reason : When user submit a form then need to clear the manual input field
    /**
     * Commented by - Ashish Dewangan on 05-09-2024
     * Reason - It was setting gst to 0. Because of that new checkin was taking gst value as 0
     */
    // setGst(0);
    /**
     * End of comment by - Ashish Dewangan on 05-09-2024
     * Reason - It was setting gst to 0. Because of that new checkin was taking gst value as 0
     */
    setAdvancePayment(0);
    setGenderError("");
    setExtraPersonCharges(0);
    /**
     * Added by - Ashish Dewangan on 06-09-2024
     * Reason - to reset id image
     */
    var id_photo = document.getElementById("id_card_photo");
    if (id_photo) id_photo.value = null;
    /**
     * End of addition by - Ashish Dewangan on 06-09-2024
     * Reason - to reset id image
     */

    /**
     * Added by - Ashish Dewangan on 11-09-2024
     * Reason - To reset refundable amount, booking type and isRefundable
     */

    setRefundableAmount("");
    setIsRefundable("");
    setBookingType("Current");
    /**
     * End of addition by - Ashish Dewangan on 11-09-2024
     * Reason - To reset refundable amount, booking type and isRefundable
     */

    /**
     * Added by - Ashish Dewangan on 12-09-2024
     * Reason - To reset data to default
     */

    setSelectedCountry({
      value: "IN",
      label: "India",
    });
    setSelectedState({
      value: "CT",
      label: "Chhattisgarh",
    });
    setSelectedCity({
      value: "Raipur",
      label: "Raipur",
    });

    setPersonalDetailId("");
    /**
     * End of addition by - Ashish Dewangan on 12-09-2024
     * Reason - To reset data to default
     */

    /**
     * Added by - Ashish Dewangan on 22-09-2024
     * Reason - To reset validation message
     */
    setPrimaryIdImageError("");
    /**
     * End of addition by - Ashish Dewangan on 22-09-2024
     * Reason - To reset validation message
     */

    setIsOtherCitySelected(false);
  };

  /** End of Code Addition by Tejasve Gupta on 12-06-2024
         Reason - Code addition for Clearing form after submition*/

  // Code Addition By Tejasve Gupta on 27-06-2024
  // Reason - Addition of new fields

  /**Code Addition and Modification by Tejasve Gupta on 26-06-2026
Reason - UI Enhancements and Addition of new fields*/
  useEffect(() => {
    // Calculate room charges based on selected rooms and number of days
    /**Code Commented By Tejasve Gupta on 02-08-2024
     * Reason - Removal of days functionality from check-in form
     */
    const totalRoomCharges =
      // selectedRooms.reduce((total, room) => total + room.price, 0) *
      // numberOfDays;
      selectedRooms.reduce((total, room) => total + room.price, 0);
    /**end of Code Commented By Tejasve Gupta on 02-08-2024
     * Reason - Removal of days functionality from check-in form
     */
    setRoomCharges(isNaN(totalRoomCharges) ? 0 : totalRoomCharges);
  }, [selectedRooms]);

  // console.log("rooooooommmmm charges", roomCharges);

  // useEffect(() => {
  //   if (!isUpdating) {
  //     setIsUpdating(true);
  //     const discountRupees = ((formData.subTotal) * discount_percentage) / 100;
  //     set_discount_rupees(
  //       isNaN(discountRupees) ? 0 : parseFloat(discountRupees?.toFixed(2))
  //     );
  //   } else {
  //     setIsUpdating(false);
  //   }
  // }, [discount_percentage]);

  // useEffect(() => {
  //   if (!isUpdating) {
  //     setIsUpdating(true);
  //     const discountPercentage = (discount_rupees / (formData.subTotal)) * 100;
  //     set_discount_percentage(
  //       isNaN(discountPercentage)
  //         ? 0
  //         : parseFloat(discountPercentage.toFixed(2))
  //     );
  //   } else {
  //     setIsUpdating(false);
  //   }
  // }, [discount_rupees]);

  useEffect(() => {
    if (discountIn === "rupee") {
      const discountPercentage = (discount_rupees / formData.subTotal) * 100;
      set_discount_percentage(
        isNaN(discountPercentage)
          ? 0
          : parseFloat(discountPercentage.toFixed(2))
      );
    } else {
      const discountRupees = (formData.subTotal * discount_percentage) / 100;
      set_discount_rupees(
        isNaN(discountRupees) ? 0 : parseFloat(discountRupees?.toFixed(2))
      );
    }
  }, [discount_rupees, discount_percentage, formData.subTotal]);

  const calculateAmount = () => {
    var subTotal = formData.roomCharges + parseFloat(extraPersonCharges || 0);
    var taxableAmount = subTotal - parseFloat(discount_rupees || 0);

    var gstValue = (gst * taxableAmount) / 100;
    var total = taxableAmount + gstValue;
    /**
     * Modified by - Ashish Dewangan on 19-09-2024
     * Reason - To roundoff decimal points
     */
    // var grandTotal = total;
    // var dueAmount = grandTotal - parseFloat(advancePayment || 0);
    var grandTotal = Math.ceil(total);
    var dueAmount = Math.ceil(grandTotal - parseFloat(advancePayment || 0));
    /**
     * End of modification by - Ashish Dewangan on 19-09-2024
     * Reason - To roundoff decimal points
     */

    setFormData((prevFormData) => ({
      ...prevFormData,
      // roomCharges: roomCharges,
      subTotal: subTotal,
      taxable_amount: taxableAmount,
      gstValue: gstValue,
      total: total,
      grandTotal: grandTotal,
      dueAmount: dueAmount,
    }));
  };

  // Use useEffect to calculate amounts on relevant state/prop changes
  useEffect(() => {
    calculateAmount();
  }, [roomCharges, extraPersonCharges, gst, advancePayment, discount_rupees]);

  // const subtotal =
  //   roomCharges +
  //   parseFloat(extraPersonCharges || 0)
  // // - parseFloat(discount_rupees || 0);
  // const gstValue = subtotal * (gst / 100);
  // const grandTotal = subtotal + gstValue;
  // const dueAmount = grandTotal - parseFloat(advancePayment || 0);
  // const taxable_amount = subtotal - parseFloat(discount_rupees || 0);

  const handleDiscountTypeChange = (event) => {
    setDiscountIn(event.target.value);
    // Reset the corresponding input field when switching the discount type
    if (event.target.value === "percentage") {
      set_discount_rupees(0);
    } else {
      set_discount_percentage(0);
    }
  };

  const handleExtraChargesChange = (e) =>
    setExtraPersonCharges(parseFloat(e.target.value) || 0);
  const handlediscountRupeesChange = (e) =>
    set_discount_rupees(parseFloat(e.target.value) || 0);
  const handleDiscountPercentageChange = (e) =>
    set_discount_percentage(parseFloat(e.target.value) || 0);
  const handleGstRateChange = (e) => setGst(parseFloat(e.target.value) || 0);

  const handleAdvancePaymentChange = (e) => {
    // Code changed by - Ashlekh on 04-10-2024
    // Reason - To display error message if user adds more than room charge
    // setAdvancePayment(parseFloat(e.target.value) || 0);
    let advancePaymentValue = parseFloat(e.target.value) || 0;
    // if (advancePaymentValue > roomCharges) {
    //   advancePaymentValue = roomCharges;
    // }
    setAdvancePayment(advancePaymentValue);
    // End of code - Ashlekh on 04-10-2024
    // Reason - To display error message if user adds more than room charge
  };

  /**End of Code Addition and Modification by Tejasve Gupta on 26-06-2026
Reason - UI Enhancements and Addition of new fields*/

  // End of Code Addition By Tejasve Gupta on 27-06-2024
  // Reason - Addition of new fields

  // Addition by Om Shrivastava on 03-10-2024
  // Reason : Add the functionaltiy of select option in search box
  const handleOptionClick = (selectedName) => {
    setSelectedName(selectedName);

    const selectedDetail = customerList.find(
      (detail) => detail.name === selectedName || detail.phone === selectedName
    );
    setPersonalDetailId(selectedDetail.id);
    // Addition by Om Shrivastava on 24-10-2024
    // Reason : Set the value for other field
    var validIdCardTypes = [
      "Passport",
      "Driver's License",
      "Voter ID",
      "Aadhar",
      "Other",
    ];
    setShowManualInput(!validIdCardTypes.includes(selectedDetail.id_card_type));
    // End of addition by Om Shrivastava on 24-10-2024
    // Reason : Set the value for other field

    if (selectedDetail) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        personal_detail_object: selectedDetail.id || "",

        // Added by - Akanksha 0n 11/10/2024
        // Reason - To Set name title salutation
        salutation: selectedDetail.salutation || "",
        // Added by - Akanksha 0n 11/10/2024
        // Reason - To Set name title salutation

        name: selectedDetail.name || "",
        last_name: selectedDetail.last_name || "",
        dob: selectedDetail.dob || "",
        gender: selectedDetail.gender || "",
        phone: selectedDetail.phone || "",
        email: selectedDetail.email || "",
        address: selectedDetail.address || "",
        country: selectedDetail.country || "",
        state: selectedDetail.state || "",
        city: selectedDetail.city || "",
        zip:
          selectedDetail.zip && selectedDetail.zip !== 0
            ? selectedDetail.zip
            : "",
        id_card_no: selectedDetail.id_card_no || "",
        id_card_type: selectedDetail.id_card_type || "",
        id_card_photo: "",
        id_card_photo_src: selectedDetail.id_card_photo || "",
        country_id: selectedDetail.country_id,
        state_id: selectedDetail.state_id,
      }));

      setSelectedCountry({
        value: selectedDetail.country_id,
        label: selectedDetail.country,
      });
      setSelectedState({
        value: selectedDetail.state_id,
        label: selectedDetail.state,
      });
      setSelectedCity({
        value: selectedDetail.city,
        label: selectedDetail.city,
      });

      // Clear search term and customer list after selection
      setSearchTerm("");
      setCustomerList([]);

      // Reset error messages
      setFirstNameError("");
      setLastNameError("");
      setGenderError("");
      setContactNumberError("");
      setIdTypeError("");
      setIdNumberError("");
    }
  };
  // End of addition by Om Shrivastava on 03-10-2024
  // Reason : Add the functionaltiy of select option in search box

  return (
    <div className={checkinStyle.pageFrame}>
      {/** Code modification by Tejasve Gupta on 26-06-2024
     Reason - Change in CSS style*/}
      <div className={checkinStyle.coloredBackground}>
        <form onSubmit={handleSubmit} className={checkinStyle.form}>
          <div className={checkinStyle.checkinTitle}>
          <div className={checkinStyle.header}>
                  {/* Modification and addition by Om Shrivastava on 03-01-2025
                Reason : Add back icon  */}
                  <FiArrowLeft style={{position:'absolute',bottom:'5px',left:'10px',cursor:'pointer',fontSize:'24px'}} onClick={handleBackClick} />
                </div>
                {isPopupVisible && (
                  <div className="popupOverlay" onClick={handleOutsideClick}>
                    <div className="popup">
                      <p style={{fontSize:'14px',fontWeight:'400'}}>You will lose all the entered data</p>
                      <div className="popupActions">
                        <button onClick={handleOkClick}>Ok</button>
                        <button onClick={handleCancelClick}>Cancel</button>
                      </div>
                    </div>
                  </div>
                )}
                {/* End of code modification and addition by Om Shrivastava on 03-01-2025
                Reason : Add back icon  */}
            <div className={checkinStyle.checkinName}>Check-In</div>

            <div className={checkinStyle.dateTime}>
              {/**End of Code Modification and commented by Tejasve Gupta on 16-06-2024
              Reason - Live Date and Time added and Style add in css file*/}
              {currentDate()}&nbsp;|&nbsp;{nowTime.toLocaleTimeString()}
              {/** End of Code Modification by Tejasve Gupta on 18-06-2024
                Reason - Styles Updated as Suggested by Tester*/}
              {/* <div>
                {nowTime.toLocaleTimeString()}
              </div> */}
            </div>
          </div>
          <div
            className={checkinStyle.availabilityContainer}
            /**Code Modification by Tejasve Gupta on 05-06-2024
             * Reason - Change in Styles
             */
            style={
              {
                //   // border: "1px solid purple",
                //   display: "flex",
                //   flexDirection: "column",
                //   // justifyContent: "center",
                //   alignItems: "center",
                // width: "25vw",
              }
            }
          >
            {/* <legend className={checkinStyle.secionHeading}>
                  Check Avaiable Rooms
                </legend> */}
            <fieldset
              className={checkinStyle.availability}
              // style={{
              //   width: "90%",
              //   borderRadius: "5%",
              //   padding: "0.5%",
              //   // margin:"1%",
              // }}
            >
              {/** End of Code Modification by Tejasve Gupta on 05-06-2024
               * Reason - Change in Styles
               */}

              {/**Code Modification by Tejasve Gupta on 05-06-2024
               * Reason - Change in Styles
               */}
              <div className={checkinStyle.Status}>
                <div>
                  <span
                    className={
                      checkinStyle.circle + " " + checkinStyle.circle_red
                    }
                  ></span>{" "}
                  Reserved
                </div>
                <div>
                  <span
                    className={
                      checkinStyle.circle + " " + checkinStyle.circle_green
                    }
                  ></span>{" "}
                  Available
                </div>
                {/* Modification and addition by Om Shrivastava on 29-08-2024
                Reason : Remove the vacant section  */}
                {/* <div>
                  <span
                    className={
                      checkinStyle.circle + " " + checkinStyle.circle_yellow
                    }
                  ></span>{" "}
                  Vacant
                </div> */}
                <div>
                  <span
                    className={
                      checkinStyle.circle + " " + checkinStyle.circle_yellow
                    }
                  ></span>{" "}
                  Advance
                </div>
                {/* End of modification and addition by Om Shrivastava on 29-08-2024
                Reason : Remove the vacant section  */}
              </div>
              {/* <h1>Room Status</h1> */}
              {/**End of Code Modification by Tejasve Gupta on 05-06-2024
               * Reason - Change in Styles
               */}
              {/**Code Addition and Modification by Tejasve Gupta on 12-07-2026
                  Reason - UI Enhancements and Addition of new fields*/}
              <div className={checkinStyle.roomNumberTypeButtons}>
                <RoomList rooms={allRoomBookingDetails} />
              </div>
            </fieldset>

            {/**End of Code Modification by Tejasve Gupta on 06-06-2024
             * reason - UI changes as guided by Ashish sir
             */}
          </div>
          <div className={checkinStyle.formContainer}>
            <fieldset className={checkinStyle.dateTimeContainer}>
              <legend
                style={{
                  paddingTop: "2px",
                  textTransform: "uppercase",
                  fontSize: "var(--page-content-font-size)",
                  color: "black",
                }}
                className={checkinStyle.secionHeading}
              >
                Staying Details
              </legend>
              <div className={checkinStyle.dateAndRoomSelect}>
                {/**Code re-placed by Tejasve Gupta on 06-06-2024
                 * Reason - Rearranging the sequence as told by Tester for form design
                 */}
                {/* <div className={checkinStyle.datesContainer}> */}
                <div className={checkinStyle.arrival}>
                  {/**End of Code Modification by Tejasve Gupta on 06-06-2024
                   * reason - UI changes as guided by Ashish sir
                   */}
                  <div className={checkinStyle.StayInputPair}>
                    <div className={checkinStyle.starInput}>
                      <label
                        htmlFor="arrival_date"
                        className={checkinStyle.labelContainer}
                        style={{ paddingTop: "1.9%", width: "unset" }}
                      >
                        <span className={checkinStyle.mandatoryField}>* </span>
                        {/**Code Addition and Modification by Tejasve Gupta on 15-07-2026
							                Reason - UI Enhancements and Addition of new fields*/}
                        <span className={checkinStyle.roomNumberSectionFont}>
                          {" "}
                          Check-in date & time{" "}
                        </span>
                      </label>
                      {/* <div style={{ width: "20%" }}> : </div> */}
                    </div>
                    <div className={checkinStyle.dateTimeInput}>
                      <div className={checkinStyle.inputError}>
                        <input
                          className={checkinStyle.inputContainer}
                          type="date"
                          id="arrival_date"
                          name="arrival_date"
                          value={formData.arrival_date}
                          onChange={handleRoomChange}
                          tabIndex={18}
                          // Addition by Om Shrivastava on 12-10-2024
                          // Reason : When booking type current then need to disable the arrival time field
                          disabled={bookingType === "Current"}
                          // End of addition by Om Shrivastava on 12-10-2024
                          // Reason : When booking type current then need to disable the arrival time field
                          // Modification and addition by Om Shrivastava on 03-01-2025
                          // Reason : Handle the date picker according to advance or current booking room type 
                          // min={currentDate()}
                          min={bookingType !== "Advance" ? currentDate() : new Date().toISOString().split("T")[0]}
                          // End of modification and addition by Om Shrivastava on 03-01-2025
                          // Reason : Handle the date picker according to advance or current booking room type 
                          //Commented by Om Shrivastava on 08-10-2024
                          // Reason : No need to set validations in blur method
                          onBlur={(e) =>
                            isValidOnBlur("arrival_date", e.target.value)
                          }
                          //Commented by Om Shrivastava on 08-10-2024
                          // Reason : No need to set validations in blur method
                        />
                        {/* <button
                          className={checkinStyle.nowButton}
                          tabIndex={19}
                          type="button"
                          onClick={setTodayDate}
                        >
                          Today
                        </button> */}
                        {arrivalDateError && (
                          <span className={checkinStyle.error}>
                            {arrivalDateError}
                          </span>
                        )}
                      </div>
                      <div className={checkinStyle.inputError}>
                        <input
                          className={checkinStyle.inputContainer}
                          type="time"
                          id="arrival_time"
                          name="arrival_time"
                          value={formData.arrival_time}
                          tabIndex={20}
                          style={{ width: "90%" }}
                          // Addition by Om Shrivastava on 12-10-2024
                          // Reason : When booking type current then need to disable the arrival time field
                          disabled={bookingType === "Current"}
                          // End of addition by Om Shrivastava on 12-10-2024
                          // Reason : When booking type current then need to disable the arrival time field
                          onChange={handleRoomChange}
                          //Commented by Om Shrivastava on 08-10-2024
                          // Reason : No need to set validations in blur method
                          onBlur={(e) =>
                            isValidOnBlur("arrival_time", e.target.value)
                          }
                          //Commented by Om Shrivastava on 08-10-2024
                          // Reason : No need to set validations in blur method
                        />
                        {/* <button
                          className={checkinStyle.nowButton}
                          type="button"
                          onClick={setCurrenttime}
                          tabIndex={21}
                        >
                          Now
                        </button> */}
                        {arrivalTimeError && (
                          <span className={checkinStyle.error}>
                            {arrivalTimeError}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* <div className={checkinStyle.inputPair}>
                      <div className={checkinStyle.starInput}>
                        <label
                          htmlFor="arrival_time"
                          className={checkinStyle.labelContainer}
                          style={{ width: "90%" }}
                        >
                          <span className={checkinStyle.mandatoryField}>
                            *{" "}
                          </span>
                          Check-in Time
                        </label>
                        <div style={{ width: "20%" }}> : </div>
                      </div>                      
                    </div> */}
                  {/**Code Addition and Modification by Tejasve Gupta on 15-07-2026
                      Reason - UI Enhancements and Addition of new fields*/}
                  {/* </div> */}

                  {/* <div className={checkinStyle.departure}> */}
                  {/**Code Addition by Tejasve Gupta on 05-06-2024
                   * Reason - Calculation of no. of staying days
                   */}
                  {/* <div
                    className={checkinStyle.days}
                    style={{ display: "flex" }}
                  
                  >
                    <div
                    >
                      <label
                        htmlFor="number_of_days"
                        className={checkinStyle.labelContainer1}
                        style={{ fontWeight: "600" }}
                      
                      >
                        <span className={checkinStyle.optionalField}>* </span>
                        No. of Days
                      </label>
                      
                    </div>
                    
                    <span
                      style={{
                        
                        fontWeight: "600",
                       
                      }}
                    >
                      
                      {numberOfDays} {numberOfDays !== 1 ? "Days" : "Day"}
                    </span>
                   
                  </div> */}
                  {/**Code Commented By Tejasve Gupta on 02-08-2024
                   * Reason - Removal of check-out date functionality from check-in form
                   */}
                  {/* <div className={checkinStyle.StayInputPair}>
                    <div className={checkinStyle.starInput}>
                      <label
                        htmlFor="departure_date"
                        className={checkinStyle.labelContainer}
                      >
                        <span className={checkinStyle.mandatoryField}>* </span>
                        Check-out date & time
                      </label>
                    </div>
                    <div className={checkinStyle.dateTimeInput}>
                      <div className={checkinStyle.inputError}>
                        <input
                          className={checkinStyle.inputContainer}
                          type="date"
                          id="departure_date"
                          name="departure_date"
                          value={formData.departure_date}
                          onChange={handleRoomChange}
                          tabIndex={22}
                          onBlur={(e) =>
                            isValidOnBlur("departure_date", e.target.value)
                          }
                          min={formData.arrival_date}
                        />
                        {departureDateError && (
                          <span className={checkinStyle.error}>
                            {departureDateError}
                          </span>
                        )}
                      </div>
                      <div className={checkinStyle.inputError}>
                        <input
                          className={checkinStyle.inputContainer}
                          type="time"
                          id="departure_time"
                          name="departure_time"
                          value={formData.departure_time}
                          onChange={handleRoomChange}
                          tabIndex={23}

                          onBlur={(e) =>
                            isValidOnBlur("departure_time", e.target.value)
                          }
                        />
                        {departureTimeError && (
                          <span className={checkinStyle.error}>
                            {departureTimeError}
                          </span>
                        )}
                      </div>
                    </div>
                  </div> */}
                  {/**End of Code Commented By Tejasve Gupta on 02-08-2024
                   * Reason - Removal of check-out date functionality from check-in form
                   */}

                  {/* <div className={checkinStyle.inputPair}>
                      <div className={checkinStyle.starInput}>
                        <label
                          htmlFor="departure_time"
                          className={checkinStyle.labelContainer}
                          style={{ width: "90%" }}
                        >
                          <span className={checkinStyle.mandatoryField}>
                            *{" "}
                          </span>
                          Check-out Time
                        </label>
                        <div style={{ width: "20%" }}> : </div>
                      </div>
                    </div> */}
                  {/* </div> */}

                  {/**End of Code Addition by Tejasve Gupta on 05-06-2024
                   * Reason - Calculation of no. of staying days
                   */}
                </div>
                <div className={checkinStyle.bookingType}>
                  {/* Modification and addition by Om Shrivastava on 25-10-2024
                Reason : Set the label  */}
                  {/* <label
                    className={checkinStyle.SelectLabelContainer}
                    style={{ width: "90px", paddingTop: "1.5%" }}
                  > */}
                  <span
                    style={{ paddingTop: "4%", width: "120px" }}
                    className={checkinStyle.roomNumberSectionFont}
                  >
                    {" "}
                    Booking Type{" "}
                  </span>
                  {/* </label> */}
                  {/* End of modification and addition by Om Shrivastava on 25-10-2024
                Reason : Set the label  */}
                  <div className={checkinStyle.typeRefundable}>
                    {/* <Select */}
                    <AntdSelect
                      className={checkinStyle.inputContainer1}
                      defaultValue="Current"
                      style={{ width: "150%",backgroundColor:'white' }}
                      /**
                       * Added by - Ashish Dewangan on 11-09-2024
                       * Reason - To set value attribute and reset to default value when form is reset
                       */
                      value={bookingType}
                      /**
                       * End of addition by - Ashish Dewangan on 11-09-2024
                       * Reason - To set value attribute and reset to default value when form is reset
                       */
                      onChange={handleBookingTypeChange}
                    >
                      <Option value="Current">Current</Option>
                      <Option value="Advance">Advance</Option>
                      {/* </Select> */}
                    </AntdSelect>

                    {/* Commented by Om Shrivastava on 12-10-2024
                      Reason : No need to save the refundable amount  */}
                    {/* {bookingType === "Advance" && (
                      <div>
                        <div>
                          <label className={checkinStyle.labelContainer}>
                            Refundable
                          </label>
                          <AntdSelect
                            className={checkinStyle.inputContainer1}
                            onChange={handleRefundableChange}
                          >
                            <Option value="Yes">Yes</Option>
                            <Option value="No">No</Option>
                          </AntdSelect>
                        </div>

                        {isRefundable === "Yes" && (
                          <div>
                            <label>Refundable Amount</label>
                            <Input
                              className={checkinStyle.inputContainer1}
                              type="number"
                              value={refundableAmount}
                              onChange={(e) =>
                                setRefundableAmount(e.target.value)
                              }
                            />
                          </div>
                        )}
                      </div>
                    )} */}
                    {/* Commented by Om Shrivastava on 12-10-2024
                      Reason : No need to save the refundable amount  */}
                  </div>
                </div>

                {/**End of Code re-placed by Tejasve Gupta on 06-06-2024
                 * Reason - Rearranging the sequence as told by Tester for form design
                 */}
                <div className={checkinStyle.roomDetails}>
                  <div
                    className={checkinStyle.room}
                    style={{
                      display: "flex",
                      // flexDirection: "column",
                      // width: "40%",
                      marginLeft: "10px",
                      paddingTop: "1%",
                    }}
                  >
                    {/* Modification and addition by Om Shrivastava on 25-10-2024
                  Reason : Set the label  */}
                    {/* <label className={checkinStyle.SelectLabelContainer}> */}
                    {/* Modified by - Ashish Dewangan on 22-09-2024
                      Reason - To show different labels and astrik mark depending on room added or not */}
                    {/* <span className={checkinStyle.mandatoryField}>* </span> */}
                    {/* Select Room */}
                    {selectedRooms.length == 0 && (
                      <span
                        style={{ paddingTop: "1.8%" }}
                        className={checkinStyle.mandatoryField}
                      >
                        *{" "}
                      </span>
                    )}
                    <span
                      style={{ paddingTop: "1.8%", width: "120px" }}
                      className={checkinStyle.roomNumberSectionFont}
                    >
                      {selectedRooms.length > 0
                        ? "Add More Rooms"
                        : "Select Room"}
                    </span>
                    {/* End of modification by - Ashish Dewangan on 22-09-2024
                      Reason - To show different labels and astrik mark depending on room added or not */}
                    {/* </label> */}
                    {/* End of modification and addition by Om Shrivastava on 25-10-2024
                  Reason : Set the label  */}
                    {/* <div style={{ width: "20%" }}> : </div> */}
                    <div
                      className={checkinStyle.inputError}
                      style={{
                        marginTop: "1%",
                      }}
                    >
                      {/* // Modification and addition by Om Shrivastava on 01-06-2024
                        Reason : Set the value of room numbers */}
                    
                      <select
                        className={checkinStyle.selectRoomInputContainer}
                        id="roomNumber"
                        name="roomNumber"
                        value={formData.room_number}
                        onChange={handleRoomChange}
                        tabIndex={24}
                        style={{
                          overflowY: "auto",
                          maxHeight: "200px", 
                          position: "relative", 
                        }}
                        
                      >
                        <option value="" style={{ color: "grey" }}>
                          Select Room
                        </option>
                        {roomData.map((room) => (
                          <option
                            key={room.id}
                            value={room.id}
                            disabled={
                              selectedRooms.some(
                                (selectedRoom) =>
                                  selectedRoom.room_number === room.room_number
                              ) ||
                              allRoomBookingDetails.some(
                                (roomObject) =>
                                  room.room_number == roomObject.room_number &&
                                  roomObject.status == "Booked"
                              )
                            }
                          >
                            {room.room_number} ({room.room_type}) (
                            {room.variety})
                          </option>
                        ))}
                      </select>
                      {/* Modification and addition by Om Shrivastava on 25-10-2024
                      Reason : Set the error scroll up functionality */}
                      <div ref={errorRef}>
                        {roomError && (
                          <span className={checkinStyle.error}>
                            {roomError}
                          </span>
                        )}
                      </div>
                      {/* End of modification and addition by Om Shrivastava on 25-10-2024
                      Reason : Set the error scroll up functionality */}
                    </div>
                  </div>
                </div>
              </div>
              <div className={checkinStyle.selectedRoomsContainer}>
                {/* <label>
                          <span className={checkinStyle.optionalField}>* </span>
                          Rooms
                        </label> */}
                {/* //Code modification by Tejasve Gupta on 14-06-2024
  					              // Reason - style changed as similar to backend */}
                <table className={checkinStyle.roomsTable}>
                  {selectedRooms.length > 0 ? (
                    <thead>
                      <tr>
                        <th>Room Number</th>
                        <th>Room Type</th>
                        <th>Room Variety</th>
                        <th>Price</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                  ) : null}
                  <tbody>
                    {selectedRooms.map((room) => (
                      <tr key={room.room_number}>
                        <td>{room.room_number}</td>
                        <td>{room.room_type}</td>
                        <td>{room.variety}</td>
                        <td>{room.price}</td>
                        <td>
                          <button
                            onClick={() => handleDeleteRoom(room.room_number)}
                          >
                            {/**Code Modification by Tejasve Gupta on 20-06-2024
                                  Reason - icon added instead of button  */}
                            <MdDelete />
                            {/**End of Code Modification by Tejasve Gupta on 20-06-2024
                                          Reason - icon added instead of button  */}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </fieldset>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                // marginLeft: "auto",
                marginRight: "152px",
                paddingTop: "1%",
                // paddingBottom: "1%",
                gap: "6px",
              }}
            >
              {/* Commented by Om Shrivastava on 22-10-2024
            Reason : Comment the section  */}
              {/* <div
                className={checkinStyle.labelContainer}
                style={{
                  fontSize: "var(--page-subTitle-font-size)",
                  fontWeight: "500",
                  width:'unset'
                }}
              >
                Search by Name, Phone No or Id Number
              </div> */}
              {/* Commented by Om Shrivastava on 22-10-2024
            Reason : Comment the section  */}
              <div className={checkinStyle.searchableDropdown}>
                {/* Modification and addition by Om shrivastava on 03-10-2024
                        Reason : Redesign the search input */}
                {/* <input
                          style={{ width: "220px" }}
                          className={checkinStyle.inputContainer}
                          type="text"
                          value={searchTerm}
                          onChange={handleSearchChange}
                          placeholder="Search by name or phone"
                        /> */}

                {/* Refactored normal input to match Material-UI TextField */}
                <div
                  style={{
                    position: "relative",
                    maxWidth: "400px",
                  }}
                >
                  <input
                    className={checkinStyle.searchPlaceHolder}
                    style={{
                      // width: "102%",
                      width: "125%",

                      padding: "12px 60px 12px 10px", // Space for the icon button
                      borderRadius: "4px",
                      // border: "1px solid #c4c4c4",
                      border: "var(--input-border-color)",
                      outline: "none",
                      fontSize: "15px",
                    }}
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Search by Name, Phone No or Id Number"
                  />
                  {/* Clear and search icons */}
                  {searchTerm && (
                    <IconButton
                      style={{
                        position: "absolute",
                        right: "-98px", // Align clear button inside input
                        top: "50%",
                        transform: "translateY(-50%)",
                        backgroundColor: "#f5f5f5",
                        borderRadius: "50%",
                        padding: "6px",
                        fontSize: "17px",
                      }}
                      onClick={() => setSearchTerm("")}
                    >
                      <ClearIcon style={{ color: "#000", fontSize: "17px" }} />
                    </IconButton>
                  )}
                  <IconButton
                    style={{
                      position: "absolute",
                      right: "-130px", // Align search button inside input
                      top: "50%",
                      transform: "translateY(-50%)",
                      backgroundColor: "#007BFF",
                      borderRadius: "50%",
                      padding: "6px",
                      transition: "background-color 0.3s ease",
                      fontSize: "17px",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#0056b3")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "#007BFF")
                    }
                  >
                    <SearchIcon style={{ color: "#fff", fontSize: "17px" }} />
                  </IconButton>
                  {/* End of modification and addition by Om shrivastava on 03-10-2024
                            Reason : Redesign the search input */}

                  {searchTerm.length >= 3 && (
                    <div className={checkinStyle.dropdownContainer}>
                      {customerList.length > 0 ? (
                        <ul className={checkinStyle.dropdownList}>
                          {customerList.map((detail) => (
                            <li
                              key={detail.id}
                              // value={detail.name || detail.phone}
                              className={checkinStyle.dropdownItem}
                              onClick={() =>
                                handleOptionClick(detail.name || detail.phone)
                              }
                            >
                              {/* Addition by Om shrivastava on 16-10-2024
                            Reason : Add salutation  */}
                              {detail.salutation ? detail.salutation : null}{" "}
                              {/* End of addition by Om shrivastava on 16-10-2024
                            Reason : Add salutation  */}
                              {detail.name} ({detail.phone})
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className={checkinStyle.noRecords}>
                          No records found
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {/* Modified by - Ashish Dewangan on 11-09-2024
                        Reason - To search after 3rd character is typed */}
                {/* {searchTerm.length > 3 && ( */}
                {/* Commented by Om Shrivastava on 03-10-2024
                        Reason : Remove the search select & option  */}
                {/* {searchTerm.length >= 3 && (
                          
                          <select
                            
                            // value={selectedName} // Bind selectedName to value
                            onChange={handleSelectChange}
                           
                            size={5} // Optionally set size to show more options
                          >
                            <option value="" disabled>
                              Select a name or phone
                            </option>
                            {customerList.length > 0 ? (
                              customerList.map((detail) => (
                                <option
                                  key={detail.id}
                                  value={detail.name || detail.phone}
                                >
                                  {detail.name} ({detail.phone})
                                </option>
                              ))
                            ) : (
                              <option value="" disabled>
                                No records found
                              </option>
                            )}
                          </select>
                        )} */}
                {/* End of commented by Om Shrivastava on 03-10-2024
                        Reason : Remove the search select & option  */}
              </div>
            </div>
            <div className={checkinStyle.formContainer2}>
              <div className={checkinStyle.leftContainer}>
                {/**Code Modification by Tejasve Gupta on 05-06-2024
                 * Reason - Change in Styles
                 */}
                <legend
                  style={{
                    paddingTop: "2px",
                    textTransform: "uppercase",
                    fontSize: "var(--page-content-font-size)",
                    color: "black",
                  }}
                  className={checkinStyle.secionHeading}
                >
                  Guest Details
                </legend>
                {/* <div className={checkinStyle.guestRow}>
                  <span className={checkinStyle.guestLabel}>
                    Select Room
                  </span>
                  <select
                    className={checkinStyle.roomDropdown}
                    value={formData.selectedRoom || ""}
                    onChange={(e) => handleRoomSelection(e.target.value)}
                  >
                    <option value="" disabled>
                      Select Room
                    </option>
                    {selectedRooms.map((room) => (
                      <option
                        key={room.room_number}
                        value={room.room_number}
                      >
                        {room.room_number} ({room.room_type}) ({room.variety})
                      </option>
                    ))}
                  </select>
                </div> */}

                <fieldset className={checkinStyle.guestContainer}>
                  {/**End of Code Modification by Tejasve Gupta on 16-06-2024
                  Reason - Live Date and Time added and Style adjusted*/}
                  {/**Code Modification by Tejasve Gupta on 05-06-2024
                   * Reason - Change in Styles
                   */}

                  {/**Code Modification by Tejasve Gupta on 06-06-2024
                   Reason - Form Sequence changed Guided by Ashish sir*/}

                  <div className={checkinStyle.personalDetails}>
                    <div className={checkinStyle.nameContainer}>
                      {/* commented by akanksha on 11th oct , reason : to add salutation droop down in name field
                       <div className={checkinStyle.inputRow}>
                        <div className={checkinStyle.starLabelColon}>
                          <select 
                            className={checkinStyle.inputContainer}
                            id="salutation"
                            name="salutation"
                            tabIndex={1}
                            value={formData.salutation}
                            onChange={handleRoomChange}>
                              <option value="mr">Mr</option>
                              <option value="mrs">Mrs</option>
                          </select>
                        </div>
                      </div>
                        end of commented by akanksha on 11th oct , reason : to add salutation droop down in name field */}

                      <div
                        className={checkinStyle.inputPair}
                        // style={{border:'1px solid yellow'}}
                      >
                        <div
                          /** Code Commented by Tejasve Gupta on 18-06-2024
                          Reason - Styles updated in CSS file*/
                          className={checkinStyle.starLabelColon}
                          // style={{
                          //   // border: "1px solid red",
                          //   display: "flex",
                          //   width: "95%",
                          // }}
                        >
                          <label
                            htmlFor="name"
                            className={checkinStyle.labelContainer}
                            // style={{ width: "90%" }}
                          >
                            {/** End of Code Commented by Tejasve Gupta on 18-06-2024
                            Reason - Styles updated in CSS file*/}
                            <span className={checkinStyle.mandatoryField}>
                              *{" "}
                            </span>
                            First Name
                          </label>
                          {/* <div style={{ width: "20%" }}> : </div> */}
                        </div>
                        <div
                          className={checkinStyle.inputError}
                          // style={{ width: "50%" }}
                        >
                          {/* commented by akanksha on 11th oct , reason : to add salutation droop down in name field <input 
                            className={checkinStyle.inputContainer}
                            type="text"
                            id="salutation"
                            salutation="salutation"
                            value={formData={}}
                           /> end of commented by akanksha on 11th oct , reason : to add salutation droop down in name field */}
                          {/* Addition and Modification by akanksha on 11Oct
                           Reason : to add salutation drop down in name field */}
                          <div className={checkinStyle.inputRow}>
                            <div
                              // className={checkinStyle.inputContainers}
                              className={`${checkinStyle.inputContainers} ${checkinStyle.firstNameInput}`}
                            >
                              <select
                                className={checkinStyle.selectInput}
                                id="salutation"
                                name="salutation"
                                tabIndex={1}
                                value={formData.salutation}
                                // Modification and addition by Om Shrivastava on 29-10-2024
                                // Reason : Set the width 
                                // style={{ width: "38px", fontSize: "12px" }}
                                style={{ width: "60px", fontSize: "12px" }}
                                // End of addition by Om Shrivastava on 29-10-2024
                                // Reason : Set the width  
                                onChange={handleRoomChange}
                              >
                                <option value="Mr">Mr</option>
                                <option value="Master">Master</option>
                                <option value="Mrs">Mrs</option>
                                <option value="Ms">Ms</option>
                              </select>
                              <span className={checkinStyle.pipeSeparator}>
                                |
                              </span>
                              <input
                                className={checkinStyle.textInput}
                                type="text"
                                id="name"
                                name="name"
                                tabIndex={1}
                                placeholder="First Name"
                                value={formData.name}
                                /**
                                 * Added by - Ashish Dewangan on 15-09-2024
                                 * Reason - To allow only alphabets to be entered
                                 */
                                maxLength={49}
                                onInput={onlyAllowAlphabets}
                                /**
                                 * End of addition by - Ashish Dewangan on 15-09-2024
                                 * Reason - To allow only alphabets to be entered
                                 */
                                onChange={handleRoomChange}
                                //Commented by Om Shrivastava on 08-10-2024
                                // Reason : No need to set validations in blur method
                                onBlur={(e) =>
                                  isValidOnBlur("name", e.target.value)
                                }
                                //Commented by Om Shrivastava on 08-10-2024
                                // Reason : No need to set validations in blur method
                              />
                              {/* End of addition and modification by akanksha on 11Oct
                           Reason : to add salutation drop down in name field */}
                            </div>
                          </div>
                          {firstNameError && (
                            <span className={checkinStyle.error}>
                              {firstNameError}
                            </span>
                          )}{" "}
                        </div>
                      </div>
                      <div className={checkinStyle.inputPair}>
                        <div className={checkinStyle.starLabelColon}>
                          <label
                            htmlFor="last_name"
                            className={checkinStyle.labelContainer}
                          >
                            <span className={checkinStyle.mandatoryField}>
                              *{" "}
                            </span>
                            Last Name
                          </label>
                        </div>
                        <div className={checkinStyle.inputError}>
                          <input
                            className={checkinStyle.inputContainer}
                            type="text"
                            id="last_name"
                            name="last_name"
                            placeholder="Last Name"
                            value={formData.last_name}
                            tabIndex={2}
                            /**
                             * Added by - Ashish Dewangan on 15-09-2024
                             * Reason - To allow only alphabets to be entered
                             */
                            maxLength={49}
                            onInput={onlyAllowAlphabets}
                            /**
                             * End of addition by - Ashish Dewangan on 15-09-2024
                             * Reason - To allow only alphabets to be entered
                             */
                            onChange={handleRoomChange}
                            //Commented by Om Shrivastava on 08-10-2024
                            // Reason : No need to set validations in blur method
                            onBlur={(e) =>
                              isValidOnBlur("last_name", e.target.value)
                            }
                            //Commented by Om Shrivastava on 08-10-2024
                            // Reason : No need to set validations in blur method
                          />
                          {lastNameError && (
                            <span className={checkinStyle.error}>
                              {lastNameError}
                            </span>
                          )}{" "}
                        </div>
                      </div>
                      {/**Code Addition and Modification by Tejasve Gupta on 15-07-2026
						        Reason - UI Enhancements and Addition of new fields*/}
                      {/* Code Addition by Tejasve Gupta on 18-07-2024
                    Reason - To get user's DOB and Gender */}

                      <div className={checkinStyle.inputPair}>
                        <div className={checkinStyle.starLabelColon}>
                          <label
                            htmlFor="gender"
                            className={checkinStyle.labelContainer}
                          >
                            <span className={checkinStyle.mandatoryField}>
                              *{" "}
                            </span>
                            Gender
                          </label>
                        </div>
                        <div className={checkinStyle.inputError}>
                          <select
                            // className={checkinStyle.selectInputContainer}
                            className={`${checkinStyle.selectInputContainer} ${checkinStyle.genderInput}`}
                            id="gender"
                            name="gender"
                            value={formData.gender}
                            tabIndex={4}
                            onChange={handleRoomChange}
                            /**Code Addition and Modificaton by Tejasve Gupta on 02-08-2024 
                              Reason - Mandatory gender field*/
                            //Commented by Om Shrivastava on 08-10-2024
                            // Reason : No need to set validations in blur method
                            onBlur={(e) =>
                              isValidOnBlur("gender", e.target.value)
                            }
                            //Commented by Om Shrivastava on 08-10-2024
                            // Reason : No need to set validations in blur method
                            /**End of Code Addition and Modificaton by Tejasve Gupta on 02-08-2024 
                       Reason - Mandatory gender field*/
                          >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>

                          {genderError && (
                            <span className={checkinStyle.error}>
                              {genderError}
                            </span>
                          )}
                        </div>
                      </div>
                      {/* End of Code Addition by Tejasve Gupta on 18-07-2024
                    Reason - To get user's DOB and Gender */}
                    </div>

                    <div className={checkinStyle.contactContainer}>
                      <div className={checkinStyle.inputPair}>
                        <div className={checkinStyle.starLabelColon}>
                          <label
                            htmlFor="phone"
                            className={checkinStyle.labelContainer}
                          >
                            <span className={checkinStyle.mandatoryField}>
                              *{" "}
                            </span>
                            Phone Number
                          </label>
                        </div>
                        <div className={checkinStyle.inputError}>
                          <input
                            className={checkinStyle.inputContainer}
                            type="tel"
                            id="phone"
                            name="phone"
                            placeholder="Phone Number"
                            value={formData.phone}
                            tabIndex={5}
                            maxLength={10}
                            /**
                             * Added by - Ashish Dewangan on 15-09-2024
                             * Reason - To allow only numbers to be entered
                             */
                            onInput={onlyAllowNumberInput}
                            /**
                             * End of addition by - Ashish Dewangan on 15-09-2024
                             * Reason - To allow only numbers to be entered
                             */
                            onChange={handleRoomChange}
                            //Commented by Om Shrivastava on 08-10-2024
                            // Reason : No need to set validations in blur method
                            onBlur={(e) =>
                              isValidOnBlur("phone", e.target.value)
                            }
                            //Commented by Om Shrivastava on 08-10-2024
                            // Reason : No need to set validations in blur method
                          />
                          {contactNumberError && (
                            <span className={checkinStyle.error}>
                              {contactNumberError}
                            </span>
                          )}
                        </div>
                      </div>
                      {/**End of Code Addition and Modification by Tejasve Gupta on 15-07-2026
                    Reason - UI Enhancements and Addition of new fields*/}

                      <div className={checkinStyle.inputPair}>
                        <div className={checkinStyle.starLabelColon}>
                          <label
                            htmlFor="date"
                            className={checkinStyle.labelContainer}
                          >
                            <span className={checkinStyle.optionalField}>
                              *{" "}
                            </span>
                            Date of Birth
                          </label>
                        </div>
                        <div className={checkinStyle.inputError}>
                          <input
                            className={checkinStyle.inputContainer}
                            type="date"
                            id="dob"
                            name="dob"
                            value={formData.dob}
                            tabIndex={3}
                            onChange={handleRoomChange}
                            //Commented by Om Shrivastava on 08-10-2024
                            // Reason : No need to set validations in blur method
                            onBlur={(e) => isValidOnBlur("dob", e.target.value)}
                            //Commented by Om Shrivastava on 08-10-2024
                            // Reason : No need to set validations in blur method
                          />
                          {/* {lastNameError && (
                          <span className={checkinStyle.error}>
                            {lastNameError}
                          </span>
                        )}{" "} */}
                        </div>
                      </div>

                      <div className={checkinStyle.inputPair}>
                        <div
                          /** Code Commented by Tejasve Gupta on 18-06-2024
                          Reason - Styles updated in CSS file*/
                          className={checkinStyle.starLabelColon}
                          // style={{
                          //   // border: "1px solid red",
                          //   display: "flex",
                          //   width: "95%",
                          // }}
                        >
                          <label
                            htmlFor="email"
                            className={checkinStyle.labelContainer}
                            // style={{ width: "90%" }}
                          >
                            {/** End of Code Commented by Tejasve Gupta on 18-06-2024
                            Reason - Styles updated in CSS file*/}
                            <span className={checkinStyle.optionalField}>
                              *{" "}
                            </span>
                            Email
                          </label>
                          {/* <div style={{ width: "20%" }}> : </div> */}
                        </div>
                        <div
                          className={checkinStyle.inputError}
                          // style={{ width: "50%" }}
                        >
                          <input
                            className={checkinStyle.inputContainer}
                            type="email"
                            id="email"
                            placeholder="Email ID"
                            name="email"
                            value={formData.email}
                            onChange={handleRoomChange}
                            tabIndex={6}
                          />
                        </div>
                      </div>

                      {/* Code commented and Addition by Tejasve Gupta on 21-07-2024
                      Reason - Style Adjustments */}
                      {/* <div className={checkinStyle.inputPair}>
                      <div className={checkinStyle.starLabelColon}>
                        <label
                          htmlFor="zip"
                          className={checkinStyle.labelContainer}
                        >
                          <span className={checkinStyle.optionalField}>* </span>
                          Zip
                        </label>
                      </div>
                      <div className={checkinStyle.inputError}>
                        <input
                          className={checkinStyle.ZipInputContainer}
                          type="zip"
                          placeholder="Zip Code"
                          id="zip"
                          name="zip"
                          value={formData.zip}
                          onChange={handleRoomChange}
                          tabIndex={8}
                          onBlur={(e) => isValidOnBlur("zip", e.target.value)}
                        />
                      </div>
                    </div> */}
                      {/* Code commented and Addition by Tejasve Gupta on 21-07-2024
                      Reason - Style Adjustments */}
                    </div>

                    <div
                      // className={checkinStyle.idContainer}
                      className={`${checkinStyle.idContainer} ${checkinStyle.idContainer2}`}
                    >
                      {/* <div className={checkinStyle.idTypeImage}> */}
                      {/**End of Code Modification by Tejasve Gupta on 06-06-2024
                       * reason - UI changes as guided by Ashish sir
                       */}
                      <div className={checkinStyle.inputPair}>
                        <div
                          /** Code Commented by Tejasve Gupta on 18-06-2024
                                  Reason - Styles updated in CSS file*/
                          className={checkinStyle.starLabelColon}
                          // style={{
                          //   // border: "1px solid red",
                          //   display: "flex",
                          //   width: "95%",
                          // }}
                        >
                          <label
                            htmlFor="id_card_type"
                            className={checkinStyle.labelContainer}
                            // style={{ width: "90%" }}
                          >
                            {/**End of Code Commented by Tejasve Gupta on 18-06-2024
                                    Reason - Styles updated in CSS file*/}
                            <span className={checkinStyle.mandatoryField}>
                              *{" "}
                            </span>
                            ID Type
                          </label>
                          {/* <div style={{ width: "20%" }}> : </div> */}
                        </div>
                        {/* Condition added by Om Shrivastava on 30-09-2024
                        Reason : When user clear the other option field then this section is show  */}
                        {!showManualInput && (
                          <div className={checkinStyle.inputError}>
                            <select
                              className={checkinStyle.selectInputContainer}
                              id="id_card_type"
                              name="id_card_type"
                              placeholder="Id Card Type"
                              value={formData.id_card_type}
                              onChange={handleRoomChange}
                              tabIndex={12}
                              //Commented by Om Shrivastava on 08-10-2024
                              // Reason : No need to set validations in blur method
                              // onBlur={(e) =>
                              //   isValidOnBlur(e.target.name, e.target.value)
                              // }
                              //Commented by Om Shrivastava on 08-10-2024
                              // Reason : No need to set validations in blur method
                              // required
                            >
                              {/**Code Modification by Tejasve Gupta on 06-06-2024
                               * reason - UI changes as guided by Ashish sir
                               */}
                              <option disabled value="">
                                Select
                              </option>
                              <option value="Passport">Passport</option>
                              <option value="Driver's License">
                                {/* Driver's License */}
                                Driving License
                              </option>
                              <option value="Voter I'd">Voter I'd</option>

                              <option value="Aadhar">Aadhar</option>
                              <option value="Other">Other</option>
                            </select>
                            {/**Code Addition by Tejasve Gupta on 02-08-2024
                             * Reason - Manually input of idType if Other option is selected
                             */}
                            {idTypeError && (
                              <div
                                // Addition by Om Shrivastava on 24-10-2024
                                // Reason : Set the validation paddinleft
                                style={{ paddingLeft: "10%" }}
                                // End of addition by Om Shrivastava on 24-10-2024
                                // Reason : Set the validation paddinleft
                                className={checkinStyle.validationError}
                              >
                                {idTypeError}
                              </div>
                            )}
                          </div>
                        )}
                        {/* Condition added by Om Shrivastava on 30-09-2024
                        Reason : When user clear the other option field then this section is show  */}
                        {showManualInput && (
                          <>
                            <div className={checkinStyle.inputError}>
                              <input
                                className={checkinStyle.inputContainer}
                                type="text"
                                id="manual_id_type"
                                name="manual_id_type"
                                placeholder="Enter ID Type"
                                value={formData.id_card_type}
                                onChange={handleManualInputChange}
                                tabIndex={13}
                                //Commented by Om Shrivastava on 08-10-2024
                                // Reason : No need to set validations in blur method
                                // onBlur={(e) =>
                                //   isValidOnBlur(e.target.name, e.target.value)
                                // }
                                //Commented by Om Shrivastava on 08-10-2024
                                // Reason : No need to set validations in blur method
                              />
                            </div>
                            {idTypeError && (
                              <div className={checkinStyle.validationError}>
                                {idTypeError}
                              </div>
                            )}
                          </>
                        )}
                        {/* // Addition by Om Shrivastava on 01-10-2024
                        // Reason : Handle the popup message  */}
                        {showPopup && (
                          <div className={checkinStyle.popupContainer}>
                            <div className={checkinStyle.popupContent}>
                              <h3>Switch to Dropdown?</h3>
                              <p>
                                Do you want to switch back to the dropdown to
                                select the ID type?
                              </p>
                              <div className={checkinStyle.popupActions}>
                                <button
                                  className={`${checkinStyle.popupButton} ${checkinStyle.yesButton}`}
                                  onClick={() => handlePopupChoice("yes")}
                                >
                                  Yes
                                </button>
                                <button
                                  className={`${checkinStyle.popupButton} ${checkinStyle.noButton}`}
                                  onClick={() => handlePopupChoice("no")}
                                >
                                  No
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                        {/* // End of addition by Om Shrivastava on 01-10-2024
          // Reason : Handle the popup message  */}
                        {/**End of Code Addition by Tejasve Gupta on 02-08-2024
                         * Reason - Manually input of idType if Other option is selected
                         */}
                      </div>

                      {/* </div> */}

                      <div className={checkinStyle.inputPair}>
                        {/**Code Commented by Tejasve Gupta on 18-06-2024
                              Reason - Styles updated in CSS file*/}
                        <div
                          className={checkinStyle.starLabelColon}
                          // style={{
                          //   // border: "1px solid red",
                          //   display: "flex",
                          //   width: "95%",
                          // }}
                        >
                          <label
                            htmlFor="id_card_no"
                            className={checkinStyle.labelContainer}
                            // style={{ width: "90%" }}
                          >
                            {/**End of Code Commented by Tejasve Gupta on 18-06-2024
                              Reason - Styles updated in CSS file*/}
                            <span className={checkinStyle.mandatoryField}>
                              *{" "}
                            </span>
                            ID Number
                          </label>
                          {/* <div style={{ width: "20%" }}> : </div> */}
                        </div>
                        <div className={checkinStyle.inputError}>
                          <input
                            className={checkinStyle.inputContainer}
                            type="text"
                            id="id_card_no"
                            name="id_card_no"
                            value={formData.id_card_no}
                            tabIndex={13}
                            onChange={handleRoomChange}
                            placeholder="ID Number"
                            //Commented by Om Shrivastava on 08-10-2024
                            // Reason : No need to set validations in blur method
                            // required
                            onBlur={
                              () =>
                                //Code modification by Tejasve Gupta on 14-06-2024
                                // Reason - variable name changed as similar to backend
                                isValidOnBlur("id_card_no", formData.id_card_no)
                              //End of Code modification by Tejasve Gupta on 14-06-2024
                              // Reason - variable name changed as similar to backend
                            }
                            //Commented by Om Shrivastava on 08-10-2024
                            // Reason : No need to set validations in blur method
                          />
                          {idNumberError && (
                            <div className={checkinStyle.error}>
                              {idNumberError}
                            </div>
                          )}
                        </div>
                      </div>

                      <div
                        // className={checkinStyle.inputPair}
                        className={checkinStyle.imageContainer}
                      >
                        <div className={checkinStyle.starLabelColonImage}>
                          <label
                            htmlFor="id_card_photo"
                            className={checkinStyle.labelContainer}
                          >
                            {/* Modified by - Ashish Dewangna on 22-09-2024
                              Reason - To make it optional if customer has been selected by search option */}
                            {/* <span className={checkinStyle.optionalField}> */}
                            {formData.id_card_photo_src &&
                            typeof formData.id_card_photo_src === "string" &&
                            formData.id_card_photo_src.lastIndexOf(".") !==
                              -1 ? (
                              <span className={checkinStyle.optionalField}>
                                *{" "}
                              </span>
                            ) : (
                              <span className={checkinStyle.mandatoryField}>
                                *{" "}
                              </span>
                            )}
                            {/* Modified by - Ashish Dewangna on 22-09-2024
                              Reason - To make it optional if customer has been selected by search option */}
                            Upload Image
                          </label>
                        </div>
                        <div className={checkinStyle.inputError}>
                          <input
                            className={checkinStyle.inputContainerImage}
                            // className={`${checkinStyle.inputContainerImage} ${checkinStyle.hideFileName}`}

                            style={{ width: "fit-content", marginLeft: "5px" }}
                            type="file"
                            id="id_card_photo"
                            name="id_card_photo"
                            accept="image/*"
                            tabIndex={14}
                            // onBlur={(e) =>
                            //   isValidOnBlur("id_card_photo", e.target.value)
                            // }
                            onChange={handleFileChange}
                          />
                          {/* Added by - Ashish Dewangna on 22-09-2024
                              Reason - To make it optional if customer has been selected by search option */}
                          {formData.id_card_photo_src &&
                          typeof formData.id_card_photo_src === "string" &&
                          formData.id_card_photo_src.lastIndexOf(".") !== -1 ? (
                            <></>
                          ) : (
                            primaryIdImageError && (
                              <div
                                className={checkinStyle.error}
                                style={{ flexDirection: "row" }}
                              >
                                {primaryIdImageError}
                              </div>
                            )
                          )}
                          {/* End of addition by - Ashish Dewangna on 22-09-2024
                              Reason - To make it optional if customer has been selected by search option */}

                          {/* Display the image preview */}
                          {/* Modified by - Ashish Dewangan on 06-09-2024
                          Reason - To show image if it exists  */}
                          {/* {formData.id_card_photo_src && (
                            <div>
                              <img
                                src={
                                  typeof formData.id_card_photo_src === "string"
                                    ? `${baseURL + formData.id_card_photo_src}`
                                    : imagePreviewUrl // Uploaded image preview
                                }
                                alt="ID Card"
                                className={checkinStyle.imgThumbnail}
                              />
                            </div>
                          )} */}
                          {formData.id_card_photo_src &&
                            typeof formData.id_card_photo_src === "string" &&
                            formData.id_card_photo_src.lastIndexOf(".") !==
                              -1 && (
                              <div>
                                <img
                                  src={`${
                                    baseURL + formData.id_card_photo_src
                                  }`}
                                  alt="ID Card"
                                  className={checkinStyle.imgThumbnail}
                                />
                              </div>
                            )}
                        </div>

                        {/* End of modifiac by - Ashish Dewangan on 06-09-2024
                          Reason - To show image if it exists  */}
                      </div>
                    </div>

                    <div className={checkinStyle.addressContainer}>
                      {/* Code Addition by Tejsve Gupta on 18-07-2024
                        Reason - To add  Country, state, city dropdown */}
                      <div className={checkinStyle.inputPair}>
                        <div className={checkinStyle.starLabelColon}>
                          <label
                            htmlFor="country"
                            className={checkinStyle.labelContainer}
                          >
                            <span className={checkinStyle.optionalField}>
                              *{" "}
                            </span>
                            Country
                          </label>
                        </div>
                        {/* Modified by - Ashish Dewangan on 12-09-2024
                        Reason - Changed the library for country state and city */}
                        {/* <CountrySelect
                          onChange={handleCountryChange}
                          tabIndex={9}
                          placeHolder="Select Country"
                          value={formData.country}
                         
                        /> */}
                        <Select
                          className={checkinStyle.selectbox}
                          tabIndex={9}
                          onChange={handleCountryChange}
                          placeHolder="Select Country"
                          value={selectedCountry}
                          options={countries}
                          // Addition by Om Shrivastava on 29-10-2024
                          // Reason : Set the height and minheight of country 
                          styles={{
                            control:base=>({
                            ...base,
                            height:35,
                            minHeight:35
                            })
                          }}
                          // End of addition by Om Shrivastava on 29-10-2024
                          // Reason : Set the height and minheight of country 
                        ></Select>
                        {/* ENd of modification by - Ashish Dewangan on 12-09-2024
                        Reason - Changed the library for country state and city */}
                      </div>
                      <div className={checkinStyle.inputPair}>
                        <div className={checkinStyle.starLabelColon}>
                          <label
                            htmlFor="state"
                            className={checkinStyle.labelContainer}
                          >
                            <span className={checkinStyle.optionalField}>
                              *{" "}
                            </span>
                            State
                          </label>
                        </div>
                        <div className={checkinStyle.inputError}>
                          {/* Modified by - Ashish Dewangan on 12-09-2024
                        Reason - Changed the library for country state and city */}
                          {/* <StateSelect
                            countryid={countryid}
                            tabIndex={10}
                            onChange={handleStateChange}
                            placeHolder="Select State"
                            value={formData.state}
                          /> */}
                          <Select
                            className={checkinStyle.selectbox}
                            tabIndex={10}
                            onChange={handleStateChange}
                            placeHolder="Select State"
                            value={selectedState}
                            options={states}
                            // Addition by Om Shrivastava on 29-10-2024
                          // Reason : Set the height and minheight of country 
                          styles={{
                            control:base=>({
                            ...base,
                            height:35,
                            minHeight:35
                            })
                          }}
                          // End of addition by Om Shrivastava on 29-10-2024
                          // Reason : Set the height and minheight of country 
                          ></Select>
                          {/* End of modification by - Ashish Dewangan on 12-09-2024
                        Reason - Changed the library for country state and city */}
                        </div>
                      </div>
                      <div className={checkinStyle.inputPair}>
                        <div className={checkinStyle.starLabelColon}>
                          <label
                            htmlFor="city"
                            className={checkinStyle.labelContainer}
                          >
                            <span className={checkinStyle.optionalField}>
                              *{" "}
                            </span>
                            City
                          </label>
                        </div>
                        {/* Modified by - Ashish Dewangan on 12-09-2024
                        Reason - Changed the library for country state and city */}
                        {/* <CitySelect
                          countryid={countryid}
                          stateid={stateid}
                          tabIndex={11}
                          onChange={handleCityChange}
                          placeHolder="Select City"
                          value={formData.city}
                        /> */}
                        <Select
                          className={checkinStyle.selectbox}
                          tabIndex={11}
                          onChange={handleCityChange}
                          placeHolder="Select City"
                          value={selectedCity}
                          options={cities}
                          // Addition by Om Shrivastava on 29-10-2024
                          // Reason : Set the height and minheight of country 
                          styles={{
                            control:base=>({
                            ...base,
                            height:35,
                            minHeight:35,
                            })
                          }}
                          // End of addition by Om Shrivastava on 29-10-2024
                          // Reason : Set the height and minheight of country 
                        ></Select>
                        {/* End of modification by - Ashish Dewangan on 12-09-2024
                        Reason - Changed the library for country state and city */}

                        {/* Added by - Ashish Dewangan on 23-09-2024
                        Reason - If other option is selected from city dropdown then
                        an inputbox will be shown to type city name*/}
                        {isOtherCitySelected && (
                          <div className={checkinStyle.inputError}>
                            <input
                              className={checkinStyle.ZipInputContainer}
                              type="text"
                              placeholder="City Name"
                              id="otherCity"
                              name="otherCity"
                              style={{ width: "90%", marginTop: "6px" }}
                              onChange={handleOtherCityChange}
                            />
                          </div>
                        )}
                        {/* End of addition by - Ashish Dewangan on 23-09-2024
                        Reason - If other option is selected from city dropdown then
                        an inputbox will be shown to type city name*/}
                      </div>

                      {/*End of Code Addition by Tejsve Gupta on 18-07-2024
                        Reason - To add  Country, state, city dropdown */}
                    </div>

                    <div
                      style={{ display: "flex", width: "100%", gap: "10px" }}
                    >
                      <div
                        // className={checkinStyle.inputPair}
                        className={`${checkinStyle.inputPair} ${checkinStyle.inputPair2}`}
                      >
                        <div
                          /** Code Commented by Tejasve Gupta on 18-06-2024
                            Reason - Styles updated in CSS file*/
                          className={checkinStyle.starLabelColonAddress}
                          // style={{
                          //   // border: "1px solid red",
                          //   display: "flex",
                          //   width: "95%",
                          // }}
                        >
                          <label
                            htmlFor="address"
                            className={checkinStyle.labelContainer}
                            // style={{ width: "90%" }}
                          >
                            {/**End of Code Commented by Tejasve Gupta on 18-06-2024
                            Reason - Styles updated in CSS file*/}
                            <span className={checkinStyle.optionalField}>
                              *{" "}
                            </span>
                            Address
                          </label>
                          {/* <div style={{ width: "20%" }}> : </div> */}
                        </div>

                        {/* <input
                          className={checkinStyle.AddressInputContainer}
                          type="text"
                          id="address"
                          name="address"
                          placeholder="Address"
                          value={formData.address}
                          onChange={handleRoomChange}
                          tabIndex={7}
                          // required
                        /> */}
                        <textarea
                          className={checkinStyle.AddressInputContainer}
                          style={{
                            height: "unset",
                            marginTop: "unset",
                            resize: "none",
                          }}
                          type="text"
                          id="address"
                          name="address"
                          placeholder="Address"
                          value={formData.address}
                          maxLength={250}
                          onChange={handleRoomChange}
                          tabIndex={7}
                          // required
                        />
                      </div>
                      <div
                        className={checkinStyle.inputPair}
                        // style={{display:'flex',border:'1px solid green'}}
                      >
                        <div className={checkinStyle.starLabelColon}>
                          <label
                            htmlFor="zip"
                            className={checkinStyle.labelContainer}
                          >
                            <span className={checkinStyle.optionalField}>
                              *{" "}
                            </span>
                            {/* Modified by - Ashish Dewangan on 23-09-2024
                            Reason - To rename zip to pin */}
                            {/* Zip */}
                            Pin Code
                            {/* End of modification by - Ashish Dewangan on 23-09-2024
                            Reason - To rename zip to pin */}
                          </label>
                        </div>
                        <div className={checkinStyle.inputError}>
                          <input
                            className={checkinStyle.inputContainer}
                            type="zip"
                            /* Modified by - Ashish Dewangan on 23-09-2024
                            Reason - To rename zip to pin */
                            // placeholder="Zip Code"
                            placeholder="Pin Code"
                            /* End of modification by - Ashish Dewangan on 23-09-2024
                            Reason - To rename zip to pin */
                            id="zip"
                            name="zip"
                            value={formData.zip}
                            onChange={handleRoomChange}
                            tabIndex={8}
                            onBlur={(e) => isValidOnBlur("zip", e.target.value)}
                            maxLength={6}
                          />
                        </div>
                      </div>
                    </div>

                    {/**Code Modification by Tejasve Gupta on 06-06-2024
                     * reason - UI changes as guided by Ashish sir
                     */}

                    {/* <legend>Add More Guests</legend> */}

                    <div style={{ marginLeft: "1.4%" }}>
                      <button
                        type="button"
                        className="submitButton"
                        onClick={addGuest}
                      >
                        {/* <FaPlus /> */}
                        Add More Guests
                        {/* <img src="checkin_icon.png" alt="Check-in" className={checkinStyle.headerIcon} /> */}
                      </button>
                      {guestDetails.map((guest, index) => {
                        return (
                          <div
                            // className={checkinStyle.inPair}
                            className={checkinStyle.guestDetailSection}
                            key={index}
                          >
                            {/* Added by Akanksha on 24-01-2025
                            Reason : To store room number for guest */}
                            <div
                              className={`${checkinStyle.inputPair} ${checkinStyle.inputGuestPair}`}
                            >
                              {index === 0 && (
                                <>
                                  <label
                                    htmlFor="room_select"
                                    className={checkinStyle.GuestlabelContainer}
                                  >
                                    <span className={checkinStyle.mandatoryField}> </span>
                                    Select Room
                                  </label>
                                </>
                              )}
                              <select
                                className={
                                  checkinStyle.selectInputContainer
                                }
                                id={`room_select_${index}`}
                                value={guest.selectedRoom || ""}
                                onChange={(e) => handleRoomSelection(index, e.target.value)}
                              >
                                <option value="" disabled>
                                  Select Room
                                </option>
                                {selectedRooms.map((room) => (
                                  <option
                                    key={room.room_number}
                                    value={room.room_number}
                                  >
                                    {room.room_number} ({room.room_type}) ({room.variety})
                                  </option>
                                ))}
                              </select>
                            </div>
                            {/* End by Akanksha on 24-01-2025
                            Reason : To store room number for guest */}
                            <div
                              // className={checkinStyle.inputPair}
                              className={`${checkinStyle.inputPair} ${checkinStyle.inputGuestPair}`}
                            >
                              {/* If label show only first time then set the condition Addition by Om Shrivastava on 01-10-2024 */}
                              {index === 0 && (
                                <>
                                  <label
                                    className={checkinStyle.GuestlabelContainer}
                                  >
                                    <span
                                      className={checkinStyle.mandatoryField}
                                    >
                                      *{" "}
                                    </span>
                                    First Name
                                  </label>
                                </>
                              )}
                              {/* If label show only first time then set the condition Addition by Om Shrivastava on 01-10-2024 */}

                              {/* Start of addition and modification by akanksha on 12Oct
                              Reason : to add salutation drop down in guest name field */}
                              <div className={checkinStyle.inputContainer}>
                                <div className={checkinStyle.inputRow}>
                                  <select
                                    className={checkinStyle.salutationSelect}
                                    value={guest.salutation}
                                    style={{ width: "40px", fontSize: "12px" }}
                                    onChange={(e) =>
                                      handleGuestChange(
                                        index,
                                        "salutation",
                                        e.target.value
                                      )
                                    }
                                  >
                                    <option value="">---</option>
                                    <option value="Master">Master</option>
                                    <option value="Mr">Mr</option>
                                    <option value="Mrs">Mrs</option>
                                    <option value="Ms">Ms</option>
                                  </select>
                                  <span className={checkinStyle.pipeSeparator}>
                                    |
                                  </span>
                                  <input
                                    className={checkinStyle.textInput}
                                    type="text"
                                    placeholder="First Name"
                                    value={guest.guest_name}
                                    maxLength={49}
                                    onInput={onlyAllowAlphabets}
                                    onChange={(e) =>
                                      handleGuestChange(
                                        index,
                                        "guest_name",
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
                              </div>
                              {/* End of addition and modification by akanksha on 12Oct
                                Reason : to add salutation drop down in guest name field */}
                              {/* Addition by Om Shrivastava on 26-09-2024
                                Reason : Show the validation message for guest details */}
                              {errors[index]?.name && (
                                <div className={checkinStyle.validationError}>
                                  {errors[index].name}
                                </div>
                              )}
                              {/* End of adition by Om Shrivastava on 26-09-2024
                                Reason : Show the validation message for guest details */}
                            </div>

                            <div
                              // className={checkinStyle.inputPair}
                              className={`${checkinStyle.inputPair} ${checkinStyle.inputGuestPair}`}
                            >
                              {/* If label show only first time then set the condition Addition by Om Shrivastava on 01-10-2024 */}
                              {index === 0 && (
                                <>
                                  <label
                                    className={checkinStyle.GuestlabelContainer}
                                  >
                                    <span
                                      className={checkinStyle.mandatoryField}
                                    >
                                      *{" "}
                                    </span>
                                    Last Name
                                  </label>
                                </>
                              )}
                              {/* If label show only first time then set the condition Addition by Om Shrivastava on 01-10-2024 */}

                              <input
                                className={checkinStyle.inputContainer}
                                type="text"
                                placeholder="Last Name"
                                value={guest.guest_last_name}
                                /**
                                 * Added by - Ashish Dewangan on 15-09-2024
                                 * Reason - To allow only alphabets to be entered
                                 */
                                onInput={onlyAllowAlphabets}
                                /**
                                 * End of addition by - Ashish Dewangan on 15-09-2024
                                 * Reason - To allow only alphabets to be entered
                                 */
                                onChange={(e) =>
                                  handleGuestChange(
                                    index,
                                    "guest_last_name",
                                    e.target.value
                                  )
                                }
                              />
                              {/* Addition by Om Shrivastava on 26-09-2024
                                Reason : Show the validation message for guest details */}
                              {errors[index]?.lastName && (
                                <div className={checkinStyle.validationError}>
                                  {errors[index].lastName}
                                </div>
                              )}
                              {/* End of addition by Om Shrivastava on 26-09-2024
                                Reason : Show the validation message for guest details */}
                            </div>

                            <div
                              // className={checkinStyle.inputPair}
                              className={`${checkinStyle.inputPair} ${checkinStyle.inputGuestPair}`}
                            >
                              {/* If label show only first time then set the condition Addition by Om Shrivastava on 01-10-2024 */}
                              {index === 0 && (
                                <>
                                  <label
                                    htmlFor="guest_id_card_type"
                                    className={checkinStyle.GuestlabelContainer}
                                  >
                                    <span
                                      className={checkinStyle.optionalField}
                                    >
                                      *{" "}
                                    </span>
                                    {/* Modified by - Ashish Dewangan on 11-09-2024
                                Reason - Renamed the label to make it same as primary label */}
                                    {/* ID Card Type */}
                                    ID Type
                                    {/* End of modification by - Ashish Dewangan on 11-09-2024
                                Reason - Renamed the label to make it same as primary label */}
                                  </label>
                                </>
                              )}
                              {/* If label show only first time then set the condition Addition by Om Shrivastava on 01-10-2024 */}
                              {/* Addition by Om Shrivastava on 14-10-2024
                              Reason : Set the "other" field in id type dropdown field  */}

                              {/* {!showManualGuestInput && ( */}
                              {!showManualGuestInput[index] && (
                                <>
                                  <select
                                    className={
                                      checkinStyle.selectInputContainer
                                    }
                                    id="guest_id_card_type"
                                    name="guest_id_card_type"
                                    placeholder="Id Card Type"
                                    value={guest.guest_id_card_type}
                                    // onChange={(e) =>
                                    //   handleGuestChange(
                                    //     index,
                                    //     "guest_id_card_type",
                                    //     e.target.value
                                    //   )
                                    // }
                                    onChange={(e) =>
                                      handleGuestChange(
                                        index,
                                        "guest_id_card_type",
                                        e.target.value,
                                        e
                                      )
                                    }
                                  >
                                    <option value="" disabled>
                                      {/* Modified by - Ashish Dewangan on 11-09-2024
                                Reason - Renamed the label to make it same as primary label */}
                                      {/* Select ID Card Type */}
                                      Select
                                      {/* End of modification by - Ashish Dewangan on 11-09-2024
                                Reason - Renamed the label to make it same as primary label */}
                                    </option>
                                    {/* Modification  and addiiton by Om Shriavstava on 14-09-2024
                                Reason : Change the name  */}
                                    {/* <option value="passport">Passport</option> */}
                                    <option value="Passport">Passport</option>

                                    <option value="Aadhar Card">
                                      Aadhar Card
                                    </option>

                                    {/* <option value="driver_license"> */}
                                    <option value="Driving License">
                                      Driving License
                                    </option>
                                    {/* <option value="voter_id">Voter ID</option> */}
                                    <option value="Voter ID">Voter ID</option>
                                    {/* End of modification  and addiiton by Om Shriavstava on 14-09-2024
                                Reason : Change the name  */}
                                    {/* Addition by Om Shrivastava on 14-10-2024
                                Reason : Set the Other field  */}
                                    <option value="Other">Other</option>
                                    {/* End of addition by Om Shrivastava on 14-10-2024
                                Reason : Set the Other field  */}
                                  </select>
                                </>
                              )}

                              {/* {showManualGuestInput && ( */}
                              {showManualGuestInput[index] && (
                                <>
                                  <div
                                  // className={checkinStyle.inputError}
                                  >
                                    <input
                                      className={checkinStyle.inputContainer}
                                      type="text"
                                      id="manual_guest_id_card_type"
                                      name="manual_guest_id_card_type"
                                      placeholder="Enter ID Type"
                                      value={guest.guest_id_card_type}
                                      // onChange={handleManualGuestInputChange}
                                      onChange={(e) =>
                                        handleManualGuestInputChange(index, e)
                                      }
                                      tabIndex={13}
                                    />
                                  </div>
                                </>
                              )}
                            </div>

                            {/* Condition added by Om Shrivastava on 14-10-2024
                        Reason : When user clear the other option field then this section is show  */}

                            {showGuestInputTypePopup && (
                              <div className={checkinStyle.popupContainer}>
                                <div className={checkinStyle.popupContent}>
                                  <h3>Switch to Dropdown?</h3>
                                  <p>
                                    Do you want to switch back to the dropdown
                                    to select the ID type?
                                  </p>
                                  <div className={checkinStyle.popupActions}>
                                    <button
                                      className={`${checkinStyle.popupButton} ${checkinStyle.yesButton}`}
                                      // Modification and addition by Om Shrivastava on 19-10-2024
                                      // Reason : Set the other type issue
                                      // onClick={() =>
                                      //   handlePopupGuestChoice("yes")
                                      // }
                                      onClick={() =>
                                        handlePopupGuestChoice("yes", index)
                                      }
                                      // Modification and addition by Om Shrivastava on 19-10-2024
                                      // Reason : Set the other type issue
                                    >
                                      Yes
                                    </button>
                                    <button
                                      className={`${checkinStyle.popupButton} ${checkinStyle.noButton}`}
                                      // Modification and addition by Om Shrivastava on 19-10-2024
                                      // Reason : Set the other type issue
                                      // onClick={() =>
                                      //   handlePopupGuestChoice("no")
                                      // }
                                      onClick={() =>
                                        handlePopupGuestChoice("no", index)
                                      }
                                      // Modification and addition by Om Shrivastava on 19-10-2024
                                      // Reason : Set the other type issue
                                    >
                                      No
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                            {/* End of addition by Om Shrivastava on 14-10-2024
                              Reason : Set the "other" field in id type dropdown field  */}
                            <div
                              // className={checkinStyle.inputPair}
                              className={`${checkinStyle.inputPair} ${checkinStyle.inputGuestPair}`}
                            >
                              {/* If label show only first time then set the condition Addition by Om Shrivastava on 01-10-2024 */}
                              {index === 0 && (
                                <>
                                  <label
                                    className={checkinStyle.GuestlabelContainer}
                                  >
                                    <span
                                      className={checkinStyle.optionalField}
                                    >
                                      *{" "}
                                    </span>
                                    {/* Modified by - Ashish Dewangan on 11-09-2024
                                Reason - Renamed the label to make it same as primary label */}
                                    {/* ID Card Number */}
                                    ID Number
                                    {/* End of modification by - Ashish Dewangan on 11-09-2024
                                Reason - Renamed the label to make it same as primary label */}
                                  </label>
                                </>
                              )}
                              {/* If label show only first time then set the condition Addition by Om Shrivastava on 01-10-2024 */}

                              <input
                                className={checkinStyle.inputContainer}
                                type="text"
                                /* Modified by - Ashish Dewangan on 11-09-2024
                                Reason - Renamed the label to make it same as primary label */
                                // placeholder="ID Card Number"
                                placeholder="ID Number"
                                /* End of modification by - Ashish Dewangan on 11-09-2024
                                Reason - Renamed the label to make it same as primary label */
                                value={guest.guest_id_card_no}
                                onChange={(e) =>
                                  handleGuestChange(
                                    index,
                                    "guest_id_card_no",
                                    e.target.value
                                  )
                                }
                              />
                            </div>

                            <div
                              // className={checkinStyle.inputPair}
                              className={`${checkinStyle.inputPair} ${checkinStyle.inputGuestPair}`}
                            >
                              {/* If label show only first time then set the condition Addition by Om Shrivastava on 01-10-2024 */}
                              {index === 0 && (
                                <>
                                  <label
                                    className={checkinStyle.GuestlabelContainer}
                                    style={{ whiteSpace: "nowrap" }}
                                  >
                                    <span
                                      className={checkinStyle.optionalField}
                                    >
                                      *{" "}
                                    </span>
                                    {/* Modified by - Ashish Dewangan on 11-09-2024
                                Reason - Renamed the label to make it same as primary label */}
                                    {/* ID Card Image */}
                                    Upload Image
                                    {/* End of modification by - Ashish Dewangan on 11-09-2024
                                Reason - Renamed the label to make it same as primary label */}
                                  </label>
                                </>
                              )}
                              {/* If label show only first time then set the condition Addition by Om Shrivastava on 01-10-2024 */}

                              <input
                                className={checkinStyle.inputContainer}
                                type="file"
                                onChange={(e) =>
                                  handleGuestFileChange(index, e)
                                }
                              />
                            </div>
                            {/* Modified by - Ashish Dewangan on 16-09-2024
                            Reason - To add delete icon */}
                            {/* <button
                              type="button"
                              onClick={(e) => deleteGuest(index)}
                            >
                       
                              delete
                            </button> */}

                            {/**
                             *  Added by - Ashish Dewangan on 26-09-2024
                             * Reason - Added select box to choose persen type
                             */}

                            <div
                              // className={checkinStyle.inputPair}
                              className={`${checkinStyle.inputPair} ${checkinStyle.inputGuestPair}`}
                            >
                              {/* If label show only first time then set the condition Addition by Om Shrivastava on 01-10-2024 */}
                              {index === 0 && (
                                <>
                                  <label
                                    className={checkinStyle.GuestlabelContainer}
                                  >
                                    <span
                                      className={checkinStyle.optionalField}
                                    >
                                      *{" "}
                                    </span>
                                    {/* Modified by - Ashish Dewangan on 11-09-2024
                                Reason - Renamed the label to make it same as primary label */}
                                    {/* ID Card Number */}
                                    Adult / Child
                                    {/* End of modification by - Ashish Dewangan on 11-09-2024
                                Reason - Renamed the label to make it same as primary label */}
                                  </label>
                                </>
                              )}
                              {/* If label show only first time then set the condition Addition by Om Shrivastava on 01-10-2024 */}

                              <select
                                className={checkinStyle.selectInputContainer}
                                value={guest.person_type}
                                onChange={(e) =>
                                  handleGuestChange(
                                    index,
                                    "person_type",
                                    e.target.value
                                  )
                                }
                              >
                                <option value="adult">Adult</option>
                                <option value="child">Child</option>
                              </select>
                            </div>

                            

                            {/**
                             *  End of addition by - Ashish Dewangan on 26-09-2024
                             * Reason - Added select box to choose persen type
                             */}
                            {/* Modification and addition by Om Shrivastava on 26-10-2024
                              Reason : Set the design of delete section  */}
                            <div
                              // className={checkinStyle.inputPair}
                              className={`${checkinStyle.inputPair} ${checkinStyle.inputGuestPair}`}
                              style={{ width: "80px", paddingLeft: "0px" }}
                            >
                              {index === 0 && (
                                <>
                                  <label
                                    className={checkinStyle.GuestlabelContainer}
                                  >
                                    <span
                                      className={checkinStyle.optionalField}
                                    >
                                      *{" "}
                                    </span>
                                    Remove
                                  </label>
                                </>
                              )}
                              {/* <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  // Modification and addition by Om Shrivastava on 27-09-2024
                                  // Reason : Set the alignment of this button
                                  // alignItems: "center",
                                  // paddingTop: "7%",
                                  // End of modification and addition by Om Shrivastava on 27-09-2024
                                  // Reason : Set the alignment of this button
                                  height: "100%",
                                  // paddingTop:'10%'
                                }}
                              >
                                <MdDelete
                                  className={checkinStyle.deleteIcon}
                                  onClick={(e) => deleteGuest(index)}
                                  // style={{marginTop:'35%'}}
                                />
                              </div> */}

                              <MdDelete
                                style={{
                                  border: "none",
                                  backgroundColor: "unset",
                                  paddingRight: "25%",
                                  color: "red",
                                  fontSize: "16px",
                                }}
                                className={checkinStyle.inputContainer}
                                onClick={(e) => deleteGuest(index)}
                                // style={{marginTop:'35%'}}
                              />
                            </div>
                            {/* End of modification and addition by Om Shrivastava on 26-10-2024
                              Reason : Set the design of delete section  */}
                            {/* End of modification by - Ashish Dewangan on 16-09-2024
                            Reason - To add delete icon */}
                          </div>
                        );
                      })}
                    </div>

                    <div className={checkinStyle.personsContainer}>
                      <div className={checkinStyle.inputPair}>
                        <div className={checkinStyle.starLabelColon}>
                          <label
                            htmlFor="number_of_persons"
                            className={checkinStyle.labelContainer}
                          >
                            <span className={checkinStyle.optionalField}>
                              *{" "}
                            </span>
                            No of Persons
                          </label>
                          {/* <div style={{ width: "20%" }}> : </div> */}
                        </div>
                         {/* Modified by - Ashish Dewangan on 14-11-2024
                        * Reason - To change this dropdown to normal input box for more optimized code */}
                        {/* <select
                         
                          className={`${checkinStyle.inputContainer1} ${checkinStyle.disabledField}`}
                     
                          id="number_of_persons"
                          name="number_of_persons"
                          value={formData.number_of_persons}
                          tabIndex={15}
                          onChange={handleRoomChange}
                          placeholder="Number of Person"
                  
                          disabled={true}
                   
                        >
                          {[...Array(41).keys()].map((num) => (
                            <option key={num} value={num}>
                              {num}
                            </option>
                          ))}
                        </select> */}
                        <input
                          /**
                           *  Modified by - Ashish Dewangan on 26-09-2024
                           * Reason - Disbaled this input
                           */
                          // className={checkinStyle.inputContainer1}
                          className={`${checkinStyle.inputContainer1} ${checkinStyle.disabledField}`}
                          /**
                           *  End of modification by - Ashish Dewangan on 26-09-2024
                           * Reason - Disbaled this input
                           */
                          id="number_of_persons"
                          name="number_of_persons"
                          value={formData.number_of_persons}
                          tabIndex={15}
                          onChange={handleRoomChange}
                          placeholder="Number of Person"
                          /**
                           *  Added by - Ashish Dewangan on 26-09-2024
                           * Reason - Disbaled this input
                           */
                          disabled={true}
                          /**
                           *  End of addition by - Ashish Dewangan on 26-09-2024
                           * Reason - Disbaled this input
                           */
                        />
                          
                         {/* End of modification by - Ashish Dewangan on 14-11-2024
                        * Reason - To change this dropdown to normal input box for more optimized code */}
                      </div>

                      <div className={checkinStyle.inputPair}>
                        <div className={checkinStyle.starLabelColon}>
                          <label
                            htmlFor="number_of_children"
                            className={checkinStyle.labelContainer}
                          >
                            <span className={checkinStyle.optionalField}>
                              *{" "}
                            </span>
                            Childrens
                          </label>
                          {/* <div style={{ width: "20%" }}> : </div> */}
                        </div>

                        {/* Modified by - Ashish Dewangan on 14-11-2024
                        * Reason - To change this dropdown to normal input box for more optimized code */}
                          {/* <select
                      
                          className={`${checkinStyle.inputContainer1} ${checkinStyle.disabledField}`}
                 
                          id="number_of_children"
                          name="number_of_children"
                          placeholder="Number of Children"
                          value={formData.number_of_children}
                          tabIndex={16}
                          onChange={handleRoomChange}
                   
                          disabled={true}
              
                        >
                          {[...Array(21).keys()].map((num) => (
                            <option key={num} value={num}>
                              {num}
                            </option>
                          ))}
                        </select> */}
                        <input
                          /**
                           *  Modified by - Ashish Dewangan on 26-09-2024
                           * Reason - Disbaled this input
                           */
                          // className={checkinStyle.inputContainer1}
                          className={`${checkinStyle.inputContainer1} ${checkinStyle.disabledField}`}
                          /**
                           *  End of modification by - Ashish Dewangan on 26-09-2024
                           * Reason - Disbaled this input
                           */
                          id="number_of_children"
                          name="number_of_children"
                          placeholder="Number of Children"
                          value={formData.number_of_children}
                          tabIndex={16}
                          onChange={handleRoomChange}
                          /**
                           *  Added by - Ashish Dewangan on 26-09-2024
                           * Reason - Disbaled this input
                           */
                          disabled={true}
                          /**
                           *  End of addition by - Ashish Dewangan on 26-09-2024
                           * Reason - Disbaled this input
                           */
                        />
                         
                        {/* Modified by - Ashish Dewangan on 14-11-2024
                        * Reason - To change this dropdown to normal input box for more optimized code */}
                      </div>

                      <div className={checkinStyle.inputPair}>
                        <div className={checkinStyle.starLabelColon}>
                          <label
                            htmlFor="number_of_adults"
                            className={checkinStyle.labelContainer}
                          >
                            <span className={checkinStyle.optionalField}>
                              *{" "}
                            </span>
                            Adults
                          </label>
                          {/* <div style={{ width: "20%" }}> : </div> */}
                        </div>
                        {/* Modified by - Ashish Dewangan on 14-11-2024
                        * Reason - To change this dropdown to normal input box for more optimized code */}
                        {/* <select
                      
                          className={`${checkinStyle.inputContainer1} ${checkinStyle.disabledField}`}
                    
                          id="number_of_adults"
                          name="number_of_adults"
                          value={formData.number_of_adults}
                          onChange={handleRoomChange}
                          tabIndex={17}
                  
                          disabled={true}
                   
                        >
                          {[...Array(21).keys()].map((num) => (
                            <option key={num} value={num}>
                              {num}
                            </option>
                          ))}
                        </select> */}
                        <input
                          /**
                           *  Modified by - Ashish Dewangan on 26-09-2024
                           * Reason - Disbaled this input
                           */
                          // className={checkinStyle.inputContainer1}
                          className={`${checkinStyle.inputContainer1} ${checkinStyle.disabledField}`}
                          /**
                           *  End of modification by - Ashish Dewangan on 26-09-2024
                           * Reason - Disbaled this input
                           */
                          id="number_of_adults"
                          name="number_of_adults"
                          value={formData.number_of_adults}
                          onChange={handleRoomChange}
                          tabIndex={17}
                          /**
                           *  Added by - Ashish Dewangan on 26-09-2024
                           * Reason - Disbaled this input
                           */
                          disabled={true}
                          /**
                           *  End of addition by - Ashish Dewangan on 26-09-2024
                           * Reason - Disbaled this input
                           */
                        />
                        {/* End of modification by - Ashish Dewangan on 14-11-2024
                        * Reason - To change this dropdown to normal input box for more optimized code */}
                        
                      </div>
                    </div>

                    {/* Added by - Ashish Dewangan on 21-10-2024
                     * Reason - Added input box for purpose of visit , arrived from, destination fields */}
                    <div className={checkinStyle.stayingInfoContainer}>
                      <div className={checkinStyle.inputPair}>
                        <div className={checkinStyle.starLabelColon}>
                          <label
                            htmlFor="purpose_of_visit"
                            className={checkinStyle.labelContainer}
                          >
                            <span className={checkinStyle.optionalField}>
                              *{" "}
                            </span>
                            Purpose of Visit
                          </label>
                        </div>
                        <textarea
                          className={checkinStyle.AddressInputContainer}
                          style={{
                            height: "unset",
                            marginTop: "unset",
                            resize: "none",
                          }}
                          id="purpose_of_visit"
                          name="purpose_of_visit"
                          placeholder="Purpose of Visit"
                          value={formData.purpose_of_visit}
                          type="text"
                          onChange={handleRoomChange}
                          tabIndex={19}
                        />
                      </div>

                      <div className={checkinStyle.inputPair}>
                        <div className={checkinStyle.starLabelColon}>
                          <label
                            htmlFor="arrived_from"
                            className={checkinStyle.labelContainer}
                          >
                            <span className={checkinStyle.optionalField}>
                              *{" "}
                            </span>
                            Arrived From
                          </label>
                        </div>
                        <textarea
                          className={checkinStyle.AddressInputContainer}
                          style={{
                            height: "unset",
                            marginTop: "unset",
                            resize: "none",
                          }}
                          id="arrived_from"
                          name="arrived_from"
                          placeholder="Arrived From"
                          value={formData.arrived_from}
                          type="text"
                          onChange={handleRoomChange}
                          tabIndex={20}
                        />
                      </div>

                      <div className={checkinStyle.inputPair}>
                        <div className={checkinStyle.starLabelColon}>
                          <label
                            htmlFor="destination"
                            className={checkinStyle.labelContainer}
                          >
                            <span className={checkinStyle.optionalField}>
                              *{" "}
                            </span>
                            Destination
                          </label>
                        </div>
                        <textarea
                          className={checkinStyle.AddressInputContainer}
                          style={{
                            height: "unset",
                            marginTop: "unset",
                            resize: "none",
                          }}
                          id="destination"
                          name="destination"
                          placeholder="Destination"
                          type="text"
                          value={formData.destination}
                          onChange={handleRoomChange}
                          tabIndex={21}
                        />
                      </div>
                    </div>
                    {/* End of addition by - Ashish Dewangan on 21-10-2024
                     * Reason - Added input box for purpose of visit , arrived from, destination fields */}
                  </div>
                  {/**Code Modification by Tejasve Gupta on 06-06-2024
                   * reason - UI changes as guided by Ashish sir
                   */}
                </fieldset>
                {/* <legend className={checkinStyle.secionHeading}>
                Staying Details
              </legend> */}

                {/**Code Addition by Tejasve Gupta on 16-08-2024
                 * Reason - Advance Booking options
                 */}

                {/**End of Code Addition by Tejasve Gupta on 16-08-2024
                 * Reason - Advance Booking options
                 */}

                {/**Code Addition and Modification by Tejasve Gupta on 14-07-2026
                          Reason - UI Enhancements and Addition of new fields*/}

                <div className={checkinStyle.paymentForm}>
                  {/* <legend className={checkinStyle.secionHeading}>
                  Rooms Details
                </legend> */}

                  <legend
                    style={{
                      paddingTop: "5px",
                      textTransform: "uppercase",
                      fontSize: "var(--page-content-font-size)",
                      color: "black",
                    }}
                    className={checkinStyle.secionHeading}
                  >
                    Payment Details
                  </legend>
                  <fieldset className={checkinStyle.paymentDetails}>
                    <div className={checkinStyle.chargesContainer}>
                      {/**Code Addition and Modification by Tejasve Gupta on 15-07-2026
                          Reason - UI Enhancements and Addition of new fields*/}
                      <div className={checkinStyle.charges}>
                        <div className={checkinStyle.inputPair}>
                          <div
                          // style={{ display: "flex", width: "50%" }}
                          >
                            <label className={checkinStyle.labelContainer}>
                              <span className={checkinStyle.optionalField}>
                                *{" "}
                              </span>
                              Room Charges
                            </label>
                            {/* <div style={{ width: "20%" }}> : </div> */}
                          </div>
                          <div className={checkinStyle.chargesAmount}>
                            <input
                              /**
                               * Modified by - Ashish Dewangan on 15-09-2024
                               * Reason - To make input field look like disabled
                               */
                              // className={checkinStyle.inputContainer}
                              style={{width: "100%"}}
                              className={`${checkinStyle.inputContainer} ${checkinStyle.disabledField}`}
                              disabled={true}
                              /**
                               * End of modification by - Ashish Dewangan on 15-09-2024
                               * Reason - To make input field look like disabled
                               */
                              type="text"
                              id="charges"
                              name="charges"
                              value={roomCharges}
                              readOnly
                            />
                          </div>
                        </div>
                        <div className={checkinStyle.inputPair}>
                          <div
                          // style={{ display: "flex", width: "50%" }}
                          >
                            <label className={checkinStyle.labelContainer}>
                              <span className={checkinStyle.optionalField}>
                                *{" "}
                              </span>
                              {/* Modification and addition by Om Shrivastava on 15-10-2024 
                    Reason : Change the name  */}
                              {/*  Extra Person Charges*/}
                              Extra Bed Charges
                              {/* End of modification and addition by Om Shrivastava on 15-10-2024 
                    Reason : Change the name  */}
                            </label>
                            {/* <div style={{ width: "20%" }}> : </div> */}
                          </div>
                          <div className={checkinStyle.chargesAmount}>
                            <input
                              style={{width: "100%"}}
                              className={checkinStyle.inputContainer}
                              type="number"
                              id="extraPersonCharges"
                              name="extraPersonCharges"
                              value={extraPersonCharges}
                              tabIndex={25}
                              onChange={handleExtraChargesChange}
                            />
                          </div>
                          {/**End of Code Addition and Modification by Tejasve Gupta on 15-07-2026
                              Reason - UI Enhancements and Addition of new fields*/}
                        </div>
                        <div className={checkinStyle.inputPair}>
                          <div
                          // style={{ display: "flex", width: "50%" }}
                          >
                            <label className={checkinStyle.labelContainer}>
                              <span className={checkinStyle.optionalField}>
                                *{" "}
                              </span>
                              Subtotal
                            </label>
                            {/* <div style={{ width: "20%" }}> : </div> */}
                          </div>
                          <div className={checkinStyle.chargesAmount}>
                            <input
                              style={{width: "100%"}}
                              /**
                               * Modified by - Ashish Dewangan on 15-09-2024
                               * Reason - To make input field look like disabled
                               */
                              // className={checkinStyle.inputContainer}
                              className={`${checkinStyle.inputContainer} ${checkinStyle.disabledField}`}
                              disabled={true}
                              /**
                               * End of modification by - Ashish Dewangan on 15-09-2024
                               * Reason - To make input field look like disabled
                               */
                              type="text"
                              id="subtotal"
                              name="subtotal"
                              value={formData.subTotal?.toFixed(2)}
                              // tabIndex={27}
                              readOnly
                            />
                          </div>
                        </div>
                      </div>
                      {/**Code Addition and Modification by Tejasve Gupta on 13-07-2026
                    Reason - UI Enhancements and Addition of new fields*/}
                      <div className={checkinStyle.discount}>
                        <div className={checkinStyle.inputPair}>
                          <div>
                            <label className={checkinStyle.labelContainer}>
                              <span className={checkinStyle.optionalField}>
                                *{" "}
                              </span>
                              Discount In
                            </label>
                          </div>
                          <div className={checkinStyle.chargesAmount}>
                            <select
                              // className={checkinStyle.selectInputContainer}
                              
                              className={`${checkinStyle.selectInputContainer} ${checkinStyle.discountSelectInput}`}
                              id="discountIn"
                              name="discountIn"
                              value={discountIn}
                              onChange={handleDiscountTypeChange}
                            >
                              <option disabled value="">
                                Select Type
                              </option>
                              <option value="percentage">Percentage (%)</option>
                              <option value="rupee">Rupee (₹)</option>
                            </select>
                          </div>
                        </div>

                        <div className={checkinStyle.inputPair}>
                          <div>
                            <label className={checkinStyle.labelContainer}>
                              <span className={checkinStyle.optionalField}>
                                *{" "}
                              </span>
                              Discount (%)
                            </label>
                          </div>
                          <div className={checkinStyle.chargesAmount}>
                            <input
                              style={{width: "100%"}}
                              /**
                               * Modified by - Ashish Dewangan on 15-09-2024
                               * Reason - To make input field look like disabled
                               */
                              // className={checkinStyle.inputContainer}
                              className={`${checkinStyle.inputContainer} ${
                                discountIn !== "percentage" &&
                                checkinStyle.disabledField
                              }`}
                              /**
                               * End of modification by - Ashish Dewangan on 15-09-2024
                               * Reason - To make input field look like disabled
                               */
                              type="number"
                              id="discount_percentage"
                              name="discount_percentage"
                              value={discount_percentage}
                              onChange={handleDiscountPercentageChange}
                              disabled={discountIn !== "percentage"}
                            />
                          </div>
                        </div>

                        <div className={checkinStyle.inputPair}>
                          <div>
                            <label className={checkinStyle.labelContainer}>
                              <span className={checkinStyle.optionalField}>
                                *{" "}
                              </span>
                              Discount (₹)
                            </label>
                          </div>
                          <div className={checkinStyle.chargesAmount}>
                            <input
                              style={{width: "100%"}}
                              /**
                               * Modified by - Ashish Dewangan on 15-09-2024
                               * Reason - To make input field look like disabled
                               */
                              // className={checkinStyle.inputContainer}
                              className={`${checkinStyle.inputContainer} ${
                                discountIn !== "rupee" &&
                                checkinStyle.disabledField
                              }`}
                              /**
                               * End of modification by - Ashish Dewangan on 15-09-2024
                               * Reason - To make input field look like disabled
                               */
                              type="number"
                              id="discount_rupees"
                              name="discount_rupees"
                              value={discount_rupees}
                              onChange={handlediscountRupeesChange}
                              disabled={discountIn !== "rupee"}
                            />
                          </div>
                        </div>
                      </div>

                      <div className={checkinStyle.discount}>
                        <div className={checkinStyle.inputPair}>
                          <div
                          // style={{ display: "flex", width: "50%" }}
                          >
                            <label className={checkinStyle.labelContainer}>
                              <span className={checkinStyle.optionalField}>
                                *{" "}
                              </span>
                              Taxable
                            </label>
                            {/* <div style={{ width: "20%" }}> : </div> */}
                          </div>
                          <div className={checkinStyle.chargesAmount}>
                            <input
                              /**
                               * Modified by - Ashish Dewangan on 15-09-2024
                               * Reason - To make input field look like disabled
                               */
                              // className={checkinStyle.inputContainer}
                              className={`${checkinStyle.inputContainer} ${checkinStyle.disabledField}`}
                              disabled={true}
                              /**
                               * End of modification by - Ashish Dewangan on 15-09-2024
                               * Reason - To make input field look like disabled
                               */
                              style={{width: "100%"}}
                              type="text"
                              id="taxable"
                              name="taxable"
                              value={formData.taxable_amount}
                              // tabIndex={27}
                              readOnly
                            />
                          </div>
                        </div>

                        <div className={checkinStyle.inputPair}>
                          <div
                          // style={{ display: "flex", width: "50%" }}
                          >
                            <label className={checkinStyle.labelContainer}>
                              <span className={checkinStyle.optionalField}>
                                *{" "}
                              </span>
                              GST Rate (%)
                            </label>
                            {/* <div style={{ width: "20%" }}> : </div> */}
                          </div>
                          <div className={checkinStyle.chargesAmount}>
                            <input
                              style={{width: "100%"}}
                              /**
                               * Modified by - Ashish Dewangan on 15-09-2024
                               * Reason - To make input field look like disabled
                               */
                              // className={checkinStyle.inputContainer}
                              className={`${checkinStyle.inputContainer} ${checkinStyle.disabledField}`}
                              disabled={true}
                              /**
                               * End of modification by - Ashish Dewangan on 15-09-2024
                               * Reason - To make input field look like disabled
                               */
                              type="number"
                              id="gst"
                              name="gst"
                              value={gst}
                              onChange={handleGstRateChange}
                              tabIndex={28}
                              readOnly
                            />
                          </div>
                        </div>
                        <div className={checkinStyle.inputPair}>
                          <div
                          // style={{ display: "flex", width: "50%" }}
                          >
                            <label className={checkinStyle.labelContainer}>
                              <span className={checkinStyle.optionalField}>
                                *{" "}
                              </span>
                              GST Value
                            </label>
                            {/* <div style={{ width: "20%" }}> : </div> */}
                          </div>
                          <div className={checkinStyle.chargesAmount}>
                            <input
                              /**
                               * Modified by - Ashish Dewangan on 15-09-2024
                               * Reason - To make input field look like disabled
                               */
                              // className={checkinStyle.inputContainer}
                              style={{width: "100%"}}
                              className={`${checkinStyle.inputContainer} ${checkinStyle.disabledField}`}
                              disabled={true}
                              /**
                               * End of modification by - Ashish Dewangan on 15-09-2024
                               * Reason - To make input field look like disabled
                               */
                              type="text"
                              id="gstValue"
                              name="gstValue"
                              value={formData.gstValue?.toFixed(2)}
                              tabIndex={29}
                              readOnly
                            />
                          </div>
                        </div>
                      </div>
                      {/* <div className={checkinStyle.inputPair}>
                        <div style={{ display: "flex", width: "50%" }}>
                          <label className={checkinStyle.labelContainer1}>
                            <span className={checkinStyle.optionalField}>
                              *{" "}
                            </span>
                            Subtotal
                          </label>
                          <div style={{ width: "20%" }}> : </div>
                        </div>
                        <div className={checkinStyle.chargesAmount}>
                          <input
                            className={checkinStyle.inputContainer}
                            type="text"
                            id="subtotal"
                            name="subtotal"
                            value={subtotal.toFixed(2)}
                            readOnly
                          />
                        </div>
                      </div> */}

                      <div className={checkinStyle.gstTotal}></div>
                      {/**Code Addition and Modification by Tejasve Gupta on 13-07-2026
                              Reason - UI Enhancements and Addition of new fields*/}

                      <div className={checkinStyle.advDue}>
                        <div className={checkinStyle.inputPair}>
                          <div
                          // style={{ display: "flex", width: "50%" }}
                          >
                            <label className={checkinStyle.labelContainer}>
                              <span className={checkinStyle.optionalField}>
                                *{" "}
                              </span>
                              Advance Payment
                            </label>
                            {/* <div style={{ width: "20%" }}> : </div> */}
                          </div>
                          <div className={checkinStyle.chargesAmount}>
                            <input
                              style={{width: "100%"}}
                              className={checkinStyle.inputContainer}
                              type="number"
                              id="advancePayment"
                              name="advancePayment"
                              value={advancePayment}
                              onChange={handleAdvancePaymentChange}
                              tabIndex={30}
                            />
                          </div>
                        </div>
                        <div className={checkinStyle.inputPair}>
                          <div
                          // style={{ display: "flex", width: "50%" }}
                          >
                            <label className={checkinStyle.labelContainer}>
                              <span className={checkinStyle.optionalField}>
                                *{" "}
                              </span>
                              Total payable amount
                            </label>
                            {/* <div style={{ width: "20%" }}> : </div> */}
                          </div>
                          <div className={checkinStyle.chargesAmount}>
                            <input
                              /**
                               * Modified by - Ashish Dewangan on 15-09-2024
                               * Reason - To make input field look like disabled
                               */
                              // className={checkinStyle.inputContainer}
                              style={{width: "100%"}}
                              className={`${checkinStyle.inputContainer} ${checkinStyle.disabledField}`}
                              disabled={true}
                              /**
                               * End of modification by - Ashish Dewangan on 15-09-2024
                               * Reason - To make input field look like disabled
                               */
                              type="text"
                              id="dueAmount"
                              name="dueAmount"
                              value={formData.dueAmount?.toFixed(2)}
                              // tabIndex={32}
                              readOnly
                            />
                          </div>
                          {/**Code Addition and Modification by Tejasve Gupta on 13-07-2026
                      Reason - UI Enhancements and Addition of new fields*/}
                        </div>
                        <div className={checkinStyle.inputPair}>
                          <div
                          // style={{ display: "flex", width: "50%" }}
                          >
                            <label className={checkinStyle.labelContainer}>
                              <span className={checkinStyle.optionalField}>
                                *{" "}
                              </span>
                              Grand Total
                            </label>
                            {/* <div style={{ width: "20%" }}> : </div> */}
                          </div>
                          <div className={checkinStyle.chargesAmount}>
                            <input
                              /**
                               * Modified by - Ashish Dewangan on 15-09-2024
                               * Reason - To make input field look like disabled
                               */
                              // className={checkinStyle.inputContainer}
                              style={{width: "100%"}}
                              className={`${checkinStyle.inputContainer} ${checkinStyle.disabledField}`}
                              disabled={true}
                              /**
                               * End of modification by - Ashish Dewangan on 15-09-2024
                               * Reason - To make input field look like disabled
                               */
                              type="text"
                              id="grandTotal"
                              name="grandTotal"
                              value={formData.grandTotal?.toFixed(2)}
                              // tabIndex={30}
                              readOnly
                            />
                          </div>
                          {/**End of Code Addition and Modification by Tejasve Gupta on 13-07-2026
                              Reason - UI Enhancements and Addition of new fields*/}
                        </div>
                      </div>
                    </div>
                  </fieldset>
                </div>
              </div>

              <div
                className={checkinStyle.rightContainer}
                style={
                  {
                    // border: "1px solid orange",
                    // display: "flex",
                  }
                }
              >
                {/**Code Addition and Modification by Tejasve Gupta on 13-07-2026
                  Reason - UI Enhancements and Addition of new fields*/}

                {/**End of Code Addition and Modification by Tejasve Gupta on 13-07-2026
                Reason - UI Enhancements and Addition of new fields*/}
                {/**Code Modification by Tejasve Gupta on 05-06-2024
                 * Reason - Change in Styles
                 */}

                <legend
                  // style={{ marginLeft: "5%" }}
                  className={checkinStyle.secionHeading}
                ></legend>
                <fieldset className={checkinStyle.billingSummary}>
                  <h4
                    style={{
                      paddingTop: "2%",
                      fontSize: "var(--page-content-font-size)",
                      textTransform: "uppercase",
                      textAlign: "center",
                    }}
                  >
                    Billing Summary
                  </h4>

                  <div className={checkinStyle.inOutPair}>
                    <div className={checkinStyle.inPair}>
                      <label>Check-In</label>
                      <label style={{ fontSize: "13px " }}>
                        {formatDate(formData.arrival_date)}&nbsp;|&nbsp;
                        {/* Modification and addition by Om Shrivastava on 21-10-2024
                        Reason : Set the time format */}
                        {/* {formData.arrival_time} */}
                        {new Date(`1970-01-01T${formData.arrival_time}`)
                          .toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })
                          .replace(":", ".")}
                        {/* End of modification and addition by Om Shrivastava on 21-10-2024
                        Reason : Set the time format */}
                      </label>
                    </div>
                    {/* <div className={checkinStyle.arrow}>
                    <TbArrowsExchange2 />
                  </div> */}
                    {/* <div className={checkinStyle.outPair}>
                    <label>Check-Out</label>
                    <label>{formatDate(formData.departure_date)}</label>
                  </div> */}
                  </div>
                  <div className={checkinStyle.amountSummary}>
                    <div
                      style={{ borderTop: "1px solid black" }}
                      className={checkinStyle.amountPair}
                    >
                      <label>Room Charges</label>
                      <label>₹&nbsp;{roomCharges?.toFixed(2)}</label>
                    </div>

                    {/* {extraPersonCharges > 0 && (
                      <div className={checkinStyle.amountPair}>
                        <label>Extra Person Charges</label>
                        <label>₹&nbsp;{extraPersonCharges}</label>
                      </div>
                    )} */}

                    <div className={checkinStyle.amountPair}>
                      {/* Modification and addition by Om Shrivastava on 15-10-2024 
                    Reason : Change the name  */}
                      {/* <label>Extra Person Charges</label> */}
                      <label>Extra Bed Charges</label>
                      {/* End of modification and addition by Om Shrivastava on 15-10-2024 
                    Reason : Change the name  */}

                      <label>₹&nbsp;{extraPersonCharges}</label>
                    </div>

                    <div className={checkinStyle.amountPair}>
                      <label>Sub-total</label>
                      <label>₹&nbsp;{formData.subTotal?.toFixed(2)}</label>
                    </div>

                    {/* {discount_rupees > 0 && (
                      <div className={checkinStyle.amountPair}>
                        <label>Discount</label>
                        <label>₹&nbsp;{discount_rupees?.toFixed(2)}</label>
                      </div>
                    )} */}

                    <div className={checkinStyle.amountPair}>
                      <label>Discount</label>
                      <label>₹&nbsp;{discount_rupees?.toFixed(2)}</label>
                    </div>

                    {/* {gstValue > 0 && (
                    <div className={checkinStyle.amountPair}>
                      <label>GST</label>
                      <label>
                        {gstValue}&nbsp;₹
                      </label>
                    </div>
                  )} */}
                    <div className={checkinStyle.amountPair}>
                      <label>Taxable</label>
                      <label>
                        ₹&nbsp;{formData.taxable_amount?.toFixed(2)}
                      </label>
                    </div>
                    <div className={checkinStyle.amountPair}>
                      <label>GST</label>
                      <label>₹&nbsp;{formData.gstValue?.toFixed(2)}</label>
                    </div>
                    {/**Code Addition by Tejasve Gupta on 22-08-2024
                  Reason - Display SGST CGST */}
                    <div className={checkinStyle.amountPair}>
                      <label>CGST</label>
                      <label>₹&nbsp;{formData.gstValue?.toFixed(2) / 2}</label>
                    </div>
                    <div className={checkinStyle.amountPair}>
                      <label>SGST</label>
                      <label>₹&nbsp;{formData.gstValue?.toFixed(2) / 2}</label>
                    </div>
                    {/**End of Code Addition by Tejasve Gupta on 22-08-2024
                  Reason - Display SGST CGST */}
                    <div className={checkinStyle.amountPair}>
                      <label>Advance Payment</label>
                      <label>₹&nbsp;{advancePayment?.toFixed(2)}</label>
                    </div>

                    <div
                      style={{ borderTop: "1px solid #d0d1d3" }}
                      className={checkinStyle.amountPair}
                    >
                      <label>Grand Total</label>
                      <label>₹&nbsp;{formData.grandTotal?.toFixed(2)}</label>
                    </div>
                    <div
                      style={{ borderTop: "1px solid black" }}
                      className={checkinStyle.amountPair}
                    >
                      <label>Total Outstanding</label>
                      <label>₹&nbsp;{formData.dueAmount?.toFixed(2)}</label>
                    </div>
                  </div>
                  <div className={checkinStyle.paymentContainer}>
                    {/**Code Modification By Tejasve Gupta on 20-07-2024
                  Reason - Style Updated for responsive  */}
                    <div style={{ display: "flex", gap: "1px" }}>
                      {/**End of Code Modification By Tejasve Gupta on 20-07-2024
                    Reason - Style Updated for responsive  */}
                      <label
                        className={checkinStyle.labelContainer}
                        style={{ width: "135px" }}
                      >
                        <span className={checkinStyle.optionalField}>* </span>
                        {/* Commented by akanksha on 16th oct, reason to remove checkbox */}
                        {/* <span className={checkinStyle.rightIcon}>
                          <ImCheckboxChecked />{" "}
                        </span> */}
                        {/* Commented by akanksha on 16th oct, reason to remove checkbox */}
                        Payment Method
                      </label>
                      {/* <div style={{ width: "20%" }}> : </div> */}
                      {/**End of Code Addition and Modification by Tejasve Gupta on 14-07-2026
                                      Reason - UI Enhancements and Addition of new fields*/}
                    </div>
                    <div
                      // Modified the code by akanksha on 16-10-2024,
                      // Reason to align bullet points and text
                      className={checkinStyle.radioButton}
                      style={{
                        display: "flex",
                        gap: "15%",
                        alignItems: "center",
                      }}
                    >
                      <label
                        className={checkinStyle.labelContainer}
                        style={{
                          display: "flex",
                          gap: "3px",
                          alignItems: "center",
                        }}
                      >
                        <input
                          type="radio"
                          name="payment_method"
                          value="Cash"
                          checked={formData.payment_method === "Cash"}
                          onChange={handleRoomChange}
                          tabIndex={31}
                        />
                        <div>Cash</div>
                      </label>
                      {console.log(formData.payment_method,"CashorOnline")}
                      <label
                        className={checkinStyle.labelContainer}
                        style={{
                          display: "flex",
                          gap: "3px",
                          alignItems: "center",
                        }}
                      >
                        <input
                          type="radio"
                          name="payment_method"
                          value="Online"
                          checked={formData.payment_method === "Online"}
                          onChange={handleRoomChange}
                        />
                        Online
                      </label>
                      {/* End of Modified the code by akanksha on 16-10-2024,
                      Reason to align bullet points and text */}
                      {showModal && (
                        <div className={checkinStyle.modal}>
                          <div className={checkinStyle.modalContent}>
                            <div className={checkinStyle.modalHeader}>
                              <h3>Online Payment Details</h3>
                              <button className={checkinStyle.closedButton} onClick={handleModalClose}>
                                &times; {/* This represents the "X" character */}
                              </button>
                            </div>
                            
                            <div className={checkinStyle.formGroups}>
                              <label className={checkinStyle.formLabels}>Transaction ID:</label>
                              <input
                                type="text"
                                name="transaction_id"
                                className={checkinStyle.formInputsTransactionId}
                                value={formData.transaction_id}
                                onChange={handleTransactionChange}
                              />
                              
                            </div>
                            <div className={checkinStyle.formGroups}>
                              <label className={checkinStyle.formLabels}>
                                Upload Payment Proof: </label>
                              <input type="file" className={checkinStyle.formInputs} accept="image/*" onChange={handleImageUpload} />
                              
                            </div>
                            <div className={checkinStyle.modalbuttons}>
                              <button onClick={handleModalClose}>Save</button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </fieldset>
                <div
                  className={checkinStyle.buttonContainer}
                  style={{ paddingTop: "2%" }}
                  // style={{ display: "flex", justifyContent: "center" }}
                >
                  <button
                    type="submit"
                    // className={checkinStyle.submitButton}
                    className="submitButton"
                    tabIndex={32}
                    /**
                     * Added by - Ashish Dewangan on 23-10-2024
                     * Reason - To disable submit until we get a response from backend
                     */
                    disabled={isSubmitDisabled}
                    /**
                     * End of addition by - Ashish Dewangan on 23-10-2024
                     * Reason - To disable submit until we get a response from backend
                     */
                  >
                    Confirm
                  </button>
                  <div
                    type="cancelChcekin"
                    // className={checkinStyle.cancelButton}
                    className="submitButton"
                    tabIndex={33}
                    onClick={showCancelModal}
                  >
                    Clear Details
                  </div>

                  {/**End of Code Addition and Modification by Tejasve Gupta on 12-07-2026
                    Reason - UI Enhancements and Addition of new fields*/}
                </div>
                <div></div>
              </div>
            </div>
            {/* </div> */}
          </div>
        </form>
        {/**Code Modification by Tejasve Gupta on 10-08-2024
         * reason - Add Payment receipt modal with print Functionality
         */}
        {paymentReceiptData && advancePayment > 0 && (
          <PaymentReceiptModal
            visible={isModalVisible}
            onClose={handleCloseModal}
            paymentReceiptData={paymentReceiptData}
          />
        )}
        {/**End of Code Modification by Tejasve Gupta on 10-08-2024
         * reason - Add Payment receipt modal with print Functionality
         */}
        {/* <Modal
          className={checkinStyle.modal}
          title="Check-in Details"
          visible={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
        >
          <div className={checkinStyle.modalFields}>
            <div className={checkinStyle.modalInputPair}>
              <div className={checkinStyle.modalLabel}>
                <label>Name</label>
              </div>
              <span>:</span>{" "}
              <div className={checkinStyle.modalInput}>{formData.name}</div>
            </div>
            <div className={checkinStyle.modalInputPair}>
              <div className={checkinStyle.modalLabel}>
                <label>Last Name</label>
              </div>
              <span>:</span>{" "}
              <div className={checkinStyle.modalInput}>
                {formData.last_name}
              </div>
            </div>
            <div className={checkinStyle.modalInputPair}>
              <div className={checkinStyle.modalLabel}>
                <label>Address</label>
              </div>
              <span>:</span>{" "}
              <div className={checkinStyle.modalInput}>{formData.address}</div>
            </div>
            <div className={checkinStyle.modalInputPair}>
              <div className={checkinStyle.modalLabel}>
                <label>Phone</label>
              </div>
              <span>:</span>{" "}
              <div className={checkinStyle.modalInput}>{formData.phone}</div>
            </div>
            <div className={checkinStyle.modalInputPair}>
              <div className={checkinStyle.modalLabel}>
                <label>ID Card Type</label>
              </div>
              <span>:</span>{" "}
              <div className={checkinStyle.modalInput}>
                {formData.id_card_type}
              </div>
            </div>
            <div className={checkinStyle.modalInputPair}>
              <div className={checkinStyle.modalLabel}>
                <label>ID Card No</label>
              </div>
              <span>:</span>{" "}
              <div className={checkinStyle.modalInput}>
                {formData.id_card_no}
              </div>
            </div>
            <div className={checkinStyle.modalInputPair}>
              <div className={checkinStyle.modalLabel}>
                <label>ID Card Photo</label>
              </div>
              <span>:</span>{" "}
              <div className={checkinStyle.modalInput}>
                {formData.id_card_photo?.name}
              </div>
            </div>
            <div className={checkinStyle.modalInputPair}>
              <div className={checkinStyle.modalLabel}>
                <label>Room Number</label>
              </div>
              <span>:</span>{" "}
              <div className={checkinStyle.modalInput}>
                {formData.room_number}
              </div>
            </div>
            <div className={checkinStyle.modalInputPair}>
              <div className={checkinStyle.modalLabel}>
                <label>Room Type</label>
              </div>
              <span>:</span>{" "}
              <div className={checkinStyle.modalInput}>
                {formData.room_type}
              </div>
            </div>
            <div className={checkinStyle.modalInputPair}>
              <div className={checkinStyle.modalLabel}>
                <label>Total Charges</label>
              </div>
              <span>:</span>{" "}
              <div className={checkinStyle.modalInput}>
                {formData.totalCharges}
              </div>
            </div>
            <div className={checkinStyle.modalInputPair}>
              <div className={checkinStyle.modalLabel}>
                <label>Check-In Date </label>
              </div>
              <span>:</span>{" "}
              <div className={checkinStyle.modalInput}>
                {formData.arrival_date}
              </div>
            </div>
            <div className={checkinStyle.modalInputPair}>
              <div className={checkinStyle.modalLabel}>
                <label>Check-In Time</label>
              </div>
              <span>:</span>{" "}
              <div className={checkinStyle.modalInput}>
                {formData.arrival_time}
              </div>
            </div>
            <div className={checkinStyle.modalInputPair}>
              <div className={checkinStyle.modalLabel}>
                <label>Check-Out Date</label>
              </div>
              <span>:</span>{" "}
              <div className={checkinStyle.modalInput}>
                {formData.departure_date}
              </div>
            </div>
            <div className={checkinStyle.modalInputPair}>
              <div className={checkinStyle.modalLabel}>
                <label>Check-Out Time</label>
              </div>
              <span>:</span>{" "}
              <div className={checkinStyle.modalInput}>
                {formData.departure_time}
              </div>
            </div>
            <div className={checkinStyle.modalInputPair}>
              <div className={checkinStyle.modalLabel}>
                <label>Payment Method</label>
              </div>
              <span>:</span>{" "}
              <div className={checkinStyle.modalInput}>
                {formData.payment_method}
              </div>
            </div>
            <div className={checkinStyle.modalInputPair}>
              <div className={checkinStyle.modalLabel}>
                <label>Number of Persons</label>
              </div>
              <span>:</span>{" "}
              <div className={checkinStyle.modalInput}>
                {formData.number_of_persons}
              </div>
            </div>
            <div className={checkinStyle.modalInputPair}>
              <div className={checkinStyle.modalLabel}>
                <label>Children</label>
              </div>
              <span>:</span>{" "}
              <div className={checkinStyle.modalInput}>
                {formData.number_of_children}
              </div>
            </div>
            <div className={checkinStyle.modalInputPair}>
              <div className={checkinStyle.modalLabel}>
                <label>Adults</label>
              </div>
              <span>:</span>{" "}
              <div className={checkinStyle.modalInput}>
                {formData.number_of_adults}
              </div>
            </div>
          </div>
        </Modal> */}
        {/* End of Code modification by Tejasve Gupta on 26-06-2024 // Reason -
        Change in CSS style*/}
      </div>

      <Modal
        title="Cancel Check-in"
        visible={isCancelModalVisible}
        onOk={handleCancelOk}
        onCancel={handleCancelCheckin}
        okText="Yes"
        cancelText="No"
      >
        <p>Are you sure you cancel check-in?</p>
      </Modal>
      <div className={checkinStyle.coloredBackground2}>
        <legend
          style={{ marginLeft: "2%" }}
          className={checkinStyle.secionHeading}
        ></legend>
        <div className={checkinStyle.toolTipContainer}>
          <CheckInTooltips />
        </div>
      </div>
    </div>
  );
};

export default CheckIn;
