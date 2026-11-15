// SQLite responses omit the timezone; backend dates are stored in UTC.
export function parseApiDate(value) {
  if (!value) return null;
  const date = new Date(/[zZ]$|[+-]\d\d:\d\d$/.test(value) ? value : `${value}Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function deadlineInputValue(value) {
  const date = parseApiDate(value);
  if (!date) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}
