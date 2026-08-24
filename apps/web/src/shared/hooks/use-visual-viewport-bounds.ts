import { useEffect, useState } from "react";

export interface VisualViewportBounds {
  height: number;
  offsetTop: number;
}

export function useVisualViewportBounds(active = true): VisualViewportBounds {
  const [bounds, setBounds] = useState(readVisualViewportBounds);

  // Synchronize layout bounds with the browser's visual viewport.
  useEffect(() => {
    if (!active) return;

    const updateBounds = () => setBounds(readVisualViewportBounds());

    updateBounds();
    window.addEventListener("resize", updateBounds);
    window.visualViewport?.addEventListener("resize", updateBounds);
    window.visualViewport?.addEventListener("scroll", updateBounds);

    return () => {
      window.removeEventListener("resize", updateBounds);
      window.visualViewport?.removeEventListener("resize", updateBounds);
      window.visualViewport?.removeEventListener("scroll", updateBounds);
    };
  }, [active]);

  return bounds;
}

function readVisualViewportBounds(): VisualViewportBounds {
  return {
    height: window.visualViewport?.height ?? window.innerHeight,
    offsetTop: window.visualViewport?.offsetTop ?? 0,
  };
}
