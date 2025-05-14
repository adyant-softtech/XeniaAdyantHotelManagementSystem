/**
 * Created by - Ashish Dewangan on 04-10-2024
 * Reason - To have hanover page
 */
import React, { useContext, useEffect, useState } from "react";
import handoverStyle from "./Handover.module.css";
import {
  postHandoverDetailsApi,
  getHandoverDetailsApi,
  editHandoverDetailsApi,
  deleteHandoverDetailsApi,
  getAllUserDetailsApi,
} from "../../Api/services";
import { checkIsEmpty } from "../../utils/validations";
import { GlobalContext } from "../../context/Context";
import { MdDelete } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import { Grid, TextField, Button } from "@mui/material";
import { styled } from "@mui/system";
import { FiArrowLeft } from "react-icons/fi";

const HandoverForm = () => {
  const { user, tenant } = useContext(GlobalContext);
  const [handovers, setHandovers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingHandoverId, setEditingHandoverId] = useState(null); // To track which handover is being edited
  const [existingHandoverDetails, setExistingHandoverDetails] = useState({});
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
  const [formData, setFormData] = useState({
    handover_amount: "",
    manager_remark: "",
    admin_remark: "",
    user: user.email,
    /**
     * Added by - Ashish Dewangan on 07-10-2024
     * Reason - To store handover to and handover amount received
     */
    handover_to: "",
    handover_amount_received: "",
    /**
     * End of addition by - Ashish Dewangan on 07-10-2024
     * Reason - To store handover to and handover amount received
     */

    /**
     * Added by - Ashish Dewangan on 09-10-2024
     * Reason - To store receiver_manager_remark
     */
    receiver_manager_remark: "",
    /**
     * End of addition by - Ashish Dewangan on 09-10-2024
     * Reason - To store receiver_manager_remark
     */
  });

  const [errors, setErrors] = useState({
    handover_amount: "",
    manager_remark: "",
    admin_remark: "",
    user: "",
    /**
     * Added by - Ashish Dewangan on 07-10-2024
     * Reason - To store handover to and handover amount received
     */
    handover_to: "",
    handover_amount_received: "",
    /**
     * End of addition by - Ashish Dewangan on 07-10-2024
     * Reason - To store handover to and handover amount received
     */

    /**
     * Added by - Ashish Dewangan on 09-10-2024
     * Reason - To store receiver_manager_remark error
     */
    receiver_manager_remark: "",

    /**
     * End of addition by - Ashish Dewangan on 09-10-2024
     * Reason - To store receiver_manager_remark error
     */
  });
  /**
   * Modified by - Ashish Dewangan on 28-10-2024
   * Reason - to set current date according to the timezone
   */
  // var currentDate = new Date();
  var currentDate = new Date(
    new Date().toLocaleString("en-Us", { timeZone: "Asia/Kolkata" })
  );
  /**
   * End of modification by - Ashish Dewangan on 28-10-2024
   * Reason - to set current date according to the timezone
   */
  const offset = currentDate.getTimezoneOffset();
  currentDate = new Date(currentDate.getTime() + offset * 60 * 1000);

  const [filterConditions, setFilterConditions] = useState({
    date: currentDate.toISOString().split("T")[0],
  });

  const [users, setUsers] = useState([]);

  const StyledTextField = styled(TextField)({
    width: "250px",
    height: "40px",
    "& .MuiOutlinedInput-root": {
      height: "40px",
      backgroundColor: "transparent",
      borderRadius: "5px",
      "& fieldset": {
        borderColor: "#4caf50",
      },
      "&:hover fieldset": {
        borderColor: "#388e3c",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#1b5e20",
      },
    },
  });

  const ClearButton = styled(Button)({
    backgroundColor: "#f44336",
    color: "#fff",
    marginLeft: "10px",
    "&:hover": {
      backgroundColor: "#e53935",
    },
  });

  /**
   * Added by - Ashish Dewangan on 04-10-2024
   * Reason - To get list of handovers according to selected date
   */
  const fetchHandoverDetails = async () => {
    setLoading(true);
    try {
      const access = localStorage.getItem("access");
      const response = await getHandoverDetailsApi(access, filterConditions, tenant);
      setHandovers(response);
    } catch (error) {
      console.error("Error fetching handover details:", error);
    } finally {
      setLoading(false);
    }
  };
  /**
   * End of addition by - Ashish Dewangan on 04-10-2024
   * Reason - To get list of handovers according to selected date
   */

  /**
   * Added by - Ashish Dewangan on 07-10-2024
   * Reason - to get the details of managers
   */
  const getAllUserDetails = async () => {
    try {
      const access = localStorage.getItem("access");
      const data = await getAllUserDetailsApi(access, tenant);
      setUsers(data?.user || []);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };
  /**
   * End of addition by - Ashish Dewangan on 07-10-2024
   * Reason - to get the details of managers
   */

  /**
   * Added by - Ashish Dewangan on 09-10-2024
   * Reason - To auto populate user email in form
   */
  useEffect(() => {
    setFormData((prevState) => ({
      ...prevState,
      user: user.email,
    }));
  }, [user]);
  /**
   * End of addition by - Ashish Dewangan on 09-10-2024
   * Reason - To auto populate user email in form
   */

  /**
   * Added by - Ashish Dewangan on 04-10-2024
   * Reason - Calls the get handover API when page is loaded
   */
  useEffect(() => {
    /**
     * Added by - Ashish Dewangan on 07-10-2024
     * Reason - to get the details of managers
     */
    getAllUserDetails();
    /**
     * End of addition by - Ashish Dewangan on 07-10-2024
     * Reason - to get the details of managers
     */
    fetchHandoverDetails();
  }, [filterConditions]);
  /**
   * End of addition by - Ashish Dewangan on 04-10-2024
   * Reason - Calls the get handover API when page is loaded
   */

  /**
   * Added by - Ashish Dewangan on 04-10-2024
   * Reason - This method helps to update the value of any form field
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "", // Clear error for the current field
    }));
  };
  /**
   * End of addition by - Ashish Dewangan on 04-10-2024
   * Reason - This method helps to update the value of any form field
   */

  /**
   * Added by - Ashish Dewangan on 04-10-2024
   * Reason - This method helps to update the filter condition
   */
  const handleFilterConditionChange = (e) => {
    const { name, value } = e.target;
    setFilterConditions((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };
  /**
   * End of addition by - Ashish Dewangan on 04-10-2024
   * Reason - This method helps to update the filter condition
   */

  /**
   * Added by - Ashish Dewangan on 04-10-2024
   * Reason - To clear filter
   */
  const handleClearFilterConditions = (e) => {
    setFilterConditions({
      date: currentDate.toISOString().split("T")[0],
    });
  };
  /**
   * End of addition by - Ashish Dewangan on 04-10-2024
   * Reason - To clear filter
   */

  /**
   * Added by - Ashish Dewangan on 04-10-2024
   * Reason - To validate form fields
   */
  const isValidOnBlur = (input, value) => {
    let isValid = true;
    let errorMessage = "";

    switch (input) {
      case "handover_amount":
        if (checkIsEmpty(value)) {
          errorMessage = "Please enter amount";
          isValid = false;
        }
        break;
      /**
       * Added by - Ashish Dewangan on 07-10-2024
       * Reason - Added validation for handover amount received
       */
      case "handover_amount_received":
        if (checkIsEmpty(value)) {
          errorMessage = "Please enter received amount";
          isValid = false;
        }
        break;
      /**
       * End of addition by - Ashish Dewangan on 07-10-2024
       * Reason - Added validation for handover amount received
       */
      case "manager_remark":
        if (checkIsEmpty(value)) {
          errorMessage = "Please enter remark";
          isValid = false;
        }
        break;
      /**
       * Added by - Ashish Dewangan on 07-10-2024
       * Reason - Added validation for handover amount received
       */

      /**
       * Added by - Ashish Dewangan on 09-10-2024
       * Reason - Added validation for receiver_manager_remark
       */
      case "receiver_manager_remark":
        if (checkIsEmpty(value)) {
          errorMessage = "Please enter remark";
          isValid = false;
        }
        break;

      /**
       * End of addition by - Ashish Dewangan on 09-10-2024
       * Reason - Added validation for receiver_manager_remark
       */

      case "handover_to":
        if (checkIsEmpty(value)) {
          errorMessage = "Please select the user";
          isValid = false;
        }
        break;
      /**
       * End of addition by - Ashish Dewangan on 07-10-2024
       * Reason - Added validation for handover amount received
       */

      case "admin_remark":
        if (checkIsEmpty(value)) {
          errorMessage = "Please enter remark";
          isValid = false;
        }
        break;

      default:
        break;
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [input]: errorMessage,
    }));

    return isValid;
  };
  /**
   * End of addition by - Ashish Dewangan on 04-10-2024
   * Reason - To validate form fields
   */

  /**
   * Added by - Ashish Dewangan on 04-10-2024
   * Reason - Method that will be called when we click on submit button.
   * Also logic is implemented to call POST or PUT API depending on the existing handover id
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields on submit

    const fields = [
      "handover_amount",
      /**
       * Modified by - Ashish Dewangan on 09-10-2024
       * Reason - Logic to decide whether to validate this field or not. Depends on user id
       */
      // "handover_amount_received",

      /**
       * Modified by - Ashish Dewangan on 10-10-2024
       * Reason - Changed logic for validation of this field
       */
      // editingHandoverId &&
      //   user.id == formData.handover_to &&
      //   "handover_amount_received",

      user.is_superuser
        ? "handover_amount_received"
        : editingHandoverId &&
          user.id == formData.handover_to &&
          "handover_amount_received",
      /**
       * End of modification by - Ashish Dewangan on 10-10-2024
       * Reason - Changed logic for validation of this field
       */
      /**
       * End of Modification by - Ashish Dewangan on 09-10-2024
       * Reason - Logic to decide whether to validate this field or not. Depends on user id
       */
      "manager_remark",
      "handover_to",
      /**
       * Modified by - Ashish Dewangan on 10-10-2024
       * Reason - Changed logic for validation of this field
       */
      // user?.is_superuser && editingHandoverId && "admin_remark",
      user?.is_superuser && "admin_remark",
      /**
       * End of modification by - Ashish Dewangan on 10-10-2024
       * Reason - Changed logic for validation of this field
       */

      /**
       * Added by - Ashish Dewangan on 09-10-2024
       * Reason - Logic to decide whether to validate this field or not. Depends on user id
       */

      /**
       * Modified by - Ashish Dewangan on 10-10-2024
       * Reason - Changed logic for validation of this field
       */
      // editingHandoverId &&
      //   user.id == formData.handover_to &&
      //   "receiver_manager_remark",
      user.is_superuser
        ? "receiver_manager_remark"
        : editingHandoverId &&
          user.id == formData.handover_to &&
          "receiver_manager_remark",
      /**
       * End of modification by - Ashish Dewangan on 10-10-2024
       * Reason - Changed logic for validation of this field
       */
      /**
       * End of addition by - Ashish Dewangan on 09-10-2024
       * Reason - Logic to decide whether to validate this field or not. Depends on user id
       */
    ];

    let allValid = true;

    fields.forEach((field) => {
      const value = formData[field];
      if (!isValidOnBlur(field, value)) {
        allValid = false;
      }
    });

    // Validate other fields if needed
    if (!allValid) return;

    const accessToken = localStorage.getItem("access");

    try {
      if (editingHandoverId) {
        // Edit existing handover
        await editHandoverDetailsApi(accessToken, editingHandoverId, formData, tenant);
      } else {
        // Add new handover
        await postHandoverDetailsApi(accessToken, formData, tenant);
      }

      setFormData({
        handover_amount: "",
        handover_amount_received: "",
        manager_remark: "",
        admin_remark: "",
        user: user.email,
        handover_to: "",
        /**
         * Added by - Ashish Dewangan on 09-10-2024
         * Reason - To clear the form field receiver_manager_remark after form submission
         */
        receiver_manager_remark: "",
        /**
         * End of addition by - Ashish Dewangan on 09-10-2024
         * Reason - To clear the form field receiver_manager_remark after form submission
         */
      });

      // Reset error states
      setErrors({
        handover_amount: "",
        handover_amount_received: "",
        manager_remark: "",
        admin_remark: "",
        user: "",
        handover_to: "",
        /**
         * Added by - Ashish Dewangan on 09-10-2024
         * Reason - To clear the validation error for receiver_manager_remark after form submission
         */
        receiver_manager_remark: "",
        /**
         * End of addition by - Ashish Dewangan on 09-10-2024
         * Reason - To clear the validation error for receiver_manager_remark after form submission
         */
      });

      fetchHandoverDetails();
      setEditingHandoverId(null); // Reset editing state after successful operation
    } catch (error) {
      console.error("Failed to save handover:", error);
    }
  };
  /**
   * End of addition by - Ashish Dewangan on 04-10-2024
   * Reason - Method that will be called when we click on submit button.
   * Also logic is implemented to call POST or PUT API depending on the existing handover id
   */

  /**
   * Added by - Ashish Dewangan on 04-10-2024
   * Reason - When we edit the already created handover then existing data will be set to the form
   */
  const handleEdit = (handover) => {
    /**
     * Added by - Ashish Dewangan on 11-10-2024
     * Reason - To move to the top of the page when edit icon is clicked
     */
    window.scrollTo(0, 0);
    /**
     * End of addition by - Ashish Dewangan on 11-10-2024
     * Reason - To move to the top of the page when edit icon is clicked
     */

    /**
     * Added by - Ashish Dewangan on 10-10-2024
     * Reason - To store the handover details that is currently being edited
     */
    setExistingHandoverDetails(handover);
    /**
     * End of addition by - Ashish Dewangan on 10-10-2024
     * Reason - To store the handover details that is currently being edited
     */

    /**
     * Added by - Ashish Dewangan on 10-10-2024
     * Reason - To clear validation error when we click on edit icon
     */
    setErrors({
      handover_amount: "",
      handover_amount_received: "",
      manager_remark: "",
      admin_remark: "",
      user: "",
      handover_to: "",

      receiver_manager_remark: "",
    });
    /**
     * End of addition by - Ashish Dewangan on 10-10-2024
     * Reason - To clear validation error when we click on edit icon
     */

    setFormData({
      handover_amount: handover.handover_amount,
      /**
       * Modified by - Ashish Dewangan on 10-10-2024
       * Reason - handled null condition
       */
      // handover_amount_received: handover.handover_amount_received,
      handover_amount_received: handover.handover_amount_received
        ? handover.handover_amount_received
        : "",
      /**
       * End of modification by - Ashish Dewangan on 10-10-2024
       * Reason - handled null condition
       */
      manager_remark: handover.manager_remark,
      admin_remark: handover.admin_remark,
      user: handover.user_email,
      handover_to: handover.handover_to,
      /**
       * Added by - Ashish Dewangan on 09-10-2024
       * Reason - To auto fill receiver_manager_remark when we edit the handover
       */
      receiver_manager_remark: handover.receiver_manager_remark,
      /**
       * End of addition by - Ashish Dewangan on 09-10-2024
       * Reason - To auto fill receiver_manager_remark when we edit the handover
       */
    });
    setEditingHandoverId(handover.id); // Set the id of the handover being edited
  };
  /**
   * End of addition by - Ashish Dewangan on 04-10-2024
   * Reason - When we edit the already created handover then existing data will be set to the form
   */

  /**
   * Added by - Ashish Dewangan on 04-10-2024
   * Reason - Calls DELETE API when we click on delete icon
   */
  const handleDelete = async (id) => {
    const accessToken = localStorage.getItem("access");
    try {
      await deleteHandoverDetailsApi(accessToken, id, tenant);
      setHandovers((prevHandovers) =>
        prevHandovers.filter((handover) => handover.id !== id)
      );
    } catch (error) {
      console.error("Failed to delete handover:", error);
    }
  };

  /**
   * End of addition by - Ashish Dewangan on 04-10-2024
   * Reason - Calls DELETE API when we click on delete icon
   */

  /**
   * Added by - Ashish Dewangan on 07-10-2024
   * Reason - to update hanover to amount in form
   */
  const handleHandoverToChange = (e) => {
    setFormData({
      ...formData,
      handover_to: e.target.value,
    });
  };
  /**
   * End of addition by - Ashish Dewangan on 07-10-2024
   * Reason - to update hanover to amount in form
   */

  /**
   * Added by - Ashish Dewangan on 09-10-2024
   * Reason - To allow only number to be entered
   */
  const onlyAllowNumberInput = (e) => {
    // e.target.value= e.target.value.replace(/[^0-9]/g, '').replace(/(\..*?)\..*/g, '$1').replace(/^0[^.]/, '0');
    e.target.value = e.target.value
      .replace(/[^0-9]/g, "")
      .replace(/(\..*?)\..*/g, "$1");
  };
  /**
   * End of addition by - Ashish Dewangan on 09-10-2024
   * Reason - To allow only number to be entered
   */

  return (
    <div className={handoverStyle.pageFrame}>
      <div className={handoverStyle.title}>
        {/* Modification and addition by Om Shrivastava on 03-01-2025
            Reason : Add back icon  */}
        <FiArrowLeft className="backIcon" onClick={handleBackClick} />
        Handover Details
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
      <div className={handoverStyle.pageContainer}>
        <fieldset className={handoverStyle.handoverForm}>
          <legend className={handoverStyle.formTitle}>Handover</legend>
          <form className={handoverStyle.formContainer} onSubmit={handleSubmit}>
            <div className={handoverStyle.divContainer}>
              <div className={handoverStyle.childContainer1}>
                <div className={handoverStyle.formGroup}>
                  <div className={handoverStyle.labelColon}>
                    <div className={handoverStyle.labelContainer}>
                      <div className={handoverStyle.mandatoryField}>*</div>
                      <label htmlFor="handover_amount">
                        Amount To Handover
                      </label>
                    </div>
                  </div>

                  <div className={handoverStyle.inputContainer}>
                    <input
                      className={handoverStyle.inputSection}
                      type="text"
                      id="handover_amount"
                      name="handover_amount"
                      value={formData.handover_amount}
                      onChange={handleChange}
                      onBlur={(e) =>
                        isValidOnBlur("handover_amount", e.target.value)
                      }
                      /**
                       * Added by - Ashish Dewangan on 09-10-2024
                       * Reason - To allow only number to be entered
                       */
                      onInput={onlyAllowNumberInput}
                      /**
                       * End of addditon by - Ashish Dewangan on 09-10-2024
                       * Reason - To allow only number to be entered
                       */

                      /**
                       * Added by - Ashish Dewangan on 10-10-2024
                       * Reason - disabled form field depending on various conditions
                       */
                      disabled={
                        user.is_superuser
                          ? false
                          : editingHandoverId
                          ? true
                          : false
                      }
                      /**
                       * End of addition by - Ashish Dewangan on 10-10-2024
                       * Reason - disabled form field depending on various conditions
                       */
                    />
                    <div className={handoverStyle.formInputError}>
                      {errors.handover_amount}
                    </div>
                  </div>
                </div>

                <div className={handoverStyle.formGroup}>
                  <div className={handoverStyle.labelColon}>
                    {/* End of addition by - Ashish Dewangan on 07-10-2024
                     * Reason - Added handover amount received details */}
                    <div className={handoverStyle.mandatoryField}>*</div>
                    <div className={handoverStyle.labelContainer}>
                      {/* Modified by - Ashish Dewangan on 0910-2024
                       * Reason - Renamed the field */}
                      {/* <label htmlFor="manager_remark">Manager Remark</label> */}
                      <label htmlFor="manager_remark">Handover Remark</label>
                      {/* End of modification by - Ashish Dewangan on 0910-2024
                       * Reason - Renamed the field */}
                    </div>
                  </div>
                  <div className={handoverStyle.inputContainer}>
                    <textarea
                      className={handoverStyle.inputSection}
                      type="text"
                      id="manager_remark"
                      name="manager_remark"
                      value={formData.manager_remark}
                      onChange={handleChange}
                      style={{ resize: "none" }}
                      maxLength="254"
                      onBlur={(e) =>
                        isValidOnBlur("manager_remark", e.target.value)
                      }
                      /**
                       * Added by - Ashish Dewangan on 10-10-2024
                       * Reason - disabled form field depending on various conditions
                       */
                      disabled={
                        user.is_superuser
                          ? false
                          : editingHandoverId
                          ? true
                          : false
                      }
                      /**
                       * End of addition by - Ashish Dewangan on 10-10-2024
                       * Reason - disabled form field depending on various conditions
                       */
                    />
                    <div className={handoverStyle.formInputError}>
                      {errors.manager_remark}
                    </div>
                  </div>
                </div>

                <div className={handoverStyle.formGroup}>
                  <div className={handoverStyle.labelColon}>
                    <div className={handoverStyle.mandatoryField}>*</div>

                    <div className={handoverStyle.labelContainer}>
                      <label htmlFor="handover_amount_received">
                        Handover Amount Received
                      </label>
                    </div>
                  </div>

                  <div className={handoverStyle.inputContainer}>
                    <input
                      className={handoverStyle.inputSection}
                      type="text"
                      id="handover_amount_received"
                      name="handover_amount_received"
                      value={formData.handover_amount_received}
                      onChange={handleChange}
                      onBlur={(e) =>
                        isValidOnBlur(
                          "handover_amount_received",
                          e.target.value
                        )
                      }
                      /**
                       * Added by - Ashish Dewangan on 09-10-2024
                       * Reason - To allow only number to be entered
                       */
                      onInput={onlyAllowNumberInput}
                      /**
                       * End of addditon by - Ashish Dewangan on 09-10-2024
                       * Reason - To allow only number to be entered
                       */

                      disabled={
                        user.is_superuser
                          ? false
                          : existingHandoverDetails.handover_amount_received
                          ? true
                          : editingHandoverId && formData.handover_to == user.id
                          ? false
                          : true
                      }
                    />
                    <div className={handoverStyle.formInputError}>
                      {errors.handover_amount_received}
                    </div>
                  </div>
                </div>

                {/**
                 * Added by - Ashish Dewangan on 09-10-2024
                 * Reason - Added receiver manager's remark input box
                 */}

                <div className={handoverStyle.formGroup}>
                  <div className={handoverStyle.labelColon}>
                    {/* End of addition by - Ashish Dewangan on 07-10-2024
                     * Reason - Added handover amount received details */}

                    <div className={handoverStyle.mandatoryField}>*</div>

                    <div className={handoverStyle.labelContainer}>
                      {/* Modified by - Ashish Dewangan on 0910-2024
                       * Reason - Renamed the field */}
                      {/* <label htmlFor="manager_remark">Manager Remark</label> */}
                      <label htmlFor="receiver_manager_remark">
                        Handover Receiver's Remark
                      </label>
                      {/* End of modification by - Ashish Dewangan on 0910-2024
                       * Reason - Renamed the field */}
                    </div>
                  </div>
                  <div className={handoverStyle.inputContainer}>
                    <textarea
                      className={handoverStyle.inputSection}
                      type="text"
                      id="receiver_manager_remark"
                      name="receiver_manager_remark"
                      value={formData.receiver_manager_remark}
                      onChange={handleChange}
                      style={{ resize: "none" }}
                      maxLength="254"
                      onBlur={(e) =>
                        isValidOnBlur("receiver_manager_remark", e.target.value)
                      }
                      disabled={
                        user.is_superuser
                          ? false
                          : existingHandoverDetails.handover_amount_received
                          ? true
                          : editingHandoverId && formData.handover_to == user.id
                          ? false
                          : true
                      }
                    />
                    <div className={handoverStyle.formInputError}>
                      {errors.receiver_manager_remark}
                    </div>
                  </div>
                </div>

                {/**
                 * End of addition by - Ashish Dewangan on 09-10-2024
                 * Reason - Added receiver manager's remark input box
                 */}
              </div>

              <div className={handoverStyle.childContainer2}>
                <div className={handoverStyle.formGroup}>
                  <div className={handoverStyle.labelColon}>
                    <div
                      className={handoverStyle.labelContainer}
                      style={{ marginLeft: "5.3%" }}
                    >
                      <label htmlFor="user">User</label>
                    </div>
                  </div>
                  <div className={handoverStyle.inputContainer}>
                    <input
                      className={handoverStyle.inputSection}
                      type="text"
                      id="user"
                      name="user"
                      value={formData.user}
                      onBlur={(e) => isValidOnBlur("user", e.target.value)}
                      disabled={true}
                    />
                    <div className={handoverStyle.formInputError}></div>
                  </div>
                </div>

                {/* Added by - Ashish Dewangan on 07-10-2024
                 * Reason - Added handover to details */}
                <div className={handoverStyle.formGroup}>
                  <div className={handoverStyle.labelColon}>
                    <div className={handoverStyle.mandatoryField}>*</div>
                    <div className={handoverStyle.labelContainer}>
                      <label htmlFor="handover_to">Handover To</label>
                    </div>
                  </div>
                  <div className={handoverStyle.inputContainer}>
                    <select
                      className={handoverStyle.inputSection}
                      style={{ width: "71%" }}
                      id="handover_to"
                      value={formData.handover_to}
                      onChange={handleHandoverToChange}
                      // onBlur={(e) =>
                      //   isValidOnBlur("paid_by", e.target.value)
                      // }

                      /**
                       * Added by - Ashish Dewangan on 10-10-2024
                       * Reason - disabled form field depending on various conditions
                       */
                      disabled={
                        user.is_superuser
                          ? false
                          : editingHandoverId
                          ? true
                          : false
                      }
                      /**
                       * End of addition by - Ashish Dewangan on 10-10-2024
                       * Reason - disabled form field depending on various conditions
                       */
                    >
                      <option value="">Select User</option>
                      {Array.isArray(users) &&
                        users.map((user, index) => (
                          <option key={index} value={user.id || "Admin"}>
                            {user.email || "Admin"}
                          </option>
                        ))}
                    </select>
                    <div className={handoverStyle.formInputError}>
                      {errors.handover_to}
                    </div>
                  </div>
                </div>
                {/* End of addition by - Ashish Dewangan on 07-10-2024
                 * Reason - Added handover to details */}

                <div className={handoverStyle.formGroup}>
                  <div className={handoverStyle.labelColon}>
                    <div className={handoverStyle.mandatoryField}>*</div>

                    <div className={handoverStyle.labelContainer}>
                      <label htmlFor="name">Admin Remark</label>
                    </div>
                  </div>
                  <div className={handoverStyle.inputContainer}>
                    <textarea
                      className={handoverStyle.inputSection}
                      type="text"
                      id="admin_remark"
                      name="admin_remark"
                      value={formData.admin_remark}
                      onChange={handleChange}
                      style={{ resize: "none" }}
                      maxLength="255"
                      onBlur={(e) =>
                        isValidOnBlur("admin_remark", e.target.value)
                      }
                      disabled={user?.is_superuser ? false : true}
                    />
                    <div className={handoverStyle.formInputError}>
                      {errors.admin_remark}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <button
                type="submit"
                className={`${handoverStyle.submitButton} submitButton`}
              >
                {editingHandoverId ? "Update Handover" : "Add Handover"}
              </button>
            </div>
          </form>
        </fieldset>

        <div>
          <Grid
            container
            justifyContent="center"
            alignItems="center"
            mb={2}
            paddingTop="3.5%"
            style={{ position: "relative" }}
          >
            <Grid item>
              <StyledTextField
                label="Date"
                type="date"
                name="date"
                InputLabelProps={{
                  shrink: true,
                }}
                value={filterConditions.date}
                onChange={handleFilterConditionChange}
                variant="outlined"
              />
            </Grid>
            {/* <Grid item>
              <ClearButton
                variant="contained"
                onClick={handleClearFilterConditions}
              >
                Reset Date
              </ClearButton>
            </Grid> */}
          </Grid>
          {loading ? (
            <div>Loading...</div>
          ) : handovers?.length ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                paddingTop: "1%",
              }}
            >
              <table className={handoverStyle.table}>
                <thead>
                  <tr>
                    {/* Modified the code by akanksha on 16-10-2024,
                    Reason to rearrange the column name and data */}
                    <th className={handoverStyle.th}>S.NO.</th>
                    <th className={handoverStyle.th}>User</th>

                    <th className={handoverStyle.th}>Handovered Amount</th>
                    {/* Modified by - Ashish Dewangan on 09-10-2024
                     * Reason - Renamed the field */}
                    {/* <th className={handoverStyle.th}>Manager Remark</th> */}
                    {/* <th className={handoverStyle.th}>Handover Remark</th> */}
                    {/* End of modification by - Ashish Dewangan on 09-10-2024
                     * Reason - Renamed the field */}
                    <th className={handoverStyle.th}>Handover To</th>
                    <th className={handoverStyle.th}>
                      Handover Amount Received
                    </th>
                    {/* Modified by - Ashish Dewangan on 24-10-2024
                     * Reason - Changes label */}
                    {/* <th className={handoverStyle.th}>Amount Difference</th> */}
                    {/* commented and modify by akanksha on 11th nov to modify the column name */}
                    {/* <th className={handoverStyle.th}>Handover Difference</th> */}
                    <th className={handoverStyle.th}>
                      Handover Amount Difference
                    </th>
                    {/* end of comment and modification by akanksha on 11th nov to modify the column name */}
                    {/* End of modification by - Ashish Dewangan on 24-10-2024
                     * Reason - Changes label */}
                    {/* Added by - Ashish Dewangan on 05-10-2024
                     * Reason - To show total expensed and total received amount */}
                    <th className={handoverStyle.th}>Payments Received</th>
                    <th className={handoverStyle.th}>Advance Amount Recieved</th>
                    <th className={handoverStyle.th}>Expensed Amount</th>
                    {/* End of addition by - Ashish Dewangan on 05-10-2024
                     * Reason - To show total expensed and total received amount */}

                    {/* Added by - Ashish Dewangan on 06-10-2024
                     * Reason - To show total refunded  */}
                    <th className={handoverStyle.th}>Refunded Amount</th>
                    {/* End of addition by - Ashish Dewangan on 06-10-2024
                     * Reason - To show total refunded  */}

                    {/* Added by - Ashish Dewangan on 24-10-2024
                     * Reason - To show amount difference  */}
                    <th className={handoverStyle.th}>Amount Difference</th>
                    {/* End of addition by - Ashish Dewangan on 24-10-2024
                     * Reason -  To show amount difference  */}

                    {/* <th className={handoverStyle.th}>Handover To</th> */}
                    <th className={handoverStyle.th}>Handover Remark</th>
                    {/* <th className={handoverStyle.th}>
                      Handover Amount Received
                    </th> */}
                    {/* Added by - Ashish Dewangan on 09-10-2024
                     * Reason - To show handover receiver's remark */}
                    <th className={handoverStyle.th}>
                      Handover Receiver's Remark
                    </th>
                    {/* End of addition by - Ashish Dewangan on 09-10-2024
                     * Reason - To show handover receiver's remark */}
                    {/* added by akanksha on 28th oct, Reason to make date and time in single line */}
                    <th
                      className={handoverStyle.th}
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      Date & Time
                    </th>
                    {/* end by akanksha on 28th oct, Reason to make date and time in single line */}
                    {/**
                     * Added by - Ashish Dewangan on 10-10-2024
                     * Reason - Added amount difference column in handovers table
                     */}
                    {/* <th className={handoverStyle.th}>Amount Difference</th> */}
                    {/**
                     * End of addition by - Ashish Dewangan on 10-10-2024
                     * Reason - Added amount difference column in handovers table
                     */}

                    <th className={handoverStyle.th}>Admin Remark</th>

                    <th className={handoverStyle.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {handovers.map((handover, index) => {
                    var diff =
                      handover.handover_amount &&
                      handover.handover_amount_received
                        ? Math.abs(
                            handover.handover_amount -
                              handover.handover_amount_received
                          )
                        : 0;

                    /**
                     * Added by - Ashish Dewangan on 24-10-2024
                     * Reason - To calculate amount difference
                     */
                    var amount_diff =
                      handover.handover_amount != undefined &&
                      handover.handover_amount != null &&
                      handover.received_amount != undefined &&
                      handover.received_amount != null &&
                      handover.refunded_amount != undefined &&
                      handover.refunded_amount != null &&
                      handover.expensed_amount != undefined &&
                      handover.expensed_amount != null
                        ? Math.abs(
                            handover.handover_amount -
                              Math.abs(
                                handover.received_amount -
                                  Math.abs(
                                    handover.expensed_amount +
                                      handover.refunded_amount
                                  )
                              )
                          )
                        : 0;
                    /**
                     * End of addition by - Ashish Dewangan on 24-10-2024
                     * Reason - To calculate amount difference
                     */
                    return (
                      <tr key={index}>
                        <td className={handoverStyle.td}>{index + 1}</td>
                        <td className={handoverStyle.td}>
                          {handover.user_email}
                        </td>
                        <td className={handoverStyle.td}>
                          {handover.handover_amount}
                        </td>
                        {/* <td
                          className={handoverStyle.td}
                          style={{ width: "200px" }}
                        >
                          {handover.manager_remark}
                        </td> */}
                        <td className={handoverStyle.td}>
                          {handover.handover_to_email}
                        </td>

                        <td className={handoverStyle.td}>
                          {handover.handover_amount_received}
                        </td>
                        <td className={handoverStyle.td}>
                          <span
                            style={{
                              backgroundColor: diff > 0 ? "#f44336" : "",
                              color: diff > 0 ? "white" : "",
                              borderRadius: diff > 0 ? "4px" : "0",
                              padding: diff > 0 ? "4px 6px" : "0",
                            }}
                          >
                            {diff}
                          </span>
                        </td>
                        {/* Added by - Ashish Dewangan on 05-10-2024
                         * Reason - To show total expensed and total received amount */}
                        <td className={handoverStyle.td}>
                          {handover.received_amount}
                        </td>

                        <td className={handoverStyle.td}>
                          {handover.advance_payment}
                        </td>

                        <td className={handoverStyle.td}>
                          {handover.expensed_amount}
                        </td>
                        {/* End of addition by - Ashish Dewangan on 05-10-2024
                         * Reason - To show total expensed and total received amount */}

                        {/* Added by - Ashish Dewangan on 06-10-2024
                         * Reason - To show total refunded  */}
                        <td className={handoverStyle.td}>
                          {handover.refunded_amount}
                        </td>
                        {/* End of addition by - Ashish Dewangan on 06-10-2024
                         * Reason - To show total refunded  */}

                        {/* Added by - Ashish Dewangan on 24-10-2024
                         * Reason - To amount difference  */}
                        <td className={handoverStyle.td}>
                          <span
                            style={{
                              backgroundColor: amount_diff > 0 ? "#f44336" : "",
                              color: amount_diff > 0 ? "white" : "",
                              borderRadius: amount_diff > 0 ? "4px" : "0",
                              padding: amount_diff > 0 ? "4px 6px" : "0",
                            }}
                          >
                            {amount_diff}
                          </span>
                        </td>
                        {/* End of addition by - Ashish Dewangan on 24-10-2024
                         * Reason - To show amount difference  */}

                        {/* <td className={handoverStyle.td}>
                          {handover.handover_to_email}
                        </td> */}
                        <td
                          className={handoverStyle.td}
                          style={{ width: "200px" }}
                        >
                          {handover.manager_remark}
                        </td>
                        {/* <td className={handoverStyle.td}>
                          {handover.handover_amount_received}
                        </td> */}
                        {/* Added by - Ashish Dewangan on 09-10-2024
                         * Reason - To show handover receiver's remark */}
                        <td className={handoverStyle.td}>
                          {handover.receiver_manager_remark}
                        </td>
                        {/* End of addition by - Ashish Dewangan on 09-10-2024
                         * Reason - To show handover receiver's remark */}
                        <td
                          className={handoverStyle.td}
                          style={{ textAlign: "center", width: "100px" }}
                        >
                          {/* Modified by - Ashish Dewangan on 05-10-2024
                        Reason - To format date */}
                          {/* {new Date(handover.created_at).toLocaleDateString(
                          "en-GB"
                        )} */}
                          {new Date(handover.created_at)
                            .toLocaleDateString("en-GB")
                            .replace(/\//g, "-")}{" "}
                          {/* End of modification by - Ashish Dewangan on 05-10-2024
                        Reason - To format date */}
                          {new Date(handover.created_at).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            }
                          )}
                        </td>
                        {/* End of Modified the code by akanksha on 16-10-2024,
                          Reason to rearrange the column name and data */}
                        {/**
                         * Added by - Ashish Dewangan on 10-10-2024
                         * Reason - Added amount difference column in handovers table
                         */}
                        {/* <td className={handoverStyle.td}>
                          <span
                            style={{
                              backgroundColor: diff > 0 ? "#f44336" : "",
                              color: diff > 0 ? "white" : "",
                              borderRadius: diff > 0 ? "4px" : "0",
                              padding: diff > 0 ? "4px 6px" : "0",
                            }}
                          >
                            {diff}
                          </span>
                        </td> */}
                        {/**
                         * End of addition by - Ashish Dewangan on 10-10-2024
                         * Reason - Added amount difference column in handovers table
                         */}

                        <td
                          className={handoverStyle.td}
                          style={{ width: "200px" }}
                        >
                          {handover.admin_remark}
                        </td>

                        <td className={handoverStyle.td}>
                          <FaEdit
                            style={{ cursor: "pointer", color: "#f79330" }}
                            onClick={() => handleEdit(handover)}
                          />

                          {user.is_superuser && (
                            <>
                              &nbsp; &nbsp; &nbsp;
                              <MdDelete
                                style={{ cursor: "pointer", color: " #EB0B0B" }}
                                onClick={() => handleDelete(handover.id)}
                              />
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={handoverStyle.contentNotFoundText}>
              No Handovers available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HandoverForm;
