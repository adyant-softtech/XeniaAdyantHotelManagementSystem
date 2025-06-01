// import React from 'react';
// import RoomCard from '../RoomCard/RoomCard';
// import styles from './RoomList.module.css';

// const RoomList = () => {
//   const rooms = [
//     {
//       image: '/Images/room1.jpg.jpg',
//       title: 'Deluxe Room',
//       price: '2999',
//       facilities: ['Wi-Fi', 'AC', 'Breakfast'],
//     },
//     {
//       image: '/Images/room2.jpg.jpg',
//       title: 'Luxury Suite',
//       price: '4999',
//       facilities: ['Wi-Fi', 'AC', 'Breakfast', 'Bathtub'],
//     },
//     {
//       image: '/Images/room3.jpg.jpg',
//       title: 'Standard Room',
//       price: '1999',
//       facilities: ['Wi-Fi', 'Fan'],
//     },
//     {
//       image: '/Images/room5(1).jpg',
//       title: 'Family Room',
//       price: '3999',
//       facilities: ['Wi-Fi', 'AC', 'Breakfast', 'Mini Fridge'],
//     },
//     {
//         image: '/Images/room6.jpg',
//         title: 'Family Room',
//         price: '3999',
//         facilities: ['Wi-Fi', 'AC', 'Breakfast', 'Mini Fridge'],
//       },
//   ];

//   return (
//     <div className={styles.roomListContainer}>
//       <h2 className={styles.heading}>Available Rooms</h2>
//       {rooms.map((room, index) => (
//         <RoomCard
//           key={index}
//           image={room.image}
//           title={room.title}
//           price={room.price}
//           facilities={room.facilities}
//         />
//       ))}
//     </div>
//   );
// };

// export default RoomList;
