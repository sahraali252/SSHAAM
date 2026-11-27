// One job id per job for applications, so every Apply entry point and the
// backend duplicate check (user_id + job_id) agree. Mirrors normalize_job_id()
// in backend/app/schemas.py:
// - recruiter postings: their posting id (UUID)
// - Himalayas jobs: their public job page URL without query string, fragment or
//   trailing slash (so applicationLink?utm_source=api equals guid)
const HIMALAYAS_JOB_URL = /^https?:\/\/([^/?#]*\.)?himalayas\.app([/?#]|$)/i;

export function normalizeJobId(jobId) {
  let value = String(jobId ?? "").trim();
  if (HIMALAYAS_JOB_URL.test(value)) {
    value = value.split(/[?#]/, 1)[0].replace(/\/+$/, "");
  }
  return value;
}

// Job objects on the job search page: recruiter postings are marked `direct`,
// external Himalayas jobs are identified by `guid`.
export function getApplicationJobId(job) {
  return normalizeJobId(job.direct ? job.id : job.guid);
}
