import { useEffect, useState } from "react";

export function useIsMobile() {
  const getIsMobile = () => (typeof window !== "undefined" ? window.innerWidth < 640 : false);

  const [isMobile, setIsMobile] = useState<boolean>(getIsMobile());

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
}
