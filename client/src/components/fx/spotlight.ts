/**
 * Spotlight card (beam.jakubantalik / reactbits style): a soft radial glow
 * follows the cursor across the card surface via CSS custom properties.
 */
export function spotlightHandlers() {
  return {
    onMouseMove: (event: React.MouseEvent<HTMLElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      event.currentTarget.style.setProperty(
        "--spotlight-x",
        `${event.clientX - rect.left}px`
      );
      event.currentTarget.style.setProperty(
        "--spotlight-y",
        `${event.clientY - rect.top}px`
      );
    },
  };
}
