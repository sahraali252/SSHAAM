from fastapi import APIRouter, HTTPException
import httpx

router = APIRouter(prefix="/jobs", tags=["Jobs"])

HIMALAYAS_SEARCH_URL = "https://himalayas.app/jobs/api/search"


@router.get("/")
async def get_jobs(
    keyword: str = "",
    location: str = "",
    category: str = ""
):
    params = {
        "page": 1,
        "sort": "recent"
    }

    if keyword:
        params["q"] = keyword

    if location:
        params["country"] = location

    if category:
        if keyword:
            params["q"] = f"{keyword} {category}"
        else:
            params["q"] = category

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                HIMALAYAS_SEARCH_URL,
                params=params,
                timeout=10.0
            )

        response.raise_for_status()
        data = response.json()

        if location:
            location_lower = location.lower()

            filtered_jobs = []

            for job in data.get("jobs", []):
                restrictions = job.get("locationRestrictions") or []

                if any(
                    location_lower == country.lower()
                    for country in restrictions
                ):
                    filtered_jobs.append(job)

            data["jobs"] = filtered_jobs

        return data

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to retrieve jobs: {str(e)}"
        )