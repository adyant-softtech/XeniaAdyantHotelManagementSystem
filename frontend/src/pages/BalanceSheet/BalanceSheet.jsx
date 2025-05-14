import React, { useState,useContext, useEffect } from "react";
import { 
Grid, 
Typography, 
CircularProgress, 
Radio, 
RadioGroup, 
TextField, 
styled,  
Button,
FormControlLabel,
Paper,
Table,
TableBody,
TableCell,
TableContainer,
TableHead,
TableRow, } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./balanceSheet.module.css";
import { FiArrowLeft } from "react-icons/fi";
import {
  userDetails,
  postBalanceSheetDetailsApi,
  getBalanceSheetDetailsApi,
  editBalanceDetailsApi,
  deleteBalanceDetailsApi,
} from "../../Api/services";
import notificationObject from "../../components/Widgets/Notification/Notification";
import { GlobalContext } from "../../context/Context";
import { MdDelete } from "react-icons/md";
import { FaEdit } from "react-icons/fa";

const BalanceSheet = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { tenant } = useContext(GlobalContext);
    
    // State variables
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [selectedBalanceId, setSelectedBalanceId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [noRecordsFound, setNoRecordsFound] = useState(false);
    const [latestCheckOutDate, setLatestCheckOutDate] = useState();
    const [latestCheckOutTime, setLatestCheckOutTime] = useState();
    const [billingDetails, setBillingDetails] = useState({});
    const [totalAmount, setTotalAmount] = useState("");
    const [totalCurrentAmount, setTotalCurrentAmount] = useState("");
    const [openingBalance, setOpeningBalance] = useState("");
    const [isTotalAmountEntered, setIsTotalAmountEntered] = useState(false);
    const [amountReceivedOrTransferred, setAmountReceivedOrTransferred] = useState("");
    const [mode, setMode] = useState("Cash"); // default
    const [givenBy, setGivenBy] = useState("");
    const [remark, setRemark] = useState("");
    const [adminRemark, setAdminRemark] = useState("");
    const [filterMode, setFilterMode] = useState("");
    const [expenseType, setExpenseType] = useState("");
    const [expenseName, setExpenseName] = useState("");
    const [expenseQuantity, setExpenseQuantity] = useState("");

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
    var currentDate = new Date(
        new Date().toLocaleString("en-Us", { timeZone: "Asia/Kolkata" })
      );
    const [filterConditions, setFilterConditions] = useState({
    date: currentDate.toISOString().split("T")[0],
    });
    const handleFilterConditionChange = (e) => {
        const { name, value } = e.target;
        setFilterConditions((prevState) => ({
          ...prevState,
          [name]: value,
        }));
    };

    const [givertotalAmount, setGiverTotalAmount] = useState("");
    const [closingBalance, setClosingBalance] = useState("");
    const [giveramountReceivedOrTransferred, setGiverAmountReceivedOrTransferred] = useState("");
    const [givermode, setGiverMode] = useState("Cash"); // default
    const [givergivenBy, setGiverGivenBy] = useState("");
    const [giverremark, setGiverRemark] = useState("");
    const [giveradminRemark, setGiverAdminRemark] = useState("");

    const [receiverBalance, setReceiverBalance] = useState("");
    const [giverBalance, setGiverBalance] = useState("");
    const [balanceData, setBalanceData] = useState("");

    // Added by - Akanksha on 10-04-2025
    // Reason - To use context variable
    var { staffName, setStaffName, adminName, setAdminName } =
    useContext(GlobalContext);
    // End of code - Akanksha on 10-04-2025
    // Reason - To have use context variable

    // const handleAmountTransferredChange = (e) => {
    //     const transferredAmount = Number(e.target.value);
    //     setGiverAmountReceivedOrTransferred(transferredAmount); 
    // };
    const handleAmountTransferredChange = (e) => {
        const transferredAmount = Number(e.target.value);
    
        if (transferredAmount >= 0 || e.target.value === '') {
            setGiverAmountReceivedOrTransferred(transferredAmount);
        }
    };
    
    

    

    // Handlers
    const handleBackClick = () => {
        navigate(-1);  // Navigate back to the previous page
    };

    const handleOutsideClick = () => {
        setIsPopupVisible(false);
    };

    const handleOkClick = () => {
        setIsPopupVisible(false);
        navigate(-1);
    };

    const handleCancelClick = () => {
        setIsPopupVisible(false);
    };
    
    const [loading, setLoading] = useState(false);

    const [user, setUser] = useState({});
    const [userEmail, setUserEmail] = useState({});

    const [formData, setFormData] = useState({
        sender: "",
        receiver_balance: "",
        total_amount: "",
        amount_received: "",
        mode: "",
        given_by: "",
        purpose: "Cash",
        admin_remark: "",
        date: latestCheckOutDate,
        time: latestCheckOutTime,
        giver_balance: "",
        expense_type: "",
        expense_name: "",
        expense_quantity: "",
        
    });
    const getUserDetails = async (access) => {
        try {
          const response = await userDetails(access, tenant);
          if (response.user) {
            setUser(response.user);
            setUserEmail(response.email);
          }
        } catch (err) {
          console.error("Error fetching user details:", err);
        }
    };

    // const fetchBalanceSheetDetails = async () => {
    //     setLoading(true);
    //     try {
    //         const access = localStorage.getItem("access");
    //         const response = await getBalanceSheetDetailsApi(access, filterConditions, tenant);
    //         setBalanceData(response);
    //         // setGiverTotalAmount(response.balances[0].amount_received || 0); 
    //         setGiverTotalAmount(response.amount_giver_sum);
    //         setClosingBalance(response.closing_balance);
    //         setTotalAmount(response.amount_received_sum);
    //         setTotalCurrentAmount(response.total_amount_received_sum);
    //         setOpeningBalance(response.opening_balance);
    //         setReceiverBalance(response.closing_balance);
    //         console.log("ressssssponse", response);
    //         console.log("balance data variable set or jnot", balanceData);
    //     } catch (error) {
    //         console.error("Error fetching handover details:", error);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    console.log(".................................", tenant);
    const fetchBalanceSheetDetails = async () => {
        const access = localStorage.getItem("access");
    
        if (!access || !tenant) {
            alert("Access token or tenant is missing. Please log in again or contact admin.");
            return;
        }
    
        setLoading(true);
        try {
            const response = await getBalanceSheetDetailsApi(access, filterConditions, tenant);
            setBalanceData(response);
            setGiverTotalAmount(response.amount_giver_sum);
            setClosingBalance(response.closing_balance);
            setTotalAmount(response.amount_received_sum);
            setTotalCurrentAmount(response.total_amount_received_sum);
            setOpeningBalance(response.opening_balance);
            setReceiverBalance(response.closing_balance);
            console.log("ressssssponse", response);
            console.log("balance data variable set or not", balanceData);
        } catch (error) {
            console.error("Error fetching balance sheet details:", error);
        } finally {
            setLoading(false);
        }
    };
    

    useEffect(() => {
        console.log("Updated balanceData after state change:", balanceData);
    }, [balanceData]);

    const [selectedRole, setSelectedRole] = useState("giver"); 

    const handleRoleChange = (e) => {
        setSelectedRole(e.target.value);
    };

    const handleModeChange = (e) => {
        setFilterMode(e.target.value);
    }
    const handlePaymentModeChange = (event) => {
        setMode(event.target.value);
        setGiverMode(event.target.value);
      };

    const filteredBalances = balanceData?.balances?.filter(
        (balance) => balance.sender === selectedRole
    );

    const filterPaymentMode = balanceData?.balances?.filter(
        (balance) => balance.mode === filterMode
    )



    const handleTotalAmountChange = (e) => {
        const value = e.target.value;

        if (!isTotalAmountEntered) {
            setTotalAmount(value);
        }
    };

    const handleBlur = () => {
        if (totalAmount) {
            setIsTotalAmountEntered(true); 
        }
    }



    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (selectedRole === "receiver" && (!amountReceivedOrTransferred || amountReceivedOrTransferred <= 0)) {
            notificationObject.error("Amount received field is required!!");
            return; 
        }
    
    
        if (selectedRole === "giver" && (!giveramountReceivedOrTransferred || giveramountReceivedOrTransferred <= 0)) {
            notificationObject.error("Amount paid field is required!!");
            return; 
        }
        const payload = selectedRole === "receiver"
            ? {
                        sender: selectedRole,
                        receiver_balance: receiverBalance,
                        total_amount: totalAmount,
                        amount_received: amountReceivedOrTransferred,
                        mode: mode,
                        given_by: givenBy,
                        purpose: remark,
                        admin_remark: adminRemark,
                        date: latestCheckOutDate,
                        time: rawCheckOutTime,
            }
            : {
                        sender: selectedRole,
                        // giver_balance: giverBalance,
                // total_amount: givertotalAmount,
                        expense_type: expenseType,
                        expense_name: expenseName,
                        expense_quantity: expenseQuantity,
                        amount_received: giveramountReceivedOrTransferred,
                        mode: givermode,
                        given_by: givergivenBy,
                        purpose: giverremark,
                        admin_remark: giveradminRemark,
                        date: latestCheckOutDate,
                        time: rawCheckOutTime,
            };
    
        try {
            const accessToken = localStorage.getItem("access");
            

            if (selectedBalanceId) {
                // If editing an existing entry
                const data = await editBalanceDetailsApi(accessToken, selectedBalanceId, payload, tenant);
                console.log("data of edit ", data);
                notificationObject.success("Balance Sheet updated successfully!");
            } else {
                // If creating a new entry
                await postBalanceSheetDetailsApi(accessToken, payload, tenant);
                notificationObject.success("Balance Sheet created successfully!");
            }
    
            setTotalAmount("");
            setAmountReceivedOrTransferred("");
            setMode("Cash");
            setGivenBy("");
            setRemark("");
            setAdminRemark("");

                // setGiverTotalAmount("");
            setGiverAmountReceivedOrTransferred("");
            setGiverMode("Cash");
            setGiverGivenBy("");
            setGiverRemark("");
            setGiverAdminRemark("");
            setExpenseType("Select Expense Type");
            setExpenseName("");
            setExpenseQuantity("");
            setSelectedBalanceId("");
            fetchBalanceSheetDetails();
            
        } catch (error) {
            console.log(error);
            
        }
    }

    useEffect(() => {
        fetchBalanceSheetDetails();
    }, [filterConditions]);
    

    useEffect(() => {
        const access = localStorage.getItem("access");
        if (access && tenant) {
            getUserDetails(access, tenant);
        } else {
            console.error('No access token found');
        }
    }, []);

    
    const [rawCheckOutTime, setRawCheckOutTime] = useState("");
    useEffect(() => {
        const date = new Date();
      
        const day = (date.getDate() < 10 ? "0" : "") + date.getDate();
        const month = (date.getMonth() + 1 < 10 ? "0" : "") + (date.getMonth() + 1);
        const year = date.getFullYear();
      
        const currentDate = `${year}-${month}-${day}`;
      
        const formattedTime = date.toLocaleTimeString([], {
          hour: "numeric", // or "2-digit"
          minute: "2-digit",
          hour12: true,    // <== this makes it 12-hour with AM/PM
        });
        const rawTime = date.toTimeString().slice(0, 5);
      
        setLatestCheckOutDate(currentDate);
        setLatestCheckOutTime(formattedTime); 
        setRawCheckOutTime(rawTime);
    }, []);
      
    const handleEdit = async (balance) => {
        // Scroll to top of form
        window.scrollTo(0, 0);
    
        // Set selected balance ID (if needed)
        setSelectedBalanceId(balance.id);
    
        // Set form fields with individual state updates
        setGiverBalance(balance.giverBalance || "");
        setExpenseType(balance.expense_type || "");
        setExpenseName(balance.expense_name || "");
        setExpenseQuantity(balance.expense_quantity || "");
        setGiverAmountReceivedOrTransferred(balance.amount_received || "");
        setGiverMode(balance.mode || "");
        setGiverGivenBy(balance.given_by || "");
        setGiverRemark(balance.purpose || "");
        setGiverAdminRemark(balance.admin_remark || "");
        setLatestCheckOutDate(balance.date || "");
        setRawCheckOutTime(balance.time || "");
    
        // Optional debug logs
        console.log("Editing balance ID: ", balance.id);
        console.log("Loaded giver balance: ", balance.expense_quantity);
    };
    
    

    const handleDelete = async (id) => {
        const accessToken = localStorage.getItem("access");
        
        try {
            await deleteBalanceDetailsApi(accessToken, id, tenant);
            notificationObject.success("Balance Sheet deleted successfully!");
            setBalanceData((prevData) => Array.isArray(prevData) ? prevData.filter(item => item.id !== id) : []);


            fetchBalanceSheetDetails();
        } catch (error) {
            notificationObject.error("Error deleting balance sheet!");
        }
    };
    
    

    return (
        <div className={styles.pageFrame}>
            {/* Header Section */}
            <div className={styles.header}>
                <FiArrowLeft className="backIcon" onClick={handleBackClick} />
                {/* Balance Sheet */}
                Day Book
            </div>

            {/* Popup Overlay */}
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

            {/* Added by - Akanksha on 10-04-2025
            Reason - To display manager name (If admin log in then admin name will display)*/}
            {staffName != "" ? (
            <div className={`${styles.staffName}`}>Staff Name : {staffName}</div>
            ) : (
            <div className={`${styles.staffName}`}>Admin : {adminName}</div>
            )}
            {/* End of code - Akanksha on 10-04-2025
            Reason - To display manager name (if admin log in then admin name will display)*/}

            <Grid container className={styles.radioButton}>
                <RadioGroup row value={selectedRole} onChange={handleRoleChange}>
                    <FormControlLabel value="receiver" control={<Radio />} label="Received" />
                    <FormControlLabel value="giver" control={<Radio />} label="Expenditure" />
                </RadioGroup>
            </Grid>

            <form className={styles.formContainer} onSubmit={handleSubmit}>
                <div className={styles.subContainer1}>
                    <div className={styles.leftContainer} style={{ opacity: selectedRole === "receiver" ? 1 : 0.6 }}>
                        <legend className={styles.legend}>Received</legend>
                        
                        <div className={styles.pair}>
                            <label className={styles.label}>Opening Balance</label>
                            <div className={styles.colon}>:</div>
                            <div className={styles.inputContainer}>
                                <input
                                    type="number"
                                    className={`${styles.input} ${styles.inputWidth}`}
                                    value={openingBalance}
                                    onChange={(e) => setOpeningBalance(e.target.value)}
                                    disabled

                                />
                            </div>
                        </div>
                        <div className={styles.pair}>
                            <label className={styles.label}>Total Amount Recieved</label>
                            <div className={styles.colon}>:</div>
                            <div className={styles.inputContainer}>
                                <input
                                    type="number"
                                    className={`${styles.input} ${styles.inputWidth}`}
                                    value={totalAmount}
                                    onChange={(e) => setTotalAmount(e.target.value)}
                                    disabled

                                />
                            </div>
                        </div>
                        <div className={styles.pair}>
                            <label className={styles.label}>Current Balance</label>
                            <div className={styles.colon}>:</div>
                            <div className={styles.inputContainer}>
                                <input
                                    type="number"
                                    className={`${styles.input} ${styles.inputWidth}`}
                                    value={totalCurrentAmount}
                                    onChange={(e) => setTotalCurrentAmount(e.target.value)}
                                    disabled

                                />
                            </div>
                        </div>
                        
                        <div className={styles.pair}>
                            <div className={styles.label}>Amount Received</div>
                            <div className={styles.colon}>:</div>
                            <div className={styles.inputContainer}>
                            <input type="number" 
                                className={`${styles.input} ${styles.inputWidth}`} 
                                disabled={selectedRole === "giver"}
                                value={amountReceivedOrTransferred}
                                // onChange={(e) => setAmountReceivedOrTransferred(e.target.value)}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === '' || parseFloat(value) >= 0) {
                                        setAmountReceivedOrTransferred(value);
                                    }
                                }}
                                onWheel={(e) => e.target.blur()}
                                required
                            />
                            </div>
                        </div>
                        <div className={styles.pair}>
                            <label className={styles.label}>Total Spendings</label>
                            <div className={styles.colon}>:</div>
                            <div className={styles.inputContainer}>
                                <input
                                    type="number"
                                    className={`${styles.input} ${styles.inputWidth}`}
                                    // disabled={selectedRole === "receiver"}
                                    value={givertotalAmount}
                                    onChange={(e) => setGiverTotalAmount(e.target.value)}
                                    disabled

                                />
                            </div>
                        </div>
                        <div className={styles.pair}>
                            <label className={styles.label}>Closing Balance</label>
                            <div className={styles.colon}>:</div>
                            <div className={styles.inputContainer}>
                                <input
                                    type="number"
                                    className={`${styles.input} ${styles.inputWidth}`}
                                    // disabled={selectedRole === "receiver"}
                                    value={closingBalance}
                                    onChange={(e) => setClosingBalance(e.target.value)}
                                    disabled

                                />
                            </div>
                        </div>
                        <div className={styles.pair}>
                            <div className={styles.label}>Payment Mode</div>
                            <div className={styles.colon}>:</div>
                            <div className={styles.inputContainer}>
                            <RadioGroup row
                                value={mode}
                                onChange={(e) => setMode(e.target.value)}
                            >
                                <FormControlLabel value="Cash" control={<Radio />} label="Cash" />
                                <FormControlLabel value="Online" control={<Radio />} label="Online" />
                            </RadioGroup>
                            </div>
                        </div>
                        <div className={styles.pair}>
                            <div className={styles.label}>Given By</div>
                            <div className={styles.colon}>:</div>
                            <div className={styles.inputContainer}>
                            <input type="text" 
                                className={`${styles.input} ${styles.inputWidth}`}
                                disabled={selectedRole === "giver"}
                                value={givenBy}
                                onChange={(e) => setGivenBy(e.target.value)}
                            />
                            </div>
                        </div>
                        <div className={styles.pair}>
                            <label className={styles.label}>Date & Time</label>
                            <div className={styles.colon}>:</div>
                            <div
                            className={styles.inputContainer}
                            style={{ display: "flex", flexDirection: "row", gap: "5px" }}
                            >
                           
                            <input
                                type="date"
                                className={`${styles.input} ${styles.inputWidth} ${styles.inputDisabled}`}
                                
                                value={latestCheckOutDate}
                                disabled={true}
                            />
                            
                            <input
                                type="text"
                                className={`${styles.input} ${styles.inputWidth} ${styles.inputDisabled}`}
                                value={latestCheckOutTime}
                                disabled={true}
                                // style={{ marginTop: "1%" }}
                            />

                            </div>
                        </div>
                        <div className={styles.pair}>
                            <div className={styles.label}>Remark</div>
                            <div className={styles.colon}>:</div>
                            <div className={styles.inputContainer}>
                            <textarea
                                type="text"
                                className={`${styles.inputWidth} ${styles.textAreaInput}`}
                                disabled={selectedRole === "giver"}
                                value={remark}
                                maxLength={250}
                                onChange={(e) => setRemark(e.target.value)}
                            />
                            </div>
                        </div>
                        <div className={styles.pair}>
                            <div className={styles.label}>Admin Remark</div>
                            <div className={styles.colon}>:</div>
                            <div className={styles.inputContainer}>
                            <textarea
                                type="text"
                                className={`${styles.inputWidth} ${styles.textAreaInput}`}
                                // disabled={selectedRole === "giver" || user.is_superuser}
                                disabled={user?.is_superuser ? false : true || selectedRole === "giver"}
                                value={adminRemark}
                                maxLength={250}
                                onChange={(e) => setAdminRemark(e.target.value)}

                            />
                            </div>
                        </div>

                    </div>
                    <div className={styles.rightContainer}
                        style={{ opacity: selectedRole === "giver" ? 1 : 0.6 }}>
                        <legend
                            className={styles.legend}
                            style={{
                            textAlign: "center",
                            fontWeight: "500",
                            fontSize: "16px",
                            }}
                        >
                            {/* Giver */}
                            Expenditure
                        </legend>
                        
                        <div className={styles.pair}>
                            <div className={styles.label}>Expense Type</div>
                            <div className={styles.colon}>:</div>
                            <div className={styles.inputContainer}>
                            <select
                                style={{ width: "48%" }}
                                className={styles.inputSection}
                                id="expense_type"
                                name="expense_type"
                                value={expenseType}
                                disabled={selectedRole === "receiver"}
                                // onChange={handleChange}
                                onChange={(e) => setExpenseType(e.target.value)}
                                // onBlur={(e) =>
                                // isValidOnBlur("expense_type", e.target.value)
                                // }
                            >
                                <option value="">Select Expense Type</option>
                                
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
                            </select>
                            </div>
                        </div>
                        
                        <div className={styles.pair}>
                            <div className={styles.label}>Expense Name</div>
                            <div className={styles.colon}>:</div>
                            <div className={styles.inputContainer}>
                            <input type="text" 
                                className={`${styles.input} ${styles.inputWidth}`}
                                disabled={selectedRole === "receiver"}
                                value={expenseName}
                                onChange={(e) => setExpenseName(e.target.value)}
                            />
                            </div>
                        </div>

                        <div className={styles.pair}>
                            <div className={styles.label}>Expense Quantity</div>
                            <div className={styles.colon}>:</div>
                            <div className={styles.inputContainer}>
                            <input type="number" 
                                className={`${styles.input} ${styles.inputWidth}`}
                                disabled={selectedRole === "receiver"}
                                value={expenseQuantity}
                                onChange={(e) => setExpenseQuantity(e.target.value)}
                                onWheel={(e) => e.target.blur()}
                            />
                            </div>
                        </div>

                        <div className={styles.pair}>
                            <div className={styles.label}>Amount Paid</div>
                            <div className={styles.colon}>:</div>
                            <div className={styles.inputContainer}>
                            <input type="number" 
                                className={`${styles.input} ${styles.inputWidth}`}
                                disabled={selectedRole === "receiver"}
                                value={giveramountReceivedOrTransferred}
                                // onChange={(e) => setGiverAmountReceivedOrTransferred(e.target.value)}
                                onChange={handleAmountTransferredChange}
                                onWheel={(e) => e.target.blur()}
                            />
                            </div>
                        </div>
                        <div className={styles.pair}>
                            <label className={styles.label}>Total Spendings</label>
                            <div className={styles.colon}>:</div>
                            <div className={styles.inputContainer}>
                                <input
                                    type="number"
                                    className={`${styles.input} ${styles.inputWidth}`}
                                    // disabled={selectedRole === "receiver"}
                                    value={givertotalAmount}
                                    onChange={(e) => setGiverTotalAmount(e.target.value)}
                                    disabled
                                />
                            </div>
                        </div>

                        <div className={styles.pair}>
                            <div className={styles.label}>Payment Mode</div>
                            <div className={styles.colon}>:</div>
                            <div className={styles.inputContainer}>
                            <RadioGroup row
                                value={givermode}
                                onChange={(e) => setGiverMode(e.target.value)}
                            >
                                <FormControlLabel value="Cash" control={<Radio />} label="Cash" />
                                <FormControlLabel value="Online" control={<Radio />} label="Online" />
                            </RadioGroup>
                            </div>
                        </div>
                        <div className={styles.pair}>
                            <div className={styles.label}>Given To</div>
                            <div className={styles.colon}>:</div>
                            <div className={styles.inputContainer}>
                            <input type="text" 
                                className={`${styles.input} ${styles.inputWidth}`} 
                                disabled={selectedRole === "receiver"}
                                value={givergivenBy}
                                maxLength={250}
                                onChange={(e) => setGiverGivenBy(e.target.value)}
                            />
                            </div>
                        </div>
                        <div className={styles.pair}>
                            <label className={styles.label}>Date & Time</label>
                            <div className={styles.colon}>:</div>
                            <div
                            className={styles.inputContainer}
                            style={{ display: "flex", flexDirection: "row", gap: "5px" }}
                            >
                           
                            <input
                                type="date"
                                className={`${styles.input} ${styles.inputWidth} ${styles.inputDisabled}`}
                                value={latestCheckOutDate}
                                disabled={true}
                            />
                            
                            <input
                                type="text"
                                className={`${styles.input} ${styles.inputWidth} ${styles.inputDisabled}`}
                                value={latestCheckOutTime}
                                disabled={true}
                                // style={{ marginTop: "1%" }}
                            />
                            </div>
                        </div>
                        <div className={styles.pair}>
                            <div className={styles.label}>Remark</div>
                            <div className={styles.colon}>:</div>
                            <div className={styles.inputContainer}>
                            <textarea
                                type="text"
                                className={`${styles.inputWidth} ${styles.textAreaInput}`}
                                disabled={selectedRole === "receiver"}
                                value={giverremark}
                                maxLength={250}
                                onChange={(e) => setGiverRemark(e.target.value)}
                            />
                            </div>
                        </div>
                        <div className={styles.pair}>
                            <div className={styles.label}>Admin Remark</div>
                            <div className={styles.colon}>:</div>
                            <div className={styles.inputContainer}>
                            <textarea
                                type="text"
                                className={`${styles.inputWidth} ${styles.textAreaInput}`}
                                // disabled={selectedRole === "receiver"}
                                disabled={user?.is_superuser ? false : true || selectedRole === "receiver"}
                                value={giveradminRemark}
                                maxLength={250}
                                onChange={(e) => setGiverAdminRemark(e.target.value)}
                            />
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: "flex", justifyContent: "center", marginTop:"10px" }}>
                    <button 
                        variant="contained" 
                        color="primary" 
                        // onClick={handleSubmit}
                        
                        className={`${styles.submitButton} submitButton`}
                        type="submit"
                    >
                        {/* Submit */}
                        {selectedBalanceId ? "Update Details" : "Submit"}
                    </button>
                </div>
            </form>

            
                      

            

            <Grid
            container
            justifyContent="center"
            alignItems="center"
            mb={2}
            paddingTop="1%"
            spacing={2}
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
                <Grid item className={styles.radioButton}>
                    <RadioGroup row value={filterMode} onChange={handleModeChange}>
                    <FormControlLabel value="Cash" control={<Radio />} label="Cash" />
                    <FormControlLabel value="Online" control={<Radio />} label="Online" />
                    </RadioGroup>
                </Grid>
            </Grid>

            {loading ? (
                    <Grid container justifyContent="center" alignItems="center">
                        <CircularProgress />
                    </Grid>
                ) : filteredBalances?.length > 0 ? (
                    <TableContainer component={Paper} elevation={3} id="balanceTable">
                        <Table>
                            <TableHead style={{ backgroundColor: "#edf7f6", fontSize: "11px" }}>
                                <TableRow>
                                    <TableCell align="center" style={{ padding: "0px", whiteSpace: "nowrap"  }}>
                                        <Button style={{ fontSize: "var(--page-content-font-size)" }}>
                                            S.NO.
                                        </Button>
                                    </TableCell>
                                    <TableCell align="center" style={{ padding: "0px", whiteSpace: "nowrap"  }}>
                                        <Button style={{ fontSize: "var(--page-content-font-size)" }}>
                                            User
                                        </Button>
                                    </TableCell>
                                    <TableCell align="center" style={{ padding: "0px", whiteSpace: "nowrap"  }}>
                                        <Button style={{ fontSize: "var(--page-content-font-size)", width: "95px" }}>
                                            {selectedRole === "giver" ? "Amount Paid" : "Amount Received"}
                                        </Button>
                                    </TableCell>
                                    <TableCell align="center" style={{ padding: "0px" , whiteSpace: "nowrap" }}>
                                        <Button style={{ fontSize: "var(--page-content-font-size)" }}>
                                            {selectedRole === "giver" ? "Given To" : "Given By"}
                                        </Button>
                                    </TableCell>
                                    <TableCell align="center" style={{ padding: "0px" , whiteSpace: "nowrap" }}>
                                        <Button style={{ fontSize: "var(--page-content-font-size)" }}>
                                            Mode
                                        </Button>
                                    </TableCell>
                                    {filteredBalances?.some(b => b.expense_type) && (
                                        <TableCell align="center" style={{ padding: "0px", whiteSpace: "nowrap"  }}>
                                            <Button style={{ fontSize: "var(--page-content-font-size)" }}>
                                                Expense Type
                                            </Button>
                                        </TableCell>
                                    )}
                                    {filteredBalances?.some(b => b.expense_name) && (
                                        <TableCell align="center" style={{ padding: "0px", whiteSpace: "nowrap"  }}>
                                            <Button style={{ fontSize: "var(--page-content-font-size)" }}>
                                                Expense Name
                                            </Button>
                                        </TableCell>
                                    )}
                                    {filteredBalances?.some(b => b.expense_quantity) && (
                                        <TableCell align="center" style={{ padding: "0px" , whiteSpace: "nowrap" }}>
                                            <Button style={{ fontSize: "var(--page-content-font-size)" }}>
                                                Expense Quantity
                                            </Button>
                                        </TableCell>
                                    )}
                                    <TableCell align="center" style={{ padding: "0px", whiteSpace: "nowrap"  }}>
                                        <Button style={{ fontSize: "var(--page-content-font-size)" }}>
                                            Remark
                                        </Button>
                                    </TableCell>
                                    {user?.is_superuser && (
                                        <TableCell align="center" style={{ padding: "0px" , whiteSpace: "nowrap" }}>
                                            <div
                                                style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                }}
                                            >
                                                <Button style={{ 
                                                    fontSize: "var(--page-content-font-size)" , 
                                                    minWidth: "auto",
                                                    padding: "2px"
                                                    }}
                                                >
                                                    Admin Remark
                                                </Button>
                                            </div>
                                        </TableCell>
                                    )}
                                    <TableCell align="center" style={{ padding: "0px", whiteSpace: "nowrap"  }}>
                                        <Button style={{ fontSize: "var(--page-content-font-size)" }}>
                                            Date & Time
                                        </Button>
                                    </TableCell>
                                    {user.is_superuser && (
                                        <TableCell align="center" style={{ padding: "0px", whiteSpace: "nowrap"  }}>
                                            <Button style={{ fontSize: "var(--page-content-font-size)" }}>
                                                Actions
                                            </Button>
                                        </TableCell>
                                    )}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {(filterMode
                                    ? filteredBalances.filter(balance => balance.mode === filterMode)
                                    : filteredBalances).map((balance, index) => (
                                    <TableRow key={index}>
                                        <TableCell align="center" style={{ padding: "4px" }}>
                                            {index + 1}
                                        </TableCell>
                                        <TableCell align="center" style={{ padding: "0px", maxWidth: '100px'
                                            
                                        }}>
                                            {balance.user}
                                        </TableCell>
                                        <TableCell align="center" style={{ padding: "0px",
                                            maxWidth: '50px', 
                                            wordWrap: "break-word", 
                                            overflowWrap: "break-word", 
                                            whiteSpace: "normal"
                                         }}>
                                            {balance.amount_received}
                                        </TableCell>
                                        <TableCell align="center" style={{
                                            maxWidth: '100px', 
                                            wordWrap: "break-word", 
                                            overflowWrap: "break-word", 
                                            whiteSpace: "normal"
                                        }}>
                                            {balance.given_by}
                                        </TableCell>
                                        <TableCell align="center" style={{ padding: "4px" }}>
                                            {balance.mode}
                                        </TableCell>
                                        {filteredBalances ?.some(b => b.expense_type) && (
                                            <TableCell align="center" style={{ padding: "4px" }}>
                                                {balance.expense_type || "-"}
                                            </TableCell>
                                        )}
                                        {filteredBalances?.some(b => b.expense_name) && (
                                            <TableCell align="center" style={{ padding: "4px" }}>
                                                {balance.expense_name || "-"}
                                            </TableCell>
                                        )}
                                        {filteredBalances?.some(b => b.expense_quantity) && (
                                            <TableCell align="center" style={{ padding: "4px" }}>
                                                {balance.expense_quantity || "-"}
                                            </TableCell>
                                        )}
                                        <TableCell align="center" style={{ padding: "4px",
                                            maxWidth: '150px', 
                                            wordWrap: "break-word", 
                                            overflowWrap: "break-word", 
                                            whiteSpace: "normal"
                                         }}>
                                            {balance.purpose}
                                        </TableCell>
                                        {user?.is_superuser && (
                                            <TableCell align="center" style={{ padding: "4px", 
                                                maxWidth: '150px', 
                                                wordWrap: "break-word", 
                                                overflowWrap: "break-word", 
                                                whiteSpace: "normal" 
                                            }}>
                                                {balance.admin_remark}
                                            </TableCell>
                                        )}
                                        <TableCell align="center" style={{ padding: "4px" }}>
                                            {new Intl.DateTimeFormat("en-GB", {
                                                day: "2-digit",
                                                month: "2-digit",
                                                year: "numeric",
                                            }).format(new Date(balance.date))}{" "}
                                            {new Intl.DateTimeFormat("en-GB", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                hour12: true,
                                            }).format(new Date(`${balance.date}T${balance.time}`))}
                                        </TableCell>
                                        {user.is_superuser && (
                                            <TableCell align="center" style={{ padding: "4px" }}>
                                                <FaEdit
                                                    style={{ cursor: "pointer", color: "#f79330" }}
                                                    onClick={(e) => handleEdit(balance)}
                                                />
                                                &nbsp; &nbsp; &nbsp;
                                                <MdDelete
                                                    style={{ cursor: "pointer", color: "#EB0B0B" }}
                                                    onClick={() => handleDelete(balance.id)}
                                                />
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                ) : (
                    <Typography variant="h6" align="center">
                        No data available.
                    </Typography>
                )
            }

             
        </div>
        
    );
};

export default BalanceSheet;
