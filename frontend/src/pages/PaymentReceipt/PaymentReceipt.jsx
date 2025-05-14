/**Creation by Tejasve Gupta on 11-08-2024 */

import React, { useState, useEffect, useRef, useContext } from "react";
import { Modal, Button } from "antd";
import { getSettingsApi } from "../../Api/services";
import receiptStyles from "./PaymentReceipt.module.css"; // Import the CSS
import config from "../../Api/config";
import ReactToPrint from "react-to-print";
import { ToWords } from "to-words";
import { usePDF } from "react-to-pdf";
import { toPng } from 'html-to-image';
import download from 'downloadjs';
import { GlobalContext } from "../../context/Context";

const PaymentReceiptModal = ({ visible, onClose, paymentReceiptData }) => {
  let componentRef = useRef();

  // Addition by Om Shrivastava on 19-10-2024
  // Reason : Create variable for set the pdf data 
  const { toPDF, targetRef } = usePDF({ filename: "payment_receipt.pdf" });
  // End of addition by Om Shrivastava on 19-10-2024
  // Reason : Create variable for set the pdf data 

  const { tenant } = useContext(GlobalContext);

  const {
    payment_method,
    amount_paid,
    person_name,
    /* Addition by akanksha on 12th Oct 
    Reason to send salutation with name */
    person_salutation,
    /* End of Addition by akanksha on 12th Oct 
    Reason to send salutation with name */
    total_amount,
    billing_id,
    created_at,
    updated_at,
    receipt_number,
    /**
     * Added by - Ashish Dewangan on 30-09-2024
     * Reason - To show room numbers and room charges
     */
    room_charges,
    room_numbers,
    /**
     * End of addition by - Ashish Dewangan on 30-09-2024
     * Reason - To show room numbers and room charges
     */
  } = paymentReceiptData;

  const [settingsData, setSettingsData] = useState({});
  const printRef = useRef(); // Reference for the receipt content
  // const [logo, setLogo] = useState("");
  // const [hotelName, setHotelName] = useState("");

  /**
   * Added by - Ashish Dewangan on 03-10-2024
   * Reason - To show amount in words
   */
  const handleDownloadPNG = () => {
    if (!printRef?.current) return;
  
    toPng(printRef.current, { cacheBust: true })
      .then((dataUrl) => {
        download(dataUrl, "payment_receipt.png");
      })
      .catch((err) => {
        console.error("Something went wrong while generating PNG!", err);
      });
  };
  
  const toWords = new ToWords({
    localeCode: "en-IN",
    converterOptions: {
      currency: true,
      ignoreDecimal: false,
      ignoreZeroCurrency: false,
      doNotAddOnly: false,
      currencyOptions: {
        // can be used to override defaults for the selected locale
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
   * End of addition by - Ashish Dewangan on 03-10-2024
   * Reason - To show amount in words
   */

  useEffect(() => {
    window.scrollTo(0, 0);
    getSettingsData();
  }, []);

  const getSettingsData = async () => {
    try {
      const access = localStorage.getItem("access"); // Get the access token from localStorage
      const data = await getSettingsApi(access, tenant); // Fetch settings from API
      setSettingsData(data);
      // setLogo(settingsData.logo); // Set the settings data from the API response
    } catch (error) {
      console.error("Error fetching settings data:", error);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Receipt</title>
          <style>
          // Added by akanksha on 21st Oct, Reason : Set the height and width of reciept of A5 size
            // body { font-family: Arial, sans-serif; }
            @media print{
                @page {
                    size: a5 landscape;
                    margin: 0;
                }
            }
            body { 
              font-family: Arial, sans-serif;  
              width: 100%; 
              height: 100%;
            }
            // .receipt-container { padding: 20px; width: 600px; margin: 0 auto; }
            .receipt-container { 
              width: 148mm;  
              height: 210mm;
              margin: 0 auto; 
            }
          // End by akanksha on 21st Oct, Reason : Set the height and width of reciept of A5 size
            .receipt-header { text-align: center; margin-bottom: 20px; }
            .receipt-header h2 { margin: 0; font-size: 24px; color: #E74C3C; }
            .receipt-header img { height: 50px; margin-top: 10px; }
            .receipt-details, .receipt-footer { margin-top: 20px; }
            .receipt-footer { text-align: center; margin-top: 40px; }
            .amount-box { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; }
            .note { margin-top: 40px; font-size: 12px; color: #888; }
          </style>
        </head>
        <body>
          ${printRef.current.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  

  return (
    <Modal
      /**
       * Added by - Ashish Dewangan on 07-09-2024
       * Reason - To align the title
       */
      styles={{
        header: { borderRadius: 0, textAlign: "center" }, // turns the Modal red
      }}
      /**
       * End of addition by - Ashish Dewangan on 07-09-2024
       * Reason - To align the title
       */
      // title="Payment Receipt"
      title={
        <span
          style={{
            color: "white",
            padding: "0.8%",
            borderRadius: "6%",
            backgroundColor: "#4caf50",
          }}
        >
          Payment Receipt
        </span>
      }
      visible={visible}
      onCancel={onClose}
      onClose={onClose}
      onOk={onClose}
      // className={receiptStyles.modalStyle}
      width={890}
      footer={[
        // Modification and addition by Om Shrivastava on 12-09-2024
        // Reason : Handle the print
        // <Button key="print" onClick={handlePrint}>
        //   Print
        // </Button>,
        // Addition by Om Shrivastava on 19-10-2024
        // Reason : Add Button for pdf download
        <Button
          // type="submit"
          // onClick={() => toPDF()}
          onClick={handleDownloadPNG}
        >
          Download
        </Button>,
        // <ReactToPrint
        //   trigger={() => (
        //     <Button>
        //       Download
        //     </Button>
        //   )}
        //   content={() => componentRef}
        // ></ReactToPrint>,
        // End of addition by Om Shrivastava on 19-10-2024
        // Reason : Add Button for pdf download

        <ReactToPrint
          trigger={() => (
            <Button key="print" type="primary">
              Print
            </Button>
          )}
          content={() => componentRef}
        ></ReactToPrint>,
        // Modification and addition by Om Shrivastava on 12-09-2024
        // Reason : Handle the print
        <Button key="close" type="primary" onClick={onClose}>
          Close
        </Button>,
      ]}
    >
      {/* // Addition by Om Shrivastava on 19-10-2024
    // Reason : Add Button for pdf download  */}
      <div ref={printRef}>
        {/* // Addition by Om Shrivastava on 19-10-2024
        // Reason : Add Button for pdf download  */}
        <div
          // ref={printRef}
          ref={(el) => (componentRef = el)}
          className={receiptStyles.receiptContainer}
          style={{  padding: "3%", marginRight: "3px" }}
        >
          <div className={receiptStyles.receiptHeader}>
            <div className={receiptStyles.logoContainer}>
              <img
                style={{ padding: "1%" }}
                /**
                 * Modified by - Ashish Dewangan on 07-09-2024
                 * Reason - To show logo from settings
                 */
                // src={`${config.baseURL}${logo}`}
                src={`${config.baseURL}${settingsData.logo}`}
                /**
                 * End of modification by - Ashish Dewangan on 07-09-2024
                 * Reason - To show logo from settings
                 */
                alt=""
                className={receiptStyles.logo}
              />
              {/* <h2>{settingsData.hotel_name}</h2> */}
            </div>
            <div className={receiptStyles.addressContainer}>
            {/* Modification and addiition by Om Shrivastava on 28-10-2024
            Reason : Add the label for address field*/}
            <div style={{ fontWeight: "600", display: "inline-flex", flexWrap: "wrap", gap: "3px", maxWidth: "100%", }}>
              {settingsData.hotel_address && settingsData.hotel_address.trim() !== "" && (
                <div style={{display: "flex"}}>
                  <div style={{ whiteSpace: "nowrap" }}>Address : &nbsp;</div>
                  <div style={{ wordBreak: "break-word" }}>{" "}{settingsData.hotel_address}</div>
                </div>
              )}
            </div>


              <div className={`${receiptStyles.emailAddressContainer}`}>
                {/* Modification and addition by Om Shrivastava on 21-09-2024
            Reason : Show the email and contact number with label  */}
                <div style={{ fontWeight: "600" }}>
                  {/* Modified by - Ashish Dewangan on 22-09-2024
              Reason - To show label only if data is present */}
                  {/* Email : {settingsData.email} */}
                  {settingsData.email &&
                    settingsData.email?.trim()?.length > 0 && (
                      // Code changed by - Ashlekh on 04-10-2024
                      // Reason - To display email in single line
                      // <span>Email : {settingsData.email}</span>
                      <div className={`${receiptStyles.email}`}>
                        <div>Email : </div>
                        <div>{settingsData.email}</div>
                      </div>
                      // End of code - Ashlekh on 04-10-2024
                      // Reason - To display email in single line
                    )}
                  {/* End of modification by - Ashish Dewangan on 22-09-2024
              Reason - To show label only if data is present */}

                  {/* Commented by Om Shrivastava on 21-09-2024
              Reason : Data is not showing */}
                  {/* {settingsData.phone_number} */}
                  {/* End of commented by Om Shrivastava on 21-09-2024
              Reason : Data is not showing */}
                </div>
                {","}
                <div style={{ fontWeight: "600", paddingLeft: "1%" }}>
                  {/* Modified by - Ashish Dewangan on 22-09-2024
              Reason - To show label only if data is present */}
                  {/* Phone number : {settingsData.contact_number} */}
                  {settingsData.contact_number &&
                    settingsData.contact_number?.trim()?.length > 0 && (
                      // Code changed by - Ashlekh on 04-10-2024
                      // Reason - To display detail in single line
                      // <span>Phone number : {settingsData.contact_number}</span>
                      <div className={`${receiptStyles.contact}`}>
                        Phone number :<div>{settingsData.contact_number}</div>
                      </div>
                      // End of code - Ashlekh on 04-10-2024
                      // Reason - To display detail in single line
                    )}
                  {/* End of modification by - Ashish Dewangan on 22-09-2024
              Reason - To show label only if data is present */}
                </div>
                {/* End of modification and addition by Om Shrivastava on 21-09-2024
            Reason : Show the email and contact number with label  */}
              </div>
            </div>
          </div>

          <div className={receiptStyles.receiptDetails}>
            <div className={receiptStyles.head}>
              <div className={receiptStyles.receiptNumber}>
                <div>
                  <strong className={receiptStyles.strongTagFont}>
                    Receipt No :{" "}
                  </strong>{" "}
                </div>
                &nbsp;
                <div style={{ textDecoration: "underline" }}>
                  {receipt_number}
                </div>
              </div>
              <div className={receiptStyles.date}>
                <strong className={receiptStyles.strongTagFont}>Date :</strong>{" "}
                &nbsp;
                <div style={{ textDecoration: "underline" }}>
                  {new Date(created_at)
                    .toLocaleDateString("en-GB")
                    .replace(/\//g, "-")}
                </div>
              </div>
            </div>
            <div style={{ textAlign: "left", marginLeft: "0.8%" }}>
              <div style={{ display: "flex", marginTop: "35px" }}>
                <div style={{ fontWeight: "600", marginLeft: "23%" }}>
                  Received from
                </div>
                &nbsp;
                <div style={{ borderBottom: "1px solid", width: "55.5%" }}>
                  {/* Addition by akanksha on 12th Oct 
                  Reason to show salutation with name */}
                  {person_salutation} {person_name}
                  {/* End of Addition by akanksha on 12th Oct 
                   Reason to show salutation with name */}
                </div>
              </div>
              <div style={{ paddingTop: "1%", marginTop: "11px" }}>
                <strong className={receiptStyles.strongTagFont}>
                  Room Number
                </strong>
                &nbsp;
                <span
                  style={{
                    display: "inline-block",
                    width: "40.3%",
                    borderBottom: "1px solid #000",
                    verticalAlign: "middle",
                  }}
                >
                  &nbsp;
                  {/**
                   * Added by - Ashish Dewangan on 30-09-2024
                   * Reason - To show room numbers
                   */}
                  {room_numbers}
                  {/**
                   * End of addition by - Ashish Dewangan on 30-09-2024
                   * Reason - To show room numbers
                   */}
                </span>
                &nbsp;
                <strong className={receiptStyles.strongTagFont}>at rate</strong>
                &nbsp;
                <span
                  style={{
                    display: "inline-block",
                    width: "33.3%",
                    borderBottom: "1px solid #000",
                    verticalAlign: "middle",
                  }}
                >
                  &nbsp;
                  {/**
                   * Added by - Ashish Dewangan on 30-09-2024
                   * Reason - To show room charges
                   */}
                  {/* {room_charges} */}
                  {Math.round(room_charges)}
                  {/**
                   * Added by - Ashish Dewangan on 30-09-2024
                   * Reason - To show room charges
                   */}
                </span>
              </div>

              <div style={{ paddingTop: "1.5%", marginTop: "11px" }}>
                <strong className={receiptStyles.strongTagFont}>
                  The sum of Rupees
                </strong>
                &nbsp;
                <span
                  style={{
                    display: "inline-block",
                    width: "36%",
                    borderBottom: "1px solid #000",
                    verticalAlign: "middle",
                  }}
                >
                  &nbsp;
                  {/**
                   * Modified by - Ashish Dewangan on 03-10-2024
                   * Reason - To show amount in words
                   */}
                  {/* {total_amount} */}
                  {toWords.convert(amount_paid ? Number(amount_paid) : 0)}
                  {/**
                   * End of modification by - Ashish Dewangan on 03-10-2024
                   * Reason - To show amount in words
                   */}
                </span>
                &nbsp;
                <strong className={receiptStyles.strongTagFont}>
                  On Account of
                </strong>{" "}
                <span
                  style={{
                    display: "inline-block",
                    width: "25%",
                    borderBottom: "1px solid #000",
                    verticalAlign: "middle",
                  }}
                >
                  &nbsp;{settingsData.hotel_name}
                </span>
              </div>
            </div>
            <div className={receiptStyles.paymentMethod}>
              {/* <strong>Payment Method:</strong> */}
              {/* Modified by - Ashish Dewangan on 07-09-2024
            Reason - Removed checkbox and displaying only selected payment method */}
              {/* <label>
              <input
                type="checkbox"
                checked={payment_method === "Cash"}
                readOnly
              />{" "}
              Cash
            </label>
            <label>
              <input
                type="checkbox"
                checked={payment_method === "Online"}
                readOnly
              />{" "}
              Online
            </label> */}
              {payment_method == "Cash" ? (
                <label>
                  {/* <input
                type="checkbox"
                checked={payment_method === "Cash"}
                readOnly
              />{" "} */}
                  <b className={receiptStyles.strongTagFont}>Payment Mode :</b>{" "}
                  Cash
                </label>
              ) : (
                <label>
                  {/* <input
                type="checkbox"
                checked={payment_Mode === "Online"}
                readOnly
              />{" "} */}
                  <b className={receiptStyles.strongTagFont}>Payment Mode :</b>{" "}
                  Online
                </label>
              )}
              {/* End of modification by - Ashish Dewangan on 07-09-2024
            Reason - Removed checkbox and displaying only selected payment method */}
            </div>
            <div className={receiptStyles.lower}>
              <div className={receiptStyles.amount} style={{ padding: "1%" }}>
                ₹{/* {amount_paid}/- */}
                {Math.round(amount_paid)}/-
              </div>
              <div className={receiptStyles.signature}>
                <strong className={receiptStyles.strongTagFont}>
                  Authorized Signature _____________________
                </strong>
              </div>
            </div>
          </div>

          <div className={receiptStyles.receiptFooter}>
            <p className={receiptStyles.note}>
              Note: Gambling and Wine Drinking is prohibited in the rooms. GST
              will be charged as applicable.
            </p>
          </div>
        </div>
        {/* // Addition by Om Shrivastava on 19-10-2024
        // Reason : Add Button for pdf download  */}
      </div>
      {/* // Addition by Om Shrivastava on 19-10-2024
        // Reason : Add Button for pdf download  */}
    </Modal>
  );
};

export default PaymentReceiptModal;
