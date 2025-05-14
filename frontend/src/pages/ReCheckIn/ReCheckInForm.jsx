import React, { useContext, useState, useEffect } from "react";
import ReCheckInStyle from "./ReCheckinForm.module.css";
import { Modal } from "antd";
import { getCurrentDate } from "../../utils/Date";
import { MdDelete } from "react-icons/md";
import {
  checkIsEmpty,
  checkIfSmallerThanMinLength,
  checkIfGreaterThanMaxLength,
  checkIsNotADigit,
} from "../../utils/validations";
import { getCheckinDetails, postReCheckinDetailsApi } from "../../Api/services";
import notificationObject from "../../components/Widgets/Notification/Notification";
import { GlobalContext } from "../../context/Context";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  CitySelect,
  CountrySelect,
  StateSelect,
  LanguageSelect,
} from "react-country-state-city";
import "react-country-state-city/dist/react-country-state-city.css";
import { TbArrowsExchange2 } from "react-icons/tb";
import { ImCheckboxChecked } from "react-icons/im";
const ReCheckIn = () => {
  const { roomData, availableRoomList, reservedRoomList, vacantRoomList } =
    useContext(GlobalContext);

  useEffect(() => {}, [
    roomData,
    availableRoomList,
    reservedRoomList,
    vacantRoomList,
  ]);

  const [formData, setFormData] = useState({
    name: "",
    last_name: "",
    address: "",
    // Code Addition by Tejasve Gupta on 15-07-2024
    // Reason - addition of Country state and city Dropdown
    country: "",
    state: "",
    city: "",
    zip: "",
    // End of Code Addition by Tejasve Gupta on 15-07-2024
    // Reason - addition of Country state and city Dropdown
    phone: "",
    email: "",
    id_card_type: "",
    id_card_no: "",
    id_card_photo: null,
    room_number: "",
    room_type: "",
    totalCharges: "",
    price: "",
    arrival_date: "",
    arrival_time: "",
    departure_date: "",
    departure_time: "",
    payment_method: "Cash",
    number_of_persons: 1,
    number_of_children: 0,
    number_of_adults: 0,
  });
  // const location = useLocation();
  const [total_amount, setTotalCharges] = useState(0);
  const [contactNumberError, setContactNumberError] = useState("");
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [arrivalDateError, setArrivalDateError] = useState("");
  const [departureDateError, setDepartureDateError] = useState("");
  const [arrivalTimeError, setArrivalTimeError] = useState("");
  const [departureTimeError, setDepartureTimeError] = useState("");
  const [roomError, setRoomError] = useState("");
  const [idTypeError, setIdTypeError] = useState("");
  const [idNumberError, setIdNumberError] = useState("");
  const [numberOfDays, setNumberOfDays] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const location = useLocation();
  const billingId = new URLSearchParams(location.search).get("billing_id");

  const [nowTime, setNowTime] = useState(new Date());
  /**Code Addition and Modification by Tejasve Gupta on 15-07-2024
Reason - To add Country, State, City Dropdown*/

  const [countryid, setCountryid] = useState(0);
  const [stateid, setstateid] = useState(0);
  /**End of Code Addition and Modification by Tejasve Gupta on 15-07-2024
Reason - To add Country, State, City Dropdown*/

  // Code Addition by Tejasve Gupta on 19-07-2024
  // Reason - To select Today's Date and time Instantly

  const setTodayDate = () => {
    const today = new Date().toISOString().split("T")[0];
    setFormData((prevFormData) => ({
      ...prevFormData,
      arrival_date: today,
    }));
  };

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
      } else if (checkIfSmallerThanMinLength(value, 10)) {
        setContactNumberError("Please enter 10 digits");
        return false;
      } else if (checkIfGreaterThanMaxLength(value, 10)) {
        setContactNumberError("Please enter 10 digits Only");
        return false;
      } else {
        setContactNumberError("");
      }
    }
    if (input === "arrival_date") {
      if (checkIsEmpty(value)) {
        setArrivalDateError("Please enter check-in Date");
        return false;
      } else {
        setArrivalDateError("");
      }
    }
    if (input === "departure_date") {
      if (checkIsEmpty(value)) {
        setDepartureDateError("Please enter check-out Date");
        return false;
      } else {
        setDepartureDateError("");
      }
    }
    if (input === "arrival_time") {
      if (checkIsEmpty(value)) {
        setArrivalTimeError("Please enter check-in Time");
        return false;
      } else {
        setArrivalTimeError("");
      }
    }
    if (input === "departure_time") {
      if (checkIsEmpty(value)) {
        setDepartureTimeError("Please enter check-out Time");
        return false;
      } else {
        setDepartureTimeError("");
      }
    }
    if (input === "id_card_type") {
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
    } else if (checkIfSmallerThanMinLength(data.phone, 10)) {
      setContactNumberError("Enter 10 digit phone number");
      isValid = false;
    } else if (checkIfGreaterThanMaxLength(data.phone, 15)) {
      setContactNumberError("Enter 10 digit phone number");
      isValid = false;
    }
    if (checkIsEmpty(data.arrival_date)) {
      setArrivalDateError("Please enter check-in date");
      isValid = false;
    }
    if (checkIsEmpty(data.departure_date)) {
      setDepartureDateError("Please enter check-out date");
      isValid = false;
    }
    if (checkIsEmpty(data.arrival_time)) {
      setArrivalTimeError("Please enter check-in Time");
      isValid = false;
    }
    if (checkIsEmpty(data.departure_time)) {
      setDepartureTimeError("Please enter check-out Time");
      isValid = false;
    }
    if (checkIsEmpty(data.id_card_type)) {
      setIdTypeError("Please enter ID Type");
      isValid = false;
    }
    if (checkIsEmpty(data.id_card_no)) {
      setIdNumberError("Please enter I'd number");
      isValid = false;
    } else {
      setIdNumberError("");
    }
    if (selectedRooms.length === 0) {
      setRoomError("Please select at least one room");
      isValid = false;
    } else {
      setRoomError("");
    }
    return isValid;
  };
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
  const [selectedRooms, setSelectedRooms] = useState([]);
  function currentDate() {
    const currentDate = getCurrentDate();
    return currentDate;
  }
  // Code Addition by Tejsve Gupta on 18-07-2024
  // Reason - To add  Country, state, city dropdown

  useEffect(() => {
    const india = { id: 101, name: "India" };
    setCountryid(india.id);
    setFormData((prevFormData) => ({
      ...prevFormData,
      country: india.name,
    }));
  }, []);

  const handleCountryChange = (e) => {
    setCountryid(e.id);
    // console.log("country ID----------->>>>", e.id)
    // console.log("country name----------->>>>", e.name)
    setFormData({
      ...formData,
      country: e.name,
      state: "",
      city: "",
    });
  };

  const handleStateChange = (e) => {
    setstateid(e.id);
    setFormData({
      ...formData,
      state: e.name,
      city: "", // Reset city when state changes
    });
  };

  const handleCityChange = (e) => {
    setFormData({
      ...formData,
      city: e.name,
    });
  };
  // End of Code Addition by Tejsve Gupta on 18-07-2024
  // Reason - To add  Country, state, city dropdown

  const formatDate = (dateString) => {
    if (!dateString) return "00-00-0000";
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
  };
  const handleRoomChange = (e) => {
    const { name, value } = e.target;
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
            };
            setSelectedRooms((prevRooms) => {
              const updatedRooms = [...prevRooms, newRoom];
              return updatedRooms;
            });
            const total = [...selectedRooms, newRoom].reduce(
              (acc, room) => acc + room.price,
              0
            );
            // console.log("total=================", total);
            setTotalCharges(String(total));
            return {
              ...prevData,
              room_number: "",
              room_type: "",
              price: "",
              totalCharges: String(total),
            };
          } else {
            return prevData;
          }
        }
      }
      return {
        ...prevData,
        [name]: value,
      };
    });
  };
  const handleFileChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      id_card_photo: e.target.files[0],
    }));
  };
  const postCheckinForm = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior if used in a form
    /**Code Addition and Modification by Tejasve Gupta on 08-06-2024
     * Reason - For posting data in formal manner
     */
    const d = new FormData();
    d.append("billing_id", billingId);
    d.append("selectedRooms", JSON.stringify(selectedRooms));
    d.append("total_amount", total_amount);
    d.append("name", formData.name);
    d.append("last_name", formData.last_name);
    d.append("email", formData.email);
    d.append("address", formData.address);
    // Code Addition by Tejasve Gupta on 15-07-2024
    // Reason - addition of Country state and city Dropdown
    d.append("country", formData.country);
    d.append("state", formData.state);
    d.append("city", formData.city);
    d.append("zip", formData?.zip?.length > 0 ? formData.zip : 0);
    d.append(
      "dob",
      formData?.dob && formData.dob.length > 0 ? formData.dob : "2024-01-01"
    );
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
    d.append("room_number", formData.room_number);
    d.append("rooom_price", formData.room_number);
    d.append("room_type", formData.room_type);
    d.append("totalCharges", formData.totalCharges);
    d.append("arrival_date", formData.arrival_date);
    d.append("arrival_time", formData.arrival_time);
    d.append("departure_date", formData.departure_date);
    d.append("departure_time", formData.departure_time);
    d.append("payment_method", formData.payment_method);
    d.append("number_of_persons", formData.number_of_persons);
    d.append("number_of_children", formData.number_of_children);
    d.append("number_of_adults", formData.number_of_adults);
    // Code Modificatio by Tejasve Gupta on 28-06-2024
    // Reason - Addition of new fields
    d.append("extraPersonCharges", extraPersonCharges);
    d.append("discount_rupees", discount_rupees);
    d.append("discount_percentage", discount_percentage);
    d.append("subtotal", subtotal);
    d.append("gst", gst);
    d.append("gstValue", gstValue);
    d.append("advancePayment", advancePayment);
    d.append("grandTotal", grandTotal);
    d.append("due", dueAmount);
    console.log("+++++++new form data+++++++++++", d);
    console.log("+++++++form data+++++++++++", formData);
    // End of Code Modificatio by Tejasve Gupta on 28-06-2024
    // Reason - Addition of new fields
    /**End of Code Addition and Modification by Tejasve Gupta on 08-06-2024
     * Reason - For posting data in formal manner
     */

    if (isValidOnSubmit(formData)) {
      const completeFormData = {
        ...formData,
        selectedRooms: selectedRooms,
        total_amount: total_amount,
      };
      try {
        const access = localStorage.getItem("access"); // Get access token from localStorage
        const response = await postReCheckinDetailsApi(access, d);

        notificationObject.success(response.success);

        console.log("Form Data Submitted: ", completeFormData);
        clearForm();
      } catch (error) {
        console.error("Error submitting form data: ", error);
      }
    } else {
      console.log("Form submission halted due to validation errors");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newFormData = {};
    formData.forEach((value, key) => {
      newFormData[key] = value;
    });

    setFormData(newFormData);
    postCheckinForm(e);
    setIsModalVisible(false);
  };

  const handleOk = () => {
    setIsModalVisible(false);
    clearForm();
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const handleDeleteRoom = (room_number) => {
    setSelectedRooms((prevRooms) => {
      const updatedRooms = prevRooms.filter(
        (room) => room.room_number !== room_number
      );
      const total = updatedRooms.reduce((acc, room) => acc + room.price, 0);
      setTotalCharges(String(total));
      return updatedRooms;
    });
  };

  useEffect(() => {
    const total = selectedRooms.reduce((acc, room) => acc + room.price, 0);
    setTotalCharges(String(total));
  }, [selectedRooms]);

  const handleBlur = (e) => {
    const { name, value } = e.target;
    isValidOnBlur(name, value);
  };

  const [currentTime, setCurrentTime] = useState(new Date());
  // const [nowTime, setNowTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNowTime(new Date());
    }, 1000); // Update every 1 second

    // Cleanup function to clear interval on component unmount
    return () => clearInterval(interval);
  }, []);
  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        //Code Addition by Tejasve Gupta on 14-06-2024
        // Reason - status Color Changed as suggested by Tester
        return "#c9f2e3";
      //End of Code Addition by Tejasve Gupta on 14-06-2024
      // Reason - status Color Changed as suggested by Tester
      case "vacant":
        return "#f1dfac";
      case "reserved":
        return "#ffcccc";
      default:
        return "gray";
    }
  };

  const RoomCard = ({ room }) => {
    const statusColor = getStatusColor(room.status);
    return (
      <div
        className={ReCheckInStyle.roomButton}
        style={{
          backgroundColor: statusColor,
          border: "1px solid black",
          borderRadius: "10px",
          boxShadow: "5px 5px 15px #aaaaaa, -5px -5px 15px #ffffff",
          padding: "20px",
          textAlign: "center",
          transition: "all 0.2s ease",
          cursor: "pointer",
          marginTop: "10px",
          // backgroundImage: `linear-gradient(145deg, ${statusColor}, #d5f5d5)`,
          backgroundImage: statusColor,
          fontSize: "10px",
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
        <div className={ReCheckInStyle.buttonText}>
          <div className={ReCheckInStyle.roomNumber}>{room.room_number}</div>
          <div className={ReCheckInStyle.roomType}>{room.room_type}</div>
        </div>
      </div>
    );
  };

  const RoomList = ({ rooms }) => {
    return (
      <div
        /**Code Modification By Tejasve Gupta on 20-07-2024
        Reason - Style Updated for responsive  */
        className={ReCheckInStyle.roomCard}
        style={{
          // marginTop: "10px",
          display: "grid",
          justifyItems: "center",
          marginTop: "10px",
          width: "100%",
          gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", // Flexible columns
          gap: "1%", // Add some space between the items
          alignItems: "center",
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

  useEffect(() => {
    const number_of_persons =
      parseInt(formData.number_of_adults) +
      parseInt(formData.number_of_children);
    setFormData((prevData) => ({
      ...prevData,
      number_of_persons,
    }));
  }, [formData.number_of_adults, formData.number_of_children]);
  /**Code Addition by Tejasve Gupta on 12-06-2024
         Reason - Code addition for Clearing form after submition*/

  const clearForm = () => {
    setFormData((prevData) => ({
      ...prevData,
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
      // End of Code Addition by Tejasve Gupta on 15-07-2024
      // Reason - addition of Country state and city Dropdown
      phone: "",
      id_card_type: "",
      id_card_no: "",
      id_card_photo: null,
      room_number: "",
      room_type: "",
      totalCharges: "",
      arrival_date: "",
      arrival_time: "",
      departure_date: "",
      departure_time: "",
      payment_method: "Cash",
      number_of_persons: 1,
      number_of_children: 0,
      number_of_adults: 0,
    }));
    setSelectedRooms([]);
    setTotalCharges(0);
    setNumberOfDays(0);
    setContactNumberError("");
    setFirstNameError("");
    setLastNameError("");
    setArrivalDateError("");
    setDepartureDateError("");
    setArrivalTimeError("");
    setDepartureTimeError("");
    setRoomError("");
    setIdTypeError("");
    setIdNumberError("");
  };
  const [extraPersonCharges, setExtraPersonCharges] = useState(0);
  const [discount_rupees, set_discount_rupees] = useState(0);
  const [discount_percentage, set_discount_percentage] = useState(0);
  const [gst, SetGst] = useState(0);
  const [advancePayment, setAdvancePayment] = useState(0);

  const [roomCharges, setRoomCharges] = useState(0);

  useEffect(() => {
    const totalRoomCharges =
      selectedRooms.reduce((total, room) => total + room.price, 0) *
      numberOfDays;
    setRoomCharges(isNaN(totalRoomCharges) ? 0 : totalRoomCharges);
  }, [selectedRooms, numberOfDays]);

  useEffect(() => {
    const discountRupees = (roomCharges * discount_percentage) / 100;
    set_discount_rupees(isNaN(discountRupees) ? 0 : discountRupees);
  }, [discount_percentage, roomCharges]);

  useEffect(() => {
    const discountPercentage = (discount_rupees / roomCharges) * 100;
    set_discount_percentage(isNaN(discountPercentage) ? 0 : discountPercentage);
  }, [discount_rupees, roomCharges]);

  const subtotal =
    roomCharges +
    parseFloat(extraPersonCharges || 0) -
    parseFloat(discount_rupees || 0);
  const gstValue = subtotal * (gst / 100);
  const grandTotal = subtotal + gstValue;
  const dueAmount = grandTotal - parseFloat(advancePayment || 0);

  const handleExtraChargesChange = (e) =>
    setExtraPersonCharges(parseFloat(e.target.value) || 0);
  const handleDiscountRupeesChange = (e) =>
    set_discount_rupees(parseFloat(e.target.value) || 0);
  const handleDiscountPercentageChange = (e) =>
    set_discount_percentage(parseFloat(e.target.value) || 0);
  const handleGstRateChange = (e) => SetGst(parseFloat(e.target.value) || 0);
  const handleAdvancePaymentChange = (e) =>
    setAdvancePayment(parseFloat(e.target.value) || 0);
  return (
    <div className={ReCheckInStyle.pageFrame}>
      {/** Code modification by Tejasve Gupta on 26-06-2024
     Reason - Change in CSS style*/}
      <div className={ReCheckInStyle.coloredBackground}>
        <form onSubmit={handleSubmit} className={ReCheckInStyle.form}>
          <div className={ReCheckInStyle.checkinTitle}>
            Re-Check-In Details
            <div className={ReCheckInStyle.dateTime}>
              {/**End of Code Modification and commented by Tejasve Gupta on 16-06-2024
              Reason - Live Date and Time added and Style add in css file*/}
              <div style={{ marginRight: "5px" }}>{currentDate()}</div>|
              {/** End of Code Modification by Tejasve Gupta on 18-06-2024
                Reason - Styles Updated as Suggested by Tester*/}
              <div style={{ marginLeft: "5px" }}>
                {nowTime.toLocaleTimeString()}
              </div>
            </div>
          </div>
          <div
            style={{
              width: "100vw",
              textAlign: "center",
              // width: "100%",
              display: "flex",
              flexDirection: "column",
              // justifyContent: "center",
              fontWeight: "bold",
              // border: "1px solid blue",
            }}
          >
            {/**Code Modification and commented by Tejasve Gupta on 16-06-2024
            Reason - Live Date and Time added and Style add in css file*/}
            {/** Code Modification by Tejasve Gupta on 18-06-2024
              Reason - Styles Updated as Suggested by Tester*/}
          </div>
          <div className={ReCheckInStyle.formContainer}>
            <div className={ReCheckInStyle.leftContainer}>
              {/**Code Modification by Tejasve Gupta on 05-06-2024
               * Reason - Change in Styles
               */}
              <legend className={ReCheckInStyle.secionHeading}>
                Guest Details
              </legend>
              <fieldset className={ReCheckInStyle.guestContainer}>
                {/**End of Code Modification by Tejasve Gupta on 16-06-2024
                  Reason - Live Date and Time added and Style adjusted*/}
                {/**Code Modification by Tejasve Gupta on 05-06-2024
                 * Reason - Change in Styles
                 */}

                {/**Code Modification by Tejasve Gupta on 06-06-2024
                   Reason - Form Sequence changed Guided by Ashish sir*/}

                <div className={ReCheckInStyle.personalDetails}>
                  <div className={ReCheckInStyle.nameContainer}>
                    <div className={ReCheckInStyle.inputPair}>
                      <div
                        /** Code Commented by Tejasve Gupta on 18-06-2024
                        Reason - Styles updated in CSS file*/
                        className={ReCheckInStyle.starLabelColon}
                        // style={{
                        //   // border: "1px solid red",
                        //   display: "flex",
                        //   width: "95%",
                        // }}
                      >
                        <label
                          htmlFor="name"
                          className={ReCheckInStyle.labelContainer}
                          // style={{ width: "90%" }}
                        >
                          {/** End of Code Commented by Tejasve Gupta on 18-06-2024
                            Reason - Styles updated in CSS file*/}
                          <span className={ReCheckInStyle.mandatoryField}>
                            *{" "}
                          </span>
                          First Name
                        </label>
                        {/* <div style={{ width: "20%" }}> : </div> */}
                      </div>
                      <div
                        className={ReCheckInStyle.inputError}
                        // style={{ width: "50%" }}
                      >
                        <input
                          className={ReCheckInStyle.inputContainer}
                          type="text"
                          id="name"
                          name="name"
                          placeholder="First Name"
                          tabIndex={1}
                          value={formData.name}
                          onChange={handleRoomChange}
                          onBlur={(e) => isValidOnBlur("name", e.target.value)}
                        />
                        {firstNameError && (
                          <span className={ReCheckInStyle.error}>
                            {firstNameError}
                          </span>
                        )}{" "}
                      </div>
                    </div>
                    <div className={ReCheckInStyle.inputPair}>
                      <div className={ReCheckInStyle.starLabelColon}>
                        <label
                          htmlFor="last_name"
                          className={ReCheckInStyle.labelContainer}
                        >
                          <span className={ReCheckInStyle.mandatoryField}>
                            *{" "}
                          </span>
                          Last Name
                        </label>
                      </div>
                      <div className={ReCheckInStyle.inputError}>
                        <input
                          className={ReCheckInStyle.inputContainer}
                          type="text"
                          id="last_name"
                          name="last_name"
                          placeholder="Last Name"
                          value={formData.last_name}
                          tabIndex={2}
                          onChange={handleRoomChange}
                          onBlur={(e) =>
                            isValidOnBlur("last_name", e.target.value)
                          }
                        />
                        {lastNameError && (
                          <span className={ReCheckInStyle.error}>
                            {lastNameError}
                          </span>
                        )}{" "}
                      </div>
                    </div>
                    {/**Code Addition and Modification by Tejasve Gupta on 15-07-2026
						        Reason - UI Enhancements and Addition of new fields*/}
                    {/* Code Addition by Tejasve Gupta on 18-07-2024
                    Reason - To get user's DOB and Gender */}
                    <div className={ReCheckInStyle.inputPair}>
                      <div className={ReCheckInStyle.starLabelColon}>
                        <label
                          htmlFor="date"
                          className={ReCheckInStyle.labelContainer}
                        >
                          <span className={ReCheckInStyle.optionalField}>
                            *{" "}
                          </span>
                          Date of Birth
                        </label>
                      </div>
                      <div className={ReCheckInStyle.inputError}>
                        <input
                          className={ReCheckInStyle.inputContainer}
                          type="date"
                          id="dob"
                          name="dob"
                          value={formData.dob}
                          tabIndex={3}
                          onChange={handleRoomChange}
                          // onBlur={(e) =>
                          //   isValidOnBlur("dob", e.target.value)
                          // }
                        />
                        {/* {lastNameError && (
                          <span className={ReCheckInStyle.error}>
                            {lastNameError}
                          </span>
                        )}{" "} */}
                      </div>
                    </div>
                    <div className={ReCheckInStyle.inputPair}>
                      <div className={ReCheckInStyle.starLabelColon}>
                        <label
                          htmlFor="gender"
                          className={ReCheckInStyle.labelContainer}
                        >
                          <span className={ReCheckInStyle.optionalField}>
                            *{" "}
                          </span>
                          Gender
                        </label>
                      </div>
                      <div className={ReCheckInStyle.inputError}>
                        <select
                          className={ReCheckInStyle.selectInputContainer}
                          id="gender"
                          name="gender"
                          value={formData.gender}
                          tabIndex={4}
                          onChange={handleRoomChange}
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                        {/* {lastNameError && (
                            <span className={ReCheckInStyle.error}>
                              {lastNameError}
                            </span>
                          )}{" "} */}
                      </div>
                    </div>
                    {/* End of Code Addition by Tejasve Gupta on 18-07-2024
                    Reason - To get user's DOB and Gender */}
                  </div>

                  <div className={ReCheckInStyle.contactContainer}>
                    <div className={ReCheckInStyle.inputPair}>
                      <div className={ReCheckInStyle.starLabelColon}>
                        <label
                          htmlFor="phone"
                          className={ReCheckInStyle.labelContainer}
                        >
                          <span className={ReCheckInStyle.mandatoryField}>
                            *{" "}
                          </span>
                          Phone Number
                        </label>
                      </div>
                      <div className={ReCheckInStyle.inputError}>
                        <input
                          className={ReCheckInStyle.inputContainer}
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          tabIndex={5}
                          maxLength={10}
                          placeholder="Phone Number"
                          onChange={handleRoomChange}
                          onBlur={(e) => isValidOnBlur("phone", e.target.value)}
                        />
                        {contactNumberError && (
                          <span className={ReCheckInStyle.error}>
                            {contactNumberError}
                          </span>
                        )}
                      </div>
                    </div>
                    {/**End of Code Addition and Modification by Tejasve Gupta on 15-07-2026
                    Reason - UI Enhancements and Addition of new fields*/}
                    <div className={ReCheckInStyle.inputPair}>
                      <div
                        /** Code Commented by Tejasve Gupta on 18-06-2024
                        Reason - Styles updated in CSS file*/
                        className={ReCheckInStyle.starLabelColon}
                        // style={{
                        //   // border: "1px solid red",
                        //   display: "flex",
                        //   width: "95%",
                        // }}
                      >
                        <label
                          htmlFor="email"
                          className={ReCheckInStyle.labelContainer}
                          // style={{ width: "90%" }}
                        >
                          {/** End of Code Commented by Tejasve Gupta on 18-06-2024
                            Reason - Styles updated in CSS file*/}
                          <span className={ReCheckInStyle.optionalField}>
                            *{" "}
                          </span>
                          Email
                        </label>
                        {/* <div style={{ width: "20%" }}> : </div> */}
                      </div>
                      <div
                        className={ReCheckInStyle.inputError}
                        // style={{ width: "50%" }}
                      >
                        <input
                          className={ReCheckInStyle.inputContainer}
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
                    <div className={ReCheckInStyle.inputPair}>
                      <div
                        /** Code Commented by Tejasve Gupta on 18-06-2024
                          Reason - Styles updated in CSS file*/
                        className={ReCheckInStyle.starLabelColonAddress}
                        // style={{
                        //   // border: "1px solid red",
                        //   display: "flex",
                        //   width: "95%",
                        // }}
                      >
                        <label
                          htmlFor="address"
                          className={ReCheckInStyle.labelContainer}
                          // style={{ width: "90%" }}
                        >
                          {/**End of Code Commented by Tejasve Gupta on 18-06-2024
                            Reason - Styles updated in CSS file*/}
                          <span className={ReCheckInStyle.optionalField}>
                            *{" "}
                          </span>
                          Address
                        </label>
                        {/* <div style={{ width: "20%" }}> : </div> */}
                      </div>

                      <input
                        className={ReCheckInStyle.AddressInputContainer}
                        type="text"
                        id="address"
                        name="address"
                        placeholder="Address"
                        value={formData.address}
                        onChange={handleRoomChange}
                        tabIndex={7}
                        // required
                      />
                    </div>
                    {/* Code commented and Addition by Tejasve Gupta on 21-07-2024
  Reason - Style Adjustments */}
                    <div className={ReCheckInStyle.inputPair}>
                      <div className={ReCheckInStyle.starLabelColon}>
                        <label
                          htmlFor="zip"
                          className={ReCheckInStyle.labelContainer}
                        >
                          <span className={ReCheckInStyle.optionalField}>
                            *{" "}
                          </span>
                          Zip
                        </label>
                      </div>
                      <div className={ReCheckInStyle.inputError}>
                        <input
                          className={ReCheckInStyle.ZipInputContainer}
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
                    </div>
                    {/* Code commented and Addition by Tejasve Gupta on 21-07-2024
  Reason - Style Adjustments */}
                  </div>

                  <div className={ReCheckInStyle.addressContainer}>
                    {/* Code Addition by Tejsve Gupta on 18-07-2024
                        Reason - To add  Country, state, city dropdown */}
                    <div className={ReCheckInStyle.inputPair}>
                      <div className={ReCheckInStyle.starLabelColon}>
                        <label
                          htmlFor="country"
                          className={ReCheckInStyle.labelContainer}
                        >
                          <span className={ReCheckInStyle.optionalField}>
                            *{" "}
                          </span>
                          Country
                        </label>
                      </div>
                      <CountrySelect
                        onChange={handleCountryChange}
                        tabIndex={9}
                        placeHolder="Select Country"
                        value={formData.country}
                      />
                    </div>
                    <div className={ReCheckInStyle.inputPair}>
                      <div className={ReCheckInStyle.starLabelColon}>
                        <label
                          htmlFor="state"
                          className={ReCheckInStyle.labelContainer}
                        >
                          <span className={ReCheckInStyle.optionalField}>
                            *{" "}
                          </span>
                          State
                        </label>
                      </div>
                      <div className={ReCheckInStyle.inputError}>
                        <StateSelect
                          countryid={countryid}
                          tabIndex={10}
                          onChange={handleStateChange}
                          placeHolder="Select State"
                          value={formData.state}
                        />
                      </div>
                    </div>
                    <div className={ReCheckInStyle.inputPair}>
                      <div className={ReCheckInStyle.starLabelColon}>
                        <label
                          htmlFor="city"
                          className={ReCheckInStyle.labelContainer}
                        >
                          <span className={ReCheckInStyle.optionalField}>
                            *{" "}
                          </span>
                          City
                        </label>
                      </div>
                      <CitySelect
                        countryid={countryid}
                        stateid={stateid}
                        tabIndex={11}
                        onChange={handleCityChange}
                        placeHolder="Select City"
                        value={formData.city}
                      />
                    </div>

                    {/*End of Code Addition by Tejsve Gupta on 18-07-2024
                        Reason - To add  Country, state, city dropdown */}
                  </div>

                  {/**Code Modification by Tejasve Gupta on 06-06-2024
                   * reason - UI changes as guided by Ashish sir
                   */}
                  <div className={ReCheckInStyle.idContainer}>
                    {/* <div className={ReCheckInStyle.idTypeImage}> */}
                    {/**End of Code Modification by Tejasve Gupta on 06-06-2024
                     * reason - UI changes as guided by Ashish sir
                     */}
                    <div className={ReCheckInStyle.inputPair}>
                      <div
                        /** Code Commented by Tejasve Gupta on 18-06-2024
                                Reason - Styles updated in CSS file*/
                        className={ReCheckInStyle.starLabelColon}
                        // style={{
                        //   // border: "1px solid red",
                        //   display: "flex",
                        //   width: "95%",
                        // }}
                      >
                        <label
                          htmlFor="id_card_type"
                          className={ReCheckInStyle.labelContainer}
                          // style={{ width: "90%" }}
                        >
                          {/**End of Code Commented by Tejasve Gupta on 18-06-2024
                                    Reason - Styles updated in CSS file*/}
                          <span className={ReCheckInStyle.mandatoryField}>
                            *{" "}
                          </span>
                          ID Type
                        </label>
                        {/* <div style={{ width: "20%" }}> : </div> */}
                      </div>
                      <div className={ReCheckInStyle.inputError}>
                        <select
                          className={ReCheckInStyle.selectInputContainer}
                          id="id_card_type"
                          name="id_card_type"
                          placeholder="Id Card Type"
                          value={formData.id_card_type}
                          onChange={handleRoomChange}
                          tabIndex={12}
                          onBlur={(e) =>
                            isValidOnBlur(e.target.name, e.target.value)
                          }
                          // required
                        >
                          {/**Code Modification by Tejasve Gupta on 06-06-2024
                           * reason - UI changes as guided by Ashish sir
                           */}
                          <option value="">Select</option>
                          <option value="Passport">Passport</option>
                          <option value="Driver's License">
                            Driver's License
                          </option>
                          <option value="Voter I'd">Voter I'd</option>

                          <option value="Aadhar">Aadhar</option>
                          <option value="Other">Other</option>
                        </select>
                        {idTypeError && (
                          <div className={ReCheckInStyle.validationError}>
                            {idTypeError}
                          </div>
                          /**End of Code Modification by Tejasve Gupta on 06-06-2024
                           * reason - UI changes as guided by Ashish sir
                           */
                        )}
                      </div>
                    </div>

                    {/* </div> */}

                    <div className={ReCheckInStyle.inputPair}>
                      {/**Code Commented by Tejasve Gupta on 18-06-2024
                              Reason - Styles updated in CSS file*/}
                      <div
                        className={ReCheckInStyle.starLabelColon}
                        // style={{
                        //   // border: "1px solid red",
                        //   display: "flex",
                        //   width: "95%",
                        // }}
                      >
                        <label
                          htmlFor="id_card_no"
                          className={ReCheckInStyle.labelContainer}
                          // style={{ width: "90%" }}
                        >
                          {/**End of Code Commented by Tejasve Gupta on 18-06-2024
                              Reason - Styles updated in CSS file*/}
                          <span className={ReCheckInStyle.mandatoryField}>
                            *{" "}
                          </span>
                          ID Number
                        </label>
                        {/* <div style={{ width: "20%" }}> : </div> */}
                      </div>
                      <div className={ReCheckInStyle.inputError}>
                        <input
                          className={ReCheckInStyle.inputContainer}
                          type="text"
                          id="id_card_no"
                          name="id_card_no"
                          value={formData.id_card_no}
                          tabIndex={13}
                          onChange={handleRoomChange}
                          placeholder="ID Number"
                          // required
                          onBlur={
                            () =>
                              //Code modification by Tejasve Gupta on 14-06-2024
                              // Reason - variable name changed as similar to backend
                              isValidOnBlur("id_card_no", formData.id_card_no)
                            //End of Code modification by Tejasve Gupta on 14-06-2024
                            // Reason - variable name changed as similar to backend
                          }
                        />
                        {idNumberError && (
                          <div className={ReCheckInStyle.error}>
                            {idNumberError}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={ReCheckInStyle.uploadImage}>
                      <div className={ReCheckInStyle.ImageInputPair}>
                        <div
                          /**Code Commented by Tejasve Gupta on 18-06-2024
                            Reason - Styles updated in CSS file*/
                          className={ReCheckInStyle.starLabelColonImage}
                          // style={{
                          //   // border: "1px solid red",
                          //   display: "flex",
                          //   width: "95%",
                          // }}
                        >
                          <label
                            htmlFor="id_card_photo"
                            className={ReCheckInStyle.labelContainer}
                            // style={{ width: "90%" }}
                          >
                            {/**End of Code Commented by Tejasve Gupta on 18-06-2024
                                Reason - Styles updated in CSS file*/}
                            <span className={ReCheckInStyle.optionalField}>
                              *{" "}
                            </span>
                            Upload Image
                          </label>
                          {/* <div style={{ width: "20%" }}> : </div> */}
                        </div>
                        <input
                          className={ReCheckInStyle.inputContainerImage}
                          /**Code Modification by Tejasve Gupta on 06-06-2024
                           * reason - UI changes as guided by Ashish sir
                           */
                          style={{ width: "fitContent", marginLeft: "10px" }}
                          type="file"
                          id="id_card_photo"
                          name="id_card_photo"
                          // value={formData.id_card_photo}
                          accept="image/*"
                          tabIndex={14}
                          onChange={handleFileChange}
                          /**End of Code Modification by Tejasve Gupta on 06-06-2024
                           * reason - UI changes as guided by Ashish sir
                           */
                          // required
                        />
                      </div>
                    </div>
                  </div>

                  <div className={ReCheckInStyle.personsContainer}>
                    <div className={ReCheckInStyle.inputPair}>
                      <div className={ReCheckInStyle.starLabelColon}>
                        <label
                          htmlFor="number_of_persons"
                          className={ReCheckInStyle.labelContainer}
                        >
                          <span className={ReCheckInStyle.optionalField}>
                            *{" "}
                          </span>
                          Number of Persons
                        </label>
                        {/* <div style={{ width: "20%" }}> : </div> */}
                      </div>
                      <select
                        className={ReCheckInStyle.inputContainer1}
                        id="number_of_persons"
                        name="number_of_persons"
                        value={formData.number_of_persons}
                        tabIndex={15}
                        onChange={handleRoomChange}
                        placeholder="Number of Person"
                      >
                        {[...Array(11).keys()].map((num) => (
                          <option key={num} value={num}>
                            {num}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={ReCheckInStyle.inputPair}>
                      <div className={ReCheckInStyle.starLabelColon}>
                        <label
                          htmlFor="number_of_children"
                          className={ReCheckInStyle.labelContainer}
                        >
                          <span className={ReCheckInStyle.optionalField}>
                            *{" "}
                          </span>
                          Number of Children
                        </label>
                        {/* <div style={{ width: "20%" }}> : </div> */}
                      </div>
                      <select
                        className={ReCheckInStyle.inputContainer1}
                        id="number_of_children"
                        name="number_of_children"
                        placeholder="Number of Children"
                        value={formData.number_of_children}
                        tabIndex={16}
                        onChange={handleRoomChange}
                      >
                        {[...Array(11).keys()].map((num) => (
                          <option key={num} value={num}>
                            {num}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={ReCheckInStyle.inputPair}>
                      <div className={ReCheckInStyle.starLabelColon}>
                        <label
                          htmlFor="number_of_adults"
                          className={ReCheckInStyle.labelContainer}
                        >
                          <span className={ReCheckInStyle.optionalField}>
                            *{" "}
                          </span>
                          Number of Adults
                        </label>
                        {/* <div style={{ width: "20%" }}> : </div> */}
                      </div>
                      <select
                        className={ReCheckInStyle.inputContainer1}
                        id="number_of_adults"
                        name="number_of_adults"
                        value={formData.number_of_adults}
                        onChange={handleRoomChange}
                        tabIndex={17}
                      >
                        {[...Array(11).keys()].map((num) => (
                          <option key={num} value={num}>
                            {num}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                {/**Code Modification by Tejasve Gupta on 06-06-2024
                 * reason - UI changes as guided by Ashish sir
                 */}
              </fieldset>
              <legend className={ReCheckInStyle.secionHeading}>
                Staying Details
              </legend>
              <fieldset className={ReCheckInStyle.dateTimeContainer}>
                {/**Code re-placed by Tejasve Gupta on 06-06-2024
                 * Reason - Rearranging the sequence as told by Tester for form design
                 */}
                {/* <div className={ReCheckInStyle.datesContainer}> */}
                <div className={ReCheckInStyle.arrival}>
                  {/**End of Code Modification by Tejasve Gupta on 06-06-2024
                   * reason - UI changes as guided by Ashish sir
                   */}
                  <div className={ReCheckInStyle.StayInputPair}>
                    <div className={ReCheckInStyle.starInput}>
                      <label
                        htmlFor="arrival_date"
                        className={ReCheckInStyle.labelContainer}
                        // style={{ width: "90%" }}
                      >
                        <span className={ReCheckInStyle.mandatoryField}>
                          *{" "}
                        </span>
                        {/**Code Addition and Modification by Tejasve Gupta on 15-07-2026
							                Reason - UI Enhancements and Addition of new fields*/}
                        Check-in
                      </label>
                      {/* <div style={{ width: "20%" }}> : </div> */}
                    </div>
                    <div className={ReCheckInStyle.dateTimeInput}>
                      <div className={ReCheckInStyle.inputError}>
                        <input
                          className={ReCheckInStyle.inputContainer}
                          type="date"
                          id="arrival_date"
                          name="arrival_date"
                          value={formData.arrival_date}
                          onChange={handleRoomChange}
                          tabIndex={18}
                          min={currentDate()}
                          onBlur={(e) =>
                            isValidOnBlur("arrival_date", e.target.value)
                          }
                        />
                        <button
                          className={ReCheckInStyle.nowButton}
                          tabIndex={19}
                          type="button"
                          onClick={setTodayDate}
                        >
                          Today
                        </button>
                        {arrivalDateError && (
                          <span className={ReCheckInStyle.error}>
                            {arrivalDateError}
                          </span>
                        )}
                      </div>
                      <div className={ReCheckInStyle.inputError}>
                        <input
                          className={ReCheckInStyle.inputContainer}
                          type="time"
                          id="arrival_time"
                          name="arrival_time"
                          value={formData.arrival_time}
                          tabIndex={20}
                          onChange={handleRoomChange}
                          onBlur={(e) =>
                            isValidOnBlur("arrival_time", e.target.value)
                          }
                        />
                        <button type="button" onClick={setCurrenttime}>
                          Now
                        </button>
                        {arrivalTimeError && (
                          <span className={ReCheckInStyle.error}>
                            {arrivalTimeError}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* <div className={ReCheckInStyle.inputPair}>
                      <div className={ReCheckInStyle.starInput}>
                        <label
                          htmlFor="arrival_time"
                          className={ReCheckInStyle.labelContainer}
                          style={{ width: "90%" }}
                        >
                          <span className={ReCheckInStyle.mandatoryField}>
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

                  {/* <div className={ReCheckInStyle.departure}> */}
                  <div className={ReCheckInStyle.StayInputPair}>
                    <div className={ReCheckInStyle.starInput}>
                      {/**End of Code Commented by Tejasve Gupta on 18-06-2024
                          Reason - Styles updated in CSS file*/}
                      <label
                        htmlFor="departure_date"
                        className={ReCheckInStyle.labelContainer}
                        // style={{ width: "90%" }}
                      >
                        <span className={ReCheckInStyle.mandatoryField}>
                          *{" "}
                        </span>
                        Check-out Date
                      </label>
                      {/**Code Addition and Modification by Tejasve Gupta on 14-07-2026
                        Reason - UI Enhancements and Addition of new fields*/}
                      {/* <div style={{ width: "20%" }}> : </div> */}
                    </div>
                    <div className={ReCheckInStyle.dateTimeInput}>
                      <div className={ReCheckInStyle.inputError}>
                        <input
                          className={ReCheckInStyle.inputContainer}
                          type="date"
                          id="departure_date"
                          name="departure_date"
                          value={formData.departure_date}
                          onChange={handleRoomChange}
                          onBlur={(e) =>
                            isValidOnBlur("departure_date", e.target.value)
                          }
                          //Code modification by Tejasve Gupta on 14-06-2024

                          min={formData.arrival_date} // Set the min attribute dynamically
                          // required
                          //End of Code modification by Tejasve Gupta on 14-06-2024
                          // Reason - variable name changed as similar to backend
                        />
                        {departureDateError && (
                          <span className={ReCheckInStyle.error}>
                            {departureDateError}
                          </span>
                        )}
                      </div>
                      <div className={ReCheckInStyle.inputError}>
                        <input
                          className={ReCheckInStyle.inputContainer}
                          type="time"
                          id="departure_time"
                          name="departure_time"
                          value={formData.departure_time}
                          onChange={handleRoomChange}
                          onBlur={(e) =>
                            isValidOnBlur("departure_time", e.target.value)
                          }
                          // required
                        />
                        {departureTimeError && (
                          <span className={ReCheckInStyle.error}>
                            {departureTimeError}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* <div className={ReCheckInStyle.inputPair}>
                      <div className={ReCheckInStyle.starInput}>
                        <label
                          htmlFor="departure_time"
                          className={ReCheckInStyle.labelContainer}
                          style={{ width: "90%" }}
                        >
                          <span className={ReCheckInStyle.mandatoryField}>
                            *{" "}
                          </span>
                          Check-out Time
                        </label>
                        <div style={{ width: "20%" }}> : </div>
                      </div>
                    </div> */}
                  {/* </div> */}
                  {/**Code Addition by Tejasve Gupta on 05-06-2024
                   * Reason - Calculation of no. of staying days
                   */}
                  <div
                    className={ReCheckInStyle.days}
                    /**Code Modification By Tejasve Gupta on 20-07-2024
      Reason - Style Updated for responsive  */
                    style={{ display: "flex" }}
                    /**End of Code Modification By Tejasve Gupta on 20-07-2024
    Reason - Style Updated for responsive  */
                  >
                    <div
                    // style={{
                    //   // border: "1px solid red",
                    //   display: "flex",
                    //   width: "50%",
                    // }}
                    >
                      <label
                        htmlFor="number_of_days"
                        className={ReCheckInStyle.labelContainer1}
                        style={{ fontWeight: "bold" }}
                        // style={{ width: "90%" }}
                      >
                        <span className={ReCheckInStyle.optionalField}>* </span>
                        Number of Days
                        <span style={{ marginLeft: "10px" }}>:</span>
                      </label>
                      {/* <div style={{ width: "20%" }}> : </div> */}
                    </div>
                    {/**Code Modification by Tejasve Gupta on 20-06-2024
                      Reason - Spelling fixed for number of days */}
                    <span
                      style={{
                        // fontSize: "20px",
                        fontWeight: "bold",
                        backgroundColor: "#dcdcff",
                      }}
                    >
                      {/**end of Code Addition and Modification by Tejasve Gupta on 14-07-2026
                      Reason - UI Enhancements and Addition of new fields*/}
                      {numberOfDays} {numberOfDays !== 1 ? "Days" : "Day"}
                    </span>
                    {/**End of Code Modification by Tejasve Gupta on 20-06-2024
                      Reason - Spelling fixed for number of days */}
                  </div>
                  {/**End of Code Addition by Tejasve Gupta on 05-06-2024
                   * Reason - Calculation of no. of staying days
                   */}
                </div>

                {/**End of Code re-placed by Tejasve Gupta on 06-06-2024
                 * Reason - Rearranging the sequence as told by Tester for form design
                 */}
              </fieldset>
              {/**Code Addition and Modification by Tejasve Gupta on 14-07-2026
                          Reason - UI Enhancements and Addition of new fields*/}

              <div className={ReCheckInStyle.paymentForm}>
                <legend className={ReCheckInStyle.secionHeading}>
                  Rooms Details
                </legend>
                <fieldset className={ReCheckInStyle.roomDetails}>
                  <div
                    className={ReCheckInStyle.room}
                    style={{
                      display: "flex",
                      width: "60%",
                      marginLeft: "10px",
                    }}
                  >
                    <label className={ReCheckInStyle.labelContainer1}>
                      <span className={ReCheckInStyle.mandatoryField}>* </span>
                      Room Number
                    </label>
                    {/* <div style={{ width: "20%" }}> : </div> */}
                    <div className={ReCheckInStyle.inputError}>
                      {/* // Modification and addition by Om Shrivastava on 01-06-2024
                        Reason : Set the value of room numbers */}
                      {/* <select
                                className={ReCheckInStyle.inputContainer}
                                style={{ width: "50%" }}
                                id="room_number"
                                name="room_number"
                                value={formData.room_number}
                                onChange={handleRoomChange}
                                onBlur={(e) => isValidOnBlur("room_number", e.target.value)}
                                // required
                                    >
                                      <option value="">Select Room Number</option>
                                      {Object.keys(roomData).map((room_number) => (
                                        <option key={room_number} value={room_number}>
                                          {room_number}
                                        </option>
                                      ))}
                                        </select> */}

                      <select
                        className={ReCheckInStyle.inputContainer}
                        style={{ width: "162%" }}
                        id="roomNumber"
                        name="roomNumber"
                        value={formData.room_number}
                        onChange={handleRoomChange}
                        onBlur={(e) =>
                          isValidOnBlur("roomNumber", e.target.value)
                        }
                        // required
                      >
                        <option value="" style={{ color: "grey" }}>
                          Select Room Number
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
                              reservedRoomList.some(
                                (reservedRoom) =>
                                  reservedRoom.number === room.room_number
                              )
                            }
                          >
                            {room.room_number} ({room.room_type})
                          </option>
                        ))}
                      </select>
                      {/* // End of modification and addition by Om Shrivastava on 01-06-2024
                          Reason : Set the value of room numbers */}
                      {roomError && (
                        <span className={ReCheckInStyle.error}>
                          {roomError}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={ReCheckInStyle.selectedRoomsContainer}>
                    {/* <label>
                          <span className={ReCheckInStyle.optionalField}>* </span>
                          Rooms
                        </label> */}
                    {/* //Code modification by Tejasve Gupta on 14-06-2024
  					              // Reason - style changed as similar to backend */}
                    <table className={ReCheckInStyle.roomsTable}>
                      <thead>
                        <tr>
                          <th>Room Number</th>
                          <th>Room Type</th>
                          <th>Price</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedRooms.map((room) => (
                          <tr key={room.room_number}>
                            <td>{room.room_number}</td>
                            <td>{room.room_type}</td>
                            <td>{room.price}</td>
                            <td>
                              <button
                                onClick={() =>
                                  handleDeleteRoom(room.room_number)
                                }
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
                <legend className={ReCheckInStyle.secionHeading}>
                  Payment Details
                </legend>
                <fieldset className={ReCheckInStyle.paymentDetails}>
                  <div className={ReCheckInStyle.paymentContainer}>
                    {/**Code Modification By Tejasve Gupta on 20-07-2024
                  Reason - Style Updated for responsive  */}
                    <div style={{ display: "flex", gap: "5px" }}>
                      {/**End of Code Modification By Tejasve Gupta on 20-07-2024
                    Reason - Style Updated for responsive  */}
                      <label className={ReCheckInStyle.labelContainer}>
                        <span className={ReCheckInStyle.optionalField}>* </span>
                        Payment Method
                      </label>
                      {/* <div style={{ width: "20%" }}> : </div> */}
                      {/**End of Code Addition and Modification by Tejasve Gupta on 14-07-2026
                                      Reason - UI Enhancements and Addition of new fields*/}
                    </div>
                    <div
                      className={ReCheckInStyle.radioButton}
                      style={{ display: "flex", gap: "5%" }}
                    >
                      <label
                        className={ReCheckInStyle.labelContainer}
                        style={{ display: "flex", gap: "12px" }}
                      >
                        <input
                          type="radio"
                          name="payment_method"
                          value="Cash"
                          checked={formData.payment_method === "Cash"}
                          onChange={handleRoomChange}
                        />
                        <div>Cash</div>
                      </label>
                      <label
                        className={ReCheckInStyle.labelContainer}
                        style={{ display: "flex", gap: "12px" }}
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
                    </div>
                  </div>
                  <div className={ReCheckInStyle.chargesContainer}>
                    {/**Code Addition and Modification by Tejasve Gupta on 15-07-2026
                          Reason - UI Enhancements and Addition of new fields*/}
                    <div className={ReCheckInStyle.charges}>
                      <div className={ReCheckInStyle.inputPair}>
                        <div
                        // style={{ display: "flex", width: "50%" }}
                        >
                          <label className={ReCheckInStyle.labelContainer1}>
                            <span className={ReCheckInStyle.optionalField}>
                              *{" "}
                            </span>
                            Room Charges
                          </label>
                          {/* <div style={{ width: "20%" }}> : </div> */}
                        </div>
                        <div className={ReCheckInStyle.chargesAmount}>
                          <input
                            className={ReCheckInStyle.inputContainer}
                            type="text"
                            id="charges"
                            name="charges"
                            value={roomCharges}
                            readOnly
                          />
                        </div>
                      </div>
                      <div className={ReCheckInStyle.inputPair}>
                        <div
                        // style={{ display: "flex", width: "50%" }}
                        >
                          <label className={ReCheckInStyle.labelContainer1}>
                            <span className={ReCheckInStyle.optionalField}>
                              *{" "}
                            </span>
                            {/* Modification and addition by Om Shrivastava on 15-10-2024 
                    Reason : Change the name  */}
                            {/*  Charges */}
                            Extra Bed Charges
                            {/* End of modification and addition by Om Shrivastava on 15-10-2024 
                    Reason : Change the name  */}
                          </label>
                          {/* <div style={{ width: "20%" }}> : </div> */}
                        </div>
                        <div className={ReCheckInStyle.chargesAmount}>
                          <input
                            className={ReCheckInStyle.inputContainer}
                            type="number"
                            id="extraPersonCharges"
                            name="extraPersonCharges"
                            value={extraPersonCharges}
                            onChange={handleExtraChargesChange}
                          />
                        </div>
                        {/**End of Code Addition and Modification by Tejasve Gupta on 15-07-2026
                              Reason - UI Enhancements and Addition of new fields*/}
                      </div>
                    </div>
                    {/**Code Addition and Modification by Tejasve Gupta on 13-07-2026
                    Reason - UI Enhancements and Addition of new fields*/}

                    <div className={ReCheckInStyle.discount}>
                      <div className={ReCheckInStyle.inputPair}>
                        <div
                        // style={{ display: "flex", width: "50%" }}
                        >
                          <label className={ReCheckInStyle.labelContainer1}>
                            <span className={ReCheckInStyle.optionalField}>
                              *{" "}
                            </span>
                            Discount (?)
                          </label>
                          {/* <div style={{ width: "20%" }}> : </div> */}
                        </div>
                        <div className={ReCheckInStyle.chargesAmount}>
                          <input
                            className={ReCheckInStyle.inputContainer}
                            type="number"
                            id="discount_rupees"
                            name="discount_rupees"
                            value={discount_rupees}
                            onChange={handleDiscountRupeesChange}
                          />
                        </div>
                      </div>
                      <div className={ReCheckInStyle.inputPair}>
                        <div
                        // style={{ display: "flex", width: "50%" }}
                        >
                          <label className={ReCheckInStyle.labelContainer1}>
                            <span className={ReCheckInStyle.optionalField}>
                              *{" "}
                            </span>
                            Discount (%)
                          </label>
                          {/* <div style={{ width: "20%" }}> : </div> */}
                        </div>
                        <div className={ReCheckInStyle.chargesAmount}>
                          <input
                            className={ReCheckInStyle.inputContainer}
                            type="number"
                            id="discount_percentage"
                            name="discount_percentage"
                            value={discount_percentage}
                            onChange={handleDiscountPercentageChange}
                          />
                        </div>
                      </div>
                      <div className={ReCheckInStyle.inputPair}>
                        <div
                        // style={{ display: "flex", width: "50%" }}
                        >
                          <label className={ReCheckInStyle.labelContainer1}>
                            <span className={ReCheckInStyle.optionalField}>
                              *{" "}
                            </span>
                            Subtotal
                          </label>
                          {/* <div style={{ width: "20%" }}> : </div> */}
                        </div>
                        <div className={ReCheckInStyle.chargesAmount}>
                          <input
                            className={ReCheckInStyle.inputContainer}
                            type="text"
                            id="subtotal"
                            name="subtotal"
                            value={subtotal.toFixed(2)}
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
                    {/* <div className={ReCheckInStyle.inputPair}>
                        <div style={{ display: "flex", width: "50%" }}>
                          <label className={ReCheckInStyle.labelContainer1}>
                            <span className={ReCheckInStyle.optionalField}>
                              *{" "}
                            </span>
                            Subtotal
                          </label>
                          <div style={{ width: "20%" }}> : </div>
                        </div>
                        <div className={ReCheckInStyle.chargesAmount}>
                          <input
                            className={ReCheckInStyle.inputContainer}
                            type="text"
                            id="subtotal"
                            name="subtotal"
                            value={subtotal.toFixed(2)}
                            readOnly
                          />
                        </div>
                      </div> */}

                    <div className={ReCheckInStyle.gstTotal}>
                      <div className={ReCheckInStyle.inputPair}>
                        <div
                        // style={{ display: "flex", width: "50%" }}
                        >
                          <label className={ReCheckInStyle.labelContainer1}>
                            <span className={ReCheckInStyle.optionalField}>
                              *{" "}
                            </span>
                            GST Rate (%)
                          </label>
                          {/* <div style={{ width: "20%" }}> : </div> */}
                        </div>
                        <div className={ReCheckInStyle.chargesAmount}>
                          <input
                            className={ReCheckInStyle.inputContainer}
                            type="number"
                            id="gst"
                            name="gst"
                            value={gst}
                            onChange={handleGstRateChange}
                          />
                        </div>
                      </div>
                      <div className={ReCheckInStyle.inputPair}>
                        <div
                        // style={{ display: "flex", width: "50%" }}
                        >
                          <label className={ReCheckInStyle.labelContainer1}>
                            <span className={ReCheckInStyle.optionalField}>
                              *{" "}
                            </span>
                            GST Value
                          </label>
                          {/* <div style={{ width: "20%" }}> : </div> */}
                        </div>
                        <div className={ReCheckInStyle.chargesAmount}>
                          <input
                            className={ReCheckInStyle.inputContainer}
                            type="text"
                            id="gstValue"
                            name="gstValue"
                            value={gstValue.toFixed(2)}
                            readOnly
                          />
                        </div>
                      </div>
                      <div className={ReCheckInStyle.inputPair}>
                        <div
                        // style={{ display: "flex", width: "50%" }}
                        >
                          <label className={ReCheckInStyle.labelContainer1}>
                            <span className={ReCheckInStyle.optionalField}>
                              *{" "}
                            </span>
                            Grand Total
                          </label>
                          {/* <div style={{ width: "20%" }}> : </div> */}
                        </div>
                        <div className={ReCheckInStyle.chargesAmount}>
                          <input
                            className={ReCheckInStyle.inputContainer}
                            type="text"
                            id="grandTotal"
                            name="grandTotal"
                            value={grandTotal.toFixed(2)}
                            readOnly
                          />
                        </div>
                        {/**End of Code Addition and Modification by Tejasve Gupta on 13-07-2026
                              Reason - UI Enhancements and Addition of new fields*/}
                      </div>
                    </div>
                    {/**Code Addition and Modification by Tejasve Gupta on 13-07-2026
                              Reason - UI Enhancements and Addition of new fields*/}

                    <div className={ReCheckInStyle.advDue}>
                      <div className={ReCheckInStyle.inputPair}>
                        <div
                        // style={{ display: "flex", width: "50%" }}
                        >
                          <label className={ReCheckInStyle.labelContainer1}>
                            <span className={ReCheckInStyle.optionalField}>
                              *{" "}
                            </span>
                            Advance Payment
                          </label>
                          {/* <div style={{ width: "20%" }}> : </div> */}
                        </div>
                        <div className={ReCheckInStyle.chargesAmount}>
                          <input
                            className={ReCheckInStyle.inputContainer}
                            type="number"
                            id="advancePayment"
                            name="advancePayment"
                            value={advancePayment}
                            onChange={handleAdvancePaymentChange}
                          />
                        </div>
                      </div>
                      <div className={ReCheckInStyle.inputPair}>
                        <div
                        // style={{ display: "flex", width: "50%" }}
                        >
                          <label className={ReCheckInStyle.labelContainer1}>
                            <span className={ReCheckInStyle.optionalField}>
                              *{" "}
                            </span>
                            Due Amount
                          </label>
                          {/* <div style={{ width: "20%" }}> : </div> */}
                        </div>
                        <div className={ReCheckInStyle.chargesAmount}>
                          <input
                            className={ReCheckInStyle.inputContainer}
                            type="text"
                            id="dueAmount"
                            name="dueAmount"
                            value={dueAmount.toFixed(2)}
                            readOnly
                          />
                        </div>
                        {/**Code Addition and Modification by Tejasve Gupta on 13-07-2026
                      Reason - UI Enhancements and Addition of new fields*/}
                      </div>
                    </div>
                  </div>
                </fieldset>
              </div>
            </div>

            <div
              className={ReCheckInStyle.rightContainer}
              style={
                {
                  // border: "1px solid orange",
                  // display: "flex",
                }
              }
            >
              {/**Code Addition and Modification by Tejasve Gupta on 13-07-2026
                  Reason - UI Enhancements and Addition of new fields*/}
              <legend
              // style={{ marginLeft: "5%" }}
              >
                Billing Summary
              </legend>
              <fieldset className={ReCheckInStyle.billingSummary}>
                <div className={ReCheckInStyle.inOutPair}>
                  <div className={ReCheckInStyle.inPair}>
                    <label>Check-In Time</label>
                    <label>{}</label>
                  </div>
                  <div className={ReCheckInStyle.outPair}>
                    <label>Check-Out Time</label>
                    <label>{}</label>
                  </div>
                </div>
                <div className={ReCheckInStyle.amountSummary}>
                  <div className={ReCheckInStyle.amountPair}>
                    <label>Room Charges</label>
                    <label>{roomCharges}</label>
                  </div>
                  <div className={ReCheckInStyle.amountPair}>
                    <label>Total Taxes</label>
                    <label>{gstValue.toFixed(2)}</label>
                  </div>
                  <div className={ReCheckInStyle.amountPair}>
                    <label>Due Amount</label>
                    <label>{dueAmount.toFixed(2)}</label>
                  </div>
                </div>
              </fieldset>
              {/**End of Code Addition and Modification by Tejasve Gupta on 13-07-2026
                Reason - UI Enhancements and Addition of new fields*/}
              {/**Code Modification by Tejasve Gupta on 05-06-2024
               * Reason - Change in Styles
               */}

              <div
                className={ReCheckInStyle.availabilityContainer}
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
                <legend className={ReCheckInStyle.secionHeading}>
                  Check Avaiable Rooms
                </legend>
                <fieldset
                  className={ReCheckInStyle.availability}
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
                  {/* <legend className={ReCheckInStyle.secionHeading}>
                    Check Avaiable Rooms
                  </legend> */}
                  {/**Code Modification by Tejasve Gupta on 05-06-2024
                   * Reason - Change in Styles
                   */}
                  <div className={ReCheckInStyle.Status}>
                    <div>
                      <span
                        className={
                          ReCheckInStyle.circle +
                          " " +
                          ReCheckInStyle.circle_red
                        }
                      ></span>{" "}
                      Reserved
                    </div>
                    <div>
                      <span
                        className={
                          ReCheckInStyle.circle +
                          " " +
                          ReCheckInStyle.circle_green
                        }
                      ></span>{" "}
                      Available
                    </div>
                    <div>
                      <span
                        className={
                          ReCheckInStyle.circle +
                          " " +
                          ReCheckInStyle.circle_yellow
                        }
                      ></span>{" "}
                      Vacant
                    </div>
                  </div>
                  {/* <h1>Room Status</h1> */}
                  {/**End of Code Modification by Tejasve Gupta on 05-06-2024
                   * Reason - Change in Styles
                   */}
                  {/**Code Addition and Modification by Tejasve Gupta on 12-07-2026
                  Reason - UI Enhancements and Addition of new fields*/}
                  <div className={ReCheckInStyle.roomNumberTypeButtons}>
                    <RoomList rooms={roomData} />
                  </div>
                </fieldset>

                {/**End of Code Modification by Tejasve Gupta on 06-06-2024
                 * reason - UI changes as guided by Ashish sir
                 */}
              </div>
              <div
                className={ReCheckInStyle.buttonContainer}
                // style={{ display: "flex", justifyContent: "center" }}
              >
                <button type="submit" className={ReCheckInStyle.submitButton}>
                  Submit
                </button>
                {/**End of Code Addition and Modification by Tejasve Gupta on 12-07-2026
                    Reason - UI Enhancements and Addition of new fields*/}
              </div>
            </div>
            {/* </div> */}
          </div>
        </form>
        <Modal
          className={ReCheckInStyle.modal}
          title="Check-in Details"
          visible={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
        >
          <div className={ReCheckInStyle.modalFields}>
            <div className={ReCheckInStyle.modalInputPair}>
              <div className={ReCheckInStyle.modalLabel}>
                <label>Name</label>
              </div>
              <span>:</span>{" "}
              <div className={ReCheckInStyle.modalInput}>{formData.name}</div>
            </div>
            <div className={ReCheckInStyle.modalInputPair}>
              <div className={ReCheckInStyle.modalLabel}>
                <label>Last Name</label>
              </div>
              <span>:</span>{" "}
              <div className={ReCheckInStyle.modalInput}>
                {formData.last_name}
              </div>
            </div>
            <div className={ReCheckInStyle.modalInputPair}>
              <div className={ReCheckInStyle.modalLabel}>
                <label>Address</label>
              </div>
              <span>:</span>{" "}
              <div className={ReCheckInStyle.modalInput}>
                {formData.address}
              </div>
            </div>
            <div className={ReCheckInStyle.modalInputPair}>
              <div className={ReCheckInStyle.modalLabel}>
                <label>Phone</label>
              </div>
              <span>:</span>{" "}
              <div className={ReCheckInStyle.modalInput}>{formData.phone}</div>
            </div>
            <div className={ReCheckInStyle.modalInputPair}>
              <div className={ReCheckInStyle.modalLabel}>
                <label>ID Card Type</label>
              </div>
              <span>:</span>{" "}
              <div className={ReCheckInStyle.modalInput}>
                {formData.id_card_type}
              </div>
            </div>
            <div className={ReCheckInStyle.modalInputPair}>
              <div className={ReCheckInStyle.modalLabel}>
                <label>ID Card No</label>
              </div>
              <span>:</span>{" "}
              <div className={ReCheckInStyle.modalInput}>
                {formData.id_card_no}
              </div>
            </div>
            <div className={ReCheckInStyle.modalInputPair}>
              <div className={ReCheckInStyle.modalLabel}>
                <label>ID Card Photo</label>
              </div>
              <span>:</span>{" "}
              <div className={ReCheckInStyle.modalInput}>
                {formData.id_card_photo?.name}
              </div>
            </div>
            <div className={ReCheckInStyle.modalInputPair}>
              <div className={ReCheckInStyle.modalLabel}>
                <label>Room Number</label>
              </div>
              <span>:</span>{" "}
              <div className={ReCheckInStyle.modalInput}>
                {formData.room_number}
              </div>
            </div>
            <div className={ReCheckInStyle.modalInputPair}>
              <div className={ReCheckInStyle.modalLabel}>
                <label>Room Type</label>
              </div>
              <span>:</span>{" "}
              <div className={ReCheckInStyle.modalInput}>
                {formData.room_type}
              </div>
            </div>
            <div className={ReCheckInStyle.modalInputPair}>
              <div className={ReCheckInStyle.modalLabel}>
                <label>Total Charges</label>
              </div>
              <span>:</span>{" "}
              <div className={ReCheckInStyle.modalInput}>
                {formData.totalCharges}
              </div>
            </div>
            <div className={ReCheckInStyle.modalInputPair}>
              <div className={ReCheckInStyle.modalLabel}>
                <label>Check-In Date</label>
              </div>
              <span>:</span>{" "}
              <div className={ReCheckInStyle.modalInput}>
                {formData.arrival_date}
              </div>
            </div>
            <div className={ReCheckInStyle.modalInputPair}>
              <div className={ReCheckInStyle.modalLabel}>
                <label>Check-In Time</label>
              </div>
              <span>:</span>{" "}
              <div className={ReCheckInStyle.modalInput}>
                {formData.arrival_time}
              </div>
            </div>
            <div className={ReCheckInStyle.modalInputPair}>
              <div className={ReCheckInStyle.modalLabel}>
                <label>Check-Out Date</label>
              </div>
              <span>:</span>{" "}
              <div className={ReCheckInStyle.modalInput}>
                {formData.departure_date}
              </div>
            </div>
            <div className={ReCheckInStyle.modalInputPair}>
              <div className={ReCheckInStyle.modalLabel}>
                <label>Check-Out Time</label>
              </div>
              <span>:</span>{" "}
              <div className={ReCheckInStyle.modalInput}>
                {formData.departure_time}
              </div>
            </div>
            <div className={ReCheckInStyle.modalInputPair}>
              <div className={ReCheckInStyle.modalLabel}>
                <label>Payment Method</label>
              </div>
              <span>:</span>{" "}
              <div className={ReCheckInStyle.modalInput}>
                {formData.payment_method}
              </div>
            </div>
            <div className={ReCheckInStyle.modalInputPair}>
              <div className={ReCheckInStyle.modalLabel}>
                <label>Number of Persons</label>
              </div>
              <span>:</span>{" "}
              <div className={ReCheckInStyle.modalInput}>
                {formData.number_of_persons}
              </div>
            </div>
            <div className={ReCheckInStyle.modalInputPair}>
              <div className={ReCheckInStyle.modalLabel}>
                <label>Number of Children</label>
              </div>
              <span>:</span>{" "}
              <div className={ReCheckInStyle.modalInput}>
                {formData.number_of_children}
              </div>
            </div>
            <div className={ReCheckInStyle.modalInputPair}>
              <div className={ReCheckInStyle.modalLabel}>
                <label>Number of Adults</label>
              </div>
              <span>:</span>{" "}
              <div className={ReCheckInStyle.modalInput}>
                {formData.number_of_adults}
              </div>
            </div>
          </div>
        </Modal>
        {/* End of Code modification by Tejasve Gupta on 26-06-2024 // Reason -
        Change in CSS style*/}
      </div>
    </div>
  );
};

export default ReCheckIn;
