// import React, { useContext } from "react";
// import { Route, Navigate } from "react-router-dom";
// import { GlobalContext } from "../context/Context";

// const ProtectedRoutes = ({ path, element }) => {
//   const { user } = useContext(GlobalContext);

//   const isAuthenticated = user && user.email;

//   return isAuthenticated ? (
//     <Route path={path} element={element} />
//   ) : (
//     <Navigate to="/login" replace />
//   );
// };

// export default ProtectedRoutes;


import { Outlet, Navigate } from "react-router-dom";
/**Code addition by Tejasve Gupta on 06-07-2024
	Reason - Fixing the issue of flickering Screen to login*/
import React, { useContext, useEffect, useState } from 'react';
import { GlobalContext } from "../context/Context";

const ProtectedRoutes = () => {
  const { user } = useContext(GlobalContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Assuming there is some logic to check user authentication status
    // For example, fetching user details from an API or local storage
    const checkAuthStatus = async () => {
      // Simulate an async operation
      await new Promise(resolve => setTimeout(resolve, 1000)); // Replace with actual auth check
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>; // Or any loading spinner you prefer
  }

  return user && user.email ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace />
  );
};

export default ProtectedRoutes;
/**End of Code addition by Tejasve Gupta on 06-07-2024
	Reason - Fixing the issue of flickering Screen to login*/


 