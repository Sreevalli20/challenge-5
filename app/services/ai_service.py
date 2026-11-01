import json
import logging
from typing import Dict, Any, Optional
from google import generativeai as genai
from google.api_core.exceptions import GoogleAPIError, InvalidArgument
from app.core.config import settings

logger = logging.getLogger(__name__)

# Event planning schema for structured output
EVENT_PLAN_SCHEMA = {
    "type": "object",
    "properties": {
        "event_concept": {"type": "string"},
        "recommended_theme": {"type": "string"},
        "venue_requirements": {"type": "string"},
        "decoration_plan": {"type": "string"},
        "food_and_catering_plan": {"type": "string"},
        "entertainment_ideas": {"type": "string"},
        "guest_experience_suggestions": {"type": "string"},
        "budget_allocation": {
            "type": "object",
            "properties": {
                "venue_percentage": {"type": "number"},
                "food_percentage": {"type": "number"},
                "decoration_percentage": {"type": "number"},
                "entertainment_percentage": {"type": "number"},
                "miscellaneous_percentage": {"type": "number"}
            }
        },
        "preparation_timeline": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "phase": {"type": "string"},
                    "timeframe": {"type": "string"},
                    "tasks": {"type": "array", "items": {"type": "string"}}
                }
            }
        },
        "shopping_checklist": {
            "type": "array",
            "items": {"type": "string"}
        },
        "risk_considerations": {
            "type": "array",
            "items": {"type": "string"}
        },
        "personalized_recommendations": {
            "type": "array",
            "items": {"type": "string"}
        }
    },
    "required": [
        "event_concept",
        "recommended_theme",
        "venue_requirements",
        "decoration_plan",
        "food_and_catering_plan",
        "entertainment_ideas",
        "guest_experience_suggestions",
        "budget_allocation",
        "preparation_timeline",
        "shopping_checklist",
        "risk_considerations",
        "personalized_recommendations"
    ]
}


class AIService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model = None
        self._initialize_model()

    def _initialize_model(self):
        """Initialize the Gemini model if API key is available."""
        if self.api_key and self.api_key != "your_gemini_api_key_here":
            try:
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel('gemini-1.5-flash')
                logger.info("Gemini model initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize Gemini model: {e}")
                self.model = None
        else:
            logger.warning("Gemini API key not configured")
            self.model = None

    def is_available(self) -> bool:
        """Check if AI service is available."""
        return self.model is not None

    async def generate_event_plan(self, event_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate a comprehensive event plan using Gemini AI.
        
        Args:
            event_data: Dictionary containing event details
            
        Returns:
            Dictionary with structured event plan
            
        Raises:
            ValueError: If AI service is not available
            RuntimeError: If generation fails
        """
        if not self.is_available():
            raise ValueError("AI service is not available. Please configure GEMINI_API_KEY.")

        try:
            prompt = self._build_event_planning_prompt(event_data)
            
            response = await self._generate_with_retry(prompt)
            
            # Parse and validate response
            plan = self._parse_ai_response(response)
            
            if not self._validate_plan(plan):
                raise ValueError("Generated plan does not match required schema")
            
            return plan
            
        except GoogleAPIError as e:
            logger.error(f"Google API error: {e}")
            if "quota" in str(e).lower():
                raise RuntimeError("API quota exceeded. Please try again later.")
            raise RuntimeError(f"AI generation failed: {str(e)}")
        except InvalidArgument as e:
            logger.error(f"Invalid argument: {e}")
            raise RuntimeError(f"Invalid request to AI service: {str(e)}")
        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error: {e}")
            raise RuntimeError("Failed to parse AI response. Please try again.")
        except Exception as e:
            logger.error(f"Unexpected error in AI generation: {e}")
            raise RuntimeError(f"AI generation failed: {str(e)}")

    def _build_event_planning_prompt(self, event_data: Dict[str, Any]) -> str:
        """Build the prompt for event planning."""
        prompt = f"""
You are an expert event planner. Create a comprehensive event plan for the following details:

Event Name: {event_data.get('name')}
Category: {event_data.get('category')}
Date: {event_data.get('date')}
Time: {event_data.get('time')}
Location: {event_data.get('location')}
Guest Count: {event_data.get('guest_count')}
Total Budget: {event_data.get('currency')} {event_data.get('total_budget')}
Theme Preference: {event_data.get('theme', 'Not specified')}
Indoor/Outdoor: {event_data.get('indoor_outdoor', 'Not specified')}
Food Preferences: {event_data.get('food_preferences', 'Not specified')}
Dietary Restrictions: {event_data.get('dietary_restrictions', 'None')}
Decoration Preferences: {event_data.get('decoration_preferences', 'Not specified')}
Entertainment Preferences: {event_data.get('entertainment_preferences', 'Not specified')}
Special Requirements: {event_data.get('special_requirements', 'None')}

Generate a detailed event plan in JSON format following this exact schema:
{json.dumps(EVENT_PLAN_SCHEMA, indent=2)}

Ensure the plan is practical, realistic, and tailored to the specific event type and budget.
"""
        return prompt

    async def _generate_with_retry(self, prompt: str, max_retries: int = 2) -> str:
        """Generate content with retry logic."""
        for attempt in range(max_retries):
            try:
                response = self.model.generate_content(
                    prompt,
                    generation_config=genai.types.GenerationConfig(
                        temperature=0.7,
                        max_output_tokens=4096,
                    )
                )
                return response.text
            except Exception as e:
                if attempt == max_retries - 1:
                    raise
                logger.warning(f"Retry {attempt + 1}/{max_retries} after error: {e}")
                continue

    def _parse_ai_response(self, response: str) -> Dict[str, Any]:
        """Parse AI response and extract JSON."""
        # Try to extract JSON from response
        response = response.strip()
        
        # Remove markdown code blocks if present
        if response.startswith("```json"):
            response = response[7:]
        if response.startswith("```"):
            response = response[3:]
        if response.endswith("```"):
            response = response[:-3]
        
        response = response.strip()
        
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            # Try to find JSON in the response
            start = response.find("{")
            end = response.rfind("}") + 1
            if start != -1 and end > start:
                return json.loads(response[start:end])
            raise

    def _validate_plan(self, plan: Dict[str, Any]) -> bool:
        """Validate that the plan matches the required schema."""
        required_fields = EVENT_PLAN_SCHEMA["required"]
        for field in required_fields:
            if field not in plan:
                logger.error(f"Missing required field: {field}")
                return False
        return True

    async def generate_invitation_text(self, event_data: Dict[str, Any], template: str = "formal") -> str:
        """Generate invitation text for an event."""
        if not self.is_available():
            raise ValueError("AI service is not available. Please configure GEMINI_API_KEY.")

        try:
            prompt = f"""
Generate a {template} invitation text for the following event:

Event Name: {event_data.get('name')}
Category: {event_data.get('category')}
Date: {event_data.get('date')}
Time: {event_data.get('time')}
Location: {event_data.get('location')}
Theme: {event_data.get('theme', 'Not specified')}

Keep it warm, inviting, and appropriate for the event type.
"""
            response = await self._generate_with_retry(prompt)
            return response.strip()
        except Exception as e:
            logger.error(f"Failed to generate invitation text: {e}")
            raise RuntimeError(f"Failed to generate invitation: {str(e)}")

    async def answer_event_question(self, event_data: Dict[str, Any], question: str) -> str:
        """Answer a contextual question about an event."""
        if not self.is_available():
            raise ValueError("AI service is not available. Please configure GEMINI_API_KEY.")

        try:
            prompt = f"""
You are an event planning assistant for this event:

Event Name: {event_data.get('name')}
Category: {event_data.get('category')}
Date: {event_data.get('date')}
Time: {event_data.get('time')}
Location: {event_data.get('location')}
Guest Count: {event_data.get('guest_count')}
Total Budget: {event_data.get('currency')} {event_data.get('total_budget')}
Theme: {event_data.get('theme', 'Not specified')}
Food Preferences: {event_data.get('food_preferences', 'Not specified')}
Dietary Restrictions: {event_data.get('dietary_restrictions', 'None')}

User Question: {question}

Provide a helpful, practical answer based on the event context. If the question requires changing event data, explain what would change and why, but do not actually make changes.
"""
            response = await self._generate_with_retry(prompt)
            return response.strip()
        except Exception as e:
            logger.error(f"Failed to answer question: {e}")
            raise RuntimeError(f"Failed to get answer: {str(e)}")


# Singleton instance
ai_service = AIService()
