import { useLocation } from "wouter";

/**
 * Page transition (transitions.dev style): remounts routed content on every
 * location change so the CSS enter animation (fade + lift) replays.
 */
export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const [location] = useLocation();
  return (
    <div key={location} className="page-enter">
      {children}
    </div>
  );
}
