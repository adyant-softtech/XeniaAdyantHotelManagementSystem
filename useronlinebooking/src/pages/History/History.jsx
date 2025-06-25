import React, { useContext, useEffect, useState } from 'react';
import { getUserBookingDetails } from '../../Api/services';
import { GlobalContext } from '../../context/Context';

const History = () => {
  const { user, tenant } = useContext(GlobalContext);
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookingData = async () => {
      const access = localStorage.getItem("access");
      try {
        if (user && user.id && tenant && access) {
          const data = await getUserBookingDetails(access, tenant, user.id);
          setBookingData(data);
        }
      } catch (error) {
        console.error("Error loading user bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingData();
  }, [user, tenant]);

  if (loading) return <p>Loading booking history...</p>;

  return (
    <div>
      <h2>Booking History for {bookingData?.first_name} {bookingData?.last_name}</h2>

      {bookingData?.billings?.length > 0 ? (
        <ul>
          {bookingData.billings.map((billing) => (
            <li key={billing.id}>
              <strong>Booking ID:</strong> {billing.id} <br />
              <strong>Arrival Date:</strong> {billing.arrival_date || "N/A"} <br />
              <strong>Payment Method:</strong> {billing.payment_method} <br />
              <strong>No. of Persons:</strong> {billing.number_of_persons} <br />
              <strong>GST:</strong> ₹{billing.gst_value} <br />
              <strong>Total:</strong> ₹{billing.grand_total} <br />
              <hr />
            </li>
          ))}
        </ul>
      ) : (
        <p>No bookings found.</p>
      )}
    </div>
  );
};


export default History;
