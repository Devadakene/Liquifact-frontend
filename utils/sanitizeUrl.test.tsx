import { sanitize } from "./sanitizeUrl";

describe("sanitize", () => {
  it("returns empty string for null input", () => {
    expect(sanitize(null)).toBe("");
  });

  it("returns empty string for empty string", () => {
    expect(sanitize("")).toBe("");
  });

  it("returns plain alphanumeric string as-is", () => {
    expect(sanitize("hello123")).toBe("hello123");
  });

  it("preserves allowed chars: space, hyphen, underscore, comma, period", () => {
    expect(sanitize("hello world, foo-bar_baz.qux")).toBe("hello world, foo-bar_baz.qux");
  });

  it("strips disallowed chars: < > \" ' & ( )", () => {
    expect(sanitize("<>\"'&()")).toBe("");
  });

  it("decodes percent-encoded safe chars", () => {
    expect(sanitize("hello%20world")).toBe("hello world");
    expect(sanitize("a%2Cb")).toBe("a,b");
  });

  it("decodes then strips percent-encoded unsafe chars", () => {
    // %3C decodes to '<', which is then stripped
    expect(sanitize("%3Cscript%3E")).toBe("script");
  });

  it("falls back to stripping directly on malformed percent-encoding", () => {
    // %ZZ is invalid — decodeURIComponent throws, catch branch strips directly
    expect(sanitize("%ZZ")).toBe("ZZ");
  });

  it("strips XSS payload", () => {
    expect(sanitize("<script>alert(1)</script>")).toBe("scriptalert1script");
  });

  it("handles combined encoded and unsafe chars", () => {
    expect(sanitize("hello%20%3Cworld%3E")).toBe("hello world");
  });
});
