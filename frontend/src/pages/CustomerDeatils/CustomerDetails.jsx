/**
 * Added by - Akanksha on 23-10-2024
 * Reason - Created new Customer Details list page
 */
import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Grid,
  Typography,
  TextField,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Pagination,
} from "@mui/material";

import { getCheckOutList } from "../../Api/services";
import { useNavigate } from "react-router-dom";
import style from "./CustomerDetails.module.css";
import { styled } from "@mui/system";

import { AiOutlineArrowUp, AiOutlineArrowDown } from "react-icons/ai";
import * as XLSX from "xlsx";
import { FiArrowLeft } from "react-icons/fi";
import { GlobalContext } from "../../context/Context";


const CustomerDetails = () => {
  const navigate = useNavigate();
  const [groupedBookedRoomList, setGroupedBookedRoomList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsSize, setItemsSize] = useState(0);
  const [sortField, setSortField] = useState("id");
  const [sortOrder, setSortOrder] = useState("desc");
  const { tenant} = useContext(GlobalContext);

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
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    sortField: "id",
    sortOrder: "desc",
    pageNumber: 1,
    pageSize: 10,
    dateFilter: "thisYear",
    /**
     * Added by - Ashish Dewangan on 15-11-2024
     * Reason - To specify the page.
     * pagination will be applied if customerDetails as a value will be sent to backed
     */
    filterPage: "customerDetails",
    /**
     * End of addition by - Ashish Dewangan on 15-11-2024
     * Reason - To specify the page.
     * pagination will be applied if customerDetails as a value will be sent to backed
     */
  });
  const [noRecordsFound, setNoRecordsFound] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [fromDateError, setFromDateError] = useState("");
  const [toDateError, setToDateError] = useState("");

  useEffect(() => {
    checkoutList();
  }, [filters]);

  const checkoutList = async () => {
    setIsLoading(true);
    try {
      const access = localStorage.getItem("access");
      const { startDate, endDate } = getDateRange(filters.dateFilter);

      const updatedFilters = { ...filters, startDate, endDate };

      const response = await getCheckOutList(access, updatedFilters, tenant);

      if (response) {
        const groupedData = groupByBillingId(response.filtered_checkouts);
        setNoRecordsFound(response.filtered_checkouts.length === 0);
        setItemsSize(response.total_checkouts);
        setGroupedBookedRoomList(groupedData);
      } else {
        console.error("No data received from API");
        setGroupedBookedRoomList([]);
        setItemsSize(0);
        setNoRecordsFound(true);
      }
    } catch (error) {
      console.error("Error fetching check-in details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
  };
  const groupByBillingId = (bookedRooms) => {
    const groupedData = {};
    let i = 0;
    bookedRooms.forEach((booking) => {
      const billingId = booking.billing_id;
      if (!groupedData[i]) {
        groupedData[i] = {
          billing_id: billingId,
          room_number: new Set(),
          room_type: new Set(),
          variety: new Set(),
          room_charges: booking.room_charges || 0,
          grand_total: booking.grand_total || 0,
          arrival_date: booking.billing_details.arrival_date,
          arrival_time: booking.billing_details.arrival_time,
          departure_date: booking.billing_details.departure_date,
          departure_time: booking.billing_details.departure_time,
          created_at: booking.personal_details?.created_at,
          daily_rate: booking.daily_rate || 0,
          salutation: booking.personal_details?.salutation || "",
          name: booking.personal_details?.name || "Unknown",
          phone: booking.personal_details?.phone || "Unknown",
          idcardNo: booking.personal_details?.id_card_no || "Unknown",
          idcardType: booking.personal_details?.id_card_type || "Unknown",
          roomNoVarietyPrice: booking.rooms,
          is_cancelled: booking.billing_details.is_cancelled,
          total_paid: booking.total_paid,
          refunded_amount: booking.refunded_amount,
          // Added by akanksha on 24th Oct 24, Reason : To add number_of_persons column
          number_of_persons: booking.billing_details.number_of_persons || "",
          // End by akanksha on 24th Oct 24, Reason : To add number_of_persons column
          /**
           * Added by - Ashish Dewangan on 27-10-2024
           * Reason - To customer email
           */
          email: booking.personal_details?.email,
          /**
           * End of addition by - Ashish Dewangan on 27-10-2024
           * Reason - To customer email
           */
        };
      }

      groupedData[i].arrival_date = formatDate(
        booking.billing_details.arrival_date
      );
      groupedData[i].arrival_time = booking.billing_details.arrival_time;

      groupedData[i].departure_date = formatDate(
        booking.billing_details.departure_date
      );
      groupedData[i].departure_time = booking.billing_details.departure_time;

      groupedData[i].user_id_at_checkout = booking.user_id_at_checkout;

      if (booking.rooms && booking.rooms.length > 0) {
        booking.rooms.forEach((room) => {
          groupedData[i].room_number.add(room.number || "Unknown Room Number");
          groupedData[i].room_type.add(room.type || "Unknown Room Type");
          groupedData[i].variety.add(room.variety || "Unknown Room variety");
        });
      }
      i++;
    });

    return Object.values(groupedData).map((group) => ({
      ...group,
      room_number: Array.from(group.room_number),
      room_type: Array.from(group.room_type),
      variety: Array.from(group.variety),
    }));
  };

  const handlePrint = () => {
    /**
     * Added by - Ashish Dewangan on 27-10-2024
     * Reason - To print only table part
     */
    // let divContents = document.getElementById("customerTable").innerHTML;
    // let printWindow = window.open('', '');
    // printWindow.document.open();
    // printWindow.document.write(`
    //     <html>
    //     <head>

    //         <style>

    //         .MuiTableContainer-root {
    //           background-color: #fff;
    //           color: rgba(0, 0, 0, 0.87);
    //           -webkit-transition: box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
    //           transition: box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
    //           border-radius: 4px;
    //           box-shadow: 0px 3px 3px -2px rgba(0, 0, 0, 0.2), 0px 3px 4px 0px rgba(0, 0, 0, 0.14), 0px 1px 8px 0px rgba(0, 0, 0, 0.12);
    //           width: 100%;
    //           overflow-x: auto;
    //       }
    //       .MuiTable-root {
    //         display: table;
    //         width: 100%;
    //         border-collapse: collapse;
    //         border-spacing: 0;
    //     }
    //     .MuiTableHead-root {
    //       background-color: rgb(237, 247, 246);
    //       font-size: 11px;
    //       display: table-header-group;
    //   }
    //           .MuiTableRow-root {
    //             color: inherit;
    //             display: table-row;
    //             vertical-align: middle;
    //             outline: 0;
    //         }

    //         .MuiTableCell-root {
    //           font-family: "Roboto", "Helvetica", "Arial", sans-serif;
    //           font-weight: 500;
    //           font-size: 0.875rem;
    //           line-height: 1.5rem;
    //           letter-spacing: 0.01071em;
    //           display: table-cell;
    //           vertical-align: inherit;
    //           border-bottom: 1px solid rgba(224, 224, 224, 1);
    //           text-align: center;
    //           padding: 16px;
    //           color: rgba(0, 0, 0, 0.87);
    //       }

    //      .MuiOutlinedInput-root {
    //         height: 40px,
    //         background-color: transparent,
    //         border-radius: 5px,

    //       }
    //       .MuiOutlinedInput-root fieldset {
    //         border-color: #4caf50,
    //       },
    //       .MuiOutlinedInput-root :hover fieldset {
    //         border-color: #388e3c,
    //       }
    //       .Mui-focused fieldset {
    //         border-color: #1b5e20,
    //       }

    //         </style>
    //     </head>
    //     <body>
    //         ${divContents}
    //     </body>
    //     </html>
    // `);
    // printWindow.document.close();
    // printWindow.print();

    // var printContents = document.getElementById("customerTable").innerHTML;
    // var originalContents = document.body.innerHTML;

    // window.onafterprint = back;

    // function back() {
    //   window.document.close()
    //     window.close()

    // }

    // document.body.innerHTML = printContents;
    // document.body.style.zoom = '60%';
    // window.print();
    // document.body.style.zoom = '100%';
    // // window.location.reload()
    // document.body.innerHTML = originalContents;
    var printContents = document.getElementById("customerTable").innerHTML;
    // var printWindow = window.open("", "");
    // var printWindow = window.open("", "_blank", "width=800,height=600");

    const printWindow = window.open(
      "data:text/html;charset=utf-8," +
        encodeURIComponent("<html><head><title>Print</title>"),
      "_blank"
    );

    printWindow.document.write("<html><head>");

    printWindow.document.write("<title>Customer Details</title>");

    Array.from(
      document.querySelectorAll("style, link[rel='stylesheet']")
    ).forEach((styleNode) => {
      printWindow.document.write(styleNode.outerHTML);
    });
    printWindow.document.write(`
    <style>
        @page {
                margin: 0; 
            }
        body {
            transform: scale(0.6); 
            transform-origin: top left;
            width: 165%; 
            margin: 0; 
        }
    </style>
    `);

    printWindow.document.write("</head><body>");
    // printWindow.document.write(
    //   '<div style="text-align:center;margin:5px;">Customer Details</div>'
    // );
    printWindow.document.write(printContents);
    printWindow.document.write("</body></html>");

    printWindow.document.close();
    printWindow.print();

    // // Adjust page scale before printing
    // document.body.style.zoom = '50%'; // Adjust the zoom as necessary

    // window.print();

    // // // Reset zoom after printing
    // document.body.style.zoom = '100%';

    /**
     * End of modification by - Ashish Dewangan on 27-10-2024
     * Reason - To print only table part
     */
  };

  const handleExport = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(
      filteredAndDateFilteredData.map((group, index) => {
        return {
          S_No: (currentPage - 1) * filters.pageSize + index + 1,
          Name: `${group.salutation || ""} ${group.name || ""}`,
          Phone: group.phone || "",
          ID_Type: group.idcardType || "",
          ID_Number: group.idcardNo || "",
          Arrival_Date_Time: `${group.arrival_date || ""} ${new Date(
            `1970-01-01T${group.arrival_time || ""}`
          ).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })}`,
          Departure_Date_Time: `${group.departure_date || ""} ${new Date(
            `1970-01-01T${group.departure_time || ""}`
          ).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })}`,
          Number_of_Persons: group.number_of_persons || "",
          Email: String(group.email || ""), // Ensure it's a string
        };
      })
    );

    XLSX.utils.book_append_sheet(wb, ws, "Customer Details");
    XLSX.writeFile(wb, "Customer_Details.xlsx");
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setFilters({ ...filters, pageNumber: page });
  };
  const handleSortChange = (field) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      sortField: field,
      sortOrder: prevFilters.sortOrder === "asc" ? "desc" : "asc",
    }));
  };
  // const handleSort = (field) => {
  //   const newSortOrder = sortOrder === "asc" ? "desc" : "asc";
  //   setSortOrder(newSortOrder);
  //   setSortField(field);
  // };
  // Added by akanksha on 24th Oct, reason to apply sorting from backend
  const handleSort = (field) => {
    const newSortOrder =
      filters.sortField === field && filters.sortOrder === "asc"
        ? "desc"
        : "asc";
    setFilters({ ...filters, sortField: field, sortOrder: newSortOrder });
  };
  // Added by akanksha on 24th Oct, reason to apply sorting from backend

  const sortData = (data, sortField, sortOrder) => {
    return [...data].sort((a, b) => {
      const aValue = a[sortField]; // Get the value of the sort field for object a
      const bValue = b[sortField]; // Get the value of the sort field for object b

      if (sortOrder === "asc") {
        if (typeof aValue === "string" && typeof bValue === "string") {
          return aValue.localeCompare(bValue); // For strings, use localeCompare
        }
        return aValue - bValue; // For numbers
      } else {
        if (typeof aValue === "string" && typeof bValue === "string") {
          return bValue.localeCompare(aValue); // For strings in descending order
        }
        return bValue - aValue;
      }
    });
  };

  // const handleDateChange = (e) => {
  //   const { name, value } = e.target;
  //   setFilters({ ...filters, [name]: value });
  // };

  const handleDateChange = (startDate, endDate) => {
    /**
     * Modified by - Ashish Dewangan on 14-11-2024
     * Reason - To set date filter condition to custom if user selects date from fromDate and toDate input boxes
     */
    // setFilters(prevFilters => ({
    //   ...prevFilters,
    //   startDate:startDate,
    //   endDate:endDate,
    // }));
    setFilters((prevFilters) => ({
      ...prevFilters,
      startDate: startDate,
      endDate: endDate,
      dateFilter: "custom",
      pageNumber: 1,
    }));
    setCurrentPage(1);
    /**
     * End of modification by - Ashish Dewangan on 14-11-2024
     * Reason - To set date filter condition to custom if user selects date from fromDate and toDate input boxes
     */
  };

  const handleDateFilterChange = (e) => {
    const { value } = e.target;
    // setFilters({ ...filters, dateFilter: value });
    /**
     * Added by - Ashish Dewangan on 14-11-2024
     * Reason - To reset custom date input boxes when radio button for today, this week,
     *  this month and this year is selected
     */
    setCurrentPage(1);
    setFilters({ ...filters, dateFilter: value, pageNumber: 1 });
    setFromDate("");
    setToDate("");
    /**
     * End of addition by - Ashish Dewangan on 14-11-2024
     * Reason - To reset custom date input boxes when radio button for today, this week,
     *  this month and this year is selected
     */
  };

  const getDateRange = (filter) => {
    const today = new Date();
    let startDate, endDate;

    switch (filter) {
      case "today":
        startDate = endDate = today.toISOString().split("T")[0];
        break;
      case "thisWeek":
        var currentDate = new Date();
        var y = currentDate.getFullYear();
        var m = currentDate.getMonth() + 1; // JavaScript months are 0-based
        var d = currentDate.getDate();
        var day = currentDate.getDay();

        // Calculate the first day of the week (Monday)
        var first = d - day + (day === 0 ? -6 : 1); // Adjust for Sunday being 0
        var firstDate = new Date(currentDate);
        firstDate.setDate(first);

        // Calculate the last day of the week (Sunday)
        var lastDate = new Date(firstDate);
        lastDate.setDate(firstDate.getDate() + 6);

        // Format the dates to YYYY-MM-DD
        startDate =
          firstDate.getFullYear() +
          "-" +
          (firstDate.getMonth() + 1).toString().padStart(2, "0") +
          "-" +
          firstDate.getDate().toString().padStart(2, "0");

        endDate =
          lastDate.getFullYear() +
          "-" +
          (lastDate.getMonth() + 1).toString().padStart(2, "0") +
          "-" +
          lastDate.getDate().toString().padStart(2, "0");

        break;

      // case "thisMonth":
      //   var currentDate = new Date();
      //   var y = currentDate.getFullYear();
      //   var m = currentDate.getMonth();
      //   var lastDayOfMonth = new Date(y, m, 0).getDate();
      //   // startDate = y + "-" + "01" + "-" + "01";
      //   // endDate = y + "-" + "12" + "-" + "31";
      //   startDate = y + "-" + (m < 10 ? "0" : "") + m + "-" + "01";
      //   endDate =
      //     y +
      //     "-" +
      //     (m < 10 ? "0" : "") +
      //     m +
      //     "-" +
      //     (lastDayOfMonth < 10 ? "0" : "") +
      //     lastDayOfMonth;

      //   break;
      case "thisMonth":
        var currentDate = new Date();
        var y = currentDate.getFullYear();
        var m = currentDate.getMonth() + 1; // Add 1 to make it 1-based (Jan = 1)

        // Get last day of this month
        const lastDayOfMonth = new Date(y, m, 0).getDate();

        // Format month and day with leading zeros
        const formattedMonth = m < 10 ? "0" + m : m;

        startDate = `${y}-${formattedMonth}-01`;
        endDate = `${y}-${formattedMonth}-${lastDayOfMonth < 10 ? "0" + lastDayOfMonth : lastDayOfMonth}`;
        break;

      case "thisYear":
        var currentDate = new Date();
        var y = currentDate.getFullYear();
        startDate = y + "-" + "01" + "-" + "01";
        endDate = y + "-" + "12" + "-" + "31";
        break;

      default:
        startDate = filters.startDate;
        endDate = filters.endDate;
        break;
    }

    return { startDate, endDate };
  };

  useEffect(() => {
    const { startDate, endDate } = getDateRange(filters.dateFilter);
    setFilters({ ...filters, startDate, endDate });
  }, [filters.dateFilter]);

  const filteredNewData = groupedBookedRoomList.filter(
    (data) =>
      data.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      data.phone.includes(searchQuery)
  );

  useEffect(() => {
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      if (from > to) {
        setToDateError("To date cannot be before From date.");
      } else {
        setToDateError("");
      }
    }
  }, [fromDate, toDate]);

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

  const handleRemoveFilter = () => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      dateFilter: "thisYear",
    }));
    setFromDate("");
    setToDate("");
    // setFilteredData(data); // Reset to original data
  };

  const filterByDateRange = (data) => {
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      return data.filter((group) => {
        const [day, month, year] = group.departure_date.split("-");
        const departureDate = new Date(`${year}-${month}-${day}`);
        return departureDate >= from && departureDate <= to;
      });
    }
    return data;
  };

  // const filteredAndDateFilteredData = sortData(
  //   filterByDateRange(filteredNewData),
  //   sortField,
  //   sortOrder
  // );

  /**
   * Modified by - Ashish Dewangan on 14-11-2024
   * Reason - To remove unnecessary refilteration of date
   */
  // const filteredAndDateFilteredData = filterByDateRange(filteredNewData);
  const filteredAndDateFilteredData = filteredNewData;
  /**
   * End of modification by - Ashish Dewangan on 14-11-2024
   * Reason - To remove unnecessary refilteration of date
   */

  const parseDateTime = (dateString, timeString) => {
    const [day, month, year] = dateString.split("-");
    const [hours, minutes, seconds] = timeString.split(":");

    return new Date(year, month - 1, day, hours, minutes, seconds);
  };

  const now = new Date();
  const handleClear = () => {
    setSearchQuery("");
  };

  return (
    <div className={style.pageFrame}>
      <div className={style.header}>
        {/* Modification and addition by Om Shrivastava on 03-01-2025
              Reason : Add back icon  */}
        <FiArrowLeft className="backIcon" onClick={handleBackClick} />
        Customer Details
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

      <Grid
        container
        spacing={2}
        justifyContent="center"
        alignItems="center"
        style={{ paddingBottom: "2%", paddingTop: "1%" }}
      >
        <Grid item>
          <RadioGroup
            row
            value={filters.dateFilter}
            onChange={handleDateFilterChange}
          >
            <FormControlLabel value="today" control={<Radio />} label="Today" />
            <FormControlLabel
              value="thisWeek"
              control={<Radio />}
              label="This Week"
            />
            <FormControlLabel
              value="thisMonth"
              control={<Radio />}
              label="This Month"
            />
            <FormControlLabel
              value="thisYear"
              control={<Radio />}
              label="This Year"
            />
          </RadioGroup>
        </Grid>

        <Grid item>
          <StyledTextField
            label="From"
            type="date"
            InputLabelProps={{
              shrink: true,
            }}
            value={fromDate}
            onChange={(e) => {
              const newFromDate = e.target.value;
              setFromDate(newFromDate);
              if (newFromDate) {
                setFromDateError("");
              }
              handleDateChange(newFromDate, toDate);
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
              const newToDate = e.target.value;
              setToDate(newToDate);
              if (newToDate) {
                setToDateError("");
              }
              handleDateChange(fromDate, newToDate);
            }}
            variant="outlined"
            error={!!toDateError}
            helperText={toDateError}
          />
        </Grid>

        <Grid item>
          <ClearButton variant="contained" onClick={handleRemoveFilter}>
            Remove Filter
          </ClearButton>
        </Grid>
      </Grid>

      {filteredAndDateFilteredData.length > 0 && (
        <Grid
          container
          justifyContent="flex-end"
          spacing={2}
          mb={2}
          sx={{ pr: 2 }}
        >
          <Grid item>
            <Typography variant="body1" component="span" sx={{ mr: 1 }}>
              To print or export the table, click here:
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handlePrint}
              sx={{ mr: 1 }}
            >
              Print
            </Button>

            <Button
              variant="contained"
              color="secondary"
              onClick={handleExport}
            >
              Export to Excel
            </Button>
          </Grid>
        </Grid>
      )}

      {isLoading ? (
        <Grid container justifyContent="center" alignItems="center">
          <CircularProgress />
        </Grid>
      ) : noRecordsFound ? (
        <Typography variant="h6" align="center">
          No Records Found
        </Typography>
      ) : (
        <TableContainer component={Paper} elevation={3} id="customerTable">
          <Table>
            <TableHead
              style={{
                backgroundColor: "#edf7f6",
                fontSize: "11px",
              }}
            >
              <TableRow>
                <TableCell align="center" style={{ padding: "0px" }}>
                  <Button style={{ fontSize: "var(--page-content-font-size)" }}>
                    {" "}
                    S.NO.
                  </Button>
                </TableCell>
                <TableCell align="center" style={{ padding: "0px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Button
                      style={{
                        fontSize: "var(--page-content-font-size)",
                        padding: "2px",
                        minWidth: "auto",
                      }}
                    >
                      name
                    </Button>
                    <Button
                      style={{
                        fontSize: "var(--page-content-font-size)",
                        padding: "2px",
                        minWidth: "auto",
                      }}
                      onClick={() => handleSort("name")}
                    >
                      {sortField === "name" && sortOrder === "asc" ? (
                        <AiOutlineArrowUp />
                      ) : (
                        <AiOutlineArrowDown />
                      )}
                    </Button>
                  </div>
                </TableCell>
                <TableCell align="center" style={{ padding: "0px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Button
                      style={{
                        fontSize: "var(--page-content-font-size)",
                        padding: "2px",
                        minWidth: "auto",
                      }}
                    >
                      Phone Number
                    </Button>
                    <Button
                      style={{
                        fontSize: "var(--page-content-font-size)",
                        padding: "2px",
                        minWidth: "auto",
                      }}
                      onClick={() => handleSort("phone")} // Here, 'phone_number' is the key in the data object
                    >
                      {sortField === "phone" && sortOrder === "asc" ? (
                        <AiOutlineArrowUp />
                      ) : (
                        <AiOutlineArrowDown />
                      )}
                    </Button>
                  </div>
                </TableCell>

                <TableCell align="center" style={{ padding: "0px" }}>
                  <Button
                    style={{
                      fontSize: "var(--page-content-font-size)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    ID TYPE
                  </Button>
                </TableCell>
                <TableCell align="center" style={{ padding: "0px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Button
                      style={{
                        fontSize: "var(--page-content-font-size)",
                        padding: "2px",
                        minWidth: "auto",
                      }}
                    >
                      ID NUMBER
                    </Button>
                    <Button
                      style={{
                        fontSize: "var(--page-content-font-size)",
                        padding: "2px",
                        minWidth: "auto",
                      }}
                      onClick={() => handleSort("idcardNo")} // Here, 'phone_number' is the key in the data object
                    >
                      {sortField === "idcardNo" && sortOrder === "asc" ? (
                        <AiOutlineArrowUp />
                      ) : (
                        <AiOutlineArrowDown />
                      )}
                    </Button>
                  </div>
                </TableCell>

                <TableCell align="center" style={{ padding: "0px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Button
                      style={{
                        fontSize: "var(--page-content-font-size)",
                        padding: "2px",
                        minWidth: "auto",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {" "}
                      {/* Reduced font size */}
                      Checkin Date & Time
                    </Button>
                    {/* Added by Akanksha on 15th Oct, Reason: to apply sorting logic */}
                    <Button
                      style={{
                        fontSize: "var(--page-content-font-size)",
                        padding: "2px",
                        minWidth: "auto",
                      }}
                      onClick={() => handleSort("arrival_date")}
                    >
                      {sortField === "arrival_date" && sortOrder === "asc" ? (
                        <AiOutlineArrowUp />
                      ) : (
                        <AiOutlineArrowDown />
                      )}
                    </Button>
                  </div>
                </TableCell>
                <TableCell align="center" style={{ padding: "0px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Button
                      style={{
                        fontSize: "var(--page-content-font-size)",
                        padding: "2px",
                        marginLeft: "6px",
                        minWidth: "auto",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {" "}
                      {/* Reduced font size */}
                      Checkout Date & Time
                    </Button>
                    <Button
                      style={{
                        fontSize: "var(--page-content-font-size)",
                        padding: "2px",
                        minWidth: "auto",
                      }}
                      onClick={() => handleSort("departure_date")}
                    >
                      {sortField === "departure_date" && sortOrder === "asc" ? (
                        <AiOutlineArrowUp />
                      ) : (
                        <AiOutlineArrowDown />
                      )}
                    </Button>
                  </div>
                </TableCell>
                <TableCell align="center" style={{ padding: "0px" }}>
                  <Button
                    style={{
                      fontSize: "var(--page-content-font-size)",
                      marginLeft: "4px",
                    }}
                  >
                    No. of Person
                  </Button>
                </TableCell>
                <TableCell align="center" style={{ padding: "0px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Button
                      style={{
                        fontSize: "var(--page-content-font-size)",
                        padding: "2px",
                        minWidth: "auto",
                      }}
                    >
                      Email Address
                    </Button>
                    <Button
                      style={{
                        fontSize: "var(--page-content-font-size)",
                        padding: "2px",
                        minWidth: "auto",
                      }}
                      onClick={() => handleSort("email")} // Here, 'phone_number' is the key in the data object
                    >
                      {sortField === "email" && sortOrder === "asc" ? (
                        <AiOutlineArrowUp />
                      ) : (
                        <AiOutlineArrowDown />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredAndDateFilteredData.length > 0 ? (
                filteredAndDateFilteredData.map((group, index) => {
                  const arrivalDateTime = parseDateTime(
                    group.arrival_date,
                    group.arrival_time
                  );

                  const isAfterCurrentTime = arrivalDateTime > now;

                  return (
                    <TableRow
                      key={index}
                      sx={{
                        backgroundColor: isAfterCurrentTime ? "white" : "white",
                      }}
                    >
                      <TableCell
                        align="center"
                        style={{
                          padding: "4px",
                          fontSize: "var(--page-content-font-size)",
                        }}
                      >
                        {(currentPage - 1) * filters.pageSize + index + 1}
                      </TableCell>

                      <TableCell
                        align="center"
                        style={{
                          padding: "4px",
                          fontSize: "var(--page-content-font-size)",
                          // Addition by Om Shrivastava on 03-01-2025
                          // Reason : Set maxwidth 
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth:'150px',
                          // End of addition by Om Shrivastava on 03-01-2025
                          // Reason : Set maxwidth 
                        }}
                      >
                        {group.salutation} {group.name}
                      </TableCell>

                      <TableCell
                        align="center"
                        style={{
                          padding: "4px",
                          fontSize: "var(--page-content-font-size)",
                        }}
                      >
                        {group.phone}
                      </TableCell>
                      <TableCell
                        align="center"
                        style={{
                          padding: "4px",
                          fontSize: "var(--page-content-font-size)",
                        }}
                      >
                        {group.idcardType}
                      </TableCell>

                      <TableCell
                        align="center"
                        style={{
                          padding: "4px",
                          fontSize: "var(--page-content-font-size)",
                        }}
                      >
                        {group.idcardNo}
                      </TableCell>

                      <TableCell
                        align="center"
                        style={{
                          padding: "4px",
                          fontSize: "var(--page-content-font-size)",
                        }}
                      >
                        {group.arrival_date}
                        &nbsp;
                        {new Date(
                          `1970-01-01T${group.arrival_time}`
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </TableCell>

                      <TableCell
                        align="center"
                        style={{
                          padding: "4px",
                          fontSize: "var(--page-content-font-size)",
                        }}
                      >
                        {group.departure_date}
                        &nbsp;
                        {new Date(
                          `1970-01-01T${group.departure_time}`
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </TableCell>

                      <TableCell
                        align="center"
                        style={{
                          padding: "4px",
                          fontSize: "var(--page-content-font-size)",
                        }}
                      >
                        {group.number_of_persons}
                      </TableCell>
                      <TableCell
                        align="center"
                        style={{
                          padding: "4px",
                          fontSize: "var(--page-content-font-size)",
                        }}
                      >
                        {group.email}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Data not found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {/* Commented by - Ashish Dewangan on 15-11-2024
       * Reason - To remove pagination from customer list */}
      {/* {filteredAndDateFilteredData.length > 0 ? (
        <Grid container justifyContent="center" mt={2}>
          <Pagination
            count={Math.ceil(itemsSize / filters.pageSize)}
            page={currentPage}
            onChange={(event, page) => handlePageChange(page)}
            color="primary"
          />
        </Grid>
      ) : null} */}
      {/* End of comment by - Ashish Dewangan on 15-11-2024
       * Reason - To remove pagination from customer list */}
    </div>
  );
};

export default CustomerDetails;
/**
 * End by - Akanksha on 23-10-2024
 * Reason - Created new Customer Details list page
 */
