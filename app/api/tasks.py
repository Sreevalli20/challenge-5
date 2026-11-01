from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from datetime import datetime
from app.core.database import get_db
from app.models.event import Task

router = APIRouter(prefix="/api/events/{event_id}/tasks", tags=["tasks"])


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_task(event_id: int, task_data: dict, db: AsyncSession = Depends(get_db)):
    """Add a task to an event."""
    due_date = None
    if task_data.get("due_date"):
        due_date = datetime.fromisoformat(task_data["due_date"]) if isinstance(task_data["due_date"], str) else task_data["due_date"]
    
    new_task = Task(
        event_id=event_id,
        title=task_data["title"],
        description=task_data.get("description"),
        due_date=due_date,
        priority=task_data.get("priority", "medium"),
        completed=task_data.get("completed", False),
        ai_suggested=task_data.get("ai_suggested", False)
    )
    
    db.add(new_task)
    await db.commit()
    await db.refresh(new_task)
    
    return {"id": new_task.id, "message": "Task added successfully"}


@router.get("/")
async def get_tasks(event_id: int, db: AsyncSession = Depends(get_db)):
    """Get all tasks for an event."""
    result = await db.execute(
        select(Task).where(Task.event_id == event_id).order_by(Task.due_date, Task.priority)
    )
    tasks = result.scalars().all()
    
    return [
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
        for t in tasks
    ]


@router.put("/{task_id}")
async def update_task(event_id: int, task_id: int, task_data: dict, db: AsyncSession = Depends(get_db)):
    """Update a task."""
    result = await db.execute(
        select(Task).where(Task.id == task_id, Task.event_id == event_id)
    )
    task = result.scalar_one_or_none()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if "title" in task_data:
        task.title = task_data["title"]
    if "description" in task_data:
        task.description = task_data["description"]
    if "due_date" in task_data:
        task.due_date = datetime.fromisoformat(task_data["due_date"]) if isinstance(task_data["due_date"], str) else task_data["due_date"]
    if "priority" in task_data:
        task.priority = task_data["priority"]
    if "completed" in task_data:
        task.completed = task_data["completed"]
        if task_data["completed"]:
            task.completed_at = datetime.now()
    
    await db.commit()
    
    return {"message": "Task updated successfully"}


@router.delete("/{task_id}")
async def delete_task(event_id: int, task_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a task."""
    result = await db.execute(
        select(Task).where(Task.id == task_id, Task.event_id == event_id)
    )
    task = result.scalar_one_or_none()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    await db.delete(task)
    await db.commit()
    
    return {"message": "Task deleted successfully"}
