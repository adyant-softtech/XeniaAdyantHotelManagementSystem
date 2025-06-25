import React, { useState, useEffect, useRef } from 'react';

import notificationObject from "../../components/Widgets/Notification/Notification";
import styles from './GuestDetails.module.css';
import { FaTrashAlt } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import {
  postCheckinDetailsApi,
  getSettingsApi,
  getPersonalDetailsApi,
} from "../../Api/services";
import { useContext } from 'react';
import { GlobalContext } from '../../context/Context';
import {
  checkIsEmpty,
  checkIfSmallerThanMinLength,
  checkIfGreaterThanMaxLength,
  checkIsNotADigit,
} from "../../utils/validations";
const GuestDetails = () => {
    const {
    tenant, guests
  } = useContext(GlobalContext);
  const [firstNameError, setFirstNameError] = useState('');
const [lastNameError, setLastNameError] = useState('');
const [contactNumberError, setContactNumberError] = useState('');
const [arrivalDateError, setArrivalDateError] = useState('');
const [arrivalTimeError, setArrivalTimeError] = useState('');
const [idTypeError, setIdTypeError] = useState('');
const [idNumberError, setIdNumberError] = useState('');
const [roomError, setRoomError] = useState('');
const [genderError, setGenderError] = useState('');
const [primaryIdImageError, setPrimaryIdImageError] = useState('');
const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
const [isModalVisible, setIsModalVisible] = useState(false);
const [isModalOpen, setIsModalOpen] = useState(false);

const [paymentReceiptData, setPaymentReceiptData] = useState(null);
const [allRoomBookingDetails, setAllRoomBookingDetails] = useState([]);
const [errors, setErrors] = useState({});
const errorRef = useRef(null); 

const currentDate = new Date();

// Format: YYYY-MM-DD
const formattedDate = currentDate.toISOString().split("T")[0];

// Format: HH:MM (24-hour)
const formattedTime = currentDate.toTimeString().split(" ")[0].slice(0, 5);

  const [formData, setFormData] = useState({
  salutation: "Mr",
  payment_method: "Cash",
  transaction_id: "",
  payment_proof: null,
  name: "",
  last_name: "",
  address: "",
  dob: "",
  country: "India",
  state: "Chhattisgarh",
  city: "Raipur",
  country_id: "IN",
  state_id: "CT",
  city_id: "Raipur",
  zip: "",
  phone: "",
  email: "",
  id_card_type: "",
  id_card_no: "",
  id_card_photo: null,
  room_number: "",
  room_type: "",
  price: "",
  arrival_date: formattedDate,
  arrival_time: formattedTime,
  number_of_persons: 1,
  number_of_children: 0,
  number_of_adults: 0,
  roomCharges: 0,
  subTotal: 0,
  taxable_amount: 0,
  total: 0,
  grandTotal: 0,
  gstValue: 0,
  dueAmount: 0,
  purpose_of_visit: "",
  arrived_from: "",
  destination: ""
});


  const [guestDetails, setguestDetails] = useState([]);
  const location = useLocation();
  
  const [selectedRooms, setSelectedRooms] = useState([]);
  useEffect(() => {
    const initialRooms = location.state?.selectedRooms || [];
    setSelectedRooms(initialRooms);
  }, [location.state]);
  const [roomCharges, setRoomCharges] = useState(0);
  const [bookingType, setBookingType] = useState("Current");
  const [advancePayment, setAdvancePayment] = useState(0);
  const [extraPersonCharges, setExtraPersonCharges] = useState(0);
  const [discountIn, setDiscountIn] = useState(""); 
  const [discount_percentage, setDiscountPercentage] = useState(0);
  const [discount_rupees, setDiscountRupees] = useState(0);
  const [gst, setGst] = useState(0); 
  



  const gstPercentage = async () => {
    try {
      const access = localStorage.getItem("access");
      if (!access) {
        throw new Error("Access token is missing");
      }

      const data = await getSettingsApi(access, tenant);
      if (data && data.gst) {
        setGst(data.gst);
      } else {
        console.error("GST value is missing in the response");
      }
    } catch (error) {
      console.error("Error fetching GST:", error);
    }
  };
  useEffect(() => {
    gstPercentage();
  }, [tenant]);


  useEffect(() => {
    const totalRoomCharges = selectedRooms.reduce(
      (total, room) => total + parseFloat(room.room_price || 0),
      0
    );
    setRoomCharges(totalRoomCharges);
  }, [selectedRooms]);


  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      roomCharges: roomCharges
    }));
  }, [roomCharges]);


  const calculateAmount = () => {
    const subTotal = Number(formData.roomCharges) || 0;
    const extraCharges = Number(extraPersonCharges) || 0;
    const discount = Number(discount_rupees) || 0;
    const gstRate = Number(gst) || 0;
    const advance = Number(advancePayment) || 0;

    const taxableAmount = subTotal + extraCharges - discount;
    const gstValue = (gstRate * taxableAmount) / 100;
    const total = taxableAmount + gstValue;
    const grandTotal = Math.ceil(total - advance);
    var dueAmount = Math.ceil(grandTotal - parseFloat(advancePayment || 0));

    setFormData((prev) => ({
      ...prev,
      subTotal,
      taxable_amount: taxableAmount,
      gstValue,
      total,
      grandTotal,
      dueAmount,
      number_of_persons: guests.adults + guests.children,
      number_of_children: guests.children,
      number_of_adults: guests.adults,
    }));
  };

  useEffect(() => {
    calculateAmount();
  }, [roomCharges, gst]);


  

  const handleGstRateChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setGst(value);
  };



  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'file' ? files[0] : value,
    });
  };

  const handleAddGuest = () => {
    setguestDetails([
      ...guestDetails,
      {
        id: Date.now(),
        room: '',
        guest_name: '',
        guest_last_name: '',
        guest_id_card_type: '',
        guest_id_card_no: '',
        image: null,
        person_type: 'Adult',
      },
    ]);
  };

  const handleGuestChange = (index, field, value) => {
    const updatedRows = [...guestDetails];
    updatedRows[index][field] = value;
    setguestDetails(updatedRows);
  };

  const handleRemoveGuest = (id) => {
    setguestDetails(guestDetails.filter((row) => row.id !== id));
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

  const postCheckinForm = async () => {
    // e.preventDefault(); 
    const d = new FormData();

    d.append("selectedRooms", JSON.stringify(selectedRooms));
    d.append("salutation", formData.salutation);

    d.append("transaction_id", formData.transaction_id);
    d.append("payment_proof", formData.payment_proof);
    d.append("name", formData.name);
    if (formData.personal_detail_object) {
      d.append("personal_detail_object", formData.personal_detail_object);
    }
    d.append("last_name", formData.last_name);
    d.append("email", formData.email);
    d.append("address", formData.address);
    d.append("country", formData.country);
    d.append("state", formData.state);
    d.append("city", formData.city);
    d.append("country_id", formData.country_id);
    d.append("state_id", formData.state_id);
    d.append("city_id", formData.city_id);
    d.append("zip", formData?.zip?.length > 0 ? formData.zip : 0);

    d.append(
      "dob",
      formData?.dob && formData.dob.length > 0 ? formData.dob : "2024-01-01"
    );
    d.append("gender", formData.gender);
    d.append("phone", formData.phone);
    d.append("id_card_type", formData.id_card_type);
    d.append("id_card_no", formData.id_card_no);
    d.append("id_card_photo", formData.id_card_photo);
    d.append("arrival_date", formData.arrival_date);
    d.append("arrival_time", formData.arrival_time);
    
    d.append("payment_method", formData.payment_method);
    d.append("number_of_persons", formData.number_of_persons);
    d.append("number_of_children", formData.number_of_children);
    d.append("number_of_adults", formData.number_of_adults);
    d.append("extraPersonCharges", extraPersonCharges);
    d.append("discount_in", discountIn);
    d.append("discount_rupees", discount_rupees);
    d.append("discount_percentage", discount_percentage);
    d.append("gst", gst);
    d.append("advancePayment", advancePayment);
    d.append("guest_details", JSON.stringify(guestDetails));
   

    d.append("room_charges", formData.roomCharges);
    d.append("sub_total", formData.subTotal);
    d.append("taxable_amount", formData.taxable_amount);
    d.append("total", formData.total);
    d.append("grand_total", formData.grandTotal);
    d.append("gst_value", formData.gstValue);
    d.append("due", formData.dueAmount);

    d.append("bookingType", bookingType);
   
    d.append("purpose_of_visit", formData.purpose_of_visit);
    d.append("arrived_from", formData.arrived_from);
    d.append("destination", formData.destination);

    
      try {
        setIsSubmitDisabled(true);
        
        const access = localStorage.getItem("access"); // Get access token from localStorage
        const response = await postCheckinDetailsApi(access, d, tenant);


        setPaymentReceiptData(response.payment_receipt_data);
        setAllRoomBookingDetails(response.all_room_booking_details);

        notificationObject.success(response.success);
        

        setIsModalVisible(true);
        // if (advancePayment === 0) {
        //   clearForm();
        // }

      } catch (error) {
        console.error("Error submitting form data: ", error);
      }
      finally{
        clearForm();
        setIsSubmitDisabled(false)
      }
    
  };
  const handleSubmit = (e) => {
    e.preventDefault();
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
    if (errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    postCheckinForm();
    setIsModalOpen(true);
    // clearForm();
  };

  const clearForm = () => {
    setFormData((prevData) => ({
      ...prevData,
      salutation: "",
      name: "",
      last_name: "",
      email: "",
      address: "",
      country: "",
      state: "",
      city: "",
      zip: "",
      dob: "",
      gender: "",
      phone: "",
      id_card_type: "",
      id_card_no: "",
      id_card_photo: null,
      id_card_photo_src: null,
      room_number: "",
      room_type: "",
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
      country_id: "IN",
      state_id: "CT",
      city_id: "Raipur",
      personal_detail_object: "",
      purpose_of_visit: "",
      arrived_from: "",
      destination: "",
    }));
    setSelectedRooms([]);
    // setTotalCharges(0);
    // setNumberOfDays(0);
    setContactNumberError("");
    setFirstNameError("");
    setLastNameError("");
    setArrivalDateError("");
    setguestDetails([]);
    setArrivalTimeError("");
    setDiscountIn("");
    // setExtraPersonCharges("");
    setRoomError("");
    setIdTypeError("");
    setIdNumberError("");
    // setShowManualInput(false);
    setAdvancePayment(0);
    setGenderError("");
    setExtraPersonCharges(0);
    var id_photo = document.getElementById("id_card_photo");
    if (id_photo) id_photo.value = null;
    
    // setRefundableAmount("");
    // setIsRefundable("");
    setBookingType("Current");
    

    // setSelectedCountry({
    //   value: "IN",
    //   label: "India",
    // });
    // setSelectedState({
    //   value: "CT",
    //   label: "Chhattisgarh",
    // });
    // setSelectedCity({
    //   value: "Raipur",
    //   label: "Raipur",
    // });

    // setPersonalDetailId("");
    
    setPrimaryIdImageError("");
   
    // setIsOtherCitySelected(false);
  };
  return (
    <div className={styles.dashboardContainer}>
      <form className={styles.formContainer} onSubmit={handleSubmit}>
        {selectedRooms.length > 0 && (
          <div className={styles.selectedRoomsTable}>
            <h4>Selected Rooms</h4>
            <table>
              <thead>
                <tr>
                  <th>Room Number</th>
                  <th>Room Type</th>
                  <th>Price (₹)</th>
                  <th>Variety</th>
                </tr>
              </thead>
              <tbody>
                {selectedRooms.map((room) => (
                  <tr key={room.id}>
                    <td>{room.room_number}</td>
                    <td>{room.room_type}</td>
                    <td>{room.room_price}</td>
                    <td>{room.variety}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <h3>GUEST DETAILS</h3>
        <div className={styles.row}>
          <select name="salutation" value={formData.salutation} onChange={handleChange}>
            <option>Mr</option>
            <option>Mrs</option>
            <option>Ms</option>
          </select>
          <input name="name" value={formData.name} placeholder="First Name *" required onChange={handleChange} />
          <input name="last_name" value={formData.last_name} placeholder="Last Name *" required onChange={handleChange} />
          <select name="gender" value={formData.gender} required onChange={handleChange}>
            <option value="">Select Gender *</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>

        <div className={styles.row}>
          <input name="phone" value={formData.phone} placeholder="Phone Number *" required onChange={handleChange} />
          <input type="date"  value={formData.dob} name="dob" onChange={handleChange} />
          <input name="email" value={formData.email} placeholder="Email" onChange={handleChange} />
        </div>

        <div className={styles.row}>
          <select name="id_card_type" value={formData.id_card_type} required onChange={handleChange}>
            <option value="">Select ID Type *</option>
            <option>Aadhar</option>
            <option>Passport</option>
            <option>Voter ID</option>
          </select>
          <input name="id_card_no" value={formData.id_card_no} placeholder="ID Number *" required onChange={handleChange} />
          <input type="file" name="id_card_photo" onChange={handleChange} />
        </div>

        <div className={styles.row}>
          <input name="country" value="India" readOnly />
          <input name="state" value="Chhattisgarh" readOnly />
          <input name="city" value="Raipur" readOnly />
        </div>

        <div className={styles.row}>
          <input name="address" value={formData.address} placeholder="Address" onChange={handleChange} />
          <input name="zip" value={formData.zip} placeholder="Pin Code" onChange={handleChange} />
        </div>

        <button type="button" className={styles.addBtn} onClick={handleAddGuest}>Add More Guests</button>

        {guestDetails.length > 0 && (
          <div className={styles.guestTable}>
            <div className={styles.guestRowHeader}>
              <div>Select Room</div>
              <div>*First Name</div>
              <div>*Last Name</div>
              <div>ID Type</div>
              <div>ID Number</div>
              <div>Upload Image</div>
              <div>Adult / Child</div>
              <div>Remove</div>
            </div>

            {guestDetails.map((guest, index) => (
              <div className={styles.guestRow} key={guest.id}>
                <select
                  value={guest.room}
                  onChange={(e) => handleGuestChange(index, 'room', e.target.value)}
                >
                  <option value="">Select Room</option>
                  {selectedRooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.room_number} - {room.room_type}
                    </option>
                  ))}
                </select>



                <input
                  type="text"
                  required
                  value={guest.guest_name}
                  onChange={(e) => handleGuestChange(index, 'guest_name', e.target.value)}
                />
                <input
                  type="text"
                  required
                  value={guest.guest_last_name}
                  onChange={(e) => handleGuestChange(index, 'guest_last_name', e.target.value)}
                />
                <select
                  value={guest.guest_id_card_type}
                  onChange={(e) => handleGuestChange(index, 'guest_id_card_type', e.target.value)}
                >
                  <option value="">Select</option>
                  <option>Aadhar</option>
                  <option>Passport</option>
                </select>
                <input
                  type="text"
                  value={guest.guest_id_card_no}
                  onChange={(e) => handleGuestChange(index, 'guest_id_card_no', e.target.value)}
                />
                <input
                  type="file"
                  onChange={(e) => handleGuestChange(index, 'image', e.target.files[0])}
                />
                <select
                  value={guest.person_type}
                  onChange={(e) => handleGuestChange(index, 'person_type', e.target.value)}
                >
                  <option>Adult</option>
                  <option>Child</option>
                </select>

                <button
                  type="button"
                  className={styles.deleteButton}
                  onClick={() => handleRemoveGuest(guest.id)}
                >
                  <FaTrashAlt />
                </button>
              </div>
            ))}
          </div>
        )}

        <legend
          style={{
          paddingTop: "5px",
          textTransform: "uppercase",
          fontSize: "var(--page-content-font-size)",
          color: "black",
          }}
          className={styles.secionHeading}
        >
          Payment Details
        </legend>
        <fieldset className={styles.paymentDetails}>
          <div className={styles.chargesContainer}>
            <div className={styles.charges}>
              <div className={styles.inputPair}>
                <div>
                  <label className={styles.labelContainer}>
                    <span className={styles.optionalField}>
                      *{" "}
                    </span>
                    Room Charges
                  </label>
                </div>
                <div className={styles.chargesAmount}>
                  <input
                    style={{width: "100%"}}
                    className={`${styles.inputContainer} ${styles.disabledField}`}
                    disabled={true}
                    type="text"
                    id="charges"
                    name="charges"
                    value={roomCharges}
                    readOnly
                  />
                </div>
              </div>
              
              <div className={styles.inputPair}>
                <div>
                  <label className={styles.labelContainer}>
                    <span className={styles.optionalField}>
                      *{" "}
                    </span>
                    Subtotal
                  </label>
                </div>
                <div className={styles.chargesAmount}>
                  <input
                    style={{width: "100%"}}
                    className={`${styles.inputContainer} ${styles.disabledField}`}
                    disabled={true}
                    type="text"
                    id="subtotal"
                    name="subtotal"
                    value={formData.subTotal?.toFixed(2)}
                    readOnly
                  />
                </div>
              </div>
            </div>
            
            <div className={styles.discount}>
              <div className={styles.inputPair}>
                <div>
                  <label className={styles.labelContainer}>
                    <span className={styles.optionalField}>
                      *{" "}
                    </span>
                    Taxable
                  </label>
                </div>
                <div className={styles.chargesAmount}>
                  <input
                    className={`${styles.inputContainer} ${styles.disabledField}`}
                    disabled={true}
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

              <div className={styles.inputPair}>
                <div>
                  <label className={styles.labelContainer}>
                    <span className={styles.optionalField}>
                      *{" "}
                    </span>
                    GST Rate (%)
                  </label>
                </div>
                <div className={styles.chargesAmount}>
                  <input
                    style={{width: "100%"}}
                    className={`${styles.inputContainer} ${styles.disabledField}`}
                    disabled={true}
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
              <div className={styles.inputPair}>
                <div>
                  <label className={styles.labelContainer}>
                    <span className={styles.optionalField}>
                      *{" "}
                    </span>
                    GST Value
                  </label>
                </div>
                <div className={styles.chargesAmount}>
                  <input
                    style={{width: "100%"}}
                    className={`${styles.inputContainer} ${styles.disabledField}`}
                    disabled={true}
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
            <div className={styles.gstTotal}></div>
            <div className={styles.advDue}>
              
              <div className={styles.inputPair}>
                <div
                >
                  <label className={styles.labelContainer}>
                    <span className={styles.optionalField}>
                      *{" "}
                    </span>
                    Total payable amount
                  </label>
                  {/* <div style={{ width: "20%" }}> : </div> */}
                </div>
                <div className={styles.chargesAmount}>
                  <input
                    /**
                      * Modified by - Ashish Dewangan on 15-09-2024
                      * Reason - To make input field look like disabled
                      */
                    // className={styles.inputContainer}
                    style={{width: "100%"}}
                    className={`${styles.inputContainer} ${styles.disabledField}`}
                    disabled={true}
                    type="text"
                    id="dueAmount"
                    name="dueAmount"
                    value={formData.dueAmount?.toFixed(2)}
                    readOnly
                  />
                </div>
              </div>
              <div className={styles.inputPair}>
                <div
                >
                  <label className={styles.labelContainer}>
                    <span className={styles.optionalField}>
                      *{" "}
                    </span>
                    Grand Total
                  </label>
                </div>
                <div className={styles.chargesAmount}>
                  <input
                    style={{width: "100%"}}
                    className={`${styles.inputContainer} ${styles.disabledField}`}
                    disabled={true}
                    type="text"
                    id="grandTotal"
                    name="grandTotal"
                    value={formData.grandTotal?.toFixed(2)}
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>
        </fieldset>


        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default GuestDetails;
