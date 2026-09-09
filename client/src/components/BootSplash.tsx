import { useEffect, useState } from "react";

export default function BootSplash() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setVisible(false);
      return;
    }

    const timer = window.setTimeout(() => setVisible(false), 1150);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="boot-splash" role="status" aria-label="ARQA HOUSE загружается">
      <div className="boot-splash__glow" aria-hidden="true" />
      <div className="boot-brand" aria-hidden="true">
        <span className="boot-brand__mark">A</span>
        <span className="boot-brand__name">ARQA HOUSE</span>
        <span className="boot-brand__caption">дома под ключ · алматы</span>
      </div>
      <div className="boot-progress" aria-hidden="true"><span /></div>
    </div>
  );
}
