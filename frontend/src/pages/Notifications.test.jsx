import React from "react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Notifications from "./Notifications";

describe("Notifications Component", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
  });

  it("displays all four sample notifications", () => {
    render(
      <MemoryRouter>
        <Notifications />
      </MemoryRouter>
    );

    expect(screen.getByText("Application Status Updated")).toBeInTheDocument();
    expect(screen.getByText("Interview Invitation")).toBeInTheDocument();
    expect(screen.getByText("Upcoming Deadline")).toBeInTheDocument();
    expect(screen.getByText("New Application Received")).toBeInTheDocument();
  });

  it("displays the correct unread notification count", () => {
    render(
      <MemoryRouter>
        <Notifications />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("button", { name: "Unread (2)" })
    ).toBeInTheDocument();
  });
});

describe("Notifications Interactions", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
  });

  it("marks one notification as read", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Notifications />
      </MemoryRouter>
    );

    expect(screen.getByRole("button", { name: "Unread (2)" }))
      .toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: "Mark as Read" })[0]);

    expect(screen.getByRole("button", { name: "Unread (1)" }))
      .toBeInTheDocument();
  });

  it("marks all notifications as read", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Notifications />
      </MemoryRouter>
    );

    await user.click(screen.getByRole("button", { name: "Mark All as Read" }));

    expect(screen.getByRole("button", { name: "Unread (0)" }))
      .toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Mark All as Read" }))
      .toBeDisabled();
  });

  it("filters unread notifications", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Notifications />
      </MemoryRouter>
    );

    await user.click(screen.getByRole("button", { name: "Unread (2)" }));

    expect(screen.getByText("Application Status Updated"))
      .toBeInTheDocument();

    expect(screen.getByText("Interview Invitation"))
      .toBeInTheDocument();

    expect(screen.queryByText("Upcoming Deadline"))
      .not.toBeInTheDocument();

    expect(screen.queryByText("New Application Received"))
      .not.toBeInTheDocument();
  });

  it("preserves read status in localStorage after remounting", async () => {
    const user = userEvent.setup();

    const { unmount } = render(
      <MemoryRouter>
        <Notifications />
      </MemoryRouter>
    );

    await user.click(screen.getByRole("button", { name: "Mark All as Read" }));

    unmount();

    render(
      <MemoryRouter>
        <Notifications />
      </MemoryRouter>
    );

    expect(screen.getByRole("button", { name: "Unread (0)" }))
      .toBeInTheDocument();
  });
});
