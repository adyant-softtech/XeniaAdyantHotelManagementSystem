/**
 * Created by - Ashish Dewangan on 24-05-2024
 * Reason - To have footer section
 */

import React, { useEffect, useState, useContext } from "react";
import footerStyle from "./footer.module.css";
import { getSettingsApi } from "../../Api/services";
import { FloatingWhatsApp } from "react-floating-whatsapp";
import config from "../../Api/config";
import { GlobalContext } from "../../context/Context";

const Footer = () => {
  const [hotelName, setHotelName] = useState("");
  
  // const { tenant } = useContext(GlobalContext);
  // Added by - Akanksha
  const [logo, setLogo] = useState("");
  // End of code - Akanksha
  {
    /* Addition by Om Shriavstava on 03-11-2025
    Reason : Show the whatsapp chatbot feature  */
  }
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const getSettingDetails = async () => {
    try {
      const access = localStorage.getItem("access");
      if (!access) {
        throw new Error("Access token is missing");
      }
      const data = await getSettingsApi(access);
      setWhatsappNumber(data?.whatsapp_number);
      // Added by - Akanksha
      setLogo(data?.logo);
      // End of code - Akanksha
      console.error("Whatsapp number is missing in the response");
    } catch (error) {
      console.error("Error fetching GST:", error);
    }
  };

  useEffect(() => {
    getSettingDetails();
  }, []);
  {
    /* Addition by Om Shriavstava on 03-11-2025
    Reason : Show the whatsapp chatbot feature  */
  }

  useEffect(() => {
    getHotelName();
  }, []);

  const getHotelName = async () => {
    try {
      const access = localStorage.getItem("access");
      const data = await getSettingsApi(access);
      // console.log("..................>>>>>", data)
      setHotelName(data.hotel_name);
    } catch (error) {
      console.error("Error fetching Hotel Name:", error);
    }
  };

  return (
    /**Code modification by Tejasve Gupta on 13-06-2024
  Reason - style fixed
  */
    <div className={`${footerStyle.footerContainer}`}>
      {/** Code Addition by Tejasve Gupta on 14-06-2024
     Reason - Copyright Claim added    */}
      <div className={footerStyle.copyRight}>Copyright © 2024 </div>
      <span>&nbsp;</span>
      {/** End of Code Addition by Tejasve Gupta on 14-06-2024
     Reason - Copyright Claim added    */}
      <div className={footerStyle.hotelName}>
        {hotelName}
        <span>&nbsp;Designed and Maintained by&nbsp;</span>
      </div>
      <div className={footerStyle.poweredText}>
        <a
          className={footerStyle.poweredText}
          href="https://adyant.co.in/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Adyant SoftTech
        </a>
      </div>
      {/**Code modification by Tejasve Gupta on 13-06-2024
      Reason - style fixed
      */}
      {/* Addition by Om Shriavstava on 03-11-2025
    Reason : Show the whatsapp chatbot feature  */}
      {whatsappNumber != null && whatsappNumber?.length > 0 ? (
        <div className={`${footerStyle.whatsAppIcon}`} draggable={true}>
          <FloatingWhatsApp
            
            buttonStyle={{ width: 40, height: 40, bottom: "8%", left: 20}}
            phoneNumber={whatsappNumber}
            // avatar={config.baseURL + logo}
            avatar={config.baseURL + logo}
            accountName="Hotel Satkar"
          />
        </div>
      ) : null}
      {/* End of addition by Om Shriavstava on 03-11-2025
    Reason : Show the whatsapp chatbot feature  */}
    </div>
  );
};
export default Footer;
