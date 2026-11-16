import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { expect, it, vi } from "vitest";
import ApplicationTracking from "./ApplicationTracking";

function renderHistory(data = [], status = 200) {
  localStorage.setItem("access_token", "seeker-token");
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(data), { status })));
  return render(<MemoryRouter><ApplicationTracking /></MemoryRouter>);
}

it("US-11 acceptance: shows history, status counts and submission activity together", async () => {
  localStorage.setItem("careerconnect_job_details", JSON.stringify({
    developer: { title: "Developer", company: "CareerConnect", location: "Montreal" },
  }));
  renderHistory([
    { id: 3, job_id: "developer", status: "Interview", applied_at: "2026-03-02T12:00:00Z" },
    { id: 2, job_id: "external", status: "Rejected", applied_at: "2026-01-20T12:00:00Z" },
    { id: 1, job_id: "intern", status: "Applied", applied_at: "2026-01-01T12:00:00Z" },
  ]);
  await screen.findByRole("heading", { name: "Application Analytics and History" });
  expect(screen.getByText("Total applications:").textContent).toContain("3");
  const summary = screen.getByRole("region", { name: "Application Analytics and History" });
  for (const [status, count] of [["Pending (Applied)", "1"], ["Interview", "1"], ["Rejected", "1"], ["Offered", "0"], ["Under Review", "0"]]) {
    expect(within(summary).getByText(status).nextElementSibling.textContent).toBe(count);
  }
  const rows = within(screen.getByRole("table", { name: "Applications submitted by month" })).getAllByRole("row");
  expect(rows.slice(1).map(row => [...row.cells].map(cell => cell.textContent))).toEqual([
    ["2026-01", "2"], ["2026-02", "0"], ["2026-03", "1"],
  ]);
  expect(screen.getByRole("heading", { name: "Developer" })).toBeTruthy();
  expect(screen.getByText("CareerConnect", { selector: "p" })).toBeTruthy();
  expect(screen.getAllByText(/Application ID:/)).toHaveLength(3);
  expect(screen.getAllByText(/Applied on:/)).toHaveLength(3);
  expect(screen.getByRole("link", { name: "Dashboard" }).getAttribute("href")).toBe("/dashboard");
  expect(fetch).toHaveBeenCalledWith("http://127.0.0.1:8000/applications/my-applications",
    expect.objectContaining({ headers: { Authorization: "Bearer seeker-token" } }));
});

it("shows zero analytics and the existing empty-history message", async () => {
  renderHistory();
  await screen.findByText("You have not applied for any jobs yet.");
  expect(screen.getByText("Total applications:").textContent).toContain("0");
  expect(screen.getByText("No application activity yet.")).toBeTruthy();
  expect(screen.queryByRole("table")).toBeNull();
});

it("shows loading without premature zero metrics", () => {
  localStorage.setItem("access_token", "seeker-token");
  vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
  const view = render(<MemoryRouter><ApplicationTracking /></MemoryRouter>);
  expect(screen.getByText("Loading applications...")).toBeTruthy();
  expect(screen.queryByText("Total applications:")).toBeNull();
  const signal = fetch.mock.calls[0][1].signal;
  view.unmount();
  expect(signal.aborted).toBe(true);
});

it("requires login without requesting application data", async () => {
  vi.stubGlobal("fetch", vi.fn());
  render(<MemoryRouter><ApplicationTracking /></MemoryRouter>);
  expect((await screen.findByRole("alert")).textContent).toBe("Please log in to view your applications.");
  expect(fetch).not.toHaveBeenCalled();
});

it.each([
  [401, [], "Your session has expired. Please log in again."],
  [403, [], "Your session has expired. Please log in again."],
  [500, [], "Unable to load applications. Please try again."],
  [200, {}, "Unexpected response from the server."],
])("handles an unsuccessful history response (%s)", async (status, data, message) => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  renderHistory(data, status);
  expect((await screen.findByRole("alert")).textContent).toBe(message);
  expect(screen.queryByText("Total applications:")).toBeNull();
});
