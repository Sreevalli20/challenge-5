import pytest
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.core.database import Base, get_db
from app.main import app
from fastapi.testclient import TestClient
import asyncio

# Test database
TEST_DATABASE_URL = "sqlite+aiosqlite:///./test.db"

test_engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False}
)
TestSessionLocal = async_sessionmaker(
    test_engine,
    class_=AsyncSession,
    expire_on_commit=False
)


@pytest.fixture(scope="function")
async def db_session():
    """Create a test database session."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    async with TestSessionLocal() as session:
        yield session
    
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture(scope="function")
def client(db_session):
    """Create a test client with database override."""
    async def override_get_db():
        yield db_session
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    app.dependency_overrides.clear()


@pytest.fixture
def sample_event_data():
    """Sample event data for testing."""
    return {
        "name": "Test Birthday Party",
        "category": "birthday",
        "date": "2025-12-25",
        "time": "18:00",
        "location": "Test Venue, Test City",
        "guest_count": 50,
        "total_budget": 5000.0,
        "currency": "USD",
        "theme": "Tropical Paradise",
        "indoor_outdoor": "indoor",
        "food_preferences": "Buffet style",
        "dietary_restrictions": "Vegetarian options needed",
        "decoration_preferences": "Balloon arch",
        "entertainment_preferences": "DJ",
        "special_requirements": ""
    }
