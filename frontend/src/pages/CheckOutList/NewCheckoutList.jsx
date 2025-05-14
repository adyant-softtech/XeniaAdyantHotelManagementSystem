/**
 * Added by - Ashish Dewangan on 29-08-2024
 * Reason - Created new checkout list page
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
  Tab,
  Tabs,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Pagination,
  InputAdornment,
  IconButton,
  Card,
  CardContent,
} from "@mui/material";

import { getCheckOutList } from "../../Api/services";
import { useNavigate } from "react-router-dom";
import { GrView } from "react-icons/gr";
import style from "./NewCheckoutList.module.css";
import { styled } from "@mui/system";
// import SearchIcon from "@mui/icons-material/Search";
import { Search as SearchIcon, Clear as ClearIcon } from "@mui/icons-material";
import { format, parseISO } from "date-fns";
import { GlobalContext } from "../../context/Context";
import { IoReceiptOutline } from "react-icons/io5";

import { AiOutlineArrowUp, AiOutlineArrowDown } from "react-icons/ai";
import { FiArrowLeft } from "react-icons/fi";

const NewCheckoutList = () => {
  const navigate = useNavigate();
  const [partialCheckouts, setPartialCheckouts] = useState([]);
  const [completeCheckouts, setCompleteCheckouts] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [groupedPartialCheckouts, setGroupedPartialCheckouts] = useState([]);
  const [groupedCompleteCheckouts, setGroupedCompleteCheckouts] = useState([]);
  const [selectedTab, setSelectedTab] = useState([]);


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
    selectedTab: "Partial Checkouts",
  });
  const [personalDetails, setPersonalDetails] = useState([]);
  const [noRecordsFound, setNoRecordsFound] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [fromDateError, setFromDateError] = useState("");
  const [toDateError, setToDateError] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  const [amountSummary, setAmountSummary] = useState({});
  const { user, tenant } = useContext(GlobalContext);

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


  /**
   * Added by - Ashish Dewangan on 29-08-2024
   * Reason -  Whenever a filter is applied, get new checkout list according to those filters
   */
  useEffect(() => {
    checkoutList();
  }, [filters]);
  /**
   * End of code addition by - Ashish Dewangan on 29-08-2024
   * Reason -  Whenever a filter is applied, get new checkout list according to those filters
   */
  // useEffect(() => {
  //   setFilters((prevFilters) => ({
  //       ...prevFilters,
  //       dateFilter: activeTab === 0 ? "thisMonth" : "today",
  //   }));
  // }, [activeTab]);

  /**
   * Added by - Ashish Dewangan on 29-08-2024
   * Reason -  calling API to get checkout list
   */
  // commented by akaknksha on 8-11-2024
  // Reason : to get correct revenue amount by admin side
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

          // Filter data based on is_partial_payment_confirmed flag
          const partialCheckouts = groupedData.filter(item => item.is_partial_payment_confirmed === "true" && item.is_cancelled === "false");
          const completeCheckouts = response.filtered_checkouts.filter(item => item.is_partial_payment_confirmed === "false");

          console.log("Partial Checkouts:", partialCheckouts);
          console.log("Complete Checkouts:", completeCheckouts);

        // Group data by billing_id
        const groupedPartialCheckouts = groupByBillingId(partialCheckouts);
        const groupedCompleteCheckouts = groupByBillingId(completeCheckouts);

        console.log("Grouped Partial Checkouts:", groupedPartialCheckouts);
        console.log("Grouped Complete Checkouts:", groupedCompleteCheckouts);

        // Set states
        setNoRecordsFound(response.filtered_checkouts.length === 0);
        setItemsSize(response.total_checkouts);
        setGroupedPartialCheckouts(groupedPartialCheckouts);
        setGroupedCompleteCheckouts(groupedCompleteCheckouts);

        /**
         * Added by - Ashish Dewangan on 30-08-2024
         * Reason - To set amount report in variables
         */
        setAmountSummary({
          overall_amount_collected: response.overall_amount_collected,
          overall_amount_collected_after_cancellation:
            response.overall_amount_collected_after_cancellation,
          overall_amount_collected_by_cash:
            response.overall_amount_collected_by_cash,
          overall_amount_collected_by_online:
            response.overall_amount_collected_by_online,
          overall_amount_refunded: response.overall_amount_refunded,
          overall_grand_total: response.overall_grand_total,
          overall_partial_amount: response.overall_partial_amount,
        });
        /**
         * End of addition by - Ashish Dewangan on 30-08-2024
         * Reason - To set amount report in variables
         */
        // if (response.filtered_checkouts.length > 0) {
        //   // Sort checkouts by `updated_at` timestamp in descending order to get the latest one
        //   const latestPayment = response.filtered_checkouts.sort((a, b) => 
        //       new Date(b.billing_details.updated_at) - new Date(a.billing_details.updated_at)
        //   )[0];
      
        //   // Check if the latest payment is a partial payment
        //   setActiveTab(latestPayment?.billing_details?.is_partial_payment_confirmed ? 0 : 1);
        // }
        // if (response.filtered_checkouts.length > 0) {
        //   // Sort checkouts by `updated_at` timestamp in descending order to get the latest one
        //   const latestPayment = response.filtered_checkouts.sort((a, b) => 
        //       new Date(b.billing_details.updated_at) - new Date(a.billing_details.updated_at)
        //   )[0];
      
        //   // If `activeTab` is still at its initial state, update it based on the latest payment
        //   setActiveTab((prevTab) => 
        //       prevTab === null ? (latestPayment?.billing_details?.is_partial_payment_confirmed ? 0 : 1) : prevTab
        //   );
        // }
      
      
      
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
  // commented by akaknksha on 8-11-2024
  // Reason : to get correct revenue amount by admin side

  // const checkoutList = async () => {
  //   setIsLoading(true);
  //   try {
  //       const access = localStorage.getItem("access");
  //       const { startDate, endDate } = getDateRange(filters.dateFilter);

  //       const updatedFilters = { ...filters, startDate, endDate };
  //       const response = await getCheckOutList(access, updatedFilters);

  //       if (response) {
  //           const groupedData = groupByBillingId(response.filtered_checkouts);
  //           setNoRecordsFound(response.filtered_checkouts.length === 0);
  //           setItemsSize(response.total_checkouts);
  //           setGroupedBookedRoomList(groupedData);

  //           // Update amount summary only if there are records
  //           if (response.filtered_checkouts.length > 0) {
  //               setAmountSummary({
  //                   overall_amount_collected: response.overall_amount_collected,
  //                   overall_amount_collected_after_cancellation: response.overall_amount_collected_after_cancellation,
  //                   overall_amount_collected_by_cash: response.overall_amount_collected_by_cash,
  //                   overall_amount_collected_by_online: response.overall_amount_collected_by_online,
  //                   overall_amount_refunded: response.overall_amount_refunded,
  //                   overall_grand_total: response.overall_grand_total,
  //               });
  //           } else {
  //               // Reset amount summary if no records found
  //               setAmountSummary({
  //                   overall_amount_collected: 0,
  //                   overall_amount_collected_after_cancellation: 0,
  //                   overall_amount_collected_by_cash: 0,
  //                   overall_amount_collected_by_online: 0,
  //                   overall_amount_refunded: 0,
  //                   overall_grand_total: 0,
  //               });
  //           }
  //       } else {
  //           console.error("No data received from API");
  //           setGroupedBookedRoomList([]);
  //           setItemsSize(0);
  //           setNoRecordsFound(true);
  //       }
  //   } catch (error) {
  //       console.error("Error fetching check-in details:", error);
  //   } finally {
  //       setIsLoading(false);
  //   }
  // };

  // Added by akaknksha on 8-11-2024
  // Reason : to get correct revenue amount by admin side
  // const checkoutList = async (filter = filters.dateFilter, pageNumber = 1) => {
  //   setIsLoading(true);
  //   try {
  //     const access = localStorage.getItem("access");
  //     const { startDate, endDate } = getDateRange(filter);
  //     const updatedFilters = { ...filters, startDate, endDate, dateFilter: filter, pageNumber };

  //     let response = await getCheckOutList(access, updatedFilters);

  //     if (response) {
  //       const groupedData = groupByBillingId(response.filtered_checkouts);
  //       setNoRecordsFound(response.filtered_checkouts.length === 0);
  //       setItemsSize(response.total_checkouts);
  //       setGroupedBookedRoomList(groupedData);

  //       // Update amount summary with response data
  //       setAmountSummary({
  //         overall_amount_collected: response.overall_amount_collected,
  //         overall_amount_collected_after_cancellation: response.overall_amount_collected_after_cancellation,
  //         overall_amount_collected_by_cash: response.overall_amount_collected_by_cash,
  //         overall_amount_collected_by_online: response.overall_amount_collected_by_online,
  //         overall_amount_refunded: response.overall_amount_refunded,
  //         overall_grand_total: response.overall_grand_total,
  //       });
  //     } else {
  //       console.error("No data received from API");
  //       setGroupedBookedRoomList([]);
  //       setItemsSize(0);
  //       setNoRecordsFound(true);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching check-in details:", error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
  // End by akaknksha on 8-11-2024
  // Reason : to get correct revenue amount by admin side
  /**
   * End of code addition by - Ashish Dewangan on 29-08-2024
   * Reason -  calling API to get checkout list
   */

  /**
   * Added by - Ashish Dewangan on 29-08-2024
   * Reason - to format date string
   */
  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
  };
  /**
   * End of addition by - Ashish Dewangan on 29-08-2024
   * Reason - to format date string
   */

  /**
   * Added by - Ashish Dewangan on 29-08-2024
   * Reason - To create group of booking data according to billing id
   */
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
          grand_total: booking.grand_total || 0,
          /**
           * Modified by - Ashish Dewangan on 30-08-2024
           * Reason - To set arrival and departure date to display in the list
           */
          // arrival_date: null,
          // arrival_time: null,
          arrival_date: booking.billing_details.arrival_date,
          arrival_time: booking.billing_details.arrival_time,
          departure_date: booking.billing_details.departure_date,
          departure_time: booking.billing_details.departure_time,
          /**
           * End of modification by - Ashish Dewangan on 30-08-2024
           * Reason - To set arrival and departure date to display in the list
           */
          created_at: booking.personal_details?.created_at,
          daily_rate: booking.daily_rate || 0,
          /* Addition by akanksha on 11th Oct 
           Reason to add salutation name */
          salutation: booking.personal_details?.salutation || "",
          /* End of Addition by akanksha on 11th Oct 
           Reason to add salutation name */
          name: booking.personal_details?.name || "Unknown",
          phone: booking.personal_details?.phone || "Unknown",
          idcardNo: booking.personal_details?.id_card_no || "Unknown",
          idcardType: booking.personal_details?.id_card_type || "Unknown",
          roomNoVarietyPrice: booking.rooms,
          /**
           * Modified by - Ashish Dewangan on 30-08-2024
           * Reason - To set is_cancelled variable to display in the list
           */
          is_cancelled: booking.billing_details.is_cancelled,
          is_partial_payment_confirmed: booking.billing_details.is_partial_payment_confirmed,
          /**
           * End of modification by - Ashish Dewangan on 30-08-2024
           * Reason - To set is_cancelled variable to display in the list
           */
          /* Added by - Ashish Dewangan on 23-09-2024
           * Reason - To show amount pain and refunded */
          total_paid: booking.total_paid,
          refunded_amount: booking.refunded_amount,
          /* End of addition by - Ashish Dewangan on 23-09-2024
           * Reason - To show amount pain and refunded */
        };
      }

      /**
       * Modified by - Ashish Dewangan on 30-08-2024
       * Reason - To set arrival and departure date without using a loop
       */
      // if (booking.checkin_period) {
      //   const latestCheckout = booking.checkin_period.reduce(
      //     (latest, period) => {
      //       if (!latest || period.departure_date > latest.departure_date) {
      //         return period;
      //       }
      //       return latest;
      //     },
      //     null
      //   );

      //   groupedData[billingId].arrival_date = formatDate(
      //     latestCheckout.arrival_date
      //   );
      //   groupedData[billingId].arrival_time = latestCheckout.arrival_time;
      // }

      /**
       * Modified by - Ashish Dewangan on 19-09-2024
       * Reason - To have default sorting order according to updated_at column
       */
      // groupedData[billingId].arrival_date = formatDate(
      //   booking.billing_details.arrival_date
      // );
      // groupedData[billingId].arrival_time =
      //   booking.billing_details.arrival_time;

      // groupedData[billingId].departure_date = formatDate(
      //   booking.billing_details.departure_date
      // );
      // groupedData[billingId].departure_time =
      //   booking.billing_details.departure_time;

      groupedData[i].arrival_date = formatDate(
        booking.billing_details.arrival_date
      );
      groupedData[i].arrival_time = booking.billing_details.arrival_time;

      groupedData[i].departure_date = formatDate(
        booking.billing_details.departure_date
      );
      groupedData[i].departure_time = booking.billing_details.departure_time;
      /**
       * End of modification by - Ashish Dewangan on 19-09-2024
       * Reason - To have default sorting order according to updated_at column
       */

      /**
       * End of modification by - Ashish Dewangan on 30-08-2024
       * Reason - To set arrival and departure date without using a loop
       */

      /**
       * Added by - Ashish Dewangan on 13-10-2024
       * Reason - To show the user who have performed the checkout process
       */
      groupedData[i].user_id_at_checkout = booking.user_id_at_checkout;
      /**
       * End of addition by - Ashish Dewangan on 13-10-2024
       * Reason - To show the user who have performed the checkout process
       */

      if (booking.rooms && booking.rooms.length > 0) {
        booking.rooms.forEach((room) => {
          /**
           * Modified by - Ashish Dewangan on 19-09-2024
           * Reason - To have default sorting order according to updated_at column
           */
          // groupedData[billingId].room_number.add(
          //   room.number || "Unknown Room Number"
          // );
          // groupedData[billingId].room_type.add(
          //   room.type || "Unknown Room Type"
          // );
          // groupedData[billingId].variety.add(
          //   room.variety || "Unknown Room variety"
          // );
          groupedData[i].room_number.add(room.number || "Unknown Room Number");
          groupedData[i].room_type.add(room.type || "Unknown Room Type");
          groupedData[i].variety.add(room.variety || "Unknown Room variety");
          /**
           * End of modification by - Ashish Dewangan on 19-09-2024
           * Reason - To have default sorting order according to updated_at column
           */
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
  /**
   * End of addition by - Ashish Dewangan on 29-08-2024
   * Reason - To create group of booking data according to billing id
   */

  /**
   * Added by - Ashish Dewangan on 29-08-2024
   * Reason - To navigate to checkout details page
   */
  const openCheckoutDetails = (id) => {
    navigate("/CheckoutDetailsForm", { state: { id: id } });
  };
  const openCheckinDetails = (id) => {
    navigate("/CheckInDetailsForm", { state: { id: id } });
  };
  /**
   * End of code addition by - Ashish Dewangan on 29-08-2024
   * Reason - To navigate to checkout details page
   */
  /**
   * Added by - Om shrivastava on 01-09-2024
   * Reason - To navigate to checkout details page
   */
  const openInvoiceDetails = (id) => {
    navigate("/checkout-invoice", { state: { id: id } });
  };
  /**
   * End of code addition by - Om shrivastava on 01-09-2024
   * Reason - To navigate to checkout details page
   */

  /**
   * Added by - Ashish Dewangan on 29-08-2024
   * Reason - Preparing filter data when any filter component is activated
   */
  const handlePageChange = (page) => {
    setCurrentPage(page);
    setFilters({ ...filters, pageNumber: page });
  };

  //commented by akanksha on 21st oct,
  // Reason : to correct sorting logic
  // const handleSort = (field) => {
  //   const newSortOrder = sortField === field && sortOrder === "asc" ? "desc" : "asc";
  //   setSortField(field);
  //   setSortOrder(newSortOrder);
  //   setFilters({ ...filters, sortField: field, sortOrder: newSortOrder });
  // };
  //end of commented by akanksha on 21st oct,
  // Reason : to correct sorting logic

  //Added by akanksha on 21st oct,
  // Reason : to correct sorting logic
  // Handle sorting
  const handleSort = (field) => {
    const newSortOrder =
      filters.sortField === field && filters.sortOrder === "asc"
        ? "desc"
        : "asc";
    setFilters({ ...filters, sortField: field, sortOrder: newSortOrder });
  };
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
  //Added by akanksha on 21st oct,
  // Reason : to correct sorting logic

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

  // const handleDateFilterChange = (e) => {
  //   const { value } = e.target;
  //   setFilters({ ...filters, dateFilter: value });
  // };

  const handleDateFilterChange = (e) => {
    const { value } = e.target;
    setFilters({ ...filters, dateFilter: value, pageNumber: 1 });
    setAmountSummary({
      // Reset the amount summary
      overall_amount_collected: 0,
      overall_amount_collected_after_cancellation: 0,
      overall_amount_collected_by_cash: 0,
      overall_amount_collected_by_online: 0,
      overall_amount_refunded: 0,
      overall_grand_total: 0,
      overall_partial_amount: 0,
    });
    setCurrentPage(1);
    /**
     * Added by - Ashish Dewangan on 14-11-2024
     * Reason - To reset custom date input boxes when radio button for today, this week,
     *  this month and this year is selected
     */
    setFromDate("");
    setToDate("");
    /**
     * End of addition by - Ashish Dewangan on 14-11-2024
     * Reason - To reset custom date input boxes when radio button for today, this week,
     *  this month and this year is selected
     */
  };
  // const handleDateFilterChange = (e) => {
  //   const { value } = e.target;
  //   setFilters({ ...filters, dateFilter: value });

  //   // Clear revenue data to prevent displaying previous results
  //   setGroupedBookedRoomList([]);
  //   setItemsSize(0);
  //   setNoRecordsFound(false);
  //   setAmountSummary({
  //     overall_amount_collected: 0,
  //     overall_amount_collected_after_cancellation: 0,
  //     overall_amount_collected_by_cash: 0,
  //     overall_amount_collected_by_online: 0,
  //     overall_amount_refunded: 0,
  //     overall_grand_total: 0,
  //   });

  //   // Trigger a new fetch based on the updated filter and reset to first page
  //   checkoutList(value, 1);  // Reset to page 1
  // };

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
        /**
         * Modified by - Ashish Dewangan on 13-09-2024
         * Reason - To filterout correct date
         */

        // const startOfWeek = new Date(
        //   today.setDate(today.getDate() - today.getDay())
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
  /**
   * End of addition by - Ashish Dewangan on 29-08-2024
   * Reason - Preparing filter data when any filter component is activated
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
      dateFilter: "today",
    }));
    setFromDate("");
    setToDate("");
    // setFilteredData(data); // Reset to original data
  };

  const filterByDateRange = (data) => {
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      /**
       * Modified by - Ashish Dewangan on 30-08-2024
       * Reason - To filter list according to the deeparture date
       */
      // return data.filter((group) => {
      //   const [day, month, year] = group.arrival_date.split("-");
      //   const arrivalDate = new Date(`${year}-${month}-${day}`);
      //   return arrivalDate >= from && arrivalDate <= to;
      // });
      return data.filter((group) => {
        const [day, month, year] = group.departure_date.split("-");
        const departureDate = new Date(`${year}-${month}-${day}`);
        return departureDate >= from && departureDate <= to;
      });
      /**
       * End of modification by - Ashish Dewangan on 30-08-2024
       * Reason - To filter list according to the deeparture date
       */
    }
    return data;
  };

  /**
   * Modified by - Ashish Dewangan on 14-11-2024
   * Reason - To remove unnecessary refilteration of date
   */
  //commented by akanksha on 21st oct,
  // Reason : to correct sorting logic
  // const filteredAndDateFilteredData = filterByDateRange(filteredNewData);
  //end of commented by akanksha on 21st oct,
  // Reason : to correct sorting logic

  //Added by akanksha on 21st oct,
  // Reason : to correct sorting logic
  // const filteredAndDateFilteredData = sortData(
  //   filterByDateRange(filteredNewData),
  //   sortField,
  //   sortOrder
  // );
  //Added by akanksha on 21st oct,
  // Reason : to correct sorting logic
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

  // Addition by Om Shrivastava on 10-09-2024
  // Reason : When user clear the search query
  const handleClear = () => {
    setSearchQuery("");
  };
  // Addition by Om Shrivastava on 10-09-2024
  // Reason : When user clear the search query

  // const handleTabChange = (event, newValue) => {
  //   setActiveTab(newValue);
  // };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setCurrentPage(1);
    setFilters((prevFilters) => ({
      ...prevFilters,
      selectedTab: newValue === 0 ? "Partial Checkouts" : "Complete Checkouts",
      pageNumber: 1, 
    }));
  };
  

  return (
    <div className={style.pageFrame}>
      <div className={style.header}>
        {/* Modification and addition by Om Shrivastava on 03-01-2025
            Reason : Add back icon  */}
        <FiArrowLeft className="backIcon" onClick={handleBackClick} />
        Check-out List
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

      {/* Added by - Ashish Dewangan on 30-08-2024
      Reason - Displaying amount report for superuser */}
      {!isLoading && user.is_superuser == true && (
        <Grid
          container
          spacing={2}
          justifyContent="space-between"
          alignItems="center"
          wrap="wrap"
          // paddingTop="0.5%"
          paddingBottom="1%"
        >
          {activeTab === 0 ? (
            <Grid 
              item 
              xs={12} // Ensures full width so content can be centered
              style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
            >
              <StyledCard style={{ backgroundColor: "#e3f2fd" }}>
                {" "}
                <CardContent>
                  <Typography
                    variant="h6"
                    style={{ fontSize: "16px", fontWeight: "500" }}
                  >
                    Total Partial Amount
                  </Typography>
                  <Typography
                    variant="h4"
                    style={{ fontSize: "22px", fontWeight: "500" }}
                  >
                    ₹{amountSummary.overall_partial_amount}
                  </Typography>
                </CardContent>
              </StyledCard>
            </Grid>
          ):null}

          {activeTab === 1 ? (
            <Grid item>
              <StyledCard style={{ backgroundColor: "#e3f2fd" }}>
                {" "}
                {/* Light Blue */}
                <CardContent>
                  <Typography
                    variant="h6"
                    style={{ fontSize: "16px", fontWeight: "500" }}
                  >
                    {/* Modified by - Ashish Dewangan on 23-09-2024
                    Reason - To change the label */}
                    {/* Net Grand Total */}
                    Total Room Charges
                    {/* End of modification by - Ashish Dewangan on 23-09-2024
                    Reason - To change the label */}
                  </Typography>
                  <Typography
                    variant="h4"
                    style={{ fontSize: "22px", fontWeight: "500" }}
                  >
                    ₹{amountSummary.overall_grand_total}
                  </Typography>
                </CardContent>
              </StyledCard>
            </Grid>
          ):null}

          {activeTab == 1 ? (
            <Grid item>
              <StyledCard style={{ backgroundColor: "#fff9c4" }}>
                {" "}
                {/* Light Yellow */}
                <CardContent>
                  <Typography
                    variant="h6"
                    style={{ fontSize: "16px", fontWeight: "500" }}
                  >
                    {/* Modified by - Ashish Dewangan on 23-09-2024
                    Reason - To change the label */}
                    {/* Net Amount Collected By Cash */}
                    Amount Received By Cash
                    {/* End of modification by - Ashish Dewangan on 23-09-2024
                    Reason - To change the label */}
                  </Typography>
                  <Typography
                    variant="h4"
                    style={{ fontSize: "22px", fontWeight: "500" }}
                  >
                    ₹{amountSummary.overall_amount_collected_by_cash}
                  </Typography>
                </CardContent>
              </StyledCard>
            </Grid>
          ) : null}

          {activeTab == 1 ? (
            <Grid item>
              <StyledCard style={{ backgroundColor: "#e8f5e9" }}>
                {" "}
                {/* Light Green */}
                <CardContent>
                  <Typography
                    variant="h6"
                    style={{ fontSize: "16px", fontWeight: "500" }}
                  >
                    {/* Modified by - Ashish Dewangan on 23-09-2024
                    Reason - To change the label */}
                    {/* Net Amount Collected By Online */}
                    Amount Received By Online
                    {/* End of modification by - Ashish Dewangan on 23-09-2024
                    Reason - To change the label */}
                  </Typography>
                  <Typography
                    variant="h4"
                    style={{ fontSize: "22px", fontWeight: "500" }}
                  >
                    ₹{amountSummary.overall_amount_collected_by_online}
                  </Typography>
                </CardContent>
              </StyledCard>
            </Grid>
          ) : null}

          

          { activeTab == 1 ? (
            <Grid item>
              <StyledCard style={{ backgroundColor: "#ffebee" }}>
                {" "}
                {/* Light Red */}
                <CardContent>
                  <Typography
                    variant="h6"
                    style={{ fontSize: "16px", fontWeight: "500" }}
                  >
                    {/* Modified by - Ashish Dewangan on 23-09-2024
                    Reason - To change the label */}
                    {/* Net Amount Collected */}
                    Total Amount Received By Cash/Online
                    {/* End of modification by - Ashish Dewangan on 23-09-2024
                    Reason - To change the label */}
                  </Typography>
                  <Typography
                    variant="h4"
                    style={{ fontSize: "22px", fontWeight: "500" }}
                  >
                    ₹{amountSummary.overall_amount_collected}
                  </Typography>
                </CardContent>
              </StyledCard>
            </Grid>
          ) : null}
          
          { activeTab == 1 ? (
            <Grid item>
              <StyledCard style={{ backgroundColor: "#e3f2fd" }}>
                {" "}
                {/* Light Blue */}
                <CardContent>
                  <Typography
                    variant="h6"
                    style={{ fontSize: "16px", fontWeight: "500" }}
                  >
                    {/* Modified by - Ashish Dewangan on 23-09-2024
                    Reason - To change the label */}
                    {/* Net Amount Refunded */}
                    Total Amount Deducted Due To Refund
                    {/* End of modification by - Ashish Dewangan on 23-09-2024
                    Reason - To change the label */}
                  </Typography>
                  <Typography
                    variant="h4"
                    style={{ fontSize: "22px", fontWeight: "500" }}
                  >
                    ₹{amountSummary.overall_amount_refunded}
                  </Typography>
                </CardContent>
              </StyledCard>
            </Grid>
          ) : null}
          
          { activeTab == 1 ? (
            <Grid item>
              <StyledCard style={{ backgroundColor: "#f3e5f5" }}>
                {" "}
                {/* Light Purple */}
                <CardContent>
                  <Typography
                    variant="h6"
                    style={{ fontSize: "16px", fontWeight: "500" }}
                  >
                    {/* Modified by - Ashish Dewangan on 23-09-2024
                    Reason - To change the label */}
                    {/* Net Amount Collected from Cancellations */}
                    Total Earning
                    {/* End of modification by - Ashish Dewangan on 23-09-2024
                    Reason - To change the label */}
                  </Typography>
                  <Typography
                    variant="h4"
                    style={{ fontSize: "22px", fontWeight: "500" }}
                  >
                    ₹{amountSummary.overall_amount_collected_after_cancellation}
                  </Typography>
                </CardContent>
              </StyledCard>
            </Grid>
          ) : null}
          
        </Grid>
      )}
      {/* End of addition by - Ashish Dewangan on 30-08-2024
      Reason - Displaying amount report for superuser */}

      
      <div style={{ paddingBottom: "5px" }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="Partial Checkouts" />
          <Tab label="Complete Checkouts" />
        </Tabs>
      </div>

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
                <TableCell align="center" style={{ padding: "0px" }}>
                  <Button style={{ fontSize: "var(--page-content-font-size)" }}>
                    {" "}
                    S.NO.
                  </Button>
                </TableCell>
                {/* modified code by akaknksha on 18-10-24, Reason to add sorting in mentioned column by qa */}
                {/* <TableCell align="center" style={{ padding: "0px" }}>
                  <Button style={{ fontSize: "var(--page-content-font-size)" }}>
                    {" "}
                    name
                  </Button>
                </TableCell> */}
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
                        padding: "3px",
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
                        padding: "3px",
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
                </TableCell>
                {/* Commented by - Ashish Dewangan on 23-09-2024
                Reason - To hide Id section */}
                {/* <TableCell align="center" style={{ padding: "0px" }}>
                  <Button style={{ fontSize: "var(--page-content-font-size)" }}>
                    Id type
                  </Button>
                </TableCell> */}
                {/* <TableCell align="center" style={{ padding: "0px" }}>
                  <Button style={{ fontSize: "var(--page-content-font-size)" }}>
                    {" "}
                    Id number
                  </Button>
                </TableCell> */}
                {/* End of comment by - Ashish Dewangan on 23-09-2024
                Reason - To hide Id section */}
                <TableCell align="center" style={{ padding: "0px" }}>
                  <Button
                    style={{
                      fontSize: "var(--page-content-font-size)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {" "}
                    Phone number
                  </Button>
                </TableCell>
                {/* <TableCell
                  align="center"
                  style={{ width: "250px", padding: "0px" }}
                >
                  <Button style={{ fontSize: "var(--page-content-font-size)" }}>
                    Room detail (No / type / variety)
                  </Button>
                </TableCell> */}
                <TableCell
                  align="center"
                  style={{ width: "250px", padding: "2px" }}
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
                {/* <TableCell align="center" style={{ padding: "0px" }}> */}
                {/* <Button style={{ fontSize: "var(--page-content-font-size)" }}> */}
                {/* Price */}
                {/* Grand Total */}
                {/* </Button> */}
                {/* </TableCell> */}
                <TableCell align="center" style={{ padding: "2px" }}>
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
                      Grand Total
                    </Button>
                    {/* Added by Akanksha on 15th Oct, Reason: to apply sorting logic */}
                    <Button
                      style={{
                        fontSize: "var(--page-content-font-size)",
                        padding: "2px",
                        minWidth: "auto",
                      }}
                      onClick={() => handleSort("grand_total")}
                    >
                      {filters.sortField === "grand_total" &&
                      filters.sortOrder === "asc" ? (
                        <AiOutlineArrowUp />
                      ) : (
                        <AiOutlineArrowDown />
                      )}
                    </Button>
                    {/* End by Akanksha on 15th Oct, Reason: to apply sorting logic */}
                  </div>
                </TableCell>

                {/* Added by - Ashish Dewangan on 23-09-2024
                Reason - To show amount pain and refunded */}
                {/* <TableCell align="center" style={{ padding: "0px" }}>
                  <Button style={{ fontSize: "var(--page-content-font-size)" }}>
                    Amount Paid
                  </Button>
                </TableCell> */}
                <TableCell align="center" style={{ padding: "2px" }}>
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
                      Amount Paid
                    </Button>
                    {/* Added by Akanksha on 15th Oct, Reason: to apply sorting logic */}
                    <Button
                      style={{
                        fontSize: "var(--page-content-font-size)",
                        padding: "2px",
                        minWidth: "auto",
                      }}
                      onClick={() => handleSort("total_paid")}
                    >
                      {filters.sortField === "total_paid" &&
                      filters.sortOrder === "asc" ? (
                        <AiOutlineArrowUp />
                      ) : (
                        <AiOutlineArrowDown />
                      )}
                    </Button>
                    {/* End by Akanksha on 15th Oct, Reason: to apply sorting logic */}
                  </div>
                </TableCell>

                <TableCell align="center" style={{ padding: "2px" }}>
                  <Button
                    style={{
                      fontSize: "var(--page-content-font-size)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    Amount Refunded
                  </Button>
                </TableCell>
                {/* End of addition by - Ashish Dewangan on 23-09-2024
                Reason - To show amount pain and refunded */}

                {/* <TableCell align="center" style={{ padding: "0px" }}>
                  <Button style={{ fontSize: "var(--page-content-font-size)" }}>
                    Arrival Date & Time
                  </Button>
                </TableCell> */}
                <TableCell align="center" style={{ padding: "2px" }}>
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
                {/* <TableCell align="center" style={{ padding: "0px" }}>
                  <Button style={{ fontSize: "var(--page-content-font-size)" }}>
                    Departure Date & Time
                  </Button>
                </TableCell> */}
                <TableCell align="center" style={{ padding: "2px" }}>
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
                    {/* Added by Akanksha on 15th Oct, Reason: to apply sorting logic */}
                    <Button
                      style={{
                        fontSize: "var(--page-content-font-size)",
                        padding: "2px",
                        minWidth: "auto",
                      }}
                      onClick={() => handleSort("departure_date")}
                    >
                      {filters.sortField === "departure_date" &&
                      filters.sortOrder === "asc" ? (
                        <AiOutlineArrowUp />
                      ) : (
                        <AiOutlineArrowDown />
                      )}
                    </Button>
                    {/* End by Akanksha on 15th Oct, Reason: to apply sorting logic */}
                  </div>
                </TableCell>
                <TableCell align="center" style={{ padding: "2px" }}>
                  <Button
                    style={{
                      fontSize: "var(--page-content-font-size)",
                      marginLeft: "4px",
                    }}
                  >
                    Status
                  </Button>
                </TableCell>

                {/**
                 * Added by - Ashish Dewangan on 13-10-2024
                 * Reason - To show the user who have performed the checkout process
                 */}
                <TableCell align="center" style={{ padding: "2px" }}>
                  <Button
                    style={{
                      fontSize: "var(--page-content-font-size)",
                      marginLeft: "2px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    Checkout Staff
                  </Button>
                </TableCell>
                {/**
                 * End of addition by - Ashish Dewangan on 13-10-2024
                 * Reason - To show the user who have performed the checkout process
                 */}
                {/*end of modified code by akaknksha on 18-10-24, Reason to add sorting in mentioned column by qa */}

                <TableCell align="center" style={{ padding: "2px" }}>
                  <Button style={{ fontSize: "var(--page-content-font-size)" }}>
                    Details
                  </Button>
                </TableCell>
                {/* Addition by Om shrivastava on 31-08-2024
                Reason : Show the Invoice details  */}
                {/* <TableCell align="center" style={{ padding: "2px" }}>
                  <Button style={{ fontSize: "var(--page-content-font-size)" }}>
                    Invoice
                  </Button>
                </TableCell> */}

                {/* Added by akanksha on 21-02-2025
                Reason : to not show invoice column while in partial checkout tab */}
                {activeTab !== 0 && (
                  <TableCell align="center" style={{ padding: "2px" }}>
                    <Button style={{ fontSize: "var(--page-content-font-size)" }}>
                      Invoice
                    </Button>
                  </TableCell>
                )}
                {/* Added by akanksha on 21-02-2025
                Reason : to not show invoice column while in partial checkout tab */}

                {/* End of addition by Om shrivastava on 31-08-2024
                Reason : Show the Invoice details  */}
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredAndDateFilteredData.length > 0 ? (
                filteredAndDateFilteredData

                // .filter((group) => {
                //   if (activeTab === 0) return group.is_partial_payment_confirmed === true && group.is_cancelled === false;
                //   if (activeTab === 1) return group.is_partial_payment_confirmed === false || group.is_cancelled === true;
                //   return true;
                // })
                
                
                .map((group, index) => {
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
                        {/* Addition by akanksha on 12th Oct 
                          Reason to show salutation with name */}
                        {group.salutation} {group.name}
                        {/* Addition by akanksha on 12th Oct 
                          Reason to show salutation with name */}
                      </TableCell>
                      {/* Commented by - Ashish Dewangan on 23-09-2024
                      Reason - To hide Id section */}
                      {/* <TableCell
                        align="center"
                        style={{
                          padding: "4px",
                          fontSize: "var(--page-content-font-size)",
                        }}
                      >
                        {group.idcardType}
                      </TableCell> */}
                      {/* <TableCell
                        align="center"
                        style={{
                          padding: "4px",
                          fontSize: "var(--page-content-font-size)",
                        }}
                      >
                        {group.idcardNo}
                      </TableCell> */}
                      {/* End of comment by - Ashish Dewangan on 23-09-2024
                      Reason - To hide Id section */}

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
                        style={{ width: "250px", padding: "4px" }}
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
                        {group.grand_total}
                      </TableCell>
                      {/* Added by - Ashish Dewangan on 23-09-2024
                      Reason - To show amount pain and refunded */}
                      <TableCell
                        align="center"
                        style={{
                          padding: "4px",
                          fontSize: "var(--page-content-font-size)",
                        }}
                      >
                        {group.total_paid}
                      </TableCell>

                      <TableCell
                        align="center"
                        style={{
                          padding: "4px",
                          fontSize: "var(--page-content-font-size)",
                        }}
                      >
                        {group.refunded_amount}
                      </TableCell>
                      {/* End of addition by - Ashish Dewangan on 23-09-2024
                      Reason - To show amount pain and refunded */}

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
                        {/* {group.arrival_time} */}
                        &nbsp;
                        {new Date(
                          `1970-01-01T${group.arrival_time}`
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                        {/* Modification and addition by Om shrivastava on 12-09-2024
                        Reason : Change the time format  */}
                      </TableCell>

                      <TableCell
                        align="center"
                        style={{
                          padding: "4px",
                          fontSize: "var(--page-content-font-size)",
                        }}
                      >
                        {group.departure_date}
                        {/* Modification and addition by Om shrivastava on 12-09-2024
                        Reason : Change the time format  */}
                        {/* {group.departure_time} */}
                        &nbsp;
                        {new Date(
                          `1970-01-01T${group.departure_time}`
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                        {/* Modification and addition by Om shrivastava on 12-09-2024
                        Reason : Change the time format  */}
                      </TableCell>

                      <TableCell
                        align="center"
                        style={{
                          padding: "4px",
                          fontSize: "var(--page-content-font-size)",
                        }}
                      >
                        {group.is_cancelled == true ? (
                          <span
                            style={{
                              backgroundColor: "#f44336",
                              
                              color: "white",
                              borderRadius: "4px",
                              padding: "4px 6px",
                            }}
                          >
                            Cancelled
                          </span>
                        ) :  group.is_partial_payment_confirmed ? (
                          <span
                            style={{
                              backgroundColor: "#f44336", // Orange for Partial Payment Confirmed
                              color: "white",
                              whiteSpace: "nowrap",
                              borderRadius: "4px",
                              padding: "4px 6px",
                            }}
                          >
                            Partial Payment
                          </span>
                        ) : (
                          <span
                            style={{
                              backgroundColor: "#00c250",
                              color: "white",
                              borderRadius: "4px",
                              padding: "4px 6px",
                            }}
                          >
                            Completed
                          </span>
                        )}
                      </TableCell>

                      {/**
                       * Added by - Ashish Dewangan on 13-10-2024
                       * Reason - To show the user who have performed the checkout process
                       */}
                      <TableCell
                        align="center"
                        style={{
                          padding: "4px",
                          fontSize: "var(--page-content-font-size)",
                        }}
                      >
                        {group.user_id_at_checkout}
                      </TableCell>
                      {/**
                       * End of addition by - Ashish Dewangan on 13-10-2024
                       * Reason - To show the user who have performed the checkin process
                       */}

                      <TableCell align="center" style={{ padding: "4px" }}>
                        <Button
                          style={{
                            border: "none",
                            paddingLeft: "42%",
                            color: "black",
                            fontSize: "var(--page-content-font-size)",
                          }}
                          variant="outlined"
                          startIcon={<GrView />}
                          // onClick={() => openCheckoutDetails(group.billing_id)}
                          onClick={() =>
                            activeTab === 0
                              ? openCheckinDetails(group.billing_id)
                              : openCheckoutDetails(group.billing_id)
                          }
                        ></Button>
                      </TableCell>

                      {/* Addition by Om shrivastava on 31-08-2024
                Reason : Show the Invoice details  */}
                
                      {/* Added by akanksha on 21-02-2025
                      Reason : to not show invoice column while in partial checkout tab */}
                      {activeTab !== 0 && (
                        <TableCell align="center" style={{ padding: "4px" }}>
                          <Button
                            style={{ 
                              border: "none", 
                              color: group?.is_partial_payment_confirmed ? "grey" : "black" 
                            }}
                            variant="outlined"
                            startIcon={<IoReceiptOutline style={{ color: group?.is_partial_payment_confirmed ? "grey" : "black" }} />}
                            onClick={() => openInvoiceDetails(group.billing_id)}
                            disabled={Boolean(group?.is_partial_payment_confirmed)}
                          ></Button>
                        </TableCell>
                      )}
                      {/* Added by akanksha on 21-02-2025
                      Reason : to not show invoice column while in partial checkout tab */}

                      {/* End of addition by Om shrivastava on 31-08-2024
                Reason : Show the Invoice details  */}
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

export default NewCheckoutList;
