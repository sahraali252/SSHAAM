import { parseApiDate } from "./dates";

export function summarizeApplications(applications) {
  const statuses = { Applied: 0, "Under Review": 0, Interview: 0, Offered: 0, Rejected: 0 };
  const months = new Map();

  for (const application of applications) {
    if (Object.hasOwn(statuses, application.status)) statuses[application.status] += 1;
    const date = parseApiDate(application.applied_at);
    if (date) {
      const month = date.toISOString().slice(0, 7);
      months.set(month, (months.get(month) || 0) + 1);
    }
  }

  // Include inactive months between the first and latest submissions.
  const activity = [];
  const keys = [...months.keys()].sort();
  if (keys.length) {
    const cursor = new Date(`${keys[0]}-01T00:00:00Z`);
    const last = keys.at(-1);
    while (cursor.toISOString().slice(0, 7) <= last) {
      const month = cursor.toISOString().slice(0, 7);
      activity.push({ month, count: months.get(month) || 0 });
      cursor.setUTCMonth(cursor.getUTCMonth() + 1);
    }
  }

  return { total: applications.length, statuses, activity };
}
