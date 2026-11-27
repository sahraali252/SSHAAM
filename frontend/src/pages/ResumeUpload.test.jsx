import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { expect, it, vi } from "vitest";
import ResumeUpload from "./ResumeUpload";

const resume = { id: 1, user_id: 1, original_filename: "jane-cv.pdf", file_size: 2048, created_at: "2026-11-01T12:00:00" };
const feedback = {
  overall_score: 82,
  summary: "Strong technical resume with clear projects.",
  strengths: ["Relevant React experience", "Clear education section"],
  improvements: [{ section: "Experience", issue: "Bullets list duties only.", suggestion: "Add measurable results." }],
  missing_sections: ["Certifications"],
};

function mockApi({ hasResume = true, aiStatus = 200, aiBody = feedback } = {}) {
  const fetchMock = vi.fn(async (url) => {
    if (url.includes("/ai/resume-feedback")) return new Response(JSON.stringify(aiBody), { status: aiStatus });
    if (url.includes("/resumes/1")) {
      return hasResume ? new Response(JSON.stringify(resume)) : new Response(JSON.stringify({ detail: "No resume" }), { status: 404 });
    }
    return new Response("{}", { status: 404 });
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function renderPage() {
  localStorage.setItem("access_token", "token");
  localStorage.setItem("user_id", "1");
  return render(<MemoryRouter><ResumeUpload /></MemoryRouter>);
}

it("shows AI feedback as cards after clicking Get AI Feedback", async () => {
  const fetchMock = mockApi();
  renderPage();
  fireEvent.click(await screen.findByRole("button", { name: "Get AI Feedback" }));
  expect(screen.getByRole("status").textContent).toMatch(/Analyzing your resume/);

  expect(await screen.findByText(feedback.summary)).toBeTruthy();
  expect(screen.getByLabelText("Overall score 82 out of 100")).toBeTruthy();
  expect(screen.getByText("Relevant React experience")).toBeTruthy();
  expect(screen.getByText("Bullets list duties only.")).toBeTruthy();
  expect(screen.getByText("Add measurable results.")).toBeTruthy();
  const missing = screen.getByRole("heading", { name: "Missing sections" }).parentElement;
  expect(within(missing).getByText("Certifications")).toBeTruthy();

  const [url, options] = fetchMock.mock.calls.find(([calledUrl]) => calledUrl.includes("/ai/resume-feedback"));
  expect(url).toBe("http://127.0.0.1:8000/ai/resume-feedback");
  expect(options.method).toBe("POST");
  expect(options.headers.Authorization).toBe("Bearer token");
});

it("shows a friendly error when the AI service is unavailable (503)", async () => {
  mockApi({ aiStatus: 503, aiBody: { detail: "AI service is unavailable, try again later." } });
  renderPage();
  fireEvent.click(await screen.findByRole("button", { name: "Get AI Feedback" }));
  expect((await screen.findByRole("alert")).textContent).toBe("AI service is unavailable, try again later.");
  expect(screen.queryByText("Strengths")).toBeNull();
  expect(screen.getByRole("button", { name: "Get AI Feedback" }).disabled).toBe(false);
});

it("shows the backend reason when the resume has no readable text (400)", async () => {
  mockApi({ aiStatus: 400, aiBody: { detail: "It may be a scanned image" } });
  renderPage();
  fireEvent.click(await screen.findByRole("button", { name: "Get AI Feedback" }));
  expect((await screen.findByRole("alert")).textContent).toMatch(/scanned image/);
});

it("does not crash when the server cannot be reached or returns partial data", async () => {
  mockApi({ aiBody: { overall_score: 40, summary: "Needs work." } });
  renderPage();
  fireEvent.click(await screen.findByRole("button", { name: "Get AI Feedback" }));
  expect(await screen.findByText("Needs work.")).toBeTruthy();

  vi.stubGlobal("fetch", vi.fn(async () => { throw new TypeError("Failed to fetch"); }));
  fireEvent.click(screen.getByRole("button", { name: "Get AI Feedback" }));
  expect((await screen.findByRole("alert")).textContent).toBe("Unable to connect to the server.");
});

it("hides the AI feedback button until a resume is uploaded", async () => {
  mockApi({ hasResume: false });
  renderPage();
  expect(await screen.findByText("No resume uploaded yet")).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Get AI Feedback" })).toBeNull();
});
