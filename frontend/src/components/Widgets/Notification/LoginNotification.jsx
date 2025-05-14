// Created by Om Shrivastava on 09-09-2024
// Reason : Handle the success message in repetative format 

import { Notyf } from "notyf";
import "notyf/notyf.min.css";

const notificationObject = new Notyf({
  duration: 2000,
  dismissible: true, // Allows user to dismiss the notification manually
  position: {
    x: "right",
    y: "top",
  },
  types: [
    {
      type: "success",
      background: '#4AB516',
    },
  ],
});

let recentMessages = new Set();

// Custom function to show notification
const showNotification = (message, type = "success") => {
  if (!recentMessages.has(message)) {
    notificationObject.open({
      type: type,
      message: message,
      dismissible: true,
    });

    recentMessages.add(message);
  }
};

export { showNotification };