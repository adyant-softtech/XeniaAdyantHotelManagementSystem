/**Creation of module by Tejasve Gupta on 19-06-2024*/
// Modification and addition by Om Shrivastava on 21-08-2024
import React, { useContext, useEffect, useState } from "react";
import expenseStyle from "./Expense.module.css";
import {
  postExpenseDetailsApi,
  getAllUserDetailsApi,
  getExpenseDetailsApi,
  editExpenseDetailsApi,
  deleteExpenseDetailsApi,
} from "../../Api/services";
import { checkIsEmpty } from "../../utils/validations";
import { GlobalContext } from "../../context/Context";
import { MdDelete } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import { Grid, TextField, Button } from "@mui/material";
import { styled } from "@mui/system";
// Created by akanksha on 23rd Oct 2024,
// reason : to disable scroll-to-change functionality for all input[type=number] fields
import {
  disableScrollForNumberInputs,
  cleanupScrollDisable,
} from "../../utils/InputUtils";
import { FiArrowLeft } from "react-icons/fi";
// End by akanksha on 23rd Oct 2024,
// reason : to disable scroll-to-change functionality for all input[type=number] fields

const ExpenseForm = () => {
  const { user, tenant } = useContext(GlobalContext);
  const [userName, setUserName] = useState("");
  const [allUsersName, setAllUsersName] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState(null); // To track which expense is being edited

  const [filteredExpenses, setFilteredExpenses] = useState(expenses);
  const [selectedExpenseType, setSelectedExpenseType] = useState("");

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
    name: "",
    amount: "",
    date: new Date().toISOString().split("T")[0], // Set current date
    time: new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    paid_to: userName,
    paid_by: "",
    expense_type: "",
    payment_type: "Cash",
    quantity: "",
    description: "",
    /**
     * Added by - Ashish Dewangan on 02-09-2024
     * Reason - To send who have created this expense in backend
     */
    user: user.email,
    /**
     * End of addition by - Ashish Dewangan on 02-09-2024
     * Reason - To send who have created this expense in backend
     */

    /**
     * Added by - Ashish Dewangan on 03-10-2024
     * Reason - Added admin remark field in form data
     */
    admin_remark: "",
    /**
     * End of addition by - Ashish Dewangan on 03-10-2024
     * Reason - Added admin remark field in form data
     */
  });

  const [errors, setErrors] = useState({
    amount: "",
    date: "",
    time: "",
    paid_to: "",
    paid_by: "",
    expense_type: "",
    user: "",
    name: "",
    /**
     * Added by - Ashish Dewangan on 03-10-2024
     * Reason - Added admin remark field in form data
     */
    admin_remark: "",
    /**
     * End of addition by - Ashish Dewangan on 03-10-2024
     * Reason - Added admin remark field in form data
     */
  });

  /**
   * Added by - Ashish Dewangan on 11-10-2024
   * Reason - created filter variable
   */
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
  /**
   * End of addition by - Ashish Dewangan on 11-10-2024
   * Reason - created filter variable
   */

  /**
   * Added by - Ashish Dewangan on 11-10-2024
   * Reason - to create style for date input box
   */
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
  /**
   * End of addition by - Ashish Dewangan on 11-10-2024
   * Reason - to create style for date input box
   */

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

  // This method set the first name in paid to field
  useEffect(() => {
    setFormData((prevState) => ({
      ...prevState,
      paid_to: user?.first_name || "Admin",
    }));
  }, [user?.first_name]);

  // This method when page is load, and set the all user details
  useEffect(() => {
    const getAllUserDetails = async () => {
      try {
        const access = localStorage.getItem("access");
        const data = await getAllUserDetailsApi(access, tenant);
        setAllUsersName(data?.user || []);
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    getAllUserDetails();
  }, []);

  // This method when page is load, and set the all expenses details

  /**
   * Modified by - Ashish Dewangan on 11-10-2024
   * Reason - to get expense list according to selected date
   */
  // useEffect(() => {
  //   const fetchExpenseDetails = async () => {
  //     setLoading(true);
  //     try {
  //       const access = localStorage.getItem("access");
  //       const response = await getExpenseDetailsApi(access);
  //       setExpenses(response);
  //     } catch (error) {
  //       console.error("Error fetching expense details:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchExpenseDetails();
  // }, []);

  useEffect(() => {
    const fetchExpenseDetails = async () => {
      setLoading(true);
      try {
        const access = localStorage.getItem("access");
        const response = await getExpenseDetailsApi(access, filterConditions, tenant);
        setExpenses(response);
      } catch (error) {
        console.error("Error fetching expense details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenseDetails();
  }, [filterConditions]);
  /**
   * End of modification by - Ashish Dewangan on 11-10-2024
   * Reason - to get expense list according to selected date
   */

  // This method helps to update the value of paid by field
  const handleSelectChange = (e) => {
    setFormData({
      ...formData,
      paid_by: e.target.value,
    });
  };

  // This method helps to update the value of name by field
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

  const setTodayDate = () => {
    const today = new Date().toISOString().split("T")[0];
    setFormData((prevState) => ({
      ...prevState,
      date: today,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      date: "",
    }));
  };

  const setCurrentTime = () => {
    const now = new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
    setFormData((prevState) => ({
      ...prevState,
      time: now,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      time: "",
    }));
  };

  // Set the validation messages
  const isValidOnBlur = (input, value) => {
    let isValid = true;
    let errorMessage = "";

    switch (input) {
      case "name":
        if (checkIsEmpty(value)) {
          errorMessage = "Please enter Expense Name";
          isValid = false;
        }
        break;
      case "amount":
        if (checkIsEmpty(value)) {
          errorMessage = "Please enter Amount";
          isValid = false;
        }
        break;
      case "expense_type":
        if (checkIsEmpty(value)) {
          errorMessage = "Please select Expense Type";
          isValid = false;
        }
        break;
      case "date":
        if (checkIsEmpty(value)) {
          errorMessage = "Please select Date";
          isValid = false;
        }
        break;
      // if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      //   errorMessage =
      //     "Date has wrong format. Use one of these formats instead: YYYY-MM-DD.";
      //   isValid = false;
      // }
      // break;
      case "time":
        if (checkIsEmpty(value)) {
          errorMessage = "Please select Time";
          isValid = false;
        }
        break;
      // if (!/^\d{2}:\d{2}(?::\d{2})?$/.test(value)) {
      //   errorMessage =
      //     "Time has wrong format. Use one of these formats instead: hh:mm[:ss[.uuuuuu]].";
      //   isValid = false;
      // }
      // break;

      /**
       * Added by - Ashish Dewangan on 03-10-2024
       * Reason - Added validation for admin remark
       */
      case "admin_remark":
        if (checkIsEmpty(value)) {
          errorMessage = "Please enter remark";
          isValid = false;
        }
        break;
      /**
       * End of addition by - Ashish Dewangan on 03-10-2024
       * Reason - Added validation for admin remark
       */
      default:
        break;
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [input]: errorMessage,
    }));

    return isValid;
  };

  // Handle the validations, and also apply the api of POST the expense form data
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields on submit
    /**
     * Modified by - Ashish Dewangan on 03-10-2024
     * Reason - To make admin_remark mandatory if admin is editing it
     */
    // const fields = ["name", "amount", "expense_type", "date", "time" ];
    const fields = [
      "name",
      "amount",
      "expense_type",
      "date",
      "time",
      user?.is_superuser && editingExpenseId && "admin_remark",
    ];
    /**
     * End of modification by - Ashish Dewangan on 03-10-2024
     * Reason - To make admin_remark mandatory if admin is editing it
     */
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
      if (editingExpenseId) {
        // Edit existing expense
        await editExpenseDetailsApi(accessToken, editingExpenseId, formData, tenant);
      } else {
        // Add new expense
        await postExpenseDetailsApi(accessToken, formData, tenant);
      }

      setFormData({
        name: "",
        amount: "",
        date: "",
        time: "",
        paid_to: formData.paid_to,
        paid_by: "",
        expense_type: "",
        payment_type: "Cash",
        quantity: "",
        description: "",
        /**
         * Added by - Ashish Dewangan on 02-09-2024
         * Reason - To send who have created this expense in backend
         */
        user: user.email,
        /**
         * End of addition by - Ashish Dewangan on 02-09-2024
         * Reason - To send who have created this expense in backend
         */
        /**
         * Added by - Ashish Dewangan on 03-10-2024
         * Reason - Added admin remark field in form data
         */
        admin_remark: "",
        /**
         * End of addition by - Ashish Dewangan on 03-10-2024
         * Reason - Added admin remark field in form data
         */
      });

      // Reset error states
      setErrors({
        amount: "",
        date: "",
        time: "",
        expense_type: "",
        user: "",
        name: "",
        /**
         * Added by - Ashish Dewangan on 03-10-2024
         * Reason - Added admin remark validation error
         */
        admin_remark: "",
        /**
         * End of addition by - Ashish Dewangan on 03-10-2024
         * Reason - Added admin remark validation error
         */
      });

      const fetchExpenseDetails = async () => {
        setLoading(true);
        try {
          /**
           * Modified by - Ashish Dewangan on 12-10-2024
           * Reason - to get latest expense list after an expense is saved using filter condition
           */
          // const response = await getExpenseDetailsApi(accessToken);
          const response = await getExpenseDetailsApi(
            accessToken,
            filterConditions,
            tenant
          );
          /**
           * End of modification by - Ashish Dewangan on 12-10-2024
           * Reason - to get latest expense list after an expense is saved using filter condition
           */
          setExpenses(response);
        } catch (error) {
          console.error("Error fetching expense details:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchExpenseDetails();
      setEditingExpenseId(null); // Reset editing state after successful operation
    } catch (error) {
      console.error("Failed to save expense:", error);
    }
  };

  const handleEdit = (expense) => {
    /**
     * Added by - Ashish Dewangan on 11-10-2024
     * Reason - To move to the top of the page when edit icon is clicked
     */
    window.scrollTo(0, 0);
    /**
     * End of addition by - Ashish Dewangan on 11-10-2024
     * Reason - To move to the top of the page when edit icon is clicked
     */
    setFormData({
      name: expense.name,
      amount: expense.amount,
      date: expense.date,
      time: expense.time,
      paid_to: expense.paid_to,
      paid_by: expense.paid_by,
      expense_type: expense.expense_type,
      payment_type: expense.payment_type,
      quantity: expense.quantity,
      description: expense.description,
      /**
       * Added by - Ashish Dewangan on 02-09-2024
       * Reason - To send who have created this expense in backend
       */
      user: user.email,
      /**
       * End of addition by - Ashish Dewangan on 02-09-2024
       * Reason - To send who have created this expense in backend
       */
      /**
       * Added by - Ashish Dewangan on 03-10-2024
       * Reason - to set value in admin remark field
       */
      admin_remark: expense.admin_remark,
      /**
       * End of addition by - Ashish Dewangan on 03-10-2024
       * Reason - to set value in admin remark field
       */
    });
    setEditingExpenseId(expense.id); // Set the id of the expense being edited
  };

  const handleDelete = async (id) => {
    const accessToken = localStorage.getItem("access");
    try {
      await deleteExpenseDetailsApi(accessToken, id, tenant);
      setExpenses((prevExpenses) =>
        prevExpenses.filter((expense) => expense.id !== id)
      );
    } catch (error) {
      console.error("Failed to delete expense:", error);
    }
  };

  useEffect(() => {
    if (selectedExpenseType === "") {
      // Show all expenses if 'All' is selected or no filter is applied
      setFilteredExpenses(expenses);
    } else {
      // Filter expenses based on selected type
      setFilteredExpenses(
        expenses.filter(
          (expense) => expense.expense_type === selectedExpenseType
        )
      );
    }
  }, [selectedExpenseType, expenses]);

  const handleFilterChange = (e) => {
    setSelectedExpenseType(e.target.value);
  };

  /**
   * Added by - Ashish Dewangan on 11-10-2024
   * Reason - to set filter value in variable when user selects a filter condition
   */
  const handleFilterConditionChange = (e) => {
    const { name, value } = e.target;
    setFilterConditions((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    
  };
  /**
   * End of addition by - Ashish Dewangan on 11-10-2024
   * Reason - to set filter value in variable when user selects a filter condition
   */

  useEffect(() => {
    const currentDate = new Date(
      new Date().toLocaleString("en-Us", { timeZone: "Asia/Kolkata" })
    );
    setFormData((prevState) => ({
      ...prevState,
      date: currentDate.toISOString().split("T")[0],
      time: currentDate.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));
  }, [formData]);

  return (
    <div className={expenseStyle.pageFrame}>
      <div className={expenseStyle.header}>
        {/* Modification and addition by Om Shrivastava on 03-01-2025
            Reason : Add back icon  */}
        <FiArrowLeft className="backIcon" onClick={handleBackClick} />
        Expense Details
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
      <div className={expenseStyle.pageContainer}>
        <fieldset className={expenseStyle.expForm}>
          <legend className={expenseStyle.expDetailsTitle}>Expense</legend>
          <form className={expenseStyle.formContainer} onSubmit={handleSubmit}>
            <div className={expenseStyle.divContainer}>
              <div className={expenseStyle.childContainer1}>
                <div className={expenseStyle.formGroup}>
                  <div className={expenseStyle.labelColon}>
                    <div className={expenseStyle.labelContainer}>
                      <div className={expenseStyle.mandatoryField}>*</div>
                      <label htmlFor="expense_type">Expense Type</label>
                    </div>
                  </div>
                  <div className={expenseStyle.inputContainer}>
                    <select
                      style={{ width: "71%" }}
                      className={expenseStyle.inputSection}
                      id="expense_type"
                      name="expense_type"
                      value={formData.expense_type}
                      onChange={handleChange}
                      onBlur={(e) =>
                        isValidOnBlur("expense_type", e.target.value)
                      }
                    >
                      <option value="">Select Expense Type</option>
                      {/* <option value="General expenses">General expenses</option> */}
                      {/* Modified by - Ashish Dewangan on 23-09-2024
                      Reason - Removed transportation expenses and added commission
                      expenses option in dropdown */}
                      {/* <option value="Transportation expenses">
                        Transportation expenses
                      </option> */}
                      {/* <option value="Commission expenses">
                        Commission expenses
                      </option> */}
                      {/* End of modification by - Ashish Dewangan on 23-09-2024
                      Reason - Removed transportation expenses and added commission
                      expenses option in dropdown */}
                      {/* <option value="Salary Expenses">Salary Expenses</option> */}
                      {/* Modified by - Ashish Dewangan on 23-09-2024
                      Reason - To hide miscellaneous expenses and show special expenses */}
                      {/* <option value="Miscellaneous Expenses">
                        Miscellaneous Expenses
                      </option> */}
                      {/* <option value="Special Expenses">Special Expenses</option> */}
                      {/* End of modification by - Ashish Dewangan on 23-09-2024
                      Reason - To hide miscellaneous expenses and show special expenses */}

                      {/* Added by - Ashish Dewangan on 05-10-2024
                       * Reason - Added more expenses as specified by the client */}
                      <option value="Accounting expenses">
                        Accounting expenses
                      </option>
                      <option value="Cleaning expenses">
                        Cleaning expenses
                      </option>
                      <option value="Electricity expenses">
                        Electricity expenses
                      </option>
                      <option value="Entertainment expenses">
                        Entertainment expenses
                      </option>
                      <option value="Maintenance expenses">
                        Maintenance expenses
                      </option>
                      <option value="Miscellaneous expenses">
                        Miscellaneous expenses
                      </option>
                      <option value="Newspaper bill expenses">
                        Newspaper bill expenses
                      </option>
                      <option value="Staff advance expenses">
                        Staff advance expenses
                      </option>
                      <option value="Stationary expenses">
                        Stationary expenses
                      </option>
                      <option value="Taxi commission">Taxi commission</option>
                      <option value="Telephone expenses">
                        Telephone expenses
                      </option>
                      <option value="Others">Others</option>
                      {/* Added by - Ashish Dewangan on 05-10-2024
                       * Reason - Added more expenses as specified by the client */}
                    </select>
                    <div className={expenseStyle.formInputError}>
                      {errors.expense_type}
                    </div>
                  </div>
                </div>

                <div className={expenseStyle.formGroup}>
                  <div className={expenseStyle.labelColon}>
                    <div className={expenseStyle.labelContainer}>
                      <div className={expenseStyle.mandatoryField}>*</div>
                      <label htmlFor="name">Expense Name</label>
                    </div>
                  </div>
                  <div className={expenseStyle.inputContainer}>
                    <input
                      className={expenseStyle.inputSection}
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      onBlur={(e) => isValidOnBlur("name", e.target.value)}
                    />
                    <div className={expenseStyle.formInputError}>
                      {errors.name}
                    </div>
                  </div>
                </div>

                <div className={expenseStyle.formGroup}>
                  <div className={expenseStyle.labelColon}>
                    <div
                      className={expenseStyle.labelContainer}
                      style={{ marginLeft: "5.3%" }}
                    >
                      {/* <div className={expenseStyle.mandatoryField}>*</div> */}
                      <label htmlFor="quantity">Quantity</label>
                    </div>
                    {/* <span>:</span> */}
                  </div>
                  <div className={expenseStyle.inputContainer}>
                    <input
                      className={expenseStyle.inputSection}
                      type="number"
                      id="quantity"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      onBlur={(e) => isValidOnBlur("quantity", e.target.value)}
                    />
                    {/* <div className={expenseStyle.formInputError}>
                      {quantityError}
                    </div> */}
                  </div>
                </div>

                <div className={expenseStyle.formGroup}>
                  <div className={expenseStyle.labelColon}>
                    <div className={expenseStyle.labelContainer}>
                      <div className={expenseStyle.mandatoryField}>*</div>
                      <label htmlFor="amount">Amount</label>
                    </div>
                  </div>

                  <div className={expenseStyle.inputContainer}>
                    <input
                      className={expenseStyle.inputSection}
                      type="number"
                      id="amount"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      onBlur={(e) => isValidOnBlur("amount", e.target.value)}
                    />
                    <div className={expenseStyle.formInputError}>
                      {errors.amount}
                    </div>
                  </div>
                </div>

                <div className={expenseStyle.formGroup}>
                  <div className={expenseStyle.labelColon}>
                    <div
                      className={expenseStyle.labelContainer}
                      style={{ marginLeft: "5.3%" }}
                    >
                      {/* <div className={expenseStyle.mandatoryField}>*</div> */}
                      <label htmlFor="name">
                        {/* Modification and addition by Om Shrivastava on 03-01-2025
                      Reason : Change the name */}
                        {/* Description */}
                        Remark/Description
                        {/* End of modification and addition by Om Shrivastava on 03-01-2025
                      Reason : Change the name */}
                      </label>
                    </div>
                    {/* <span>:</span> */}
                  </div>
                  <div className={expenseStyle.inputContainer}>
                    <textarea
                      className={expenseStyle.inputSection}
                      type="text"
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      style={{ resize: "none" }}
                      maxLength="98"
                      onBlur={(e) =>
                        isValidOnBlur("description", e.target.value)
                      }
                    />
                    <div className={expenseStyle.formInputError}>
                      {/* {userError} */}
                    </div>
                  </div>
                </div>
              </div>
              <div className={expenseStyle.childContainer2}>
                <div className={expenseStyle.formGroup}>
                  <div className={expenseStyle.labelColon}>
                    <div className={expenseStyle.labelContainer}>
                      <div className={expenseStyle.mandatoryField}>*</div>
                      <label htmlFor="date">Date & Time</label>
                    </div>
                  </div>
                  <div
                    className={expenseStyle.inputContainer}
                    style={{ gap: "2px" }}
                  >
                    <input
                      className={expenseStyle.inputSection}
                      style={{ width: "42%" }}
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      onBlur={(e) => isValidOnBlur("date", e.target.value)}
                    />
                    {/* <button
                      className={expenseStyle.button}
                      type="button"
                      onClick={setTodayDate}
                    >
                      Today
                    </button> */}
                    <input
                      className={expenseStyle.inputSection}
                      style={{
                        width: "42%",
                        height: "17.5px",
                        marginLeft: "4px",
                      }}
                      type="time"
                      id="time"
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      onBlur={(e) => isValidOnBlur("time", e.target.value)}
                    />
                    <div
                      style={{
                        display: "flex",
                        gap: "12%",
                      }}
                    >
                      <div className={expenseStyle.formInputError}>
                        {errors.date}
                      </div>
                      <div className={expenseStyle.formInputError}>
                        {errors.time}
                      </div>
                    </div>
                  </div>
                </div>
                {/* <div className={expenseStyle.formGroup}>
                  <div className={expenseStyle.labelColon}>
                    <div className={expenseStyle.labelContainer}>
                      <label htmlFor="time">Time</label>
                    </div>
                  </div>
                  <div className={expenseStyle.inputContainer}>
                    <input
                      className={expenseStyle.inputSection}
                      type="time"
                      id="time"
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      onBlur={(e) => isValidOnBlur("time", e.target.value)}
                    />
                    <button
                      className={expenseStyle.button}
                      type="button"
                      onClick={setCurrentTime}
                    >
                      Current Time
                    </button>
                    <div className={expenseStyle.formInputError}>
                      {errors.time}
                    </div>
                  </div>
                </div> */}

                <div className={expenseStyle.formGroup}>
                  <div className={expenseStyle.labelColon}>
                    <div
                      className={expenseStyle.labelContainer}
                      style={{ marginLeft: "5.3%" }}
                    >
                      {/* <div className={expenseStyle.mandatoryField}>*</div> */}
                      <label htmlFor="paid_to">Create by</label>
                    </div>
                    {/* <span>:</span> */}
                  </div>
                  <div className={expenseStyle.inputContainer}>
                    <input
                      className={expenseStyle.inputSection}
                      type="text"
                      id="paid_to"
                      name="paid_to"
                      value={formData.paid_to}
                      // value={userName}
                      // onChange={handleChange}
                      onBlur={(e) => isValidOnBlur("paid_to", e.target.value)}
                    />
                    <div className={expenseStyle.formInputError}>
                      {/* {paidToError} */}
                    </div>
                  </div>
                </div>
                <div className={expenseStyle.formGroup}>
                  <div className={expenseStyle.labelColon}>
                    <div
                      className={expenseStyle.labelContainer}
                      style={{ marginLeft: "5.3%" }}
                    >
                      {/* <div className={expenseStyle.mandatoryField}>*</div> */}
                      <label htmlFor="paid_by">Paid By</label>
                    </div>
                    {/* <span>:</span> */}
                  </div>
                  <div className={expenseStyle.inputContainer}>
                    <select
                      className={expenseStyle.inputSection}
                      style={{ width: "71%" }}
                      id="paid_by"
                      value={formData.paid_by}
                      onChange={handleSelectChange}
                      // onBlur={(e) =>
                      //   isValidOnBlur("paid_by", e.target.value)
                      // }
                    >
                      <option value="">Select User</option>
                      {Array.isArray(allUsersName) &&
                        allUsersName.map((user, index) => (
                          <option
                            key={index}
                            value={user.first_name || "Admin"}
                          >
                            {user.first_name || "Admin"}
                          </option>
                        ))}
                    </select>

                    <div className={expenseStyle.formInputError}>
                      {/* {paidByError} */}
                    </div>
                  </div>
                </div>

                <div className={expenseStyle.formGroup}>
                  <div className={expenseStyle.labelColon}>
                    <div
                      className={expenseStyle.labelContainer}
                      style={{ marginLeft: "5.3%" }}
                    >
                      {/* <div className={expenseStyle.mandatoryField}>*</div> */}
                      <label htmlFor="payment_type">Payment Type</label>
                    </div>
                    {/* <span>:</span> */}
                  </div>
                  <div className={expenseStyle.inputContainer}>
                    <select
                      className={expenseStyle.inputSection}
                      style={{ width: "71%" }}
                      id="payment_type"
                      name="payment_type"
                      value={formData.payment_type}
                      onChange={handleChange}
                      onBlur={(e) =>
                        isValidOnBlur("payment_type", e.target.value)
                      }
                    >
                      {/* Commented by akanksha on 23rd Oct,
                      Reason : to fix enhancement no 35 */}
                      {/* <option value="">Select Payment Type</option> */}
                      <option value="Cash">Cash</option>
                      <option value="Cheque">Cheque</option>
                      <option value="Online">Online</option>
                    </select>
                    <div className={expenseStyle.formInputError}>
                      {/* {expenseTypeError} */}
                    </div>
                  </div>
                </div>

                {/*  Added by - Ashish Dewangan on 03-10-2024
                Reason - Added admin remark input box */}
                {user?.is_superuser && editingExpenseId && (
                  <div className={expenseStyle.formGroup}>
                    <div className={expenseStyle.labelColon}>
                      {user?.is_superuser && editingExpenseId && (
                        <div className={expenseStyle.mandatoryField}>*</div>
                      )}
                      <div
                        className={expenseStyle.labelContainer}
                        style={{
                          marginLeft:
                            user?.is_superuser && editingExpenseId
                              ? ""
                              : "5.3%",
                        }}
                      >
                        <label htmlFor="name">Admin Remark</label>
                      </div>
                    </div>
                    <div className={expenseStyle.inputContainer}>
                      <textarea
                        className={expenseStyle.inputSection}
                        type="text"
                        id="admin_remark"
                        name="admin_remark"
                        value={formData.admin_remark}
                        onChange={handleChange}
                        style={{ resize: "none" }}
                        maxLength="254"
                        onBlur={(e) =>
                          isValidOnBlur("admin_remark", e.target.value)
                        }
                        disabled={
                          user?.is_superuser && editingExpenseId ? false : true
                        }
                      />
                      <div className={expenseStyle.formInputError}>
                        {errors.admin_remark}
                      </div>
                    </div>
                  </div>
                )}
                {/*  End of addition by - Ashish Dewangan on 03-10-2024
                Reason - Added admin remark input box */}
              </div>
              {/* Add your existing form elements here */}
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <button
                type="submit"
                // className={expenseStyle.submitButton}
                className={`${expenseStyle.submitButton} submitButton`}
              >
                {editingExpenseId ? "Update Expense" : "Add Expense"}
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
            style={{ position: "relative", marginBottom: "16px" }}
          >
            <Grid item>
              {/* <StyledTextField
                label="Date"
                type="date"
                name="date"
                
                // added by akanksha on 21nov, to handle the pevious date
                // value={filterConditions.date || new Date().toISOString().split('T')[0]}
                value={
                  filterConditions.date ||
                  new Date(
                    new Date().getTime() -
                      new Date().getTimezoneOffset() * 60000
                  )
                    .toISOString()
                    .split("T")[0]
                }
                // value={filterConditions.date}
                // added by akanksha on 21nov, to handle the pevious date
                InputLabelProps={{
                  shrink: true,
                }}
                onChange={handleFilterConditionChange}
                variant="outlined"
              /> */}
              <TextField
                label="Date"
                type="date"
                name="date"
                // value={filterConditions.date || new Date().toISOString().split("T")[0]}
                value={
                  filterConditions.date ||
                  new Date(
                    new Date().getTime() -
                      new Date().getTimezoneOffset() * 60000
                  )
                    .toISOString()
                    .split("T")[0]
                }
                onChange={handleFilterConditionChange}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
              />

            </Grid>

            <Grid item width={"50%"}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",

                  // paddingLeft:'8.5%',
                  fontWeight: "600",
                  color: "black",
                }}
              >
                Filteration by Expense type : &nbsp;&nbsp;&nbsp;
                <select
                  style={{ width: "40%" }}
                  className={expenseStyle.inputSection}
                  id="expense_type"
                  name="expense_type"
                  value={selectedExpenseType}
                  onChange={handleFilterChange}
                >
                  <option value="">All</option>{" "}
                  {/* Option for showing all expenses */}
                  {/* <option value="General expenses">General expenses</option> */}
                  {/* Modified by - Ashish Dewangan on 23-09-2024
              Reason - Removed transportation expenses and added commission
              expenses option in dropdown */}
                  {/* <option value="Transportation expenses">
                Transportation expenses
              </option> */}
                  {/* <option value="Commission expenses">Commission expenses</option> */}
                  {/* Modified by - Ashish Dewangan on 23-09-2024
              Reason - Removed transportation expenses and added commission
              expenses option in dropdown */}
                  {/* <option value="Salary Expenses">Salary Expenses</option> */}
                  {/* Modified by - Ashish Dewangan on 23-09-2024
              Reason - To hide miscellaneous expenses and show special expenses */}
                  {/* <option value="Miscellaneous Expenses">
                Miscellaneous Expenses
              </option> */}
                  {/* <option value="Special Expenses">Special Expenses</option> */}
                  {/* End of modification by - Ashish Dewangan on 23-09-2024
              Reason - To hide miscellaneous expenses and show special expenses */}
                  {/* Added by - Ashish Dewangan on 05-10-2024
                   * Reason - Added more expenses as specified by the client */}
                  <option value="Accounting expenses">
                    Accounting expenses
                  </option>
                  <option value="Cleaning expenses">Cleaning expenses</option>
                  <option value="Electricity expenses">
                    Electricity expenses
                  </option>
                  <option value="Entertainment expenses">
                    Entertainment expenses
                  </option>
                  <option value="Maintenance expenses">
                    Maintenance expenses
                  </option>
                  <option value="Miscellaneous expenses">
                    Miscellaneous expenses
                  </option>
                  <option value="Newspaper bill expenses">
                    Newspaper bill expenses
                  </option>
                  <option value="Staff advance expenses">
                    Staff advance expenses
                  </option>
                  <option value="Stationary expenses">
                    Stationary expenses
                  </option>
                  <option value="Taxi commission">Taxi commission</option>
                  <option value="Telephone expenses">Telephone expenses</option>
                  <option value="Others">Others</option>
                  {/* End of addition by - Ashish Dewangan on 05-10-2024
                   * Reason - Added more expenses as specified by the client */}
                </select>
                &nbsp;&nbsp;&nbsp;
                {/* Modified by - Ashish Dewangan on 27-08-2024
            Reason - To make sure only superuser gets to see expense report */}
                {/* <div style={{ textAlign: "end", color: "blue" }}>
              <a href="/expense-report">Expense Report</a>
            </div> */}
                {
                  user.is_superuser && (
                    <div style={{ textAlign: "end", color: "blue" }}>
                      <a href="/expense-report">Expense Report</a>
                    </div>
                  )
                  /* End of modification by - Ashish Dewangan on 27-08-2024
            Reason - To make sure only superuser gets to see expense report */
                }
              </div>
            </Grid>
          </Grid>

          {loading ? (
            <div>Loading...</div>
          ) : filteredExpenses.length ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                paddingTop: "1%",
              }}
            >
              <table className={expenseStyle.table}>
                <thead>
                  <tr>
                    <th className={expenseStyle.th}>S.NO.</th>
                    <th className={expenseStyle.th}>Expense type</th>

                    <th className={expenseStyle.thData}>Expense Name</th>
                    <th className={expenseStyle.thQtyData}>Qty</th>

                    <th className={expenseStyle.th}>Amount</th>

                    <th
                      className={expenseStyle.thData}
                      style={{ width: "50px" }}
                    >
                      Date
                    </th>
                    <th className={expenseStyle.th}>Time</th>
                    {/* Modified by - Ashish Dewangan on 11-10-2024
                    Reason - To correct the spelling */}
                    {/* <th className={expenseStyle.th}>Create by</th> */}
                    <th className={expenseStyle.th}>Created by</th>
                    {/* End of modification by - Ashish Dewangan on 11-10-2024
                    Reason - To correct the spelling */}
                    <th className={expenseStyle.thData}>Paid by</th>
                    <th className={expenseStyle.th}>Payment Type</th>
                    <th className={expenseStyle.th}>
                      {/* Modification and addition by Om Shrivastava on 03-01-2025
                      Reason : Change the name */}
                      {/* Description */}
                      Remark/Description
                      {/* End of modification and addition by Om Shrivastava on 03-01-2025
                      Reason : Change the name */}
                    </th>
                    {/* Added by - Ashish Dewangan on 03-10-2024
                    Reason - Added admin remark label */}
                    <th className={expenseStyle.th}>Admin Remark</th>
                    {/* End of addition by - Ashish Dewangan on 03-10-2024
                    Reason - Added admin remark label */}

                    {/* Modified by - Ashish Dewangan on 03-10-2024
                     * Reason - To show edit and delete option only for superuser */}
                    {/* <th className={expenseStyle.th}>Actions</th> */}
                    {user.is_superuser && (
                      <th className={expenseStyle.th}>Actions</th>
                    )}
                    {/* End of modification by - Ashish Dewangan on 03-10-2024
                     * Reason - To show edit and delete option only for superuser */}
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((expense, index) => (
                    <tr key={index}>
                      <td className={expenseStyle.td}>{index + 1}</td>
                      <td className={expenseStyle.td}>
                        {expense.expense_type}
                      </td>
                      <td className={expenseStyle.td}>{expense.name}</td>

                      <td className={expenseStyle.td}>{expense.quantity}</td>
                      <td className={expenseStyle.td}>{expense.amount}</td>
                      <td
                        className={expenseStyle.td}
                        style={{ textAlign: "center", width: "50px" }}
                      >
                        {/* {expense.date} */}
                        {new Date(expense.date).toLocaleDateString("en-GB")}
                      </td>

                      <td className={expenseStyle.td}>{expense.time}</td>
                      <td className={expenseStyle.td}>{expense.paid_to}</td>
                      <td className={expenseStyle.td}>{expense.paid_by}</td>
                      <td className={expenseStyle.td}>
                        {expense.payment_type}
                      </td>

                      <td
                        className={expenseStyle.td}
                        style={{ width: "150px" }}
                      >
                        {expense.description}
                      </td>

                      {/* Added by - Ashish Dewangan on 03-10-2024
                      Reason - To show admin remark on expense list */}
                      <td
                        className={expenseStyle.td}
                        style={{ width: "200px" }}
                      >
                        {expense.admin_remark}
                      </td>
                      {/* End of addition by - Ashish Dewangan on 03-10-2024
                      Reason - To show admin remark on expense list */}

                      {/* Modified by - Ashish Dewangan on 03-10-2024
                       * Reason - To show edit and delete option only for superuser */}
                      {/* <td className={expenseStyle.td}>
                          <FaEdit
                            style={{ cursor: "pointer", color: "#f79330" }}
                            onClick={() => handleEdit(expense)}
                          />
                          &nbsp; &nbsp; &nbsp;
                          <MdDelete
                            style={{ cursor: "pointer", color: " #EB0B0B" }}
                            onClick={() => handleDelete(expense.id)}
                          />
                        </td> */}

                      {user.is_superuser && (
                        <td className={expenseStyle.td}>
                          <FaEdit
                            style={{ cursor: "pointer", color: "#f79330" }}
                            onClick={() => handleEdit(expense)}
                          />
                          &nbsp; &nbsp; &nbsp;
                          <MdDelete
                            style={{ cursor: "pointer", color: " #EB0B0B" }}
                            onClick={() => handleDelete(expense.id)}
                          />
                        </td>
                      )}
                      {/* End of modification by - Ashish Dewangan on 03-10-2024
                       * Reason - To show edit and delete option only for superuser */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                fontSize: "16px",
                fontWeight: "600",
                paddingTop: "2%",
                color: "black",
              }}
            >
              No Expenses available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseForm;
