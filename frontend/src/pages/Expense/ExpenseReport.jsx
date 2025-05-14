/**Module Creation by Tejasve Gupta on 22-06-2024*/

import React, { useContext, useEffect, useState } from "react";
import expenseStyle from "./ExpenseReport.module.css";
import { getExpenseDetailsApi } from "../../Api/services";
import {
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
} from "@mui/material";
import { styled } from "@mui/system";
import { GlobalContext } from "../../context/Context";

const StyledButton = styled(Button)({
  backgroundColor: "#4caf50",
  color: "#fff",
  "&:hover": {
    backgroundColor: "#45a049",
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

const StyledCard = styled(Card)({
  width: "220px",
  height: "100px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center", // Decreased width
  padding: "7px", // Adjusted padding
  backgroundColor: "#f5f5f5",
  borderRadius: "10px",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  textAlign: "center",
  "&:hover": {
    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
  },
});

const ExpenseReport = () => {
  const [expenses, setExpenses] = useState([]);
  const { tenant } = useContext(GlobalContext);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [fromDateError, setFromDateError] = useState("");
  const [toDateError, setToDateError] = useState("");

  useEffect(() => {
    const fetchExpenseDetails = async () => {
      try {
        const access = localStorage.getItem("access");
        const response = await getExpenseDetailsApi(access, tenant);
        // Modification and addition by Om Shrivastava on 30-09-2024
        // Reason : Handle the data
        // setExpenses(response?.expenseList || []);
        setExpenses(response || []);
        // End of modification and addition by Om Shrivastava on 30-09-2024
        // Reason : Handle the data

        setFilteredExpenses(response);
      } catch (error) {
        console.error("Error fetching expense details:", error);
      }
    };

    fetchExpenseDetails();
  }, []);

  const handleFilter = () => {
    let isValid = true;

    if (!fromDate) {
      setFromDateError("Please select a start date.");
      isValid = false;
    } else {
      setFromDateError("");
    }

    if (!toDate) {
      setToDateError("Please select an end date.");
      isValid = false;
    } else {
      setToDateError("");
    }

    if (isValid) {
      const from = new Date(fromDate);
      const to = new Date(toDate);

      const filtered = expenses.filter((expense) => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= from && expenseDate <= to;
      });

      setFilteredExpenses(filtered);
    }
  };

  const handleClear = () => {
    setFromDate("");
    setToDate("");
    setFromDateError("");
    setToDateError("");
    setFilteredExpenses(expenses);
  };

  const calculateTotal = (type) => {
    return filteredExpenses
      .filter((expense) => type === "All" || expense.expense_type === type)
      .reduce((total, expense) => total + parseFloat(expense.amount), 0)
      .toFixed(2);
  };

  return (
    <div className={expenseStyle.pageFrame}>
      <div className={expenseStyle.header}>Expense Report</div>
      <div className={expenseStyle.pageContainer}>
        <Grid
          container
          spacing={3}
          justifyContent="center"
          alignItems="center"
          style={{ marginBottom: "20px" }}
        >
          <Grid item>
            <StyledTextField
              label="From"
              type="date"
              InputLabelProps={{
                shrink: true,
              }}
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                if (e.target.value) {
                  setFromDateError("");
                }
              }}
              variant="outlined"
              error={!!fromDateError}
              helperText={fromDateError}
            />
          </Grid>
          <Grid item>
            <StyledTextField
              label="To"
              type="date"
              InputLabelProps={{
                shrink: true,
              }}
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                if (e.target.value) {
                  setToDateError("");
                }
              }}
              variant="outlined"
              error={!!toDateError}
              helperText={toDateError}
            />
          </Grid>
          <Grid item>
            <StyledButton variant="contained" onClick={handleFilter}>
              Apply Filter
            </StyledButton>
            <ClearButton variant="contained" onClick={handleClear}>
              Clear
            </ClearButton>
          </Grid>
        </Grid>

        {/* Card Section */}
        <Grid
          container
          spacing={1}
          justifyContent="center"
          alignItems="center"
          wrap="wrap"
          paddingTop="0.5%"
        >
          <Grid item>
            <StyledCard style={{ backgroundColor: "#e3f2fd" }}>
              {" "}
              {/* Light Blue */}
              <CardContent>
                <Typography
                  variant="h6"
                  style={{ fontSize: "16px", fontWeight: "500" }}
                >
                  All Expenses
                </Typography>
                <Typography
                  variant="h4"
                  style={{ fontSize: "22px", fontWeight: "500" }}
                >
                  ₹{calculateTotal("All")}
                </Typography>
              </CardContent>
            </StyledCard>
          </Grid>
          <Grid item>
            <StyledCard style={{ backgroundColor: "#ffebee" }}>
              {" "}
              {/* Light Red */}
              <CardContent>
                <Typography
                  variant="h6"
                  style={{ fontSize: "16px", fontWeight: "500" }}
                >
                  Accounting expenses
                </Typography>
                <Typography
                  variant="h4"
                  style={{ fontSize: "22px", fontWeight: "500" }}
                >
                  ₹{calculateTotal("Accounting expenses")}
                </Typography>
              </CardContent>
            </StyledCard>
          </Grid>
          <Grid item>
            <StyledCard style={{ backgroundColor: "#fff9c4" }}>
              {" "}
              {/* Light Yellow */}
              <CardContent>
                {/* Modified by - Ashish Dewangan on 23-09-2024
                 * Reason - To hide transportation expenses and show commission expenses */}
                {/* <Typography
                  variant="h6"
                  style={{ fontSize: "16px", fontWeight: "500" }}
                >
                  Transportation Expenses
                </Typography> 
                <Typography
                  variant="h4"
                  style={{ fontSize: "22px", fontWeight: "500" }}
                >
                  ₹{calculateTotal("Transportation expenses")}
                </Typography> */}
                <Typography
                  variant="h6"
                  style={{ fontSize: "16px", fontWeight: "500" }}
                >
                  Cleaning expenses
                </Typography>
                <Typography
                  variant="h4"
                  style={{ fontSize: "22px", fontWeight: "500" }}
                >
                  ₹{calculateTotal("Cleaning expenses")}
                </Typography>
                {/* End of modification by - Ashish Dewangan on 23-09-2024
                 * Reason - To hide transportation expenses and show commission expenses */}
              </CardContent>
            </StyledCard>
          </Grid>
          <Grid item>
            <StyledCard style={{ backgroundColor: "#e8f5e9" }}>
              {" "}
              {/* Light Green */}
              <CardContent>
                <Typography
                  variant="h6"
                  style={{ fontSize: "16px", fontWeight: "500" }}
                >
                  Electricity expenses
                </Typography>
                <Typography
                  variant="h4"
                  style={{ fontSize: "22px", fontWeight: "500" }}
                >
                  ₹{calculateTotal("Electricity expenses")}
                </Typography>
              </CardContent>
            </StyledCard>
          </Grid>
          <Grid item>
            <StyledCard style={{ backgroundColor: "#f3e5f5" }}>
              {" "}
              {/* Light Purple */}
              <CardContent>
                <Typography
                  variant="h6"
                  style={{ fontSize: "16px", fontWeight: "500" }}
                >
                  {/* Miscellaneous Expenses */}
                  Entertainment expenses
                </Typography>
                <Typography
                  variant="h4"
                  style={{ fontSize: "22px", fontWeight: "500" }}
                >
                  {/* ₹{calculateTotal("Miscellaneous Expenses")} */}₹
                  {calculateTotal("Entertainment expenses")}
                </Typography>
              </CardContent>
            </StyledCard>
          </Grid>

          {/* Added by - Ashish Dewangan on 05-10-2024
           * Reason - Added more expenses as specified by the client */}
          <Grid item>
            <StyledCard style={{ backgroundColor: "#ffcdf1" }}>
              {" "}
              <CardContent>
                <Typography
                  variant="h6"
                  style={{ fontSize: "16px", fontWeight: "500" }}
                >
                  Maintenance expenses
                </Typography>
                <Typography
                  variant="h4"
                  style={{ fontSize: "22px", fontWeight: "500" }}
                >
                  ₹{calculateTotal("Maintenance expenses")}
                </Typography>
              </CardContent>
            </StyledCard>
          </Grid>

          <Grid item>
            <StyledCard style={{ backgroundColor: "#ded4fc" }}>
              {" "}
              <CardContent>
                <Typography
                  variant="h6"
                  style={{ fontSize: "16px", fontWeight: "500" }}
                >
                  Miscellaneous expenses
                </Typography>
                <Typography
                  variant="h4"
                  style={{ fontSize: "22px", fontWeight: "500" }}
                >
                  ₹{calculateTotal("Miscellaneous expenses")}
                </Typography>
              </CardContent>
            </StyledCard>
          </Grid>
          <Grid item>
            <StyledCard style={{ backgroundColor: "#f0ded8" }}>
              {" "}
              <CardContent>
                <Typography
                  variant="h6"
                  style={{ fontSize: "16px", fontWeight: "500" }}
                >
                  Newspaper bill expenses
                </Typography>
                <Typography
                  variant="h4"
                  style={{ fontSize: "22px", fontWeight: "500" }}
                >
                  ₹{calculateTotal("Newspaper bill expenses")}
                </Typography>
              </CardContent>
            </StyledCard>
          </Grid>
          <Grid item>
            <StyledCard style={{ backgroundColor: "#f0f0f1" }}>
              {" "}
              <CardContent>
                <Typography
                  variant="h6"
                  style={{ fontSize: "16px", fontWeight: "500" }}
                >
                  Staff advance expenses
                </Typography>
                <Typography
                  variant="h4"
                  style={{ fontSize: "22px", fontWeight: "500" }}
                >
                  ₹{calculateTotal("Staff advance expenses")}
                </Typography>
              </CardContent>
            </StyledCard>
          </Grid>
          <Grid item>
            <StyledCard style={{ backgroundColor: "#9df4e4" }}>
              {" "}
              <CardContent>
                <Typography
                  variant="h6"
                  style={{ fontSize: "16px", fontWeight: "500" }}
                >
                  Stationary expenses
                </Typography>
                <Typography
                  variant="h4"
                  style={{ fontSize: "22px", fontWeight: "500" }}
                >
                  ₹{calculateTotal("Stationary expenses")}
                </Typography>
              </CardContent>
            </StyledCard>
          </Grid>
          <Grid item>
            <StyledCard style={{ backgroundColor: "#ffd9b4" }}>
              {" "}
              <CardContent>
                <Typography
                  variant="h6"
                  style={{ fontSize: "16px", fontWeight: "500" }}
                >
                  Taxi commission
                </Typography>
                <Typography
                  variant="h4"
                  style={{ fontSize: "22px", fontWeight: "500" }}
                >
                  ₹{calculateTotal("Taxi commission")}
                </Typography>
              </CardContent>
            </StyledCard>
          </Grid>
          <Grid item>
            <StyledCard style={{ backgroundColor: "#fabebe" }}>
              {" "}
              <CardContent>
                <Typography
                  variant="h6"
                  style={{ fontSize: "16px", fontWeight: "500" }}
                >
                  Telephone expenses
                </Typography>
                <Typography
                  variant="h4"
                  style={{ fontSize: "22px", fontWeight: "500" }}
                >
                  ₹{calculateTotal("Telephone expenses")}
                </Typography>
              </CardContent>
            </StyledCard>
          </Grid>
          <Grid item>
            <StyledCard style={{ backgroundColor: "#a5eafd" }}>
              {" "}
              <CardContent>
                <Typography
                  variant="h6"
                  style={{ fontSize: "16px", fontWeight: "500" }}
                >
                  Others
                </Typography>
                <Typography
                  variant="h4"
                  style={{ fontSize: "22px", fontWeight: "500" }}
                >
                  ₹{calculateTotal("Others")}
                </Typography>
              </CardContent>
            </StyledCard>
          </Grid>
          {/* End of addition by - Ashish Dewangan on 05-10-2024
           * Reason - Added more expenses as specified by the client */}
        </Grid>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            paddingTop: "2%",
          }}
        >
          <table className={expenseStyle.table}>
            <thead>
              <tr>
                <th className={expenseStyle.th}>S.No</th>
                <th className={expenseStyle.th}>Expense type</th>
                <th className={expenseStyle.thData}>Expense Name</th>
                <th className={expenseStyle.thQtyData}>Qty</th>
                <th className={expenseStyle.th}>Amount</th>
                <th className={expenseStyle.thData}>Date</th>
                <th className={expenseStyle.th}>Time</th>
                <th className={expenseStyle.th}>Create by</th>
                <th className={expenseStyle.thData}>Paid by</th>
                <th className={expenseStyle.th}>Payment Type</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td
                    // Modification and addition by Om Shrivastava on 01-10-2024
                    // Reason : Set the text in center and also need to remove the border
                    colSpan="12"
                    style={{ textAlign: "center", border: "none" }}
                    // End of modification and addition by Om Shrivastava on 01-10-2024
                    // Reason : Set the text in center and also need to remove the border
                  >
                    No data found
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense, index) => (
                  <tr key={index}>
                    <td className={expenseStyle.td}>{index + 1}</td>
                    <td className={expenseStyle.td}>{expense.expense_type}</td>
                    <td className={expenseStyle.td}>{expense.name}</td>
                    <td className={expenseStyle.td}>{expense.quantity}</td>
                    <td className={expenseStyle.td}>{expense.amount}</td>
                    <td
                      className={expenseStyle.td}
                      style={{ textAlign: "center" }}
                    >
                      {new Date(expense.date).toLocaleDateString("en-GB")}
                    </td>
                    <td className={expenseStyle.td}>{expense.time}</td>
                    <td className={expenseStyle.td}>{expense.paid_to}</td>
                    <td className={expenseStyle.td}>{expense.paid_by}</td>
                    <td className={expenseStyle.td}>{expense.payment_type}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExpenseReport;
