import type { ReactNode } from "react";

export default function GlowingFrame({
  children,
  className = "",
  tone = "dark",
}: {
  children: ReactNode;
  className?: string;
  tone?: "dark" | "light";
}) {
  return (
    <div className={`glow-frame glow-frame-${tone} ${className}`}>
      <div className="glow-frame__content">{children}</div>
    </div>
  );
}
