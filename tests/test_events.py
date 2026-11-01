import pytest
from datetime import datetime


def test_create_event(client, sample_event_data):
    """Test creating a new event."""
    response = client.post("/api/events/", json=sample_event_data)
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["message"] == "Event created successfully"


def test_create_event_missing_required_fields(client):
    """Test creating event with missing required fields."""
    incomplete_data = {
        "name": "Test Event"
    }
    response = client.post("/api/events/", json=incomplete_data)
    assert response.status_code == 422  # Validation error


def test_get_events(client, sample_event_data):
    """Test retrieving all events."""
    # Create an event first
    client.post("/api/events/", json=sample_event_data)
    
    response = client.get("/api/events/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert data[0]["name"] == sample_event_data["name"]


def test_get_event_by_id(client, sample_event_data):
    """Test retrieving a specific event."""
    # Create an event
    create_response = client.post("/api/events/", json=sample_event_data)
    event_id = create_response.json()["id"]
    
    # Get the event
    response = client.get(f"/api/events/{event_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == event_id
    assert data["name"] == sample_event_data["name"]
    assert "guests" in data
    assert "expenses" in data
    assert "tasks" in data


def test_get_nonexistent_event(client):
    """Test retrieving a non-existent event."""
    response = client.get("/api/events/99999")
    assert response.status_code == 404


def test_update_event(client, sample_event_data):
    """Test updating an event."""
    # Create an event
    create_response = client.post("/api/events/", json=sample_event_data)
    event_id = create_response.json()["id"]
    
    # Update the event
    update_data = {"name": "Updated Event Name", "guest_count": 75}
    response = client.put(f"/api/events/{event_id}", json=update_data)
    assert response.status_code == 200
    assert response.json()["message"] == "Event updated successfully"
    
    # Verify update
    get_response = client.get(f"/api/events/{event_id}")
    assert get_response.json()["name"] == "Updated Event Name"
    assert get_response.json()["guest_count"] == 75


def test_delete_event(client, sample_event_data):
    """Test deleting an event."""
    # Create an event
    create_response = client.post("/api/events/", json=sample_event_data)
    event_id = create_response.json()["id"]
    
    # Delete the event
    response = client.delete(f"/api/events/{event_id}")
    assert response.status_code == 200
    assert response.json()["message"] == "Event deleted successfully"
    
    # Verify deletion
    get_response = client.get(f"/api/events/{event_id}")
    assert get_response.status_code == 404


def test_generate_event_plan_deterministic(client, sample_event_data):
    """Test generating event plan (deterministic mode)."""
    # Create an event
    create_response = client.post("/api/events/", json=sample_event_data)
    event_id = create_response.json()["id"]
    
    # Generate plan (will use deterministic planner since no API key)
    response = client.post(f"/api/events/{event_id}/generate-plan")
    assert response.status_code == 200
    data = response.json()
    assert "plan" in data
    assert "source" in data
    assert data["source"] == "deterministic"
    
    # Verify plan structure
    plan = data["plan"]
    assert "event_concept" in plan
    assert "recommended_theme" in plan
    assert "budget_allocation" in plan
    assert "preparation_timeline" in plan


def test_dashboard_stats(client, sample_event_data):
    """Test dashboard statistics endpoint."""
    # Create an event
    client.post("/api/events/", json=sample_event_data)
    
    response = client.get("/api/events/dashboard/stats")
    assert response.status_code == 200
    data = response.json()
    assert "total_events" in data
    assert "upcoming_events" in data
    assert "total_budget" in data
    assert "pending_tasks" in data
    assert data["total_events"] >= 1
