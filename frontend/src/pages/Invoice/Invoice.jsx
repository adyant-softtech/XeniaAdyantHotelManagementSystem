// Created by Om Shrivastava on 27-07-2024
// Reason : Create a  Invoice page 

import React, { useEffect, useRef, useState } from "react";
import invoiceStyle from "./Invoice.module.css";
import { useLocation } from "react-router-dom";
import { getSettingsApi } from "../../Api/services";
import config from "../../Api/config";
import ReactToPrint from "react-to-print";

export default function Invoice() {

  const location = useLocation();
  const dataReceived = location.state;
  const [settings, setSettings] = useState({});

  let componentRef = useRef();

  console.log(dataReceived, 'check all data')
  const firstDetail = dataReceived[0];
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

  console.log(settings, 'jh')

  return (
    <div className={invoiceStyle.pageFrame}>
      <div className={invoiceStyle.pageContainer} ref={(el) => (componentRef = el)} >
        <div className={invoiceStyle.header}>
          {/* <div className={invoiceStyle.invoiceTitle}>INVOICE</div> */}
          <div className={invoiceStyle.hotelInfo}>
            <h2>{settings.hotel_name}</h2>
            <address>
              {settings.hotel_address}
            </address>
          </div>
          <div className={invoiceStyle.logoSection}>
            <img
              src={config.baseURL + settings.logo}
              alt="Logo"
              className={invoiceStyle.logo}
            />
            {/* <div className={invoiceStyle.invoiceDate}>Date: May 25, 2022</div> */}
          </div>
        </div>
        <div className={invoiceStyle.customerDetails}>
          <h2 style={{ textAlign: 'center' }}>{firstDetail.billing_detail.personal_details.name || 'N/A'}</h2>
          <div className={invoiceStyle.invoiceNumber}>
            INVOICE NO - {firstDetail.billing_detail.invoice_number || 'N/A'}
          </div>
          <div className={invoiceStyle.invoiceNumber}>
            BILL NO - {firstDetail.billing_detail.bill_number || 'N/A'}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <ul>

              <li>Arrival Date & Time : {firstDetail.checkin_detail.arrival_date || 'N/A'} , {firstDetail.checkin_detail.arrival_time || 'N/A'}

              </li>
            </ul>
            <ul>

              <li>Departure Date & Time : {firstDetail.checkin_detail.departure_date || 'N/A'} , {firstDetail.checkin_detail.departure_time || 'N/A'}

              </li>
            </ul>
          </div>
        </div>
        <table className={invoiceStyle.invoiceTable}>
          <thead>
            <tr>
              <th>S.NO.</th>
              <th>Room Number</th>
              <th>Room Type </th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {dataReceived.map((item, index) => (
              item.room_detail ? (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.room_detail.number}</td>
                  <td>{item.room_detail.room_type}</td>
                  <td>{item.room_detail.price}</td>
                </tr>
              ) : (
                <tr key={index}>
                  <td colSpan="5">No room details available</td>
                </tr>
              )
            ))}

            <br />
            <tr>
              <td>Number of Persons </td>
              <td colSpan="4">{firstDetail.billing_detail.number_of_persons || 'N/A'}</td>
            </tr>
            <tr>
              <td>Number of Childrens </td>
              <td colSpan="4">{firstDetail.billing_detail.number_of_children || 'N/A'}</td>
            </tr>
            <tr>
              <td>Number of Adults </td>
              <td colSpan="4">{firstDetail.billing_detail.number_of_adults || 'N/A'}</td>
            </tr>
          </tbody>
        </table>


        <div className={invoiceStyle.totalSection}>
          <div className={invoiceStyle.totals}>
            <div className={invoiceStyle.subtotal}>
              <span>Subtotal</span>
              <span>{firstDetail.billing_detail.total_amount || 'N/A'}</span>
            </div>
            {/* Code Commented by Tejasve Gupta on 01-08-2024
            Reason - As suggested by Tester */}
            {/* <div className={invoiceStyle.subtotal}>
              <span>Discount in </span>
              <span>{firstDetail.billing_detail.discount_in || 'N/A'}</span>
            </div> */}
            {/* End of Code Commented by Tejasve Gupta on 01-08-2024
            Reason - As suggested by Tester */} 
            {firstDetail.billing_detail.discount_rupees != 0 ?

              <div className={invoiceStyle.subtotal}>
                <span>Discount in rupee</span>
                <span>{firstDetail.billing_detail.discount_rupees || 'N/A'}</span>
              </div>

              : null}
            {firstDetail.billing_detail.discount_percentage != 0 ?

              <div className={invoiceStyle.subtotal}>
                <span>Discount in percentage</span>
                <span>{firstDetail.billing_detail.discount_percentage || 'N/A'}</span>
              </div>
              : null}

            <div className={invoiceStyle.subtotal}>
              <span>Taxable amount</span>
              <span>{firstDetail.billing_detail.taxable_amount || 'N/A'}</span>
            </div>
            <div className={invoiceStyle.subtotal}>
              <span>Total amount</span>
              <span>{firstDetail.billing_detail.total_amount || 'N/A'}</span>
            </div>
            {firstDetail.billing_detail.gst != 0.00 ?
              <div className={invoiceStyle.subtotal}>
                <span>GST (%) </span>
                <span>{firstDetail.billing_detail.gst || 'N/A'}</span>
              </div>
              : null}
            {firstDetail.billing_detail.advanced_pay_amount != 0.00 ?

              <div className={invoiceStyle.subtotal}>
                <span>Advance paid </span>
                <span>{firstDetail.billing_detail.advanced_pay_amount || 'N/A'}</span>
              </div>
              : null}

            <div className={invoiceStyle.grandTotal}>
              <span>Grand Total</span>
              <span>{firstDetail.billing_detail.grand_total || 'N/A'}</span>
            </div>
          </div>
        </div>
        <div className={invoiceStyle.footer}>
          WE HOPE YOU HAD A GREAT STAY!
        </div>

        <div className={invoiceStyle.buttonContainer}>
          <ReactToPrint
            trigger={() => (
              <button className={invoiceStyle.button} type="submit">
                Print
              </button>
            )}
            content={() => componentRef}
          ></ReactToPrint>

          {/* <button
                className={`${invoiceStyle.button} ${invoiceStyle.downloadButton}`}
                type="submit"
                onClick={() => toPDF()}
              >
                Download
              </button> */}
        </div>

      </div>
    </div>
  );
}

