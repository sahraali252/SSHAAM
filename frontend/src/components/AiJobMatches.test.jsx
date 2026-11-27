import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { expect, it, vi } from "vitest";
import AiJobMatches from "./AiJobMatches";

const match = (id, title, score) => ({
  posting_id: id, title, company_name: `${title} Inc`, location: "Montreal", employment_type: "Internship",
  description: `${title} description`, match_score: score, matching_skills: ["React"], missing_skills: ["Docker"],
  reason: `${title} reason.`,
});
// Deliberately unsorted to prove the UI orders by score.
const matches = [match("p-low", "Data Analyst", 35), match("p-high", "Frontend Developer", 92), match("p-mid", "Backend Developer", 68)];

function mockApi(status = 200, body = { matches, message: null }) {
  const fetchMock = vi.fn(async () => new Response(JSON.stringify(body), { status }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function ApplyState() {
  return <pre data-testid="apply-state">{JSON.stringify(useLocation().state)}</pre>;
}

function renderMatches() {
  localStorage.setItem("access_token", "token");
  return render(<MemoryRouter initialEntries={["/jobs"]}><Routes>
    <Route path="/jobs" element={<AiJobMatches />} />
    <Route path="/apply" element={<ApplyState />} />
  </Routes></MemoryRouter>);
}

it("renders AI job matches sorted by score with skills and reasons", async () => {
  const fetchMock = mockApi();
  renderMatches();
  fireEvent.click(screen.getByRole("button", { name: "Find my matches" }));
  expect(screen.getByRole("status").textContent).toMatch(/Comparing your resume/);

  const list = await screen.findByRole("list", { name: "AI job match results" });
  const titles = within(list).getAllByRole("heading").map((heading) => heading.textContent);
  expect(titles).toEqual(["Frontend Developer", "Backend Developer", "Data Analyst"]);
  expect(screen.getByLabelText("Match score 92 out of 100")).toBeTruthy();
  expect(screen.getByLabelText("Match score 35 out of 100")).toBeTruthy();
  expect(screen.getByText("Frontend Developer reason.")).toBeTruthy();
  expect(within(list).getAllByText("React")).toHaveLength(3);
  expect(within(list).getAllByText("Docker")).toHaveLength(3);
  expect(screen.getByRole("button", { name: "Refresh matches" })).toBeTruthy();

  const [url, options] = fetchMock.mock.calls[0];
  expect(url).toBe("http://127.0.0.1:8000/ai/job-matches");
  expect(options.method).toBe("POST");
  expect(options.headers.Authorization).toBe("Bearer token");
});

it("links each match to the existing apply flow for that posting", async () => {
  mockApi();
  renderMatches();
  fireEvent.click(screen.getByRole("button", { name: "Find my matches" }));
  const best = (await screen.findByRole("heading", { name: "Frontend Developer" })).parentElement;
  fireEvent.click(within(best).getByRole("button", { name: "Apply for this job" }));
  expect(JSON.parse(screen.getByTestId("apply-state").textContent).job).toEqual({
    id: "p-high", title: "Frontend Developer", company: "Frontend Developer Inc", location: "Montreal",
    type: "Internship", description: "Frontend Developer description",
  });
});

it("shows a friendly error when the AI service is unavailable (503)", async () => {
  mockApi(503, { detail: "AI service is unavailable, try again later." });
  renderMatches();
  fireEvent.click(screen.getByRole("button", { name: "Find my matches" }));
  expect((await screen.findByRole("alert")).textContent).toBe("AI service is unavailable, try again later.");
  expect(screen.queryByRole("list", { name: "AI job match results" })).toBeNull();
  expect(screen.getByRole("button", { name: "Find my matches" }).disabled).toBe(false);
});

it("shows the backend message when there is no resume (400)", async () => {
  mockApi(400, { detail: "Please upload a resume first." });
  renderMatches();
  fireEvent.click(screen.getByRole("button", { name: "Find my matches" }));
  expect((await screen.findByRole("alert")).textContent).toBe("Please upload a resume first.");
});

it("shows the friendly message when there are no active postings", async () => {
  mockApi(200, { matches: [], message: "There are no active job postings to match right now. Check back later." });
  renderMatches();
  fireEvent.click(screen.getByRole("button", { name: "Find my matches" }));
  expect(await screen.findByText(/no active job postings/)).toBeTruthy();
  expect(screen.queryByRole("list", { name: "AI job match results" })).toBeNull();
});
