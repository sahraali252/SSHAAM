from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth_router, resume_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # allows any frontend/domain to make requests
    allow_methods=["*"],   # allows GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],   # allows headers such as Content-Type
)

# Connect authentication routes to the FastAPI app
app.include_router(auth_router.router)
app.include_router(resume_router.router)

@app.get("/")
def root():
    return {"status": "ok"}