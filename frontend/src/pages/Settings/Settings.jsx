// Creation by Tejasve Gupta on 24-07-2024

import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { postSettings, getSettingsApi, postHotelApi, getAmenityData, getAmenity } from "../../Api/services";
//  Code Addition by Tejasve Gupta on 25-07-2024
//   Reason - Addition of validation
import settingStyle from "./Settings.module.css";
import {
  checkIsEmpty,
  checkIfGreaterThanMaxLength,
  checkIfSmallerThanMinLength,
  checkIsEmailInvalid,
} from "../../utils/validations";
// End of Code Addition by Tejasve Gupta on 25-07-2024
//   Reason - Addition of validation
import notificationObject from "../../components/Widgets/Notification/Notification";
import { baseURL } from "../../Api/config";
import { FiArrowLeft } from "react-icons/fi";
import { GlobalContext } from "../../context/Context";



const SettingsForm = () => {
  const { tenant } = useContext(GlobalContext);
  const [formData, setFormData] = useState({
    id: "",
    terms_and_conditions: "",
    hotel_name: "",
    hotel_address: "",
    logo: null,
    standard_checkin_time: "",
    standard_checkout_time: "",
    /**Code Commented by Tejasve Gupta on 22-08-2024
     * Reason - To remove vacant
     */
    vacant_info_before_hour: 0,
    /**End of Code Commented by Tejasve Gupta on 22-08-2024
     * Reason - To remove vacant
     */
    gst: 0,
    /**
     * Added by - Ashish Dewangan on 18-09-2024
     * Reason - To store data for below metioned fields
     */
    contact_number: "",
    email: "",
    gstin: "",
    tin: "",
    /**
     * End of addition by - Ashish Dewangan on 18-09-2024
     * Reason - To store data for below metioned fields
     */
    
  });
  //  Code Addition by Tejasve Gupta on 25-07-2024
  //   Reason - Addition of validation
  const [errors, setErrors] = useState({});
  // End of Code Addition by Tejasve Gupta on 25-07-2024
  //   Reason - Addition of validation

  const [logo, setLogo] = useState();

  const navigate = useNavigate();

  {
    /* Addition by Om Shrivastava on 03-01-2025
      Reason : Add back icon  */
  }
  const [isPopupVisible, setIsPopupVisible] = useState(false);
const [isAmenityModalOpen, setIsAmenityModalOpen] = useState(false);
const [amenityName, setAmenityName] = useState("");
const [amenitiesList, setAmenitiesList] = useState([]);
const [amenityData, setAmenityData] = useState('');
const [selectedAmenities, setSelectedAmenities] = useState([]);
const [selectedAmenity, setSelectedAmenity] = useState([]);
const [hotelId, setHotelId] = useState('');

  useEffect(() =>{
      getAmenityDetails();
  },[]);
  const getAmenityDetails = async () => {
      
      try {
          const response = await getAmenityData();
          setAmenityData(response);
      } catch (error) {
          console.error("Error fetching amenities:", error);
          
      } 
  };

  useEffect(() =>{
      getAmenities();
  },[]);
  const getAmenities = async () => {
      
      try {
          const access = localStorage.getItem("access");
          const response = await getAmenity(access, tenant);
          setAmenitiesList(response);
      } catch (error) {
          console.error("Error fetching amenities:", error);
          
      } 
  };
  const handleCheckboxChange = (id) => {
    setSelectedAmenity(prev => 
      prev.includes(id) 
      ? prev.filter(item => item !== id) 
      : [...prev, id]
    );
  };

  const openAmenityModal = () => setIsAmenityModalOpen(true);
  const closeAmenityModal = () => {
    handleAmenitySubmit();
    setAmenityName("");
    setIsAmenityModalOpen(false);
  };

  const handleAmenitySubmit = async () => {
    // e.preventDefault();

    console.log("Amenity Name Submitted:", amenityName);

    const payload = {
      amenity_ids: selectedAmenity,
      hotel : formData.id,
    };

    try {
      const access = localStorage.getItem("access");
      const response = await postHotelApi(access, payload ,tenant);
      console.log("API Response:", response);
      console.log("Raw API Response:", response);

      // Handle success response as needed
    } catch (error) {
      console.error("API Error:", error);
      // Handle error state here
    }

    setIsAmenityModalOpen(false);
    setAmenityName("");
    setSelectedAmenity("");
    getAmenities();
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

  const handleClick = async (e) => {
  e.preventDefault();
  handleAmenitySubmit();
  handleSubmit(e);
};
  useEffect(() => {
    getSettingDetails();
  }, []);

  const getSettingDetails = async () => {
    try {
      const access = localStorage.getItem("access");
      const data = await getSettingsApi(access, tenant);
      data.id && setFormData(data); // Set formData directly with the retrieved settings data
      /**
       * Added by - Ashish Dewangan on 02-09-2024
       * Reason - To set logo
       */
      setLogo(data?.logo);
      setFormData((prevFormData) => ({
        ...prevFormData,
        logo: null,
      }));
      /**
       * End of addition by - Ashish Dewangan on 02-09-2024
       * Reason - To set logo
       */
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "logo") {
      setFormData({ ...formData, [name]: files[0] });
      /**
       * Added by - Ashish Dewangan on 02-09-2024
       * Reason - To show selected image on UI
       */
      handleLogoChange(files[0]);
      /**
       * End of addition by - Ashish Dewangan on 02-09-2024
       * Reason - To show selected image on UI
       */
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  /**
   * Added by - Ashish Dewangan on 02-09-2024
   * Reason - To show selected image on UI
   */
  const handleLogoChange = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const imgElement = document.createElement("img");
        imgElement.src = e.target.result;
        imgElement.style.width = "100%"; // Adjust image display size as needed
        imgElement.style.height = "150px";

        const previewDiv = document.getElementById("imagePreview");
        previewDiv.innerHTML = ""; // Clear previous content
        previewDiv.appendChild(imgElement);
      };
      reader.readAsDataURL(file);
    }
  };
  /**
   * End of addition by - Ashish Dewangan on 02-09-2024
   * Reason - To show selected image on UI
   */
  //  Code Addition by Tejasve Gupta on 25-07-2024
  //   Reason - Addition of validation
  const isValidOnBlur = (name, value) => {
    const validationErrors = {};

    switch (name) {
      // case "terms_and_conditions":
      //   if (checkIsEmpty(value)) {
      //     validationErrors[name] = "Terms and conditions cannot be empty.";
      //   }
      //   break;
      case "hotel_name":
        if (checkIsEmpty(value)) {
          validationErrors[name] = "Hotel name cannot be empty.";
        } else if (checkIfGreaterThanMaxLength(value, 100)) {
          validationErrors[name] = "Hotel name cannot exceed 100 characters.";
        }

        break;
      
      case "contact_number":
        if (!checkIsEmpty(value)) {
          if (checkIfSmallerThanMinLength(value, 10)) {
            validationErrors[name] = "Contact number must be 10 digits long.";
          }
        }
        break;

      case "email":
        if (!checkIsEmpty(value)) {
          if (checkIsEmailInvalid(value)) {
            validationErrors[name] = "Email format is invalid.";
          }
        }
        break;
      
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      ...validationErrors,
    }));
  };

  const isValidOnSubmit = () => {
    const validationErrors = {};

    if (checkIsEmpty(formData.hotel_name)) {
      validationErrors.hotel_name = "Hotel name cannot be empty.";
    } else if (checkIfGreaterThanMaxLength(formData.hotel_name, 100)) {
      validationErrors.hotel_name = "Hotel name cannot exceed 100 characters.";
    }

    if (!checkIsEmpty(formData.contact_number)) {
      if (checkIfSmallerThanMinLength(formData.contact_number, 10)) {
        validationErrors.contact_number =
          "Contact number must be 10 digits long.";
      }
    }

    if (!checkIsEmpty(formData.email)) {
      if (checkIsEmailInvalid(formData.email)) {
        validationErrors.email = "Email format is invalid.";
      }
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    isValidOnBlur(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidOnSubmit()) {
      return;
    }

    const access = localStorage.getItem("access");

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null) {
        data.append(key, formData[key]);
      }
    });

    try {
      const response = await postSettings(access, formData, tenant);
      console.log("Settings saved successfully:", response);
      
      notificationObject.success(response.success);
      
      window.location.reload();
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };
  
  const onlyAllowNumberOnInput = (e) => {
    // e.target.value= e.target.value.replace(/[^0-9]/g, '').replace(/(\..*?)\..*/g, '$1').replace(/^0[^.]/, '0');
    e.target.value = e.target.value
      .replace(/[^0-9]/g, "")
      .replace(/(\..*?)\..*/g, "$1");
  };
  
  return (
    // Code Addition by Tejasve Gupta on 26-07-2024
    //  Reason - Adjustment of style by Adding classname
    <div className={settingStyle.parentContainer}>
      <div className={settingStyle.header}>
        {/* Modification and addition by Om Shrivastava on 03-01-2025
      Reason : Add back icon  */}
        <FiArrowLeft className="backIcon" onClick={handleBackClick} />
        Setting Details
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
      <div className={settingStyle.pageContainer}>
        <fieldset className={settingStyle.expForm}>
          <legend className={settingStyle.expDetailsTitle}>
            Setting &nbsp;
          </legend>

          <form onSubmit={handleClick}>
            <div className={settingStyle.form}>
              <div className={settingStyle.subContainer1}>
                <div className={settingStyle.inputPair}>
                  <label className={settingStyle.labelContainer}>
                    <span className={settingStyle.mandatoryField}>* </span>Hotel
                    Name
                  </label>
                  <div className={settingStyle.colonContainer}>:</div>

                  <div className={settingStyle.inputError}>
                    <input
                      type="text"
                      name="hotel_name"
                      value={formData.hotel_name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <div className={settingStyle.error}>
                      {errors.hotel_name && (
                        <span className={settingStyle.error}>
                          {errors.hotel_name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className={settingStyle.inputPair}>
                  <label className={settingStyle.labelContainer}>
                    {/* <span className={settingStyle.mandatoryField}>* </span>Hotel */}
                    &nbsp;&nbsp; Hotel Address
                  </label>
                  <div className={settingStyle.colonContainer}>:</div>

                  <div className={settingStyle.inputError}>
                    <input
                      type="text"
                      name="hotel_address"
                      value={formData.hotel_address}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <div className={settingStyle.error}>
                      {errors.hotel_address && (
                        <span className={settingStyle.error}>
                          {errors.hotel_address}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className={settingStyle.inputPair}>
                  <label className={settingStyle.labelContainer}>
                    <span className={settingStyle.optionalField}>* </span>
                    &nbsp;Logo
                  </label>
                  <div className={settingStyle.colonContainer}>:</div>

                  <div className={settingStyle.inputError}>
                    <input
                      type="file"
                      name="logo"
                      accept="image/*"
                      onChange={handleChange}
                    />
                  </div>
                </div>
                {/**
                 * Added by - Ashish Dewangan on 02-09-2024
                 * Reason - To show selected image on input change
                 */}
                <div className={settingStyle.inputPair}>
                  <label className={settingStyle.labelContainer}></label>
                  <div className={settingStyle.colonContainer}></div>
                  <div className={settingStyle.inputError} id="imagePreview">
                    {logo && (
                      <img
                        src={baseURL + logo}
                        style={{ borderRadius: "2%" }}
                        width={"65%"}
                        height={100}
                      />
                    )}
                  </div>
                </div>

                {/* Added by - Ashish Dewangan on 18-09-2024
                Reason - Added contact number field */}
                <div className={settingStyle.inputPair}>
                  <label className={settingStyle.labelContainer}>
                    Contact Number
                  </label>
                  <div className={settingStyle.colonContainer}>:</div>

                  <div className={settingStyle.inputError}>
                    <input
                      type="text"
                      name="contact_number"
                      value={formData.contact_number}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      onInput={onlyAllowNumberOnInput}
                      maxLength={10}
                    />
                    <div className={settingStyle.error}>
                      {errors.contact_number && (
                        <span className={settingStyle.error}>
                          {errors.contact_number}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {/* End of addition by - Ashish Dewangan on 18-09-2024
                Reason - Added contact number field */}

                {/* Added by - Ashish Dewangan on 18-09-2024
                Reason - Added email field */}
                <div className={settingStyle.inputPair}>
                  <label className={settingStyle.labelContainer}>Email</label>
                  <div className={settingStyle.colonContainer}>:</div>

                  <div className={settingStyle.inputError}>
                    <input
                      type="text"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      max={249}
                    />
                    <div className={settingStyle.error}>
                      {errors.email && (
                        <span className={settingStyle.error}>
                          {errors.email}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {/* End of addition by - Ashish Dewangan on 18-09-2024
                Reason - Added email field */}
              </div>

              {/**
               * End of addition by - Ashish Dewangan on 02-09-2024
               * Reason - To show selected image on input change
               */}

              <div className={settingStyle.subContainer2}>
                {/* Added by - Ashish Dewangan on 18-09-2024
                Reason - Added gstin field */}
                <div className={settingStyle.inputPair}>
                  <label className={settingStyle.labelContainer}>
                    GSTIN Number
                  </label>
                  <div className={settingStyle.colonContainer}>:</div>

                  <div className={settingStyle.inputError}>
                    <input
                      type="text"
                      name="gstin"
                      value={formData.gstin}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      maxLength={15}
                    />
                    <div className={settingStyle.error}>
                      {errors.gstin && (
                        <span className={settingStyle.error}>
                          {errors.gstin}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {/* End of addition by - Ashish Dewangan on 18-09-2024
                Reason - Added gstin field */}

                <div className={settingStyle.inputPair}>
                  <label className={settingStyle.labelContainer}>
                    {/* <span className={settingStyle.mandatoryField}>* </span> */}
                    GST
                  </label>
                  <div className={settingStyle.colonContainer}>:</div>
                  <div className={settingStyle.inputError}>
                    <input
                      type="number"
                      name="gst"
                      value={formData.gst}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <div className={settingStyle.error}>
                      {errors.gst && (
                        <span className={settingStyle.error}>{errors.gst}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/**Code Addition by Tejasve Gupta on 22-08-2024
                Reason - Split IGST in sgst and cgst */}
                <div className={settingStyle.inputPair}>
                  <label className={settingStyle.labelContainer}>
                    {/* <span className={settingStyle.mandatoryField}>* </span> */}
                    CGST
                  </label>
                  <div className={settingStyle.colonContainer}>:</div>
                  <div className={settingStyle.inputError}>
                    <input
                      type="text"
                      name="cgst"
                      value={formData.gst / 2}
                      readOnly
                    />
                    <div className={settingStyle.error}>
                      {errors.gst && (
                        <span className={settingStyle.error}>{errors.gst}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className={settingStyle.inputPair}>
                  <label className={settingStyle.labelContainer}>
                    {/* <span className={settingStyle.mandatoryField}>* </span> */}
                    SGST
                  </label>
                  <div className={settingStyle.colonContainer}>:</div>
                  <div className={settingStyle.inputError}>
                    <input
                      type="text"
                      name="sgst"
                      value={formData.gst / 2}
                      readOnly
                    />
                    <div className={settingStyle.error}>
                      {errors.gst && (
                        <span className={settingStyle.error}>{errors.gst}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Added by - Ashish Dewangan on 18-09-2024
                Reason - Added tin number field */}
                <div className={settingStyle.inputPair}>
                  <label className={settingStyle.labelContainer}>
                    TIN Number
                  </label>
                  <div className={settingStyle.colonContainer}>:</div>

                  <div className={settingStyle.inputError}>
                    <input
                      type="number"
                      name="tin"
                      value={formData.tin}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      maxLength={11}
                    />
                    <div className={settingStyle.error}>
                      {errors.tin && (
                        <span className={settingStyle.error}>{errors.tin}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                {amenitiesList.length > 0 && (
                  <div className={settingStyle.inputPair}>
                    <label className={settingStyle.labelContainer}>
                      Hotel Amenities
                    </label>
                    <div className={settingStyle.colonContainer}>:</div>

                    <div className={settingStyle.inputError}>
                      <textarea
                        readOnly
                        // value={amenitiesList.join(", ")}
                         value={amenitiesList
                        .map(item => item.amenity_name?.amenity_name || '')
                        .filter(name => name)
                        .join(", ")}
                        style={{
                          width: '63%',
                          resize: 'none',
                          border: '1px solid #ccc',
                          padding: '4px',
                          borderRadius: '4px',
                          fontFamily: 'inherit',
                          fontSize: 'inherit',
                          minHeight: '40px',
                          whiteSpace: 'normal',
                          overflowWrap: 'break-word',
                        }}
                      />
                    </div>
                  </div>
                )}



              </div>
              <div className={settingStyle.subContainer2}>
                <div className={settingStyle.inputPair1}>
                  <label className={settingStyle.labelContainer}>
                    Select Hotel Amenities 
                  </label>
                  <div style={{ maxHeight: '295px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px', borderRadius: '4px' }}>
                    {amenityData.length > 0 ? (
                      amenityData.map((amenity) => (
                        <label key={amenity.id} style={{ display: 'flex', marginBottom: 8 }}>
                          <input
                            type="checkbox"
                            value={amenity.id}
                            checked={selectedAmenity.includes(amenity.id)}
                            onChange={() => handleCheckboxChange(amenity.id)}
                          />
                          <span style={{ marginLeft: 8 }}>{amenity.amenity_name}</span>
                        </label>
                      ))
                    ) : (
                      <p>Loading amenities...</p>
                    )}
                    {/* <div className={settingStyle.buttonContainer}>
                      <button
                        type="button"
                        className={`${settingStyle.saveButton} submitButton`}
                        
                        // onClick={() => setIsAmenityModalOpen(true)}
                        onClick={handleAmenitySubmit}
                      >
                        Add Amenity
                      </button>
                    </div> */}
                  </div>
                </div>
                
              </div>
              
            </div>
            


            <div className={settingStyle.buttonContainer}
            style={{gap: "10px"}}>
              <button
                // className={settingStyle.saveButton}
                className={`${settingStyle.saveButton} submitButton`}
                
                type="submit"
              >
                Save Settings
              </button>
               {/* <button
                  type="button"
                  className={`${settingStyle.saveButton} submitButton`}
                  
                  // onClick={() => setIsAmenityModalOpen(true)}
                  onClick={openAmenityModal}
                >
                  Add Amenity
                </button> */}
              
            </div>
          </form>

         
          
        </fieldset>
      </div>
      {/* {isAmenityModalOpen && (
        <div className={settingStyle.modalOverlay}>
          <div className={settingStyle.modalContainer}>
            <div className={settingStyle.modalHeader}>
              <h3>Add Amenity</h3>
              <span
                className={settingStyle.closeIcon}
                onClick={() => setIsAmenityModalOpen(false)}
              >
                &times;
              </span>
            </div>
            <form onSubmit={handleAmenitySubmit}>
              <div className={settingStyle.modalForm}>
                <label className={settingStyle.modalLabel}>Amenity Name</label>
                
                <select
                    id="amenity"
                    name="amenity"
                    className={settingStyle.inputSelect}
                    value={selectedAmenity}
                    onChange={(e) => setSelectedAmenity(e.target.value)}
                >
                    <option value="">Select Amenity</option>
                    
                    {amenityData.length === 0 ? (
                        <option>Loading amenity...</option>
                    ) : (
                        amenityData.map((item, index) => (
                            <option key={index} value={item.amenity_name}>
                                {item.amenity_name}
                            </option>
                        ))
                    )}
                </select>
                
              </div>
              <div className={settingStyle.buttonContainer} style={{marginTop: "10px"}}>
                <button type="submit" className={`${settingStyle.save} save`} onClick={closeAmenityModal}>
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )} */}

      
    </div>
  );
};
// End of Code Addition by Tejasve Gupta on 26-07-2024
// Reason - Adjustment of style by Adding classname
export default SettingsForm;
