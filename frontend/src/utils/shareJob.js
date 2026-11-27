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
