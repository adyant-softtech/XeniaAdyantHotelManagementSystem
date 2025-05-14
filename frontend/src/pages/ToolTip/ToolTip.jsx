import React from 'react';

const CheckInTooltips = () => {
  const containerStyle = {
    // padding: '30px',
    fontFamily: "var(--page-title-font-family)",
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    // boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  };

  const sectionStyle = {
    flex: 1,
    margin: '10px',
    padding: '10px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s ease-in-out',
    fontSize:'var(--form-button-font-size)'

  };

  const headerStyle = {
    fontSize: 'var(--page-content-subTitle-font-size)',
    marginBottom: '7px',
    color: '#333',
    borderBottom: '2px solid #00897b',
    paddingBottom: '8px',
  };

  const listStyle = {
    listStyleType: 'none',
    padding: 0,
  };

  const listItemStyle = {
    marginBottom: '6px',
    lineHeight: '1.6',
    transition: 'color 0.3s ease-in-out',
  };

  const strongStyle = {
    fontWeight: 'bold',
    color: 'black',
    fontSize:'var(--form-button-font-size)'

  };

  const handleMouseEnter = (e) => {
    e.currentTarget.style.color = '#7ecd02';
    e.currentTarget.style.transform = 'scale(1.05)';
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.color = '#333';
    e.currentTarget.style.transform = 'scale(1)';
  };

  return (
    <div style={containerStyle}>
      <h4 style={{paddingTop:'0.7%',paddingLeft:'1%',fontSize:'var(--page-content-font-size)',textTransform:'uppercase'}}>Tool tip</h4>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
       
        <div
          style={sectionStyle}
          // onMouseEnter={handleMouseEnter}
          // onMouseLeave={handleMouseLeave}
        >
          <h3 style={headerStyle}>Guest Details</h3>
          <ul style={listStyle}>
            <li style={listItemStyle}><strong style={strongStyle}>Search by name or phone:</strong> Start typing a name or phone number to search for existing guests. You can select a guest from the dropdown or enter new details manually.</li>
            <li style={listItemStyle}><strong style={strongStyle}>First Name:</strong> Enter the guest's first name.</li>
            <li style={listItemStyle}><strong style={strongStyle}>Last Name:</strong> Enter the guest's last name.</li>
            <li style={listItemStyle}><strong style={strongStyle}>Phone Number:</strong> Enter the guest's contact number. This will be used for verification and communication.</li>
            <li style={listItemStyle}><strong style={strongStyle}>Email:</strong> Enter the guest's email address for booking confirmation and updates.</li>
            <li style={listItemStyle}><strong style={strongStyle}>Country:</strong> Select the guest's country of residence.</li>
            <li style={listItemStyle}><strong style={strongStyle}>State:</strong> Select the guest's state of residence.</li>
            <li style={listItemStyle}><strong style={strongStyle}>City:</strong> Enter the guest's city.</li>
            <li style={listItemStyle}><strong style={strongStyle}>Zip:</strong> Enter the guest's postal code.</li>
            <li style={listItemStyle}><strong style={strongStyle}>ID Type:</strong> Select the type of identification the guest is providing (e.g., Driver’s License, Passport).</li>
            <li style={listItemStyle}><strong style={strongStyle}>ID Number:</strong> Enter the identification number from the selected ID type.</li>
            <li style={listItemStyle}><strong style={strongStyle}>Upload Image:</strong> Click to upload an image of the guest’s ID or any required document.</li>
            <li style={listItemStyle}><strong style={strongStyle}>Add More Guests:</strong> Use this section to add additional guests associated with this check-in.</li>
          </ul>
        </div>
        <div
          style={sectionStyle}
          // onMouseEnter={handleMouseEnter}
          // onMouseLeave={handleMouseLeave}
        >
          <h3 style={headerStyle}>Staying & Payment Details</h3>
          <ul style={listStyle}>
            <li style={listItemStyle}><strong style={strongStyle}>Check-in Date & Time:</strong> Select the check-in date and time for the guest’s stay.</li>
            <li style={listItemStyle}><strong style={strongStyle}>Select Room:</strong> Choose the room type and number for the guest from the available rooms.</li>
            <li style={listItemStyle}><strong style={strongStyle}>Booking Type:</strong> Select the type of booking (e.g., Current, Advance) based on the guest’s request.</li>
            <li style={listItemStyle}><strong style={strongStyle}>Room Charges:</strong> The system will calculate room charges based on the selected room and stay duration.</li>
            <li style={listItemStyle}><strong style={strongStyle}>Discount (%):</strong> Enter any percentage discount applicable to the booking.</li>
            <li style={listItemStyle}><strong style={strongStyle}>Discount (₹):</strong> Enter any fixed amount discount applicable to the booking.</li>
            <li style={listItemStyle}><strong style={strongStyle}>Extra Bed Charges:</strong> Enter charges for any extra guests beyond the standard occupancy of the room.</li>
            <li style={listItemStyle}><strong style={strongStyle}>Subtotal:</strong> The system will calculate the subtotal before taxes.</li>
            <li style={listItemStyle}><strong style={strongStyle}>GST Rate (%):</strong> Enter the applicable GST rate for the booking.</li>
            <li style={listItemStyle}><strong style={strongStyle}>GST Value:</strong> The system will calculate the GST value based on the subtotal and GST rate.</li>
            <li style={listItemStyle}><strong style={strongStyle}>Advance Payment:</strong> Enter the amount the guest is paying in advance at the time of check-in.</li>
            <li style={listItemStyle}><strong style={strongStyle}>Due Amount:</strong> The system will calculate the remaining amount due after applying any payments and discounts.</li>
            <li style={listItemStyle}><strong style={strongStyle}>Grand Total:</strong> The system will calculate the total amount payable after all charges, discounts, and taxes are applied.</li>
            <li style={listItemStyle}><strong style={strongStyle}>Confirm:</strong> Click to finalize the check-in process and save all entered details.</li>
            <li style={listItemStyle}><strong style={strongStyle}>Cancel Check-in:</strong> Click to cancel the check-in process. All unsaved data will be lost.</li>
            <li style={listItemStyle}><strong style={strongStyle}>Check-In:</strong> Displays the check-in time for the guest.</li>
            <li style={listItemStyle}><strong style={strongStyle}>Room Charges:</strong> Displays the total charges for the room selected.</li>
            <li style={listItemStyle}><strong style={strongStyle}>Sub-total:</strong> Displays the subtotal before taxes.</li>
            <li style={listItemStyle}><strong style={strongStyle}>IGST/SGST/CGST:</strong> Displays the tax amounts based on the applicable rates.</li>
            <li style={listItemStyle}><strong style={strongStyle}>Advance Payment:</strong> Displays the amount paid in advance by the guest.</li>
            <li style={listItemStyle}><strong style={strongStyle}>Due Amount:</strong> Displays the remaining amount the guest needs to pay.</li>
            <li style={listItemStyle}><strong style={strongStyle}>Grand Total:</strong> Displays the final total amount payable.</li>
            <li style={listItemStyle}><strong style={strongStyle}>Room Status Indicators:</strong> Shows the status of rooms—Reserved, Available, or Vacant.</li>
            <li style={listItemStyle}><strong style={strongStyle}>Cash/Online:</strong> Select the payment method—either Cash or Online.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CheckInTooltips;
