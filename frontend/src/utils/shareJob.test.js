import { expect, it } from "vitest";
import { getExternalJobUrl, getShareUrl } from "./shareJob";

const page = "https://himalayas.app/companies/acme/jobs/react-developer";

it("uses the Himalayas guid as the public job page", () => {
  expect(getExternalJobUrl({ guid: page, applicationLink: `${page}?utm_source=api` })).toBe(page);
});

it("falls back to applicationLink without the utm_source tracking parameter", () => {
  expect(getExternalJobUrl({ guid: "not-a-url", applicationLink: `${page}?utm_source=api` })).toBe(page);
});

it("returns null when there is no usable himalayas.app URL", () => {
  expect(getExternalJobUrl({ guid: "external-7" })).toBeNull();
  expect(getExternalJobUrl({ guid: "https://evil.example/jobs/1", applicationLink: "http://himalayas.app/jobs/1" })).toBeNull();
  expect(getExternalJobUrl({ guid: "https://himalayas.app.evil.example/jobs/1" })).toBeNull();
  expect(getExternalJobUrl({})).toBeNull();
});

it("keeps the ?posting= link for recruiter postings", () => {
  expect(getShareUrl({ id: "job-1" })).toBe(`${window.location.origin}/jobs?posting=job-1`);
});
