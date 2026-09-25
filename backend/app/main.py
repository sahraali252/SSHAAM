from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   #allows any website or frontend domain to make HTTP requests to this backend.
    allow_methods=["*"],   #permits all HTTP request types (GET, POST, PUT, DELETE, PATCH, OPTIONS, etc.).
    allow_headers=["*"],   #allows all HTTP headers (such as Content-Type or Authorization tokens) to be sent in incoming requests.
)


#execute the root() function whenever an HTTP GET request hits the root URL path (/).
@app.get("/")
def root():                     #[http://127.0.0.1:8000/](http://127.0.0.1:8000/).
    return {"status": "ok"}     #HTTP 200 OK status code.