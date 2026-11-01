from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.core.database import get_db
from app.models.event import Venue

router = APIRouter(prefix="/api/events/{event_id}/venues", tags=["venues"])


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_venue(event_id: int, venue_data: dict, db: AsyncSession = Depends(get_db)):
    """Add a venue option for an event."""
    new_venue = Venue(
        event_id=event_id,
        name=venue_data["name"],
        location=venue_data["location"],
        capacity=venue_data.get("capacity"),
        price_range=venue_data.get("price_range"),
        indoor_outdoor=venue_data.get("indoor_outdoor"),
        accessibility=venue_data.get("accessibility", False),
        parking=venue_data.get("parking", False),
        notes=venue_data.get("notes"),
        selected=venue_data.get("selected", False)
    )
    
    db.add(new_venue)
    await db.commit()
    await db.refresh(new_venue)
    
    return {"id": new_venue.id, "message": "Venue added successfully"}


@router.get("/")
async def get_venues(event_id: int, db: AsyncSession = Depends(get_db)):
    """Get all venues for an event."""
    result = await db.execute(
        select(Venue).where(Venue.event_id == event_id)
    )
    venues = result.scalars().all()
    
    return [
        {
            "id": v.id,
            "name": v.name,
            "location": v.location,
            "capacity": v.capacity,
            "price_range": v.price_range,
            "indoor_outdoor": v.indoor_outdoor,
            "accessibility": v.accessibility,
            "parking": v.parking,
            "notes": v.notes,
            "selected": v.selected
        }
        for v in venues
    ]


@router.put("/{venue_id}")
async def update_venue(event_id: int, venue_id: int, venue_data: dict, db: AsyncSession = Depends(get_db)):
    """Update a venue."""
    result = await db.execute(
        select(Venue).where(Venue.id == venue_id, Venue.event_id == event_id)
    )
    venue = result.scalar_one_or_none()
    
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")
    
    if "name" in venue_data:
        venue.name = venue_data["name"]
    if "location" in venue_data:
        venue.location = venue_data["location"]
    if "capacity" in venue_data:
        venue.capacity = venue_data["capacity"]
    if "price_range" in venue_data:
        venue.price_range = venue_data["price_range"]
    if "indoor_outdoor" in venue_data:
        venue.indoor_outdoor = venue_data["indoor_outdoor"]
    if "accessibility" in venue_data:
        venue.accessibility = venue_data["accessibility"]
    if "parking" in venue_data:
        venue.parking = venue_data["parking"]
    if "notes" in venue_data:
        venue.notes = venue_data["notes"]
    if "selected" in venue_data:
        venue.selected = venue_data["selected"]
    
    await db.commit()
    
    return {"message": "Venue updated successfully"}


@router.delete("/{venue_id}")
async def delete_venue(event_id: int, venue_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a venue."""
    result = await db.execute(
        select(Venue).where(Venue.id == venue_id, Venue.event_id == event_id)
    )
    venue = result.scalar_one_or_none()
    
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")
    
    await db.delete(venue)
    await db.commit()
    
    return {"message": "Venue deleted successfully"}
