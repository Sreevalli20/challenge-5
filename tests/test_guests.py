import pytest


def test_create_guest(client, sample_event_data):
    """Test adding a guest to an event."""
    # Create an event
    create_response = client.post("/api/events/", json=sample_event_data)
    event_id = create_response.json()["id"]
    
    # Add a guest
    guest_data = {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "555-1234",
        "dietary_preferences": "Vegetarian",
        "rsvp_status": "pending"
    }
    response = client.post(f"/api/events/{event_id}/guests", json=guest_data)
    assert response.status_code == 201
    data = response.json()
    assert "id" in data


def test_get_guests(client, sample_event_data):
    """Test retrieving guests for an event."""
    # Create an event
    create_response = client.post("/api/events/", json=sample_event_data)
    event_id = create_response.json()["id"]
    
    # Add a guest
    guest_data = {"name": "Jane Doe", "email": "jane@example.com"}
    client.post(f"/api/events/{event_id}/guests", json=guest_data)
    
    # Get guests
    response = client.get(f"/api/events/{event_id}/guests")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert data[0]["name"] == "Jane Doe"


def test_update_guest(client, sample_event_data):
    """Test updating a guest."""
    # Create event and guest
    create_response = client.post("/api/events/", json=sample_event_data)
    event_id = create_response.json()["id"]
    
    guest_data = {"name": "Bob Smith"}
    guest_response = client.post(f"/api/events/{event_id}/guests", json=guest_data)
    guest_id = guest_response.json()["id"]
    
    # Update guest
    update_data = {"rsvp_status": "confirmed"}
    response = client.put(f"/api/events/{event_id}/guests/{guest_id}", json=update_data)
    assert response.status_code == 200
    
    # Verify update
    get_response = client.get(f"/api/events/{event_id}/guests")
    guests = get_response.json()
    assert guests[0]["rsvp_status"] == "confirmed"


def test_delete_guest(client, sample_event_data):
    """Test deleting a guest."""
    # Create event and guest
    create_response = client.post("/api/events/", json=sample_event_data)
    event_id = create_response.json()["id"]
    
    guest_data = {"name": "Alice Johnson"}
    guest_response = client.post(f"/api/events/{event_id}/guests", json=guest_data)
    guest_id = guest_response.json()["id"]
    
    # Delete guest
    response = client.delete(f"/api/events/{event_id}/guests/{guest_id}")
    assert response.status_code == 200
    
    # Verify deletion
    get_response = client.get(f"/api/events/{event_id}/guests")
    guests = get_response.json()
    assert len(guests) == 0
