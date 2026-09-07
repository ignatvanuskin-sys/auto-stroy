import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("joins truthy class names and skips falsy ones", () => {
    expect(cn("a", false && "b", undefined, "c")).toBe("a c");
  });

  it("resolves tailwind conflicts by keeping the last utility", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("flattens conditional objects", () => {
    expect(cn({ hidden: false, visible: true })).toBe("visible");
  });
});
