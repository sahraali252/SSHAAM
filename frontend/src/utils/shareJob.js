// Share links for recruiter postings (US-17). The job seeker jobs page opens
// /jobs?posting=<id> directly on that posting's details.
export function getShareUrl(posting) {
  return `${window.location.origin}/jobs?posting=${encodeURIComponent(posting.id)}`;
}

export function getEmailHref(posting, url) {
  const subject = `Job opportunity: ${posting.title} at ${posting.company_name}`;
  const body = [
    "I found this job on CareerConnect and thought you might be interested:",
    "",
    `Title: ${posting.title}`,
    `Company: ${posting.company_name}`,
    `Location: ${posting.location}`,
    "",
    url,
  ].join("\n");
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function getLinkedInHref(url) {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
}

// External Himalayas jobs are shared with their own public job page, e.g.
// https://himalayas.app/companies/<company>/jobs/<job>. `guid` holds that page;
// `applicationLink` is the same page plus a ?utm_source=api tracking parameter.
// Returns null when the job has no usable himalayas.app URL.
export function getExternalJobUrl(job) {
  for (const candidate of [job?.guid, job?.applicationLink]) {
    if (typeof candidate !== "string") continue;
    try {
      const url = new URL(candidate);
      const isHimalayas = url.hostname === "himalayas.app" || url.hostname.endsWith(".himalayas.app");
      if (url.protocol !== "https:" || !isHimalayas) continue;
      url.searchParams.delete("utm_source");
      return url.toString();
    } catch {
      // Not a valid URL; try the next field.
    }
  }
  return null;
}
