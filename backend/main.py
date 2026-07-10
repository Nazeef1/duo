from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.db import engine, Base
from backend.routes import courses, lessons, attempts, profile, leaderboard

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Duolingo Clone API",
    description="A full-featured backend API for the Duolingo clone application.",
    version="1.0.0"
)

# CORS Configuration
# Allow all origins for simplicity in local and deployment testing, or refine it if needed.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(courses.router)
app.include_router(lessons.router)
app.include_router(attempts.router)
app.include_router(profile.router)
app.include_router(leaderboard.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Duolingo Clone API. Refer to API routes for endpoints."}
