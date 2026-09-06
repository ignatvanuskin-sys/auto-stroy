import { describe, expect, it } from "vitest";
import { getRevealClass, getStaggerDelay } from "./motion";

describe("motion utilities", () => {
  it("caps stagger delays and normalizes negative indexes", () => {
    expect(getStaggerDelay(-2)).toBe("0ms");
    expect(getStaggerDelay(2)).toBe("120ms");
    expect(getStaggerDelay(99)).toBe("360ms");
  });

  it("keeps reveal classes within the supported animation range", () => {
    expect(getRevealClass(-1)).toBe("motion-reveal motion-reveal--0");
    expect(getRevealClass(3)).toBe("motion-reveal motion-reveal--3");
    expect(getRevealClass(99)).toBe("motion-reveal motion-reveal--5");
  });
});
