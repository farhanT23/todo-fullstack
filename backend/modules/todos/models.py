from sqlalchemy import Column, Integer, String, Text, Boolean, Enum, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from utils.database import Base
import enum


class PriorityEnum(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"


class Todo(Base):
    __tablename__ = "todos"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    is_completed = Column(Boolean, default=False)
    priority = Column(Enum(PriorityEnum), default=PriorityEnum.medium)
    created_at = Column(DateTime, default=datetime.now())

    # Foreign key relationship to user
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # Relationship (backref to access `user.todos`)
    user = relationship("User", back_populates="todos")
