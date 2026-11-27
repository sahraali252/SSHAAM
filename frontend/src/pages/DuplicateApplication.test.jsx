import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { expect, it, vi } from "vitest";
import JobApplication from "./JobApplication";
import JobSearch from "./JobSearch";
import RecruiterOpportunities from "../components/RecruiterOpportunities";
import AiJobMatches from "../components/AiJobMatches";
import { normalizeJobId } from "../utils/applications";

// #95: one job id per job, and "Already applied" instead of Apply buttons.
const posting = { id: "job-uuid-1", title: "Backend developer", company_name: "Local team", location: "Montreal",
  employment_type: "Full-time", description: "Build APIs", deadline: null, status: "active" };
const himalayasPage = "https://himalayas.app/companies/acme/jobs/react-developer";
const himalayas = { guid: himalayasPage, applicationLink: `${himalayasPage}?utm_source=api`, title: "Remote React developer",
  companyName: "Acme", locationRestrictions: ["Canada"], employmentType: "Full Time", excerpt: "React work",
  description: "<p>Himalayas details</p>" };
const match = { posting_id: posting.id, title: posting.title, company_name: posting.company_name, location: posting.location,
  employment_type: posting.employment_type, description: posting.description, match_score: 88,
  matching_skills: ["Python"], missing_skills: [], reason: "Good fit." };

function mockApi({ applications = [], applyStatus = 201, applyBody = { status: "Applied" } } = {}) {
  const fetchMock = vi.fn(async (url, options) => {
    if (url.includes("/applications/my-applications")) return new Response(JSON.stringify(applications));
    if (url.includes("/applications/")) return new Response(JSON.stringify(applyBody), { status: applyStatus });
    if (url.includes("/job-postings/")) return new Response(JSON.stringify([posting]));
    if (url.includes("/ai/job-matches")) return new Response(JSON.stringify({ matches: [match], message: null }));
    if (options?.method === "POST") return new Response("{}", { status: 404 });
    return new Response(JSON.stringify({ jobs: [himalayas] }));
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function ApplyState() {
  return <pre data-testid="apply-state">{JSON.stringify(useLocation().state)}</pre>;
}

function renderAt(entry, element, path = "/jobs") {
  localStorage.setItem("access_token", "token");
  return render(<MemoryRouter initialEntries={[entry]}><Routes>
    <Route path={path} element={element} />
    <Route path="/apply" element={<ApplyState />} />
  </Routes></MemoryRouter>);
}

const appliedJobId = () => JSON.parse(screen.getByTestId("apply-state").textContent).job.id;

function renderApplyPage(job) {
  localStorage.setItem("access_token", "token");
  return render(<MemoryRouter initialEntries={[{ pathname: "/apply", state: { job } }]}>
    <Routes><Route path="/apply" element={<JobApplication />} /></Routes>
  </MemoryRouter>);
}

it("apply page shows Already applied with the status instead of the Apply button", async () => {
  mockApi({ applications: [{ id: 1, job_id: posting.id, status: "Interview" }] });
  renderApplyPage({ id: posting.id, title: posting.title });
  expect(await screen.findByText("✓ Already applied · Interview")).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Apply Now" })).toBeNull();
});

it("apply page recognizes an existing application from a different link to the same Himalayas job", async () => {
  mockApi({ applications: [{ id: 2, job_id: himalayasPage, status: "Under Review" }] });
  renderApplyPage({ id: `${himalayasPage}/?utm_source=api`, title: himalayas.title });
  expect(await screen.findByText("✓ Already applied · Under Review")).toBeTruthy();
});

it("apply page sends the normalized job id and then shows Already applied", async () => {
  const fetchMock = mockApi();
  renderApplyPage({ id: ` ${himalayasPage}?utm_source=api`, title: himalayas.title });
  fireEvent.click(await screen.findByRole("button", { name: "Apply Now" }));
  expect(await screen.findByText("✓ Already applied · Applied")).toBeTruthy();
  const [, options] = fetchMock.mock.calls.find(([, init]) => init?.method === "POST");
  expect(JSON.parse(options.body)).toEqual({ job_id: himalayasPage });
});

it.each([
  [400, { detail: "You already applied to this job" }],
  [409, { detail: "Application could not be saved due to a database conflict" }],
])("apply page treats a %s duplicate response as Already applied", async (applyStatus, applyBody) => {
  mockApi({ applyStatus, applyBody });
  renderApplyPage({ id: posting.id, title: posting.title });
  fireEvent.click(await screen.findByRole("button", { name: "Apply Now" }));
  expect(await screen.findByText(/Already applied/)).toBeTruthy();
  expect(screen.getByText("You already applied to this job.")).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Apply Now" })).toBeNull();
});

it("job details view replaces Apply with Already applied for applied jobs only", async () => {
  mockApi({ applications: [{ id: 1, job_id: posting.id, status: "Offered" }] });
  renderAt("/jobs?posting=job-uuid-1", <JobSearch />);
  expect(await screen.findByText("✓ Already applied · Offered")).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Apply for this job" })).toBeNull();

  fireEvent.click(screen.getByRole("button", { name: /Back to jobs/ }));
  const card = (await screen.findByRole("heading", { name: himalayas.title })).closest(".job-card");
  fireEvent.click(within(card).getByRole("button", { name: "View Details" }));
  expect(screen.getByRole("button", { name: "Apply for this job" })).toBeTruthy();
});

it("AI match cards and recruiter opportunity cards show Already applied", async () => {
  mockApi({ applications: [{ id: 1, job_id: posting.id, status: "Applied" }] });
  renderAt("/jobs", <RecruiterOpportunities />);
  expect(await screen.findByText("✓ Already applied · Applied")).toBeTruthy();
  expect(screen.queryByRole("button", { name: "View and Apply" })).toBeNull();

  render(<MemoryRouter><AiJobMatches appliedJobs={new Map([[posting.id, "Interview"]])} /></MemoryRouter>);
  fireEvent.click(screen.getByRole("button", { name: "Find my matches" }));
  expect(await screen.findByText("✓ Already applied · Interview")).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Apply for this job" })).toBeNull();
});

it("every entry point sends the same job id for the same recruiter posting", async () => {
  const ids = [];

  mockApi();
  const details = renderAt("/jobs", <JobSearch />);
  const card = (await screen.findByRole("heading", { name: posting.title })).closest(".job-card");
  fireEvent.click(within(card).getByRole("button", { name: "View Details" }));
  fireEvent.click(screen.getByRole("button", { name: "Apply for this job" }));
  ids.push(appliedJobId());
  details.unmount();

  const shared = renderAt("/jobs?posting=job-uuid-1", <JobSearch />);
  fireEvent.click(await screen.findByRole("button", { name: "Apply for this job" }));
  ids.push(appliedJobId());
  shared.unmount();

  const opportunities = renderAt("/jobs", <RecruiterOpportunities />);
  fireEvent.click(await screen.findByRole("button", { name: "View and Apply" }));
  ids.push(appliedJobId());
  opportunities.unmount();

  renderAt("/jobs", <AiJobMatches />);
  fireEvent.click(screen.getByRole("button", { name: "Find my matches" }));
  fireEvent.click(await screen.findByRole("button", { name: "Apply for this job" }));
  ids.push(appliedJobId());

  expect(ids).toEqual(["job-uuid-1", "job-uuid-1", "job-uuid-1", "job-uuid-1"]);
});

it("Himalayas jobs always use the guid page as their job id", async () => {
  mockApi();
  renderAt("/jobs", <JobSearch />);
  const card = (await screen.findByRole("heading", { name: himalayas.title })).closest(".job-card");
  fireEvent.click(within(card).getByRole("button", { name: "View Details" }));
  fireEvent.click(screen.getByRole("button", { name: "Apply for this job" }));
  expect(appliedJobId()).toBe(himalayasPage);
  expect(normalizeJobId(himalayas.applicationLink)).toBe(himalayasPage);
});
