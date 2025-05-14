/**
 * Created by - Ashish Dewangan on 23-05-2024
 * Reason - Created home page
 */
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import homeStyle from "./Home.module.css";

// import { useLocation } from "react-router-dom";
import { GlobalContext } from "../../context/Context";
// import { PiHandsPrayingBold } from "react-icons/pi";
import CheckIn from "../CheckIn/CheckIn";

const Home = (props) => {
  const { user } = useContext(GlobalContext);
  return (
    <div className={`${homeStyle.pageFrame}`}>
      {/* <div className={`${homeStyle.coloredBackground}`}> */}
      <div className={`${homeStyle.pageContainer}`}>
        <div>
          {/* Code Commented by Tejasve Gupta on 05-06-2024 */}
          {/* <CheckIn /> */}
          {/* End of Code Commented by Tejasve Gupta on 05-06-2024 */}
        </div>
        {/* </div> */}
      </div>
    </div>
  );
};

export default Home;
