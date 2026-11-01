import pytest
from datetime import datetime, timedelta


def test_create_task(client, sample_event_data):
    """Test adding a task to an event."""
    # Create an event
    create_response = client.post("/api/events/", json=sample_event_data)
    event_id = create_response.json()["id"]
    
    # Add a task
    due_date = (datetime.now() + timedelta(days=7)).isoformat()
    task_data = {
        "title": "Book venue",
        "description": "Contact and book the venue",
        "due_date": due_date,
        "priority": "high"
    }
    response = client.post(f"/api/events/{event_id}/tasks", json=task_data)
    assert response.status_code == 201
    data = response.json()
    assert "id" in data


def test_get_tasks(client, sample_event_data):
    """Test retrieving tasks for an event."""
    # Create an event
    create_response = client.post("/api/events/", json=sample_event_data)
    event_id = create_response.json()["id"]
    
    # Add a task
    task_data = {"title": "Send invitations", "priority": "medium"}
    client.post(f"/api/events/{event_id}/tasks", json=task_data)
    
    # Get tasks
    response = client.get(f"/api/events/{event_id}/tasks")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1


def test_update_task(client, sample_event_data):
    """Test updating a task."""
    # Create event and task
    create_response = client.post("/api/events/", json=sample_event_data)
    event_id = create_response.json()["id"]
    
    task_data = {"title": "Order cake"}
    task_response = client.post(f"/api/events/{event_id}/tasks", json=task_data)
    task_id = task_response.json()["id"]
    
    # Update task
    update_data = {"completed": True}
    response = client.put(f"/api/events/{event_id}/tasks/{task_id}", json=update_data)
    assert response.status_code == 200
    
    # Verify update
    get_response = client.get(f"/api/events/{event_id}/tasks")
    tasks = get_response.json()
    assert tasks[0]["completed"] == True


def test_delete_task(client, sample_event_data):
    """Test deleting a task."""
    # Create event and task
    create_response = client.post("/api/events/", json=sample_event_data)
    event_id = create_response.json()["id"]
    
    task_data = {"title": "Arrange transportation"}
    task_response = client.post(f"/api/events/{event_id}/tasks", json=task_data)
    task_id = task_response.json()["id"]
    
    # Delete task
    response = client.delete(f"/api/events/{event_id}/tasks/{task_id}")
    assert response.status_code == 200
    
    # Verify deletion
    get_response = client.get(f"/api/events/{event_id}/tasks")
    tasks = get_response.json()
    assert len(tasks) == 0
