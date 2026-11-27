import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { expect, it, vi } from "vitest";
import ApplicationTracking from "../pages/ApplicationTracking";

// US-18 / #97: mock interview practice from the application history page.
const himalayasPage = "https://himalayas.app/companies/acme/jobs/react-developer";
const applications = [
  { id: 11, job_id: "job-uuid-1", status: "Interview", applied_at: "2026-11-01T12:00:00Z" },
  { id: 12, job_id: himalayasPage, status: "Applied", applied_at: "2026-11-02T12:00:00Z" },
];
const questions = Array.from({ length: 10 }, (_, i) => ({
  number: i + 1,
  question: `Question text ${i + 1}?`,
  type: i % 2 === 0 ? "technical" : "role-specific",
  tip: `Tip number ${i + 1}.`,
}));

function mockApi(interviewResponses = [[200, questions]]) {
  const responses = [...interviewResponses];
  const fetchMock = vi.fn(async (url) => {
    if (url.includes("/ai/mock-interview/")) {
      const [status, body] = responses.length > 1 ? responses.shift() : responses[0];
      return new Response(JSON.stringify(body), { status });
    }
    return new Response(JSON.stringify(applications));
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function renderHistory() {
  localStorage.setItem("access_token", "token");
  localStorage.setItem("careerconnect_job_details", JSON.stringify({
    "job-uuid-1": { title: "Backend developer", company: "Local team", location: "Montreal" },
    [himalayasPage]: { title: "Remote React developer", company: "Acme", location: "Canada", description: "React work" },
  }));
  return render(<MemoryRouter><ApplicationTracking /></MemoryRouter>);
}

async function openInterview(title) {
  const card = (await screen.findByRole("heading", { name: title })).closest(".tracking-card");
  fireEvent.click(within(card).getByRole("button", { name: "Practice interview" }));
  return screen.findByText("Question 1 of 10");
}

const interviewCalls = (fetchMock) => fetchMock.mock.calls.filter(([url]) => url.includes("/ai/mock-interview/"));

it("shows a Practice interview button on each application card", async () => {
  mockApi();
  renderHistory();
  await screen.findByRole("heading", { name: "Backend developer" });
  const cards = document.querySelectorAll(".tracking-card");
  expect(cards).toHaveLength(2);
  for (const card of cards) {
    expect(within(card).getByRole("button", { name: "Practice interview" })).toBeTruthy();
  }
});

it("requests the interview for that application with the saved job details", async () => {
  const fetchMock = mockApi();
  renderHistory();
  const card = (await screen.findByRole("heading", { name: "Remote React developer" })).closest(".tracking-card");
  fireEvent.click(within(card).getByRole("button", { name: "Practice interview" }));
  expect(screen.getByRole("status").textContent).toMatch(/Generating 10 interview questions/);
  await screen.findByText("Question 1 of 10");

  const [url, options] = interviewCalls(fetchMock)[0];
  expect(url).toBe("http://127.0.0.1:8000/ai/mock-interview/12");
  expect(options.method).toBe("POST");
  expect(options.headers.Authorization).toBe("Bearer token");
  expect(JSON.parse(options.body)).toEqual({ title: "Remote React developer", company: "Acme", description: "React work" });
});

it("navigates one question at a time with type badges, kept answers and Restart at the end", async () => {
  const fetchMock = mockApi();
  renderHistory();
  await openInterview("Backend developer");

  expect(screen.getByText("Question text 1?")).toBeTruthy();
  expect(screen.getByText("Technical")).toBeTruthy();
  expect(screen.getByRole("button", { name: "Previous" }).disabled).toBe(true);

  const answer = screen.getByLabelText("Your practice answer");
  fireEvent.change(answer, { target: { value: "My first answer" } });

  fireEvent.click(screen.getByRole("button", { name: "Next" }));
  expect(screen.getByText("Question 2 of 10")).toBeTruthy();
  expect(screen.getByText("Question text 2?")).toBeTruthy();
  expect(screen.getByText("Role-specific")).toBeTruthy();
  expect(screen.getByLabelText("Your practice answer").value).toBe("");

  fireEvent.click(screen.getByRole("button", { name: "Previous" }));
  expect(screen.getByLabelText("Your practice answer").value).toBe("My first answer");

  for (let n = 1; n < 10; n += 1) fireEvent.click(screen.getByRole("button", { name: "Next" }));
  expect(screen.getByText("Question 10 of 10")).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Next" })).toBeNull();

  fireEvent.click(screen.getByRole("button", { name: "Restart" }));
  expect(screen.getByText("Question 1 of 10")).toBeTruthy();
  expect(screen.getByLabelText("Your practice answer").value).toBe("");

  // Practice answers are never sent anywhere: only the one request to generate questions.
  expect(interviewCalls(fetchMock)).toHaveLength(1);
});

it("toggles the tip and hides it again on the next question", async () => {
  mockApi();
  renderHistory();
  await openInterview("Backend developer");

  const toggle = screen.getByRole("button", { name: "Show tip" });
  expect(screen.queryByText("Tip number 1.")).toBeNull();
  fireEvent.click(toggle);
  expect(screen.getByText("Tip number 1.")).toBeTruthy();
  expect(screen.getByRole("button", { name: "Hide tip" }).getAttribute("aria-expanded")).toBe("true");

  fireEvent.click(screen.getByRole("button", { name: "Hide tip" }));
  expect(screen.queryByText("Tip number 1.")).toBeNull();

  fireEvent.click(screen.getByRole("button", { name: "Show tip" }));
  fireEvent.click(screen.getByRole("button", { name: "Next" }));
  expect(screen.queryByText("Tip number 2.")).toBeNull();
  expect(screen.getByRole("button", { name: "Show tip" })).toBeTruthy();
});

it("shows the friendly error on 503 and can try again", async () => {
  mockApi([[503, { detail: "AI service is unavailable, try again later." }], [200, questions]]);
  renderHistory();
  const card = (await screen.findByRole("heading", { name: "Backend developer" })).closest(".tracking-card");
  fireEvent.click(within(card).getByRole("button", { name: "Practice interview" }));

  const alert = await screen.findByRole("alert");
  expect(alert.textContent).toContain("AI service is unavailable, try again later.");
  fireEvent.click(within(alert).getByRole("button", { name: "Try again" }));
  expect(await screen.findByText("Question 1 of 10")).toBeTruthy();
});

it("goes back to the application history", async () => {
  mockApi();
  renderHistory();
  await openInterview("Backend developer");
  fireEvent.click(screen.getByRole("button", { name: /Back to applications/ }));
  expect(screen.getByRole("heading", { name: "Remote React developer" })).toBeTruthy();
  expect(screen.queryByText(/Question \d+ of 10/)).toBeNull();
});
