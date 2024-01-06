"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import iCalendarPlugin from "@fullcalendar/icalendar";

// https://fullcalendar.io/docs#toc

export default function Page() {
  return (
    <>
      <div
        className="flex justify-center items-center w-full h-full px-48 absolute"
        style={{
          backgroundImage: "url('/annapurna-massif.jpg')",
          backgroundSize: "cover",
        }}
      >
        <div className="bg-slate-200 rounded-lg p-10">
          <FullCalendar
            plugins={[dayGridPlugin, iCalendarPlugin]}
            events={{
              url: process.env.ICS_URL,
              format: "ics",
            }}
            initialView="dayGridMonth"
            height="auto"
            aspectRatio={2}
            firstDay={1}
          />
        </div>
      </div>
    </>
  );
}
