import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import NotificationCenter from "./NotificationCenter";

let items;
let fetchMock;
const notice = (id, kind = "application_status", is_read = false) => ({
  id, kind, is_read, message: `Message ${id}`, application_id: 42,
  created_at: "2026-11-15T15:00:00", read_at: null,
});
const json = (body, status = 200) => Promise.resolve(new Response(JSON.stringify(body), { status }));

beforeEach(() => {
  localStorage.setItem("access_token", "seeker-token");
  localStorage.setItem("user_role", "job_seeker");
  items = [notice(1), notice(2, "interview_invitation"), notice(3, "deadline_reminder", true)];
  fetchMock = vi.fn((url, options) => {
    if (url.endsWith("/unread-count")) return json({ unread_count: items.filter((n) => !n.is_read).length });
    if (url.includes("/notifications/?")) {
      const query = new URL(url).searchParams;
      const filtered = query.get("unread_only") === "true" ? items.filter((n) => !n.is_read) : items;
      return json(filtered.slice(0, Number(query.get("limit"))));
    }
    if (url.endsWith("/read")) {
      const id = Number(url.split("/").at(-2));
      const item = items.find((n) => n.id === id);
      item.is_read = true;
      return json(item);
    }
    if (url.includes("/recruiter/applications/")) return json({ status: JSON.parse(options.body).status || "Interview" });
    throw new Error(`Unexpected request: ${url}`);
  });
  vi.stubGlobal("fetch", fetchMock);
});

function mount() {
  return render(<MemoryRouter><NotificationCenter /></MemoryRouter>);
}

async function openInbox() {
  const user = userEvent.setup();
  await user.click(await screen.findByRole("button", { name: "Notifications, 2 unread" }));
  await screen.findByText("Message 1");
  return user;
}

describe("notification inbox", () => {
  it("loads real API paths with the session token and updates read status/count", async () => {
    mount();
    const user = await openInbox();
    expect(screen.getByText("Application update")).toBeTruthy();
    expect(screen.getByText("Interview invitation")).toBeTruthy();
    expect(screen.getByText("Deadline approaching")).toBeTruthy();
    const article = screen.getByText("Message 1").closest("article");
    await user.click(within(article).getByRole("button", { name: "Mark as read" }));
    await screen.findByRole("button", { name: "Notifications, 1 unread" });
    await waitFor(() => expect(within(article).queryByRole("button", { name: "Mark as read" })).toBeNull());
    expect(fetchMock).toHaveBeenCalledWith("http://127.0.0.1:8000/notifications/1/read",
      expect.objectContaining({ method: "PATCH", headers: expect.objectContaining({ Authorization: "Bearer seeker-token" }) }));
    expect(screen.getByText("Message 3").closest("article").querySelector("time").dateTime).toBe("2026-11-15T15:00:00.000Z");
  });

  it("filters unread messages and shows a caught-up state after reading them", async () => {
    mount();
    const user = await openInbox();
    await user.click(screen.getByRole("checkbox", { name: "Unread only" }));
    await screen.findByText("Message 1");
    expect(screen.queryByText("Message 3")).toBeNull();
    for (const id of [1, 2]) {
      const article = (await screen.findByText(`Message ${id}`)).closest("article");
      await user.click(within(article).getByRole("button", { name: "Mark as read" }));
      await waitFor(() => expect(screen.queryByText(`Message ${id}`)).toBeNull());
    }
    expect(await screen.findByText(/You're all caught up/)).toBeTruthy();
  });

  it("shows an empty state without inventing notifications", async () => {
    items = [];
    mount();
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "Notifications, 0 unread" }));
    expect(await screen.findByText(/No notifications yet/)).toBeTruthy();
  });

  it("keeps a notification unread when the write fails", async () => {
    const original = fetchMock.getMockImplementation();
    fetchMock.mockImplementation((url, options) => url.endsWith("/read") ? json({}, 500) : original(url, options));
    mount();
    const user = await openInbox();
    await user.click(within(screen.getByText("Message 1").closest("article")).getByRole("button", { name: "Mark as read" }));
    expect(await screen.findByRole("alert")).toHaveProperty("textContent", "Unable to update notifications. Please try again.");
    expect(screen.getByRole("button", { name: "Notifications, 2 unread" })).toBeTruthy();
    expect(items[0].is_read).toBe(false);
  });

  it("explains an expired session and offers login", async () => {
    fetchMock.mockImplementation(() => json({}, 401));
    mount();
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Notifications" }));
    expect(await screen.findByRole("alert")).toHaveProperty("textContent", expect.stringContaining("session has expired"));
    expect(screen.getByRole("link", { name: "Log in" }).getAttribute("href")).toBe("/login");
  });

  it("refreshes the badge automatically and aborts requests on unmount", async () => {
    let refresh;
    const setInterval = window.setInterval.bind(window);
    vi.spyOn(window, "setInterval").mockImplementation((callback, delay, ...args) => {
      if (delay === 30000) { refresh = callback; return 123; }
      return setInterval(callback, delay, ...args);
    });
    const view = mount();
    await screen.findByRole("button", { name: "Notifications, 2 unread" });
    items.push(notice(4));
    await act(async () => { await refresh(); });
    expect(screen.getByRole("button", { name: "Notifications, 3 unread" })).toBeTruthy();
    const signal = fetchMock.mock.calls.at(-1)[1].signal;
    view.unmount();
    expect(signal.aborted).toBe(true);
  });

  it("loads older notifications on demand", async () => {
    items = Array.from({ length: 21 }, (_, index) => notice(index + 1));
    mount();
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "Notifications, 21 unread" }));
    await user.click(await screen.findByRole("button", { name: "Load more" }));
    expect(await screen.findByText("Message 21")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Load more" })).toBeNull();
  });

  it("closes the dialog and returns focus to its trigger", async () => {
    mount();
    const user = await openInbox();
    await user.click(screen.getByRole("button", { name: "Close notifications" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Notifications, 2 unread" }));
  });

  it("does not request private notifications when signed out", () => {
    localStorage.clear();
    mount();
    expect(screen.queryByRole("button")).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("lets the owning recruiter send a custom interview invitation", async () => {
    localStorage.setItem("user_role", "recruiter");
    items = [notice(1, "new_application"), notice(2)];
    mount();
    const user = await openInbox();
    await user.selectOptions(screen.getByLabelText("Change application status"), "Interview");
    await user.type(screen.getByLabelText("Invitation message (optional)"), "Meet on Friday at 10:00.");
    await user.click(screen.getByRole("button", { name: "Send interview invitation" }));
    expect(await screen.findByText("Interview invitation sent.")).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledWith("http://127.0.0.1:8000/recruiter/applications/42/interview",
      expect.objectContaining({ method: "POST", body: JSON.stringify({ message: "Meet on Friday at 10:00." }) }));
  });

  it("sends other recruiter status changes to the status endpoint", async () => {
    localStorage.setItem("user_role", "recruiter");
    items = [notice(1, "new_application"), notice(2)];
    mount();
    const user = await openInbox();
    await user.selectOptions(screen.getByLabelText("Change application status"), "Under Review");
    await user.click(screen.getByRole("button", { name: "Update application" }));
    expect(await screen.findByText("Application updated to Under Review.")).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledWith("http://127.0.0.1:8000/recruiter/applications/42/status",
      expect.objectContaining({ method: "PATCH", body: JSON.stringify({ status: "Under Review" }) }));
  });
});
