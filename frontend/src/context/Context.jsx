/**
 * Created by - Ashish on 22-05-2024
 * Reason - for storing global states
 */

/**
 Code Modificationn by Tejasve Gupta on 28-06-2024
 reason - creation of context for room details*/
import React, { createContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { refresh, userDetails, getCheckinDetails } from "../Api/services";

/**Code Addition by Tejasve Gupta on 04-07-2024
Reason -  Sepration of Room Component from Checkin to Context*/
import { useMemo } from "react";

export const GlobalContext = createContext();

const Context = ({ children }) => {
  const location = useLocation();
  const [tenant, setTenant] = useState(null);

  const [user, setUser] = useState({});
  const [roomData, setRoomData] = useState([]);
  const [availableRoomList, setAvailableRoomList] = useState([]);
  const [reservedRoomList, setReservedRoomList] = useState([]);
  const [vacantRoomList, setVacantRoomList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Addition by Om Shrivastava on 15-08-2024
  // Reason : Set the usestate data for getting the all room details
  const [allRoomBookingDetails, setAllRoomBookingDetails] = useState([]);
  // Addition by Om Shrivastava on 15-08-2024
  // Reason : Set the usestate data for getting the all room details
  // Added by - Ashlekh on 03-10-2024
  // Reason - To have useState variable to set Staff name and admin name
  const [staffName, setStaffName] = useState("");
  const [adminName, setAdminName] = useState("");
  // End of code - Ashlekh on 03-10-2024
  // Reason - To have useState variable to set staff name and admin name

  useEffect(() => {
    setTenant(window.location.hostname.split(".")[0]);
  }, []);

  

  useEffect(() => {
    const previousPath = sessionStorage.getItem("path");
    sessionStorage.setItem("path", location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    const access = localStorage.getItem("access");
    if (access && tenant) {
      getUserDetails(access);
      getRoomDetails(access);
    } 
    // else {
    //   localStorage.clear();
    // }
    // Code Modification By Tejasve Gupta on 19-07-2024
    // Reason - Fixed Bug
  }, [location,tenant]);
  // End of Code Modification By Tejasve Gupta on 19-07-2024
  // Reason - Fixed Bug

  // useEffect(() => {
  //   const access = localStorage.getItem('access');
  //   if (access) {
  //     getUserDetails(access);
  //     getRoomDetails(access);
  //   } else {
  //     localStorage.clear();
  //   }
  // }, [location]);

  // useEffect(()=>{
  //   console.log("settung====================================",user)
  // },[user])

  console.log(".............", tenant);


  const getUserDetails = async (access) => {
    try {
      const response = await userDetails(access, tenant);
      if (response.user) {
        setUser(response.user);
        setStaffName(response?.user?.first_name);
        setAdminName(response?.user?.username);
      } else {
        const refreshResponse = await refresh(tenant);
        if (refreshResponse.refresh && refreshResponse?.refresh) {
          // localStorage.setItem("access", refreshResponse.access);
          localStorage.setItem("access", refreshResponse.access);
          localStorage.setItem("refresh", refreshResponse.refresh);
          getUserDetails(refreshResponse.access);
        } else {
          localStorage.clear(); 
       
          setError("Failed to refresh token");
        }
      }
    } catch (err) {
      console.error("Error fetching user details:", err);
      setError("Error fetching user details");
    }
  };

  
  const getRoomDetails = async (access) => {
    try {
      setLoading(true);
      const response = await getCheckinDetails(access, {}, tenant);
      setRoomData(response.room_list || []);
      // console.log("Status from Context response.available_rooms",response.available_rooms)
      // console.log("Status from Context response.reserved_rooms",response.reserved_rooms)
      // console.log("Status from Context response.vacant_rooms",response.vacant_rooms)

      setAvailableRoomList(response.available_rooms || []);
      setReservedRoomList(response.reserved_rooms || []);
      setVacantRoomList(response.vacant_rooms || []);
      // Addition by Om Shrivastava on 15-08-2024
      // Reason : Set the usestate data for getting the all room details
      setAllRoomBookingDetails(response.all_room_booking_details || []);
      // Addition by Om Shrivastava on 15-08-2024
      // Reason : Set the usestate data for getting the all room details
    } catch (err) {
      console.error("Error fetching check-in details:", err);
      setError("Error fetching check-in details");
    } finally {
      setLoading(false);
    }
  };

  // const contextValue = useMemo(() => ({
  //   user,
  //   setUser,
  //   roomData,
  //   availableRoomList,
  //   reservedRoomList,
  //   vacantRoomList,
  //   loading,
  //   error,
  // }), [user, roomData, availableRoomList, reservedRoomList, vacantRoomList, loading, error]);

  return (
    <GlobalContext.Provider
      value={{
        tenant,
        setTenant,
        user,
        setUser,
        roomData,
        setRoomData,
        availableRoomList,
        reservedRoomList,
        vacantRoomList,
        loading,
        error,
        // Addition by Om Shrivastava on 15-08-2024
        // Reason : Set the usestate data for getting the all room details
        allRoomBookingDetails,
        setAllRoomBookingDetails,
        // End of adition by Om Shrivastava on 15-08-2024
        // Reason : Set the usestate data for getting the all room details
        // Added by - Ashlekh on 03-10-2024
        // Reason - To make staff name variable to other components and admin name
        staffName,
        setStaffName,
        adminName,
        setAdminName,
        // End of code - Ashlekh on 03-10-2024
        // Reason - To make staff name variable to other components and admin name
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
/**End of Code Addition by Tejasve Gupta on 04-07-2024
Reason -  Sepration of Room Component from Checkin to Context*/
export default Context;

/**
 End of Code Modificationn by Tejasve Gupta on 28-06-2024
 reason - creation of context for room details*/
