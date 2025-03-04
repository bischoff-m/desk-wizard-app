import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import iCalendarPlugin from "@fullcalendar/icalendar";
import WidgetView from "@/app/(wallpaper)/WidgetView";
import { useEffect, useRef } from "react";

// https://fullcalendar.io/docs#toc

// TODO: Use https://www.npmjs.com/package/@googleapis/calendar to fetch events from
// Google Calendar

interface WindowSize {
  x: number;
  y: number;
  width: number;
  height: number | null;
}

const INITIAL_WINDOW_SIZE: WindowSize = {
  x: 400,
  y: 600,
  width: 1200,
  height: 720,
};

export default function CalendarWidget() {
  const calendarRef = useRef<FullCalendar | null>(null);

  useEffect(() => {
    if (!calendarRef.current) return;

    const calendar = calendarRef.current.getApi();
    calendar.addEventSource({
      url: "/basic.local.ics",
      format: "ics",
      color: "#6e7ab6",
    });
    calendar.addEventSource({
      url: "/uni.local.ics",
      format: "ics",
      color: "#f4511e",
    });
    calendar.addEventSource({
      url: "/work.local.ics",
      format: "ics",
      color: "#8f609e",
    });
  }, [calendarRef.current]);

  return (
    <WidgetView
      default={INITIAL_WINDOW_SIZE}
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onResizeStop={(_e, _direction, _ref, delta, _position) => {
        if (!calendarRef.current) return;

        const calendar = calendarRef.current.getApi();
        const heightBefore = calendar.getOption("height");
        if (typeof heightBefore === "number")
          calendar.setOption("height", heightBefore + delta.height);

        calendarRef.current.requestResize();
      }}
    >
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, iCalendarPlugin]}
        initialView="dayGridMonth"
        firstDay={1}
        height="100%"
        eventTimeFormat={{
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }}
      />
    </WidgetView>
  );
}
