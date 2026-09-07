export function getStaggerDelay(index: number, step = 60, max = 360) {
  return `${Math.min(Math.max(index, 0) * step, max)}ms`;
}

export function getRevealClass(index: number) {
  return `motion-reveal motion-reveal--${Math.min(Math.max(index, 0), 5)}`;
}

export function supportsMotion() {
  return (
    typeof window === "undefined" ||
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
