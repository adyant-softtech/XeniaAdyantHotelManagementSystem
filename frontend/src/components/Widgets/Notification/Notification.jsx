/**
 * Added by - Ashish Dewangan on 24-05-2024
 * Reason - Added configuration for notification
 */
import { Notyf } from "notyf";
import "notyf/notyf.min.css";

const notificationObject = new Notyf({
  // Modification and addition by Om Shrivastava on 21-10-2024
  // Reason : Increse the timing 
  // duration: 2000,
  duration: 4000,
  // Endo of modification and addition by Om Shrivastava on 21-10-2024
  // Reason : Increse the timing 

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

// If you want to remove the .notifyjs-wrapper elements, you should do this separately:
document.querySelectorAll('.notifyjs-wrapper').forEach(el => el.remove());

export default notificationObject;
