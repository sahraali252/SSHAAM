import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { expect, it, vi } from "vitest";
import JobSearch from "./JobSearch";
import RecruiterDashboard from "./RecruiterDashboard";

vi.mock("../components/NotificationCenter", () => ({ default: () => <button>Notifications</button> }));

const direct = { id: "job-7", title: "Direct developer", company_name: "Local team", location: "Toronto",
  employment_type: "Full-time", description: "Build local products", deadline: null, status: "active" };
const external = { guid: "external-7", title: "External designer", companyName: "Remote team",
  locationRestrictions: ["Remote"], employmentType: "Contract", excerpt: "Design products", description: "<p>External details</p>" };

function mockJobFeeds() {
  vi.stubGlobal("fetch", vi.fn(async (url) => {
    if (url.includes("/job-postings/")) return new Response(JSON.stringify([direct]));
    return new Response(JSON.stringify({ jobs: [external] }));
  }));
}

function CurrentUrl() {
  const location = useLocation();
  return <p data-testid="url">{location.pathname}{location.search}</p>;
}

function openJobs(entry) {
  mockJobFeeds();
  return render(<MemoryRouter initialEntries={[entry]}>
    <Routes><Route path="/jobs" element={<><JobSearch /><CurrentUrl /></>} /></Routes>
  </MemoryRouter>);
}

it("opens the shared recruiter posting's details from /jobs?posting=<id>", async () => {
  openJobs("/jobs?posting=job-7");
  expect(await screen.findByRole("heading", { name: direct.title, level: 1 })).toBeTruthy();
  expect(screen.getByText(direct.description)).toBeTruthy();
  expect(screen.getByRole("button", { name: "Apply for this job" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Share" })).toBeTruthy();

  fireEvent.click(screen.getByRole("button", { name: /Back to jobs/ }));
  expect(await screen.findByText("2 jobs found")).toBeTruthy();
  expect(screen.getByTestId("url").textContent).toBe("/jobs");
});

it("shows that a shared job is no longer available when the id is unknown", async () => {
  openJobs("/jobs?posting=archived-or-deleted");
  expect(await screen.findByText("This job is no longer available.")).toBeTruthy();
  expect(await screen.findByText("2 jobs found")).toBeTruthy();
  expect(screen.queryByRole("heading", { level: 1, name: direct.title })).toBeNull();
});

it("does not open external listings from a shared link or offer to share them", async () => {
  openJobs("/jobs?posting=external-7");
  expect(await screen.findByText("This job is no longer available.")).toBeTruthy();
  const card = (await screen.findByRole("heading", { name: external.title })).parentElement;
  fireEvent.click(within(card).getByRole("button", { name: "View Details" }));
  expect(screen.getByText("External details")).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Share" })).toBeNull();
});

it("lets recruiters share active postings only", async () => {
  localStorage.setItem("access_token", "recruiter-token");
  localStorage.setItem("user_role", "recruiter");
  const postings = [
    { ...direct, id: "active-1", title: "Active role", application_count: 0 },
    { ...direct, id: "archived-1", title: "Archived role", status: "archived", application_count: 2 },
  ];
  vi.stubGlobal("fetch", vi.fn(async (url) =>
    new Response(JSON.stringify(url.endsWith("/unread-count") ? { unread_count: 0 } : postings))));
  render(<MemoryRouter><RecruiterDashboard /></MemoryRouter>);
  await screen.findByRole("heading", { name: "Active role" });
  fireEvent.click(screen.getByRole("button", { name: "All" })); // the default filter hides archived postings

  const active = screen.getByRole("heading", { name: "Active role" }).closest("article");
  const archived = screen.getByRole("heading", { name: "Archived role" }).closest("article");
  expect(within(active).getByRole("button", { name: "Share" })).toBeTruthy();
  expect(within(archived).queryByRole("button", { name: "Share" })).toBeNull();

  fireEvent.click(within(active).getByRole("button", { name: "Share" }));
  expect(within(active).getByRole("menuitem", { name: "LinkedIn" }).getAttribute("href"))
    .toContain(encodeURIComponent(`${window.location.origin}/jobs?posting=active-1`));
});
