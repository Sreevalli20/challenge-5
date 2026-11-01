from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.core.database import get_db
from app.models.event import Expense

router = APIRouter(prefix="/api/events/{event_id}/expenses", tags=["expenses"])


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_expense(event_id: int, expense_data: dict, db: AsyncSession = Depends(get_db)):
    """Add an expense to an event."""
    new_expense = Expense(
        event_id=event_id,
        category=expense_data["category"],
        description=expense_data["description"],
        estimated_cost=float(expense_data["estimated_cost"]),
        actual_cost=float(expense_data.get("actual_cost")) if expense_data.get("actual_cost") else None,
        paid=expense_data.get("paid", False)
    )
    
    db.add(new_expense)
    await db.commit()
    await db.refresh(new_expense)
    
    return {"id": new_expense.id, "message": "Expense added successfully"}


@router.get("/")
async def get_expenses(event_id: int, db: AsyncSession = Depends(get_db)):
    """Get all expenses for an event."""
    result = await db.execute(
        select(Expense).where(Expense.event_id == event_id).order_by(Expense.category)
    )
    expenses = result.scalars().all()
    
    return [
        {
            "id": e.id,
            "category": e.category,
            "description": e.description,
            "estimated_cost": e.estimated_cost,
            "actual_cost": e.actual_cost,
            "paid": e.paid,
            "created_at": e.created_at.isoformat() if e.created_at else None
        }
        for e in expenses
    ]


@router.put("/{expense_id}")
async def update_expense(event_id: int, expense_id: int, expense_data: dict, db: AsyncSession = Depends(get_db)):
    """Update an expense."""
    result = await db.execute(
        select(Expense).where(Expense.id == expense_id, Expense.event_id == event_id)
    )
    expense = result.scalar_one_or_none()
    
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    if "category" in expense_data:
        expense.category = expense_data["category"]
    if "description" in expense_data:
        expense.description = expense_data["description"]
    if "estimated_cost" in expense_data:
        expense.estimated_cost = float(expense_data["estimated_cost"])
    if "actual_cost" in expense_data:
        expense.actual_cost = float(expense_data["actual_cost"]) if expense_data["actual_cost"] else None
    if "paid" in expense_data:
        expense.paid = expense_data["paid"]
    
    await db.commit()
    
    return {"message": "Expense updated successfully"}


@router.delete("/{expense_id}")
async def delete_expense(event_id: int, expense_id: int, db: AsyncSession = Depends(get_db)):
    """Delete an expense."""
    result = await db.execute(
        select(Expense).where(Expense.id == expense_id, Expense.event_id == event_id)
    )
    expense = result.scalar_one_or_none()
    
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    await db.delete(expense)
    await db.commit()
    
    return {"message": "Expense deleted successfully"}
