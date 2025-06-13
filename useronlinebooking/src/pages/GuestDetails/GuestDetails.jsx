import React, { useState } from 'react';
import styles from './GuestDetails.module.css';
import { FaTrashAlt } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';

const GuestDetails = () => {
  const [formData, setFormData] = useState({
    title: 'Mr',
    firstName: '',
    lastName: '',
    gender: '',
    phone: '',
    dob: '',
    email: '',
    idType: '',
    idNumber: '',
    image: null,
    country: 'India',
    state: 'Chhattisgarh',
    city: 'Raipur',
    address: '',
    pinCode: '',
    adults: 1,
    children: 0,
    noOfPersons: 1,
    purpose: '',
    arrivedFrom: '',
    destination: '',
  });
  const [guestRows, setGuestRows] = useState([]);
  const location = useLocation();
  const selectedRooms = location.state?.selectedRooms || [];

  console.log('Received selectedRooms:', selectedRooms);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'file' ? files[0] : value,
    });
  };

  const handleAddGuest = () => {
    setGuestRows([
      ...guestRows,
      {
        id: Date.now(),
        room: '',
        firstName: '',
        lastName: '',
        idType: '',
        idNumber: '',
        image: null,
        type: 'Adult',
      },
    ]);
  };

  const handleGuestChange = (index, field, value) => {
    const updatedRows = [...guestRows];
    updatedRows[index][field] = value;
    setGuestRows(updatedRows);
  };

  const handleRemoveGuest = (id) => {
    setGuestRows(guestRows.filter((row) => row.id !== id));
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <div className={styles.dashboardContainer}>
      <form className={styles.formContainer} onSubmit={handleSubmit}>
        {selectedRooms.length > 0 && (
          <div className={styles.selectedRoomsTable}>
            <h4>Selected Rooms</h4>
            <table>
              <thead>
                <tr>
                  <th>Room Number</th>
                  <th>Room Type</th>
                  <th>Price (₹)</th>
                  <th>Variety</th>
                </tr>
              </thead>
              <tbody>
                {selectedRooms.map((room) => (
                  <tr key={room.id}>
                    <td>{room.room_number}</td>
                    <td>{room.room_type}</td>
                    <td>{room.room_price}</td>
                    <td>{room.variety}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <h3>GUEST DETAILS</h3>
        <div className={styles.row}>
          <select name="title" value={formData.title} onChange={handleChange}>
            <option>Mr</option>
            <option>Mrs</option>
            <option>Ms</option>
          </select>
          <input name="firstName" placeholder="First Name *" required onChange={handleChange} />
          <input name="lastName" placeholder="Last Name *" required onChange={handleChange} />
          <select name="gender" required onChange={handleChange}>
            <option value="">Select Gender *</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>

        <div className={styles.row}>
          <input name="phone" placeholder="Phone Number *" required onChange={handleChange} />
          <input type="date" name="dob" onChange={handleChange} />
          <input name="email" placeholder="Email" onChange={handleChange} />
        </div>

        <div className={styles.row}>
          <select name="idType" required onChange={handleChange}>
            <option value="">Select ID Type *</option>
            <option>Aadhar</option>
            <option>Passport</option>
            <option>Voter ID</option>
          </select>
          <input name="idNumber" placeholder="ID Number *" required onChange={handleChange} />
          <input type="file" name="image" onChange={handleChange} />
        </div>

        <div className={styles.row}>
          <input name="country" value="India" readOnly />
          <input name="state" value="Chhattisgarh" readOnly />
          <input name="city" value="Raipur" readOnly />
        </div>

        <div className={styles.row}>
          <input name="address" placeholder="Address" onChange={handleChange} />
          <input name="pinCode" placeholder="Pin Code" onChange={handleChange} />
        </div>

        <button type="button" className={styles.addBtn} onClick={handleAddGuest}>Add More Guests</button>

        {guestRows.length > 0 && (
          <div className={styles.guestTable}>
            <div className={styles.guestRowHeader}>
              <div>Select Room</div>
              <div>*First Name</div>
              <div>*Last Name</div>
              <div>ID Type</div>
              <div>ID Number</div>
              <div>Upload Image</div>
              <div>Adult / Child</div>
              <div>Remove</div>
            </div>

            {guestRows.map((guest, index) => (
              <div className={styles.guestRow} key={guest.id}>
                <select
                  value={guest.room}
                  onChange={(e) => handleGuestChange(index, 'room', e.target.value)}
                >
                  <option value="">Select Room</option>
                  <option>Room 1</option>
                  <option>Room 2</option>
                </select>

                <input
                  type="text"
                  required
                  value={guest.firstName}
                  onChange={(e) => handleGuestChange(index, 'firstName', e.target.value)}
                />
                <input
                  type="text"
                  required
                  value={guest.lastName}
                  onChange={(e) => handleGuestChange(index, 'lastName', e.target.value)}
                />
                <select
                  value={guest.idType}
                  onChange={(e) => handleGuestChange(index, 'idType', e.target.value)}
                >
                  <option value="">Select</option>
                  <option>Aadhar</option>
                  <option>Passport</option>
                </select>
                <input
                  type="text"
                  value={guest.idNumber}
                  onChange={(e) => handleGuestChange(index, 'idNumber', e.target.value)}
                />
                <input
                  type="file"
                  onChange={(e) => handleGuestChange(index, 'image', e.target.files[0])}
                />
                <select
                  value={guest.type}
                  onChange={(e) => handleGuestChange(index, 'type', e.target.value)}
                >
                  <option>Adult</option>
                  <option>Child</option>
                </select>

                <button
                  type="button"
                  className={styles.deleteButton}
                  onClick={() => handleRemoveGuest(guest.id)}
                >
                  <FaTrashAlt />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className={styles.row}>
          <input name="adults" type="number" min="0" value={formData.adults} onChange={handleChange} placeholder="Adults" />
          <input name="children" type="number" min="0" value={formData.children} onChange={handleChange} placeholder="Children" />
          <input name="noOfPersons" type="number" min="1" value={formData.noOfPersons} onChange={handleChange} placeholder="No of Persons" />
        </div>

        <div className={styles.row}>
          <input name="purpose" placeholder="Purpose of Visit" onChange={handleChange} />
          <input name="arrivedFrom" placeholder="Arrived From" onChange={handleChange} />
          <input name="destination" placeholder="Destination" onChange={handleChange} />
        </div>

        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default GuestDetails;
