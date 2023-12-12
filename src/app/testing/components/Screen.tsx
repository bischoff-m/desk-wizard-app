import { forwardRef } from "react";
import { type Screen } from "../types";

// export default function ScreenWrapper({ ...props}: { screen: Screen, children?: React.ReactNode}) {
const ScreenWrapper = forwardRef<
  HTMLDivElement,
  { screen: Screen; children?: React.ReactNode }
>(function ScreenWrapper(props, ref) {
  const { screen } = props;
  return (
    <div
      className="absolute"
      style={{
        left: screen.pageSize.topLeft.x,
        top: screen.pageSize.topLeft.y,
        width: screen.pageSize.w,
        height: screen.pageSize.h,
        backgroundImage: "url('/annapurna-massif.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <main className="flex flex-row justify-center items-center h-full w-full">
        {props.children}
      </main>
    </div>
  );
});

export default ScreenWrapper;
