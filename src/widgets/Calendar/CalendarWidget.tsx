import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import iCalendarPlugin from "@fullcalendar/icalendar";
import DeskWindow from "@/app/(wallpaper)/DeskWindow";
import { useRef } from "react";

// https://fullcalendar.io/docs#toc

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
                events={{
                    url: "/basic.local.ics",
                    format: "ics",
                }}
                initialView="dayGridMonth"
                firstDay={1}
                height="100%"
            />
        </DeskWindow>
    );
}
