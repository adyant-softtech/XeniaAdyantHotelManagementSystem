// Created by Om Shrivastava on 29-07-2024
// Reason : Create a CheckInList Invoice page 

import React, { useEffect, useRef, useState } from "react";
import checkIninvoiceStyle from "./CheckInListInvoice.module.css";
import { useLocation } from "react-router-dom";
import { getParticularCheckindetailsApi, getSettingsApi } from "../../Api/services";
import config from "../../Api/config";
import ReactToPrint from "react-to-print";

export default function CheckInListInvoice() {
    const location = useLocation();
  const [billingDetails, setBillingDetails] = useState({});
  const [personalDetails, setPersonalDetails] = useState({});
  const [checkinDetails, setCheckinDetails] = useState([]);
  const [extraCharge, setExtraCharge] = useState(0);
  const [discountIn, setDiscountIn] = useState("Discount in (₹)");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [taxableAmount, setTaxableAmount] = useState(0);
  const [gst, setGst] = useState(0);
  const [gstValue, setGstValue] = useState(0);
  const [subTotal, setSubTotal] = useState(0);
  const [totalDays, setTotalDays] = useState(0);
  const [advancePayAmount, setAdvancePayAmount] = useState(0);

  const [miscellaneousCharges, setMiscellaneousCharges] = useState(0);
  const [extraDiscount, setExtraDiscount] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);

  const [latestCheckOutDate, setLatestCheckOutDate] = useState("");
  const [latestCheckOutTime, setLatestCheckOutTime] = useState("");
    
    // const dataReceived = location.state;
  const [settings, setSettings] = useState({});

  let componentRef = useRef();

    // console.log(dataReceived,'check all data')
    // const firstDetail = dataReceived[0];
    
    // console.log(firstDetail,'first detail')

    useEffect(() => {
        const getSettingDetails = async () => {
          try {
            const access = localStorage.getItem("access");
            const response = await getSettingsApi(access);
            setSettings(response);
          } catch (error) {
            console.error("Error fetching Setting Details:", error);
          }
        };
    
        getSettingDetails();
      }, []);
     
      console.log(settings,'jh')

      useEffect(() => {
        const getParticularCheckindetails = async () => {
          try {
            const access = localStorage.getItem("access");
            const response = await getParticularCheckindetailsApi(
              access,
              location?.state?.id
            );
            
            setBillingDetails(response.billing_details);
            setPersonalDetails(response.billing_details.personal_details);
            
            setCheckinDetails(response.checkin_details);
            setExtraCharge(Number(response.billing_details.extra_person_charges));
            
            setDiscountIn(response.billing_details.discount_in);
            setDiscountAmount(Number(response.billing_details.discount_rupees));
           
            setTotalAmount(Number(response.billing_details.total_amount));
            
            setTaxableAmount(Number(response.billing_details.taxable_amount));
           
            setGst(Number(response.billing_details.gst));
           
            setGstValue(Number(response.billing_details.gst_value));
          
            setSubTotal(Number(response.billing_details.grand_total));
            
            setAdvancePayAmount(
              Number(response.billing_details.advanced_pay_amount)
            );
          } catch (error) {
            // console.error("Error fetching Particular Checkin Details:", error);
          }
        };
    
        getParticularCheckindetails();
      }, [location]);

      console.log(billingDetails,'billing')
      console.log(checkinDetails,'checkimn')
      console.log(personalDetails,'personal')

      
  return (
    <div className={checkIninvoiceStyle.pageFrame}>
      <div className={checkIninvoiceStyle.pageContainer} ref={(el) => (componentRef = el)} >
        <div className={checkIninvoiceStyle.header}>
          {/* <div className={checkIninvoiceStyle.invoiceTitle}>INVOICE</div> */}
          <div className={checkIninvoiceStyle.hotelInfo}>
            <h2>{settings.hotel_name}</h2>
            <address>
            {settings.hotel_address}
            </address>
          </div>
          <div className={checkIninvoiceStyle.logoSection}>
            <img
                      src={config.baseURL + settings.logo}
                      alt="Logo"
                      className={checkIninvoiceStyle.logo} 
                    />
            {/* <div className={checkIninvoiceStyle.invoiceDate}>Date: May 25, 2022</div> */}
          </div>
        </div>
        
        <div className={checkIninvoiceStyle.customerDetails}>
          <h2 style={{textAlign:'center'}}>{personalDetails.name || 'N/A'}</h2>
          <div className={checkIninvoiceStyle.invoiceNumber}>
          INVOICE NO - {checkinDetails.invoice_number || 'N/A'}
          </div>
          <div className={checkIninvoiceStyle.invoiceNumber}>
          BILL NO - {checkinDetails.bill_number || 'N/A'}
          </div>
          <div style={{display:'flex',justifyContent:'space-around'}}>
          <ul>
           
            <li>Arrival Date & Time : {checkinDetails[0]?.arrival_date || 'N/A'} , {checkinDetails[0]?.arrival_time || 'N/A'}

             </li>
          </ul>
          <ul>

           <li>Departure Date & Time : {checkinDetails[0]?.departure_date || 'N/A'} , {checkinDetails[0]?.departure_time || 'N/A'}

            </li>
         </ul>
          </div>
        </div>

        <table className={checkIninvoiceStyle.invoiceTable}>
          <thead>
            <tr>
            <th>Sr No.</th>
              <th>Room Number</th>
              <th>Room Type </th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
          {checkinDetails.map((item, index) => (
  item.room_number ? (
    <tr key={index}>
      <td>{index+1}</td>
      <td>{item.room_number.number}</td>
      <td>{item.room_number.room_type}</td>
      <td>{item.room_number.price}</td>
    </tr>
  ) : (
    <tr key={index}>
      <td colSpan="5">No room details available</td>
    </tr>
  )
))}

            <br/>
            {billingDetails.number_of_persons ? 
            <tr>
              <td>Number of Persons </td>
              <td colSpan="4">{billingDetails.number_of_persons || 'N/A'}</td>
            </tr>
            :null}
            {billingDetails.number_of_children ? 

            <tr>
              <td>Number of Childrens </td>
              <td colSpan="4">{billingDetails.number_of_children || 'N/A'}</td>
            </tr>
            :null}

            {billingDetails.number_of_adults ? 

            <tr>
              <td>Number of Adults </td>
              <td colSpan="4">{billingDetails.number_of_adults || 'N/A'}</td>
            </tr>
            :null}

          </tbody>
        </table>
        <div className={checkIninvoiceStyle.totalSection}>
          <div className={checkIninvoiceStyle.totals}>
            <div className={checkIninvoiceStyle.subtotal}>
              <span>Subtotal</span>
              <span>{billingDetails.total_amount || 'N/A'}</span>
            </div>
            <div className={checkIninvoiceStyle.subtotal}>
              <span>Discount in </span>
              <span>{billingDetails.discount_in || 'N/A'}</span>
            </div>
            {billingDetails.discount_rupees!=0 ? 

            <div className={checkIninvoiceStyle.subtotal}>
              <span>Discount in rupee</span>
              <span>{billingDetails.discount_rupees || 'N/A'}</span>
            </div>

            :null}
            {billingDetails.discount_percentage!=0 ? 

            <div className={checkIninvoiceStyle.subtotal}>
              <span>Discount in percentage</span>
              <span>{billingDetails.discount_percentage || 'N/A'}</span>
            </div> 
            :null}

            <div className={checkIninvoiceStyle.subtotal}>
              <span>Taxable amount</span>
              <span>{billingDetails.taxable_amount || 'N/A'}</span>
            </div>
            {billingDetails.gst!=0.00 ? 
            <div className={checkIninvoiceStyle.subtotal}>
              <span>GST (%) </span>
              <span>{billingDetails.gst || 'N/A'}</span>
            </div>
            :null}
            {billingDetails.advanced_pay_amount!=0.00 ? 

            <div className={checkIninvoiceStyle.subtotal}>
              <span>Advance paid </span>
              <span>{billingDetails.advanced_pay_amount || 'N/A'}</span>
            </div>
            :null}
           
            <div className={checkIninvoiceStyle.grandTotal}>
              <span>Grand Total</span>
              <span>{billingDetails.grand_total || 'N/A'}</span>
            </div>
          </div>
        </div>
        <div className={checkIninvoiceStyle.footer}>
          WE HOPE YOU HAD A GREAT STAY!
        </div>

        <div className={checkIninvoiceStyle.buttonContainer}>
              <ReactToPrint
                trigger={() => (
                  <button className={checkIninvoiceStyle.button} type="submit">
                    Print
                  </button>
                )}
                content={() => componentRef}
              ></ReactToPrint>

                        </div>

      </div>
    </div>
  );
}

