// Creation by Tejasve Gupta on 24-07-2024

import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { postSettings, getSettingsApi } from "../../Api/services";
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
      // case "hotel_address":
      //   if (checkIsEmpty(value)) {
      //     validationErrors[name] = "Hotel address cannot be empty.";
      //   }
      //   break;
      // case "standard_checkin_time":
      //   if (checkIsEmpty(value)) {
      //     validationErrors[name] = "Standard check-in time cannot be empty.";
      //   }
      //   break;
      // case "standard_checkout_time":
      //   if (checkIsEmpty(value)) {
      //     validationErrors[name] = "Standard checkout time cannot be empty.";
      //   }
      //   break;
      /**Code Commented by Tejasve Gupta on 22-08-2024
       * Reason - To remove vacant
       */
      // case "vacant_info_before_hour":
      //   if (checkIsEmpty(value)) {
      //     validationErrors[name] = "Vacant info before hour cannot be empty.";
      //   }
      //   break;
      /**End of Code Commented by Tejasve Gupta on 22-08-2024
       * Reason - To remove vacant
       */
      // case "gst":
      //   if (checkIsEmpty(value)) {
      //     validationErrors[name] = "GST cannot be empty.";
      //   }
      //   break;
      // default:
      //   break;
      /**
       * Added by - Ashish Dewangan on 18-09-2024
       * Reason - Added validations for contact number and email
       */
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
      /**
       * End of addition by - Ashish Dewangan on 18-09-2024
       * Reason - Added validations for contact number and email
       */
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      ...validationErrors,
    }));
  };

  const isValidOnSubmit = () => {
    const validationErrors = {};

    // if (checkIsEmpty(formData.terms_and_conditions)) {
    //   validationErrors.terms_and_conditions =
    //     "Terms and conditions cannot be empty.";
    // }
    if (checkIsEmpty(formData.hotel_name)) {
      validationErrors.hotel_name = "Hotel name cannot be empty.";
    } else if (checkIfGreaterThanMaxLength(formData.hotel_name, 100)) {
      validationErrors.hotel_name = "Hotel name cannot exceed 100 characters.";
    }

    // if (checkIsEmpty(formData.hotel_address)) {
    //   validationErrors.hotel_address = "Hotel address cannot be empty.";
    // }
    // if (checkIsEmpty(formData.standard_checkin_time)) {
    //   validationErrors.standard_checkin_time =
    //     "Standard check-in time cannot be empty.";
    // }
    // if (checkIsEmpty(formData.standard_checkout_time)) {
    //   validationErrors.standard_checkout_time =
    //     "Standard checkout time cannot be empty.";
    // }
    /**Code Commented by Tejasve Gupta on 22-08-2024
     * Reason - To remove vacant
     */
    // if (checkIsEmpty(formData.vacant_info_before_hour)) {
    //   validationErrors.vacant_info_before_hour =
    //     "Vacant info before hour cannot be empty.";
    // }
    /**End of Code Commented by Tejasve Gupta on 22-08-2024
     * Reason - To remove vacant
     */
    // if (checkIsEmpty(formData.gst)) {
    //   validationErrors.gst = "GST cannot be empty.";
    // }

    /**
     * Added by - Ashish Dewangan on 18-09-2024
     * Reason - Added validations for contact number and email
     */
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
    /**
     * End of addition by - Ashish Dewangan on 18-09-2024
     * Reason - Added validations for contact number and email
     */

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
      // Clear form fields
      // setFormData({
      //   id: "",
      //   terms_and_conditions: "",
      //   hotel_name: "",
      //   hotel_address: "",
      //   logo: null,
      //   standard_checkin_time: "",
      //   standard_checkout_time: "",
      //   vacant_info_before_hour: "",
      //   gst: "",
      // });
      notificationObject.success(response.success);
      /**
       * Added by - Ashish Dewangan on 02-09-2024
       * Reason - To clear selected image on form submit
       */
      // setLogo();
      // const previewDiv = document.getElementById("imagePreview");
      // previewDiv.innerHTML = ""; // Clear previous content
      /**
       * End of addition by - Ashish Dewangan on 02-09-2024
       * Reason - To clear selected image on form submit
       */
      // getSettingDetails();
      // navigate("/settings");
      window.location.reload();
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };
  //  End of Code Addition by Tejasve Gupta on 25-07-2024
  //   Reason - Addition of validation

  /**
   * Added by - Ashish Dewangan on 18-09-2024
   * Reason - To allow only number to be entered
   */
  const onlyAllowNumberOnInput = (e) => {
    // e.target.value= e.target.value.replace(/[^0-9]/g, '').replace(/(\..*?)\..*/g, '$1').replace(/^0[^.]/, '0');
    e.target.value = e.target.value
      .replace(/[^0-9]/g, "")
      .replace(/(\..*?)\..*/g, "$1");
  };
  /**
   * End of addition by - Ashish Dewangan on 18-09-2024
   * Reason - To allow only number to be entered
   */

  // const handleRowClick = (settings) => {
  //   setFormData(settings);
  // };
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

          <form onSubmit={handleSubmit}>
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
                {/* End of addition by - Ashish Dewangan on 18-09-2024
                Reason - Added tin number field */}

                {/**End of Code Addition by Tejasve Gupta on 22-08-2024
                Reason - Split IGST in sgst and cgst */}
                {/* <div className={settingStyle.inputPair}>
                  <label className={settingStyle.labelContainer}>
                    Standard Check-in Time
                  </label>
                  <div className={settingStyle.colonContainer}>:</div>

                  <div className={settingStyle.inputError}>
                    <input
                      type="time"
                      name="standard_checkin_time"
                      value={formData.standard_checkin_time}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <div className={settingStyle.error}>
                      {errors.standard_checkin_time && (
                        <span className={settingStyle.error}>
                          {errors.standard_checkin_time}
                        </span>
                      )}
                    </div>
                  </div>
                </div> */}
                {/* <div className={settingStyle.inputPair}>
                  <label className={settingStyle.labelContainer}>
                    Standard Checkout Time
                  </label>
                  <div className={settingStyle.colonContainer}>:</div>

                  <div className={settingStyle.inputError}>
                    <input
                      type="time"
                      name="standard_checkout_time"
                      value={formData.standard_checkout_time}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <div className={settingStyle.error}>
                      {errors.standard_checkout_time && (
                        <span className={settingStyle.error}>
                          {errors.standard_checkout_time}
                        </span>
                      )}
                    </div>
                  </div>
                </div> */}
                {/**Code Commented by Tejasve Gupta on 22-08-2024
                 * Reason - To remove vacant
                 */}
                {/* <div className={settingStyle.inputPair}>
                          <label className={settingStyle.labelContainer}>
                          <span className={settingStyle.mandatoryField}>* </span>Vacant Info
                        Before Hour
                            </label>
                          <div className={settingStyle.colonContainer}>:</div>

                        <div className={settingStyle.inputError}>
                          <input
                            type="number"
                            name="vacant_info_before_hour"
                            value={formData.vacant_info_before_hour}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                          <div className={settingStyle.error}>
                            {errors.vacant_info_before_hour && (
                              <span className={settingStyle.error}>
                                {errors.vacant_info_before_hour}
                              </span>
                            )}
                          </div>
                        </div>
                          </div> */}
                {/**End of Code Commented by Tejasve Gupta on 22-08-2024
                 * Reason - To remove vacant
                 */}

                {/* <div className={settingStyle.inputPair}>
                  <label className={settingStyle.labelContainer}>
                    <span className={settingStyle.mandatoryField}>* </span>Terms
                    and Conditions
                  </label>
                  <div className={settingStyle.colonContainer}>:</div>
                  <div className={settingStyle.inputError}>
                    <textarea
                      name="terms_and_conditions"
                      value={formData.terms_and_conditions}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <div className={settingStyle.error}>
                      {errors.terms_and_conditions && (
                        <span className={settingStyle.error}>
                          {errors.terms_and_conditions}
                        </span>
                      )}
                    </div>
                  </div>
                </div>  */}
              </div>
            </div>

            <div className={settingStyle.buttonContainer}>
              <button
                // className={settingStyle.saveButton}
                className={`${settingStyle.saveButton} submitButton`}
                type="submit"
              >
                Save Settings
              </button>
            </div>
          </form>
        </fieldset>
      </div>

      {/* <div className={settingStyle.listContainer}>
        <table className={settingStyle.settingsTable}>
          <thead>
            <tr>
              <th>Hotel Name</th>
              <th>Hotel Address</th>
              <th>Standard Check-in Time</th>
              <th>Standard Checkout Time</th>
              <th>Terms and Conditions</th>
              <th>Vacant Info Before Hour</th>
            </tr>
          </thead>
          <tbody>
            {settingsList.map((settings, index) => (
              <tr
                key={index}
                onClick={() => handleRowClick(settings)}
                className={settingStyle.listItem}
              >
                <td>{settings.hotel_name}</td>
                <td>{settings.hotel_address}</td>
                <td>{settings.standard_checkin_time}</td>
                <td>{settings.standard_checkout_time}</td>
                <td>{settings.terms_and_conditions}</td>
                <td>{settings.vacant_info_before_hour}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div> */}
    </div>
  );
};
// End of Code Addition by Tejasve Gupta on 26-07-2024
// Reason - Adjustment of style by Adding classname
export default SettingsForm;
