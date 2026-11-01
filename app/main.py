from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import engine, Base, get_db
from app.api import events, guests, venues, expenses, tasks, invitations, assistant
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events."""
    # Startup: Create database tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables created")
    yield
    # Shutdown: Close database connection
    await engine.dispose()
    logger.info("Database connection closed")


app = FastAPI(
    title="CELEBRATE — AI Event Planner",
    description="Intelligent event planning platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# Templates
templates = Jinja2Templates(directory="app/templates")

# Include API routers
app.include_router(events.router)
app.include_router(guests.router)
app.include_router(venues.router)
app.include_router(expenses.router)
app.include_router(tasks.router)
app.include_router(invitations.router)
app.include_router(assistant.router)


@app.get("/", response_class=HTMLResponse)
async def landing_page(request: Request):
    """Landing page."""
    return templates.TemplateResponse("landing.html", {"request": request})


@app.get("/dashboard", response_class=HTMLResponse)
async def dashboard(request: Request):
    """User dashboard."""
    return templates.TemplateResponse("dashboard.html", {"request": request})


@app.get("/events/new", response_class=HTMLResponse)
async def new_event(request: Request):
    """Create new event page."""
    return templates.TemplateResponse("event_form.html", {"request": request})


@app.get("/events/{event_id}", response_class=HTMLResponse)
async def event_detail(request: Request, event_id: int):
    """Event detail page."""
    return templates.TemplateResponse("event_detail.html", {"request": request, "event_id": event_id})


@app.get("/events/{event_id}/edit", response_class=HTMLResponse)
async def edit_event(request: Request, event_id: int):
    """Edit event page."""
    return templates.TemplateResponse("event_form.html", {"request": request, "event_id": event_id})


@app.get("/events/{event_id}/guests", response_class=HTMLResponse)
async def event_guests(request: Request, event_id: int):
    """Event guests page."""
    return templates.TemplateResponse("guests.html", {"request": request, "event_id": event_id})


@app.get("/events/{event_id}/budget", response_class=HTMLResponse)
async def event_budget(request: Request, event_id: int):
    """Event budget page."""
    return templates.TemplateResponse("budget.html", {"request": request, "event_id": event_id})


@app.get("/events/{event_id}/timeline", response_class=HTMLResponse)
async def event_timeline(request: Request, event_id: int):
    """Event timeline page."""
    return templates.TemplateResponse("timeline.html", {"request": request, "event_id": event_id})


@app.get("/events/{event_id}/invitations", response_class=HTMLResponse)
async def event_invitations(request: Request, event_id: int):
    """Event invitations page."""
    return templates.TemplateResponse("invitations.html", {"request": request, "event_id": event_id})


@app.get("/events/{event_id}/assistant", response_class=HTMLResponse)
async def event_assistant(request: Request, event_id: int):
    """AI assistant page."""
    return templates.TemplateResponse("assistant.html", {"request": request, "event_id": event_id})


@app.get("/events/{event_id}/report", response_class=HTMLResponse)
async def event_report(request: Request, event_id: int):
    """Event report page."""
    return templates.TemplateResponse("report.html", {"request": request, "event_id": event_id})


@app.get("/health")
async def health_check():
    """Health check endpoint for Render."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
