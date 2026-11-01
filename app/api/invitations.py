from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.core.database import get_db
from app.models.event import Invitation
from app.services.ai_service import ai_service

router = APIRouter(prefix="/api/events/{event_id}/invitations", tags=["invitations"])


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_invitation(event_id: int, invitation_data: dict, db: AsyncSession = Depends(get_db)):
    """Create an invitation for an event."""
    new_invitation = Invitation(
        event_id=event_id,
        template=invitation_data["template"],
        content=invitation_data["content"],
        colors=invitation_data.get("colors"),
        custom_wording=invitation_data.get("custom_wording")
    )
    
    db.add(new_invitation)
    await db.commit()
    await db.refresh(new_invitation)
    
    return {"id": new_invitation.id, "message": "Invitation created successfully"}


@router.get("/")
async def get_invitations(event_id: int, db: AsyncSession = Depends(get_db)):
    """Get all invitations for an event."""
    result = await db.execute(
        select(Invitation).where(Invitation.event_id == event_id)
    )
    invitations = result.scalars().all()
    
    return [
        {
            "id": inv.id,
            "template": inv.template,
            "content": inv.content,
            "colors": inv.colors,
            "custom_wording": inv.custom_wording,
            "generated_at": inv.generated_at.isoformat() if inv.generated_at else None
        }
        for inv in invitations
    ]


@router.post("/generate")
async def generate_invitation_text(event_id: int, template: str = "formal", db: AsyncSession = Depends(get_db)):
    """Generate invitation text using AI."""
    from app.models.event import Event
    
    result = await db.execute(select(Event).where(Event.id == event_id))
    event = result.scalar_one_or_none()
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    try:
        event_data = {
            "name": event.name,
            "category": event.category,
            "date": event.date.isoformat(),
            "time": event.time,
            "location": event.location,
            "theme": event.theme
        }
        
        if ai_service.is_available():
            content = await ai_service.generate_invitation_text(event_data, template)
            source = "ai"
        else:
            # Fallback template
            content = f"""
You are warmly invited to {event.name}!

When: {event.date.strftime('%A, %B %d, %Y')} at {event.time}
Where: {event.location}

Please join us for this special {event.category.replace('_', ' ')} celebration.

RSVP by responding to this invitation.
            """.strip()
            source = "template"
        
        return {
            "content": content,
            "source": source,
            "message": "Invitation text generated successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{invitation_id}")
async def delete_invitation(event_id: int, invitation_id: int, db: AsyncSession = Depends(get_db)):
    """Delete an invitation."""
    result = await db.execute(
        select(Invitation).where(Invitation.id == invitation_id, Invitation.event_id == event_id)
    )
    invitation = result.scalar_one_or_none()
    
    if not invitation:
        raise HTTPException(status_code=404, detail="Invitation not found")
    
    await db.delete(invitation)
    await db.commit()
    
    return {"message": "Invitation deleted successfully"}
