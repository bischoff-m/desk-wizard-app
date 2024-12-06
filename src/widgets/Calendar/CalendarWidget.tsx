import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import iCalendarPlugin from "@fullcalendar/icalendar";
import DeskWindow from "@/app/(wallpaper)/DeskWindow";
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

interface CalendarWidgetProps {}

const INITIAL_WINDOW_SIZE: WindowSize = {
    x: 400,
    y: 600,
    width: 1200,
    height: 720,
};

export default function CalendarWidget({}: CalendarWidgetProps) {
    const calendarRef = useRef<FullCalendar | null>(null);

    useEffect(() => {
        if (!calendarRef.current) return;

        const calendar = calendarRef.current.getApi();
        const source = calendar.addEventSource({
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
        console.log(source);
    }, [calendarRef.current]);

    return (
        <DeskWindow
            default={INITIAL_WINDOW_SIZE}
            onResizeStop={(e, direction, ref, delta, position) => {
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
        </DeskWindow>
    );
}
