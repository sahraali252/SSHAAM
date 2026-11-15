import { expect, it } from "vitest";
import { deadlineInputValue, parseApiDate } from "./dates";

it("treats SQLite timestamps as UTC and respects explicit offsets", () => {
  expect(parseApiDate("2026-11-15T15:00:00").toISOString()).toBe("2026-11-15T15:00:00.000Z");
  expect(parseApiDate("2026-11-15T10:00:00-05:00").toISOString()).toBe("2026-11-15T15:00:00.000Z");
  expect(parseApiDate("2026-11-15T15:00:00Z").toISOString()).toBe("2026-11-15T15:00:00.000Z");
});

it("converts dates for local deadline inputs and tolerates absent dates", () => {
  const input = deadlineInputValue("2026-11-15T15:00:00Z");
  expect(new Date(input).toISOString()).toBe("2026-11-15T15:00:00.000Z");
  expect(deadlineInputValue(null)).toBe("");
  expect(parseApiDate("not-a-date")).toBeNull();
});
