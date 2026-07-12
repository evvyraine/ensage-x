import { describe, expect, it } from "vitest"
import { createShareInput } from "../lib/validation/share"

describe("share request validation", () => {
  it("preserves meaningful text whitespace", () => {
    const value = createShareInput.parse({
      share: { kind: "text", content: "  code\n" },
    })
    expect(value.share.kind === "text" && value.share.content).toBe("  code\n")
  })
  it("rejects unsafe link protocols", () => {
    expect(() =>
      createShareInput.parse({
        share: { kind: "link", url: "file:///etc/passwd" },
      })
    ).toThrow()
  })
  it("rejects unknown expiration values", () => {
    expect(() =>
      createShareInput.parse({
        share: { kind: "text", content: "x" },
        expiresInHours: 0,
      })
    ).toThrow()
  })
})
