import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import ShareJobButton from "./ShareJobButton";

const posting = { id: "job-42", title: "Frontend Developer", company_name: "Maple & Co", location: "Montreal, QC" };
const url = `${window.location.origin}/jobs?posting=job-42`;

function mockClipboard(writeText = vi.fn().mockResolvedValue(undefined)) {
  Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
  return writeText;
}

function openMenu() {
  render(<ShareJobButton posting={posting} />);
  fireEvent.click(screen.getByRole("button", { name: "Share" }));
}

afterEach(() => {
  vi.useRealTimers();
});

it("opens a menu with Copy link, Email and LinkedIn", () => {
  openMenu();
  expect(screen.getByRole("button", { name: "Share" }).getAttribute("aria-expanded")).toBe("true");
  const items = screen.getAllByRole("menuitem").map((item) => item.textContent);
  expect(items).toEqual(["Copy link", "Email", "LinkedIn"]);
});

it("copies the posting link and shows Link copied! for about 2 seconds", async () => {
  vi.useFakeTimers();
  const writeText = mockClipboard();
  openMenu();
  await act(async () => {
    fireEvent.click(screen.getByRole("menuitem", { name: "Copy link" }));
  });
  expect(writeText).toHaveBeenCalledWith(url);
  expect(screen.getByRole("status").textContent).toBe("Link copied!");
  expect(screen.queryByRole("menu")).toBeNull();
  act(() => vi.advanceTimersByTime(2000));
  expect(screen.queryByText("Link copied!")).toBeNull();
});

it("shows an error message when the clipboard is unavailable", async () => {
  mockClipboard(vi.fn().mockRejectedValue(new Error("denied")));
  openMenu();
  await act(async () => {
    fireEvent.click(screen.getByRole("menuitem", { name: "Copy link" }));
  });
  expect(screen.getByRole("status").textContent).toBe("Could not copy the link.");
});

it("builds an email link with the job details and the encoded URL", () => {
  openMenu();
  const href = screen.getByRole("menuitem", { name: "Email" }).getAttribute("href");
  expect(href.startsWith("mailto:?subject=")).toBe(true);
  expect(href).toContain(encodeURIComponent("Job opportunity: Frontend Developer at Maple & Co"));
  expect(href).toContain(encodeURIComponent(url));
  const body = decodeURIComponent(href.split("&body=")[1]);
  expect(body).toContain("Title: Frontend Developer");
  expect(body).toContain("Company: Maple & Co");
  expect(body).toContain("Location: Montreal, QC");
});

it("opens LinkedIn sharing in a new tab with the encoded URL", () => {
  openMenu();
  const link = screen.getByRole("menuitem", { name: "LinkedIn" });
  expect(link.getAttribute("href")).toBe(
    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
  );
  expect(link.getAttribute("target")).toBe("_blank");
  expect(link.getAttribute("rel")).toBe("noopener noreferrer");
});

it("closes the menu on Escape and on an outside click", () => {
  openMenu();
  fireEvent.keyDown(document, { key: "Escape" });
  expect(screen.queryByRole("menu")).toBeNull();
  expect(document.activeElement).toBe(screen.getByRole("button", { name: "Share" }));

  fireEvent.click(screen.getByRole("button", { name: "Share" }));
  fireEvent.mouseDown(screen.getByRole("menu"));
  expect(screen.getByRole("menu")).toBeTruthy();
  fireEvent.mouseDown(document.body);
  expect(screen.queryByRole("menu")).toBeNull();
});

it("shares a ready-made url when one is passed instead of the ?posting= link", () => {
  const external = "https://himalayas.app/companies/acme/jobs/react-developer";
  render(<ShareJobButton posting={posting} url={external} />);
  fireEvent.click(screen.getByRole("button", { name: "Share" }));
  expect(screen.getByRole("menuitem", { name: "LinkedIn" }).getAttribute("href"))
    .toBe(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(external)}`);
  expect(screen.getByRole("menuitem", { name: "Email" }).getAttribute("href")).toContain(encodeURIComponent(external));
  expect(screen.getByRole("menuitem", { name: "Email" }).getAttribute("href")).not.toContain("posting");
});
