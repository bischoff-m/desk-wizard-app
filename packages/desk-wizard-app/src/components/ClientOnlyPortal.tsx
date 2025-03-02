// Reference:
// https://github.com/vercel/next.js/blob/canary/examples/with-portals/components/ClientOnlyPortal.js

import { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ClientOnlyPortalProps {
  children: React.ReactNode;
  selector: string;
}

export default function ClientOnlyPortal({ children, selector }: ClientOnlyPortalProps) {
  const ref = useRef<Element | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const parent = document.querySelector(selector);
    if (!parent) return;
    ref.current = parent;
    setMounted(true);
  }, [selector]);

  return mounted && ref.current ? createPortal(children, ref.current) : null;
}
