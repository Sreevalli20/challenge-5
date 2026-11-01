from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.core.database import get_db
from app.models.event import Guest

router = APIRouter(prefix="/api/events/{event_id}/guests", tags=["guests"])


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_guest(event_id: int, guest_data: dict, db: AsyncSession = Depends(get_db)):
    """Add a guest to an event."""
    new_guest = Guest(
        event_id=event_id,
        name=guest_data["name"],
        email=guest_data.get("email"),
        phone=guest_data.get("phone"),
        dietary_preferences=guest_data.get("dietary_preferences"),
        special_requirements=guest_data.get("special_requirements"),
        rsvp_status=guest_data.get("rsvp_status", "pending")
    )
    
    db.add(new_guest)
    await db.commit()
    await db.refresh(new_guest)
    
    return {"id": new_guest.id, "message": "Guest added successfully"}


@router.get("/")
async def get_guests(event_id: int, db: AsyncSession = Depends(get_db)):
    """Get all guests for an event."""
    result = await db.execute(
        select(Guest).where(Guest.event_id == event_id).order_by(Guest.name)
    )
    guests = result.scalars().all()
    
    return [
        {
            "id": g.id,
            "name": g.name,
            "email": g.email,
            "phone": g.phone,
            "dietary_preferences": g.dietary_preferences,
            "special_requirements": g.special_requirements,
            "rsvp_status": g.rsvp_status,
            "invitation_sent": g.invitation_sent
        }
        for g in guests
    ]


@router.put("/{guest_id}")
async def update_guest(event_id: int, guest_id: int, guest_data: dict, db: AsyncSession = Depends(get_db)):
    """Update a guest."""
    result = await db.execute(
        select(Guest).where(Guest.id == guest_id, Guest.event_id == event_id)
    )
    guest = result.scalar_one_or_none()
    
    if not guest:
        raise HTTPException(status_code=404, detail="Guest not found")
    
    if "name" in guest_data:
        guest.name = guest_data["name"]
    if "email" in guest_data:
        guest.email = guest_data["email"]
    if "phone" in guest_data:
        guest.phone = guest_data["phone"]
    if "dietary_preferences" in guest_data:
        guest.dietary_preferences = guest_data["dietary_preferences"]
    if "special_requirements" in guest_data:
        guest.special_requirements = guest_data["special_requirements"]
    if "rsvp_status" in guest_data:
        guest.rsvp_status = guest_data["rsvp_status"]
    if "invitation_sent" in guest_data:
        guest.invitation_sent = guest_data["invitation_sent"]
    
    await db.commit()
    
    return {"message": "Guest updated successfully"}


@router.delete("/{guest_id}")
async def delete_guest(event_id: int, guest_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a guest."""
    result = await db.execute(
        select(Guest).where(Guest.id == guest_id, Guest.event_id == event_id)
    )
    guest = result.scalar_one_or_none()
    
    if not guest:
        raise HTTPException(status_code=404, detail="Guest not found")
    
    await db.delete(guest)
    await db.commit()
    
    return {"message": "Guest deleted successfully"}
