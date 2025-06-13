import React, { createContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { refresh, userDetails, getCheckinDetails, getRoomTypes } from "../Api/services";
import { useMemo } from "react";

export const GlobalContext = createContext();

const Context = ({ children }) => {
  const location = useLocation();
  const [tenant, setTenant] = useState(null);

  const [filteredRooms, setFilteredRooms] = useState([]);
  const [checkedRooms, setCheckedRooms] = useState({});

  const [user, setUser] = useState({});
  const [roomData, setRoomData] = useState([]);
  const [availableRoomList, setAvailableRoomList] = useState([]);
  const [reservedRoomList, setReservedRoomList] = useState([]);
  const [vacantRoomList, setVacantRoomList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allRoomBookingDetails, setAllRoomBookingDetails] = useState([]);
  const [staffName, setStaffName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setTenant(window.location.hostname.split(".")[0]);
  }, []);

  // useEffect(() => {
  //   const fetchRoomTypes = async () => {
  //     const access = localStorage.getItem("access");
  //     try {
  //       if (!tenant || tenant === "null") {
  //         console.error("Tenant value is missing or null");
  //         return;
  //       }
  //       const data = await getRoomTypes(access, tenant);
  //       console.log("context ")
  //       setRoomData(data.room_list);
  //     } catch (error) {
  //       console.error("Error fetching room types:", error);
  //     }
  //   };

  //   if (tenant && tenant !== "null") {
  //     fetchRoomTypes();
  //   }
  // }, [tenant]);

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
  }, [location,tenant]);
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
    // setFilteredRooms(response.room_list || []);
      setAvailableRoomList(response.available_rooms || []);
      setReservedRoomList(response.reserved_rooms || []);
      setVacantRoomList(response.vacant_rooms || []);
      setAllRoomBookingDetails(response.all_room_booking_details || []);
    } catch (err) {
      console.error("Error fetching check-in details:", err);
      setError("Error fetching check-in details");
    } finally {
      setLoading(false);
    }
  };

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
        allRoomBookingDetails,
        setAllRoomBookingDetails,
        staffName,
        setStaffName,
        adminName,
        setAdminName,
        search,
        setSearch,
        filteredRooms,
        setFilteredRooms,
        checkedRooms,
        setCheckedRooms,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
export default Context;
