/**Created By Tejasve GUpta on 24-05-2024
  Reason - Signup page
*/
import { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import signupStyle from "./Signup.module.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
  checkIfMinimumThanMinValue,
  checkIsEmailInvalid,
  checkIsEmpty,
  checkIsNotADigit,
  checkPasswordDontmatch,
  checkIfSmallerThanMinLength,
} from "../../utils/validations";
import { signup } from "../../Api/services";
import notificationObject from "../../components/Widgets/Notification/Notification";
import { GlobalContext } from "../../context/Context";

const Signup = (props) => {
  const navigate = useNavigate();
  const {  tenant } = useContext(GlobalContext);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [contactNumberError, setContactNumberError] = useState("");
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
  
  /**Code Addition by Tejasve Gupta on 13-06-2024
   reason - eye visibility for password
*/
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };
  /**End of Code Addition by Tejasve Gupta on 13-06-2024
   reason - eye visibility for password
*/
  /**
   * Added by - Ashish Dewangan on 23-05-2024
   * Reason - To navigate to home page if token does not exist
   */
  useEffect(() => {
    if (localStorage.getItem("access")) {
      navigate("/");
    }
  }, [navigate]);
  /**
   * End of addition by - Ashish Dewangan on 23-05-2024
   * Reason - To navigate to home page if token does not exist
   */

  /**
   * Added by - Ashish Dewangan on 23-05-2024
   * Reason - To validate input on blur
   */
  const isValidOnBlur = (input, value) => {
    if (input == "email") {
      if (checkIsEmpty(value)) {
        setEmailError("Please enter email address");
        return false;
      } else {
        if (checkIsEmailInvalid(value)) {
          setEmailError("Please enter valid email address");

          return false;
        }
      }
    }
    if (input === "password") {
      if (checkIsEmpty(value)) {
        setPasswordError("Please enter password");
        return false;
      } else {
        if (checkIfMinimumThanMinValue(value, 8)) {
          setPasswordError("Password must contain 8 characters");
          return false;
        }
      }
    }
    /**Code Added by Tejasve Gupta on 24-05-2024
     * reason - Adding Fields with Validation
     */
    if (input == "first_name") {
      if (checkIsEmpty(value)) {
        setFirstNameError("Please enter First Name");
        return false;
      }
    }
    if (input == "contact_number") {
      if (checkIsEmpty(value)) {
        setContactNumberError("Please enter Contact Number");
        return false;
      } else {
        if (checkIsNotADigit(value)) {
          /**Code Addition by by Tejasve Gupta on 15-06-2024
              reason - bugs fixed*/
          setContactNumberError("Please enter valid mobile number");
          /**End of Code Addition by by Tejasve Gupta on 15-06-2024
              reason - bugs fixed*/
          return false;
          /**Code Addition by Tejave Gupta on 20-06-2024
            reason - validationn added for phone number */
        } else {
          if (checkIfSmallerThanMinLength(value, 10)) {
            setContactNumberError("Please Enter 10 digit Contact Number");
            return false;
          }
        }
        /**End of Code Addition by Tejave Gupta on 20-06-2024
            reason - validationn added for phone number */
      }
    }
    if (input === "confirm_password") {
      if (checkIsEmpty(value)) {
        setConfirmPasswordError("Please re-enter password");
        return false;
      } else {
        if (
          checkPasswordDontmatch(
            document.getElementsByName("password")[0].value,
            value
          )
        ) {
          /**Code Addition by by Tejasve Gupta on 15-06-2024
              reason - bugs fixed*/
          setConfirmPasswordError("Password do not match");
          /**End of Code Addition by by Tejasve Gupta on 15-06-2024
              reason - bugs fixed*/
          return false;
        }
      }
    }
  };
  /**
   * Added by - Ashish Dewangan on 23-05-2024
   * Reason - To validate input on form submit
   */
  // const isValidOnSubmit = (data) => {
  //   if (checkIsEmpty(data.email)) {
  //     setEmailError("Please enter email address");
  //     return false;
  //   } else {
  //     if (checkIsEmailInvalid(data.email)) {
  //       /**Code Addition by by Tejasve Gupta on 15-06-2024
  //             reason - bugs fixed*/
  //       setEmailError("Please enter valid email address");
  //       /**End of Code Addition by by Tejasve Gupta on 15-06-2024
  //             reason - bugs fixed*/
  //       return false;
  //     }
  //   }

  //   if (checkIsEmpty(data.password)) {
  //     setPasswordError("Please enter password");
  //     return false;
  //   } else {
  //     if (checkIfMinimumThanMinValue(data.password, 8)) {
  //       setPasswordError("Password must contain 8 characters");
  //       return false;
  //     }
  //   }
  //   /**Code Added by Tejasve Gupta on 24-05-2024
  //    * reason - Adding Fields with Validation
  //    */
  //   if (checkIsEmpty(data.first_name)) {
  //     setFirstNameError("Please enter First Name");
  //     return false;
  //   }

  //   if (checkIsEmpty(data.contact_number)) {
  //     setLastNameError("Please enter ContactNumber");
  //     return false;
  //   } else {
  //     if (checkIsNotADigit(data.contact_number)) {
  //       /**Code Addition by by Tejasve Gupta on 15-06-2024
  //             reason - bugs fixed*/
  //       setContactNumberError("Please enter valid mobile number");
  //       /**End of Code Addition by by Tejasve Gupta on 15-06-2024
  //             reason - bugs fixed*/
  //       return false;
  //       /**Code Addition by Tejave Gupta on 20-06-2024
  //           reason - validationn added for phone number */
  //     } else {
  //       if (checkIfSmallerThanMinLength(data.contact_number, 10))
  //         setContactNumberError("Please Enter 10 digit Contact Number");
  //     }
  //     /**End of Code Addition by Tejave Gupta on 20-06-2024
  //           reason - validationn added for phone number */
  //   }
  //   if (checkIsEmpty(data.confirm_password)) {
  //     setConfirmPasswordError("Please re-enter password ");
  //     return false;
  //   } else {
  //     if (checkPasswordDontmatch(data.password, data.confirm_password)) {
  //       setConfirmPasswordError("Invalid Password Matching");
  //       return false;
  //     }
  //   }

  //   /**End of Code Added by Tejasve Gupta on 24-05-2024
  //    * reason - Adding Fields with Validation
  //    */
  //   return true;
  // };
  // /**
  //  * End of code addition by - Ashish Dewangan on 23-05-2024
  //  * Reason - To validate input on form submit
  //  */

  // /**
  //  * Added by - Ashish Dewangan on 23-05-2024
  //  * Reason - To post sign up details when user submits the form
  //  */
  // const postSignupDetails = async (e) => {
  //   const data = {
  //     email: e.target.email.value.toLowerCase(),
  //     password: e.target.password.value,
  //     /**Code Added by Tejasve Gupta on 24-05-2024
  //      * reason - Adding Fields with Validation
  //      */
  //     confirm_password: e.target.confirm_password.value,
  //     first_name: e.target.first_name.value,
  //     last_name: e.target.last_name.value,
  //     contact_number: e.target.contact_number.value,
  //     /**End of Code Added by Tejasve Gupta on 24-05-2024
  //      * reason - Adding Fields with Validation
  //      */
  //   };

  //   if (isValidOnSubmit(data)) {
  //     const response = await signup(data);
  //     if (response.success) {
  //       notificationObject.success(response.success);
  //       navigate("/login");
  //     }
  //   }
  // };
  // const handleSubmit = async (e) => {
  //   notificationObject.dismissAll();
  //   e.preventDefault();
  //   postSignupDetails(e);
  // };


  const handleSubmit = async (e) => {
    notificationObject.dismissAll();
    e.preventDefault();
     /**
     * Added by - Om Shrivastava on 16-09-2024
     * Reason - To stop continuous pop from occuring
     */
     setIsSubmitDisabled(true);
     /**
      * End of addition by - Om Shrivastava on 16-09-2024
      * Reason - To stop continuous pop from occuring
      */

    postSignupDetails(e); // Calling the function to handle form submission
  };
  
  const postSignupDetails = async (e) => {
    const data = {
      email: e.target.email.value.toLowerCase(),
      password: e.target.password.value,
      confirm_password: e.target.confirm_password.value,
      first_name: e.target.first_name.value,
      last_name: e.target.last_name.value,
      contact_number: e.target.contact_number.value,
    };
  
    // Clear previous error messages
    clearAllErrorMessages();
  
    // Validate the input fields
    if (isValidOnSubmit(data)) {
      const response = await signup(data, tenant);
      console.log("tenat name from sign up,,,,,,,", tenant)
      if (response.success) {
        notificationObject.success(response.success);
        navigate("/login");
      }
      /**
       * Added by - Om Shrivastava on 16-09-2024
       * Reason - To stop continuous pop from occuring
       */
      setTimeout(() => {
        setIsSubmitDisabled(false);
      }, 2000);
      /**
       * End of addition by - Om Shrivastava on 16-09-2024
       * Reason - To stop continuous pop from occuring
       */

    }
  };
  
  const isValidOnSubmit = (data) => {
    let isValid = true;
  
    // Validate First Name
    if (checkIsEmpty(data.first_name)) {
      setFirstNameError("Please enter First Name");
      isValid = false;
    }
  
    // Validate Last Name
    if (checkIsEmpty(data.last_name)) {
      setLastNameError("Please enter Last Name");
      isValid = false;
    }
  
    // Validate Email
    if (checkIsEmpty(data.email)) {
      setEmailError("Please enter Email Address");
      isValid = false;
    } else if (checkIsEmailInvalid(data.email)) {
      setEmailError("Please enter a valid Email Address");
      isValid = false;
    }
  
    // Validate Password
    if (checkIsEmpty(data.password)) {
      setPasswordError("Please enter Password");
      isValid = false;
    } else if (checkIfMinimumThanMinValue(data.password, 8)) {
      setPasswordError("Password must contain at least 8 characters");
      isValid = false;
    }
  
    // Validate Confirm Password
    if (checkIsEmpty(data.confirm_password)) {
      setConfirmPasswordError("Please re-enter Password");
      isValid = false;
    } else if (checkPasswordDontmatch(data.password, data.confirm_password)) {
      setConfirmPasswordError("Passwords do not match");
      isValid = false;
    }
  
    // Validate Contact Number
    if (checkIsEmpty(data.contact_number)) {
      setContactNumberError("Please enter Contact Number");
      isValid = false;
    } else if (checkIsNotADigit(data.contact_number)) {
      setContactNumberError("Please enter a valid Contact Number");
      isValid = false;
    } else if (checkIfSmallerThanMinLength(data.contact_number, 10)) {
      setContactNumberError("Please enter a 10-digit Contact Number");
      isValid = false;
    }
  
    return isValid;
  };
  
  const clearAllErrorMessages = () => {
    setFirstNameError("");
    setLastNameError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setContactNumberError("");
  };
  


  // Function to prevent spaces and disable copy/paste actions in the password field
  const handleKeyPress = (e) => {
    if (e.key === " ") {
      e.preventDefault();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
  };

  const handleCopy = (e) => {
    e.preventDefault();
  };
  return (
    <div className={`${signupStyle.pageFrame}`}>
      <div className={`${signupStyle.coloredBackground}`}>
        <div
          className={`${signupStyle.signupImage}`}
          style={{ color: "#ffe8e8" }}
        >
          {/* <div className={`${signupStyle.imageText}`}>
            Create Your Free Account Here
            <div className={`${signupStyle.imageText2}`}>
              Register your account and book hotels instantly with HMS!
            </div>
          </div> */}
        </div>
        <div className={`${signupStyle.pageContainer}`}>
          <div className={signupStyle.signupTitle}>
          <h2>Sign-up</h2>
          <h6 style={{fontWeight:'500'}}>Create a free account or <Link to="/login" style={{color:'blue',fontWeight:'600'}}>Log in</Link></h6>
          </div>
          <form className={`${signupStyle.form}`} onSubmit={handleSubmit}>
            <div className={`${signupStyle.formInputContainer}`}>
              <div className={`${signupStyle.formInputContainer}`}>
                <div className={`${signupStyle.inputPair}`}>
                  <div className={`${signupStyle.inputLabel}`}>
                    <span className={signupStyle.mandatoryField}>* </span>
                    First Name
                  </div>
                  <span style={{ marginRight: "10px" }}>:</span>
                  <div className={signupStyle.inputError}>
                    <input
                      className={`${signupStyle.formInput}`}
                      type="text"
                      name="first_name"
                      maxLength={50}
                      onChange={(e) => setFirstNameError("")}
                      onBlur={(e) =>
                        isValidOnBlur("first_name", e.target.value)
                      }
                    />
                    <div className={`${signupStyle.formInputError}`}>
                      {firstNameError}
                    </div>
                  </div>
                </div>
              </div>

              <div className={`${signupStyle.formInputContainer}`}>
                <div className={`${signupStyle.inputPair}`}>
                  <div className={`${signupStyle.inputLabel}`}>
                    <span className={signupStyle.mandatoryField}>* </span>
                    Last Name
                  </div>
                  <span style={{ marginRight: "10px" }}>:</span>
                  <div className={signupStyle.inputError}>
                    <input
                      className={`${signupStyle.formInput}`}
                      type="text"
                      name="last_name"
                      maxLength={50}
                      onChange={(e) => setLastNameError("")}
                      onBlur={(e) => isValidOnBlur("last_name", e.target.value)}
                    />
                    <div className={`${signupStyle.formInputError}`}>
                      {lastNameError}
                    </div>
                  </div>
                </div>
              </div>
              <div className={`${signupStyle.inputPair}`}>
                <div className={`${signupStyle.inputLabel}`}>
                  <span className={signupStyle.mandatoryField}>* </span>
                  Email ID
                </div>
                <span style={{ marginRight: "10px" }}>:</span>
                <div className={signupStyle.inputError}>
                  <input
                    className={`${signupStyle.formInput}`}
                    type="text"
                    name="email"
                    maxLength={50}
                    onChange={(e) => setEmailError("")}
                    onBlur={(e) => isValidOnBlur("email", e.target.value)}
                  />
                  <div className={`${signupStyle.formInputError}`}>
                    {emailError}
                  </div>
                </div>
              </div>
            </div>
            <div className={`${signupStyle.formInputContainer}`}>
              <div className={`${signupStyle.inputPair}`}>
                <div className={`${signupStyle.inputLabel}`}>
                  <span className={signupStyle.mandatoryField}>* </span>
                  Create Password
                </div>

                <span style={{ marginRight: "10px" }}>:</span>

                <div className={signupStyle.inputError}>
                  <div
                    className={signupStyle.inpuEye}
                    style={{ display: "flex", justifyContent: "flex-start" }}
                  >
                    <input
                      className={`${signupStyle.formInput2}`}
                      type={isPasswordVisible ? "text" : "password"}
                      autoComplete="new-password"
                      name="password"
                      maxLength={16}
                      onChange={(e) => setPasswordError("")}
                      onBlur={(e) => isValidOnBlur("password", e.target.value)}
                      onKeyPress={handleKeyPress} // Prevent spaces
                      onPaste={handlePaste} // Prevent paste
                      onCopy={handleCopy} // Prevent copy
                    />
                    <span
                      className={signupStyle.eyeIcon}
                      onClick={togglePasswordVisibility}
                    >
                      {/* {isPasswordVisible ? <FaEyeSlash /> : <FaEye />} */}
                      {!isPasswordVisible ? <FaEyeSlash /> : <FaEye />}

                    </span>
                  </div>
                  <div className={`${signupStyle.formInputError}`}>
                    {passwordError}
                  </div>
                </div>
              </div>
            </div>
            <div className={`${signupStyle.formInputContainer}`}>
              <div className={`${signupStyle.inputPair}`}>
                <div className={`${signupStyle.inputLabel}`}>
                  <span className={signupStyle.mandatoryField}>* </span>
                  Re-enter Password
                </div>
                <span style={{ marginRight: "10px" }}>:</span>

                <div className={signupStyle.inputError}>
                  <div
                    className={signupStyle.inpuEye}
                    style={{ display: "flex", justifyContent: "flex-start" }}
                  >
                    <input
                      className={`${signupStyle.formInput2}`}
                      type={isPasswordVisible ? "text" : "password"}
                      autoComplete="confirm-password"
                      name="confirm_password"
                      maxLength={16}
                      onChange={(e) => setConfirmPasswordError("")}
                      onBlur={(e) =>
                        isValidOnBlur("confirm_password", e.target.value)
                      }
                      onKeyPress={handleKeyPress} // Prevent spaces
                      onPaste={handlePaste} // Prevent paste
                      onCopy={handleCopy} // Prevent copy
                    />
                    <span
                      className={signupStyle.eyeIcon}
                      onClick={togglePasswordVisibility}
                    >
                      {/* {isPasswordVisible ? <FaEyeSlash /> : <FaEye />} */}
                      {isPasswordVisible ? <FaEye /> : <FaEyeSlash />}

                    </span>
                  </div>

                  <div className={`${signupStyle.formInputError}`}>
                    {confirmPasswordError}
                  </div>
                </div>
              </div>
            </div>

            <div className={`${signupStyle.formInputContainer}`}>
              <div className={`${signupStyle.inputPair}`}>
                <div className={`${signupStyle.inputLabel}`}>
                  <span className={signupStyle.mandatoryField}>* </span>
                  Contact Number
                </div>
                <span style={{ marginRight: "10px" }}>:</span>

                <div className={signupStyle.inputError}>
                  <input
                    className={`${signupStyle.formInput}`}
                    type="text"
                    name="contact_number"
                    maxLength={10}
                    onChange={(e) => setContactNumberError("")}
                    onBlur={(e) =>
                      isValidOnBlur("contact_number", e.target.value)
                    }
                  />
                  <div className={`${signupStyle.formInputError}`}>
                    {contactNumberError}
                  </div>
                </div>
              </div>
            </div>

            <div className={`${signupStyle.formButtonContainer}`}>
              <input
                className={`${signupStyle.submitButton} submitButton`}
                type="submit"
                value={"Signup"}
                 /**
                 * Added by - Om Shrivastava on 16-09-2024
                 * Reason - To stop continuous pop from occuring
                 */
                 disabled={isSubmitDisabled}
                /**
                 * End of addition by - Om Shrivastava on 16-09-2024
                 * Reason - To stop continuous pop from occuring
                 */
              />
            </div>
            <div className={`${signupStyle.textButtons}`}>
              <div >
                <Link to="/login" style={{ fontSize: "14px" }}>
                  Click here if Already Registered{" "}
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
