from sqlalchemy import Column, Integer, String, DateTime, Text, Float, Boolean, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class EventCategory(str, enum.Enum):
    BIRTHDAY = "birthday"
    WEDDING = "wedding"
    COLLEGE_FESTIVAL = "college_festival"
    CORPORATE = "corporate"
    ANNIVERSARY = "anniversary"
    BABY_SHOWER = "baby_shower"
    GRADUATION = "graduation"
    FAMILY_GATHERING = "family_gathering"
    COMMUNITY = "community"
    CUSTOM = "custom"


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    category = Column(String(50), nullable=False)
    date = Column(DateTime, nullable=False)
    time = Column(String(10), nullable=False)
    location = Column(String(300), nullable=False)
    guest_count = Column(Integer, nullable=False)
    total_budget = Column(Float, nullable=False)
    currency = Column(String(3), default="USD")
    theme = Column(String(100))
    indoor_outdoor = Column(String(20))
    food_preferences = Column(Text)
    dietary_restrictions = Column(Text)
    decoration_preferences = Column(Text)
    entertainment_preferences = Column(Text)
    special_requirements = Column(Text)
    
    # AI-generated plan
    ai_plan = Column(Text)
    plan_generated_at = Column(DateTime)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    guests = relationship("Guest", back_populates="event", cascade="all, delete-orphan")
    venues = relationship("Venue", back_populates="event", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="event", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="event", cascade="all, delete-orphan")
    invitations = relationship("Invitation", back_populates="event", cascade="all, delete-orphan")


class Guest(Base):
    __tablename__ = "guests"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    name = Column(String(100), nullable=False)
    email = Column(String(200))
    phone = Column(String(20))
    dietary_preferences = Column(String(200))
    special_requirements = Column(Text)
    rsvp_status = Column(String(20), default="pending")  # pending, confirmed, declined
    invitation_sent = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())

    event = relationship("Event", back_populates="guests")


class Venue(Base):
    __tablename__ = "venues"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    name = Column(String(200), nullable=False)
    location = Column(String(300), nullable=False)
    capacity = Column(Integer)
    price_range = Column(String(50))
    indoor_outdoor = Column(String(20))
    accessibility = Column(Boolean, default=False)
    parking = Column(Boolean, default=False)
    notes = Column(Text)
    selected = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())

    event = relationship("Event", back_populates="venues")


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    category = Column(String(50), nullable=False)
    description = Column(String(200), nullable=False)
    estimated_cost = Column(Float, nullable=False)
    actual_cost = Column(Float)
    paid = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    event = relationship("Event", back_populates="expenses")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    due_date = Column(DateTime)
    priority = Column(String(20), default="medium")  # low, medium, high
    completed = Column(Boolean, default=False)
    ai_suggested = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    completed_at = Column(DateTime)

    event = relationship("Event", back_populates="tasks")


class Invitation(Base):
    __tablename__ = "invitations"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    template = Column(String(50), nullable=False)
    content = Column(Text, nullable=False)
    colors = Column(String(100))
    custom_wording = Column(Text)
    generated_at = Column(DateTime, server_default=func.now())

    event = relationship("Event", back_populates="invitations")
