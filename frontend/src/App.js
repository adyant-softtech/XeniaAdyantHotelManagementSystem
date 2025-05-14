import logo from "./logo.svg";
import "./App.css";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home/Home.jsx";
import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";
/**Code Addded by Tejasve Gupta on 25-05-2024
 * Reason - Addition of Header Footer and Forget Password
 */
import CustomerDetails from "./pages/CustomerDeatils/CustomerDetails.jsx";

import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword.jsx";
import CheckIn from "./pages/CheckIn/CheckIn.jsx";
/**End of Code Addded by Tejasve Gupta on 25-05-2024
 * Reason - Addition of Header Footer and Forget Password
 */
/**Code Addition by Tejasve Gupta on 15-06-2024
Reason- Routes Protected as user can only access by logging in*/
import CheckinList from "../src/pages/CheckIn/CheckinList.jsx";
import ProtectedRoutes from "./utils/ProtectedRoutes.jsx";
/**End of Code Addition by Tejasve Gupta on 15-06-2024
Reason- Routes Protected as user can only access by logging in*/
/**Code Addition by Tejasve Gupta on 20-06-2024
Reason - Addition of Expense Module*/
import ExpenseForm from "./pages/Expense/ExpenseForm.jsx";
import ExpenseReport from "./pages/Expense/ExpenseReport.jsx";
/**Code addition by Tejasve Gupta on 06-07-2024
  Reason - Addition of check-in details module*/
import CheckInDetailsForm from "./pages/CheckInDetails/CheckInDetailsForm.jsx";
/**End of Code addition by Tejasve Gupta on 06-07-2024
  Reason - Addition of check-in details module*/
/**Code addition by Tejasve Gupta on 09-07-2024
  Reason - Addition of re-check-in form module*/
import ReCheckIn from "./pages/ReCheckIn/ReCheckInForm.jsx";
/* Code Addition by Tejasve Gupta on 18-07-2024
          Reason -  Creation of Form C */
import FormC from "./pages/FormC/FormC.jsx";
import AddNewRoomForm from "./pages/AddNewRoom/AddNewRoomForm.jsx";
import SettingsForm from "./pages/Settings/Settings.jsx";
import Invoice from "./pages/Invoice/Invoice.jsx";
import CheckInListInvoice from "./pages/CheckIn/CheckInListInvoice.jsx";
import AdvanceCheckinList from "./pages/AdvanceCheckinList/AdvanceCheckinList.jsx";
import PaymentReceiptModal from "./pages/PaymentReceipt/PaymentReceipt.jsx";
import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import CheckoutList from "./pages/CheckOutList/CheckOutList.jsx";
import NewCheckoutList from "./pages/CheckOutList/NewCheckoutList";
import CheckoutDetailsForm from "./pages/CheckoutDetails/CheckoutDetailsForm";
import CheckoutInvoice from "./pages/CheckoutInvoice/CheckoutInvoice.jsx";
import HandoverForm from "./pages/Handover/HandoverForm";
import BalanceSheet from "./pages/BalanceSheet/BalanceSheet.jsx";
import Amenity from "./pages/Amenity/Amenity.jsx";
/* End of Code Addition by Tejasve Gupta on 18-07-2024
          Reason -  Creation of Form C */
/**End of Code addition by Tejasve Gupta on 09-07-2024
  Reason - Addition of re-check-in form module*/
// import CheckoutForm from "./pages/CheckInDetails/CheckInDetailsForm.jsx";
// import ProfitReport from "./pages/ProfitReport/ProfitReport.jsx";
// import RoomDetails from "./pages/CheckIn/RoomDetails.jsx";
/**End of Code Addition by Tejasve Gupta on 20-06-2024
Reason - Addition of Expense Module*/
 


function App() {
  return (
    <div>
      <link
      // rel="adyant"
      // type="image/x-icon"
      // href="frontend\src\assets\adyant.png"
      ></link>
      {/* 
      Added by - Ashish Dewangan on 24-05-2024
      Reason - To show header */}
      <Header />
      {/* 
      End of code addition by - Ashish Dewangan on 24-05-2024
      Reason - To show header */}
      {/* 
      Added by - Ashish Dewangan on 22-05-2024
      Reason - To have routes for different pages */}
      <Routes>
        {/**Code Addition by Tejasve Gupta on 15-06-2024
                    Reason- Routes Protected as user can only access by logging in*/}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgotPassword" element={<ForgotPassword />} />
        {/**Addded by Tejasve Gupta on 25-05-2024
         * Reason - Addition of Header Footer and Forget Password
         */}
        <Route element={<ProtectedRoutes />}>
          {/* Modification and addition by Om Shrivastava on 14-08-2024
          Reason : Set the path for dashboard and check in page */}
          {/* <Route path="/" element={<CheckIn />} /> */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/check-in" element={<CheckIn />} />
          {/* End of modification and addition by Om Shrivastava on 14-08-2024
          Reason : Set the path for dashboard and check in page */}

          {/* Addition by Om Shrivastava on 04-06-2024
        Reason : Create the checkin list and checkout form page */}
          <Route path="/checkinList" element={<CheckinList />} />
          <Route path="/CheckInDetailsForm" element={<CheckInDetailsForm />} />
          {/**Code Addition by Tejasve Gupta on 20-06-2024
                Reason - Addition of Expense Module*/}
          <Route path="/expenseForm" element={<ExpenseForm />} />
          <Route path="/expense-report" element={<ExpenseReport />} />
          <Route path="/ReCheckInForm" element={<ReCheckIn />} />
          {/**<Route path="/profit-report" element={<ProfitReport />} />*/}
          {/* <Route path="/room-selection" element={<RoomDetails />} /> */}
          {/* Code Addition by Tejasve Gupta on 18-07-2024
          Reason -  Creation of Form C */}
          <Route path="/formC" element={<FormC />} />

          {/* End of Code Addition by Tejasve Gupta on 18-07-2024
          Reason -  Creation of Form C */}
          {/**Code Addition by Tejasve Gupta on 23-08-2024
          Reason - Addition of Check-out list */}
          {/* <Route path="/checkout-list" element={<CheckoutList/>} /> */}
          <Route path="/checkout-list" element={<NewCheckoutList />} />
          <Route
            path="/CheckoutDetailsForm"
            element={<CheckoutDetailsForm />}
          />

          {/* Code Addition by Tejasve Gupta on 24-07-2024
            Reason - To add new module Rooms from frontend  */}
          <Route path="/Rooms" element={<AddNewRoomForm />} />
          <Route path="/settings" element={<SettingsForm />} />
          {/* End of Code Addition by Tejasve Gupta on 24-07-2024
          Reason - To add new module Rooms from frontend  */}
          <Route path="/payment-receipt" element={<PaymentReceiptModal />} />

          <Route path="/invoice" element={<Invoice />} />
          <Route path="/checkin-invoice" element={<CheckInListInvoice />} />
          {/* Addition by Om Shrivastava on 31-09-2024
          Reason : Add the Checkout invoice file  */}
          <Route path="/checkout-invoice" element={<CheckoutInvoice />} />
          {/* Addition by Om Shrivastava on 31-09-2024
          Reason : Add the Checkout invoice file  */}
          {/**End of Code Addition by Tejasve Gupta on 20-06-2024
                  Reason - Addition of Expense Module*/}
          <Route
            path="/advance-checkin-List"
            element={<AdvanceCheckinList />}
          />
        </Route>
        {/* End of addition by Om Shrivastava on 04-06-2024
        Reason : Create the checkin list and checkout form page */}
        {/**End of Code Addition by Tejasve Gupta on 15-06-2024
                  Reason- Routes Protected as user can only access by logging in*/}

        {/* Added by - Ashish Dewangan on 05-10-2024
         * Reason - To have route for handover page */}
        <Route path="/handovers" element={<HandoverForm />} />
        {/* End of addition by - Ashish Dewangan on 05-10-2024
         * Reason - To have route for handover page */}

         
        {/* Added by akanksha on 23rd Oct,
        Reason : to add customer detail  */}
        <Route path="/customer-details" element={<CustomerDetails/>}/> 
        {/* Added by akanksha on 23rd Oct,
        Reason : to add customer detail  */}
        {/* Added by akanksha on 27-03-2025
        reason : To add balance sheet link in header tabs */}
        <Route path="/balanceSheet" element={<BalanceSheet/>}/> 
        <Route path="/amenity" element={<Amenity/>}/> 
        {/* End by akanksha on 27-03-2025
        reason : To add balance sheet link in header tabs */}
      </Routes>
      {/* 
      {/**End of Code Addded by Tejasve Gupta on 25-05-2024
        * Reason - Addition of Header Footer and Forget Password 
        */}
      {/**End of code addition by - Ashish Dewangan on 22-05-2024 Reason - To have
      routes for different pages */}
      {/* 
      Added by - Ashish Dewangan on 24-05-2024
      Reason - To show footer */}
      <Footer />
      {/* 
      End of code addition by - Ashish Dewangan on 24-05-2024
      Reason - To show footer */}
    </div>
  );
}

export default App;
