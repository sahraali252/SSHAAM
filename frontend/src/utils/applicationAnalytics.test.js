import { describe, expect, it } from "vitest";
import { summarizeApplications } from "./applicationAnalytics";

describe("application analytics", () => {
  it("returns zero counts and no activity for an empty history", () => {
    expect(summarizeApplications([])).toEqual({ total: 0,
      statuses: { Applied: 0, "Under Review": 0, Interview: 0, Offered: 0, Rejected: 0 }, activity: [] });
  });

  it("counts every existing status without treating under review as applied", () => {
    const statuses = ["Applied", "Applied", "Under Review", "Interview", "Offered", "Rejected"];
    const result = summarizeApplications(statuses.map(status => ({ status, applied_at: "2026-01-15T12:00:00" })));
    expect(result.total).toBe(6);
    expect(result.statuses).toEqual({ Applied: 2, "Under Review": 1, Interview: 1, Offered: 1, Rejected: 1 });
    expect(result.activity).toEqual([{ month: "2026-01", count: 6 }]);
  });

  it("sorts monthly activity, fills gaps across years and normalizes dates to UTC", () => {
    const result = summarizeApplications([
      { status: "Interview", applied_at: "2026-02-01T00:30:00+02:00" },
      { status: "Applied", applied_at: "2025-11-30T23:00:00" },
      { status: "Rejected", applied_at: "2026-01-15T12:00:00Z" },
    ]);
    expect(result.activity).toEqual([
      { month: "2025-11", count: 1 }, { month: "2025-12", count: 0 }, { month: "2026-01", count: 2 },
    ]);
  });

  it("keeps undated applications in totals without inventing activity dates", () => {
    const result = summarizeApplications([
      { status: "Applied", applied_at: null }, { status: "Rejected", applied_at: "invalid" },
    ]);
    expect(result.total).toBe(2);
    expect(result.statuses.Rejected).toBe(1);
    expect(result.activity).toEqual([]);
  });
});
