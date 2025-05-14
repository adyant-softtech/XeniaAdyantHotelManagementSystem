// Created by Om Shrivastava on 31-08-2024
// Reason : Create an Invoice page

import React, { useContext, useEffect, useRef, useState } from "react";
import invoiceStyle from "./CheckoutInvoice.module.css";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getParticularCheckindetailsApi,
  getSettingsApi,
  getRoomShiftingApi,
} from "../../Api/services";
import config from "../../Api/config";
import ReactToPrint from "react-to-print";
import { ToWords } from "to-words";
import { usePDF } from "react-to-pdf";
import { GlobalContext } from "../../context/Context";


export default function Invoice() {
  const nav = useNavigate();
  const location = useLocation();
  const { tenant } = useContext(GlobalContext);
  const [settings, setSettings] = useState({});
  const [billingDetails, setBillingDetails] = useState({});
  const [personalDetails, setPersonalDetails] = useState({});
  const [checkinDetails, setCheckinDetails] = useState([]);
  const [guestDetails, setGuestDetails] = useState([]); // Add state for guest details

  const [extraPersonCharge, setExtraPersonCharge] = useState(0);
  const [defaultExtraPersonCharge, setDefaultExtraPersonCharge] = useState(0);

  const [discountIn, setDiscountIn] = useState("Discount in (₹)");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);

  const [roomCharges, setRoomCharges] = useState(0);
  const [newRoomCharges, setNewRoomCharges] = useState(0);
  const [defaultRoomCharges, setDefaultRoomCharges] = useState(0);

  const [taxableAmount, setTaxableAmount] = useState(0);
  const [gst, setGst] = useState(0);
  const [gstValue, setGstValue] = useState(0);
  const [subTotal, setSubTotal] = useState(0);
  const [advancePayAmount, setAdvancePayAmount] = useState(0);
  const [total, setTotal] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [paymentReceiptData, setPaymentReceiptData] = useState([]);
  const [arrivalDate, setArrivalDate] = useState("");
  const [departureDate, setDepartureDate] = useState("");

  const [roomShiftedFlag, setRoomShiftedFlag] = useState(false);
  const [roomShiftHistory, setRoomShiftHistory] = useState();
  const [newRoomDetail, setNewRoomDetail] = useState({});
  const [newRoomCharge, setNewRoomCharge] = useState(0);
  const [newRoomPrice, setNewRoomPrice] = useState(0);
  const [newRoomDays, setNewRoomDays] = useState(0);
  const [shiftedDate, setShiftedDate] = useState();
  const [newCheckinDetails, setNewCheckinDetails] = useState({});
  const [previousRoomCharge, setPreviousRoomCharge] = useState(0);
  
  const [numberOfDays, setNumberOfDays] = useState(0);
  let componentRef = useRef();
  // Addition by Om Shrivastava on 19-10-2024
  // Reason : Create variable for set the pdf data
  const { toPDF, targetRef } = usePDF({ filename: "invoice.pdf" });
  // End of addition by Om Shrivastava on 19-10-2024
  // Reason : Create variable for set the pdf data

  /**
   * Added by - Ashish Dewangan on 12-10-2024
   * Reason - To show amount in words
   */
  const toWords = new ToWords({
    localeCode: "en-IN",
    converterOptions: {
      currency: true,
      ignoreDecimal: false,
      ignoreZeroCurrency: false,
      doNotAddOnly: false,
      currencyOptions: {
        name: "Rupee",
        plural: "Rupees",
        symbol: "₹",
        fractionalUnit: {
          name: "Paisa",
          plural: "Paise",
          symbol: "",
        },
      },
    },
  });
  /**
   * End of addition by - Ashish Dewangan on 12-10-2024
   * Reason - To show amount in words
   */

  useEffect(() => {
    const getParticularCheckindetails = async () => {
      try {
        const access = localStorage.getItem("access");
        const response = await getParticularCheckindetailsApi(
          access,
          location?.state?.id,
          tenant
        );
        setBillingDetails(response.billing_details);
        setPersonalDetails(response.billing_details.personal_details);
        setCheckinDetails(response.checkin_details);
        setDefaultRoomCharges(Number(response.billing_details.room_charges));
        setRoomCharges(Number(response.billing_details.room_charges));
        setNewRoomCharges(Number(response.billing_details.new_room_charges));
        setDefaultExtraPersonCharge(
          Number(response.billing_details.extra_person_charges)
        );
        setExtraPersonCharge(
          Number(response.billing_details.extra_person_charges)
        );
        setSubTotal(Number(response.billing_details.sub_total));
        setTaxableAmount(Number(response.billing_details.taxable_amount));
        setTotal(Number(response.billing_details.total));
        setGrandTotal(Number(response.billing_details.grand_total));
        setGst(Number(response.billing_details.gst));
        setGstValue(Number(response.billing_details.gst_value));
        setDiscountIn(response.billing_details.discount_in);
        setDiscountAmount(Number(response.billing_details.discount_rupees));
        setDiscountPercentage(
          Number(response.billing_details.discount_percentage)
        );
        setAdvancePayAmount(
          Number(response.billing_details.advanced_pay_amount)
        );
        setGuestDetails(response.guest_details);
        setPaymentReceiptData(response.payment_receipts);

        {
          /* Added by - Ashish Dewangan on 19-09-2024
                Reason - To set formated date */
        }
        var arrival = new Date(response?.billing_details?.arrival_date);
        var departure = new Date(response?.billing_details?.departure_date);
        setArrivalDate(
          (arrival.getDate() < 10 ? "0" : "") +
            arrival.getDate() +
            "-" +
            (arrival.getMonth() < 9 ? "0" : "") +
            (arrival.getMonth() + 1) +
            "-" +
            arrival.getFullYear()
        );
        setDepartureDate(
          (departure.getDate() < 10 ? "0" : "") +
            departure.getDate() +
            "-" +
            (departure.getMonth() < 9 ? "0" : "") +
            (departure.getMonth() + 1) +
            "-" +
            departure.getFullYear()
        );
        {
          /* End of addition by - Ashish Dewangan on 19-09-2024
                Reason - To set formated date */
        }

        /**
         * Added by - Ashish Dewangan on 12-10-2024
         * Reason - To calculate number of days
         */
        var first_date = new Date(
          response?.billing_details?.arrival_date +
            " " +
            response?.billing_details?.arrival_time
        );
        var second_date = new Date(
          response?.billing_details?.departure_date +
            " " +
            response?.billing_details?.departure_time
        );
        setNumberOfDays(
          Math.ceil((second_date - first_date) / (1000 * 60 * 60 * 24)) | 1
        );
        /**
         * End of addition by - Ashish Dewangan on 12-10-2024
         * Reason - To calculate number of days
         */
      } catch (error) {}
    };

    getParticularCheckindetails();
  }, [location]);

  useEffect(() => {
    const fetchRoomShift = async () => {
      
      const billingId = location?.state?.id;
      console.log("billing id", billingId);
      if (!billingId) return;
      try {
          const response = await getRoomShiftingApi(billingId, tenant);
          console.log(response.room_shifted);
          
          console.log("get room shift api:", response);
          setNewRoomCharge(Number(response?.new_room_details?.price));
          setRoomShiftedFlag(response.room_shifted);
          setRoomShiftHistory(response.room_shift_history);
          setNewRoomDetail(response.new_room_details);
          setShiftedDate(response.room_shift_history?.[0]?.shifted_at || null);
          setNewCheckinDetails(response.new_checkin_details);
          // setStatus(response.status); 
        } 
      
        catch (err) {
          console.error("Error: ", err);
        } 
      };

    fetchRoomShift();
  }, [location?.state?.id]);

  useEffect(() => {
    const getSettingDetails = async () => {
      try {
        const access = localStorage.getItem("access");
        const response = await getSettingsApi(access, tenant);
        setSettings(response);
      } catch (error) {
        console.error("Error fetching Setting Details:", error);
      }
    };

    getSettingDetails();
  }, []);

  // Added by - Ashlekh on 04-10-2024
  // Reason - To format created date
  const formatDate = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  };
  // End of code - Ashlekh on 04-10-2024
  // Reason - To format created date
  console.log("ggggggggggggggggggggggggggggggggg", guestDetails);
  let serialNumber = 1;
  return (
    <div className={invoiceStyle.pageFrame}>
      {/* Addition by Om Shrivastava on 19-10-2024
      Reason : Set the pdf data inside this div */}
      <div ref={targetRef}>
        {/* End of addition by Om Shrivastava on 19-10-2024
      Reason : Set the pdf data inside this div */}
        <div
          className={invoiceStyle.pageContainer}
          ref={(el) => (componentRef = el)}
        >
          <div className={invoiceStyle.header}>
            <div className={invoiceStyle.hotelInfo}>
              <h2 className={invoiceStyle.colorfulTitle}>{settings.hotel_name}</h2>
              {/* Modified by - Ashish Dewangan on 18-09-2024
              Reason - To show contact number, gstin, email and tin number in receipt */}
              {/* <address >{settings.hotel_address}</address> */}
              <address className={invoiceStyle.addressInvoice}>
                {settings.hotel_address}
              </address>
              <div className={invoiceStyle.basicFont}>
                {settings.contact_number &&
                  settings.contact_number?.trim()?.length > 0 && (
                    <span>Phone : {settings.contact_number} , </span>
                  )}
                {settings.email && settings.email?.trim()?.length > 0 && (
                  <span>Email : {settings.email}</span>
                )}
              </div>

              <div className={invoiceStyle.basicFont}>
                {billingDetails.gstin &&
                  billingDetails.gstin?.trim()?.length > 0 && (
                    <span>GSTIN : {billingDetails.gstin} , </span>
                  )}
                {billingDetails.tin &&
                  billingDetails.tin?.trim()?.length > 0 && (
                    <span>TIN : {billingDetails.tin}</span>
                  )}
              </div>
              {/* End of modification by - Ashish Dewangan on 18-09-2024
              Reason - To show contact number, gstin, email and tin number in receipt */}
            </div>
            <div className={invoiceStyle.logoSection}>
              <img
                src={config.baseURL + settings.logo}
                alt="Logo"
                className={invoiceStyle.logo}
              />
            </div>
          </div>
          <div>
            <div className={invoiceStyle.customerDetails}>
              {/* <div className={invoiceStyle.invoiceInfo}>
            <div className={invoiceStyle.invoiceNumber}>
              <strong>Invoice No:</strong> {billingDetails?.invoice_number}
            </div>
            <div className={invoiceStyle.invoiceNumber}>
              <strong>Bill No:</strong> {billingDetails?.bill_number}
            </div>
            </div> */}
              <div
                className={invoiceStyle.dates}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: "50%",
                }}
              >
                {/* Modified by - Ashish Dewangan on 12-10-2024
                 * Reason - To show customer details, number of days and number of persons. */}
                {/* <div className={invoiceStyle.dateItem}>
                <strong>Invoice No &nbsp;:</strong> &nbsp;
                {billingDetails?.invoice_number}
              </div>
              <div className={invoiceStyle.dateItem}>
                <strong>
                  Bill No &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:
                </strong>{" "}
                &nbsp;{billingDetails?.bill_number}
              </div>
             
              <div className={invoiceStyle.dateItem}>
                <strong>Date &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; :</strong> &nbsp;
             
                {formatDate(settings?.created_at)}
              </div> */}

                <div className={invoiceStyle.dateItem}>
                  <div>
                    <strong>Invoice No </strong>
                  </div>
                  <strong>&nbsp; : &nbsp;</strong> {billingDetails?.invoice_number}
                </div>
                <div className={invoiceStyle.dateItem}>
                  <div>
                    <strong>Bill No</strong>
                  </div>{" "}
                  <strong>&nbsp; : &nbsp;</strong>
                  {billingDetails?.bill_number}
                </div>
                {/* Added by - Ashlekh on 04-10-2024
              Reason - To display creation date */}
                <div className={invoiceStyle.dateItem}>
                  <div>
                    <strong>Date</strong>
                  </div>{" "}
                  <strong>&nbsp; : &nbsp;</strong>
                  {/* {settings?.created_at} */}
                  {/* Modification and addition by Om Shriavstava on 16-10-2024
                Reason : Set the checkout timing  */}
                  {/* {formatDate(settings?.created_at)} */}
                  {formatDate(billingDetails?.updated_at)}
                  {/* End of modification and addition by Om Shriavstava on 16-10-2024
                Reason : Set the checkout timing  */}
                </div>
                {/* End of code - Ashlekh on 04-10-2024
              Reason - To display creation date */}

                {/* End of modification by - Ashish Dewangan on 12-10-2024
                 * Reason - To show customer details, number of days and number of persons. */}
              </div>
              {/* modified code by akaknksha on 18-10-24, Reason to set arrival and departure in separate line as mentioned by qa */}
              <div style={{ width: "35%" }}>
                <div className={invoiceStyle.dateItem}>
                  <div>
                    <strong>Customer Name</strong>
                  </div>{" "}
                  <strong>&nbsp; : &nbsp;</strong>
                  {/* Added by akanksha on 16th-10-2024,
                Reason to add salutation in invoice */}
                  {billingDetails?.customer_salutation}{" "}
                  {/* End by akanksha on 16th-10-2024,
                Reason to add salutation in invoice */}
                  {billingDetails?.customer_name}{" "}
                  {billingDetails?.customer_last_name}
                </div>

                <div className={invoiceStyle.dateItem}>
                  <div>
                    <strong>Customer Phone No </strong>
                  </div>{" "}
                  <strong>&nbsp; : &nbsp;</strong>
                  {billingDetails?.customer_phone}
                </div>

                <div className={invoiceStyle.dateItem}>
                  <div>
                    <strong>Number of Persons</strong>
                  </div>{" "}
                  <strong>&nbsp; : &nbsp;</strong>
                  {billingDetails?.number_of_persons}
                </div>

                <div className={invoiceStyle.dateItem}>
                  <div>
                    <strong>Number of Days</strong>
                  </div>{" "}
                  <strong>&nbsp; : &nbsp;</strong>
                  {numberOfDays}
                </div>
              </div>

              <div className={invoiceStyle.check} style={{ width: "40%" }}>
                <div className={invoiceStyle.dateItem}>
                  <strong>Arrival Date & Time &nbsp; : &nbsp;</strong>{" "}
                  {/* Modified by - Ashish Dewangan on 19-09-2024
                Reason - To format date and time */}
                  {/* {checkinDetails[0]?.arrival_date} ,{" "}
                {checkinDetails[0]?.arrival_time} */}
                  {arrivalDate} ,{/* {billingDetails?.arrival_time} */}
                  {new Date(
                    `1970-01-01T${billingDetails?.arrival_time}`
                  ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                  {/* End of modification by - Ashish Dewangan on 19-09-2024
                Reason - To format date and time */}
                </div>
                <div className={invoiceStyle.dateItem}>
                  <strong>Departure Date & Time &nbsp; : &nbsp;</strong>{" "}
                  {/* Modified by - Ashish Dewangan on 19-09-2024
                Reason - To format date and time */}
                  {/* {checkinDetails[0]?.departure_date} ,{" "} 
                {checkinDetails[0]?.departure_time}*/}
                  {departureDate} ,
                  {/* Modification and addition by Om Shrivastava on 15-10-2024
                Reason : Fix the time format  */}
                  {/* {billingDetails?.departure_time} */}
                  {new Date(
                    `1970-01-01T${billingDetails?.departure_time}`
                  ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                  {/* Modification and addition by Om Shrivastava on 15-10-2024
                Reason : Fix the time format  */}
                  {/* End of modification by - Ashish Dewangan on 19-09-2024
                Reason - To format date and time */}
                </div>
              </div>
            </div>

            
            <table className={invoiceStyle.invoiceTable}>
              <thead>
                <tr>
                  <th>Sr No.</th>
                  <th>Name</th>
                  <th>Room Number</th>
                  <th>Room Type/Variety</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>

                {/* <tr>
                  <td>1</td>
                  <td>
                    {billingDetails?.customer_salutation || ""}{" "}
                    {billingDetails?.customer_name || ""}{" "}
                    {billingDetails?.customer_last_name || ""}
                  </td>
                  <td>{checkinDetails?.[0]?.room_number?.number || "N/A"}</td>
                  <td>
                    {checkinDetails?.[0]?.room_number?.room_type || "N/A"}/
                    {checkinDetails?.[0]?.room_number?.variety || "N/A"}
                  </td>
                  <td>
                    {checkinDetails?.[0]?.room_number?.price
                      ? `₹${checkinDetails[0].room_number.price}`
                      : "N/A"}
                  </td>
                </tr> */}
                
                {checkinDetails.length > 0 &&
                  checkinDetails
                    .sort((a, b) => (b.room_shifted ? 1 : 0) - (a.room_shifted ? 1 : 0))
                    .map((checkin) => (
                      <tr key={serialNumber}>
                        <td>{serialNumber++}</td> {/* Dynamic Serial Number */}
                        <td>
                          {billingDetails?.customer_salutation || ""}{" "}
                          {billingDetails?.customer_name || ""}{" "}
                          {billingDetails?.customer_last_name || ""}
                        </td>
                        <td>
                          {checkin.room_shifted
                            ? `Shifted to ${checkin.room_number?.number || "N/A"}`
                            : checkin.room_number?.number || "N/A"}
                        </td>
                        <td>
                          {checkin.room_number?.room_type || "N/A"}/
                          {checkin.room_number?.variety || "N/A"}
                        </td>
                        <td>
                          {checkin.room_number?.price
                            ? `₹${checkin.room_number.price}`
                            : "N/A"}
                        </td>
                      </tr>
                    ))}


                {/* {guestDetails.map((detail, index) => (
                  <tr key={index + 2}>
                    <td>{index + 2}</td> 
                    <td>{detail.guest_salutation} {detail.guest_name} {detail.guest_last_name}</td>
                    <td>{detail.selectedRoom || "-"}</td>
                    <td>
                      {detail.room_details?.room_type || detail.room_details?.variety
                        ? `${detail.room_details?.room_type} / ${detail.room_details?.variety}`
                        : "-"}
                    </td>
                    <td>
                      {detail.room_details?.price ? `₹${detail.room_details.price.toFixed(2)}` : "-"}
                    </td>
                  </tr>
                ))} */}
                {[...guestDetails]
                  .sort((a, b) => (b.room_shifted ? 1 : 0) - (a.room_shifted ? 1 : 0)) // Moves shifted guests to the top
                  .map((detail) => (
                    <tr key={serialNumber}>
                      <td>{serialNumber++}</td> {/* Sr No. starts from 2 for guests */}
                      <td>{detail.guest_salutation} {detail.guest_name} {detail.guest_last_name}</td>
                      
                      {/* Check if the guest has shifted rooms */}
                      <td>
                        {detail.room_shifted 
                          ? `Shifted to ${detail.selectedRoom || "-"}`
                          : detail.selectedRoom || "-"}
                      </td>

                      <td>
                        {detail.room_details?.room_type || detail.room_details?.variety
                          ? `${detail.room_details?.room_type} / ${detail.room_details?.variety}`
                          : "-"}
                      </td>

                      <td>
                        {detail.room_details?.price ? `₹${detail.room_details.price.toFixed(2)}` : "-"}
                      </td>
                    </tr>
                ))}

              <br />
              </tbody>
            </table>
            {/* Addition by Om Shrivastava on 23-09-2024
          Reason : Add the advance payment list */}
            {/*Start of code by akanksha on 16-10-2024, 
          reason : to change the ui of invoice from advance payment */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <div style={{ width: "60%" }}>
                {/* Advance Payment Table */}
                <caption
                  style={{
                    textDecoration: "underline",
                    color: "black",
                    padding: "2px 10px",
                    textAlign: "center",
                    display: "inline-block",
                    marginBottom: "15px",
                    fontWeight: "600",
                    fontSize: "16px",
                  }}
                >
                  {/* Advance Payment */}
                  Payment Detail
                </caption>
                <table className={invoiceStyle.paymentTable}>
                  <thead>
                    <tr>
                      <th>Sr No.</th>
                      <th>Receipt No</th>
                      {/* Modification and addition by Om Shrivastava on 25-10-2024
                      Reason : Arrange the column  */}
                      <th>Amount Paid</th>
                      <th>Payment Method</th>
                      {/* End of modification and addition by Om Shrivastava on 25-10-2024
                      Reason : Arrange the column  */}
                      <th>Payment Type</th>
                    </tr>
                  </thead>
                  {/* <tbody>
                    {paymentReceiptData.map((detail, index) => {
                      const isLast = index === paymentReceiptData.length - 1;
                      const label = isLast 
                        ? "Final Amt" 
                        : detail?.is_partial 
                          ? "Partial Amt" 
                          : "Advance Amt";
                       
                      return (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{detail?.receipt_number}</td>
                          <td>₹ {detail?.amount_paid}</td>
                          <td>{detail?.payment_method}</td>
                          <td>{label}</td>
                        </tr>
                      );
                    })}
                  </tbody> */}
                  {/* <tbody>
                    {(() => {
                      let partialSum = 0;
                      let partialIndexes = [];
                      let updatedData = [];
                      let lastIndex = paymentReceiptData.length - 1;

                      paymentReceiptData.forEach((detail, index) => {
                        const isLast = index === lastIndex;
                        
                        if (!isLast && detail?.is_partial) {
                          partialSum += Number(detail.amount_paid);
                          partialIndexes.push(index);
                        } else {
                          updatedData.push({
                            ...detail,
                            label: isLast ? "Final Amt" : detail?.is_partial ? "Partial Amt" : "Advance Amt",
                          });
                        }
                      });

                      if (partialIndexes.length > 1) {
                        updatedData.splice(partialIndexes[0], 0, {
                          receipt_number: paymentReceiptData[partialIndexes[0]].receipt_number,
                          amount_paid: partialSum.toFixed(2),
                          payment_method: paymentReceiptData[partialIndexes[0]].payment_method,
                          label: "Partial Amt",
                        });
                      }

                      return updatedData.map((detail, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{detail.receipt_number}</td>
                          <td>₹ {detail.amount_paid}</td>
                          <td>{detail.payment_method}</td>
                          <td>{detail.label}</td>
                        </tr>
                      ));
                    })()}
                  </tbody> */}

                  {/* <tbody>
                    {(() => {
                      let partialSum = 0;
                      let partialEntries = [];
                      let updatedData = [];
                      let lastIndex = paymentReceiptData.length - 1;

                      paymentReceiptData.forEach((detail, index) => {
                        const isLast = index === lastIndex;

                        if (detail?.is_partial) {
                          partialSum += Number(detail.amount_paid);
                          partialEntries.push(detail);
                        } else if (isLast) {
                          // Last payment should always be "Final Amt"
                          updatedData.push({
                            ...detail,
                            label: "Final Amt",
                          });
                        } else {
                          // Any non-partial, non-final payment is an "Advance Amt"
                          updatedData.push({
                            ...detail,
                            label: "Advance Amt",
                          });
                        }
                      });

                      // Case 1: Single partial payment → Show it directly
                      if (partialEntries.length === 1) {
                        updatedData.unshift({
                          ...partialEntries[0],
                          label: "Partial Amt",
                        });
                      }

                      // Case 2: Multiple partial payments → Sum them up
                      if (partialEntries.length > 1) {
                        updatedData.unshift({
                          receipt_number: partialEntries[0].receipt_number,
                          amount_paid: partialSum.toFixed(2),
                          payment_method: partialEntries[0].payment_method,
                          label: "Partial Amt",
                        });
                      }

                      return updatedData.map((detail, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{detail.receipt_number}</td>
                          <td>₹ {detail.amount_paid}</td>
                          <td>{detail.payment_method}</td>
                          <td>{detail.label}</td>
                        </tr>
                      ));
                    })()}
                  </tbody> */}

                  {/* <tbody>
                    {(() => {
                      let partialSum = 0;
                      let partialEntries = [];
                      let updatedData = [];
                      let lastIndex = paymentReceiptData.length - 1;

                      paymentReceiptData.forEach((detail, index) => {
                        const isLast = index === lastIndex;

                        if (detail?.is_partial) {
                          partialSum += Number(detail.amount_paid);
                          partialEntries.push(detail);
                        } else if (isLast) {
                          // Last payment should always be "Final Amt"
                          updatedData.push({
                            ...detail,
                            label: "Final Amt",
                          });
                        } else {
                          // Any non-partial, non-final payment is an "Advance Amt"
                          updatedData.push({
                            ...detail,
                            label: "Advance Amt",
                          });
                        }
                      });

                      // Case 1: Single Partial Payment → Show it with its receipt number
                      if (partialEntries.length === 1) {
                        updatedData.unshift({
                          ...partialEntries[0],
                          label: "Partial Amt",
                        });
                      }

                      // Case 2: Multiple Partial Payments → Sum them up & show "-" as receipt number
                      if (partialEntries.length > 1) {
                        updatedData.unshift({
                          receipt_number: "-",
                          amount_paid: partialSum.toFixed(2),
                          payment_method: partialEntries[0].payment_method,
                          label: "Partial Amt",
                        });
                      }

                      return updatedData.map((detail, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{detail.receipt_number}</td>
                          <td>₹ {detail.amount_paid}</td>
                          <td>{detail.payment_method}</td>
                          <td>{detail.label}</td>
                        </tr>
                      ));
                    })()}
                  </tbody> */}

                  {/* Added by akanksha on 19-02-2025
                  Reason: to show "-" for sum of partial payment and correct the series of advance payment, partial, final amt. */}
                  <tbody>
                    {(() => {
                      let partialSum = 0;
                      let partialEntries = [];
                      let advanceEntries = [];
                      let finalEntry = null;

                      let lastIndex = paymentReceiptData.length - 1;

                      // Categorize payments
                      paymentReceiptData.forEach((detail, index) => {
                        const isLast = index === lastIndex;

                        if (isLast) {
                          // Ensure the last entry is always Final Amt
                          finalEntry = {
                            ...detail,
                            label: "Final Amt",
                          };
                        } else if (detail?.is_partial) {
                          partialSum += Number(detail.amount_paid);
                          partialEntries.push(detail);
                        } else {
                          advanceEntries.push({
                            ...detail,
                            label: "Advance Amt",
                          });
                        }
                      });

                      let updatedData = [];

                      // Add Advance Payments first
                      updatedData.push(...advanceEntries);

                      // Add Partial Payments (excluding last one)
                      if (partialEntries.length === 1) {
                        updatedData.push({
                          ...partialEntries[0],
                          label: "Partial Amt",
                        });
                      } else if (partialEntries.length > 1) {
                        updatedData.push({
                          receipt_number: "-",
                          amount_paid: partialSum.toFixed(2),
                          payment_method: partialEntries[0].payment_method,
                          label: "Partial Amt",
                        });
                      }

                      // Add Final Payment separately
                      if (finalEntry) {
                        updatedData.push(finalEntry);
                      }

                      return updatedData.map((detail, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{detail.receipt_number}</td>
                          <td>₹ {detail.amount_paid}</td>
                          <td>{detail.payment_method}</td>
                          <td>{detail.label}</td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                  {/* Added by akanksha on 19-02-2025
                  Reason: to show "-" for sum of partial payment and correct the series of advance payment, partial, final amt. */}
                  









                </table>

                <div style={{ fontSize: "var(--invoice-title-font)" }}>
                  {" "}
                  <p style={{ fontWeight: "500", marginTop: "10px" }}>
                    Total Payable Amount (In Words):{" "}
                  </p>
                  (
                  {toWords.convert(
                    Number(Math.round(billingDetails?.grand_total || 0))
                  )}
                  )
                </div>
              </div>
              <div style={{ width: "35%" }}>
                {/* Total Section */}
                <div className={invoiceStyle.totalSection}>
                  <div className={invoiceStyle.totals}>
                    <div className={invoiceStyle.subtotal}>
                      <span>Room Charges</span>
                      <span>₹ {billingDetails?.room_charges}</span>
                    </div>
                    {newRoomCharges != null && (
                      <div className={invoiceStyle.subtotal}>
                        <span>New Room Charges</span>
                        <span>₹ {billingDetails?.new_room_charges || 0}</span>
                      </div>
                    )}
                    <div className={invoiceStyle.subtotal}>
                      <span>Extra Bed Charges</span>
                      <span>₹ {billingDetails?.extra_person_charges}</span>
                    </div>
                    <div className={invoiceStyle.subtotal}>
                      <span>Subtotal</span>
                      <span>₹ {billingDetails?.sub_total}</span>
                    </div>
                    {/* Modification and addition by Om Shrivastava on 27-10-2024
                    Reason : Arrange some fields  */}
                    {/* Commented by Om Shrivastava on 24-10-2024
                    Reason : Remove the discount in field  */}
                    <div className={invoiceStyle.subtotal}>
                      <span>Discount rupee </span>
                      <span>₹ {billingDetails?.discount_rupees}</span>
                    </div>
                    <div className={invoiceStyle.subtotal}>
                      <span>Discount percentage </span>
                      <span>{billingDetails?.discount_percentage}%</span>
                    </div>
                    {/* End of addition by Om Shrivastava on 24-10-2024
                    Reason : Add the discount field  */}
                    
                    <div className={invoiceStyle.subtotal}>
                      <span>Taxable amount</span>
                      <span>₹ {billingDetails?.taxable_amount}</span>
                    </div>
                    
                    <div className={invoiceStyle.subtotal}>
                      <span>GST ({billingDetails?.gst}%)</span>
                      <span>₹ {billingDetails?.gst_value}</span>
                    </div>
                    
                    <div className={invoiceStyle.subtotal}>
                      <span>CGST ({billingDetails?.gst / 2}%)</span>
                      <span>₹ {billingDetails?.gst_value / 2}</span>
                    </div>
                    <div className={invoiceStyle.subtotal}>
                      <span>SGST ({billingDetails?.gst / 2}%)</span>
                      <span>₹ {billingDetails?.gst_value / 2}</span>
                    </div>
                    {/* added by akanksha on 21-11-2024,
                    Reason : to show total amount */}
                    <div className={invoiceStyle.subtotal}>
                      <span>Total amount</span>
                      <span>₹ {billingDetails?.total}</span>
                    </div>
                    {/* added by akanksha on 21-11-2024,
                    Reason : to show total amount */}
                    <div className={invoiceStyle.subtotal}>
                      <span>Miscellaneous charges</span>
                      <span>
                        ₹ {billingDetails?.miscellaneous_charges || "0.00"}
                      </span>
                    </div>

                    {/* Addition by Ashish Dewangan on 16-11-2024
                     * Reason : Added extra discount field  */}
                    {billingDetails?.extra_discount != null &&
                      Number(billingDetails?.extra_discount) > 0 && (
                        <div className={invoiceStyle.subtotal}>
                          <span>Extra Discount</span>
                          <span>
                            ₹ {billingDetails?.extra_discount || "0.00"}
                          </span>
                        </div>
                      )}
                    {/* End of addition by Ashish Dewangan on 16-11-2024
                    * Reason : Added extra discount field  */}


                    {/* Addition by Om Shrivastava on 24-10-2024
                    Reason : Add the discount field  */}
                    {/* Commented by Om Shrivastava on 24-10-2024
                    Reason : Remove the discount in field  */}
                    {/* <div className={invoiceStyle.subtotal}>
                      <span>Discount in </span>
                      <span>{billingDetails?.discount_in}</span>
                    </div> */}
                    
                    <div className={invoiceStyle.grandTotal}>
                      <span>Grand Total</span>
                      <div style={{ textAlign: "end" }}>
                        ₹{" "}
                        {billingDetails?.grand_total
                          ? Math.round(billingDetails.grand_total)
                          : 0}
                      </div>
                    </div>
                    {/* End of modification and addition by Om Shrivastava on 27-10-2024
                    Reason : Arrange some fields  */}
                  </div>
                </div>
                {/* End of modification by - Ashish Dewangan on 12-10-2024
                 * Reason - To show amount in words
                 */}
              </div>
            </div>
            {/* End of addition by Om Shrivastava on 23-09-2024
          Reason : Add the advance payment list */}
          </div>
          <div style={{ marginTop: "10px" }}>
            <table
              className="footerTable"
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "var(--invoice-title-font)",
              }}
            >
              <tbody>
                <tr style={{ height: "40px" }}>
                  <td
                    style={{
                      width: "33%",
                      border: "1px solid #ddd",
                      verticalAlign: "top",
                      padding: "5px",
                    }}
                  >
                    Remark :
                  </td>
                  <td
                    style={{
                      width: "35%",
                      border: "1px solid #ddd",
                      verticalAlign: "top",
                      padding: "5px",
                    }}
                  >
                    Receiver name & signature :
                  </td>
                  <td
                    style={{
                      width: "31%",
                      border: "1px solid #ddd",
                      verticalAlign: "top",
                      padding: "5px",
                    }}
                  >
                    For Hotel Satkar :
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {/*End of code by akanksha on 16-10-2024, 
          reason : to change the ui of invoice from advance payment */}
        </div>
        {/* Addition by Om Shrivastava on 19-10-2024
      Reason : Set the pdf data inside this div */}
      </div>
      {/* End of addition by Om Shrivastava on 19-10-2024
      Reason : Set the pdf data inside this div */}

      <div className={invoiceStyle.buttonContainer}>
        {/* // Addition by Om Shrivastava on 19-10-2024
        // Reason : Add Button for pdf download */}
        <button
          style={{ fontSize: "14px", marginTop: "2%" }}
          className="submitButton"
          // type="submit"
          onClick={() => toPDF()}
        >
          Download
        </button>
        
        {/* // End of addition by Om Shrivastava on 19-10-2024
        // Reason : Add Button for pdf download */}
        <ReactToPrint
          trigger={() => (
            <button
              style={{ fontSize: "14px", marginTop: "2%", marginLeft: "1%" }}
              className="submitButton"
              type="submit"
            >
              Print
            </button>
          )}
          content={() => componentRef}
        ></ReactToPrint>
        {/* Added by - Ashish Dewangan on 19-09-2024
          Reason - Added close button */}
        <button
          style={{ fontSize: "14px", marginTop: "2%", marginLeft: "20px" }}
          className="submitButton"
          onClick={(e) => {
            nav(-1);
          }}
        >
          Close
        </button>
        {/* End of addition by - Ashish Dewangan on 19-09-2024
          Reason - Added close button */}
      </div>
    </div>
  );
}
// Created by Om Shrivastava on 31-08-2024
// Reason : Create an Invoice page
