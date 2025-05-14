import React, { useState, useEffect, useContext} from "react";
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
  InputAdornment,
  IconButton,
} from "@mui/material";
import { getCheckinList } from "../../Api/services";
import { useNavigate } from "react-router-dom";
import { GrView } from "react-icons/gr";
import style from "./checkinList.module.css";
import { styled } from "@mui/system";
// import SearchIcon from "@mui/icons-material/Search";
import { Search as SearchIcon, Clear as ClearIcon } from "@mui/icons-material";
import { format, parseISO } from "date-fns";

import { AiOutlineArrowUp, AiOutlineArrowDown } from "react-icons/ai";
import { FiArrowLeft } from "react-icons/fi";
import { GlobalContext } from "../../context/Context";



const CheckinList = () => {
  const navigate = useNavigate();
  
  const { tenant } = useContext(GlobalContext);
  const [groupedBookedRoomList, setGroupedBookedRoomList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsSize, setItemsSize] = useState(0);
  const [sortField, setSortField] = useState("id");
  const [sortOrder, setSortOrder] = useState("desc");
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    sortField: "id",
    sortOrder: "desc",
    pageNumber: 1,
    pageSize: 10,
    dateFilter: "today",
  });
  const [personalDetails, setPersonalDetails] = useState([]);
  const [noRecordsFound, setNoRecordsFound] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [fromDateError, setFromDateError] = useState("");
  const [toDateError, setToDateError] = useState("");
  const [filteredData, setFilteredData] = useState([]);

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
    getCheckinDetail();
  }, [filters]);

  const getCheckinDetail = async () => {
    setIsLoading(true);
    try {
      const access = localStorage.getItem("access");
      const { startDate, endDate } = getDateRange(filters.dateFilter);

      // Ensure filters include startDate and endDate
      const updatedFilters = { ...filters, startDate, endDate };

      const response = await getCheckinList(access, updatedFilters, tenant);
      console.log("hgfasjdh", response);
      if (response) {
        console.log("kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk", response)
        const groupedData = groupByBillingId(response.filtered_checkins);
        console.log("lllllllllllllllllllllllllllllllll", groupedData)
        setNoRecordsFound(response.filtered_checkins.length === 0);
        setItemsSize(response.total_checkins);
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

      /**
       * Modified by - Ashish Dewangan on 19-09-2024
       * Reason - To have default sorting order according to updated_at column
       */
      // if (!groupedData[billingId]) {
      //   groupedData[billingId] = {
      /**
       * End of modification by - Ashish Dewangan on 19-09-2024
       * Reason - To have default sorting order according to updated_at column
       */

      if (!groupedData[i]) {
        groupedData[i] = {
          billing_id: billingId,
          room_number: new Set(),
          room_type: new Set(),
          variety: new Set(),
          room_charges: booking.room_charges || 0,
          new_room_charges: booking.new_room_charges || 0,
          arrival_date: null,
          arrival_time: null,
          /**
           * Modified by - Ashish Dewangan on 14-11-2024
           * Reason - To show created_at from billing details instead of personal details
           */
          // created_at: booking.personal_details?.created_at,
          created_at: booking.created_at,
          /**
           * End of modification by - Ashish Dewangan on 14-11-2024
           * Reason - To show created_at from billing details instead of personal details
           */
          daily_rate: booking.daily_rate || 0,
          /* Addition by akanksha on 14th Oct 
          Reason to grop salutation details */
          salutation: booking.personal_details?.salutation || "",
          /* end by akanksha on 14th Oct 
          Reason to grop salutation details */
          name: booking.personal_details?.name || "Unknown",
          phone: booking.personal_details?.phone || "Unknown",
          idcardNo: booking.personal_details?.id_card_no || "Unknown",
          idcardType: booking.personal_details?.id_card_type || "Unknown",
          roomNoVarietyPrice: booking.rooms,
          /**
           * Added by - Ashish Dewangan on 13-10-2024
           * Reason - To show the user who have performed the checkin process
           */
          user_id_at_checkin: booking.user_id_at_checkin,
          /**
           * End of addition by - Ashish Dewangan on 13-10-2024
           * Reason - To show the user who have performed the checkin process
           */
        };
      }

      if (booking.checkin_period) {
        const latestCheckout = booking.checkin_period.reduce(
          (latest, period) => {
            if (!latest || period.departure_date > latest.departure_date) {
              return period;
            }
            return latest;
          },
          null
        );

        // groupedData[billingId].arrival_date = formatDate(
        //   latestCheckout.arrival_date
        // );
        // groupedData[billingId].arrival_time = latestCheckout.arrival_time;

        groupedData[i].arrival_date = formatDate(
          latestCheckout.arrival_date
        );
        groupedData[i].arrival_time = latestCheckout.arrival_time;
      }

      // if (booking.checkin_period) {
      //   const latestCheckout = booking.checkin_period.reduce(
      //       (latest, period) => {
      //           if (!latest || (period.departure_date && period.departure_date > latest.departure_date)) {
      //               return period;
      //           }
      //           return latest;
      //       },
      //       null
      //   );
    
        // if (latestCheckout) {  // Ensure latestCheckout is not null
        //     groupedData[i].arrival_date = latestCheckout.arrival_date ? formatDate(latestCheckout.arrival_date) : "Unknown";
        //     groupedData[i].arrival_time = latestCheckout.arrival_time || "Unknown";
        // } else {
        //     groupedData[i].arrival_date = "Unknown";
        //     groupedData[i].arrival_time = "Unknown";
        // }
      // } 
    

      if (booking.rooms && booking.rooms.length > 0) {
        booking.rooms.forEach((room) => {
          // groupedData[billingId].room_number.add(
          //   room.number || "Unknown Room Number"
          // );
          // groupedData[billingId].room_type.add(
          //   room.type || "Unknown Room Type"
          // );
          // groupedData[billingId].variety.add(
          //   room.variety || "Unknown Room variety"
          // );
          groupedData[i].room_number.add(
            room.number || "Unknown Room Number"
          );
          groupedData[i].room_type.add(
            room.type || "Unknown Room Type"
          );
          groupedData[i].variety.add(
            room.variety || "Unknown Room variety"
          );
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

  console.log(noRecordsFound, "check data");
  const openCheckoutDetails = (id) => {
    navigate("/CheckInDetailsForm", { state: { id: id } });
  };

  const handleNavigate = () => {
    navigate("/advance-checkin-List");
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setFilters({ ...filters, pageNumber: page });
  };

  //Added by akanksha on 15th oct, sorting in name and date columm
  const handleSort = (field) => {
    const newSortOrder = filters.sortOrder === "asc" ? "desc" : "asc";
    setFilters({ ...filters, sortField: field, sortOrder: newSortOrder });
    // const newSortOrder = sortOrder === "asc" ? "desc" : "asc";
    // setSortOrder(newSortOrder);
    // setSortField(field);
  };
  // Sorting function
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
        return bValue - aValue; // For numbers
      }
    });
  };
  //End by akanksha on 15th oct, sorting in name and date columm
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
    /**
     * Modified by - Ashish Dewangan on 14-11-2024
     * Reason - To reset page number when filter date is changed
     */
    // setFilters({ ...filters, dateFilter: value });
    setCurrentPage(1);
    setFilters({ ...filters, dateFilter: value, pageNumber: 1 });
    setFromDate("");
    setToDate("");
    /**
     * End of modification by - Ashish Dewangan on 14-11-2024
     * Reason - To reset page number when filter date is changed
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
        /**
         * Modified by - Ashish Dewangan on 13-09-2024
         * Reason - To filterout correct date
         */
        // const startOfWeek = new Date(
        //   today.setDate(today.getDate() - (today.getDay()))

        // );
        // startDate = startOfWeek.toISOString().split("T")[0];
        // endDate = new Date(today.setDate(today.getDate() + 6 - today.getDay()))
        //   .toISOString()
        //   .split("T")[0];

        //with iso date=========
        // var currentDate = new Date();
        // var first = currentDate.getDate() - currentDate.getDay() + 1;
        // var last = first + 6;
        // startDate = new Date(
        //   currentDate.getFullYear(),
        //   currentDate.getMonth(),
        //   first + 1
        // )
        //   .toISOString()
        //   .split("T")[0];
        // endDate = new Date(
        //   currentDate.getFullYear(),
        //   currentDate.getMonth(),
        //   last + 1
        // )
        //   .toISOString()
        //   .split("T")[0];
        //end of with iso =======

        // var currentDate = new Date();
        // var y = currentDate.getFullYear();
        // var m = currentDate.getMonth() + 1;
        // var d = currentDate.getDate();
        // var day = currentDate.getDay();

        // var first = d - day + 1;
        // var last = first + 6;
        // startDate =
        //   y +
        //   "-" +
        //   (m < 10 ? "0" : "") +
        //   m +
        //   "-" +
        //   (first < 10 ? "0" : "") +
        //   first;
        // endDate =
        //   y +
        //   "-" +
        //   (m < 10 ? "0" : "") +
        //   m +
        //   "-" +
        //   (last < 10 ? "0" : "") +
        //   last;
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

        /**
         * End of modification by - Ashish Dewangan on 13-09-2024
         * Reason - To filterout correct date
         */

        break;
      case "thisMonth":
        /**
         * Modified by - Ashish Dewangan on 13-09-2024
         * Reason - To filterout correct date
         */
        // startDate = new Date(today.getFullYear(), today.getMonth(), 1)
        //   .toISOString()
        //   .split("T")[0];
        // endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        //   .toISOString()
        //   .split("T")[0];

        //with iso date============
        // var date = new Date(),
        //   y = date.getFullYear(),
        //   m = date.getMonth();
        // var firstDayOfMonth = new Date(y, m, 2);
        // var lastDayOfMonth = new Date(new Date(y, m, 1).setMonth(m + 1));
        // startDate = firstDayOfMonth.toISOString().split("T")[0];
        // endDate = lastDayOfMonth.toISOString().split("T")[0];
        //with iso date============

        var currentDate = new Date();
        var y = currentDate.getFullYear();
        var m = currentDate.getMonth() + 1;
        var lastDayOfMonth = new Date(y, m, 0).getDate();

        startDate = y + "-" + (m < 10 ? "0" : "") + m + "-" + "01";
        endDate =
          y +
          "-" +
          (m < 10 ? "0" : "") +
          m +
          "-" +
          (lastDayOfMonth < 10 ? "0" : "") +
          lastDayOfMonth;
        /**
         * End of modification by - Ashish Dewangan on 13-09-2024
         * Reason - To filterout correct date
         */
        break;
      case "thisYear":
        /**
         * Modified by - Ashish Dewangan on 13-09-2024
         * Reason - To filterout correct date
         */
        // startDate = new Date(today.getFullYear(), 0, 1)
        //   .toISOString()
        //   .split("T")[0];
        // endDate = new Date(today.getFullYear(), 11, 31)
        //   .toISOString()
        //   .split("T")[0];

        //with iso date=========
        // var date = new Date(),
        //   y = date.getFullYear();
        // var firstDayOfYear = new Date(y, 0, 2);
        // var lastDayOfYear = new Date(y + 1, 0, 1);

        // startDate = firstDayOfYear.toISOString().split("T")[0];
        // endDate = lastDayOfYear.toISOString().split("T")[0];

        //with iso date====

        var currentDate = new Date();
        var y = currentDate.getFullYear();
        startDate = y + "-" + "01" + "-" + "01";
        endDate = y + "-" + "12" + "-" + "31";
        /**
         * End of modification by - Ashish Dewangan on 13-09-2024
         * Reason - To filterout correct date
         */

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

  function formatPrice(price) {
    return Number(price).toLocaleString('en-IN');
  }
  

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
    // added by akanksha on 20th nov
    setFilters((prevFilters) => ({
      ...prevFilters,
      dateFilter: "today",
    }));
    // added by akanksha on 20th nov
    setFromDate("");
    setToDate("");
    // setFilteredData(data); // Reset to original data
  };

  // const filterByDateRange = (data) => {
  //   if (fromDate && toDate) {
  //     const from = new Date(fromDate);
  //     const to = new Date(toDate);
  //     return data.filter((group) => {
  //       const [day, month, year] = group.arrival_date.split("-");
  //       const arrivalDate = new Date(`${year}-${month}-${day}`);
  //       return arrivalDate >= from && arrivalDate <= to;
  //     });
  //   }
  //   return data;
  // };


  const filterByDateRange = (data) => {
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      return data.filter((group) => {
        const [day, month, year] = group.arrival_date.split("-");
        const arrivalDate = new Date(`${year}-${month}-${day}`);
        return arrivalDate >= from && arrivalDate <= to;
      });
    }
    return data;
  };
  

  /**
   * Modified by - Ashish Dewangan on 14-11-2024
   * Reason - To remove unnecessary refilteration of date
   */
  //commented by akanksha on 15th oct, to modify method logic to perform sorting
  // const filteredAndDateFilteredData = (filterByDateRange(filteredNewData));
  
  //end of comment by akanksha on 15th oct, to modify method logic to perform sorting

  //Added by akanksha on 15th oct, to achieve sorting with filter data in same method
  // Filter by date range and sort the filtered data
  // const filteredAndDateFilteredData = sortData(
  //   filterByDateRange(filteredNewData),  // Apply date filtering
  //   sortField,                           // Field to sort by
  //   sortOrder                            // Sort order (asc/desc)
  // );
  //End by akanksha on 15th oct, to achieve sorting with filter data in same method
  const filteredAndDateFilteredData = filteredNewData;
  /**
   * End of modification by - Ashish Dewangan on 14-11-2024
   * Reason - To remove unnecessary refilteration of date
   */

  const parseDateTime = (dateString, timeString) => {
    const [day, month, year] = dateString.split("-");
    const [hours, minutes, seconds] = timeString.split(":");

    // Create a Date object
    return new Date(year, month - 1, day, hours, minutes, seconds);
  };

  
  // Get current date and time
  const now = new Date();

  
  // Addition by Om Shrivastava on 10-09-2024
  // Reason : When user clear the search query
  const handleClear = () => {
    setSearchQuery("");
  };
  // Addition by Om Shrivastava on 10-09-2024
  // Reason : When user clear the search query

  return (
    <div className={style.pageFrame}>
      <div className={style.header}>
        {" "}
        {/* Modification and addition by Om Shrivastava on 03-01-2025
            Reason : Add back icon  */}
        <FiArrowLeft className="backIcon" onClick={handleBackClick} />
        Check-in List
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
        justifyContent="center"
        alignItems="center"
        mb={2}
        paddingTop="1%"
        style={{ position: "relative" }}
      >
        <Grid
          item
          xs={12}
          md={6}
          style={{ display: "flex", justifyContent: "center" }}
        >
          {/* Modification and addition by Om Shrivastava on 10-09-2024
        Reason : Add the cross icon  */}
          {/* <TextField
            label="Search by Guest name or phone..."
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            style={{
              maxWidth: "400px",
              // borderRadius: "30px", // Rounded corners
              // backgroundColor: "#f5f5f5", // Light grey background
              // border: "1px solid #ddd", // Light border
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    style={{
                      backgroundColor: "#007BFF", // Blue background for the icon button
                      borderRadius: "50%", // Circular button
                      padding: "8px",
                      transition:
                        "background-color 0.3s ease, transform 0.3s ease",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#0056b3")
                    } // Darker blue on hover
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "#007BFF")
                    } // Original blue
                  >
                    <SearchIcon
                      style={{
                        color: "#fff", // White icon color
                        fontSize: "20px",
                        transition: "transform 0.3s ease",
                      }}
                    />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          /> */}
          <TextField
            label="Search by Guest name or phone..."
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            style={{
              maxWidth: "400px",
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {searchQuery && (
                    <IconButton
                      style={{
                        backgroundColor: "#f5f5f5", // Light grey background
                        borderRadius: "50%", // Circular button
                        padding: "8px",
                        marginRight: "5%",
                        fontSize: "var(--page-content-font-size)",
                        transition:
                          "background-color 0.3s ease, transform 0.3s ease",
                      }}
                      onClick={handleClear} // Clear search input
                    >
                      <ClearIcon
                        style={{
                          color: "#000", // Black icon color
                          fontSize: "20px",
                        }}
                      />
                    </IconButton>
                  )}
                  <IconButton
                    style={{
                      backgroundColor: "#007BFF", // Blue background for the icon button
                      borderRadius: "50%", // Circular button
                      padding: "8px",
                      transition:
                        "background-color 0.3s ease, transform 0.3s ease",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#0056b3")
                    } // Darker blue on hover
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "#007BFF")
                    } // Original blue
                  >
                    <SearchIcon
                      style={{
                        color: "#fff", // White icon color
                        fontSize: "20px",
                        transition: "transform 0.3s ease",
                      }}
                    />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {/* Modification and addition by Om Shrivastava on 10-09-2024
        Reason : Add the cross icon  */}
        </Grid>
        {/* Modified by akanksha on 24th Oct 2024, Reason : To add label  */}
        <Grid
          item
          style={{ position: "absolute", right: 68, textAlign: "center" }}
        >
          <Typography variant="body2" style={{ marginBottom: 8 }}>
            Click here to check for Advance Booking
          </Typography>
          <Button
            className="customButton"
            variant="contained"
            onClick={handleNavigate}
          >
            Advance Bookings
          </Button>
        </Grid>
        {/* end of Modified by akanksha on 24th Oct 2024, Reason : To add label  */}
      </Grid>

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

      {isLoading ? (
        <Grid container justifyContent="center" alignItems="center">
          <CircularProgress />
        </Grid>
      ) : noRecordsFound ? (
        <Typography variant="h6" align="center">
          No Records Found
        </Typography>
      ) : (
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead
              style={{
                backgroundColor: "#edf7f6",
                fontSize: "11px",
              }}
            >
              <TableRow>
                <TableCell
                  align="center"
                  style={{ padding: "0px", whiteSpace: "nowrap" }}
                >
                  <Button style={{ fontSize: "var(--page-content-font-size)" }}>
                    {" "}
                    S.NO.
                  </Button>
                </TableCell>
                {/* modified code by akaknksha on 18-10-24, Reason to handle the column ui as mentioned by qa */}
                <TableCell
                  align="center"
                  style={{ padding: "0px", whiteSpace: "nowrap" }}
                >
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
                      {" "}
                      {/* Reduced font size */}
                      name
                    </Button>
                    {/* Added by Akanksha on 15th Oct, Reason: to apply sorting logic */}
                    <Button
                      style={{
                        fontSize: "var(--page-content-font-size)",
                        padding: "2px",
                        minWidth: "auto",
                      }}
                      onClick={() => handleSort("name")}
                    >
                      {filters.sortField === "name" &&
                      filters.sortOrder === "asc" ? (
                        <AiOutlineArrowUp />
                      ) : (
                        <AiOutlineArrowDown />
                      )}
                    </Button>
                    {/* End by Akanksha on 15th Oct, Reason: to apply sorting logic */}
                  </div>
                  {/* End of modification and addition by Om Shrivastava on 17-10-2024
                Reason : Set the gapping and width  */}
                  {/* End by akanksha on 15th oct, Reason : to apply sorting logic */}
                </TableCell>
                <TableCell
                  align="center"
                  style={{ padding: "0px", whiteSpace: "nowrap" }}
                >
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
                      {" "}
                      {/* Reduced font size */}
                      Id type
                    </Button>
                    {/* Added by Akanksha on 15th Oct, Reason: to apply sorting logic */}
                    <Button
                      style={{
                        fontSize: "var(--page-content-font-size)",
                        padding: "2px",
                        minWidth: "auto",
                      }}
                      onClick={() => handleSort("idcardType")}
                    >
                      {filters.sortField === "idcardType" &&
                      filters.sortOrder === "asc" ? (
                        <AiOutlineArrowUp />
                      ) : (
                        <AiOutlineArrowDown />
                      )}
                    </Button>
                    {/* End by Akanksha on 15th Oct, Reason: to apply sorting logic */}
                  </div>
                </TableCell>
                <TableCell
                  align="center"
                  style={{ padding: "0px", whiteSpace: "nowrap" }}
                >
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
                      {" "}
                      {/* Reduced font size */}
                      Id number
                    </Button>
                    {/* Added by Akanksha on 15th Oct, Reason: to apply sorting logic */}
                    <Button
                      style={{
                        fontSize: "var(--page-content-font-size)",
                        padding: "2px",
                        minWidth: "auto",
                      }}
                      onClick={() => handleSort("idcardNo")}
                    >
                      {filters.sortField === "idcardNo" &&
                      filters.sortOrder === "asc" ? (
                        <AiOutlineArrowUp />
                      ) : (
                        <AiOutlineArrowDown />
                      )}
                    </Button>
                    {/* End by Akanksha on 15th Oct, Reason: to apply sorting logic */}
                  </div>
                </TableCell>
                <TableCell
                  align="center"
                  style={{ padding: "0px", whiteSpace: "nowrap" }}
                >
                  <Button style={{ fontSize: "var(--page-content-font-size)" }}>
                    {" "}
                    Phone number
                  </Button>
                </TableCell>
                <TableCell
                  align="center"
                  style={{
                    width: "250px",
                    padding: "0px",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Button
                    style={{
                      fontSize: "var(--page-content-font-size)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    Room detail (No / type / variety)
                  </Button>
                </TableCell>
                <TableCell
                  align="center"
                  style={{ padding: "0px", whiteSpace: "nowrap" }}
                >
                  <Button style={{ fontSize: "var(--page-content-font-size)" }}>
                    Room Price
                  </Button>
                </TableCell>
                <TableCell
                  align="center"
                  style={{ padding: "0px", whiteSpace: "nowrap" }}
                >
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
                      {filters.sortField === "arrival_date" &&
                      filters.sortOrder === "asc" ? (
                        <AiOutlineArrowUp />
                      ) : (
                        <AiOutlineArrowDown />
                      )}
                    </Button>
                    {/* End by Akanksha on 15th Oct, Reason: to apply sorting logic */}
                  </div>
                </TableCell>

                {/**
                 * Added by - Ashish Dewangan on 13-10-2024
                 * Reason - To show the user who have performed the checkin process
                 */}
                <TableCell
                  align="center"
                  style={{
                    padding: "0px",
                    fontSize: "11px",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Button style={{ fontSize: "var(--page-content-font-size)" }}>
                  Booked By
                  </Button>
                </TableCell>
                {/**
                 * End of addition by - Ashish Dewangan on 13-10-2024
                 * Reason - To show the user who have performed the checkin process
                 */}

                <TableCell
                  align="center"
                  style={{ padding: "0px", whiteSpace: "nowrap" }}
                >
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
                      {" "}
                      {/* Reduced font size */}
                      Created at
                    </Button>
                    {/* Added by Akanksha on 15th Oct, Reason: to apply sorting logic */}
                    <Button
                      style={{
                        fontSize: "var(--page-content-font-size)",
                        padding: "2px",
                        minWidth: "auto",
                      }}
                      onClick={() => handleSort("created_at")}
                    >
                      {filters.sortField === "created_at" &&
                      filters.sortOrder === "asc" ? (
                        <AiOutlineArrowUp />
                      ) : (
                        <AiOutlineArrowDown />
                      )}
                    </Button>
                    {/* End by Akanksha on 15th Oct, Reason: to apply sorting logic */}
                  </div>

                  {/* End of modification and addition by Om Shrivastava on 17-10-2024
                Reason : Set the gapping and width  */}

                  {/* End by akanksha on 15th oct, Reason : to apply sorting logic */}
                </TableCell>
                {/* End by akanksha on 15th oct, Reason : to apply sorting logic */}
                {/* modified code by akaknksha on 18-10-24, Reason to handle the column ui as mentioned by qa */}
                <TableCell
                  align="center"
                  style={{
                    padding: "0px",
                    fontSize: "11px",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Button style={{ fontSize: "var(--page-content-font-size)" }}>
                    Details
                  </Button>
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredAndDateFilteredData.length > 0 ? (
                filteredAndDateFilteredData
                  // .slice()
                  // .reverse()
                  .map((group, index) => {
                    const arrivalDateTime = parseDateTime(
                      group.arrival_date,
                      group.arrival_time
                    );

                    // Check if the arrivalDateTime is greater than the current time
                    const isAfterCurrentTime = arrivalDateTime > now;

                    return (
                      <TableRow
                        key={index}
                        sx={{
                          backgroundColor: isAfterCurrentTime
                            ? "#aeedb0"
                            : "white",
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
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            // Addition by Om Shrivastava on 03-01-2025
                            // Reason : Set maxwidth 
                            maxWidth:'150px',
                            // End of addition by Om Shrivastava on 03-01-2025
                            // Reason : Set maxwidth 
                          }}
                        >
                          {/* Addition by akanksha on 14th Oct 
                            Reason to show salutation with name */}
                            {group.salutation}{" "}{group.name}
                            {/* End of Addition by akanksha on 14th Oct 
                            Reason to show salutation with name */}
                        </TableCell>

                        <TableCell
                          align="center"
                          style={{
                            padding: "4px",
                            fontSize: "var(--page-content-font-size)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
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
                          {group.phone}
                        </TableCell>
                        <TableCell
                          align="center"
                          style={{
                            width: "250px",
                            padding: "4px",
                            fontSize: "var(--page-content-font-size)",
                          }}
                        >
                          {group.roomNoVarietyPrice.map((room, idx) => (
                            <Typography
                              style={{
                                fontSize: "var(--page-content-font-size)",
                              }}
                              key={idx}
                            >
                              {room.number} / {room.type} / {room.variety}
                            </Typography>
                          ))}
                        </TableCell>
                        <TableCell
                          align="center"
                          style={{
                            padding: "4px",
                            fontSize: "var(--page-content-font-size)",
                          }}
                        >
                          {group.room_charges}{group.new_room_charges !== 0 && `, ${group.new_room_charges}`}
                        </TableCell>

                        <TableCell
                          align="center"
                          style={{
                            padding: "4px",
                            fontSize: "var(--page-content-font-size)",
                          }}
                        >
                          {group.arrival_date}
                          {/* Modification and addition by Om shrivastava on 12-09-2024
                          Reason : Change the time format  */}
                          {/* Modification and addition by Om Shrivastava on 16-10-2024
                          Reason : Set the arrival time in yyyy format  */}
                          {/* {group.arrival_time} */}
                          &nbsp;
                          {new Date(
                            `1970-01-01T${group.arrival_time}`
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                          {/* Modification and addition by Om Shrivastava on 16-10-2024
                          Reason : Set the arrival time in yyyy format  */}
                          {/* Modification and addition by Om shrivastava on 12-09-2024
                          Reason : Change the time format  */}
                        </TableCell>

                        {/**
                         * Added by - Ashish Dewangan on 13-10-2024
                         * Reason - To show the user who have performed the checkin process
                         */}
                        <TableCell
                          align="center"
                          style={{
                            padding: "4px",
                            fontSize: "var(--page-content-font-size)",
                          }}
                        >
                          {group.user_id_at_checkin}
                        </TableCell>
                        {/**
                         * End of addition by - Ashish Dewangan on 13-10-2024
                         * Reason - To show the user who have performed the checkin process
                         */}

                        <TableCell
                          align="center"
                          style={{
                            padding: "4px",
                            fontSize: "var(--page-content-font-size)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {group.created_at}
                        </TableCell>

                        <TableCell
                          align="center"
                          style={{
                            padding: "4px",
                            fontSize: "var(--page-content-font-size)",
                          }}
                        >
                          {/* <Button
                              style={{ border: "none", paddingLeft: "25%" }}
                              variant="outlined"
                              startIcon={<GrView style={{ color: "black" }} />}
                              onClick={() =>
                                openCheckoutDetails(group.billing_id)
                              }
                            ></Button> */}
                          <Button
                            style={{
                              backgroundColor: "white", // Background color
                              transition: "all 0.3s ease", // Smooth animation
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Subtle shadow
                              cursor: "pointer",
                            }}
                            startIcon={
                              <GrView
                                style={{
                                  color: "black",
                                  transition: "transform 0.3s ease", // Icon animation
                                }}
                              />
                            }
                            onMouseOver={(e) => {
                              e.currentTarget.style.backgroundColor = "#4caf50"; // Green hover background
                              e.currentTarget.style.color = "white"; // Change text color to white
                              e.currentTarget.firstChild.style.transform =
                                "scale(1.2)"; // Zoom in on icon
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.backgroundColor = "white"; // Reset background
                              e.currentTarget.style.color = "black"; // Reset text color
                              e.currentTarget.firstChild.style.transform =
                                "scale(1)"; // Reset icon size
                            }}
                            onClick={() =>
                              openCheckoutDetails(group.billing_id)
                            }
                          ></Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
              ) : (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    Data not found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {/* Addition by Om Shrivastava on 07-10-2024
      Reason : When data is show then this section is show */}
      {filteredAndDateFilteredData.length > 0 ? (
        <Grid container justifyContent="center" mt={2}>
          <Pagination
            count={Math.ceil(itemsSize / filters.pageSize)}
            page={currentPage}
            onChange={(event, page) => handlePageChange(page)}
            color="primary"
          />
        </Grid>
      ) : null}
      {/* End of addition by Om Shrivastava on 07-10-2024
      Reason : When data is show then this section is show */}
    </div>
  );
};

export default CheckinList;

// Modification by Om Shrivastava on 16-08-2024
// Reason : Set the filter option
