import pytest


def test_create_expense(client, sample_event_data):
    """Test adding an expense to an event."""
    # Create an event
    create_response = client.post("/api/events/", json=sample_event_data)
    event_id = create_response.json()["id"]
    
    # Add an expense
    expense_data = {
        "category": "venue",
        "description": "Venue rental",
        "estimated_cost": 2000.0,
        "actual_cost": 1800.0,
        "paid": False
    }
    response = client.post(f"/api/events/{event_id}/expenses", json=expense_data)
    assert response.status_code == 201
    data = response.json()
    assert "id" in data


def test_get_expenses(client, sample_event_data):
    """Test retrieving expenses for an event."""
    # Create an event
    create_response = client.post("/api/events/", json=sample_event_data)
    event_id = create_response.json()["id"]
    
    # Add an expense
    expense_data = {
        "category": "food",
        "description": "Catering",
        "estimated_cost": 1500.0
    }
    client.post(f"/api/events/{event_id}/expenses", json=expense_data)
    
    # Get expenses
    response = client.get(f"/api/events/{event_id}/expenses")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1


def test_update_expense(client, sample_event_data):
    """Test updating an expense."""
    # Create event and expense
    create_response = client.post("/api/events/", json=sample_event_data)
    event_id = create_response.json()["id"]
    
    expense_data = {
        "category": "decoration",
        "description": "Flowers",
        "estimated_cost": 500.0
    }
    expense_response = client.post(f"/api/events/{event_id}/expenses", json=expense_data)
    expense_id = expense_response.json()["id"]
    
    # Update expense
    update_data = {"actual_cost": 450.0, "paid": True}
    response = client.put(f"/api/events/{event_id}/expenses/{expense_id}", json=update_data)
    assert response.status_code == 200
    
    # Verify update
    get_response = client.get(f"/api/events/{event_id}/expenses")
    expenses = get_response.json()
    assert expenses[0]["actual_cost"] == 450.0
    assert expenses[0]["paid"] == True


def test_delete_expense(client, sample_event_data):
    """Test deleting an expense."""
    # Create event and expense
    create_response = client.post("/api/events/", json=sample_event_data)
    event_id = create_response.json()["id"]
    
    expense_data = {
        "category": "entertainment",
        "description": "DJ",
        "estimated_cost": 800.0
    }
    expense_response = client.post(f"/api/events/{event_id}/expenses", json=expense_data)
    expense_id = expense_response.json()["id"]
    
    # Delete expense
    response = client.delete(f"/api/events/{event_id}/expenses/{expense_id}")
    assert response.status_code == 200
    
    # Verify deletion
    get_response = client.get(f"/api/events/{event_id}/expenses")
    expenses = get_response.json()
    assert len(expenses) == 0
