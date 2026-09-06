import { describe, expect, it } from "vitest";
import {
  COOKIE_NAME,
  OAUTH_STATE_COOKIE,
  decodeOAuthState,
  encodeOAuthState,
} from "./const";

describe("oauth state", () => {
  it("round-trips redirectUri and nonce", () => {
    const state = encodeOAuthState({
      redirectUri: "https://x.test/cb",
      nonce: "abc-123",
    });
    expect(decodeOAuthState(state)).toEqual({
      redirectUri: "https://x.test/cb",
      nonce: "abc-123",
    });
  });

  it("never throws on malformed base64 (returns no nonce so CSRF guard rejects)", () => {
    const decoded = decodeOAuthState("!!!not-base64!!!");
    expect(decoded.redirectUri).toBe("");
    expect(decoded.nonce).toBeUndefined();
  });

  it("returns no nonce for garbage JSON (callback must reject with 403)", () => {
    const forged = Buffer.from('{"redirectUri":"https://evil.test"}').toString(
      "base64"
    );
    const decoded = decodeOAuthState(forged);
    expect(decoded.redirectUri).toBe("https://evil.test");
    expect(decoded.nonce).toBeUndefined();
  });

  it("still accepts legacy bare base64 redirect URIs", () => {
    const legacy = Buffer.from("https://old.test/cb").toString("base64");
    expect(decodeOAuthState(legacy).redirectUri).toBe("https://old.test/cb");
  });
});

describe("cookie constants", () => {
  it("uses the __Host- prefix for the oauth state cookie (host-only, secure)", () => {
    expect(OAUTH_STATE_COOKIE.startsWith("__Host-")).toBe(true);
    expect(COOKIE_NAME).toBe("app_session_id");
  });
});
