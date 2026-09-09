import { useEffect, useState } from "react";

export default function BootSplash() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) {
      setVisible(false);
      return;
    }

    const timer = window.setTimeout(() => setVisible(false), 1150);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="boot-splash"
      role="status"
      aria-label="ARQA HOUSE загружается"
    >
      <div className="boot-splash__glow" aria-hidden="true" />
      <div className="boot-brand" aria-hidden="true">
        <img
          src="/images/arqa-house-logo.jpg"
          alt=""
          className="boot-brand__logo"
        />
      </div>
      <div className="boot-progress" aria-hidden="true">
        <span />
      </div>
    </div>
  );
}
