import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { expect, it, vi } from "vitest";
import RecruiterDashboard from "./RecruiterDashboard";

it("preserves a posting deadline when editing its title and can clear the deadline", async () => {
  localStorage.setItem("access_token", "recruiter-token");
  localStorage.setItem("user_role", "recruiter");
  const posting = { id: "job-1", title: "Developer", company_name: "Test Co", location: "Montreal",
    employment_type: "Internship", description: "Test posting", deadline: "2026-11-16T15:00:30", status: "active", application_count: 1 };
  const saved = [];
  vi.stubGlobal("fetch", vi.fn((url, options) => {
    if (options?.method === "PATCH") {
      saved.push(JSON.parse(options.body));
      Object.assign(posting, saved.at(-1));
      return Promise.resolve(new Response(JSON.stringify(posting)));
    }
    const data = url.endsWith("/unread-count") ? { unread_count: 0 } : [posting];
    return Promise.resolve(new Response(JSON.stringify(data)));
  }));
  render(<MemoryRouter><RecruiterDashboard /></MemoryRouter>);
  const user = userEvent.setup();
  await user.click(await screen.findByRole("button", { name: "Edit" }));
  await user.clear(screen.getByLabelText("Job title"));
  await user.type(screen.getByLabelText("Job title"), "New title");
  await user.click(screen.getByRole("button", { name: "Save Changes" }));
  await screen.findByText("Job posting updated successfully.");
  expect(saved[0].deadline).toBe("2026-11-16T15:00:30.000Z");
  await user.click(screen.getByRole("button", { name: "Edit" }));
  fireEvent.change(screen.getByLabelText("Application deadline (optional, your local time)"), { target: { value: "" } });
  await user.click(screen.getByRole("button", { name: "Save Changes" }));
  await screen.findByText("Job posting updated successfully.");
  expect(saved[1].deadline).toBeNull();
});
