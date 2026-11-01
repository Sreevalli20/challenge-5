from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload
from typing import List, Optional
from datetime import datetime
from decimal import Decimal
from app.core.database import get_db
from app.models.event import Event, Guest, Venue, Expense, Task, Invitation, EventCategory
from app.services.ai_service import ai_service
from app.services.deterministic_planner import deterministic_planner
import json

router = APIRouter(prefix="/api/events", tags=["events"])


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_event(event_data: dict, db: AsyncSession = Depends(get_db)):
    """Create a new event."""
    try:
        # Parse date from string
        event_date = datetime.fromisoformat(event_data["date"]) if isinstance(event_data["date"], str) else event_data["date"]
        
        new_event = Event(
            name=event_data["name"],
            category=event_data["category"],
            date=event_date,
            time=event_data["time"],
            location=event_data["location"],
            guest_count=event_data["guest_count"],
            total_budget=float(event_data["total_budget"]),
            currency=event_data.get("currency", "USD"),
            theme=event_data.get("theme"),
            indoor_outdoor=event_data.get("indoor_outdoor"),
            food_preferences=event_data.get("food_preferences"),
            dietary_restrictions=event_data.get("dietary_restrictions"),
            decoration_preferences=event_data.get("decoration_preferences"),
            entertainment_preferences=event_data.get("entertainment_preferences"),
            special_requirements=event_data.get("special_requirements")
        )
        
        db.add(new_event)
        await db.commit()
        await db.refresh(new_event)
        
        return {"id": new_event.id, "message": "Event created successfully"}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=List[dict])
async def get_events(db: AsyncSession = Depends(get_db)):
    """Get all events."""
    result = await db.execute(select(Event).order_by(Event.date.desc()))
    events = result.scalars().all()
    
    return [
        {
            "id": event.id,
            "name": event.name,
            "category": event.category,
            "date": event.date.isoformat(),
            "time": event.time,
            "location": event.location,
            "guest_count": event.guest_count,
            "total_budget": event.total_budget,
            "currency": event.currency,
            "theme": event.theme,
            "created_at": event.created_at.isoformat() if event.created_at else None
        }
        for event in events
    ]


@router.get("/{event_id}")
async def get_event(event_id: int, db: AsyncSession = Depends(get_db)):
    """Get a specific event with all related data."""
    result = await db.execute(
        select(Event)
        .options(
            selectinload(Event.guests),
            selectinload(Event.venues),
            selectinload(Event.expenses),
            selectinload(Event.tasks),
            selectinload(Event.invitations)
        )
        .where(Event.id == event_id)
    )
    event = result.scalar_one_or_none()
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Calculate budget statistics
    total_estimated = sum(e.estimated_cost for e in event.expenses)
    total_actual = sum(e.actual_cost or 0 for e in event.expenses)
    remaining_budget = event.total_budget - total_actual
    
    # Guest statistics
    guest_stats = {
        "total": len(event.guests),
        "confirmed": sum(1 for g in event.guests if g.rsvp_status == "confirmed"),
        "declined": sum(1 for g in event.guests if g.rsvp_status == "declined"),
        "pending": sum(1 for g in event.guests if g.rsvp_status == "pending")
    }
    
    # Task statistics
    task_stats = {
        "total": len(event.tasks),
        "completed": sum(1 for t in event.tasks if t.completed),
        "pending": sum(1 for t in event.tasks if not t.completed),
        "overdue": sum(1 for t in event.tasks if not t.completed and t.due_date and t.due_date < datetime.now())
    }
    
    return {
        "id": event.id,
        "name": event.name,
        "category": event.category,
        "date": event.date.isoformat(),
        "time": event.time,
        "location": event.location,
        "guest_count": event.guest_count,
        "total_budget": event.total_budget,
        "currency": event.currency,
        "theme": event.theme,
        "indoor_outdoor": event.indoor_outdoor,
        "food_preferences": event.food_preferences,
        "dietary_restrictions": event.dietary_restrictions,
        "decoration_preferences": event.decoration_preferences,
        "entertainment_preferences": event.entertainment_preferences,
        "special_requirements": event.special_requirements,
        "ai_plan": json.loads(event.ai_plan) if event.ai_plan else None,
        "plan_generated_at": event.plan_generated_at.isoformat() if event.plan_generated_at else None,
        "created_at": event.created_at.isoformat() if event.created_at else None,
        "updated_at": event.updated_at.isoformat() if event.updated_at else None,
        "guests": [
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
            for g in event.guests
        ],
        "venues": [
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
            for v in event.venues
        ],
        "expenses": [
            {
                "id": e.id,
                "category": e.category,
                "description": e.description,
                "estimated_cost": e.estimated_cost,
                "actual_cost": e.actual_cost,
                "paid": e.paid,
                "created_at": e.created_at.isoformat() if e.created_at else None
            }
            for e in event.expenses
        ],
        "tasks": [
            {
                "id": t.id,
                "title": t.title,
                "description": t.description,
                "due_date": t.due_date.isoformat() if t.due_date else None,
                "priority": t.priority,
                "completed": t.completed,
                "ai_suggested": t.ai_suggested,
                "created_at": t.created_at.isoformat() if t.created_at else None
            }
            for t in event.tasks
        ],
        "invitations": [
            {
                "id": inv.id,
                "template": inv.template,
                "content": inv.content,
                "colors": inv.colors,
                "custom_wording": inv.custom_wording,
                "generated_at": inv.generated_at.isoformat() if inv.generated_at else None
            }
            for inv in event.invitations
        ],
        "budget_stats": {
            "total_estimated": total_estimated,
            "total_actual": total_actual,
            "remaining": remaining_budget,
            "utilization_percent": (total_actual / event.total_budget * 100) if event.total_budget > 0 else 0,
            "cost_per_guest": (total_actual / event.guest_count) if event.guest_count > 0 else 0
        },
        "guest_stats": guest_stats,
        "task_stats": task_stats
    }


@router.put("/{event_id}")
async def update_event(event_id: int, event_data: dict, db: AsyncSession = Depends(get_db)):
    """Update an event."""
    result = await db.execute(select(Event).where(Event.id == event_id))
    event = result.scalar_one_or_none()
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    try:
        # Update fields
        if "name" in event_data:
            event.name = event_data["name"]
        if "category" in event_data:
            event.category = event_data["category"]
        if "date" in event_data:
            event.date = datetime.fromisoformat(event_data["date"]) if isinstance(event_data["date"], str) else event_data["date"]
        if "time" in event_data:
            event.time = event_data["time"]
        if "location" in event_data:
            event.location = event_data["location"]
        if "guest_count" in event_data:
            event.guest_count = event_data["guest_count"]
        if "total_budget" in event_data:
            event.total_budget = float(event_data["total_budget"])
        if "currency" in event_data:
            event.currency = event_data["currency"]
        if "theme" in event_data:
            event.theme = event_data["theme"]
        if "indoor_outdoor" in event_data:
            event.indoor_outdoor = event_data["indoor_outdoor"]
        if "food_preferences" in event_data:
            event.food_preferences = event_data["food_preferences"]
        if "dietary_restrictions" in event_data:
            event.dietary_restrictions = event_data["dietary_restrictions"]
        if "decoration_preferences" in event_data:
            event.decoration_preferences = event_data["decoration_preferences"]
        if "entertainment_preferences" in event_data:
            event.entertainment_preferences = event_data["entertainment_preferences"]
        if "special_requirements" in event_data:
            event.special_requirements = event_data["special_requirements"]
        
        await db.commit()
        await db.refresh(event)
        
        return {"message": "Event updated successfully"}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{event_id}")
async def delete_event(event_id: int, db: AsyncSession = Depends(get_db)):
    """Delete an event."""
    result = await db.execute(select(Event).where(Event.id == event_id))
    event = result.scalar_one_or_none()
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    await db.delete(event)
    await db.commit()
    
    return {"message": "Event deleted successfully"}


@router.post("/{event_id}/generate-plan")
async def generate_event_plan(event_id: int, db: AsyncSession = Depends(get_db)):
    """Generate AI event plan for an event."""
    result = await db.execute(select(Event).where(Event.id == event_id))
    event = result.scalar_one_or_none()
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    try:
        # Prepare event data for AI
        event_data = {
            "name": event.name,
            "category": event.category,
            "date": event.date.isoformat(),
            "time": event.time,
            "location": event.location,
            "guest_count": event.guest_count,
            "total_budget": event.total_budget,
            "currency": event.currency,
            "theme": event.theme,
            "indoor_outdoor": event.indoor_outdoor,
            "food_preferences": event.food_preferences,
            "dietary_restrictions": event.dietary_restrictions,
            "decoration_preferences": event.decoration_preferences,
            "entertainment_preferences": event.entertainment_preferences,
            "special_requirements": event.special_requirements
        }
        
        # Try AI service first
        if ai_service.is_available():
            plan = await ai_service.generate_event_plan(event_data)
            plan_source = "ai"
        else:
            # Fallback to deterministic planner
            plan = deterministic_planner.generate_event_plan(event_data)
            plan_source = "deterministic"
        
        # Save plan to event
        event.ai_plan = json.dumps(plan)
        event.plan_generated_at = datetime.now()
        
        await db.commit()
        
        return {
            "plan": plan,
            "source": plan_source,
            "message": "Event plan generated successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/dashboard/stats")
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)):
    """Get dashboard statistics."""
    # Total events
    total_events = await db.execute(select(func.count(Event.id)))
    total = total_events.scalar()
    
    # Upcoming events
    upcoming_result = await db.execute(
        select(Event).where(Event.date >= datetime.now()).order_by(Event.date)
    )
    upcoming = upcoming_result.scalars().all()
    
    # Completed events
    completed_result = await db.execute(
        select(Event).where(Event.date < datetime.now()).order_by(Event.date.desc())
    )
    completed = completed_result.scalars().all()
    
    # Total budget across all events
    total_budget_result = await db.execute(select(func.sum(Event.total_budget)))
    total_budget = total_budget_result.scalar() or 0
    
    # Calculate total actual expenses
    expense_result = await db.execute(select(func.sum(Expense.actual_cost)))
    total_expenses = expense_result.scalar() or 0
    
    # Pending tasks
    pending_tasks_result = await db.execute(
        select(func.count(Task.id)).where(and_(Task.completed == False, Task.due_date >= datetime.now()))
    )
    pending_tasks = pending_tasks_result.scalar() or 0
    
    # Overdue tasks
    overdue_tasks_result = await db.execute(
        select(func.count(Task.id)).where(and_(Task.completed == False, Task.due_date < datetime.now()))
    )
    overdue_tasks = overdue_tasks_result.scalar() or 0
    
    return {
        "total_events": total,
        "upcoming_events": len(upcoming),
        "completed_events": len(completed),
        "total_budget": total_budget,
        "total_expenses": total_expenses,
        "remaining_budget": total_budget - total_expenses,
        "pending_tasks": pending_tasks,
        "overdue_tasks": overdue_tasks,
        "upcoming_events_list": [
            {
                "id": e.id,
                "name": e.name,
                "date": e.date.isoformat(),
                "category": e.category
            }
            for e in upcoming[:5]
        ]
    }
