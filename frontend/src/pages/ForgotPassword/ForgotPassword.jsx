/**Created By Tejasve Gupta on 26-05-2024
 * Reason - Reset new password
 */

import React, { useState } from "react";
import forgotStyle from "./ForgotPassword.module.css";
import {
  sendOtpApi,
  verifyOtpApi,
  updatePasswordApi,
} from "../../Api/services";
import { Link, useNavigate } from "react-router-dom";
/**Code Additions by Tejasve Gupta on 13-06-2024
Reason - Added validations
*/
import {
  checkIfGreaterThanMaxValue,
  checkPasswordDontmatch,
} from "../../utils/validations";
// import { useLocation, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
/**End of Code Additions by Tejasve Gupta on 13-06-2024
Reason - Added validations
*/

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailErrors, setEmailErrors] = useState([]);
  const [otpErrors, setOtpErrors] = useState([]);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [confirmPasswordErrors, setConfirmPasswordErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  /**Code Added By Tejasve Gupta on 26-05-2024
   * Reason - To validate email
   */
  /**Code modification by Tejasve Gupta on 13-06-2024
Reason - Added validations
*/

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };
  /**End of Code modification by Tejasve Gupta on 13-06-2024
Reason - Added validations
*/

  function validateEmail(text) {
    const errors = [];
    if (!text) {
      errors.push("Please enter Email");
    } else if (
      !text.match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      )
    ) {
      errors.push(
        "Please enter Email in the correct format"
        // (example@gmail.com)"
      );
    }
    return errors;
  }
  /**End of Code Added By Tejasve Gupta on 26-05-2024
   * Reason - To validate email
   */

  /**Code Added By Tejasve Gupta on 26-05-2024
   * Reason - To validate otp
   */

  function validateOtp(text) {
    const errors = [];
    if (!text) {
      errors.push("Please enter OTP");
      /**Code modification by Tejasve Gupta on 13-06-2024
Reason - disabling entering spaces
*/
    } else if (text.trim().length < 4) {
      /**End of Code modification by Tejasve Gupta on 13-06-2024
Reason - disabling entering spaces
*/
      errors.push("OTP should not be less than 4 digits");
    }
    return errors;
  }
  /**End of Code Added By Tejasve Gupta on 26-05-2024
   * Reason - To validate otp
   */

  /**Code Added By Tejasve Gupta on 26-05-2024
   * Reason - To validate password
   */
  function validatePassword(text) {
    const errors = [];
    if (!text) {
      errors.push("Please enter a new password");
    } else if (text.length < 8) {
      // errors.push("Password must be at least 8 characters long");
      errors.push("Must be at least 8 characters");
    }
    return errors;
  }
  /**Code modification by Tejasve Gupta on 13-06-2024
Reason - Addition of validations
*/
  function validateConfirmPassword(text, newPassword) {
    const errors = [];
    if (!text) {
      errors.push("Please confirm your password");
    } else if (text !== newPassword) {
      // errors.push("Password and confirm password should be the same");
      errors.push("Confirm password is not same");
    } else if (checkPasswordDontmatch(text, newPassword)) {
      // errors.push("Password and confirm password do not match");
      errors.push("Confirm password do not match");

      /**End of Code modification by Tejasve Gupta on 13-06-2024
Reason - Addition of validations
*/
    }
    return errors;
  }
  /**End of Code Added By Tejasve Gupta on 26-05-2024
   * Reason - To validate password
   */

  /**Code Added By Tejasve Gupta on 26-05-2024
   * Reason - Button to Handle Email Submission for Password resetting
   */
  async function handleEmailSubmit(e) {
    e.preventDefault();
    /**Code commented By Tejasve Gupta on 27-05-2024
     * Reason - Unnecessary Code
     */
    // const formData = new FormData(e.currentTarget);
    /**End of Code commented By Tejasve Gupta on 27-05-2024
     * Reason - Unnecessary Code
     */
    const inputEmail = e.currentTarget.email.value;
    const emailValidationErrors = validateEmail(inputEmail);

    setEmailErrors(emailValidationErrors);
    if (emailValidationErrors.length === 0) {
      try {
        const res = await sendOtpApi({ email: inputEmail });
        if (res.msg) {
          setSuccessMessage(res.msg);
          setEmail(inputEmail);
          setErrorMessage("");
          setStep(2);
        } else {
          setErrorMessage(
            res.error || "Something went wrong! Please try again "
          );
          setSuccessMessage("");
        }
      } catch (err) {
        setErrorMessage("Something went wrong! Please try again ");
        setSuccessMessage("");
      }
    }
  }
  /** End of Code Added By Tejasve Gupta on 26-05-2024
   * Reason - Button to Handle Email Submission for Password resetting
   */

  /**Code Added By Tejasve Gupta on 26-05-2024
   * Reason - Button to Handle otp Submission for Password resetting
   */
  async function handleOtpSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const inputOtp = formData.get("otp");
    const otpValidationErrors = validateOtp(inputOtp);

    setOtpErrors(otpValidationErrors);
    if (otpValidationErrors.length === 0) {
      try {
        const res = await verifyOtpApi({ email: email, otp: inputOtp });
        if (res.msg) {
          setSuccessMessage(res.msg);
          setOtp(inputOtp);
          setErrorMessage("");
          setStep(3);
        } else {
          setErrorMessage(res.error || "Invalid OTP. Please try again.");
          setSuccessMessage("");
        }
      } catch (err) {
        setErrorMessage("Something went wrong! Please try again");
        setSuccessMessage("");
      }
    }
  }
  /**End of Code Added By Tejasve Gupta on 26-05-2024
   * Reason - Button to Handle otp Submission for Password resetting
   */

  /**Code Added By Tejasve Gupta on 26-05-2024
   * Reason - Button to Handle password Submission for Password resetting
   */
  async function handlePasswordSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const inputPassword = formData.get("newPassword");
    const inputConfirmPassword = formData.get("confirmPassword");
    const passwordValidationErrors = validatePassword(inputPassword);
    /**Code modification by Tejasve Gupta on 13-06-2024
Reason - Addition of validations
*/
    const confirmPasswordValidationErrors = validateConfirmPassword(
      inputConfirmPassword,
      inputPassword
    );
    /**End of Code modification by Tejasve Gupta on 13-06-2024
Reason - Addition of validations
*/

    setPasswordErrors(passwordValidationErrors);
    setConfirmPasswordErrors(confirmPasswordValidationErrors);

    if (
      passwordValidationErrors.length === 0 &&
      confirmPasswordValidationErrors.length === 0
    ) {
      try {
        const res = await updatePasswordApi({
          email,
          password: inputPassword,
        });
        if (res.msg) {
          setSuccessMessage(res.msg);
          setErrorMessage("");
          setStep(4);
        } else {
          setErrorMessage(
            res.error || "Something went wrong! Please try again"
          );
          setSuccessMessage("");
        }
      } catch (err) {
        setErrorMessage("Something went wrong! Please try again");
        setSuccessMessage("");
      }
    }
  }

  /**End of Code Added By Tejasve Gupta on 26-05-2024
   * Reason - Button to Handle password Submission for Password resetting
   */

  const handlePreviousNavigate = () => {
    // Handle your submit logic here

    // Navigate back
    navigate(-1);
  };
  /**Code Addition and Modification by Tejave Gupta on 20-06-2024
            reason - Disable spaces on Password and otp*/
  const handleKeyPress = (e) => {
    if (e.key === " ") {
      e.preventDefault();
    }
  };
  /**End of Code Addition and Modification by Tejave Gupta on 20-06-2024
            reason - Disable spaces on Password and otp*/
  return (
    <div className={forgotStyle.pageFrame}>
      <div className={forgotStyle.coloredBackground}>
        <div className={forgotStyle.loginImage} style={{ color: "#ffe8e8" }}>
          {/* <div className={forgotStyle.imageText}>
            Forgot Password?
            <div className={forgotStyle.imageText2}>
              Don't worry! You can easily reset your password here.
            </div>
          </div> */}
        </div>
        <div className={forgotStyle.pageContainer}>
          {step === 1 && (
            <form onSubmit={handleEmailSubmit}>
              <div className={forgotStyle.title}>
                <h2>Forgot Password</h2>
                <h6 style={{fontWeight:'500'}}>
                  Enter your Email and we'll help you to reset your password
                </h6>
              </div>
              {/* <div className={forgotStyle.formInputContainer}>
                <div className={forgotStyle.inputLabel}>
                  <span className={forgotStyle.mandatoryField}>* </span>
                  Enter Your Email
                </div>
                <input
                  className={forgotStyle.formInput}
                  type="text"
                  name="email"
                  maxLength={50}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailErrors([]);
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  onBlur={(e) => {
                    const inputEmail = e.target.value;
                    const emailValidationErrors = validateEmail(inputEmail);
                    setEmailErrors(emailValidationErrors);
                  }}
                />
                {emailErrors.map((error, index) => (
                  <div key={index} className={forgotStyle.formInputError}>
                    {error}
                  </div>
                ))}
              </div> */}
              <div className={`${forgotStyle.formInputContainer}`}>
                <div className={`${forgotStyle.inputPair}`}>
                  <div className={`${forgotStyle.inputLabel}`} style={{width:'32%'}}>
                    <span className={forgotStyle.mandatoryField} >* </span>
                    Enter Your Email
                  </div>
                  <span style={{ marginRight: "10px" }}>:</span>
                  <div className={forgotStyle.inputError}>
                    <input
                      className={`${forgotStyle.formInput}`}
                      type="text"
                      name="email"
                      maxLength={50}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailErrors([]);
                        setErrorMessage("");
                        setSuccessMessage("");
                      }}
                      onBlur={(e) => {
                        const inputEmail = e.target.value;
                        const emailValidationErrors = validateEmail(inputEmail);
                        setEmailErrors(emailValidationErrors);
                      }}
                    />
                    <div 
                    // className={`${forgotStyle.formInputError}`} 
                    // style={{marginLeft:'-60%'}}
                    style={{fontSize:'var(--page-validation-font-size)',color:'red',marginBottom:'2%'}}
                    >
                      {emailErrors.map((error, index) => (
                        <div key={index} 
                        // className={forgotStyle.formInputError}
                        >
                          {error}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {successMessage && (
                  <div className={forgotStyle.formInputSuccess}>
                    {successMessage}
                  </div>
                )}
                {errorMessage && (
                  <div className={forgotStyle.formInputError}>
                    {errorMessage}
                  </div>
                )}

                <div
                  className={forgotStyle.formButtonContainer}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "12px",
                  }}
                >
                  <input
                    type="submit"
                    value="Send OTP"
                    // className={forgotStyle.submitButton}
                    className="submitButton"
                  />
                  <button
                    onClick={handlePreviousNavigate}
                    className="submitButton"
                  >
                    Back
                  </button>
                </div>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleOtpSubmit}>
              <div className={forgotStyle.title}>
                {step === 2 && (
                  <>
                    <h2>OTP Verification</h2>
                    {/* Modification and addition by Om Shrivastava on 24-09-2024
                    Reason : Add the heading  */}
                    <h6 style={{fontWeight:'500'}}>Enter 6 digit verification code send to your Email</h6>
                    {/* Modification and addition by Om Shrivastava on 24-09-2024
                    Reason : Add the heading  */}
                  </>
                )}
              </div>
              <div className={forgotStyle.formInputContainer}>
                <div className={`${forgotStyle.inputPair}`}>
                  <div className={forgotStyle.inputLabel} style={{width:'20%'}}>
                    <span className={forgotStyle.mandatoryField}>* </span>
                    Enter OTP
                  </div>
                  <span style={{ marginRight: "10px" }}>:</span>
                  <div className={forgotStyle.inputError}>
                    <input
                      className={forgotStyle.formInput}
                      type="text"
                      name="otp"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => {
                        setOtp(e.target.value);
                        setOtpErrors([]);
                        setErrorMessage("");
                        setSuccessMessage("");
                      }}
                      /**Code modification by Tejasve Gupta on 13-06-2024
                    Reason - Addition of validations
                    */
                      onBlur={(e) => {
                        const inputOtp = e.target.value;
                        const otpValidationErrors = validateOtp(inputOtp);
                        setOtpErrors(otpValidationErrors);
                      }}
                      /**Code Addition and Modification by Tejave Gupta on 20-06-2024
                    reason - Disable spaces on Password and otp*/
                      onKeyPress={handleKeyPress}
                      /**End of Code Addition and Modification by Tejave Gupta on 20-06-2024
                      reason - Disable spaces on Password and otp*/
                      /**End of Code modification by Tejasve Gupta on 13-06-2024
                      Reason - Addition of validations
                      */
                    />
                    <div 
                    // className={`${forgotStyle.formInputError}`}
                    style={{fontSize:'var(--page-validation-font-size)',color:'red',marginBottom:'2%'}}

                    >
                      {otpErrors.map((error, index) => (
                        <div key={index} 
                        // className={forgotStyle.formInputError}
                        >
                          {error}
                        </div>
                      ))}

                      {errorMessage && (
                <div 
                style={{textAlign:'start'}}
                // className={forgotStyle.formInputError}
                >{errorMessage}</div>
                
              )}

                    </div>
                  </div>
                </div>
              </div>

              {/* {successMessage && (
                <div className={forgotStyle.formInputSuccess}>
                  {successMessage}
                </div>
              )} */}
              <div 
                    // className={`${forgotStyle.formInputError}`} 
                    // style={{marginLeft:'-60%'}}
                    style={{fontSize:'var(--page-validation-font-size)',color:'red',marginBottom:'2%'}}
                    >
              
              </div>
              <div
                className={forgotStyle.formButtonContainer}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <input
                  type="submit"
                  value="Verify OTP"
                  // className={forgotStyle.submitButton}
                  className="submitButton"
                />
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handlePasswordSubmit}>
              <div className={forgotStyle.title}>
                {step === 3 && (
                  <>
                    <h2>Reset Password</h2>
                    {/* Modification and addition by Om Shrivastava on 24-09-2024
                    Reason : Add the heading  */}
                    <h6 style={{fontWeight:'500'}}>Enter a new password below to change your password</h6>
                    {/* Modification and addition by Om Shrivastava on 24-09-2024
                    Reason : Add the heading  */}
                  </>
                )}
              </div>

              <div className={forgotStyle.formInputContainer}>
                <div
                  style={{ paddingTop: "1%" }}
                  className={`${forgotStyle.formInputContainer1}`}
                >
                  <div className={`${forgotStyle.inputPair}`}>
                    <div className={forgotStyle.inputLabel} >
                      <span className={forgotStyle.mandatoryField}>* </span>
                      Enter New Password
                    </div>
                    <span style={{ marginRight: "10px" }}>:</span>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <div style={{ display: "flex" }}>
                        <input
                          className={forgotStyle.formInput}
                          style={{width:'95%'}}
                          type={isPasswordVisible ? "text" : "password"}
                          name="newPassword"
                          maxLength={50}
                          value={newPassword}
                          onChange={(e) => {
                            setNewPassword(e.target.value);
                            setPasswordErrors([]);
                            setErrorMessage("");
                            setSuccessMessage("");
                          }}
                          onBlur={(e) => {
                            const inputPassword = e.target.value;
                            const passwordValidationErrors =
                              validatePassword(inputPassword);
                            setPasswordErrors(passwordValidationErrors);
                          }}
                        />
                        <span
                          className={forgotStyle.eyeIcon}
                          onClick={togglePasswordVisibility}
                        >
                          {isPasswordVisible ? <FaEye /> : <FaEyeSlash />}
                        </span>
                      </div>

                      {passwordErrors.map((error, index) => (
                        <div
                          key={index}
                          style={{ marginRight: "40px" }}
                          className={forgotStyle.formInputError}
                        >
                          {error}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div
                  style={{ paddingTop: "1%" }}
                  className={`${forgotStyle.formInputContainer1}`}
                >
                  <div className={`${forgotStyle.inputPair}`}>
                    <div className={forgotStyle.inputLabel}>
                      <span className={forgotStyle.mandatoryField}>* </span>
                      Confirm New Password
                    </div>
                    <span style={{ marginRight: "10px" }}>:</span>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <div style={{ display: "flex" }}>
                        <input
                          className={forgotStyle.formInput}
                          type={isPasswordVisible ? "text" : "password"}
                          style={{width:'95%'}}

                          name="confirmPassword"
                          maxLength={50}
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            setConfirmPasswordErrors([]);
                            setErrorMessage("");
                            setSuccessMessage("");
                          }}
                          onBlur={(e) => {
                            const inputConfirmPassword = e.target.value;
                            const confirmPasswordValidationErrors =
                              validateConfirmPassword(
                                inputConfirmPassword,
                                newPassword
                              );
                            setConfirmPasswordErrors(
                              confirmPasswordValidationErrors
                            );
                          }}
                        />
                        <span
                          className={forgotStyle.eyeIcon}
                          onClick={togglePasswordVisibility}
                        >
                          {isPasswordVisible ? <FaEye /> : <FaEyeSlash />}
                        </span>
                      </div>

                      {confirmPasswordErrors.map((error, index) => (
                        <div
                          // style={{ marginRight:'40px' }}
                          key={index}
                          className={forgotStyle.formInputError}
                        >
                          {error}
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* {successMessage && (
                      <div className={forgotStyle.formInputSuccess}>
                        {successMessage}
                      </div>
                    )} */}
                  {/* {errorMessage && (
                    <div
                      style={{ marginRight:'40px' }}
                      className={forgotStyle.formInputError}
                    >
                      {errorMessage}
                    </div>
                  )} */}
                </div>
              </div>

              <div
                className={forgotStyle.formButtonContainer}
                style={{
                  display: "flex",
                  paddingTop: "2%",
                  justifyContent: "center",
                  gap: "5%",
                  alignItems: "center",
                }}
              >
                <input
                  type="submit"
                  value="Reset Password"
                  className="submitButton"
                />
                <button
                  onClick={handlePreviousNavigate}
                  className="submitButton"
                >
                  Back
                </button>
              </div>
            </form>
          )}

          {step === 4 && (
            <div className={forgotStyle.successMessage} style={{marginTop:'34%'}}>
              Your password has been reset successfully. You can now log in with
              your new password.
              <div style={{ marginBottom: "10px", marginTop: "10px" }}>
                <Link to="/login">Login</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

/**End of Creation by Tejasve Gupta */
