import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { expect, it, vi } from "vitest";
import JobSearch from "./JobSearch";
import RecruiterDashboard from "./RecruiterDashboard";

vi.mock("../components/NotificationCenter", () => ({ default: () => <button>Notifications</button> }));

const direct = { id: "job-7", title: "Direct developer", company_name: "Local team", location: "Toronto",
  employment_type: "Full-time", description: "Build local products", deadline: null, status: "active" };
// No usable himalayas.app URL: guid is not a link and there is no applicationLink.
const external = { guid: "external-7", title: "External designer", companyName: "Remote team",
  locationRestrictions: ["Remote"], employmentType: "Contract", excerpt: "Design products", description: "<p>External details</p>" };
const himalayasPage = "https://himalayas.app/companies/acme/jobs/remote-react-developer";
const himalayas = { guid: himalayasPage, applicationLink: `${himalayasPage}?utm_source=api`, title: "Remote React developer",
  companyName: "Acme", locationRestrictions: ["Canada"], employmentType: "Full Time", excerpt: "React work",
  description: "<p>Himalayas details</p>" };

function mockJobFeeds(externalJobs = [external]) {
  vi.stubGlobal("fetch", vi.fn(async (url) => {
    if (url.includes("/job-postings/")) return new Response(JSON.stringify([direct]));
    return new Response(JSON.stringify({ jobs: externalJobs }));
  }));
}

function CurrentUrl() {
  const location = useLocation();
  return <p data-testid="url">{location.pathname}{location.search}</p>;
}

function openJobs(entry, externalJobs) {
  mockJobFeeds(externalJobs);
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

it("does not open external listings from ?posting= and hides Share when they have no himalayas.app URL", async () => {
  openJobs("/jobs?posting=external-7");
  expect(await screen.findByText("This job is no longer available.")).toBeTruthy();
  const card = (await screen.findByRole("heading", { name: external.title })).parentElement;
  fireEvent.click(within(card).getByRole("button", { name: "View Details" }));
  expect(screen.getByText("External details")).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Share" })).toBeNull();
});

it("hides Share on an external job card without a usable URL", async () => {
  openJobs("/jobs");
  const card = (await screen.findByRole("heading", { name: external.title })).closest(".job-card");
  expect(within(card).queryByRole("button", { name: "Share" })).toBeNull();
});

it("shares a Himalayas job with its himalayas.app URL, not the ?posting= link", async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
  openJobs("/jobs", [himalayas]);
  const card = (await screen.findByRole("heading", { name: himalayas.title })).closest(".job-card");
  fireEvent.click(within(card).getByRole("button", { name: "View Details" }));
  expect(screen.getByText("Himalayas details")).toBeTruthy();

  fireEvent.click(screen.getByRole("button", { name: "Share" }));
  const linkedIn = screen.getByRole("menuitem", { name: "LinkedIn" }).getAttribute("href");
  const email = screen.getByRole("menuitem", { name: "Email" }).getAttribute("href");
  expect(linkedIn).toBe(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(himalayasPage)}`);
  expect(email).toContain(encodeURIComponent(himalayasPage));
  expect(decodeURIComponent(email)).toContain("Company: Acme");
  expect(decodeURIComponent(email)).toContain("Location: Canada");
  for (const href of [linkedIn, email]) {
    expect(decodeURIComponent(href)).not.toContain("?posting=");
    expect(decodeURIComponent(href)).not.toContain("utm_source");
  }

  await act(async () => {
    fireEvent.click(screen.getByRole("menuitem", { name: "Copy link" }));
  });
  expect(writeText).toHaveBeenCalledWith(himalayasPage);
  expect(screen.getByRole("status").textContent).toBe("Link copied!");
});

it("keeps the ?posting= link for recruiter postings next to Himalayas jobs in the list", async () => {
  openJobs("/jobs", [himalayas]);
  const directCard = (await screen.findByRole("heading", { name: direct.title })).closest(".job-card");
  const himalayasCard = screen.getByRole("heading", { name: himalayas.title }).closest(".job-card");

  fireEvent.click(within(directCard).getByRole("button", { name: "Share" }));
  expect(within(directCard).getByRole("menuitem", { name: "LinkedIn" }).getAttribute("href"))
    .toContain(encodeURIComponent(`${window.location.origin}/jobs?posting=job-7`));

  fireEvent.click(within(himalayasCard).getByRole("button", { name: "Share" }));
  expect(within(himalayasCard).getByRole("menuitem", { name: "LinkedIn" }).getAttribute("href"))
    .toContain(encodeURIComponent(himalayasPage));
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
