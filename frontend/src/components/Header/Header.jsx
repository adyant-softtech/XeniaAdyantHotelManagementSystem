import React, { useEffect, useState, useContext } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
/**Code addition by Tejasve Gupta
Reason - Using Route and Navigate for rendering other pages*/
import { Drawer } from "antd";
import { GiHamburgerMenu } from "react-icons/gi";
import { Route, Navigate } from "react-router-dom";
import headerStyle from "./header.module.css";
import config from "../../Api/config";
/**Code Additio by Tejasve Gupta on 26/06/2024
  Reason - Addition of logo*/
import { IoIosLogOut } from "react-icons/io";
import { MdContactPhone } from "react-icons/md";
import { CgProfile } from "react-icons/cg";

import { getSettingsApi } from "../../Api/services";
// import { IoSettingsOutline } from "react-icons/io5";
/**End of Code Additio by Tejasve Gupta on 26/06/2024
  Reason - Addition of logo*/
/**End of Code addition by Tejasve Gupta
Reason - Using Route and Navigate for rendering other pages*/

/**Code Commented By Tejasve Gupta on 05-06-2024
 * Reason - Unnecessary Import
 */
// import { FiSearch } from "react-icons/fi";
/**End of Code Commented By Tejasve Gupta on 05-06-2024
 * Reason - Unnecessary Import
 */
import { GlobalContext } from "../../context/Context";
// Code Commented by Tejasve Gupta on 05-06-2024
// import { CgProfile } from "react-icons/cg";

/**
 * Created by - Ashish Dewangan on 24-05-2024
 * Reason - To have header component
 * Code Added by Tejasve on 15-05-2024
 * Reason - Importing important libraries
 */

const Header = () => {
  const [logo, setLogo] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { user, setUser, tenant } = useContext(GlobalContext);

  const navigate = useNavigate();

  const toggleDrawer = () => {
    setIsOpen((prevState) => !prevState);
  };
  /**Code Added by Tejasve on 15-05-2024
   * Reason - Clearing of login Details from LocalStorage on Logging out
   */
  // const { user, setUser } = useContext(GlobalContext);
  // const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };
  /**End of Code Added by Tejasve on 15-05-2024
   * Reason - Clearing of login Details from LocalStorage on Logging out
   */

  useEffect(() => {
    window.scrollTo(0, 0);
    getHeaderLogo();
    // console.log(user);
  }, [user]);

  // const getHeaderLogo = async () => { };
  /** Code Addition by Tejasve Gupta on 12-06-2024
   /** Code Addition by Tejasve Gupta on 12-06-2024
   Reason - Creation of protected routes*/

  useEffect(() => {
    window.scrollTo(0, 0);
    // Assuming you might want to fetch logo or perform other actions on mount
    // getHeaderLogo(); // You can call your async function here
  }, []);
  /** End of Code Addition by Tejasve Gupta on 12-06-2024
   /** Code Addition by Tejasve Gupta on 12-06-2024
   Reason - Creation of protected routes*/

  const getHeaderLogo = async () => {
    try {
      const access = localStorage.getItem("access"); // Get the access token from localStorage
      const data = await getSettingsApi(access, tenant); // Fetch settings from API
      console.log("getSettingsApi",data)
      setLogo(data.logo); // Set the logo URL from the API response
    } catch (error) {
      console.error("Error fetching header logo:", error);
    }
  };

  return (
    <div>
      {/**Code Modification by Tejasve Gupta on 15-06-2024
     Reason - Fixed logout function,style Adjusted, Removing Unnecessary Modules as Suggested by Teaster*/}

      {/**Code Modification by Tejasve Gupta on 26/06/2024
	Reason - style fixed as suggested by Tester*/}
      <div className={headerStyle.header}>
        <div className={headerStyle.mainHeaderContainer}>
          {/* <div className={headerStyle.upperHeader}> */}
          {/* <div style={{ marginRight: "5px" }}>{user && user.username ? user.username : "User"}</div>| */}
          {/* {user && user.email ? (
              <NavLink
                onClick={handleLogout}
                to="/login"
                style={{ color: "white", marginLeft: "5px" }}
                className={({ isActive }) =>
                  `${headerStyle.headerItem} ${headerStyle.link} ${headerStyle.headerFont
                  } ${isActive ? headerStyle.active : ""}`
                }
              >
                Logout
              </NavLink>
            ) : (
              <span style={{ color: "white", marginLeft: "5px" }}>Login</span>
            )} */}
          {/* </div> */}
          <div className={headerStyle.headerContent}>
            {/* <div className={headerStyle.sec1sec2}> */}
            <div
              className={headerStyle.section1}
              /**
               * Commented by - Ashish Dewangan on 11-10-2024
               * Reason - To remove white background from logo
               */
              // style={{
              //   backgroundColor: logo
              //     ? "whitesmoke"
              //     : "var(--header-background-color)",
              // }}
              /**
               * End of comment by - Ashish Dewangan on 11-10-2024
               * Reason - To remove white background from logo
               */
            >
              <div className={headerStyle.logo}>
                {logo ? (
                  <Link to="/">
                    <img
                      src={config.baseURL + logo}
                      alt="Logo"
                      /**
                       * Modified by - Ashish Dewangan on 11-10-2024
                       * Reason - To adjust heigh of logo image
                       */
                      // className={headerStyle.logo}
                      className={headerStyle.logoImage}

                      /**
                       * End of modification by - Ashish Dewangan on 11-10-2024
                       * Reason - To adjust heigh of logo image
                       */
                    />
                  </Link>
                ) : (
                  <NavLink
                    to="/"
                    className={`${headerStyle.headerItem} ${headerStyle.link} ${headerStyle.headerFont}`}
                    activeClassName={headerStyle.active}
                  >
                    {/* Code Commented by Tejasve Gupta on 29-07-2024
                      Reason - Style Adjusted as suggested by Tester */}
                    {/* <div className={headerStyle.logo}>
                      Hotel Management System
                    </div> */}
                    {/* End of Code Commented by Tejasve Gupta on 29-07-2024
                      Reason - Style Adjusted as suggested by Tester */}
                  </NavLink>
                )}
                {/* </div> */}
              </div>
            </div>
            <div className={headerStyle.sec2sec3}>
              <div className={headerStyle.section2}>
                {user && user.email && (
                  <>
                    {/* Added by - Ashish Dewangan on 05-10-2024
                     * Reason - Added handover link in header tabs */}
                    
                    <NavLink
                      to="/handovers"
                      className={headerStyle.headerItem} 
                    >
                      {({ isActive }) => (
                        <div className={`${headerStyle.sec2Module} ${isActive ? headerStyle.hoverData : ""}`}>
                          Handover
                        </div>
                      )}
                    </NavLink>
                    {/* End of addition by - Ashish Dewangan on 05-10-2024
                     * Reason - Added handover link in header tabs */}

                    {/* Added by akanksha on 27-03-2025
                    reason : To add balance sheet link in header tabs */}
                    <NavLink
                      to="/balanceSheet"
                      className={headerStyle.headerItem} 
                    >
                      {({ isActive }) => (
                        <div className={`${headerStyle.sec2Module} ${isActive ? headerStyle.hoverData : ""}`}>
                          Day Book
                        </div>
                      )}
                    </NavLink>
                    {/* End by akanksha on 27-03-2025
                    reason : To add balance sheet link in header tabs */}

                    <NavLink
                      to="/"
                      className={headerStyle.headerItem} 
                    >
                      {({ isActive }) => (
                        <div className={`${headerStyle.sec2Module} ${isActive ? headerStyle.hoverData : ""}`}>
                          Dashboard
                        </div>
                      )}
                    </NavLink>
                    <NavLink
                      // Modification and addition by Om Shrivastava on 16-08-2024
                      // Reason : Set the path
                      // to="/"
                      to="/check-in"
                      // End of modification and addition by Om Shrivastava on 16-08-2024
                      // Reason : Set the path
                      className={headerStyle.headerItem} 
                    >
                      {/* Code Commented by Tejasve Gupta on 29-07-2024
                      Reason - Style Adjusted as suggested by Tester */}
                      {/* <img src="checkin_icon.png" alt="Check-in" className={headerStyle.headerIcon} /> */}
                      {/* End of Code Commented by Tejasve Gupta on 29-07-2024
                      Reason - Style Adjusted as suggested by Tester */}
                      {({ isActive }) => (
                        <div className={`${headerStyle.sec2Module} ${isActive ? headerStyle.hoverData : ""}`}>
                          Check-in
                        </div>
                      )}
                    </NavLink>

                    <NavLink
                      to="/checkinList"
                      className={headerStyle.headerItem} 
                    >
                      {/* Code Commented by Tejasve Gupta on 29-07-2024
                      Reason - Style Adjusted as suggested by Tester */}
                      {/* <img src="list-removebg-preview.png" alt="Check-in" className={headerStyle.headerIcon} /> */}
                      {/* End of Code Commented by Tejasve Gupta on 29-07-2024
                      Reason - Style Adjusted as suggested by Tester */}
                      {({ isActive }) => (
                        <div className={`${headerStyle.sec2Module} ${isActive ? headerStyle.hoverData : ""}`}>
                          Check-in List
                        </div>
                      )}
                    </NavLink>
                    {/**Code Addition by Tejasve Gupta on 23-08-2024
                      Reason - Addition of check-out list module */}
                    <NavLink
                      to="/checkout-list"
                      className={headerStyle.headerItem} 
                    >
                      {({ isActive }) => (
                        <div className={`${headerStyle.sec2Module} ${isActive ? headerStyle.hoverData : ""}`}>
                          Check-out List
                        </div>
                      )}
                    </NavLink>
                    {/**Code Addition by Tejasve Gupta on 23-08-2024
                      Reason - Addition of check-out list module */}

                    {/* Code Addition by Tejasve Gupta on 24-07-2024
                    Reason - To add new module Rooms from frontend  */}
                    <NavLink
                      to="/Rooms"
                      className={headerStyle.headerItem}
                    >
                      {/* Code Commented by Tejasve Gupta on 29-07-2024
                      Reason - Style Adjusted as suggested by Tester */}
                      {/* <img src="Add Rooms icon.png" alt="Check-in" className={headerStyle.roomHeaderIcon} /> */}
                      {/* End of Code Commented by Tejasve Gupta on 29-07-2024
                      Reason - Style Adjusted as suggested by Tester */}
                      {({ isActive }) => (
                        <div className={`${headerStyle.sec2Module} ${isActive ? headerStyle.hoverData : ""}`}>
                        Add Room
                      </div>
                    )}
                    </NavLink>
                    {/* End of Code Addition by Tejasve Gupta on 24-07-2024
                    Reason - To add new module Rooms from frontend  */}
                    {/**Code Addition by Tejasve Gupta on 20-06-2024
              Reason - Addition of Expense Module in Header*/}

                    <NavLink
                      to="/expenseForm"
                      className={headerStyle.headerItem}
                    >
                      {/* Code Commented by Tejasve Gupta on 29-07-2024
                      Reason - Style Adjusted as suggested by Tester */}
                      {/* <img src="expenses new.png" alt="Check-in" className={headerStyle.headerIcon} /> */}
                      {/* End of Code Commented by Tejasve Gupta on 29-07-2024
                      Reason - Style Adjusted as suggested by Tester */}
                      {({ isActive }) => (
                        <div className={`${headerStyle.sec2Module} ${isActive ? headerStyle.hoverData : ""}`}>
                          Expense
                        </div>
                      )}
                    </NavLink>

                    <NavLink
                      to="/settings"
                      className={headerStyle.headerItem}
                    >
                      {/* <IoSettingsOutline /> */}
                      {/* Code Commented by Tejasve Gupta on 29-07-2024
                      Reason - Style Adjusted as suggested by Tester */}
                      {/* <img src="settings icon.png" alt="Check-in" className={headerStyle.headerIcon} /> */}
                      {/* End of Code Commented by Tejasve Gupta on 29-07-2024
                      Reason - Style Adjusted as suggested by Tester */}
                      {({ isActive }) => (
                        <div className={`${headerStyle.sec2Module} ${isActive ? headerStyle.hoverData : ""}`}>
                          Settings
                        </div>
                      )}
                    </NavLink>
                    {/**End of Code Addition by Tejasve Gupta on 20-06-2024
              Reason - Addition of Expense Module in Header*/}
                    {/* Added by akanksha on 23rd Oct,
                    Reason : to add customer detail  */}
                    <NavLink
                      to="/customer-details"
                      className={headerStyle.headerItem}
                    >
                      {({ isActive }) => (
                        <div className={`${headerStyle.sec2Module} ${isActive ? headerStyle.hoverData : ""}`}>
                          Customer Details
                        </div>
                      )}
                    </NavLink>
                    {/* <NavLink
                      to="/amenity"
                      className={headerStyle.headerItem}
                    >
                      {({ isActive }) => (
                        <div className={`${headerStyle.sec2Module} ${isActive ? headerStyle.hoverData : ""}`}>
                          Amenity
                        </div>
                      )}
                    </NavLink> */}
                    {/* Added by akanksha on 23rd Oct,
                    Reason : to add customer detail  */}
                  </>
                )}
              </div>
              <div className={headerStyle.section3}>
                {/* {user && user.email && (
                  <NavLink
                    to="/user-profile"
                    className={({ isActive }) =>
                      `${headerStyle.headerItem} ${headerStyle.link} ${headerStyle.headerFont
                      } ${isActive ? headerStyle.active : ""}`
                    }
                  >
                    <CgProfile />
                  </NavLink>
                )} */}
                {/* <NavLink
                to="/contact"
                className={({ isActive }) =>
                  `${headerStyle.headerItem} ${headerStyle.link} ${headerStyle.headerFont
                  } ${isActive ? headerStyle.active : ""}`
                }
              >
                <MdContactPhone />
              </NavLink> */}

                {user && user.email ? (
                  /**
                   * Modified by - Ashish Dewangan on 13-10-2024
                   * Reason - To show a dropdown where user info will be displayed
                   */

                  // <NavLink
                  //       onClick={handleLogout}
                  //       to="/login"
                  //       className={({ isActive }) =>
                  //         `${headerStyle.headerItem} ${headerStyle.link} ${
                  //           headerStyle.headerFont
                  //         } ${isActive ? headerStyle.active : ""}`
                  //       }
                  //     >

                  //       <div className={headerStyle.sec2Module}>Logout</div>

                  //     </NavLink>

                  <div
                    className={`${headerStyle.sec2Module} ${headerStyle.profileIcon} ${headerStyle.headerItem}  ${headerStyle.headerFont}`}
                  >
                    <div
                      style={{paddingTop: "35%" }}
                    >
                      <CgProfile className={headerStyle.logoutIcon} />
                    </div>
                    <div className={headerStyle.profileContainer}>
                    {/* Modification and addition by Om Shrivastava on 15-10-2024
                    Reason : Set the login name  */}

                      {/* <div>{user?.first_name ? user.first_name : "Admin"}</div>
                      <div>{user?.email}</div> */}

                    {/* Modification by Akanksha on 24th Oct 2024,
                    Reason to add label for user detail */}
                      {/* <div>
                        <label>Name: </label>
                        <span>{user?.first_name ? user.first_name : "Admin"}</span>
                      </div>
                      <div>
                        <label>Email ID: </label>
                        <span>{user?.email}</span>
                      </div> */}
                      <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                        <strong>Name:</strong> <span>{user?.first_name ? user.first_name : "Admin"}</span>
                      </div>
                      <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                        <strong>Email ID:</strong> <span style={{ wordBreak: "break-word" }}>{user?.email}</span>
                      </div>

                    {/* End of Modification by Akanksha on 24th Oct 2024,
                    Reason to add label for user detail */}

                      <div
                        style={{ display: "flex", justifyContent: "center" }}
                      >
                        <NavLink
                          onClick={handleLogout}
                          to="/login"
                          // style={{ color: "white", marginLeft: "5px" }}
                          className={`${headerStyle.headerItem} ${headerStyle.link}}`}
                        >
                          Logout
                        </NavLink>
                      </div>
                      {/* End of modification and addition by Om Shrivastava on 15-10-2024
                    Reason : Set the login name  */}
                    </div>
                  </div>
                ) : (
                  /**
                   * End of modification by - Ashish Dewangan on 13-10-2024
                   * Reason - To show a dropdown where user info will be displayed
                   */

                  <div
                    style={{
                      color: "white",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {/* Login */}
                  </div>
                )}
              </div>
            </div>
            <GiHamburgerMenu
              onClick={toggleDrawer}
              className={headerStyle.button}
            />
          </div>
          {/* <div className={headerStyle.section4}>
            {user && user.email && (
              <NavLink
                to="/user-profile"
                className={({ isActive }) =>
                  `${headerStyle.headerItem} ${headerStyle.link} ${headerStyle.headerFont
                  } ${isActive ? headerStyle.active : ""}`
                }
              >
                <CgProfile />
              </NavLink>
            )}
          </div> */}

          {/**End of Code Modification by Tejasve Gupta on 26/06/2024
	Reason - style fixed as suggested by Tester*/}
        </div>
      </div>

      <Drawer
        open={isOpen}
        onClose={toggleDrawer}
        placement="right"
        className={headerStyle.hamburgerDrawer}
      >
        <ul className={headerStyle.drawerMenu}>
          <li className={headerStyle.li}>
            <Link onClick={toggleDrawer} to="/" className={headerStyle.link}>
              Check-in
            </Link>
          </li>
          <hr className={headerStyle.horizontalLine} />
          {/* <li className={headerStyle.li}>
            <Link
              onClick={toggleDrawer}
              to="/login"
              className={headerStyle.link}
            >
              login
            </Link>
          </li>
          <hr className={headerStyle.horizontalLine} /> */}
          {user && user.email && (
            <>
              <li className={headerStyle.li}>
                <Link
                  onClick={toggleDrawer}
                  to="/checkinList"
                  className={headerStyle.link}
                >
                  Check-in List
                </Link>
              </li>
              <hr className={headerStyle.horizontalLine} />
              <li className={headerStyle.li}>
                <Link
                  onClick={toggleDrawer}
                  to="/rooms"
                  className={headerStyle.link}
                >
                  Add Room
                </Link>
              </li>
              <hr className={headerStyle.horizontalLine} />
              <li className={headerStyle.li}>
                <Link
                  onClick={toggleDrawer}
                  to="/settings"
                  className={headerStyle.link}
                >
                  Settings
                </Link>
              </li>
              <hr className={headerStyle.horizontalLine} />
              {/**Code Addition by Tejasve Gupta on 20-06-2024
              Reason - Addition of Expense Module in Header*/}

              <li className={headerStyle.li}>
                <Link
                  onClick={toggleDrawer}
                  to="/expenseForm"
                  className={headerStyle.link}
                >
                  Expense
                </Link>
              </li>
              {/**End of Code Addition by Tejasve Gupta on 20-06-2024
              Reason - Addition of Expense Module in Header*/}
              <hr className={headerStyle.horizontalLine} />
              <li className={headerStyle.li}>
                <Link
                  onClick={handleLogout}
                  to="/login"
                  className={headerStyle.link}
                >
                  Logout
                </Link>
              </li>
              <hr className={headerStyle.horizontalLine} />
            </>
          )}
          {/**End of Code Modification by Tejasve Gupta on 15-06-2024
     Reason - Fixed logout function,style Adjusted, Removing Unnecessary Modules as Suggested by Teaster*/}
        </ul>
      </Drawer>
    </div>
  );
};

export default Header;
