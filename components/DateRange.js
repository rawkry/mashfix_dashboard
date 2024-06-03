import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { DateRangePicker } from "react-date-range";
import React, { useEffect, useState } from "react";
import { IsoDateString } from "@/helpers/clients";

export default function DateRange({ setDates, dates }) {
  const maxDateRange = parseInt(process.env.NEXT_PUBLIC_MAX_DATE_RANGE);

  const [selectedRange, setSelectedRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const handleDateRangeChange = (ranges) => {
    const startDate = ranges.selection.startDate;
    const endDate = ranges.selection.endDate;
    const currentDate = new Date();

    if (startDate > currentDate) {
      ranges.selection.startDate = currentDate;
    }

    const preferedDate = new Date(startDate);

    preferedDate.setDate(preferedDate.getDate() + maxDateRange - 1);

    if (endDate > preferedDate) {
      ranges.selection.endDate = preferedDate;
    }

    setSelectedRange([ranges.selection]);
    setDates({
      from_date: ranges.selection.startDate,
      to_date: ranges.selection.endDate,
    });
  };

  return (
    <DateRangePicker
      className="date-range"
      showDateDisplay={true}
      moveRangeOnFirstSelection={true}
      months={2}
      maxDate={new Date()}
      ranges={selectedRange}
      onChange={handleDateRangeChange}
    />
  );
}
