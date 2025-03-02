export default function WindowRoot(props: { children?: React.ReactNode }) {
  return (
    <div
      id="desk-window-root"
      className="absolute overflow-hidden"
      style={{ width: "100vw", height: "100vh" }}
    >
      {props.children}
    </div>
  );
}
