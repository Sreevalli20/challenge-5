import pytest
from app.services.ai_service import ai_service, AIService
from app.services.deterministic_planner import deterministic_planner, DeterministicPlanner


def test_deterministic_planner_generates_plan():
    """Test that deterministic planner generates a valid plan."""
    event_data = {
        "name": "Test Event",
        "category": "birthday",
        "date": "2025-12-25",
        "time": "18:00",
        "location": "Test Location",
        "guest_count": 50,
        "total_budget": 5000,
        "currency": "USD",
        "theme": "Test Theme"
    }
    
    plan = deterministic_planner.generate_event_plan(event_data)
    
    # Verify plan structure
    assert "event_concept" in plan
    assert "recommended_theme" in plan
    assert "venue_requirements" in plan
    assert "decoration_plan" in plan
    assert "food_and_catering_plan" in plan
    assert "entertainment_ideas" in plan
    assert "guest_experience_suggestions" in plan
    assert "budget_allocation" in plan
    assert "preparation_timeline" in plan
    assert "shopping_checklist" in plan
    assert "risk_considerations" in plan
    assert "personalized_recommendations" in plan
    
    # Verify budget allocation structure
    assert "venue_percentage" in plan["budget_allocation"]
    assert "food_percentage" in plan["budget_allocation"]
    assert "decoration_percentage" in plan["budget_allocation"]
    assert "entertainment_percentage" in plan["budget_allocation"]
    assert "miscellaneous_percentage" in plan["budget_allocation"]
    
    # Verify timeline is a list
    assert isinstance(plan["preparation_timeline"], list)
    if len(plan["preparation_timeline"]) > 0:
        assert "phase" in plan["preparation_timeline"][0]
        assert "timeframe" in plan["preparation_timeline"][0]
        assert "tasks" in plan["preparation_timeline"][0]


def test_deterministic_planner_different_categories():
    """Test that different event categories produce different plans."""
    categories = ["birthday", "wedding", "corporate", "college_festival"]
    
    for category in categories:
        event_data = {
            "name": f"Test {category}",
            "category": category,
            "date": "2025-12-25",
            "time": "18:00",
            "location": "Test Location",
            "guest_count": 50,
            "total_budget": 5000,
            "currency": "USD"
        }
        
        plan = deterministic_planner.generate_event_plan(event_data)
        assert plan is not None
        assert "event_concept" in plan


def test_ai_service_not_available_without_key():
    """Test that AI service reports not available without API key."""
    # Without setting GEMINI_API_KEY, service should not be available
    assert not ai_service.is_available()


def test_deterministic_planner_budget_allocation():
    """Test budget allocation percentages sum to 100."""
    event_data = {
        "name": "Test Event",
        "category": "birthday",
        "date": "2025-12-25",
        "guest_count": 50,
        "total_budget": 5000
    }
    
    plan = deterministic_planner.generate_event_plan(event_data)
    allocation = plan["budget_allocation"]
    
    total = sum(allocation.values())
    assert abs(total - 100) < 0.01  # Should sum to 100%
