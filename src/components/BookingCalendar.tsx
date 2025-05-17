import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { getBookedDateRanges } from '../db/bookingService';

interface BookingCalendarProps {
  propertyId: number;
  onDateRangeSelect: (startDate: Date | null, endDate: Date | null) => void;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({ propertyId, onDateRangeSelect }) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [bookedDates, setBookedDates] = useState<{start: Date, end: Date}[]>([]);
  
  useEffect(() => {
    const fetchBookedDates = async () => {
      const dates = await getBookedDateRanges(propertyId);
      setBookedDates(dates);
    };
    
    fetchBookedDates();
  }, [propertyId]);
  
  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date);
    if (date && endDate && date > endDate) {
      setEndDate(null);
    }
    onDateRangeSelect(date, endDate);
  };
  
  const handleEndDateChange = (date: Date | null) => {
    setEndDate(date);
    onDateRangeSelect(startDate, date);
  };
  
  // Function to check if a date is booked
  const isDateBooked = (date: Date) => {
    return bookedDates.some(range => 
      date >= range.start && date <= range.end
    );
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-gray-700 mb-2">Check-in Date</label>
        <DatePicker
          selected={startDate}
          onChange={handleStartDateChange}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          minDate={new Date()}
          excludeDates={bookedDates.flatMap(range => {
            // Generate array of dates between start and end
            const dates = [];
            let currentDate = new Date(range.start);
            while (currentDate <= range.end) {
              dates.push(new Date(currentDate));
              currentDate.setDate(currentDate.getDate() + 1);
            }
            return dates;
          })}
          className="w-full px-3 py-2 border rounded-lg"
          placeholderText="Select check-in date"
        />
      </div>
      <div>
        <label className="block text-gray-700 mb-2">Check-out Date</label>
        <DatePicker
          selected={endDate}
          onChange={handleEndDateChange}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate || new Date()}
          excludeDates={bookedDates.flatMap(range => {
            const dates = [];
            let currentDate = new Date(range.start);
            while (currentDate <= range.end) {
              dates.push(new Date(currentDate));
              currentDate.setDate(currentDate.getDate() + 1);
            }
            return dates;
          })}
          className="w-full px-3 py-2 border rounded-lg"
          placeholderText="Select check-out date"
          disabled={!startDate}
        />
      </div>
    </div>
  );
};

export default BookingCalendar;