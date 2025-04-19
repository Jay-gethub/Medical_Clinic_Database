// TimeSlotSelector.js
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

  const generateSlots = (date) => {
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const selectedDateObj = new Date(`${date}T00:00:00`);
    const selectedDayName = dayNames[selectedDateObj.getDay()];

    const daySchedule = schedule.find(
      s => s.day_of_week.trim().toLowerCase() === selectedDayName.toLowerCase()
    );

    console.log("Selected day:", selectedDayName);
    console.log("Matching schedule:", daySchedule);

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

    setAvailableSlots(slots);
    setSelectedSlotIndex(null);
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    generateSlots(date);
  };

  return (
    <div className="time-slot-selector">
      <h4>Select a Time Slot</h4>
      <input
        type="date"
        value={selectedDate}
        onChange={handleDateChange}
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
                  start: slot.start.toISOString(),
                  end: slot.end.toISOString(),
                  timezoneOffset: slot.start.getTimezoneOffset() // Minutes difference from UTC
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