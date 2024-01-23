import { type Screen } from "../types";

export default function ScreenWrapper(props: {
  screen: Screen;
  children?: React.ReactNode;
}) {
  const { screen, children } = props;
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
      <main className="screen-wrapper-main flex flex-row justify-center items-center h-full w-full">
        {children}
      </main>
    </div>
  );
}
