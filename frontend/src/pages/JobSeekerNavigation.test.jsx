import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { expect, it, vi } from "vitest";
import App from "../App";
import JobSearch from "./JobSearch";
import Dashboard from "./Dashboard";
import JobSeekerLayout from "../components/JobSeekerLayout";

vi.mock("../components/NotificationCenter", () => ({ default: () => <button>Notifications</button> }));

const direct = { id: 7, title: "Direct developer", company_name: "Local team", location: "Toronto", employment_type: "Full-time", description: "Build local products", deadline: "2027-01-01T12:00:00Z" };
const external = { guid: "external-7", title: "External designer", companyName: "Remote team", locationRestrictions: ["Remote"], employmentType: "Contract", excerpt: "Design products", description: "<p>Full external details</p>" };
function session(role = "job_seeker") {
  localStorage.setItem("access_token", "token");
  localStorage.setItem("user_id", "1");
  localStorage.setItem("user_role", role);
}
function mockFeeds(fail = "") {
  const fetchMock = vi.fn(async url => {
    if (url.includes("/job-postings/")) return new Response(JSON.stringify([direct]), { status: fail === "direct" ? 500 : 200 });
    return new Response(JSON.stringify({ jobs: [external] }), { status: fail === "external" ? 500 : 200 });
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}
function LocationState() {
  const location = useLocation();
  return <pre data-testid="application-state">{JSON.stringify(location.state)}</pre>;
}
function jobs() {
  return render(<MemoryRouter initialEntries={["/jobs"]}><Routes>
    <Route path="/jobs" element={<JobSearch />} />
    <Route path="/apply" element={<LocationState />} />
  </Routes></MemoryRouter>);
}
it.each([["job_seeker", "Find Your Next Opportunity", "/jobs"], ["recruiter", "Manage your job postings", "/recruiter/dashboard"]])("login lands %s on the correct workspace", async (role, heading, path) => {
  window.history.replaceState({}, "", "/login");
  vi.stubGlobal("fetch", vi.fn(async url => {
    if (url.includes("/auth/login")) return new Response(JSON.stringify({ access_token: "token", user_id: 1, email: "user@example.com", role }));
    if (url.includes("/job-postings/")) return new Response("[]");
    return new Response('{"jobs":[]}');
  }));
  render(<App />);
  fireEvent.change(screen.getByPlaceholderText("Enter your email"), { target: { value: "user@example.com" } });
  fireEvent.change(screen.getByPlaceholderText("Enter your password"), { target: { value: "password" } });
  fireEvent.click(screen.getByRole("button", { name: "Login" }));
  expect(await screen.findByRole("heading", { name: heading })).toBeTruthy();
  expect(window.location.pathname).toBe(path);
});
it.each([[false, "login"], [true, "recruiter"]])("guards job-seeker routes before mounting their contents (%s)", (recruiter, destination) => {
  if (recruiter) session("recruiter");
  render(<MemoryRouter initialEntries={["/jobs"]}><Routes>
    <Route element={<JobSeekerLayout />}><Route path="/jobs" element={<p>Private jobs</p>} /></Route>
    <Route path="/login" element={<p>login</p>} />
    <Route path="/recruiter/dashboard" element={<p>recruiter</p>} />
  </Routes></MemoryRouter>);
  expect(screen.getByText(destination)).toBeTruthy();
  expect(screen.queryByText("Private jobs")).toBeNull();
});
it("redirects legacy dashboard links and keeps navigation active; logout clears the session", () => {
  session();
  render(<MemoryRouter initialEntries={["/dashboard"]}><Routes>
    <Route element={<JobSeekerLayout />}>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/jobs" element={<p>Unified jobs</p>} />
      <Route path="/applications" element={<p>History page</p>} />
    </Route>
    <Route path="/login" element={<p>Signed out</p>} />
  </Routes></MemoryRouter>);
  expect(screen.getByText("Unified jobs")).toBeTruthy();
  const nav = screen.getByRole("navigation", { name: "Main navigation" });
  expect(within(nav).getByRole("link", { name: "Browse Jobs" }).getAttribute("aria-current")).toBe("page");
  fireEvent.click(within(nav).getByRole("link", { name: "Applications" }));
  expect(screen.getByText("History page")).toBeTruthy();
  expect(within(nav).getByRole("link", { name: "Applications" }).getAttribute("aria-current")).toBe("page");
  fireEvent.click(screen.getByRole("button", { name: "Log out" }));
  expect(screen.getByText("Signed out")).toBeTruthy();
  expect(localStorage.getItem("access_token")).toBeNull();
  expect(localStorage.getItem("user_role")).toBeNull();
});
it("combines both sources and preserves the direct application identifier and details", async () => {
  mockFeeds(); jobs();
  expect(await screen.findByText("2 jobs found")).toBeTruthy();
  expect(screen.getByText("CareerConnect / Direct posting")).toBeTruthy();
  expect(screen.getByRole("heading", { name: external.title })).toBeTruthy();
  fireEvent.click(within(screen.getByRole("heading", { name: direct.title }).parentElement).getByRole("button", { name: "View Details" }));
  expect(screen.getByText(direct.description)).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Apply for this job" }));
  expect(JSON.parse(screen.getByTestId("application-state").textContent).job).toEqual({ id: "7", title: direct.title, company: direct.company_name, location: direct.location, type: direct.employment_type, description: direct.description });
});
it("preserves external job details and application payload", async () => {
  mockFeeds(); jobs();
  await screen.findByText("2 jobs found");
  fireEvent.click(within(screen.getByRole("heading", { name: external.title }).parentElement).getByRole("button", { name: "View Details" }));
  expect(screen.getByText("Full external details")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Apply for this job" }));
  expect(JSON.parse(screen.getByTestId("application-state").textContent).job.id).toBe("external-7");
});
it("applies submitted search filters to direct postings and retains the external endpoint parameters", async () => {
  const fetchMock = mockFeeds(); jobs();
  await screen.findByText("2 jobs found");
  fireEvent.change(screen.getByRole("textbox", { name: "Job title or keyword" }), { target: { value: "designer" } });
  fireEvent.click(screen.getByRole("button", { name: "Search" }));
  await screen.findByText("1 job found");
  expect(screen.queryByRole("heading", { name: direct.title })).toBeNull();
  expect(fetchMock).toHaveBeenCalledWith("http://127.0.0.1:8000/jobs/?keyword=designer");
});
it("preserves all Himalayas filters and returning from a detailed view", async () => {
  const fetchMock = mockFeeds(); jobs();
  await screen.findByText("2 jobs found");
  fireEvent.change(screen.getByRole("textbox", { name: "Job title or keyword" }), { target: { value: "designer" } });
  fireEvent.change(screen.getByRole("textbox", { name: "Location" }), { target: { value: "Canada" } });
  fireEvent.change(screen.getByRole("textbox", { name: "Category" }), { target: { value: "Design" } });
  fireEvent.click(screen.getByRole("button", { name: "Search" }));
  await screen.findByText("1 job found");
  expect(fetchMock).toHaveBeenCalledWith("http://127.0.0.1:8000/jobs/?keyword=designer&location=Canada&category=Design");
  fireEvent.click(screen.getByRole("button", { name: "View Details" }));
  expect(screen.getByText("Full external details")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: /Back to jobs/ }));
  expect(screen.getByRole("textbox", { name: "Category" }).value).toBe("Design");
  expect(screen.getByRole("heading", { name: external.title })).toBeTruthy();
});
it.each([["external", direct.title], ["direct", external.title]])("keeps the other feed usable when %s fails", async (source, title) => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  mockFeeds(source); jobs();
  expect(await screen.findByRole("alert")).toBeTruthy();
  expect(await screen.findByRole("heading", { name: title })).toBeTruthy();
});

