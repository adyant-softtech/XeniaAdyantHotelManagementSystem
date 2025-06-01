/**
 * Created by - Ashish Dewangan on 22-05-2024
 * Reason - To specify API calling methods
 */
import notificationObject from "../components/Widgets/Notification/Notification";
import API, { APIWithoutV1 }  from "./api";
/**Code Commented by Tejasve on 26-05-2024
 * Reason - Code Not in use imported for trying purpose only
 */
// import {baseURL} from "./config";
/**End of Code Commented by Tejasve on 26-05-2024
 * Reason - Code Not in use imported for trying purpose only
 */

/**
 * Added by - Ashish Dewangan on 22-05-2024
 * Reason - To post login details
 */
export const login = async (userDetails, tenant ) => {
  const response = await API.post(`${tenant}/login/`, userDetails, {
    headers: {
      "Content-Type": "application/json",
    },
  }).catch((err) => console.log(err));
  if (response.response) {
    if (response.response.status == 404) { 
      // Commented by Om Shrivastava on 08-10-2024
      // Reason : No need to show popup message  
      // notificationObject.error(response.response.data);
      // Commented by Om Shrivastava on 08-10-2024
      // Reason : No need to show popup message  
      console.log(response.response.data);
    }
    if (response.response.status == 401) {
      // Commented by Om Shrivastava on 08-10-2024
      // Reason : No need to show popup message  
      // notificationObject.error(response.response.data);
      // Commented by Om Shrivastava on 08-10-2024
      // Reason : No need to show popup message  
      console.log(response.response.data);
    }
    return {};
  } else {
    if (response.status == 200) {
      return response ? response.data : {};
    }
  }
};
/**
 * End of code addition by - Ashish Dewangan on 22-05-2024
 * Reason - To post login details
 */

/**
 * Added by - Ashish Dewangan on 22-05-2024
 * Reason - To get user details
 */
export const userDetails = async (access, tenant) => {
  const response = await API.get(`${tenant}/user/`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access}`,
    },
  }).catch((err) => console.log(err));
  if (response.response) {
    if (response.response.status == 401) {
      console.log(response.response.data);
    }
    return {};
  } else {
    if (response.status == 200) {
      return response ? response.data : {};
    }
  }
};
/**
 * End of code addition by - Ashish Dewangan on 22-05-2024
 * Reason - To get user details
 */

/**
 * Added by - Ashish Dewangan on 22-05-2024
 * Reason - To get new access token using refresh token
 */

export const refresh = async (tenant) => {
  const data = {
    refresh_token: localStorage.getItem("refresh"),
  };
  const response = await API.post(`${tenant}/refresh/`, data, {
    headers: {
      "Content-Type": "application/json",
    },
  }).catch((err) => console.log(err));
  if (response.response) {
    if (response.response.status != 200) {
      console.log(response.response.data);
      localStorage.clear();
    }
    return {};
  } else {
    if (response.status == 200) {
      return response ? response.data : {};
    }
  }
};
/**
 * End of code addition by - Ashish Dewangan on 22-05-2024
 * Reason - To get new access token using refresh token
 */

/**
 * Added by - Ashish Dewangan on 23-05-2024
 * Reason - To post login details
 */
export const signup = async (userDetails, tenant) => {
  const response = await API.post(`${tenant}/signup/`, userDetails, {
    headers: {
      "Content-Type": "application/json",
    },
  }).catch((err) => console.log(err));
  if (response.response) {
    if (response.response.status == 500) {
      /* Code Addition by Tejasve Gupta on 12-06-2024
  Reason - HAndling Response*/
      if (response.response.data.error) {
        notificationObject.error(response.response.data.error);
        return response.response.data;
      } else {
        notificationObject.error(response.response.data);
        return {};
      }
    }

    /* End of Code Addition by Tejasve Gupta on 12-06-2024
  Reason - HAndling Response*/
  } else {
    if (response.status == 200) {
      return response ? response.data : {};
    }
  }
};
/**
 * End of code addition by - Ashish Dewangan on 23-05-2024
 * Reason - To post login details
 */

/**Code Added By Tejasve Gupta on 26-05-2024
 * Reason - Functionality of forgot Password
 */
export const sendOtpApi = async (value) => {
  const response = await API.post(
    `/send-otp/`,
    { postFor: "email", data: value },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  ).catch((err) => console.log(err));
  return response ? response.data : {};
};

export const verifyOtpApi = async (value) => {
  try {
    const response = await API.post("/verify-otp/", {
      postFor: "otp",
      data: value,
    });
    return response.data;
  } catch (error) {
    return { error: error.message };
  }
};

export const updatePasswordApi = async (value) => {
  const response = await API.put(`/update-password/`, value, {
    headers: {
      "Content-Type": "application/json",
    },
  }).catch((err) => console.log(err));
  return response ? response.data : {};
};
/**End of Code Added By Tejasve Gupta on 26-05-2024
 * Reason - Functionality of forgot Password
 */

/**Code Added By Tejasve Gupta on 30-05-2024
 * Reason - Getting Checkin Details
 */
export const getCheckinDetails = async (access, value, tenant) => {
  try {
    const response = await API.get(`${tenant}/get_checkin_details/`, {
      params: value, // Pass value as query parameters
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching check-in details:", error);
    throw error;
  }
};
/**Code Added By Tejasve Gupta on 30-05-2024
 * Reason - Getting Checkin Details
 */

// Code addition by Om Shrivastava on 01-06-2024
// Reason : Create the post API for checkinform details
export const postCheckinDetailsApi = async (access, checkinRequestData, tenant) => {
  try {
    const response = await API.post(`${tenant}/post_checkin_form/`, checkinRequestData, {
      headers: {
        // Code Commented and Addition by Tejasve Gupta as Guided by Om sir on 01-06-2024
        // Reason - Url
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${access}`, // Added access token to headers
        // End of Code Commented and Addition by Tejasve Gupta as Guided by Om sir on 01-06-2024
        // Reason - Url
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error posting check-in details:", error);
    throw error;
  }
};
// Code addition by Om Shrivastava on 01-06-2024
// Reason : Create the post API for checkinform details

// Code addition by Om Shrivastava on 05-06-2024
// Reason : Create the post API for checkoutform details
export const postCheckOutDetailsApi = async (access, checkoutRequestData, tenant) => {
  try {
    const response = await API.post(`${tenant}/checkout_details/`, checkoutRequestData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access}`, // Add the access token to the headers
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error posting checkout details:", error);
    throw error;
  }
};

export const postRoomShiftingApi = async (roomShiftingData, tenant) => {
  try {
    const response = await API.post(`${tenant}/room-shift/`, roomShiftingData, {
      headers: {
        "Content-Type": "application/json",
        // Authorization: `Bearer ${access}`, // Add the access token to the headers
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error posting room sshifting details:", error);
    throw error;
  }
};

export const getRoomShiftingApi = async (billing_id, tenant) => {
  try {
    const response = await API.get(`${tenant}/room-shift/`, {
      headers: {
        "Content-Type": "application/json",
        // Authorization: `Bearer ${access}`, // Add the access token to the headers
      },
      params: {
        billing_id,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error posting room sshifting details:", error);
    throw error;
  }
};

export const getStatusByBillingId = async (access, billing_id, tenant) => {
  try {
    const response = await API.get(`${tenant}/checkout_details/`, {
      headers: {
        Authorization: `Bearer ${access}`,
      },
      params: {
        billing_id,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching particular checkin details", error);
    throw error;
  }
};

// Code addition by Om Shrivastava on 05-06-2024
// Reason : Create the post API for checkoutform details

// Code Addition by Tejasve Gupta on 09-06-2024
// Reason - Creation of Pagination and Filteration
export const getCheckinList = async (access, params, tenant) => {
  try {
    const response = await API.get(`${tenant}/checkin-list/`, {
      headers: {
        Authorization: `Bearer ${access}`,
      },
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching check-in list Paginate", error);
    throw error;
  }
};
// Endd of Code Addition by Tejasve Gupta on 09-06-2024
// Reason - Creation of Pagination and Filteration

// Code addition by Tejasve Gupta on 25-06-2024
// Reason - Creation of Expense API
export const postExpenseDetailsApi = async (access, expenseData, tenant) => {
  try {
    const response = await API.post(`${tenant}/expense/`, expenseData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error posting expense details:", error);
    throw error;
  }
};

// Addition by Om Shrivastava on 22-08-2022
// Reason : Create edit and delete method for the expense details
export const editExpenseDetailsApi = async (access, id, expenseData, tenant) => {
  try {
    const response = await API.put(`{tenant}/expenses/${id}/`, expenseData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error editing expense details:", error);
    throw error;
  }
};

export const deleteExpenseDetailsApi = async (access, id, tenant) => {
  try {
    const response = await API.delete(`${tenant}/expenses/${id}/`, {
      headers: {
        Authorization: `Bearer ${access}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting expense details:", error);
    throw error;
  }
};
// End of addition by Om Shrivastava on 22-08-2022
// Reason : Create edit and delete method for the expense details

/**
 * Modified by - Ashish Dewangan on 11-10-2024
 * Reason - To send filter condition to backend
 */
// export const getExpenseDetailsApi = async (access) => {
//   try {
//     const response = await API.get("/expense-list/", {
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${access}`,
//       },
//     });
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching expense details:", error);
//     throw error;
//   }
// };

export const getExpenseDetailsApi = async (access,filterConditions, tenant) => {
  try {
    const response = await API.get(`${tenant}/expense-list/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access}`,
      },
      params: filterConditions,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching expense details:", error);
    throw error;
  }
};
/**
 * End of modification by - Ashish Dewangan on 11-10-2024
 * Reason - To send filter condition to backend
 */

// End of Code addition by Tejasve Gupta on 25-06-2024
// Reason - Creation of Expense API

// Code addition by Tejasve Gupta on 29-06-2024
// Reason - Creation of Extend API
export const postExtendCheckoutApi = async (access, checkinRequestData) => {
  try {
    const response = await API.post(`/extend-checkout/`, checkinRequestData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${access}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error posting Ectended Check-out details:", error);
    throw error;
  }
};
// End of Code addition by Tejasve Gupta on 29-06-2024
// Reason - Creation of Extend API

// Code addition by Tejasve Gupta on 06-07-2024
// Reason - Creation of Particular Checkin Details
export const getParticularCheckindetailsApi = async (access, billing_id, tenant) => {
  try {
    const response = await API.get(`${tenant}/particular-checkin-details/`, {
      headers: {
        Authorization: `Bearer ${access}`,
      },
      params: {
        billing_id,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching particular checkin details", error);
    throw error;
  }
};
// End of Code addition by Tejasve Gupta on 08-07-2023
// Reason - Creation of Particular Checkin Details

// Code addition by Tejasve Gupta on 08-07-2023
// Reason - post check-out functionality
export const postReCheckinDetailsApi = async (access, billing_id) => {
  try {
    const response = await API.post(`/re-Check-in-details/`, billing_id, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${access}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error posting check-in details:", error);
    throw error;
  }
};
// End of Code addition by Tejasve Gupta on 08-07-2023
// Reason - post check-out functionality

// Code Addition by Tejasve Gupta on 18-07-2024
// Reason - To show Hotel's Details in the FormC
// export const getSettingApi = async (access) => {
//   try {
//     const response = await API.get(`/settings/`, {
//       headers: {
//         Authorization: `Bearer ${access}`,
//       },
//     });
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching particular checkin details", error);
//     throw error;
//   }
// };

// End of Code Addition by Tejasve Gupta on 18-07-2024
// Reason - To show Hotel's Details in the FormC

/* Code Addition by Tejasve Gupta on 24-07-2024
   Reason - To add new module Rooms from frontend  */

/**
 * Modified by - Ashish Dewangan on 07-09-2024
 * Reason - To handle the response
 */
// export const postRooms = async (access, formData) => {
//   try {
//     const response = await API.post(`/roomdetails/`, formData, {
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${access}`,
//       },
//     });
//     return response.data;
//   } catch (error) {
//     console.error("Error posting Room Data:", error);
//     throw error;
//   }
// };

export const postRooms = async (access, formData, tenant) => {
  const response = await API.post(`${tenant}/roomdetails/`, formData, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access}`,
    },
  }).catch((err) => console.log(err));
  if (response.response) {
    if (response.response.status == 404) {
      notificationObject.error(response.response.data);
      console.log(response.response.data);
    }
    if (response.response.status == 401) {
      notificationObject.error(response.response.data);
      console.log(response.response.data);
    }
    if (response.response.status == 400) {
      notificationObject.error(response.response.data);
      console.log(response.response.data);
    }
    return "error";
  } else {
    if (response.status == 201) {
      return response ? response.data : {};
    }
  }
};
/**
 * End of modification by - Ashish Dewangan on 07-09-2024
 * Reason - To handle the response
 */

/**
 * Code Addition by Tejasve Gupta on 21-08-2024
 * Reason - To get room types from backend
 */
export const getRoomTypes = async (access, tenant, params={}) => {
  try {
    const response = await API.get(`${tenant}/roomdetails/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access}`,
      },
      params: params,
    });
    // console.log("Received Room Data:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error getting Room Data:", error);
    throw error;
  }
};
/**
 * End of Code Addition by Tejasve Gupta on 21-08-2024
 * Reason - To get room types from backend
 */
/**
 * Code Addition by Tejasve Gupta on 21-08-2024
 * Reason - To Edit and delete rooms
 */
export const updateRoomDetail = async (access, roomId, roomData, tenant) => {
  try {
    const response = await API.put(`${tenant}/rooms-put-delete/${roomId}/`, roomData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating Room Detail:", error);
    throw error;
  }
};

// Delete a room detail
export const deleteRoomDetail = async (access, roomId, tenant) => {
  try {
    const response = await API.delete(`${tenant}/rooms-put-delete/${roomId}/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access}`,
      },
    });

    // Assuming the response contains the updated room list
    return {
      message: response.data.message,
      roomData: response.data.rooms,
    };
  } catch (error) {
    console.error("Error deleting Room Detail:", error);
    throw error;
  }
};

/**
 * End of Code Addition by Tejasve Gupta on 21-08-2024
 * Reason - To Edit and delete rooms
 */

/* End of Code Addition by Tejasve Gupta on 24-07-2024
 Reason - To add new module Rooms from frontend  */

/* Code Addition by Tejasve Gupta on 24-07-2024
   Reason - To add new module settings from frontend  */

// export const postSettings = async (access, formData) => {
//   try {
//     const settingId = formData.get('id');
//     console.log("settings id--->>>",formData.get('id'));
//     const url = settingId ? `/settings/${settingId}/` : `/settings/`;
//     const method = settingId ? 'put' : 'post';

//     const response = await API[method](url, formData, {
//       headers: {
//         "Content-Type": "multipart/form-data",
//         Authorization: `Bearer ${access}`,
//       },
//     });

//     return response.data;
//   } catch (error) {
//     console.error("Error posting settings data:", error);
//     throw error;
//   }
// };

export const postSettings = async (access, formData, tenant) => {
  try {
    const response = await API.post(`${tenant}/settings/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${access}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error posting settings data:", error);
    throw error;
  }
};

/*End of Code Addition by Tejasve Gupta on 24-07-2024
   Reason - To add new module settings from frontend  */

/* Code Addition by Tejasve Gupta on 26-07-2024
   Reason - To add Header Logo and Hotel Name in footer  */
/**
 * Modified by - Ashish Dewangan on 02-09-2024
 * Reason - To handle proper API response
 */
// export const getSettingsApi = async (access) => {
//   try {
//     const response = await API.get(`/settings/`, {
//       headers: {
//         Authorization: `Bearer ${access}`,
//       },
//     });
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching settings data:", error);
//     throw error;
//   }
// };
export const getSettingsApi = async (access, tenant) => {
  const response = await API.get(`${tenant}/settings/`, {
    headers: {
      Authorization: `Bearer ${access}`,
    },
  }).catch((err) => console.log(err));
  if (response.response) {
    if (response.response.status == 404) {
      console.log(response.response.data);
    }
    if (response.response.status == 401) {
      console.log(response.response.data);
    }
    return {};
  } else {
    if (response.status == 200) {
      return response ? response.data : {};
    }
  }
};
/**
 * End of modification by - Ashish Dewangan on 02-09-2024
 * Reason - To handle proper API response
 */

/*End of Code Addition by Tejasve Gupta on 26-07-2024
   Reason - To add Header Logo and Hotel Name in footer  */

/** Code Addition by Tejasve Gupta on 02-08-2024
 * Reason - for name search dropdown
 */
export const getPersonalDetailsApi = async (access, searchTerm = "", tenant) => {
  try {
    const response = await API.get(`${tenant}/personal-details/`, {
      headers: {
        Authorization: `Bearer ${access}`,
      },
      params: {
        search: searchTerm, // Send the search term as a query parameter
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching Personal Details:", error);
    throw error;
  }
};
/** End of Code Addition by Tejasve Gupta on 02-08-2024
 * Reason - for name search dropdown
 */

/** Code Addition by Tejasve Gupta on 05-08-2024
Reason - Addition of Advance Booking List Module*/

export const getAdvanceCheckinList = async (access, params, tenant) => {
  try {
    const response = await API.get(`${tenant}/advance-checkin-list/`, {
      headers: {
        Authorization: `Bearer ${access}`,
      },
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching Advance Check-in list Paginate", error);
    throw error;
  }
};

/** End of Code Addition by Tejasve Gupta on 05-08-2024
Reason - Addition of Advance Booking List Module*/

/**Code Addition by Tejasve Gupta on 11-08-2024
 * Reason - Addition of Posting data directly to Payment Receipt
 */
export const postPaymentReceiptApi = async (access, paymentReceiptData, tenant) => {
  try {
    const response = await API.post(`${tenant}/payment-receipts/`, paymentReceiptData, {
      headers: {
        // "Content-Type": "application/json",
        Authorization: `Bearer ${access}`, // Add the access token to the headers
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error posting payment receipt details:", error);
    throw error;
  }
};

/**End of Code Addition by Tejasve Gupta on 11-08-2024
 * Reason - Addition of Posting data directly to Payment Receipt
 */

/* Code Addition by Om Shrivastava on 21-08-2024
   Reasonget the all user details  */

export const getAllUserDetailsApi = async (access, tenant) => {
  try {
    const response = await API.get(`${tenant}/all-user/`, {
      headers: {
        Authorization: `Bearer ${access}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching settings data:", error);
    throw error;
  }
};
/*End of Code Addition by Om Shrivastava on 21-08-2024
     Reason - To get the all user details  */

/**Code Addition by Tejasve Gupta on 23-08-2024
 * Reason - To get all the checkouts as list
 */
export const getCheckOutList = async (access, params, tenant) => {
  try {
    const response = await API.get(`${tenant}/checkout_list/`, {
      headers: {
        Authorization: `Bearer ${access}`,
      },
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching check-in list Paginate", error);
    throw error;
  }
};
/**End of Code Addition by Tejasve Gupta on 23-08-2024
 * Reason - To get all the checkouts as list
 */

/**
 * Added by - Ashish Dewangan on 28-08-2024
 * Reason - Created method that will call API to get Particular checkout Details
 */
export const getParticularCheckoutdetailsApi = async (access, billing_id, tenant) => {
  try {
    const response = await API.get(`${tenant}/particular-checkout-details/`, {
      headers: {
        Authorization: `Bearer ${access}`,
      },
      params: {
        billing_id,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching particular checkin details", error);
    throw error;
  }
};
/**
 * End of addition by - Ashish Dewangan on 28-08-2024
 * Reason - Created method that will call API to get Particular checkout Details
 */

/**Code Addition by Tejasve Gupta on 30-08-2024
 * Reason - Checkin Cancelation
 */
export const patchCancelCheckinApi = async (access, billing_id, tenant) => {
  try {
    const response = await API.patch(`${tenant}/cancel-checkin/`, billing_id, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error posting check-in details:", error);
    throw error;
  }
};


// Added by akanksha on 07-02-2025
// Reason to store refund amount in the backend
export const patchRefundCheckinApi = async (access, billing_id, tenant) => {
  try {
    const response = await API.patch(`${tenant}/refund-checkin/`, billing_id, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error posting refund details:", error);
    throw error;
  }
};
// End by akanksha on 07-02-2025
// Reason to store refund amount in the backend

/**End of Code Addition by Tejasve Gupta on 30-08-2024
 * Reason - Checkin Cancelation
 */

/**
 * Added by - Ashish Dewangan on 03-10-2024
 * Reason - method that will call API for posting handover details
 */
export const postHandoverDetailsApi = async (access, handoverData, tenant) => {
  try {
    const response = await API.post(`${tenant}/handovers/`, handoverData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error posting handover details:", error);
    throw error;
  }
};
/**
 * End of addition by - Ashish Dewangan on 03-10-2024
 * Reason - method that will call API for posting handover details
 */


/**
 * Added by - Ashish Dewangan on 03-10-2024
 * Reason - method that will call API for editing handover details
 */
export const editHandoverDetailsApi = async (access, id, handoverData, tenant) => {
  try {
    const response = await API.put(`${tenant}/handovers/${id}/`, handoverData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error editing handover details:", error);
    throw error;
  }
};
/**
 * End of addition by - Ashish Dewangan on 03-10-2024
 * Reason - method that will call API for editing handover details
 */

/**
 *Added by - Ashish Dewangan on 03-10-2024
 * Reason - method that will call API for deleting handover details
 */

export const deleteHandoverDetailsApi = async (access, id, tenant) => {
  try {
    const response = await API.delete(`${tenant}/handovers/${id}/`, {
      headers: {
        Authorization: `Bearer ${access}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting handover details:", error);
    throw error;
  }
};
/**
 * End of addition by - Ashish Dewangan on 03-10-2024
 * Reason - method that will call API for deleting handover details
 */

/**
 * Added by - Ashish Dewangan on 03-10-2024
 * Reason - method that will call API for getting list of handovers details
 */

export const getHandoverDetailsApi = async (access, filterConditions, tenant) => {
  try {
    const response = await API.get(`${tenant}/handovers/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access}`,
      },
      params: filterConditions,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching handover details:", error);
    throw error;
  }
};

/**
 * End of addition by - Ashish Dewangan on 03-10-2024
 * Reason - method that will call API for getting list of handovers details
 */

export const postBalanceSheetDetailsApi = async (access, balanceSheetData, tenant) => {
  try {
    const response = await API.post(`${tenant}/balance-sheet/`, balanceSheetData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error posting balance details:", error);
    throw error;
  }
};

export const getBalanceSheetDetailsApi = async (access, filterConditions, tenant) => {
  try {
    const response = await API.get(`${tenant}/balance-sheet/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access}`,
      },
      params: filterConditions,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching balance details:", error);
    throw error;
  }
};

export const editBalanceDetailsApi = async (access, id, balanceSheetData, tenant) => {
  try {
    const response = await API.put(`${tenant}/balance-sheet/${id}/`, balanceSheetData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error editing balanceSheet details:", error);
    throw error;
  }
};

export const deleteBalanceDetailsApi = async (access, id, tenant) => {
  try {
    const response = await API.delete(`${tenant}/balance-sheet/${id}/`, {
      headers: {
        Authorization: `Bearer ${access}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting balanceSheet details:", error);
    throw error;
  }
};



export const postRoomTypeApi = async (accessToken, roomTypeData, tenant) => {
  try {
    const response = await API.post(`${tenant}/room_type/`, roomTypeData, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error posting room type:', error);
    throw error;
  }
};

export const getRoomTypesApi = async (accessToken, tenant) => {
  try {
    const response = await API.get(`${tenant}/room_type/`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching room types:', error);
    throw error;
  }
};


export const postRoomVarietyApi = async (accessToken, roomVarietyData, tenant) => {
  try {
    const response = await API.post(`${tenant}/room_variety/`, roomVarietyData, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error posting room type:', error);
    throw error;
  }
};

export const getRoomVarietyApi = async (accessToken, tenant) => {
  try {
    const response = await API.get(`${tenant}/room_variety/`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching room types:', error);
    throw error;
  }
};

export const getAmenityApi = async (accessToken, tenant) => {
  try {
    const response = await API.get(`${tenant}/amenity/`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching room types:', error);
    throw error;
  }
};

export const postAmenityApi = async (accessToken, amenityData, tenant) => {
  try {
    const response = await API.post(`${tenant}/amenity/`, amenityData, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error posting room type:', error);
    throw error;
  }
};
export const editAmenityDetailsApi = async (access, id, amenityData, tenant) => {
  try {
    const response = await API.put(`${tenant}/amenity/${id}/`, amenityData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error editing Amenity details:", error);
    throw error;
  }
};

export const deleteAmenityDetailsApi = async (access, id, tenant) => {
  try {
    const response = await API.delete(`${tenant}/amenity/${id}/`, {
      headers: {
        Authorization: `Bearer ${access}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting Amenity details:", error);
    throw error;
  }
};

export const getAmenityRoomApi = async (accessToken, tenant) => {
  try {
    const response = await API.get(`${tenant}/amenityRoom/`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching room types:', error);
    throw error;
  }
};

export const postAmenityRoomApi = async (accessToken, amenityRoomData, tenant) => {
  try {
    const response = await API.post(`${tenant}/amenityRoom/`, amenityRoomData, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error posting room type:', error);
    throw error;
  }
};
export const editAmenityRoomDetailsApi = async (access, id, amenityRoomData, tenant) => {
  try {
    const response = await API.put(`${tenant}/amenityRoom/${id}/`, amenityRoomData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error editing Amenity details:", error);
    throw error;
  }
};

export const deleteAmenityRoomDetailsApi = async (access, id, tenant) => {
  try {
    const response = await API.delete(`${tenant}/amenityRoom/${id}/`, {
      headers: {
        Authorization: `Bearer ${access}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting Amenity details:", error);
    throw error;
  }
};

export const postHotelApi = async (accessToken, hotelAmenity, tenant) => {
  try {
    const response = await API.post(`${tenant}/postHotelAmenity/`, hotelAmenity, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error posting room type:', error);
    throw error;
  }
};

export const getAmenityData = async () => {
  try {
    const response = await APIWithoutV1.get(`/filter_room_city/amenities/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching balance details:", error);
    throw error;
  }
};


export const getAmenity = async (accessToken, tenant) => {
  try {
    const response = await API.get(`${tenant}/getHotelAmenity/`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching room types:', error);
    throw error;
  }
};