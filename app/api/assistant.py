from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.event import Event
from app.services.ai_service import ai_service

router = APIRouter(prefix="/api/events/{event_id}/assistant", tags=["assistant"])


@router.post("/chat")
async def chat_with_assistant(event_id: int, message_data: dict, db: AsyncSession = Depends(get_db)):
    """Chat with AI assistant about an event."""
    result = await db.execute(select(Event).where(Event.id == event_id))
    event = result.scalar_one_or_none()
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    question = message_data.get("question", "")
    if not question:
        raise HTTPException(status_code=400, detail="Question is required")
    
    try:
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
            "food_preferences": event.food_preferences,
            "dietary_restrictions": event.dietary_restrictions
        }
        
        if ai_service.is_available():
            answer = await ai_service.answer_event_question(event_data, question)
            source = "ai"
        else:
            # Fallback to basic responses
            answer = _get_fallback_response(question, event_data)
            source = "rule-based"
        
        return {
            "answer": answer,
            "source": source,
            "message": "Response generated successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def _get_fallback_response(question: str, event_data: dict) -> str:
    """Get rule-based fallback response when AI is not available."""
    question_lower = question.lower()
    
    if "budget" in question_lower and "reduce" in question_lower:
        return f"To reduce expenses for your {event_data['guest_count']} guests with a {event_data['currency']} {event_data['total_budget']} budget, consider: 1) Reducing guest count, 2) Choosing simpler food options, 3) Limiting decoration costs, 4) Combining entertainment categories. Would you like me to help you adjust specific areas?"
    
    elif "move" in question_lower and "date" in question_lower:
        return "I can help you change the event date. Please note that changing the date will affect your task deadlines and vendor availability. Please confirm the new date you'd like, and I'll update the event accordingly."
    
    elif "vegetarian" in question_lower or "food" in question_lower:
        return f"For {event_data['guest_count']} guests with a budget of {event_data['currency']} {event_data['total_budget']}, vegetarian options can be cost-effective. Consider: buffet-style service, seasonal vegetables, and local ingredients. Your current food preferences: {event_data.get('food_preferences', 'Not specified')}."
    
    elif "theme" in question_lower:
        return f"Your current theme preference is '{event_data.get('theme', 'Not specified')}'. For a {event_data['category']} event, consider themes that align with your vision and budget. Would you like specific theme suggestions?"
    
    else:
        return f"I understand you're asking about your {event_data['name']} event. For detailed assistance with specific questions about budget, guests, timeline, or logistics, please provide more details. Note: Advanced AI assistance requires GEMINI_API_KEY configuration."
