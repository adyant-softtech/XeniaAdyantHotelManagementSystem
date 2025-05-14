/**
 * Created by - Ashish Dewangan on 22-05-2024
 * Reason - Created login page
 */
import { useContext, useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";

import loginStyle from "./Login.module.css";
/**Code Commented by Tejasve on 26-05-2024
 * Reason - Code Not in use imported for trying purpose only
 */
import { useLocation, useNavigate } from "react-router-dom";
/**End of Code Commented by Tejasve on 26-05-2024
 * Reason - Code Not in use imported for trying purpose only
 */
import { login } from "../../Api/services";
import {
  checkIfMinimumThanMinValue,
  checkIsEmailInvalid,
  checkIsEmpty,
} from "../../utils/validations";

import { GlobalContext } from "../../context/Context";
import { Link } from "react-router-dom";
import notificationObject from "../../components/Widgets/Notification/Notification";
/**Code addition by Tejasve Gupta on 14-06-2024
    Reason - eye icon for password visibility
    */
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { showNotification } from "../../components/Widgets/Notification/LoginNotification";
/**End of Code addition by Tejasve Gupta on 14-06-2024
    Reason - eye icon for password visibility
    */
const Login = (props) => {
  const { user, setUser, tenant } = useContext(GlobalContext);
  const navigate = useNavigate();
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);

  /**
   * Added by - Ashish Dewangan on 22-05-2024
   * Reason - To navigate to home page if token does not exist
   */
  useEffect(() => {
    if (localStorage.getItem("access")) {
      navigate("/");
    } else {
      localStorage.clear();
    }
  }, []);
  /**
   * End of addition by - Ashish Dewangan on 22-05-2024
   * Reason - To navigate to home page if token does not exist
   */
  /**Code addition by Tejasve Gupta on 14-06-2024
    Reason - eye icon for password visibility
    */

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };
  /**End of Code addition by Tejasve Gupta on 14-06-2024
    Reason - eye icon for password visibility
    */
  /**
   * Added by - Ashish Dewangan on 22-05-2024
   * Reason - To validate input on blur
   */
  const isValidOnBlur = (input, value) => {
    if (input == "email") {
      if (checkIsEmpty(value)) {
        setEmailError("Please enter email address");
        return false;
      } else {
        if (checkIsEmailInvalid(value)) {
          setEmailError("Please type correct email format");
          return false;
        }
      }
    }
    if (input == "password") {
      if (checkIsEmpty(value)) {
        setPasswordError("Please enter password");
        return false;
      }
    }
  };
  /**
   * End of code by - Ashish Dewangan on 22-05-2024
   * Reason - To validate input on blur
   */

  /**
   * Added by - Ashish Dewangan on 22-05-2024
   * Reason - To validate input on form submit
   */
  const isValidOnSubmit = (data) => {
    if (checkIsEmpty(data.email)) {
      setEmailError("Please enter email address");
      return false;
    } else {
      if (checkIsEmailInvalid(data.email)) {
        setEmailError("Please type correct email format");
        return false;
      }
    }

    if (checkIsEmpty(data.password)) {
      setPasswordError("Please enter password");
      return false;
    }
    return true;
  };
  /**
   * End of code addition by - Ashish Dewangan on 22-05-2024
   * Reason - To validate input on form submit
   */

  /**
   * Added by - Ashish Dewangan on 22-05-2024
   * Reason - To post login details when user submits the form
   */
  const postLoginDetails = async (e) => {
    const data = {
      email: e.target.email.value.toLowerCase(),
      password: e.target.password.value,
    };
    if (isValidOnSubmit(data)) {
      const response = await login(data, tenant);
      // console.log(response);
      /**Code modification by Tejasve Gupta on 13-06-2024
Reason - Addition of popup notification
*/
      if (response.success) {
        // Commemnted by Om Shrivastava on 09-09-2024
        // Reason : Handle the message because its show in repatative format
        // notificationObject.success(response.success);
        showNotification("Successfully registered", "success");
        // Commemnted by Om Shrivastava on 09-09-2024
        // Reason : Handle the message because its show in repatative format
      } else {
        notificationObject.error("Invalid username or password");
      }
      /**End of Code modification by Tejasve Gupta on 13-06-2024
Reason - Addition of popup notification
*/
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

      if (response.refresh) {
        localStorage.setItem("refresh", response.refresh);
        localStorage.setItem("access", response.access);
        setUser(response.user);
        navigate("/");
      }
    }
  };
  const handleSubmit = async (e) => {
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

    postLoginDetails(e);
  };

  /**
   * End of code addition by - Ashish Dewangan on 22-05-2024
   * Reason - To post login details when user submits the form
   */
  /**Code Added By Tejasve Gupta on 26-05-2024
   * Reason - UI design of Login PAge
   */
  /**Code modification by Tejasve Gupta on 13-06-2024
Reason - disable of copying and paste in textfield
*/
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
  /**End of Code modification by Tejasve Gupta on 13-06-2024
Reason - disable of copying and paste in textfield
*/

  return (
    <div className={`${loginStyle.pageFrame}`}>
      <div className={`${loginStyle.coloredBackground}`}>
        <div
          className={`${loginStyle.loginImage}`}
          style={{ color: "#ffe8e8" }}
        >
          {/* <div className={`${loginStyle.imageText}`}>
            Hello! Welcome Back
            <div className={`${loginStyle.imageText2}`}>
              Have a smooth booking with us!
            </div>
          </div> */}
        </div>
        {/**Code addition by Tejasve Gupta on 14-06-2024
    Reason - style Adjusted
    */}
        <div
          className={`${loginStyle.pageContainer}`}
          style={{ display: "flex", flexDirection: "column" }}
        >
          {/**End of Code addition by Tejasve Gupta on 14-06-2024
    Reason - style Adjusted
    */}
          <form onSubmit={handleSubmit}>
            {/**Code addition by Tejasve Gupta on 14-06-2024
    Reason - style Adjusted
    */}
            <div className={loginStyle.loginTitle}>
              <h2>Log-in</h2>
              <h6 style={{fontWeight:'500',fontSize:'10px'}}>Please login to continue</h6>
            </div>
            {/**Code addition by Tejasve Gupta on 14-06-2024
    Reason - eye icon for password visibility
    */}

            <div className={`${loginStyle.formInputContainer}`}>
              <div className={`${loginStyle.inputLabel}`}>
                <span className={loginStyle.mandatoryField}>* </span>
                &nbsp;Enter Your Email
                <span style={{ marginLeft: "10px" }}>:</span>
              </div>
              <div className={loginStyle.inputError}>
                <input
                  className={`${loginStyle.formInput}`}
                  type="text"
                  name="email"
                  maxLength={50}
                  onChange={() => setEmailError("")}
                  onBlur={(e) => isValidOnBlur("email", e.target.value)}
                />
                <div className={`${loginStyle.formInputError}`}>
                  {emailError}
                </div>
                {/**End of Code modification by Tejasve Gupta on 13-06-2024*/}
              </div>
            </div>
            <div className={`${loginStyle.formInputContainer}`}>
              <div className={`${loginStyle.inputLabel}`}>
                <span className={loginStyle.mandatoryField}>* </span>
                &nbsp;Enter Password
                <span style={{ marginLeft: "16px" }}>:</span>
              </div>
              {/**Code modification by Tejasve Gupta on 13-06-2024*/}
              <div className={loginStyle.inputError}>
                {/**Code addition by Tejasve Gupta on 14-06-2024
                    Reason - eye icon for password visibility
                    */}

                <div style={{ display: "flex" }}>
                  <input
                    className={`${loginStyle.formInput}`}
                    type={isPasswordVisible ? "text" : "password"}
                    autoComplete="new-password"
                    name="password"
                    maxLength={12}
                    onChange={() => setPasswordError("")}
                    onBlur={(e) => isValidOnBlur("password", e.target.value)}
                    onKeyPress={handleKeyPress} // Prevent spaces
                    onPaste={handlePaste} // Prevent paste
                    onCopy={handleCopy} // Prevent copy
                  />
                  <span
                    className={loginStyle.eyeIcon}
                    onClick={togglePasswordVisibility}
                  >
                    {isPasswordVisible ? <FaEye /> : <FaEyeSlash />}
                  </span>
                </div>
                {/* <span
                  className={loginStyle.eyeIcon}
                  onClick={togglePasswordVisibility}
                >
                  {isPasswordVisible ? <FaEyeSlash /> : <FaEye />}
                </span> */}
                <div className={`${loginStyle.formInputError}`}>
                  {passwordError}
                </div>
                {/**Code Addition and Modification by Tejave Gupta on 20-06-2024
            reason - Code shifted in CSS file*/}
                <div className={loginStyle.forgotPassword}>
                  {/**End of Code Addition and Modification by Tejave Gupta on 20-06-2024
            reason - Code shifted in CSS file*/}
                  <Link to="/forgotPassword">Forgot Password?</Link>
                </div>
                {/**Code modification by Tejasve Gupta on 13-06-2024*/}
              </div>
            </div>
            <div
              className={`${loginStyle.formButtonContainer}`}
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <input
                type="submit"
                value={"Login"}
                // className={loginStyle.submitButton}
                /**
                 * Added by - Om Shrivastava on 16-09-2024
                 * Reason - To stop continuous pop from occuring
                 */
                disabled={isSubmitDisabled}
                /**
                 * End of addition by - Om Shrivastava on 16-09-2024
                 * Reason - To stop continuous pop from occuring
                 */
                className="submitButton"
              />
            </div>
            <div className={`${loginStyle.textButtons}`}>
              <div
                style={{
                  marginBottom: "10px",
                  fontSize: "var(--form-label-font-size)",
                }}
              >
                {/**End of Code addition by Tejasve Gupta on 14-06-2024
                        Reason - eye icon for password visibility
                        */}
                <Link to="/signup">Click here to Register</Link>
              </div>
              {/**Code modification by Tejasve Gupta on 13-06-2024
              reason - Removal of sign up with google*/}
              {/* <div
                className={`${loginStyle.googleSignup}`}
                style={{ marginTop: "10px", width: "50%" }}
              >
                <FcGoogle /> Sign-up with Google
              </div> */}
              {/**Code modification by Tejasve Gupta on 13-06-2024
              reason - Removal of sign up with google*/}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
/**End of Code Added By Tejasve Gupta on 26-05-2024
 * Reason - UI design of Login PAge
 */

export default Login;
