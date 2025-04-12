// // TimeSlotSelector.js
// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import '../../../styles/TimeSlotSelector.css';

// const TimeSlotSelector = ({ employeeId, onTimeSelect }) => {
//   const [schedule, setSchedule] = useState([]);
//   const [selectedDate, setSelectedDate] = useState('');
//   const [availableSlots, setAvailableSlots] = useState([]);
//   const [selectedSlotIndex, setSelectedSlotIndex] = useState(null);

//   useEffect(() => {
//     const fetchSchedule = async () => {
//       try {
//         const res = await axios.get(`http://localhost:5000/api/admin/schedules/${employeeId}`);
//         console.log("Fetched schedule:", res.data);
//         setSchedule(res.data);
//       } catch (err) {
//         console.error('Error fetching schedule:', err);
//       }
//     };

//     // Reset states when employeeId changes
//     setSelectedDate('');
//     setAvailableSlots([]);
//     setSelectedSlotIndex(null);
    
//     if (employeeId) fetchSchedule();
//   }, [employeeId]);

//   // const generateSlots = (date) => {
//   //   const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
//   //   const selectedDateObj = new Date(`${date}T00:00:00`);
//   //   const selectedDayName = dayNames[selectedDateObj.getDay()];

//   //   const daySchedule = schedule.find(
//   //     s => s.day_of_week.trim().toLowerCase() === selectedDayName.toLowerCase()
//   //   );

//   //   console.log("Selected day:", selectedDayName);
//   //   console.log("Matching schedule:", daySchedule);

//   //   if (!daySchedule) {
//   //     setAvailableSlots([]);
//   //     return;
//   //   }

//   //   const start = new Date(`${date}T${daySchedule.start_time}`);
//   //   const end = new Date(`${date}T${daySchedule.end_time}`);
//   //   const slots = [];

//   //   while (start < end) {
//   //     const slotEnd = new Date(start.getTime() + 30 * 60000);
//   //     if (slotEnd > end) break;
//   //     slots.push({
//   //       start: new Date(start),
//   //       end: new Date(slotEnd)
//   //     });
//   //     start.setTime(slotEnd.getTime());
//   //   }

//   //   setAvailableSlots(slots);
//   //   setSelectedSlotIndex(null);
//   // }
//   const generateSlots = async (date) => {
//     const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
//     const selectedDateObj = new Date(`${date}T00:00:00`);
//     const selectedDayName = dayNames[selectedDateObj.getDay()];
  
//     const daySchedule = schedule.find(
//       s => s.day_of_week.trim().toLowerCase() === selectedDayName.toLowerCase()
//     );
  
//     if (!daySchedule) {
//       setAvailableSlots([]);
//       return;
//     }
  
//     const start = new Date(`${date}T${daySchedule.start_time}`);
//     const end = new Date(`${date}T${daySchedule.end_time}`);
//     const slots = [];
  
//     while (start < end) {
//       const slotEnd = new Date(start.getTime() + 30 * 60000);
//       if (slotEnd > end) break;
//       slots.push({
//         start: new Date(start),
//         end: new Date(slotEnd)
//       });
//       start.setTime(slotEnd.getTime());
//     }
  
//     //Fetch booked time slots
//     try {
//       const res = await axios.get(`http://localhost:5000/api/appointments/booked-slots`, {
//         params: { doctor_id: employeeId, date }
//       });
//       const booked = res.data; // Array of { start_time, end_time }
  
//       // Filter out any overlapping slots
//       const filtered = slots.filter(slot => {
//         return !booked.some(bookedSlot => {
//           const bookedStart = new Date(bookedSlot.start_time);
//           const bookedEnd = new Date(bookedSlot.end_time);
//           return (
//             (slot.start >= bookedStart && slot.start < bookedEnd) ||
//             (slot.end > bookedStart && slot.end <= bookedEnd)
//           );
//         });
//       });
  
//       setAvailableSlots(filtered);
//     } catch (err) {
//       console.error("Failed to fetch booked slots:", err);
//       setAvailableSlots(slots); // Fallback to all slots if error
//     }
  
//     setSelectedSlotIndex(null);
//   };
  

//   const handleDateChange = (e) => {
//     const date = e.target.value;
//     setSelectedDate(date);
//     generateSlots(date);
//   };

//   return (
//     <div className="time-slot-selector">
//       <h4>Select a Time Slot</h4>
//       <input
//         type="date"
//         value={selectedDate}
//         onChange={handleDateChange}
//         className="date-picker"
//       />

//       <ul className="slot-list">
//         {availableSlots.length > 0 ? (
//           availableSlots.map((slot, index) => (
//             <li
//               key={index}
//               onClick={() => {
//                 setSelectedSlotIndex(index);
//                 onTimeSelect({
//                   start: slot.start.toISOString(),   
//                   end: slot.end.toISOString()

//                 });
//               }}
//               className={`slot-item ${selectedSlotIndex === index ? 'selected' : ''}`}
//             >
//               {slot.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
//               {slot.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//             </li>
//           ))
//         ) : (
//           selectedDate && <p>No available slots for this date.</p>
//         )}
//       </ul>
//     </div>
//   );
// };

// export default TimeSlotSelector;
// TimeSlotSelector.js
// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import '../../../styles/TimeSlotSelector.css';

// const TimeSlotSelector = ({ employeeId, onTimeSelect }) => {
//   const [schedule, setSchedule] = useState([]);
//   const [selectedDate, setSelectedDate] = useState('');
//   const [availableSlots, setAvailableSlots] = useState([]);
//   const [selectedSlotIndex, setSelectedSlotIndex] = useState(null);

//   useEffect(() => {
//     const fetchSchedule = async () => {
//       try {
//         const res = await axios.get(`http://localhost:5000/api/admin/schedules/${employeeId}`);
//         console.log("Fetched schedule:", res.data);
//         setSchedule(res.data);
//       } catch (err) {
//         console.error('Error fetching schedule:', err);
//       }
//     };

//     // Reset states when employeeId changes
//     setSelectedDate('');
//     setAvailableSlots([]);
    
//     setSelectedSlotIndex(null);
    
//     if (employeeId) fetchSchedule();
//   }, [employeeId]);

//   const generateSlots = async (date) => {
//     const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
//     const selectedDateObj = new Date(`${date}T00:00:00`);
//     const selectedDayName = dayNames[selectedDateObj.getDay()];
  
//     const daySchedule = schedule.find(
//       s => s.day_of_week.trim().toLowerCase() === selectedDayName.toLowerCase()
//     );
  
//     if (!daySchedule) {
//       setAvailableSlots([]);
//       return;
//     }
  
//     const start = new Date(`${date}T${daySchedule.start_time}`);
//     const end = new Date(`${date}T${daySchedule.end_time}`);
//     const slots = [];
  
//     while (start < end) {
//       const slotEnd = new Date(start.getTime() + 30 * 60000);
//       if (slotEnd > end) break;
//       slots.push({
//         start: new Date(start),
//         end: new Date(slotEnd)
//       });
//       start.setTime(slotEnd.getTime());
//     }
  
//     //Fetch booked time slots
//     try {
//       const res = await axios.get(`http://localhost:5000/api/appointments/booked-slots`, {
//         params: { doctor_id: employeeId, date }
//       });
//       const booked = res.data; // Array of { start_time, end_time }
  
//       // Filter out any overlapping slots
//       const filtered = slots.filter(slot => {
//         return !booked.some(bookedSlot => {
//           const bookedStart = new Date(bookedSlot.start_time);
//           const bookedEnd = new Date(bookedSlot.end_time);
//           return (
//             (slot.start >= bookedStart && slot.start < bookedEnd) ||
//             (slot.end > bookedStart && slot.end <= bookedEnd)
//           );
//         });
//       });
//       // Extra filtering for same-day slots: remove past time slots for today


  
//       setAvailableSlots(filtered);
//     } catch (err) {
//       console.error("Failed to fetch booked slots:", err);
//       setAvailableSlots(slots); // Fallback to all slots if error
//     }
  
//     setSelectedSlotIndex(null);
//   };

//   const handleDateChange = (e) => {
//     const date = e.target.value;
//     setSelectedDate(date);
//     generateSlots(date);
//   };

//   // Helper function to format time in ISO format with timezone preservation
//   const formatTimeWithTimezone = (date) => {
//     // Format: YYYY-MM-DDTHH:MM:SS.sssZ (keeps the timezone info)
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const day = String(date.getDate()).padStart(2, '0');
//     const hours = String(date.getHours()).padStart(2, '0');
//     const minutes = String(date.getMinutes()).padStart(2, '0');
//     const seconds = String(date.getSeconds()).padStart(2, '0');
    
//     return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
//   };

//   return (
//     <div className="time-slot-selector">
//       <h4>Select a Time Slot</h4>
//       <input
//         type="date"
//         value={selectedDate}
//         onChange={handleDateChange}
//         className="date-picker"
//       />

//       <ul className="slot-list">
//         {availableSlots.length > 0 ? (
//           availableSlots.map((slot, index) => (
//             <li
//               key={index}
//               onClick={() => {
//                 setSelectedSlotIndex(index);
//                 onTimeSelect({
//                   // Use our custom function instead of toISOString()
//                   start: formatTimeWithTimezone(slot.start),
//                   end: formatTimeWithTimezone(slot.end)
//                 });
//               }}
//               className={`slot-item ${selectedSlotIndex === index ? 'selected' : ''}`}
//             >
//               {slot.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
//               {slot.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//             </li>
//           ))
//         ) : (
//           selectedDate && <p>No available slots for this date.</p>
//         )}
//       </ul>
//     </div>
//   );
// };

// export default TimeSlotSelector;
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../../styles/TimeSlotSelector.css';

const TimeSlotSelector = ({ employeeId, onTimeSelect }) => {
  const [schedule, setSchedule] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/admin/schedules/${employeeId}`);
        console.log("Fetched schedule:", res.data);
        setSchedule(res.data);
      } catch (err) {
        console.error('Error fetching schedule:', err);
      }
    };

    // Reset states when employeeId changes
    setSelectedDate('');
    setAvailableSlots([]);
    setSelectedSlotIndex(null);
    
    if (employeeId) fetchSchedule();
  }, [employeeId]);

  const generateSlots = async (date) => {
    // Get today's date in local timezone, but with time set to midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Convert selected date string to local date object with time set to midnight
    const [year, month, day] = date.split('-').map(num => parseInt(num, 10));
    const selectedDateObj = new Date(year, month - 1, day, 0, 0, 0, 0);
    
    console.log("Today (midnight):", today);
    console.log("Selected date:", selectedDateObj);
    console.log("Is selected date today?", selectedDateObj.getTime() === today.getTime());
    
    // Only block if the selected date is today
    if (selectedDateObj.getTime() === today.getTime()) {
      console.log("Blocking slots because date is today");
      setAvailableSlots([]);
      return;
    }
    
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const selectedDayName = dayNames[selectedDateObj.getDay()];
  
    const daySchedule = schedule.find(
      s => s.day_of_week.trim().toLowerCase() === selectedDayName.toLowerCase()
    );
  
    if (!daySchedule) {
      setAvailableSlots([]);
      return;
    }
  
    const start = new Date(`${date}T${daySchedule.start_time}`);
    const end = new Date(`${date}T${daySchedule.end_time}`);
    const slots = [];
  
    while (start < end) {
      const slotEnd = new Date(start.getTime() + 30 * 60000);
      if (slotEnd > end) break;
      slots.push({
        start: new Date(start),
        end: new Date(slotEnd)
      });
      start.setTime(slotEnd.getTime());
    }
  
    //Fetch booked time slots
    try {
      const res = await axios.get(`http://localhost:5000/api/appointments/booked-slots`, {
        params: { doctor_id: employeeId, date }
      });
      const booked = res.data; // Array of { start_time, end_time }
  
      // Filter out any overlapping slots
      const filtered = slots.filter(slot => {
        return !booked.some(bookedSlot => {
          const bookedStart = new Date(bookedSlot.start_time);
          const bookedEnd = new Date(bookedSlot.end_time);
          return (
            (slot.start >= bookedStart && slot.start < bookedEnd) ||
            (slot.end > bookedStart && slot.end <= bookedEnd)
          );
        });
      });
  
      setAvailableSlots(filtered);
    } catch (err) {
      console.error("Failed to fetch booked slots:", err);
      setAvailableSlots(slots); // Fallback to all slots if error
    }
  
    setSelectedSlotIndex(null);
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    generateSlots(date);
  };

  // Helper function to format time in ISO format with timezone preservation
  const formatTimeWithTimezone = (date) => {
    // Format: YYYY-MM-DDTHH:MM:SS.sssZ (keeps the timezone info)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };

  // Get today's date as a string in YYYY-MM-DD format
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];

  return (
    <div className="time-slot-selector">
      <h4>Select a Time Slot</h4>
      <input
        type="date"
        value={selectedDate}
        onChange={handleDateChange}
        min={todayString} // Allow from today onwards, but don't show slots for today
        className="date-picker"
      />

      <ul className="slot-list">
        {availableSlots.length > 0 ? (
          availableSlots.map((slot, index) => (
            <li
              key={index}
              onClick={() => {
                setSelectedSlotIndex(index);
                onTimeSelect({
                  // Use our custom function instead of toISOString()
                  start: formatTimeWithTimezone(slot.start),
                  end: formatTimeWithTimezone(slot.end)
                });
              }}
              className={`slot-item ${selectedSlotIndex === index ? 'selected' : ''}`}
            >
              {slot.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
              {slot.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </li>
          ))
        ) : (
          selectedDate && <p>No available slots for this date.</p>
        )}
      </ul>
    </div>
  );
};

export default TimeSlotSelector;