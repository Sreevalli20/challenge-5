from typing import Dict, Any
from datetime import datetime, timedelta


class DeterministicPlanner:
    """Fallback planner when AI is not available."""
    
    def generate_event_plan(self, event_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate a basic event plan using deterministic logic."""
        category = event_data.get('category', 'custom')
        guest_count = event_data.get('guest_count', 50)
        budget = event_data.get('total_budget', 10000)
        
        # Base budget allocation percentages
        budget_allocation = self._get_budget_allocation(category)
        
        # Timeline based on event type
        timeline = self._get_timeline(category, event_data.get('date'))
        
        # Shopping checklist
        shopping_list = self._get_shopping_list(category)
        
        # Risk considerations
        risks = self._get_risk_considerations(category)
        
        # Recommendations
        recommendations = self._get_recommendations(category, guest_count, budget)
        
        return {
            "event_concept": f"A well-organized {category.replace('_', ' ')} celebration",
            "recommended_theme": self._get_theme_suggestion(category),
            "venue_requirements": f"Venue for {guest_count} guests with appropriate {event_data.get('indoor_outdoor', 'indoor')} space",
            "decoration_plan": self._get_decoration_plan(category),
            "food_and_catering_plan": f"Catering for {guest_count} guests considering {event_data.get('food_preferences', 'standard')} preferences",
            "entertainment_ideas": self._get_entertainment_ideas(category),
            "guest_experience_suggestions": "Ensure clear communication, comfortable seating, and engaging activities",
            "budget_allocation": budget_allocation,
            "preparation_timeline": timeline,
            "shopping_checklist": shopping_list,
            "risk_considerations": risks,
            "personalized_recommendations": recommendations
        }
    
    def _get_budget_allocation(self, category: str) -> Dict[str, float]:
        """Get budget allocation based on event category."""
        allocations = {
            "birthday": {
                "venue_percentage": 25,
                "food_percentage": 35,
                "decoration_percentage": 20,
                "entertainment_percentage": 15,
                "miscellaneous_percentage": 5
            },
            "wedding": {
                "venue_percentage": 30,
                "food_percentage": 35,
                "decoration_percentage": 20,
                "entertainment_percentage": 10,
                "miscellaneous_percentage": 5
            },
            "corporate": {
                "venue_percentage": 35,
                "food_percentage": 30,
                "decoration_percentage": 15,
                "entertainment_percentage": 15,
                "miscellaneous_percentage": 5
            },
            "college_festival": {
                "venue_percentage": 30,
                "food_percentage": 25,
                "decoration_percentage": 20,
                "entertainment_percentage": 20,
                "miscellaneous_percentage": 5
            }
        }
        return allocations.get(category, allocations["birthday"])
    
    def _get_timeline(self, category: str, event_date_str: str) -> list:
        """Get preparation timeline based on event type."""
        try:
            event_date = datetime.fromisoformat(event_date_str) if isinstance(event_date_str, str) else event_date_str
        except:
            event_date = datetime.now() + timedelta(days=30)
        
        time_until_event = (event_date - datetime.now()).days
        
        if time_until_event < 7:
            return [{
                "phase": "Immediate Preparation",
                "timeframe": "Next few days",
                "tasks": ["Finalize venue booking", "Confirm catering", "Send invitations", "Arrange decorations"]
            }]
        elif time_until_event < 30:
            return [
                {
                    "phase": "Week 1",
                    "timeframe": "First week",
                    "tasks": ["Book venue", "Contact caterers", "Plan decorations", "Create guest list"]
                },
                {
                    "phase": "Week 2-3",
                    "timeframe": "Second and third weeks",
                    "tasks": ["Send invitations", "Arrange entertainment", "Plan menu", "Order supplies"]
                },
                {
                    "phase": "Final Week",
                    "timeframe": "Last week",
                    "tasks": ["Confirm all vendors", "Finalize headcount", "Prepare decorations", "Arrange logistics"]
                }
            ]
        else:
            return [
                {
                    "phase": "Initial Planning",
                    "timeframe": "2 months before",
                    "tasks": ["Set budget", "Choose date and venue", "Create initial guest list", "Select theme"]
                },
                {
                    "phase": "Detailed Planning",
                    "timeframe": "1 month before",
                    "tasks": ["Book vendors", "Send save-the-dates", "Plan menu", "Design invitations"]
                },
                {
                    "phase": "Final Arrangements",
                    "timeframe": "2 weeks before",
                    "tasks": ["Send formal invitations", "Confirm RSVPs", "Finalize all details", "Arrange transportation"]
                },
                {
                    "phase": "Final Week",
                    "timeframe": "Last week",
                    "tasks": ["Confirm all vendors", "Prepare venue", "Set up decorations", "Final walkthrough"]
                }
            ]
    
    def _get_shopping_list(self, category: str) -> list:
        """Get shopping checklist based on event type."""
        base_items = [
            "Invitations and stationery",
            "Decorations (balloons, banners, tablecloths)",
            "Tableware and serving supplies",
            "Gifts or party favors",
            "Cleaning supplies"
        ]
        
        category_items = {
            "birthday": ["Birthday cake", "Candles", "Party hats", "Games and activities"],
            "wedding": ["Wedding rings", "Floral arrangements", "Guest book", "Ceremony items"],
            "corporate": ["Name tags", "Presentation materials", "Promotional items", "Signage"],
            "college_festival": ["Stage equipment", "Sound system", "Lighting", "Performance props"]
        }
        
        return base_items + category_items.get(category, [])
    
    def _get_risk_considerations(self, category: str) -> list:
        """Get risk considerations based on event type."""
        base_risks = [
            "Weather contingency for outdoor events",
            "Vendor no-show or delay",
            "Last-minute guest count changes",
            "Budget overruns"
        ]
        
        category_risks = {
            "wedding": ["Vendor coordination complexity", "Large guest management", "Timeline adherence"],
            "corporate": ["Technical equipment failure", "Professional appearance", "Time management"],
            "college_festival": ["Crowd control", "Equipment safety", "Permit compliance"]
        }
        
        return base_risks + category_risks.get(category, [])
    
    def _get_recommendations(self, category: str, guest_count: int, budget: float) -> list:
        """Get personalized recommendations."""
        recommendations = [
            f"For {guest_count} guests, consider having multiple serving stations",
            "Create a backup plan for key vendors",
            "Designate a point person for day-of coordination"
        ]
        
        cost_per_guest = budget / guest_count if guest_count > 0 else 0
        
        if cost_per_guest < 50:
            recommendations.append("Consider potluck or BYOB to manage budget constraints")
        elif cost_per_guest > 200:
            recommendations.append("With this budget, consider premium vendors and enhanced experiences")
        
        category_recs = {
            "birthday": ["Plan age-appropriate activities", "Consider dietary restrictions of close friends"],
            "wedding": ["Hire a day-of coordinator", "Create a wedding website for information"],
            "corporate": ["Prepare networking opportunities", "Ensure professional branding throughout"]
        }
        
        return recommendations + category_recs.get(category, [])
    
    def _get_theme_suggestion(self, category: str) -> str:
        """Get theme suggestion based on category."""
        themes = {
            "birthday": "Celebratory and personalized to the honoree's interests",
            "wedding": "Elegant and reflective of the couple's style",
            "corporate": "Professional and aligned with company branding",
            "college_festival": "Energetic and engaging for students",
            "anniversary": "Romantic and nostalgic",
            "graduation": "Achievement-focused and forward-looking"
        }
        return themes.get(category, "Tailored to the occasion and preferences")
    
    def _get_decoration_plan(self, category: str) -> str:
        """Get decoration plan based on category."""
        plans = {
            "birthday": "Colorful decorations with balloons, streamers, and a focal point for cake cutting",
            "wedding": "Elegant floral arrangements, coordinated table settings, and atmospheric lighting",
            "corporate": "Professional branding elements, clean lines, and tasteful accent pieces",
            "college_festival": "Vibrant, thematic decorations with stage and activity area setup"
        }
        return plans.get(category, "Appropriate decorations matching the event theme")
    
    def _get_entertainment_ideas(self, category: str) -> str:
        """Get entertainment ideas based on category."""
        ideas = {
            "birthday": "Music playlist, games, and activities suited to the age group",
            "wedding": "Live band or DJ, photo booth, and possibly a special performance",
            "corporate": "Guest speaker, networking activities, or team-building exercises",
            "college_festival": "Live performances, competitions, and interactive activities"
        }
        return ideas.get(category, "Entertainment appropriate for the event type and audience")


# Singleton instance
deterministic_planner = DeterministicPlanner()
